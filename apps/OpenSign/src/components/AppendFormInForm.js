import React, { Component } from "react";
import { connect } from "react-redux";
import {
  removeState,
  removeLevel2State,
  removeLevel3State
} from "../redux/actions/index";
import Engine from "json-rules-engine-simplified";
import applyRules from "rjsf-conditionals";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import "../styles/form.css";
import "../styles/toast.css";
import Parse from "parse";
import "../styles/loader.css";
import LayoutField from "./fields/Rjsf-layout";
import TimeWidget from "./fields/TimeWidget";
import axios from "axios";
import { Navigate } from "react-router-dom";
import HiddenField from "./fields/HiddenField";
import ErrorBoundary from "./ErrorBoundary";
import parse from "html-react-parser";
import { formJson } from "../json/FormJson";

const widget = {
  TimeWidget: TimeWidget
};
const fields = () => {
  return {
    layout: LayoutField,
    HiddenField: HiddenField
  };
};

class AppendFormInForm extends Component {
  state = {
    schema: {},
    ui_schema: {},
    extraActions: undefined,
    rules: [],
    isAppRequest: false,
    formData: {},
    persistentFields: [],
    successMassage: "Record inserted successfully.",
    title: "",
    active: true,
    buttons: {},
    schemaState: {},
    noValidate: false,
    liveValidate: false,
    _validate: null,
    userSchema: {},
    loading: false,
    parseBaseUrl: localStorage.getItem("baseUrl"),
    parseAppId: localStorage.getItem("parseAppId"),
    toastColor: "#5cb85c",
    toastDescription: "",
    redirect_type: "",
    redirect_id: "",
    FormACL: null,
    help: "",
    link: ""
  };

  async getForm(id) {
    this.setState({
      loading: true
    });
    try {
      // get json from data(jsonschema, uischema)
      const results = formJson(id);
      // console.log("results", id, results);
      if (results) {
        const resultjson = results;
        if (resultjson.userSchema !== undefined) {
          this.setState({
            userSchema: resultjson.userSchema
          });
        }
        for (let [value] of Object.entries(resultjson.jsonSchema.properties)) {
          if (typeof value === "object") {
            for (let [k, v] of Object.entries(value)) {
              if (k === "format" && v === "date") {
                let today = new Date();
                let date =
                  today.getFullYear() +
                  "-" +
                  ("0" + (today.getMonth() + 1)).slice(-2) +
                  "-" +
                  ("0" + today.getDate()).slice(-2);
                value.default = date;
              }
              if (k === "component" && v === "DateTime") {
                value.default = new Date().toISOString();
              }
            }
          }
        }
        let txt,
          link,
          successMsg,
          _rules = [],
          persistentFields = [],
          _extraActions = {};
        if (resultjson.help) {
          if (resultjson.help.htmlbody) {
            txt = resultjson.help.htmlbody;
          }
          if (resultjson.help.link) {
            link = resultjson.help.link;
          }
        }
        if (resultjson.rules) {
          _rules = resultjson.rules;
        }
        if (resultjson.persistentFields) {
          persistentFields = resultjson.persistentFields;
        }
        if (resultjson.extraActions) {
          _extraActions = this.setExtraActions(resultjson.extraActions);
        }
        if (resultjson.success_message) {
          successMsg = resultjson.success_message;
        } else {
          successMsg = this.state.successMassage;
        }
        let _jsonSchema = JSON.stringify(resultjson.jsonSchema);
        _jsonSchema = _jsonSchema.replace("#$", "$");
        _jsonSchema = _jsonSchema.replace("#*", "$");
        _jsonSchema = _jsonSchema.replace("_DOT_", ".");

        let _replaceJSONSchema = JSON.parse(_jsonSchema);
        this.setState({
          redirect_type: resultjson.success_redirect,
          redirect_id: resultjson.redirect_id,
          FormACL: resultjson.formACL,
          help: txt,
          link: link,
          persistentFields: persistentFields,
          successMassage: successMsg,
          buttons: resultjson.buttons.add,
          schemaState: _replaceJSONSchema,
          ui_schema: resultjson.uiSchema,
          rules: _rules,
          extraActions: _extraActions,
          title: resultjson.class,
          _validate: resultjson.validFunction,
          noValidate: resultjson.noValidate,
          liveValidate: resultjson.liveValidate && resultjson.liveValidate,
          loading: false
        });
        localStorage.setItem(
          "jsonschema",
          JSON.stringify(resultjson.jsonSchema)
        );
      } else {
        alert("form not found");
      }
    } catch (e) {
      if (e.message === "Invalid session token") {
        let appdata = localStorage.getItem("userSettings");
        let applogo = localStorage.getItem("appLogo");
        let appName = localStorage.getItem("appName");
        let defaultmenuid = localStorage.getItem("defaultmenuid");
        let PageLanding = localStorage.getItem("PageLanding");
        let domain = localStorage.getItem("domain");
        let _appName = localStorage.getItem("_appName");
        let baseUrl = localStorage.getItem("BaseUrl12");
        let appid = localStorage.getItem("AppID12");

        localStorage.clear();

        localStorage.setItem("appLogo", applogo);
        localStorage.setItem("appName", appName);
        localStorage.setItem("_appName", _appName);
        localStorage.setItem("defaultmenuid", defaultmenuid);
        localStorage.setItem("PageLanding", PageLanding);
        localStorage.setItem("domain", domain);
        localStorage.setItem("userSettings", appdata);
        localStorage.setItem("BaseUrl12", baseUrl);
        localStorage.setItem("AppID12", appid);

        return <Navigate to="/" />;
      }
      console.log(e.message);
      console.error("Problem", e);
      this.setState({
        loading: false
      });
    }
  }

  wrap = (s) => "{ return " + s + " };";

  // func = new Function(wrap(body));

  dynamicValidate = (formData, errors) => {
    try {
      let body = atob(this.state._validate);
      let res = new Function(this.wrap(body))
        .call(null)
        .call(null, formData, errors);
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  setExtraActions = (actions) => {
    try {
      let result = {};
      Object.entries(actions).forEach(([key, value]) => {
        let body = atob(value);
        let res = new Function(this.wrap(body)).call(null);
        result[key] = res;
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  };

  handleSubmit = async ({ formData }) => {
    this.setState({ active: false, loading: true });
    if (
      this.state.userSchema &&
      Object.entries(this.state.userSchema).length !== 0 &&
      this.state.userSchema.constructor === Object
    ) {
      try {
        let RowData = formData;
        RowData &&
          Object.entries(RowData).forEach(([key, value]) => {
            if (typeof value === "string") {
              RowData[key] = value.trim();
            }
          });
        let UserData = {};
        let RoleField = "";
        let _scanData = this.state.schemaState;
        if (_scanData.dependencies) {
          Object.keys(_scanData.dependencies).forEach((key) => {
            if (_scanData.dependencies[key].oneOf) {
              _scanData.dependencies[key].oneOf.forEach((val) => {
                Object.keys(val.properties).forEach((k) => {
                  if (typeof val.properties[k] === "object") {
                    if (val.properties[k].format === "date") {
                      if (RowData[k]) {
                        let newdate = new Date(RowData[k]);
                        RowData[k] = newdate;
                      }
                    }
                    if (val.properties[k].component === "HtmlEditor") {
                      if (RowData[k]) {
                        let newHtml = RowData[k]
                          .replace(/<p[^>]*>/g, "")
                          .replace(/<\/p>/g, " ");
                        RowData[k] = newHtml;
                      }
                    }
                    if (val.properties[k].component === "DateTime") {
                      if (RowData[k]) {
                        let newDate11 = new Date(RowData[k]);
                        RowData[k] = newDate11;
                      }
                    }
                    if (val.properties[k].component === "CurrencyInput") {
                      if (val.properties[k].currencyColumn) {
                        RowData[`${val.properties[k].currencyColumn}`] =
                          val.properties[k].defaultcurrency;
                      }
                    }
                    if (val.properties[k].type === "string") {
                      if (typeof RowData[k] === "string")
                        RowData[k] = RowData[k].trim();
                    }
                    if (val.properties[k].data !== undefined) {
                      if (val.properties[k].data.isPointer) {
                        let pointer = undefined;
                        if (val.properties[k].data.class) {
                          if (val.properties[k].data.savePointerClass) {
                            if (RowData[k]) {
                              pointer = {
                                __type: "Pointer",
                                className:
                                  val.properties[k].data.savePointerClass,
                                objectId: RowData[k]
                              };
                            }
                          } else {
                            if (RowData[k]) {
                              pointer = {
                                __type: "Pointer",
                                className: val.properties[k].data.class,
                                objectId: RowData[k]
                              };
                            }
                          }
                        } else {
                          if (RowData[k]) {
                            pointer = {
                              __type: "Pointer",
                              className: localStorage.getItem("extended_class"),
                              objectId: RowData[k]
                            };
                          }
                        }
                        RowData[k] = pointer;
                      }
                      if (val.properties[k].data.FolderTypeValue) {
                        if (RowData[k]) {
                          let obj = {
                            __type: "Pointer",
                            className: val.properties[k].data.ClassName,
                            objectId: RowData[k]
                          };
                          RowData[k] = obj;
                        }
                      }
                    }
                  }
                });
              });
            }
          });
        }
        let _userScheama = this.state.userSchema;

        Object.keys(_scanData).forEach(function (key) {
          let _dd = _scanData[key];
          typeof _dd === "object" &&
            Object.keys(_dd).forEach(function (k) {
              if (_dd[k].type === "array" && _dd[k].items) {
                let _prop = _dd[k].items.properties;

                if (_prop && Array.isArray(RowData[k])) {
                  let newRow = [];
                  RowData[k].forEach((t) => {
                    let _newObj = t;
                    if (typeof t === "object") {
                      Object.keys(_prop).forEach(function (l) {
                        if (_prop[l].data && _prop[l].data.isPointer) {
                          if (typeof t[l] === "object") {
                            let obj = {
                              __type: "Pointer",
                              className: _prop[l].data.class,
                              objectId: t[l].objectId
                            };
                            _newObj = { ..._newObj, [l]: obj };
                          } else {
                            let obj = {
                              __type: "Pointer",
                              className: _prop[l].data.class,
                              objectId: t[l]
                            };
                            _newObj = { ..._newObj, [l]: obj };
                          }
                        }
                      });
                    }
                    newRow.push(_newObj);
                  });
                  RowData[k] = newRow;
                }
              }

              if (_dd[k].component === "AutoSuggest" && _dd[k].isPointer) {
                if (RowData[k]) {
                  let pointer = {
                    __type: "Pointer",
                    className: _dd[k].class,
                    objectId: RowData[k]
                  };
                  RowData[k] = pointer;
                }
              }
              if (_dd[k].format === "date") {
                let newdate = new Date(RowData[k]);
                RowData[k] = newdate;
              }
              if (_dd[k].component === "CurrencyInput") {
                RowData[`${_dd[k].currencyColumn}`] = _dd[k].defaultcurrency;
              }
              if (_dd[k].component === "HtmlEditor") {
                if (RowData[k]) {
                  let newHtml = RowData[k]
                    .replace(/<p[^>]*>/g, "")
                    .replace(/<\/p>/g, " ");
                  RowData[k] = newHtml;
                }
              }
              if (_dd[k].component === "DateTime") {
                let newDate;
                if (!RowData[k]) {
                  newDate = new Date();
                } else {
                  newDate = new Date(RowData[k]);
                }
                RowData[k] = newDate;
              }
              if (_dd[k].data !== undefined) {
                if (_dd[k].data.isPointer) {
                  let pointer = undefined;
                  if (_dd[k].data.savePointerClass) {
                    if (RowData[k]) {
                      pointer = {
                        __type: "Pointer",
                        className: _dd[k].data.savePointerClass,
                        objectId: RowData[k]
                      };
                      RowData[k] = pointer;
                    }
                  } else if (RowData[k]) {
                    if (_dd[k].data.class) {
                      pointer = {
                        __type: "Pointer",
                        className: _dd[k].data.class,
                        objectId: RowData[k]
                      };
                    } else {
                      pointer = {
                        __type: "Pointer",
                        className: localStorage.getItem("extended_class"),
                        objectId: RowData[k]
                      };
                    }

                    RowData[k] = pointer;
                  }
                }
                if (_dd[k].data.FolderTypeValue) {
                  if (RowData[k]) {
                    let obj = {
                      __type: "Pointer",
                      className: _dd[k].data.ClassName,
                      objectId: RowData[k]
                    };
                    RowData[k] = obj;
                  }
                }
              }
              if (_dd[k].type === "string") {
                let d = RowData[k];
                if (typeof d === "string") {
                  RowData[k] = d.trim();
                }
              }
            });
        });

        Object.keys(_userScheama).forEach(function (kkey) {
          Object.keys(RowData).forEach(function (_k) {
            if (_userScheama[kkey].startsWith("$")) {
              let _uuu = _userScheama[kkey].replace("$", "");
              if (kkey === "Role" || kkey === "role") {
                if (RowData[_uuu] === RowData[_k]) {
                  RoleField = RowData[_uuu];
                }
              } else if (_uuu === _k) {
                UserData[kkey] = RowData[_k];
              }
            } else {
              RoleField = _userScheama[kkey];
            }
          });
        });
        Parse.serverURL = this.state.parseBaseUrl;
        Parse.initialize(this.state.parseAppId);
        var _users = Parse.Object.extend("User");
        var _user = new _users();
        let _uname = UserData.name;
        _user.set("name", _uname.toString().trim());
        if (UserData.username) {
          let _u_un = UserData.username;
          _user.set("username", _u_un.toString().trim());
          if (UserData.email) {
            let _email = UserData.email;
            _user.set("email", _email.trim());
          }
        } else if (UserData.email) {
          let _email = UserData.email;
          _user.set("email", _email.trim());
          _user.set("username", _email.trim());
        } else {
          _user.set("username", UserData.phone.toString().trim());
        }
        _user.set("phone", UserData.phone);
        _user.set("password", UserData.password);
        _user.save().then(
          (u) => {
            let roleurl = `${this.state.parseBaseUrl}functions/AddUserToRole`;
            const headers = {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": this.state.parseAppId,
              sessionToken: localStorage.getItem("accesstoken")
            };
            let body = {
              appName: localStorage.getItem("_appName"),
              roleName: RoleField,
              userId: u.id
            };
            axios.post(roleurl, body, { headers: headers }).then(() => {
              const currentUser = Parse.User.current();
              let _fname = this.state.title;
              var forms = Parse.Object.extend(_fname);
              var form = new forms();
              form.set(
                "CreatedBy",
                Parse.User.createWithoutData(currentUser.id)
              );
              if (localStorage.getItem("TenetId")) {
                form.set("TenantId", {
                  __type: "Pointer",
                  className: "partners_Tenant",
                  objectId: localStorage.getItem("TenetId")
                });
              }
              form.set("UserId", u);
              form.set("UserRole", RoleField);
              if (this.state["FormACL"]) {
                let ACL = {};
                for (let [key, value] of Object.entries(
                  this.state["FormACL"]
                )) {
                  if (key === "*") {
                    ACL[key] = value;
                  }
                  if (key === "#currentUser#") {
                    ACL[Parse.User.current().id] = value;
                  }
                  if (key.startsWith("role")) {
                    ACL[key] = value;
                  }
                }
                form.setACL(new Parse.ACL(ACL));
              }
              form.save(RowData).then(
                (formd) => {
                  const parseData = JSON.parse(JSON.stringify(formd));
                  this.props.details({
                    value: parseData[this.props.valueKey],
                    label: parseData[this.props.displayKey]
                  });
                  if (this.props.closePopup) {
                    this.props.closePopup();
                  }
                  let filtered = {};
                  if (this.state.redirect_type === "clearData") {
                    if (
                      this.state.persistentFields &&
                      this.state.persistentFields.length
                    ) {
                      filtered = Object.keys(RowData)
                        .filter((key) =>
                          this.state.persistentFields.includes(key)
                        )
                        .reduce((obj, key) => {
                          obj[key] = RowData[key];
                          return obj;
                        }, {});
                    }
                  } else {
                    RowData = {};
                  }
                  this.setState(
                    {
                      formData: filtered,
                      active: true,
                      loading: false,
                      toastColor: "#5cb85c",
                      toastDescription: this.state.successMassage
                    },
                    () => {
                      this.props.removeState();
                      this.props.removeLevel2State();
                      this.props.removeLevel3State();
                      var x = document.getElementById("snackbar");
                      x.className = "show";
                      setTimeout(function () {
                        x.className = x.className.replace("show", "");
                      }, 2000);
                    }
                  );
                },
                (error) => {
                  console.log("error", error.message);
                  this.setState({
                    loading: false,
                    active: true,
                    toastColor: "#d9534f",
                    toastDescription: error.message
                  });

                  var x = document.getElementById("snackbar");
                  x.className = "show";
                  setTimeout(function () {
                    x.className = x.className.replace("show", "");
                  }, 2000);
                }
              );
            });
          },
          async (error) => {
            if (error.code === 202) {
              let params;
              if (UserData.username) {
                params = { username: UserData.username };
              } else if (UserData.email) {
                params = { email: UserData.email };
              } else {
                params = { username: UserData.phone };
              }
              const userRes = await Parse.Cloud.run("getUserId", params);

              try {
                let _emp = {
                  __type: "Pointer",
                  className: "_User",
                  objectId: userRes.id
                };
                let roleurl = `${this.state.parseBaseUrl}functions/AddUserToRole`;
                const headers = {
                  "Content-Type": "application/json",
                  "X-Parse-Application-Id": this.state.parseAppId,
                  sessionToken: localStorage.getItem("accesstoken")
                };
                let body = {
                  appName: localStorage.getItem("_appName"),
                  roleName: RoleField,
                  userId: userRes.id
                };
                await axios
                  .post(roleurl, body, { headers: headers })
                  .then(() => {
                    const currentUser = Parse.User.current();
                    let _fname = this.state.title;
                    var forms = Parse.Object.extend(_fname);
                    var form = new forms();
                    form.set(
                      "CreatedBy",
                      Parse.User.createWithoutData(currentUser.id)
                    );
                    if (localStorage.getItem("TenetId")) {
                      form.set("TenantId", {
                        __type: "Pointer",
                        className: "partners_Tenant",
                        objectId: localStorage.getItem("TenetId")
                      });
                    }
                    form.set("UserId", _emp);
                    form.set("UserRole", RoleField);
                    if (this.state["FormACL"]) {
                      let ACL = {};
                      for (let [key, value] of Object.entries(
                        this.state["FormACL"]
                      )) {
                        if (key === "*") {
                          ACL[key] = value;
                        }
                        if (key === "#currentUser#") {
                          ACL[Parse.User.current().id] = value;
                        }
                        if (key.startsWith("role")) {
                          ACL[key] = value;
                        }
                      }
                      form.setACL(new Parse.ACL(ACL));
                    }
                    form.save(RowData).then(
                      () => {
                        let filtered = {};
                        if (this.state.redirect_type === "clearData") {
                          if (
                            this.state.persistentFields &&
                            this.state.persistentFields.length
                          ) {
                            filtered = Object.keys(RowData)
                              .filter((key) =>
                                this.state.persistentFields.includes(key)
                              )
                              .reduce((obj, key) => {
                                obj[key] = RowData[key];
                                return obj;
                              }, {});
                          }
                        } else {
                          RowData = {};
                        }
                        this.setState(
                          {
                            formData: filtered,
                            active: true,
                            loading: false,
                            toastColor: "#5cb85c",
                            toastDescription: this.state.successMassage
                          },
                          () => {
                            this.props.removeState();
                            this.props.removeLevel2State();
                            this.props.removeLevel3State();
                            var x = document.getElementById("snackbar");
                            x.className = "show";
                            setTimeout(function () {
                              x.className = x.className.replace("show", "");
                            }, 2000);
                          }
                        );
                      },
                      (error) => {
                        this.setState({
                          loading: false,
                          active: true,
                          toastColor: "#d9534f",
                          toastDescription: error.message
                        });

                        var x = document.getElementById("snackbar");
                        x.className = "show";
                        setTimeout(function () {
                          x.className = x.className.replace("show", "");
                        }, 2000);
                      }
                    );
                  });
              } catch (error) {
                this.setState({
                  loading: false,
                  active: true,
                  toastColor: "#d9534f",
                  toastDescription: error.message
                });

                const x = document.getElementById("snackbar");
                x.className = "show";
                setTimeout(function () {
                  x.className = x.className.replace("show", "");
                }, 2000);
              }
            }
          }
        );
      } catch (e) {
        console.log("Problem", e.message);
        this.setState({ loading: false, active: true });
      }
    } else {
      try {
        let RowData = formData;
        let _scanData = this.state.schemaState;
        if (_scanData.dependencies) {
          Object.keys(_scanData.dependencies).forEach((key) => {
            if (_scanData.dependencies[key].oneOf) {
              _scanData.dependencies[key].oneOf.forEach((val) => {
                Object.keys(val.properties).forEach((k) => {
                  if (typeof val.properties[k] === "object") {
                    if (val.properties[k].format === "date") {
                      if (RowData[k]) {
                        let newdate = new Date(RowData[k]);
                        RowData[k] = newdate;
                      }
                    }
                    if (val.properties[k].component === "HtmlEditor") {
                      if (RowData[k]) {
                        let newHtml = RowData[k]
                          .replace(/<p[^>]*>/g, "")
                          .replace(/<\/p>/g, " ");
                        RowData[k] = newHtml;
                      }
                    }
                    if (val.properties[k].component === "DateTime") {
                      if (RowData[k]) {
                        let newDate11 = new Date(RowData[k]);
                        RowData[k] = newDate11;
                      }
                    }
                    if (val.properties[k].component === "CurrencyInput") {
                      if (val.properties[k].currencyColumn) {
                        RowData[`${val.properties[k].currencyColumn}`] =
                          val.properties[k].defaultcurrency;
                      }
                    }
                    if (val.properties[k].type === "string") {
                      if (typeof RowData[k] === "string")
                        RowData[k] = RowData[k].trim();
                    }
                    if (val.properties[k].data !== undefined) {
                      if (val.properties[k].data.isPointer) {
                        let pointer = undefined;
                        if (val.properties[k].data.savePointerClass) {
                          if (RowData[k]) {
                            pointer = {
                              __type: "Pointer",
                              className:
                                val.properties[k].data.savePointerClass,
                              objectId: RowData[k]
                            };
                          }
                        } else if (val.properties[k].data.class) {
                          if (RowData[k]) {
                            pointer = {
                              __type: "Pointer",
                              className: val.properties[k].data.class,
                              objectId: RowData[k]
                            };
                          }
                        } else {
                          if (RowData[k]) {
                            pointer = {
                              __type: "Pointer",
                              className: localStorage.getItem("extended_class"),
                              objectId: RowData[k]
                            };
                          }
                        }

                        RowData[k] = pointer;
                      }
                      if (val.properties[k].data.FolderTypeValue) {
                        if (RowData[k]) {
                          let obj = {
                            __type: "Pointer",
                            className: val.properties[k].data.ClassName,
                            objectId: RowData[k]
                          };
                          RowData[k] = obj;
                        }
                      }
                    }
                  }
                });
              });
            }
          });
        }
        Object.keys(_scanData).forEach(function (key) {
          let _dd = _scanData[key];
          if (typeof _dd === "object") {
            Object.keys(_dd).forEach(function (k) {
              if (_dd[k].type === "array" && _dd[k].items) {
                let _prop = _dd[k].items.properties;
                if (_prop && Array.isArray(RowData[k])) {
                  let newRow = [];
                  RowData[k].forEach((t) => {
                    let _newObj = t;
                    if (typeof t === "object") {
                      Object.keys(_prop).forEach(function (l) {
                        if (_prop[l].data && _prop[l].data.isPointer) {
                          if (typeof t[l] === "object") {
                            let obj = {
                              __type: "Pointer",
                              className: _prop[l].data.class,
                              objectId: t[l].objectId
                            };
                            _newObj = { ..._newObj, [l]: obj };
                          } else {
                            let obj = {
                              __type: "Pointer",
                              className: _prop[l].data.class,
                              objectId: t[l]
                            };
                            _newObj = { ..._newObj, [l]: obj };
                          }
                        }
                      });
                    }
                    newRow.push(_newObj);
                  });
                  RowData[k] = newRow;
                }
              }

              if (_dd[k].component === "AutoSuggest" && _dd[k].isPointer) {
                if (RowData[k]) {
                  let pointer = {
                    __type: "Pointer",
                    className: _dd[k].class,
                    objectId: RowData[k]
                  };
                  RowData[k] = pointer;
                }
              }
              if (_dd[k].format === "date") {
                let newdate = new Date(RowData[k]);
                RowData[k] = newdate;
              }
              if (_dd[k].component === "HtmlEditor") {
                if (RowData[k]) {
                  let newHtml = RowData[k]
                    .replace(/<p[^>]*>/g, "")
                    .replace(/<\/p>/g, " ");
                  RowData[k] = newHtml;
                }
              }
              if (_dd[k].component === "DateTime") {
                let newDate11;
                if (!RowData[k]) {
                  newDate11 = new Date();
                } else {
                  newDate11 = new Date(RowData[k]);
                }
                RowData[k] = newDate11;
              }
              if (_dd[k].component === "CurrencyInput") {
                if (_dd[k].currencyColumn) {
                  RowData[`${_dd[k].currencyColumn}`] = _dd[k].defaultcurrency;
                }
              }
              if (_dd[k].data !== undefined) {
                if (_dd[k].data.isPointer) {
                  let pointer = undefined;
                  if (RowData[k] && RowData[k] !== "Select") {
                    if (_dd[k].type === "array") {
                      pointer = [];
                      RowData[k] &&
                        RowData[k].forEach((a) => {
                          let _kk = {};
                          if (_dd[k].data.savePointerClass) {
                            _kk = {
                              __type: "Pointer",
                              className: _dd[k].data.savePointerClass,
                              objectId: a
                            };
                          } else {
                            _kk = {
                              __type: "Pointer",
                              className: _dd[k].data.class,
                              objectId: a
                            };
                          }

                          pointer.push(_kk);
                        });
                    } else if (_dd[k].data.class) {
                      if (_dd[k].data.savePointerClass) {
                        if (RowData[k]) {
                          pointer = {
                            __type: "Pointer",
                            className: _dd[k].data.savePointerClass,
                            objectId: RowData[k]
                          };
                        }
                      } else if (RowData[k]) {
                        pointer = {
                          __type: "Pointer",
                          className: _dd[k].data.class,
                          objectId: RowData[k]
                        };
                      }
                    } else {
                      if (RowData[k]) {
                        pointer = {
                          __type: "Pointer",
                          className: localStorage.getItem("extended_class"),
                          objectId: RowData[k]
                        };
                      }
                    }

                    RowData[k] = pointer;
                  }
                }
                if (_dd[k].data.FolderTypeValue) {
                  if (RowData[k]) {
                    let obj = {
                      __type: "Pointer",
                      className: _dd[k].data.ClassName,
                      objectId: RowData[k]
                    };
                    RowData[k] = obj;
                  }
                }
              }
              if (_dd[k].type === "string") {
                let d = RowData[k];
                if (typeof d === "string") {
                  RowData[k] = d.trim();
                }
              }
            });
          }
        });
        Parse.serverURL = this.state.parseBaseUrl;
        Parse.initialize(this.state.parseAppId);
        const currentUser = Parse.User.current();
        let _fname = this.state.title;
        var forms = Parse.Object.extend(_fname);

        var form = new forms();

        form.set("CreatedBy", Parse.User.createWithoutData(currentUser.id));

        if (this.state["FormACL"]) {
          let ACL = {};
          for (let [key, value] of Object.entries(this.state["FormACL"])) {
            if (key === "*") {
              ACL[key] = value;
            }
            if (key === "#currentUser#") {
              ACL[Parse.User.current().id] = value;
            } else if (key.startsWith("#")) {
              let arr = key.split("#");
              let new_arr = arr.filter((x) => x !== "");
              if (new_arr.length === 2) {
                let l = RowData[new_arr[0]];
                try {
                  const Agent = Parse.Object.extend(l.className);
                  const qu = new Parse.Query(Agent);
                  qu.equalTo("objectId", l.objectId);
                  qu.include(new_arr[1]);
                  await qu.first();
                } catch (err) {
                  console.log("Error while fetching Agent", err.massage);
                }
              }
            }
            if (key.startsWith("role")) {
              ACL[key] = value;
            }
          }
          form.setACL(new Parse.ACL(ACL));
        }

        form.save(RowData).then(
          (form) => {
            const parseData = JSON.parse(JSON.stringify(form));
            this.props.details({
              value: parseData[this.props.valueKey],
              label: parseData[this.props.displayKey]
            });
            if (this.props.closePopup) {
              this.props.closePopup();
            }
            let filtered = {};
            if (this.state.redirect_type === "clearData") {
              if (
                this.state.persistentFields &&
                this.state.persistentFields.length
              ) {
                filtered = Object.keys(RowData)
                  .filter((key) => this.state.persistentFields.includes(key))
                  .reduce((obj, key) => {
                    obj[key] = RowData[key];
                    return obj;
                  }, {});
              }
            } else {
              RowData = {};
            }

            this.setState(
              {
                formData: filtered,
                active: true,
                loading: false,
                toastColor: "#5cb85c",
                toastDescription: this.state.successMassage
              },
              () => {
                var x = document.getElementById("snackbar");
                this.props.removeState();
                this.props.removeLevel2State();
                this.props.removeLevel3State();
                x.className = "show";
                setTimeout(function () {
                  x.className = x.className.replace("show", "");
                }, 2000);
              }
            );
          },
          (error) => {
            this.setState({
              loading: false,
              active: true,
              toastColor: "#d9534f",
              toastDescription: error.message
            });

            var x = document.getElementById("snackbar");
            x.className = "show";
            setTimeout(function () {
              x.className = x.className.replace("show", "");
            }, 2000);
          }
        );
      } catch (error) {
        this.setState({
          loading: false,
          active: true,
          toastColor: "#d9534f",
          toastDescription: error.message
        });

        var x = document.getElementById("snackbar");
        x.className = "show";
        setTimeout(function () {
          x.className = x.className.replace("show", "");
        }, 2000);
      }
    }
  };

  componentDidMount() {
    let url = window.location.hash;
    if (url.includes("_app")) {
      this.setState({ isAppRequest: true });
    }
    let id = this.props.id;
    this.getForm(id);
  }

  render() {
    if (localStorage.getItem("accesstoken") === null) {
      return <Navigate to="/" />;
    }
    let schema = this.state.schemaState;
    let uiSchema = this.state.ui_schema;
    let rules = this.state.rules;
    let extraActions = this.state.extraActions;

    let FormToDisplay = applyRules(
      schema,
      uiSchema,
      rules,
      Engine,
      extraActions
    )(Form);
    let formView = (
      <React.Fragment>
        <FormToDisplay
          validate={this.state.noValidate && this.dynamicValidate}
          showErrorList={false}
          widgets={widget}
          fields={fields()}
          formData={this.state.formData}
          liveValidate={this.state.liveValidate}
          onSubmit={this.handleSubmit}
          validator={validator}
        >
          <div>
            {this.state.active && this.state.buttons.submitText ? (
              <button className="btn btn-info submiBtn" type="submit">
                {this.state.buttons.submitText}
              </button>
            ) : (
              this.state.buttons.submitText && (
                <button className="btn submiBtn" type="submit" disabled>
                  {this.state.buttons.submitText}
                </button>
              )
            )}
            &nbsp;&nbsp;
            {this.state.buttons.resetText && (
              <button
                className="btn resetBtn"
                onClick={(e) => {
                  e.preventDefault();
                  this.setState({
                    loading: true,
                    formData: {}
                  });
                  setTimeout(() => {
                    this.setState({ loading: false });
                  }, 1000);
                }}
                type="button"
              >
                {this.state.buttons.resetText}
              </button>
            )}
          </div>
        </FormToDisplay>
      </React.Fragment>
    );

    if (this.state.loading) {
      formView = (
        <div style={{ height: "300px" }}>
          <div
            style={{
              marginLeft: "45%",
              marginTop: "150px",
              fontSize: "45px",
              color: "#3dd3e0"
            }}
            className="loader-37"
          ></div>
        </div>
      );
    }
    return (
      <React.Fragment>
        {/* <Title
          title={
            this.state.schemaState.title ? this.state.schemaState.title : ""
          }
        /> */}
        <ErrorBoundary>
          <div className="row">
            <div className="col-md-12">
              {this.state.help ? (
                <div className="dropdown" style={{ marginTop: "-30px" }}>
                  <i
                    className="far fa-question-circle dropdown-toggle hovereffect"
                    aria-hidden="true"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    style={{
                      fontSize: "18px",
                      color: "purple",
                      cursor: "pointer !important",
                      position: "relative",
                      top: "40px",
                      left: "98%"
                    }}
                  ></i>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                    style={{
                      marginleft: "-121px",
                      margintop: "-14px",
                      position: "absolute",
                      padding: "10px",
                      width: "300px",
                      top: "102px!important"
                    }}
                  >
                    {parse(`
             ${this.state.help}
           `)}
                    <br />
                    {this.state.link ? (
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = this.state.link;
                        }}
                        target="_blank"
                        className="btn btn-xs btn-primary"
                      >
                        Read more..
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div style={{ fontSize: "13px" }}>{formView}</div>
            </div>
          </div>
          <div id="snackbar" style={{ backgroundColor: this.state.toastColor }}>
            {this.state.toastDescription}
          </div>
        </ErrorBoundary>
      </React.Fragment>
    );
  }
}

export default connect(null, {
  removeState,
  removeLevel2State,
  removeLevel3State
})(AppendFormInForm);
