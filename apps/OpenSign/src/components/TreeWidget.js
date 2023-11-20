import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import LabelField from "./fields/LabelField";
import Parse from "parse";
import axios from "axios";
import "../styles/spinner.css";
import TreeFormComponent from "./TreeFormComponent";
import TreeEditForm from "./TreeEditForm";
import "../styles/modal.css";
import Modal from "react-modal";

const TreeWidget = (props) => {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [isAddField, setIsAddField] = useState(false);
  const [folderList, setFolderList] = useState([]);
  const [tabList, setTabList] = useState([]);
  const [appId, setAppId] = useState(undefined);
  const [selectedFolder, setSelectedFolder] = useState(undefined);
  const [loader, setLoader] = useState(false);
  const [className, setClassName] = useState("");
  const [schemaState, setSchemaState] = useState({});
  const [TabURL, setTabURL] = useState("");
  const [editable, setEditable] = useState(false);
  const [editId, setEditId] = useState("");
  const [defaultState, setDefaultState] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const selectFolderHandle = async () => {
    setIsShowModal(true);
    setIsAddField(false);
    setDefaultState(false);
    setFolderList([]);
    setLoader(true);

    if (tabList.length > 0) {
      let len = tabList.length - 1;
      selectedItemList(tabList[len]);
    } else {
      try {
        var test;
        if (props.schema.parent) {
          try {
            if (props.parent[props.schema.parent]) {
              Parse.serverURL = parseBaseUrl;
              Parse.initialize(parseAppId);
              const currentUser = Parse.User.current();
              let res;
              if (localStorage.getItem("Extand_Class")) {
                let data = JSON.parse(localStorage.getItem("Extand_Class"));
                res = data[0];
              } else {
                res = await Parse.Cloud.run("getUserDetails", {
                  email: currentUser.get("email")
                });
                if (res) res = res.toJSON();
              }
              if (res) {
                let json = res;
                setAppId(json.AppId);
              }
              // eslint-disable-next-line
              let reg = /(\#.*?\#)/gi;
              let str = props.schema.data.Query;
              if (str.includes("#")) {
                test = str.replace(reg, props.parent[props.schema.parent]);
              } else {
                test = str;
              }
            } else {
              if (props.child[props.schema.parent]) {
                Parse.serverURL = parseBaseUrl;
                Parse.initialize(parseAppId);
                const currentUser = Parse.User.current();
                let res;
                if (localStorage.getItem("Extand_Class")) {
                  let data = JSON.parse(localStorage.getItem("Extand_Class"));
                  res = data[0];
                } else {
                  res = await Parse.Cloud.run("getUserDetails", {
                    email: currentUser.get("email")
                  });
                  if (res) res = res.toJSON();
                }

                if (res) {
                  let json = res;
                  setAppId(json.AppId);
                }
                // eslint-disable-next-line
                let reg = /(\#.*?\#)/gi;
                let str = props.schema.data.Query;
                if (str.includes("#")) {
                  test = str.replace(reg, props.child[props.schema.parent]);
                } else {
                  test = str;
                }
              } else {
                alert(`Please select ${props.schema.parent}`);
                setLoader(false);
                return;
              }
            }
          } catch (error) {
            console.log("error ", error);
          }
        } else {
          Parse.serverURL = parseBaseUrl;
          Parse.initialize(parseAppId);
          const currentUser = Parse.User.current();
          // eslint-disable-next-line
          let reg = /(\#.*?\#)/gi;
          let str = props.schema.data.Query;
          let res;
          if (localStorage.getItem("Extand_Class")) {
            let data = JSON.parse(localStorage.getItem("Extand_Class"));
            res = data[0];
          } else {
            // emp = Parse.Object.extend(localStorage.getItem("extended_class"));
            // q = new Parse.Query(emp);
            // q.equalTo("UserId", currentUser);
            // res = await q.first();
            // if (res) res = res.toJSON();
            const currentUser = Parse.User.current();
            res = await Parse.Cloud.run("getUserDetails", {
              email: currentUser.get("email")
            });
            if (res) res = res.toJSON();
          }

          if (res) {
            let json = res;
            setAppId(json.AppId);
          }
          if (str.includes("#")) {
            if (res) {
              let json = res.toJSON();
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
              }
            }
          } else {
            test = str;
          }
        }

        let url = `${parseBaseUrl}classes/${props.schema.data.ClassName}?${test}`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        };
        await axios
          .get(url, { headers: headers })
          .then((res) => {
            if (res) {
              setFolderList(res.data.results);
              setLoader(false);
            }
          })
          .catch((err) => {
            setLoader(false);
            console.log(err);
          });
      } catch (error) {
        setLoader(false);
      }
    }
  };

  const selectedItemList = async (folder) => {
    setLoader(true);
    setFolderList([]);
    try {
      let url = `${parseBaseUrl}classes/${props.schema.data.ClassName}?where={"${props.schema.data.ParentFolderField}":{"__type":"Pointer","className":"${props.schema.data.ClassName}","objectId":"${folder.objectId}"}}`;
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId,
        "X-Parse-Session-Token": localStorage.getItem("accesstoken")
      };
      await axios.get(url, { headers: headers }).then((result) => {
        if (result) {
          setFolderList(result.data.results);
          setLoader(false);
        }
      });
    } catch (error) {
      setLoader(false);
    }
  };

  const removeTabListItem = async (e, i) => {
    e.preventDefault();
    setEditable(false);
    setLoader(true);
    setFolderList([]);
    let list = tabList.filter((itm, j) => {
      if (j <= i) {
        return itm;
      }
    });
    setTabList(list);
    setIsAddField(false);
    try {
      let _len = list.length - 1;
      let url = `${parseBaseUrl}classes/${props.schema.data.ClassName}?where={"${props.schema.data.ParentFolderField}":{"__type":"Pointer","className":"${props.schema.data.ClassName}","objectId":"${list[_len].objectId}"}}`;
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId,
        "X-Parse-Session-Token": localStorage.getItem("accesstoken")
      };
      await axios.get(url, { headers: headers }).then((result) => {
        if (result) {
          setFolderList(result.data.results);
          setLoader(false);
        }
        setLoader(false);
      });
    } catch (error) {
      setLoader(false);
    }
  };

  const onDeleteFolder = async (e) => {
    e.preventDefault();
    if (folderList.length > 0) {
      alert(
        "Folder should not delete. To delete first delete sub items in it."
      );
    } else if (window.confirm(`Are you sure you want to delete this record`)) {
      try {
        setLoader(true);
        let len = tabList.length - 1;

        Parse.serverURL = parseBaseUrl;
        Parse.initialize(parseAppId);
        var deleted = Parse.Object.extend(props.schema.data.ClassName);
        var query = new Parse.Query(deleted);
        await query.get(tabList[len].objectId).then(
          (del) => {
            del.destroy().then(
              (y) => {
                if (y) {
                  setLoader(false);
                  let list = tabList.filter((itm, j) => {
                    if (j !== len) return itm;
                  });
                  setTabList(list);
                  if (list.length > 0) {
                    let len = list.length - 1;
                    selectedItemList(list[len]);
                  } else {
                    selectFolderHandle();
                  }
                  alert("Folder deleted successfully.");
                }
              },
              (error) => {
                alert(error.message);
                setLoader(false);
              }
            );
          },
          (error) => {
            console.log("error ", error);
            // The object was not retrieved successfully.
            setLoader(false);
          }
        );
      } catch (error) {
        setLoader(false);
        console.log(error);
      }
    }
  };

  const onSubmitResult = async (e) => {
    setIsShowModal(false);
    e.preventDefault();
    //console.log("tabList ", tabList);
    if (tabList.length > 0) {
      try {
        let len = tabList.length - 1;
        setSelectedFolder({
          Topic: tabList[len][`${props.schema.data.FolderNameField}`],
          description: tabList[len][`${props.schema.data.FolderDescription}`]
        });
        props.onChange(tabList[len]["objectId"]);
        let url = "Folders";
        tabList.forEach((t) => {
          url = url + " / " + t[`${props.schema.data.FolderNameField}`];
        });
        setTabURL(url);
        setIsAddField(false);
        if (!props.formData) {
          setTabList([]);
        }
      } catch (error) {
        setIsAddField(false);
        alert(error.message);
      }
    } else {
      setIsAddField(false);
    }
  };

  const editFolderDisplay = async (formData) => {
    try {
      let objectId = formData.objectId;
      let className = formData.className;
      Parse.serverURL = parseBaseUrl;
      Parse.initialize(parseAppId);
      const fldr = Parse.Object.extend(className);
      let query = new Parse.Query(fldr);
      query.equalTo("objectId", objectId);
      const result = await query.first();
      let resultJson = result.toJSON();
      let CustomTabList = [];
      if (resultJson) {
        CustomTabList.push(resultJson);
        if (resultJson[`${props.schema.data.ParentFolderField}`]) {
          let tabsRes = resultJson[`${props.schema.data.ParentFolderField}`];
          let looping = false;
          do {
            let fldttr = Parse.Object.extend(tabsRes.className);
            let query2 = new Parse.Query(fldttr);
            query2.equalTo("objectId", tabsRes.objectId);
            let custome_res = await query2.first();
            if (custome_res) {
              let tabsData = custome_res.toJSON();
              CustomTabList.push(tabsData);
              if (tabsData[`${props.schema.data.ParentFolderField}`]) {
                tabsRes = tabsData[`${props.schema.data.ParentFolderField}`];
                looping = true;
              } else {
                looping = false;
              }
            }
          } while (looping);
        }
        let url = "Folders";
        CustomTabList.length > 0 &&
          CustomTabList.reverse().forEach(
            (t) => (url = url + " / " + t[props.schema.data.FolderNameField])
          );
        setTabURL(url);
        setSelectedFolder({
          Topic: resultJson[`${props.schema.data.FolderNameField}`],
          description: resultJson[`${props.schema.data.FolderDescription}`]
        });
        setTabList(CustomTabList);
        props.onChange(resultJson.objectId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async ({ formData }) => {
    setLoader(true);

    try {
      let RowData = formData;
      let _scanData = schemaState;
      Object.keys(_scanData).forEach(function (key) {
        let _dd = _scanData[key];
        Object.keys(_dd).forEach(function (k) {
          if (_dd[k].component === "AutoSuggest" && _dd[k].isPointer) {
            let pointer = {
              __type: "Pointer",
              className: _dd[k].class,
              objectId: RowData[k]
            };
            RowData[k] = pointer;
          }
          if (_dd[k].format === "date") {
            let newdate = new Date(RowData[k]);
            RowData[k] = newdate;
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
              let pointer = {};
              if (RowData[k] && RowData[k] !== "Select") {
                if (_dd[k].data.class) {
                  if (RowData[k]) {
                    pointer = {
                      __type: "Pointer",
                      className: _dd[k].data.class,
                      objectId: RowData[k]
                    };
                  }
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
              let obj = {
                __type: "Pointer",
                className: _dd[k].data.ClassName,
                objectId: RowData[k]
              };
              RowData[k] = obj;
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

      Parse.serverURL = parseBaseUrl;
      Parse.initialize(parseAppId);

      var forms = Parse.Object.extend(className);
      var folder = new forms();
      folder.set(
        props.schema.data.FolderNameField,
        formData[props.schema.data.FolderNameField]
      );
      if (props.schema.data.FolderDescription) {
        folder.set(
          props.schema.data.FolderDescription,
          formData[props.schema.data.FolderDescription]
        );
      }

      folder.set("AppId", appId);
      folder.set(
        props.schema.data.FolderTypeField,
        props.schema.data.FolderTypeValue
      );
      if (tabList.length > 0) {
        let len = tabList.length - 1;
        folder.set(props.schema.data.ParentFolderField, {
          __type: "Pointer",
          className: props.schema.data.ClassName,
          objectId: tabList[len]["objectId"]
        });
      }
      folder.save(RowData).then(
        (result) => {
          RowData = {};
          if (result) {
            setIsAddField(false);
            setLoader(false);
            if (tabList.length > 0) {
              let len = tabList.length - 1;
              selectedItemList(tabList[len]);
            } else {
              selectFolderHandle();
            }
          }
        },
        (error) => {
          console.log("error ", error);
          setLoader(false);
        }
      );
    } catch (error) {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (props.formData) {
      editFolderDisplay(props.formData);
    }

    // eslint-disable-next-line
  }, [props.formData]);

  useEffect(() => {
    if (defaultState) {
      selectFolderHandle();
    }

    // eslint-disable-next-line
  }, [defaultState]);
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: 0
    },
    overlay: {
      width: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      zIndex: 50
    }
  };

  return (
    <React.Fragment>
      <LabelField
        Title={props.schema.title}
        Name={props.name}
        Required={props.required}
        HelpBody={props.schema.helpbody}
        HelpLink={props.schema.helplink}
      />
      <br />
      <div className="block max-w-sm  bg-white border border-gray-200  shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
        <div
          style={{
            display: "flex",
            color: "black",
            fontWeight: "bold",
            fontSize: "13px",
            padding: "2%",
            alignItems: "center"
          }}
        >
          <div style={{ width: "20%" }}>
            <div
              className="pull-left"
              title="Select Folder"
              style={{
                color: "#33bbff",
                margin: "auto",
                padding: "10px 10px",
                textAlign: "center"
              }}
            >
              <i
                className="far fa-folder-open"
                style={{ fontSize: "40px" }}
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <div style={{ margin: "0px 10px 0 20px", width: "80%" }}>
            <div>
              {selectedFolder && selectedFolder.Topic
                ? selectedFolder.Topic
                : "Root"}
              <i
                className="fa fa-pencil"
                title="Select Folder"
                style={{ fontSize: 17, cursor: "pointer", marginLeft: 12 }}
                onClick={selectFolderHandle}
              ></i>
              {selectedFolder && (
                <a
                  className="pull-right"
                  onClick={() => {
                    setSelectedFolder(undefined);
                    setTabURL(undefined);
                    props.onChange(undefined);
                  }}
                >
                  <i
                    className="fa fa-times-circle-o"
                    aria-hidden="true"
                    style={{ fontSize: 17 }}
                  ></i>
                </a>
              )}
            </div>
            {TabURL && (
              <div
                style={{ fontSize: "10px", color: "gray", fontWeight: "bold" }}
              >
                ({TabURL})
              </div>
            )}
          </div>
        </div>
      </div>
      {/* save document in folder and add new folder modal */}
      <Modal
        isOpen={isShowModal}
        onRequestClose={() => setIsShowModal(false)}
        shouldCloseOnOverlayClick={false}
        contentLabel="Modal"
        style={customStyles}
      >
        <div className="w-full min-w-[300px] md:min-w-[500px]">
          {/* header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(203, 200, 200, 0.09)"
            }}
          >
            <div style={{ padding: "10px" }}>
              <h4 className=" text-black">Select Folder</h4>
            </div>
            <div style={{ padding: "10px" }}>
              <button
                className="btn btn-sm pull-right"
                data-dismiss="modal"
                title="Select Folder"
                style={{
                  width: "auto",
                  backgroundColor: "white",
                  border: "1px solid  gray",
                  boxshadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px"
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsAddField(false);
                  setFolderList([]);
                  setEditable(false);
                  if (!props.formData) {
                    setTabList([]);
                  }
                  setIsShowModal(false);
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
          </div>
          <hr />
          {/* body */}
          <div className="p-3 space-y-6">
            <div
              style={{
                color: "#ac4848",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              <a
                onClick={() => {
                  setTabList([]);
                  setIsAddField(false);
                  setDefaultState(true);
                  setEditable(false);
                }}
              >
                Folders
              </a>
              {" / "}

              {tabList &&
                tabList.map((tab, i) => (
                  <React.Fragment key={`${tab.objectId}-${i}`}>
                    <a
                      title={tab[`${props.schema.data.FolderNameField}`]}
                      onClick={(e) => removeTabListItem(e, i)}
                    >
                      {tab[`${props.schema.data.FolderNameField}`]}
                    </a>
                    {" / "}
                  </React.Fragment>
                ))}
              <hr />
            </div>
            {editable && (
              <TreeEditForm
                FormId={props.schema.data.FormId}
                objectId={editId}
                HideView={(cl) => {
                  setEditable(cl);
                  selectFolderHandle();
                }}
              />
            )}
            {isAddField && !loader && !editable && (
              <TreeFormComponent
                Id={props.schema.data.FormId}
                handleSubmit={handleSubmit}
                ParentField={props.schema.parent && props.schema.parent}
                ParentValue={props.schema.parent && props.parent}
                ChildField={props.child && props.child}
                ClassName={(cls) => setClassName(cls)}
                SchemaState={(cls) => setSchemaState(cls)}
              />
            )}
            {loader && (
              <div
                className="loader-01"
                style={{
                  marginTop: "50px",
                  marginLeft: "50%",
                  color: "rgb(0,28,28)",
                  fontSize: "35px"
                }}
              ></div>
            )}

            {!isAddField && !editable && (
              <div
                style={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  marginTop: "5px"
                }}
              >
                <ul>
                  {folderList &&
                    folderList.map(
                      (fldr) =>
                        fldr[props.schema.data.FolderTypeField] ===
                          props.schema.data.FolderTypeValue && (
                          <li
                            key={`${fldr.objectId}`}
                            style={{
                              listStyle: "none",
                              padding: "10px 20px",
                              textTransform: "capitalize",
                              fontWeight: 300,
                              border: "1px solid gray",
                              borderRadius: "1px",
                              marginTop: "8px",
                              transition: "all 0.75s ease",
                              WebkitTransition: "all 0.5s ease",
                              MozTransition: "all 0.5s ease",
                              MsTransition: "all 0.5s ease",
                              OTransition: "all 0.5 ease",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between"
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center"
                              }}
                            >
                              <i
                                className={"fa fa-folder"}
                                style={{
                                  fontSize: "1.4rem",
                                  color: "skyblue"
                                }}
                                aria-hidden="true"
                              ></i>
                              <a
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "12px",
                                  marginLeft: "4px",
                                  cursor: "pointer"
                                }}
                                onClick={() => {
                                  setTabList((tabs) => tabs.concat(fldr));
                                  selectedItemList(fldr);
                                }}
                              >
                                {fldr[`${props.schema.data.FolderNameField}`]}
                              </a>
                            </div>

                            {fldr[props.schema.data.FolderTypeField] ===
                              props.schema.data.FolderTypeValue && (
                              <a
                                className="float-right"
                                onClick={() => {
                                  setEditable(true);
                                  setEditId(fldr.objectId);
                                }}
                              >
                                <i
                                  className={"fa fa-pencil"}
                                  title={"Edit Folder"}
                                  style={{
                                    fontSize: "0.9rem",
                                    color: "purple",
                                    cursor: "pointer"
                                  }}
                                  aria-hidden="true"
                                ></i>
                              </a>
                            )}
                          </li>
                        )
                    )}
                </ul>
              </div>
            )}
          </div>
          {/* footer */}

          <div className="flex items-center p-3 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600 justify-between">
            <button
              className="btn btn-sm float-left  createFolder"
              title="Create New Folder"
              onClick={(e) => {
                e.preventDefault();
                setIsAddField(true);
              }}
            >
              {" "}
              <i
                className="fa fa-plus"
                style={{ fontSize: "1.5rem" }}
                aria-hidden="true"
              ></i>
            </button>
            {!isAddField && !editable && (
              <div className="flex">
                {tabList.length > 0 && (
                  <button
                    className="btn btn-sm float-right deleteFolder"
                    title="Delete Folder"
                    onClick={onDeleteFolder}
                  >
                    {" "}
                    <i
                      className="fa fa-trash"
                      style={{ fontSize: "1rem" }}
                      aria-hidden="true"
                    ></i>
                  </button>
                )}
                <button
                  className="btn btn-sm float-right saveFolder"
                  title="Save Here"
                  onClick={onSubmitResult}
                >
                  {" "}
                  {/* <i
                    className="fa fa-floppy-o"
                    style={{ fontSize: "2rem" }}
                    aria-hidden="true"
                  ></i> */}
                  <i
                    className="fas fa-save"
                    aria-hidden="true"
                    style={{ fontSize: "20px" }}
                  ></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    parent: state.Level1_Dropdown,
    child: state.Level2_Dropdown
  };
};

export default connect(mapStateToProps)(TreeWidget);
