import Parse from "parse";
import axios from "axios";
import { appInfo } from "../../constant/appinfo";

//For fetching application Information
export const fetchAppInfo = (str, burl, app_id) => async (dispatch) => {
  Parse.serverURL = burl;
  Parse.initialize(app_id);

  const response = appInfo;
  let _base = ""; // Define _base here and initialize it to an empty string
  if (response && response.baseurl) {
    _base = response.baseurl.charAt(response.baseurl.length - 1);
  }  localStorage.removeItem("baseUrl");
  localStorage.setItem("_appName", response.appname);
  localStorage.setItem("_app_objectId", response.objectId);
  if (_base === "/") {
    localStorage.setItem("baseUrl", response.baseurl);
  } else {
    localStorage.setItem("baseUrl", `${response.baseurl}/`);
  }
  localStorage.setItem("appLogo", response.applogo);
  localStorage.setItem("appVersion", response.version);
  if (response.enableWebNotification) {
    localStorage.setItem(
      "enableWebNotification",
      response.enableWebNotification
    );
  }
  localStorage.setItem("parseAppId", app_id);
  localStorage.removeItem("userSettings");
  localStorage.setItem("userSettings", JSON.stringify(response.settings));
  localStorage.setItem("appTitle", response.appTitle);
  localStorage.setItem("fev_Icon", response.fev_Icon);
  // console.log("response ", response);
  dispatch({ type: "FATCH_APPINFO", payload: response });
};

//for simple login
export const login = (username, password) => async (dispatch) => {
  let res = {};
  let baseUrl = localStorage.getItem("baseUrl");
  let parseAppId = localStorage.getItem("parseAppId");
  try {
    Parse.serverURL = baseUrl;
    Parse.initialize(parseAppId);
    await Parse.User.logIn(username, password).then(
      async function (res1) {
        var resultjson = res1.toJSON();
        res = res1.toJSON();
        localStorage.setItem("userEmail", username);
        localStorage.setItem("username", resultjson.name);
        localStorage.setItem("accesstoken", resultjson.sessionToken);
        localStorage.setItem("scriptId", true);
        if (resultjson.ProfilePic) {
          localStorage.setItem("profileImg", resultjson.ProfilePic);
        } else {
          localStorage.setItem("profileImg", "");
        }
        let url = `${baseUrl}functions/UserGroups`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          sessionToken: resultjson.sessionToken
        };

        let body = {
          appname: localStorage.getItem("domain")
        };
        let userGroup = "",
          userGroup1 = "";
        await axios
          .post(url, JSON.stringify(body), { headers: headers })
          .then(async (response) => {
            userGroup = response.data.result[0];
            userGroup1 = response.data.result[1];
            localStorage.setItem("_userGroup", userGroup);
          });

        let appSetings = JSON.parse(localStorage.getItem("userSettings"));
        let defaultmenuid = "",
          PageLanding = "",
          pageType = "";

        appSetings.forEach(async (element) => {
          if (`${localStorage.getItem("_appName")}_appeditor` === userGroup) {
            if (element.role === userGroup1) {
              defaultmenuid = element.menuId;
              PageLanding = element.pageId;
              pageType = element.pageType;
              localStorage.setItem("PageLanding", PageLanding);
              localStorage.setItem("defaultmenuid", defaultmenuid);
              localStorage.setItem("pageType", pageType);
              let _role = userGroup1.replace(
                `${localStorage.getItem("_appName")}_`,
                ""
              );
              if (userGroup1) {
                localStorage.setItem("_user_role", _role);
              } else {
                localStorage.setItem("_user_role", _role);
              }
            }
          } else if (element.role === userGroup) {
            defaultmenuid = element.menuId;
            PageLanding = element.pageId;
            pageType = element.pageType;
            localStorage.setItem("PageLanding", PageLanding);
            localStorage.setItem("defaultmenuid", defaultmenuid);
            localStorage.setItem("pageType", pageType);
            localStorage.setItem("extended_class", element.extended_class);
            localStorage.setItem("userpointer", element.userpointer);
            let _role = userGroup.replace(
              `${localStorage.getItem("domain")}_`,
              ""
            );
            if (userGroup) {
              localStorage.setItem("_user_role", _role);
            } else {
              localStorage.setItem("_user_role", _role);
            }
            try {
              const tour = Parse.Object.extend(
                localStorage.getItem("extended_class")
              );
              let _tour = new Parse.Query(tour);
              _tour.equalTo("UserId", {
                __type: "Pointer",
                className: "_User",
                objectId: resultjson.objectId
              });
              await _tour.first().then(
                (results) => {
                  let userinfo = results.toJSON();
                  if (userinfo.TenantId) {
                    localStorage.setItem("TenetId", userinfo.TenantId.objectId);
                  }
                  //  console.log("tour found", results);
                },
                (error) => {
                  console.error("Error while fetching tour", error);
                }
              );
            } catch (error) {
              console.log("err ", error)
            }
          }
        });

        dispatch({ type: "APP_LOGIN", payload: res });

        if (pageType !== "") {
          window.location = `/${pageType}/${PageLanding}`;
        } else {
          alert("You dont have access to this application.");
          localStorage.setItem("accesstoken", null);
        }
      },
      function () {
        alert("Invalid Login");
        localStorage.setItem("accesstoken", null);
      }
    );
  } catch (err) {
    console.log(err);
    alert("You dont have access to this application.");
    localStorage.setItem("accesstoken", null);
  }
};

//for reset password
export const forgetPassword = (username) => async () => {
  // let res = {};
  let baseUrl = localStorage.getItem("BaseUrl12");
  let parseAppId = localStorage.getItem("AppID12");
  try {
    Parse.serverURL = baseUrl;
    Parse.initialize(parseAppId);
    await Parse.User.requestPasswordReset(username).then(
      async function (res1) {
        // var resultjson = res1;
        // console.log("post data", resultjson.length);
        if (res1.data === undefined) {
          alert("Reset password link has been sent to your email id ");
        }
      },
      function () {
        // alert("Password Reset Done")
      }
    );
  } catch (err) {
    console.log(err);
  }
};

// Role field wizard
export const fetchRoleEnum = (name) => async (dispatch) => {
  let response = [];
  let baseUrl = localStorage.getItem("baseUrl");
  let parseAppId = localStorage.getItem("parseAppId");
  try {
    let url = `${baseUrl}roles?where={"name":{"$regex":"${name}","$ne":"${localStorage.getItem(
      "domain"
    )}_appeditor"}}`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": parseAppId
    };
    await axios.get(url, { headers: headers }).then((res) => {
      let temp = [];
      res.data.results.forEach((x) => {
        temp.push(x["name"]);
      });
      response = temp;
    });
  } catch (e) {
    console.error("Problem", e);
  }
  dispatch({ type: "FETCH_ROLE", payload: response });
};

export const setEnableCart = (val) => async (dispatch) => {
  dispatch({
    type: "ENABLE_CART",
    payload: val
  });
};

export const setCartUpdateData = (val) => async (dispatch) => {
  dispatch({
    type: "UPDATE_CART",
    payload: val
  });
};

export const addItemsToCart = (val) => async (dispatch) => {
  dispatch({
    type: "ADD_CART",
    payload: val
  });
};

export const clearCartData = () => async (dispatch) => {
  dispatch({
    type: "CLEAR_CART",
    payload: []
  });
};

export const SaveMultipleCart = (val) => async (dispatch) => {
  dispatch({
    type: "MULTI_CART",
    payload: val
  });
};

export const removeFromCart = (val) => async (dispatch) => {
  dispatch({
    type: "REMOVE_CART",
    payload: val
  });
};

export const onChangeLevel1Dropdown = (id, name) => async (dispatch) => {
  localStorage.setItem(`_dd${name}`, id);
  let _data = { [name]: `${id}` };
  dispatch({ type: "Level1_Dropdown", payload: _data });
};

export const onChangeLevel2Dropdown = (id, name) => async (dispatch) => {
  localStorage.setItem(`_dd${name}`, id);
  let _data = { [name]: `${id}` };
  dispatch({ type: "Level2_Dropdown", payload: _data });
};

export const onChangeLevel3Dropdown = (id, name) => async (dispatch) => {
  localStorage.setItem(`_dd${name}`, id);
  let _data = { [name]: `${id}` };
  dispatch({ type: "Level3_Dropdown", payload: _data });
};

export const removeState = () => async (dispatch) => {
  dispatch({ type: "REMOVE_STATE", payload: {} });
};
export const removeLevel2State = () => async (dispatch) => {
  dispatch({ type: "removeLevel2", payload: {} });
};

export const removeLevel3State = () => async (dispatch) => {
  dispatch({ type: "removeLevel3", payload: {} });
};

export const showTenantName = (name) => async (dispatch) => {
  dispatch({ type: "SHOW_TENANT", payload: name || null });
};

export const saveDependantDDValue = (id, value) => async (dispatch) => {
  let _data = { [`${id}_dd`]: value };
  dispatch({ type: "SAVE_DEPENDANTDD", payload: _data });
};

export const removeDependantDDValue = (id, value) => async (dispatch) => {
  let _data = { [`${id}_dd`]: value };
  dispatch({ type: "REMOVE_DEPENDANTDD", payload: _data });
};

export const remove_AlldependantDD = () => async (dispatch) => {
  dispatch({ type: "REMOVE_ALLDEPENDANTDD", payload: {} });
};

export const save_tourSteps = (steps) => async (dispatch) => {
  dispatch({ type: "SAVE_TOURSTEPS", payload: steps });
};

export const remove_tourSteps = () => async (dispatch) => {
  dispatch({ type: "REMOVE_TOURSTEPS", payload: [] });
};
