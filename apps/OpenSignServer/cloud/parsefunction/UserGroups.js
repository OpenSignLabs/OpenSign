/* --Description :cloud function called to add mater key in update query */

//-- Export Modules
import dotenv from 'dotenv';
dotenv.config()
import axios from "axios";

export async function getUserGroups(request) {
  try {
    var appname = request.params.appname;
    if (appname == "") {
      return Promise.reject("Error:please provide appname");
    }
    var response = {};
    var rolelist = {};
    appname = appname + "_";
    //--function to get the userid from session token
    function getuserid(request) {
      return new Promise(function (resolve, reject) {
        const options = {
          url: process.env.SERVER_URL + "/users/me",
          method: "get",
          headers: {
            "X-Parse-Application-Id": process.env.APP_ID,
            "X-Parse-Session-Token": request.headers["sessiontoken"],
          },
        };

        axios(options)
          .then((x) => {
            const body = x.data;
            var error = body == "" ? true : false;
            if (error) {
              reject("result not found!");
            } else {
              resolve(body);
            }
          })
          .catch((err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
      });
    }
    var userData = await getuserid(request);
    var userid = userData.objectId;
    console.log("userid " + userid);
    var url =
      process.env.SERVER_URL +
      '/roles?where={"users":{"__type":"Pointer","className":"_User","objectId":"' +
      userid +
      '"},"name": {"$regex": "' +
      appname +
      '"}}';

    //-- check user role
    function getRoleList(userid) {
      return new Promise(function (resolve, reject) {
        const options = {
          url: url,
          method: "get",
          headers: {
            "X-Parse-Application-Id": process.env.APP_ID,
          },
        };

        axios(options)
          .then((x) => {
            const body = x.data;
            var roleres = [];
            for (var i = 0; i < body["results"].length; i++) {
              var rolename = body["results"][i]["name"];
              //var roleprefix = rolename.split("_")[0];
              roleres.push(rolename);
            }
            var error = roleres == "" ? true : false;
            if (error) {
              reject("result not found!");
            } else {
              resolve(roleres);
            }
          })
          .catch((err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
      });
    }

    rolelist = await getRoleList(request);
    console.log(rolelist);
    //--check user roles according to appId
    var rolesInapp = [];
    for (let i = 0; i < rolelist.length; i++) {
      var str = JSON.stringify(rolelist[i]);
      var result = str.includes(appname);
      if (result == true) {
        rolesInapp.push(rolelist[i]);
      }
    }
    console.log(rolesInapp);
    return rolesInapp;
  } catch (err) {
    console.log("err in usergroup");
    console.log(err);
    return Promise.reject("Error:Result not found");
  }
}
