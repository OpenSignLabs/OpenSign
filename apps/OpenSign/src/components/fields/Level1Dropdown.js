import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { onChangeLevel1Dropdown } from "../../redux/actions/index";
import axios from "axios";
import Parse from "parse";
import parse from "html-react-parser";

const Level1Dropdown = (props) => {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [Level1_DD, setLevel1_DD] = useState([]);
  const [toastColor] = useState("#d9534f");
  const [toastDescription, setToastDescription] = useState("");
  const [active, setActive] = useState(false);

  const getParams = (offset) => {
    const params = {
      skip: offset
    };
    return params;
  };

  const Level1DropdownData = async () => {
    try {
      if (
        props.formData &&
        props.uiSchema["ui:disabled"] &&
        props.formData !== "Select"
      ) {
        let url = `${parseBaseUrl}classes/${props.schema.data.class}/${props.formData}`;
        if (typeof props.formData === "object") {
          url = `${parseBaseUrl}classes/${props.schema.data.class}/${props.formData.objectId}`;
        }
        let headers1 = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        };
        let data = [];
        let response = [];
        await axios.get(url, { headers: headers1 }).then((res) => {
          if (res) {
            data.push(res.data);
          }
        });

        if (data.length > 0) {
          let temp = [];
          data.forEach((x) => {
            let opt = "";
            if (Array.isArray(x[props.schema.data.valueKey])) {
              x[props.schema.data.valueKey].forEach((tt) => {
                if (typeof tt === "object") {
                  opt = {
                    objectId: tt[props.schema.data.displayKey],
                    option: tt[props.schema.data.displayKey]
                  };
                } else {
                  opt = {
                    objectId: tt,
                    option: tt
                  };
                }
                temp.push(opt);
              });
            } else if (props.schema.data.isPointer) {
              if (props.schema.data.valueKey.includes(".")) {
                let newArr = props.schema.data.valueKey.split(".");
                if (newArr.length === 2) {
                  opt = {
                    objectId: x[newArr[0]][newArr[1]],
                    option: x[props.schema.data.displayKey]
                  };
                } else {
                  opt = {
                    objectId: x[newArr[0]],
                    option: x[props.schema.data.displayKey]
                  };
                }
              } else {
                opt = {
                  objectId: x[props.schema.data.valueKey],
                  option: x[props.schema.data.displayKey]
                };
              }
              temp.push(opt);
            } else {
              opt = {
                objectId: x[props.schema.data.valueKey],
                option: x[props.schema.data.displayKey]
              };
              temp.push(opt);
            }
          });
          response = temp;
          setLevel1_DD(response);
          setActive(false);
          if (response.length === 1) {
            props.onChangeLevel1Dropdown(response[0].objectId, props.name);
            props.onChange(response[0].objectId);
          } else if (response.length === 0) {
            props.onChangeLevel1Dropdown("", props.name);
            props.onChange("");
          }
        }
      } else {
        let response = [];
        setActive(true);
        Parse.serverURL = parseBaseUrl;
        Parse.initialize(parseAppId);
        const currentUser = Parse.User.current();

        // eslint-disable-next-line
        var reg = /(\#.*?\#)/gi;
        let str = props.schema.data.query;
        var test;
        if (str.includes("#")) {
          let res;
          if (localStorage.getItem("Extand_Class")) {
            let data = JSON.parse(localStorage.getItem("Extand_Class"));
            res = data[0];
          } else {
            var emp = Parse.Object.extend(
              localStorage.getItem("extended_class")
            );
            var q = new Parse.Query(emp);
            q.equalTo("UserId", currentUser);
            res = await q.first();
            if (res) res = res.toJSON();
          }

          if (res) {
            let json = res;
            let output = str.match(reg);
            if (output.length === 1) {
              output = output.join();
              output = output.substring(1, output.length - 1);
              output = output.split(".");
              if (output.length === 1) {
                let out = output[0];
                if (json[out]) {
                  if (typeof json[out] === "object") {
                    test = str.replace(reg, JSON.stringify(json[out]));
                  } else {
                    test = str.replace(reg, json[out]);
                  }
                } else {
                  test = str.replace(reg, currentUser.id);
                }
              } else if (output.length === 2) {
                let out1 = json[output[0]][output[1]];
                if (out1) {
                  test = str.replace(reg, out1);
                }
              }
            } else if (output.length === 2) {
              let output1 = output[0];
              output1 = output1.substring(1, output1.length - 1);
              output1 = output1.split(".");
              if (output1.length === 1) {
                let out = output1[0];
                if (json[out]) {
                  if (typeof json[out] === "object") {
                    str = str.replace(output[0], JSON.stringify(json[out]));
                  } else {
                    str = str.replace(output[0], json[out]);
                  }
                } else {
                  str = str.replace(output[0], currentUser.id);
                }
              } else if (output1.length === 2) {
                let out1 = json[output1[0]][output1[1]];
                if (out1) {
                  str = str.replace(output[0], out1);
                }
              }
              let output2 = output[1];
              output2 = output2.substring(1, output2.length - 1);
              output2 = output2.split(".");
              if (output2.length === 1) {
                let out = output2[0];
                if (json[out]) {
                  if (typeof json[out] === "object") {
                    str = str.replace(output[1], JSON.stringify(json[out]));
                  } else {
                    str = str.replace(output[1], json[out]);
                  }
                } else {
                  str = str.replace(output[1], currentUser.id);
                }
              } else if (output2.length === 2) {
                let out1 = json[output2[0]][output2[1]];
                if (out1) {
                  str = str.replace(output[1], out1);
                }
              }
              test = str;
            }
          } else {
            setToastDescription(
              `User not found in ${localStorage.getItem("extended_class")}`
            );
            setActive(false);
            var x = document.getElementById("Level_1");
            x.className = "show";
            setTimeout(function () {
              x.className = x.className.replace("show", "");
            }, 5000);
            return;
          }
        } else {
          test = str;
        }
        let url = `${parseBaseUrl}classes/${props.schema.data.class}?${test}`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        };
        let fetchCount = 0;
        let offset = 0;
        let data = [];
        /* eslint-disable no-constant-condition */
        while (true) {
          const params = getParams(offset);
          await axios
            .get(url, { params: params, headers: headers })
            .then((response) => {
              fetchCount = response.data.results.length;
              offset += response.data.results.length;

              if (fetchCount > 0) {
                response.data.results.forEach((x) => {
                  data.push(x);
                });
              }
            })
            .catch((err) => {
              console.error("Problem", err.response);
              setToastDescription(err.response.data.message);
              setActive(false);
              var x = document.getElementById("Level_1");
              x.className = "show";
              setTimeout(function () {
                x.className = x.className.replace("show", "");
              }, 5000);
            });
          if (fetchCount === 0 || fetchCount < 100) {
            break;
          }
        }
        if (data.length > 0) {
          let temp = [];
          data.forEach((x) => {
            let opt = "";
            if (Array.isArray(x[props.schema.data.valueKey])) {
              x[props.schema.data.valueKey].forEach((tt) => {
                if (typeof tt === "object") {
                  if (props.schema.data.isPointer) {
                    opt = {
                      objectId: tt["objectId"],
                      option: tt[props.schema.data.displayKey]
                    };
                  } else {
                    opt = {
                      objectId: tt[props.schema.data.displayKey],
                      option: tt[props.schema.data.displayKey]
                    };
                  }
                } else {
                  opt = {
                    objectId: tt,
                    option: tt
                  };
                }
                temp.push(opt);
              });
            } else if (props.schema.data.isPointer) {
              if (props.schema.data.valueKey.includes(".")) {
                let newArr = props.schema.data.valueKey.split(".");
                if (newArr.length === 2) {
                  let _dis = props.schema.data.displayKey.split(".");
                  if (_dis.length === 2) {
                    opt = {
                      objectId: x[newArr[0]][newArr[1]],
                      option: x[_dis[0]][_dis[1]]
                    };
                  } else {
                    opt = {
                      objectId: x[newArr[0]][newArr[1]],
                      option: x[props.schema.data.displayKey]
                    };
                  }
                } else {
                  opt = {
                    objectId: x[newArr[0]],
                    option: x[props.schema.data.displayKey]
                  };
                }
              } else {
                opt = {
                  objectId: x[props.schema.data.valueKey],
                  option: x[props.schema.data.displayKey]
                };
              }
              temp.push(opt);
            } else {
              opt = {
                objectId: x[props.schema.data.valueKey],
                option: x[props.schema.data.displayKey]
              };
              temp.push(opt);
            }
          });
          response = temp;
          setLevel1_DD(response);
          setActive(false);
          if (!props.formData) {
            props.onChangeLevel1Dropdown("", props.name);
          }
          if (response.length === 1) {
            props.onChangeLevel1Dropdown(response[0].objectId, props.name);
            props.onChange(response[0].objectId);
          } else if (response.length === 0) {
            props.onChangeLevel1Dropdown("", props.name);
            props.onChange("");
          }
        } else {
          setActive(false);
        }
      }
    } catch (e) {
      try {
        setToastDescription(e.message);
        setActive(false);
        x = document.getElementById("Level_1");
        x.className = "show";
        setTimeout(function () {
          x.className = x.className.replace("show", "");
        }, 5000);
      } catch (error) {}
    }
  };

  useEffect(() => {
    Level1DropdownData();

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (props.formData && props.formData[`objectId`]) {
      props.onChangeLevel1Dropdown(props.formData.objectId, props.name);
    } else if (props.formData) {
      props.onChangeLevel1Dropdown(props.formData, props.name);
    }

    // eslint-disable-next-line
  }, [props.formData]);

  const selectDefault = () => {
    props.onChange(Level1_DD[0].objectId);
    props.onChangeLevel1Dropdown(Level1_DD[0].objectId, props.name);
  };

  const REQUIRED_FIELD_SYMBOL = "*";
  return (
    <React.Fragment>
      <div style={{ display: "inline-block" }}>
        <label htmlFor={props.name}>
          {props.schema.title}
          {props.required && (
            <span className="required">{REQUIRED_FIELD_SYMBOL}</span>
          )}
          {props.schema.data.helpbody ? (
            <div className="dropdown pull-right">
              <i
                className="far fa-question-circle dropdown-toggle hovereffect pull-right"
                aria-hidden="true"
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                style={{
                  fontSize: "12px",
                  color: "purple",
                  cursor: "pointer !important",
                  position: "relative",
                  bottom: "0px",
                  left: "0px",
                  paddingBottom: "4px",
                  paddingLeft: "4px"
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
                  top: "102px!important"
                }}
              >
                {parse(`
             ${props.schema.data.helpbody}
           `)}
                <br />
                {props.schema.data.helplink ? (
                  <a
                    href={props.schema.data.helplink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-xs btn-primary"
                  >
                    Read more..
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </label>
      </div>

      {Level1_DD && (
        <select
          className="form-control"
          name={props.name}
          value={props.value}
          required={props.required}
          disabled={props.uiSchema["ui:disabled"]}
          onChange={(e) => {
            if (!e.target.value) {
              if (props.schema.data.isPointer) {
                localStorage.setItem("Level1", undefined);
                props.onChangeLevel1Dropdown(undefined, props.name);
                return props.onChange(undefined);
              } else {
                localStorage.setItem("Level1", e.target.value);
                props.onChangeLevel1Dropdown(e.target.value, props.name);
                return props.onChange(e.target.value);
              }
            } else {
              localStorage.setItem("Level1", e.target.value);
              props.onChangeLevel1Dropdown(e.target.value, props.name);
              return props.onChange(e.target.value);
            }
          }}
          readOnly={props.uiSchema["ui:disabled"] ? true : false}
          defaultValue={Level1_DD.length === 1 && selectDefault}
        >
          <option value="">{!active ? "Select" : "loading..."}</option>
          {Level1_DD &&
            Level1_DD.map((x, i) => (
              <React.Fragment key={i}>
                {props.formData && props.formData.objectId ? (
                  props.formData.objectId === x.objectId ? (
                    <option value={x.objectId} selected>
                      {x.option}
                    </option>
                  ) : (
                    <option value={x.objectId}>{x.option}</option>
                  )
                ) : props.formData && props.formData === x.objectId ? (
                  <option value={x.objectId} selected>
                    {x.option}
                  </option>
                ) : (
                  <option value={x.objectId}>{x.option}</option>
                )}
              </React.Fragment>
            ))}
        </select>
      )}
      <div id="Level_1" style={{ backgroundColor: toastColor }}>
        {toastDescription}
      </div>
    </React.Fragment>
  );
};

export default connect(null, { onChangeLevel1Dropdown })(Level1Dropdown);
