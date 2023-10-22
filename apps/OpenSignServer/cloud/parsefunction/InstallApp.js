/* --Description :cloud function called to copy app from default db */

//-- Export Modules
import mongoose from 'mongoose';
import { _SCHEMASchema } from '../models/schemaClass.js';
import { _RoleSchema } from '../models/RoleClass.js';
import { _RolejoinSchema } from '../models/RoleJoin.js';
import { _UserjoinSchema } from '../models/UserJoin.js';
import { w_appinfoSchema } from '../models/appInfoclass.js';
import { w_formV3Schema } from '../models/w_formv3class.js';
import { w_menuSchema } from '../models/w_menuclass.js';
import { w_reportSchema } from '../models/w_reportclass.js';
import { DashboardSchema } from '../models/w_dashboardclass.js';
import { DBFunctionSchema } from '../models/DBFunctionClass.js';
import { orgAppsSchema } from '../models/orgApps.js';
import axios from 'axios';

export async function InstallApp(request) {
  try {
    // console.log("sess ", request)
    //--function to get the userid from session token
    const sess = request.headers['sessiontoken'];
    const serverUrl = process.env.SERVER_URL;
    const appId = process.env.APP_ID;
    const user = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': sess,
      },
    });

    if (user.data && user.data.objectId) {
      var originalappname = request.params.appname;
      var appname = originalappname + '_';
      //externalInstallation should be true for migrate from server2 to server3 data
      //externalInstallation should be false for migrate from default db to client db data
      const externalInstallation = request.params.externalSrc;
      // var chkbaseurl = request.params.baseurl;
      // console.log('baseurl ' + chkbaseurl);
      var organization = request.params.organization;
      // var dbName = request.params.dbName;
      var UserId = request.params.UserId;
      //--check if value of connection string is blank or variable
      if (organization == '') {
        return Promise.reject('Error:please provide organization');
      }
      if (originalappname == '') {
        return Promise.reject('Error:please provide appname');
      }
      const options = { useNewUrlParser: true };

      const baseDb = process.env.MONGODB_URI;
      // get client db from baseDb
      const getDbUrl = async orgName => {
        try {
          const db = await mongoose.createConnection(baseDb, options).asPromise();
          const orgAppsModel = db.model('orgApps', orgAppsSchema);
          const res = await orgAppsModel.findOne({ appName: orgName });
          console.log('dburl ', res.parseServer.databaseURI);
          return res.parseServer.databaseURI;
        } catch (err) {
          console.log('result not found in getroleanduser  ', err);
          return 'result not found!';
        }
      };
      const dbUrl = await getDbUrl(organization);
      // targetConString = client db
      // var targetConString = `mongodb+srv://doadmin:k0Nn4Q8L96vq715s@qik-server-prod-db-5054d37b.mongo.ondigitalocean.com/${dbName}?authSource=admin&replicaSet=qik-server-prod-db&tls=true`;
      const targetConString = dbUrl;
      // sourceConString = default db
      var sourceConString;
      if (externalInstallation) {
        sourceConString =
          'mongodb+srv://doadmin:k0Nn4Q8L96vq715s@qik-server-prod-db-5054d37b.mongo.ondigitalocean.com/heroku_vcjcwn64?authSource=admin&replicaSet=qik-server-prod-db&tls=true';
      } else {
        sourceConString =
          'mongodb+srv://doadmin:k0Nn4Q8L96vq715s@qik-server-prod-db-5054d37b.mongo.ondigitalocean.com/defaultDJIC?authSource=admin&replicaSet=qik-server-prod-db&tls=true';
      }

      if (targetConString == sourceConString) {
        return Promise.reject("Error:Soure and target database server can't be same");
      }

      const randomId = function (length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
      };
      const appRoleId = randomId(10);

      try {
        let Trg_SCHEMASmodel;
        let Src_SCHEMASmodel;
        let appId;
        let defaultRoles;
        let Trg__RoleModel;
        let msg;
        let status;
        let trg_w_appinfomodel;
        try {
          const db = await mongoose.createConnection(targetConString, options).asPromise();
          trg_w_appinfomodel = db.model('w_appinfo', w_appinfoSchema);
          const res = await trg_w_appinfomodel.find({
            appname: originalappname,
          });
          if (res.length > 0) {
            msg = 'App is already exists';
            status = 137;
          } else {
            await getAppInfo();
          }
        } catch (err) {
          console.log('err is checking app exists', err);
          return Promise.reject('err is checking app exists');
        }
        // try {
        //   const db = await mongoose.createConnection(targetConString, options).asPromise();
        //   Trg_SCHEMASmodel = db.model('_SCHEMA', _SCHEMASchema);
        //   const res = await Trg_SCHEMASmodel.find({ _id: { $regex: '.*' + appname + '.*' } });
        //   if (res.length > 0) {
        //     msg = 'App is already exists';
        //     status = 137;
        //   } else {
        //     await getAppInfo();
        //   }
        // } catch (err) {
        //   console.log('err is checking app exists', err);
        //   return Promise.reject('err is checking app exists');
        // }

        async function getAppInfo() {
          console.log('getAppInfo ');
          try {
            const db = await mongoose.createConnection(sourceConString, options).asPromise();
            const w_appinfomodel = db.model('w_appinfo', w_appinfoSchema);
            const res = await w_appinfomodel.find({
              appname: originalappname,
            });
            // console.log('getAppInfo ', res);
            appId = res[0]['_id'];
            const parseRes = JSON.parse(JSON.stringify(res));
            if (parseRes[0].settings && parseRes[0].settings.length > 0) {
              defaultRoles = parseRes[0].settings.map(x => {
                return {
                  _id: randomId(10),
                  name: x.role,
                  _wperm: ['*'],
                  _rperm: ['*'],
                  _acl: { '*': { r: true, w: true } },
                  _created_at: new Date(),
                  _updated_at: new Date(),
                };
              });
              // console.log('defaultRoles ', defaultRoles);
            }

            // console.log(appId);
            await saveAppInfo(res);
          } catch (err) {
            console.log('err in getAppData', err);
          }
        }

        async function saveAppInfo(res) {
          console.log('saveAppInfo');
          try {
            const db = await mongoose.createConnection(targetConString, options).asPromise();
            // trg_w_appinfomodel = db.model('w_appinfo', w_appinfoSchema);
            const appInfoRes = await trg_w_appinfomodel.collection.insertMany(res);
            // console.log('saveAppInfo ', appInfoRes);

            console.log('app info inserted');
            await getAppFunctions();
          } catch (err) {
            console.log('err in saveAppData', err);
          }
        }

        async function getAppFunctions() {
          console.log('getAppFunctions');
          try {
            var appIdpointer = 'w_appinfo$' + appId;
            const db = await mongoose.createConnection(sourceConString, options).asPromise();
            const DBFunctionModel = db.model('w_DBFunctions', DBFunctionSchema);
            const dbFnRes = await DBFunctionModel.find({ _p_appId: appIdpointer });
            await saveAppFunctions(dbFnRes);
          } catch (err) {
            console.log('err is get app function', err);
            return Promise.reject('err is get app functions');
          }
        }
        async function saveAppFunctions(res) {
          console.log('saveAppFunctions');
          if (res.length > 0) {
            try {
              const db = await mongoose.createConnection(targetConString, options).asPromise();
              const DBFunctionModel = db.model('w_DBFunctions', DBFunctionSchema);
              const src_res = await DBFunctionModel.collection.insertMany(res);
              console.log('app functions inserted');
            } catch (err) {
              console.log('err in save app functions', err);
            }
          }
          await getAppDashboard();
        }

        async function getAppDashboard() {
          try {
            var appIdpointer = 'w_appinfo$' + appId;
            const db = await mongoose.createConnection(sourceConString, options).asPromise();
            const w_Dashboardmodel = db.model('w_dashboard', DashboardSchema);
            const dashboardRes = await w_Dashboardmodel.find({ _p_appId: appIdpointer });
            await saveAppDashboard(dashboardRes);
          } catch (err) {
            console.log('err is get app dashboards', err);
          }
        }
        async function saveAppDashboard(res) {
          if (res.length > 0) {
            try {
              const db = await mongoose.createConnection(targetConString, options).asPromise();
              const w_Dashboardmodel = db.model('w_dashboard', DashboardSchema);
              const src_res = await w_Dashboardmodel.collection.insertMany(res);
              console.log('app dashboard inserted');
            } catch (err) {
              console.log('err in save app dashboards', err);
            }
          }
          await getAppForms();
        }

        async function getAppForms() {
          try {
            var appIdpointer = 'w_appinfo$' + appId;
            const db = await mongoose.createConnection(sourceConString, options).asPromise();
            const w_formV3model = db.model('w_formV3', w_formV3Schema);
            const formsRes = await w_formV3model.find({ _p_appId: appIdpointer });
            await saveAppForms(formsRes);
          } catch (err) {
            console.log('err is get app forms', err);
          }
        }
        async function saveAppForms(res) {
          if (res.length > 0) {
            try {
              const db = await mongoose.createConnection(targetConString, options).asPromise();
              const w_formV3model = db.model('w_formV3', w_formV3Schema);
              const src_res = await w_formV3model.collection.insertMany(res);
              console.log('app forms inserted');
            } catch (err) {
              console.log('err in save app forms', err);
            }
          }
          await getAppReports();
        }
        async function getAppReports() {
          try {
            var appIdpointer = 'w_appinfo$' + appId;
            const db = await mongoose.createConnection(sourceConString, options).asPromise();
            const w_reportmodel = db.model('w_Filter', w_reportSchema);
            const reportsRes = await w_reportmodel.find({ _p_appId: appIdpointer });
            await saveAppReports(reportsRes);
          } catch (err) {
            console.log('err is get app reports', err);
          }
        }
        async function saveAppReports(res) {
          if (res.length > 0) {
            try {
              const db = await mongoose.createConnection(targetConString, options).asPromise();
              const w_reportmodel = db.model('w_Filter', w_reportSchema);
              const src_res = await w_reportmodel.collection.insertMany(res);
              console.log('app reports inserted');
            } catch (err) {
              console.log('err in save app reports', err);
            }
          }
          await getAppMenu();
        }

        async function getAppMenu() {
          try {
            var appIdpointer = 'w_appinfo$' + appId;
            const db = await mongoose.createConnection(sourceConString, options).asPromise();
            const w_menumodel = db.model('w_menu', w_menuSchema);
            const menuRes = await w_menumodel.find({ _p_appId: appIdpointer });
            await saveAppMenu(menuRes);
          } catch (err) {
            console.log('err is get app menus', err);
          }
        }
        async function saveAppMenu(res) {
          if (res.length > 0) {
            try {
              const db = await mongoose.createConnection(targetConString, options).asPromise();
              const w_menumodel = db.model('w_menu', w_menuSchema);
              const src_res = await w_menumodel.collection.insertMany(res);

              console.log('app menus inserted');
            } catch (err) {
              console.log('err in save app menus', err);
            }
          }
          await saveAppRole();
        }

        async function saveAppRole(res) {
          const date = new Date();
          const appRole = appname + 'appeditor';
          const role = [
            {
              _id: appRoleId,
              name: appRole,
              _wperm: [`${UserId}`],
              _rperm: ['*', `${UserId}`],
              _acl: { UserId: { w: true, r: true }, '*': { r: true } },
              _created_at: date,
              _updated_at: date,
            },
            ...defaultRoles,
          ];

          try {
            const db = await mongoose.createConnection(targetConString, options).asPromise();
            Trg__RoleModel = db.model('_Role', _RoleSchema);
            const src_res = await Trg__RoleModel.collection.insertMany(role);
            console.log('app editor role inserted');
            await saveJoinAppRole();
          } catch (err) {
            console.log('err in save app editor role', err);
          }
        }

        async function saveJoinAppRole() {
          const OrgRole = organization + '_org';
          let OrgRoleId;

          try {
            const db = await mongoose.createConnection(targetConString, options).asPromise();
            // const _RoleModel = db.model('_Role', _RoleSchema);
            const src_res = await Trg__RoleModel.find({ name: OrgRole });
            // console.log('src_res ', src_res);
            OrgRoleId = src_res[0]._id;
          } catch (err) {
            console.log('err in get org Role Id', err);
          }
          const userJoinRole = [{ owningId: appRoleId, relatedId: UserId }];

          try {
            const db = await mongoose.createConnection(targetConString, options).asPromise();
            const _UserJoinRolemodel = db.model('_Join:users:_Role', _UserjoinSchema);
            const userJoinRes = await _UserJoinRolemodel.collection.insertMany(userJoinRole);

            console.log('User Join role inserted');
          } catch (err) {
            console.log('err in User Join role', err);
          }

          const roleJoinRole = [{ owningId: OrgRoleId, relatedId: appRoleId }];

          try {
            const db = await mongoose.createConnection(targetConString, options).asPromise();
            const _RoleJoinRolemodel = db.model('_Join:roles:_Role', _RolejoinSchema);
            const roleJoinRes = await _RoleJoinRolemodel.collection.insertMany(roleJoinRole);
            console.log('Role Join role inserted');
            await getAppSchemas();
          } catch (err) {
            console.log('err in Role Join role', err);
          }
        }
        async function getAppSchemas() {
          console.log('getAppSchemas');
          try {
            const db = await mongoose.createConnection(sourceConString, options).asPromise();
            Src_SCHEMASmodel = db.model('_SCHEMA', _SCHEMASchema);
            const schemaRes = await Src_SCHEMASmodel.find({
              _id: { $regex: '.*' + appname + '.*' },
            });
            await saveAppSchemas(schemaRes);
          } catch (err) {
            console.log('err in get app schema', err);
          }
        }

        async function saveAppSchemas(res) {
          if (res.length > 0) {
            console.log('saveAppSchemas');
            try {
              const db = await mongoose.createConnection(targetConString, options).asPromise();
              Trg_SCHEMASmodel = db.model('_SCHEMA', _SCHEMASchema);
              const src_res = await Trg_SCHEMASmodel.collection.insertMany(res);
              console.log('app schema inserted');
              msg = 'app installed successfully';
              status = 200;
            } catch (err) {
              console.log('err in save app schemas', err);
            }
          }
          msg = 'app installed successfully';
          status = 200;
        }
        const message = { message: msg, status: status };
        return message;
      } catch (err) {
        console.log('Exeption in query ', err);
        console.log(err);
        return 'Error:Exeption in query';
      }
    }
  } catch (err) {
    return Promise.reject('Invalid session token!');
  }
}
