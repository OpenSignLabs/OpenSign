/* --Description :cloud function to add or attach user in given role */

//-- Export Modules
import 'dotenv/config.js';
import axios from 'axios';
const appId = process.env.APP_ID;
const masterKey = process.env.MASTER_KEY;
const serverUrl = process.env.SERVER_URL;
export async function addUserToGroups(request) {
  try {
    var roleName = request.params.roleName;
    if (roleName == undefined) {
      return Promise.reject('Error:roleName not found!');
    }
    var appName = request.params.appName;
    if (appName == undefined) {
      return Promise.reject('Error:appName not found!');
    }
    var chkappName = appName + '_';
    //console.log("roleName " + roleName);
    var userId = request.params.userId;
    //console.log("userId " + userId);
    console.log('addUserToGroups');
    var response = {};
    var rolelist = {};
    var user = {
      users: {
        __op: 'AddRelation',
        objects: [{ __type: 'Pointer', className: '_User', objectId: userId }],
      },
    };
    var Role = roleName;
    var chkappnam = Role.split('_')[0];
    chkappnam = chkappnam + '_';
    // if (!chkappnam == chkappName) {
    //   return Promise.reject("Error:Please check role it should belong to current appllication");
    //  }
    function getAccessType(request) {
      return new Promise(function (resolve, reject) {
        const options = {
          url: serverUrl + '/classes/w_appinfo?where={"appname":"' + appName + '"}',
          method: 'get',
          headers: {
            'X-Parse-Application-Id': appId,
            'X-Parse-Master-Key': masterKey,
          },
        };

        axios(options)
          .then(x => {
            const body = x.data;
            var accessType;
            if (body['results'].length !== 0) {
              accessType = body['results'][0]['accessType'];
            } else {
              reject('Error:app not found!');
            }
            var error = accessType == '' ? true : false;
            if (error) {
              reject('result not found!');
            } else {
              resolve(accessType);
            }
          })
          .catch(err => {
            if (err) {
              console.error(err);
              return;
            }
          });
      });
    }
    var role = appName + 'appeditor';
    var appaccessType = await getAccessType(request);
    //console.log("appaccessType");
    //console.log(appaccessType);
    if (appaccessType == 'public') {
      adduserToRole();
    } else {
      //--function to get the userid from session token
      function getuserid(request) {
        try {
          return new Promise(function (resolve, reject) {
            const options = {
              url: serverUrl + '/users/me',
              method: 'get',
              headers: {
                'X-Parse-Application-Id': appId,
                'X-Parse-Session-Token': request.headers['sessiontoken'],
              },
            };

            axios(options)
              .then(x => {
                const body = x.data;
                var error = body == '' ? true : false;
                if (error) {
                  reject('result not found!');
                } else {
                  resolve(body);
                }
              })
              .catch(err => {
                if (err) {
                  console.error(err);
                  return;
                }
              });
          });
        } catch (err) {
          console.log('err ', err);
        }
      }
      var userData = await getuserid(request);
      if (userData.objectId == undefined) {
        return Promise.reject('Error:user not found!');
      }
      var chkuserid = userData.objectId;
      //console.log("chkuserid "+chkuserid);
      var url =
        serverUrl +
        '/roles?where={"users":{"__type":"Pointer","className":"_User","objectId":"' +
        chkuserid +
        '"},"name": {"$regex": "' +
        chkappName +
        '"}}';

      //-- check user role
      function getRoleList(chkuserid) {
        return new Promise(function (resolve, reject) {
          const options = {
            url: url,
            method: 'get',
            headers: {
              'X-Parse-Application-Id': appId,
            },
          };

          axios(options)
            .then(x => {
              const body = x.data;
              if (body['results'].length == 0) {
                reject('Error:user not found');
              }
              var error = body == '' ? true : false;
              if (error) {
                reject('result not found!');
              } else {
                resolve(body);
              }
            })
            .catch(err => {
              if (err) {
                console.error(err);
                return;
              }
            });
        });
      }
      rolelist = await getRoleList(chkuserid);
      //console.log("rolelist");
      // console.log(rolelist);
      var roleres = [];
      var result;
      for (var i = 0; i < rolelist['results'].length; i++) {
        var rolenum = rolelist['results'][i]['name'];
        var appnam = rolenum.split('_')[0];
        appnam = appnam + '_';
        if (appnam == chkappName) {
          result = true;
        }
      }

      if (result == true) {
        adduserToRole();
      } else {
        return Promise.reject('Error:user of this app can only add user to Role');
      }
    }

    //--after validation call adduserToRole function
    async function adduserToRole() {
      try {
        var roleNam = roleName;
        var roleid = await getroleobjId(roleNam);
        console.log('roleid');
        console.log(roleid);
        var response = await adduserid(roleid);

        return response;
      } catch (err) {
        console.log('err in addusertorole', err);
      }
    }
    //--function to get the role objId
    function getroleobjId(roleNam) {
      return new Promise(function (resolve, reject) {
        const options = {
          url: serverUrl + '/roles?where={"name":"' + roleNam + '"}',
          method: 'get',
          headers: {
            'X-Parse-Application-Id': appId,
          },
        };
        axios(options)
          .then(x => {
            const body = x.data;
            var roleid;
            if (body['results'].length !== 0) {
              roleid = body['results'][0]['objectId'];
            } else {
              reject('Error:Role not found!');
            }
            var error = roleid == '' ? true : false;
            if (error) {
              reject('result not found!');
            } else {
              resolve(roleid);
            }
          })
          .catch(err => {
            if (err) {
              console.error(err);
              return;
            }
          });
      });
    }

    //--function to add the userid to role
    function adduserid(roleid) {
      return new Promise(function (resolve, reject) {
        const options = {
          url: serverUrl + '/roles/' + roleid,
          method: 'PUT',
          headers: {
            'X-Parse-Application-Id': appId,
            'X-Parse-Master-Key': masterKey,
            'Content-Type': 'application/json',
          },
          data: user,
        };

        axios(options)
          .then(x => {
            const body = x.data;
            var error = body == '' ? true : false;
            if (error) {
              reject('result not found!');
            } else {
              console.log('user added to role');
              resolve(body);
            }
          })
          .catch(err => {
            if (err) {
              console.error(err);
              return;
            }
          });
      });
    }
  } catch (err) {
    console.log('err in AddUserToRole');
    console.log(err);
    return Promise.reject('Error:exception in query,Result not Found');
  }
}
