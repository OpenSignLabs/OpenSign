/* --Description :cloud function called to get installed applist from client db */

//-- Export Modules
import mongoose from 'mongoose';

import { w_appinfoSchema } from '../models/appInfoclass.js';
import { orgAppsSchema } from '../models/orgApps.js';
import axios from 'axios';

export default async function CheckInstalledApp(request) {
  const organization = request.params.orgName;
  const options = { useNewUrlParser: true };
  const baseDb = process.env.MONGODB_URI;
  const serverUrl = process.env.SERVER_URL;
  const appId = process.env.APP_ID;
  // const sess = request.params._SessionToken;
  //--function to get the userid from session token
  try {
    const sess = request.headers['sessiontoken'];
    const user = await axios.get(serverUrl + '/users/me', {
      headers: {
        'X-Parse-Application-Id': appId,
        'X-Parse-Session-Token': sess,
      },
    });

    if (user.data && user.data.objectId) {
      // get client db from baseDb
      try {
        const getDbUrl = async orgName => {
          try {
            const db = await mongoose.createConnection(baseDb, options).asPromise();
            const orgAppsModel = db.model('orgApps', orgAppsSchema);
            const res = await orgAppsModel.findOne({ appName: orgName });
            console.log('dburl ', res.parseServer.databaseURI);
            return res.parseServer.databaseURI;
          } catch (err) {
            console.log('result not found in  orgApps ', err);
            return 'result not found!';
          }
        };
        const dbUrl = await getDbUrl(organization);
        // targetConString = client db
        // var targetConString = `mongodb+srv://doadmin:k0Nn4Q8L96vq715s@qik-server-prod-db-5054d37b.mongo.ondigitalocean.com/${dbName}?authSource=admin&replicaSet=qik-server-prod-db&tls=true`;
        const targetConString = dbUrl;

        async function getAppInfo() {
          console.log('getAppInfo ');
          try {
            const db = await mongoose.createConnection(targetConString, options).asPromise();
            const w_appinfomodel = db.model('w_appinfo', w_appinfoSchema);
            const res = await w_appinfomodel.find({});
            // console.log('getAppInfo ', res);

            if (res.length > 0) {
              const ress = JSON.stringify(res);
              const result = { count: res.length, appList: ress };
              return result;
            } else {
              const result = { count: res.length, appList: [] };
              return result;
            }
            // console.log(appId);
          } catch (err) {
            console.log('err in getAppData', err);
          }
        }
        const appInfo = await getAppInfo();
        return appInfo;
      } catch (err) {
        console.log('err ', err);
        const res = { error: 'Internal Server err ' };
        return res;
      }
    }
  } catch (err) {
    return Promise.reject('Invalid session token!');
  }
}
