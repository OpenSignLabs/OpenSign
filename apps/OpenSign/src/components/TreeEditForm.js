import React, { useState, useEffect } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import Parse from "parse";
import "../styles/loader.css";
import LayoutField from "./fields/Rjsf-layout";
import TimeWidget from "./fields/TimeWidget";
import Level1Dropdown from "./fields/Level1Dropdown";
import HiddenField from "./fields/HiddenField";
import MultiSelectField from "./fields/MultiSelectField";
import TreeWidget from "../components/TreeWidget";
import { formJson } from "../json/FormJson";
const TreeEditForm = (props) => {
  const widget = {
    TimeWidget: TimeWidget
  };
  const fields = {
    layout: LayoutField,
    Level1Dropdown: Level1Dropdown,
    HiddenField: HiddenField,
    MultiSelectField: MultiSelectField,
    FolderComponent: TreeWidget
  };

  const [schema, setschema] = useState({});
  const [ui_schema, setui_schema] = useState({});
  const [title, settitle] = useState("");
  const [schemaState, setschemaState] = useState({});
  const [formData, setformData] = useState({});
  const [active, setactive] = useState(true);
  const [loading, setloading] = useState(false);
  const [_validate, set_validate] = useState(null);
  const [noValidate, setnoValidate] = useState(false);
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));

  const getForm = async (id) => {
    setloading(true);
    try {
      //get json form data (schema ,uischema)
      const results = formJson(id);
      try {
        let _record = Parse.Object.extend(results.class);
        var query1 = new Parse.Query(_record);
        await query1.get(props.objectId).then(
          (x) => {
            try {
              if (x) {
                let result = x.toJSON();
                let new_result = result;
                for (let [key, value] of Object.entries(result)) {
                  if (value["__type"] === "Date") {
                    let todayTime1 = new Date(value.iso);
                    var month = String(todayTime1.getMonth() + 1);
                    var day = String(todayTime1.getDate());
                    var year = String(todayTime1.getFullYear());
                    if (month.length < 2) month = "0" + month;
                    if (day.length < 2) day = "0" + day;
                    let date1 = year + "-" + month + "-" + day;
                    let bindVar = date1;
                    if (!results.jsonSchema.properties[key].format) {
                      bindVar = todayTime1.toISOString();
                    }
                    new_result[key] = bindVar;
                  }
                }
                setschemaState(results.jsonSchema);
                setformData(new_result);
              }
            } catch (error) {
              //alert(error.message);

              setloading(false);
            }
          },
          (error) => {
            setloading(false);
          }
        );
        setschema(results.jsonSchema);
        setui_schema(results.uiSchema);
        set_validate(results.validFunction);
        setnoValidate(results.noValidate);
        settitle(results.class);
        setloading(false);
        setactive(true);
      } catch (error) {
        setloading(false);
      }
    } catch (e) {
      setloading(false);
      console.error("Problem", e);
    }
  };

  const wrap = (s) => "{ return " + s + " };";

  const dynamicValidate = (formData, errors) => {
    try {
      let body = atob(_validate);
      let res = new Function(wrap(body))
        .call(null)
        .call(null, formData, errors);
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async ({ formData }) => {
    setactive(false);
    setloading(true);
    let RowData = formData;
    RowData &&
      Object.entries(RowData).forEach(([key, value]) => {
        if (typeof value === "string") {
          RowData[key] = value.trim();
        }
      });
    let _scanData = schemaState;
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
                  if (Array.isArray(val.properties[k].data)) {
                  } else if (val.properties[k].data.isPointer) {
                    let pointer = undefined;
                    if (val.properties[k].data.class) {
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
    let temp = [];

    let _dd = _scanData.properties;
    let allowed = [];
    if (_dd) {
      Object.keys(_dd).forEach(function (k) {
        allowed.push(k);
        if (RowData[k]) {
          let pointer = {
            __type: "Pointer",
            className: _dd[k].class,
            objectId: RowData[k]
          };
          RowData[k] = pointer;
        }
        if (_dd[k].format === "date") {
          if (RowData[k]) {
            let newdate = new Date(RowData[k]);
            if (!isNaN(newdate.getTime())) {
              RowData[k] = newdate;
            }
          }
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
          if (RowData[k]) {
            let newdate = new Date(RowData[k]);
            if (!isNaN(newdate.getTime())) {
              RowData[k] = newdate;
            }
          }
        }
        if (_dd[k].format === "date-time") {
          let newdate = new Date(RowData[k]);
          RowData[k] = newdate;
        }
        if (_dd[k].component === "CurrencyInput") {
          if (_dd[k].currencyColumn) {
            RowData[`${_dd[k].currencyColumn}`] = _dd[k].defaultcurrency;
          }
        }
        if (_dd[k].data !== undefined) {
          if (_dd[k].data[0] !== undefined) {
          } else if (_dd[k].data.isPointer) {
            let pointer = undefined;
            if (typeof RowData[k] === "object") {
              if (RowData[k]) {
                if (RowData[k].objectId !== "Select") {
                  let obj = {
                    __type: "Pointer",
                    className: RowData[k].className,
                    objectId: RowData[k].objectId
                  };
                  pointer = obj;
                }
              }
            } else if (_dd[k].data.class) {
              if (RowData[k]) {
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
          if (typeof RowData[k] === "string") RowData[k] = RowData[k].trim();
        }
      });
    }
    const filtered = Object.keys(RowData)
      .filter((key) => allowed.includes(key))
      .reduce((obj, key) => {
        obj[key] = RowData[key];
        return obj;
      }, {});

    try {
      Parse.serverURL = parseBaseUrl;
      Parse.initialize(parseAppId);
      const currentUser = Parse.User.current();
      if (temp.length !== 0) {
        let userPointer = {
          __type: "Pointer",
          className: "_User",
          objectId: currentUser.id
        };
        filtered[[temp[0]]] = userPointer;
      }
      var data = Parse.Object.extend(title);
      var query = new Parse.Query(data);
      query.get(props.objectId).then(async (object) => {
        object.save(filtered).then(
          () => {
            try {
              alert("Record updated successfully");
              props.HideView(false);
              setloading(false);
              setactive(true);
            } catch (error) {}
          },
          (error) => {
            setloading(false);
            setactive(true);
          }
        );
      });
    } catch (error) {
      alert(error.message);
      setloading(false);
      setactive(true);
    }
  };

  useEffect(() => {
    if (props.FormId) {
      getForm(props.FormId);
    }
    // eslint-disable-next-line
  }, [props.FormId]);

  if (loading) {
    return (
      <div
        className="loader-01"
        style={{
          marginTop: "50px",
          marginLeft: "50%",
          color: "rgb(0,28,28)",
          fontSize: "35px"
        }}
      ></div>
    );
  }
  return (
    <Form
      schema={schema}
      uiSchema={ui_schema}
      formData={formData}
      showErrorList={false}
      widgets={widget}
      fields={fields}
      validate={noValidate && dynamicValidate}
      onSubmit={handleSubmit}
      validator={validator}
    >
      <div>
        {active ? (
          <button className="btn btn-info pull-right" type="submit">
            Update
          </button>
        ) : (
          <button className="btn btn-info" type="submit" disabled>
            Update
          </button>
        )}
      </div>
    </Form>
  );
};

export default TreeEditForm;
