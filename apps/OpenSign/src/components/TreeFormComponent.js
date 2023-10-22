import React, { useEffect, useState } from "react";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import LayoutField from "./fields/Rjsf-layout";
import Level1Dropdown from "./fields/Level1Dropdown";
import HiddenField from "./fields/HiddenField";
import MultiSelectField from "./fields/MultiSelectField";
import "../styles/loader.css";
import "../styles/form.css";
import FileUpload from "./fields/FileUpload";
import parse from "html-react-parser";
import TimeWidget from "./fields/TimeWidget";
import { formJson } from "../json/FormJson";
function TreeFormComponent(props) {
  const widget = {
    TimeWidget: TimeWidget
  };

  const fields = {
    layout: LayoutField,
    FileUpload: FileUpload,
    Level1Dropdown: Level1Dropdown,
    HiddenField: HiddenField,
    MultiSelectField: MultiSelectField
  };

  const [link, setLink] = useState("");
  const [help, setHelp] = useState("");
  const toastDescription = "";
  const toastColor = "#5cb85c";
  const [loading, setLoding] = useState(true);
  const [schemaState, setSchemaState] = useState({});
  const [formData, setFormData] = useState({});
  const [ui_schema, setUi_schema] = useState({});
  const active = true;

  console.log("new form", props);

  const getForm = async (id) => {
    setLoding(true);
    try {
      // get json from data(jsonschema, uischema)
      const results = formJson(id);
      //   console.log("result", results);
      if (results) {
        let parentObject = {},
          childObject = {};
        const resultjson = results;
        for (let [key, value] of Object.entries(
          resultjson.jsonSchema.properties
        )) {
          if (key === props.ParentField) {
            if (props.ParentValue[key]) {
              parentObject = { [key]: props.ParentValue[key] };
            }
          } else {
            if (props.ParentValue && typeof props.ParentValue === "object") {
              Object.entries(props.ParentValue).forEach(([k, value]) => {
                if (k === key) {
                  let newO = { [k]: value };
                  parentObject = { ...parentObject, ...newO };
                }
              });
            }
          }
          if (props.ChildField) {
            Object.entries(props.ChildField).forEach(([k, value]) => {
              if (k === key) {
                let newO = { [k]: value };
                childObject = { ...childObject, ...newO };
              }
            });
          }

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
            }
          }
        }
        if (props.ParentField) {
          setFormData({ ...parentObject, ...childObject });
        }

        let txt, link;
        if (resultjson.help) {
          if (resultjson.help.htmlbody) {
            txt = resultjson.help.htmlbody;
          }
          if (resultjson.help.link) {
            link = resultjson.help.link;
          }
        }
        setHelp(txt);
        setLink(link);

        props.ClassName(resultjson.class);
        props.SchemaState(resultjson.jsonSchema);
        setSchemaState(resultjson.jsonSchema);
        setUi_schema(resultjson.uiSchema);
        setLoding(false);
      } else {
        alert("form not found");
        setLoding(false);
      }
    } catch (e) {
      console.error("Problem", e);
      setLoding(false);
    }
  };

  useEffect(() => {
    if (!props.IsEdit) {
      getForm(props.Id);
    }
    // console.log("props tree", props);
    // eslint-disable-next-line
  }, []);

  let formView = (
    <React.Fragment>
      <Form
        schema={schemaState}
        uiSchema={ui_schema}
        showErrorList={false}
        widgets={widget}
        fields={fields}
        formData={formData}
        onSubmit={props.handleSubmit}
        validator={validator}
      >
        {active ? (
          <button className="btn btn-info submiBtn" type="submit">
            {props.IsEdit ? "update folder" : "create folder"}
          </button>
        ) : (
          <button className="btn btn-info submiBtn " type="submit" disabled>
            submitting...
          </button>
        )}
      </Form>
    </React.Fragment>
  );

  if (loading) {
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
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-body no-padding height-9">
              {help ? (
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
             ${help}
           `)}
                    <br />
                    {link ? (
                      <a
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = link;
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
        </div>
      </div>
      <div id="snackbar" style={{ backgroundColor: toastColor }}>
        {toastDescription}
      </div>
    </React.Fragment>
  );
}

export default TreeFormComponent;
