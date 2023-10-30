import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import Select from "react-select";
import axios from "axios";
import LabelField from "./LabelField";
import ReactDragListView from "react-drag-listview";
import AppendFormInForm from "../AppendFormInForm";
import Modal from "react-modal";
function arrayMove(array, from, to) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
  return array;
}

/**
 * react-sortable-hoc is depcreated not usable from react 18.x.x
 *  need to replace it with @dnd-kit
 * code changes required
 */

const MultiSelectField = (props) => {
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [state, setState] = useState(undefined);
  // const [editFormData, setEditFormData] = useState([]);
  const [selected, setSelected] = React.useState([]);
  const [isModal, setIsModel] = useState(false);
  const onChange = (selectedOptions) => setSelected(selectedOptions);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const newValue = arrayMove(selected, oldIndex, newIndex);
    setSelected(newValue);
  };
  //  console.log("props",props)
  const GetSelectListData = async () => {
    try {
      let response = [];
      let str = props.schema.data.query;
      let _query;
      /* eslint-disable no-useless-escape */
      let reg = /(\#.*?\#)/gi;
      let extclass =
        localStorage.getItem("Extand_Class") &&
        JSON.parse(localStorage.getItem("Extand_Class"));
      let extRow = extclass.length && extclass[0];
      if (str.includes("#")) {
        let output = str.match(reg);
        output = output.join();
        output = output.substring(1, output.length - 1);
        output = output.split(".");

        if (output.length === 2) {
          let out1 = extRow[output[0]][output[1]];
          _query = str.replace(reg, out1 && out1);
        } else {
          let out1 = extRow[output[0]];
          _query = str.replace(reg, out1 && out1);
        }
      } else {
        _query = str;
      }
      let url = `${parseBaseUrl}classes/${props.schema.data.class}?${_query}`;
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": parseAppId,
        "X-Parse-Session-Token": localStorage.getItem("accesstoken")
      };
      await axios.get(url, { headers: headers }).then((res) => {
        let temp = [];
        let formArray = [];
        let _selected = [];
        if (props.schema.uiLayout === "MultiDropdownList") {
          if (props.formData) {
            props.formData.forEach((x) => {
              if (typeof x === "object") {
                formArray.push(x.objectId);
              } else {
                formArray.push(x);
              }
            });
          }
          res.data.results.forEach((x) => {
            let obj = {};
            if (formArray.includes(x[props.schema.data.valueKey])) {
              obj = {
                name: x[props.schema.data.displayKey],
                value: x[props.schema.data.valueKey],
                isChecked: true
              };
            } else {
              if (props.schema.selectAll) {
                obj = {
                  name: x[props.schema.data.displayKey],
                  value: x[props.schema.data.valueKey],
                  isChecked: true
                };
              } else {
                obj = {
                  name: x[props.schema.data.displayKey],
                  value: x[props.schema.data.valueKey],
                  isChecked: false
                };
              }
            }
            temp.push(obj);
          });
          response = temp;
          if (props.formData) {
            let checkData = [];
            response.forEach((x) => {
              if (x.isChecked) {
                checkData.push(x.value);
              }
            });
            setSelected(checkData);
          }
          setState({ [`${props.name}_DD`]: response });
        } else {
          res.data.results.forEach((x) => {
            let obj = {};
            if (props.formData) {
              props.formData.forEach((x) => {
                if (typeof x === "object") {
                  formArray.push(x.objectId);
                } else {
                  formArray.push(x);
                }
              });
            }

            obj = {
              label: x[props.schema.data.displayKey],
              value: x[props.schema.data.valueKey]
            };
            if (formArray.includes(x[props.schema.data.valueKey])) {
              _selected.push(obj);
            }
            if (props.schema.selectAll) {
              _selected.push(obj);
            }
            temp.push(obj);
          });
          response = temp;
          setState({ [`${props.name}_DD`]: response });
          setSelected(_selected);
        }
      });
    } catch (error) {
      console.log("err", error);
    }
  };

  const handleCheckChieldElement = (event) => {
    let SelectLists = state[`${props.name}_DD`];
    let List = [];
    SelectLists.forEach((select) => {
      if (select.value === event.target.value) {
        select.isChecked = event.target.checked;
      }
      if (select.isChecked) {
        List.push(select.value);
      }
    });
    setSelected(List);
    setState({ [`${props.name}_DD`]: SelectLists });
  };

  // const Level1CheckList = async (id) => {
  //   try {
  //     let response = [];
  //     // eslint-disable-next-line
  //     let reg = /(\#.*?\#)/gi;
  //     let _query = props.schema.data.query;
  //     let output = _query.match(reg);
  //     if (output.length === 2) {
  //       let res;
  //       if (localStorage.getItem("Extand_Class")) {
  //         let data = JSON.parse(localStorage.getItem("Extand_Class"));
  //         res = data[0];
  //       }
  //       output = output.filter((x) => x !== "#queryString#");
  //       if (output.length === 1) {
  //         _query = _query.replace("#queryString#", id);
  //         output = output.join();
  //         output = output.substring(1, output.length - 1);
  //         output = output.split(".");
  //         if (output.length > 0) {
  //           _query = _query.replace(reg, res[output[0]][output[1]]);
  //         } else {
  //           _query = _query.replace(reg, res[output[0]]);
  //         }
  //       }
  //     } else {
  //       _query = props.schema.data.query.replace(reg, id);
  //     }

  //     let url = `${parseBaseUrl}classes/${props.schema.data.class}?${_query}`;
  //     const headers = {
  //       "Content-Type": "application/json",
  //       "X-Parse-Application-Id": parseAppId,
  //       "X-Parse-Session-Token": localStorage.getItem("accesstoken")
  //     };
  //     await axios.get(url, { headers: headers }).then(async (res) => {
  //       let temp = [];
  //       let formArray = [];
  //       let _selected = [];
  //       if (editFormData.length > 0) {
  //         editFormData.forEach((x) => {
  //           if (typeof x === "object") {
  //             formArray.push(x.objectId);
  //           } else {
  //             formArray.push(x);
  //           }
  //         });
  //       } else if (
  //         props.schema.selectedData &&
  //         Object.keys(props.schema.selectedData).length !== 0 &&
  //         props.schema.selectedData.constructor === Object
  //       ) {
  //         try {
  //           let selectedDataQuery = props.schema.selectedData.query.replace(
  //             reg,
  //             id
  //           );
  //           let selectedDataUrl = `${parseBaseUrl}classes/${props.schema.selectedData.class}?${selectedDataQuery}`;

  //           await axios.get(selectedDataUrl, { headers }).then((sltres) => {
  //             let sltData = sltres.data.results;
  //             sltData.forEach((x) => {
  //               if (props.schema.selectedData.valueKey.includes(".")) {
  //                 let sltArr = props.schema.selectedData.valueKey.split(".");

  //                 if (Array.isArray(x[sltArr[0]])) {
  //                   x[sltArr[0]].forEach((l) => {
  //                     formArray.push(l[sltArr[1]]);
  //                   });
  //                 } else {
  //                   formArray.push(x[sltArr[0][sltArr[1]]]);
  //                 }
  //               } else {
  //                 formArray.push(x[props.schema.selectedData.valueKey]);
  //               }
  //             });
  //           });
  //         } catch (error) {}
  //       }
  //       res.data.results.forEach((x) => {
  //         let obj = {};
  //         if (props.schema.data.valueKey.includes(".")) {
  //           let newArr = props.schema.data.valueKey.split(".");
  //           if (Array.isArray(x[newArr[0]])) {
  //             if (props.schema.data.displayKey.includes(".")) {
  //               let _dis = props.schema.data.displayKey.split(".");
  //               x[newArr[0]].forEach((l) => {
  //                 if (formArray.includes(l[newArr[1]])) {
  //                   obj = {
  //                     label: l[_dis[1]],
  //                     value: l[newArr[1]],
  //                     isChecked: true
  //                   };
  //                   _selected.push(obj);
  //                 } else {
  //                   if (props.schema.selectAll) {
  //                     obj = {
  //                       label: l[_dis[1]],
  //                       value: l[newArr[1]],
  //                       isChecked: true
  //                     };
  //                     _selected.push(obj);
  //                   } else {
  //                     obj = {
  //                       label: l[_dis[1]],
  //                       value: l[newArr[1]],
  //                       isChecked: false
  //                     };
  //                   }
  //                 }
  //                 temp.push(obj);
  //               });
  //             } else {
  //               x[newArr[0]].forEach((l) => {
  //                 if (formArray.includes(l[newArr[1]])) {
  //                   obj = {
  //                     label: x[props.schema.data.displayKey],
  //                     value: l[newArr[1]],
  //                     isChecked: true
  //                   };
  //                   _selected.push(obj);
  //                 } else {
  //                   if (props.schema.selectAll) {
  //                     obj = {
  //                       label: x[props.schema.data.displayKey],
  //                       value: l[newArr[1]],
  //                       isChecked: true
  //                     };
  //                     _selected.push(obj);
  //                   } else {
  //                     obj = {
  //                       label: x[props.schema.data.displayKey],
  //                       value: l[newArr[1]],
  //                       isChecked: false
  //                     };
  //                   }
  //                 }
  //                 temp.push(obj);
  //               });
  //             }
  //           } else {
  //             if (props.schema.data.displayKey.includes(".")) {
  //               let disArr = props.schema.data.displayKey.split(".");
  //               if (formArray.includes(x[newArr[0]][newArr[1]])) {
  //                 obj = {
  //                   label: x[disArr[0]][disArr[1]],
  //                   value: x[newArr[0]][newArr[1]],
  //                   isChecked: true
  //                 };
  //                 _selected.push(obj);
  //               } else {
  //                 if (props.schema.selectAll) {
  //                   obj = {
  //                     label: x[disArr[0]][disArr[1]],
  //                     value: x[newArr[0]][newArr[1]],
  //                     isChecked: true
  //                   };
  //                   _selected.push(obj);
  //                 } else {
  //                   obj = {
  //                     label: x[disArr[0]][disArr[1]],
  //                     value: x[newArr[0]][newArr[1]],
  //                     isChecked: false
  //                   };
  //                 }
  //               }
  //             } else {
  //               if (formArray.includes(x[newArr[0]][newArr[1]])) {
  //                 obj = {
  //                   label: x[props.schema.data.displayKey],
  //                   value: x[newArr[0]][newArr[1]],
  //                   isChecked: true
  //                 };
  //                 _selected.push(obj);
  //               } else {
  //                 if (props.schema.selectAll) {
  //                   obj = {
  //                     label: x[props.schema.data.displayKey],
  //                     value: x[newArr[0]][newArr[1]],
  //                     isChecked: true
  //                   };
  //                   _selected.push(obj);
  //                 } else {
  //                   obj = {
  //                     label: x[props.schema.data.displayKey],
  //                     value: x[newArr[0]][newArr[1]],
  //                     isChecked: false
  //                   };
  //                 }
  //               }
  //             }
  //           }
  //         } else {
  //           if (Array.isArray(x[props.schema.data.valueKey])) {
  //             x[props.schema.data.valueKey].forEach((t) => {
  //               if (formArray.includes(t)) {
  //                 obj = {
  //                   label: t,
  //                   value: t,
  //                   isChecked: true
  //                 };
  //                 _selected.push(obj);
  //               } else {
  //                 if (props.schema.selectAll) {
  //                   obj = {
  //                     label: t,
  //                     value: t,
  //                     isChecked: true
  //                   };
  //                   _selected.push(obj);
  //                 } else {
  //                   obj = {
  //                     label: t,
  //                     value: t,
  //                     isChecked: false
  //                   };
  //                 }
  //               }
  //               temp.push(obj);
  //             });
  //           } else if (formArray.includes(x[props.schema.data.valueKey])) {
  //             obj = {
  //               label: x[props.schema.data.displayKey],
  //               value: x[props.schema.data.valueKey],
  //               isChecked: true
  //             };
  //             _selected.push(obj);
  //           } else {
  //             if (props.schema.selectAll) {
  //               obj = {
  //                 label: x[props.schema.data.displayKey],
  //                 value: x[props.schema.data.valueKey],
  //                 isChecked: true
  //               };
  //               _selected.push(obj);
  //             } else {
  //               obj = {
  //                 label: x[props.schema.data.displayKey],
  //                 value: x[props.schema.data.valueKey],
  //                 isChecked: false
  //               };
  //             }
  //           }
  //           temp.push(obj);
  //         }
  //       });
  //       response = temp;
  //       if (props.schema.uiLayout === "MultiDropdownList") {
  //         if (editFormData) {
  //           let checkData = [];
  //           response.forEach((x) => {
  //             if (x.isChecked) {
  //               checkData.push(x.value);
  //             }
  //           });
  //           setSelected(checkData);
  //         }
  //         setState({ [`${props.name}_DD`]: response });
  //       } else {
  //         setState({ [`${props.name}_DD`]: response });
  //         setSelected(_selected);
  //       }
  //     });
  //   } catch (error) {}
  // };

  const dragProps = {
    onDragEnd(fromIndex, toIndex) {
      const data = [...state[`${props.name}_DD`]];
      const item = data.splice(fromIndex, 1)[0];
      data.splice(toIndex, 0, item);
      let NewList = [];
      data.forEach((x) => {
        if (x.isChecked) {
          NewList.push(x.value);
        }
      });

      setState({ [`${props.name}_DD`]: data });
      setSelected(NewList);
    },
    nodeSelector: "li",
    handleSelector: "a"
  };

  useEffect(() => {
    if (!props.schema.parent) GetSelectListData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (props.schema.uiLayout === "MultiDropdownList") {
      props.onChange(selected);
    } else {
      if (selected && selected.length) {
        let newData = [];
        selected.forEach((x) => {
          newData.push(x.value);
        });
        props.onChange(newData);
      }
    }
    // eslint-disable-next-line
  }, [selected]);

  // useState(() => {
  //   if (props.formData) {
  //     if (props.formData === "Select") {
  //     } else {
  //       setEditFormData(props.formData);
  //     }
  //   }
  //   // eslint-disable-next-line
  // }, [props.formData]);

  const handleModalCloseClick = () => {
    setIsModel(false);
    setModalIsOpen(false);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  // `handleNewDetails` is used to set just save from quick form to selected option in dropdown
  const handleNewDetails = (data) => {
    setState({ [`${props.name}_DD`]: [...state[`${props.name}_DD`], data] });
    if (selected.length > 0) {
      setSelected([data]);
    } else {
      setSelected([...selected, data]);
    }
  };
  if (props.schema.uiLayout === "MultiDropdownList") {
    return (
      <React.Fragment>
        <LabelField
          Title={props.schema.title}
          Name={props.name}
          Required={props.required}
          HelpBody={props.schema.helpbody}
          HelpLink={props.schema.helplink}
        />
        <ReactDragListView {...dragProps}>
          <ul
            style={{
              listStyleType: "square",
              listStylePosition: "outside",
              maxHeight: "250px",
              overflow: "auto",
              paddingTop: "10px",
              paddingBottom: "10px",
              border: "0px solid #b3b3b3",
              borderRadius: "5px"
            }}
          >
            {state && state[`${props.name}_DD`].length > 0 ? (
              state[`${props.name}_DD`].map((x, i) => {
                return (
                  <li key={i} className="multiSelectList">
                    <input
                      key={x.value}
                      onClick={handleCheckChieldElement}
                      type="checkbox"
                      checked={x.isChecked}
                      style={{ marginTop: "7px" }}
                      value={x.value}
                      disabled={props.disabled}
                    />{" "}
                    <span style={{ marginTop: "7px" }}>{x.name}</span>
                    {props.schema.isSortable && !props.disabled && (
                      <a
                        onClick={(e) => e.preventDefault()}
                        className="pull-right"
                        title="Sort List"
                        style={{ textDecoration: "none" }}
                      >
                        <i
                          className="fa fa-bars"
                          style={{
                            fontSize: "30px",
                            color: "skyblue",
                            paddingTop: "11px"
                          }}
                        ></i>
                      </a>
                    )}
                  </li>
                );
              })
            ) : (
              <li className="multiSelectList">No Record Found</li>
            )}
          </ul>
        </ReactDragListView>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <LabelField
        Title={props.schema.title}
        Name={props.name}
        Required={props.required}
        HelpBody={props.schema.helpbody}
        HelpLink={props.schema.helplink}
      />
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ flexWrap: "wrap", width: "100%" }}>
          <Select
            onSortEnd={onSortEnd}
            distance={4}
            isMulti
            options={(state && state[`${props.name}_DD`]) || []}
            value={selected}
            onChange={onChange}
            closeMenuOnSelect={false}
          />
        </div>

        {props.schema.data.quickAddFormId && (
          <div
            onClick={() => {
              setIsModel(true);
              openModal();
            }}
            style={{
              cursor: "pointer",
              borderRadius: 4,
              border: "1px solid #ccc",
              minHeight: 38,
              minWidth: 48,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <i className="fas fa-plus"></i>
          </div>
        )}
        {/* {props.schema.data.quickAddFormId && (
          <div
            className="modal fade"
            id={"multiSelectModal" + props.schema.data.quickAddFormId}
            tabIndex="-1"
            role="dialog"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <button
                    type="button"
                    className="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={handleModalCloseClick}
                  >
                    <i className="fa fa-times-circle" aria-hidden="true"></i>
                  </button>
                </div>
                <div className="modal-body">
                  {isModal && (
                    <AppendFormInForm
                      id={props.schema.data.quickAddFormId}
                      valueKey={props.schema.data.valueKey}
                      displayKey={props.schema.data.displayKey}
                      details={handleNewDetails}
                      closePopup={handleModalCloseClick}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )} */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={handleModalCloseClick}
          contentLabel="Modal"
          style={{
            overlay: {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.75)",
              zIndex: 10
            }
          }}
        >
          <div
            type="button"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div style={{ color: "transparent", width: "100%" }}>.</div>
            <button onClick={handleModalCloseClick}>
              <i
                style={{ fontSize: 25 }}
                className="fa fa-times-circle"
                aria-hidden="true"
              ></i>
            </button>
          </div>
          {isModal && (
            <AppendFormInForm
              id={props.schema.data.quickAddFormId}
              valueKey={props.schema.data.valueKey}
              displayKey={props.schema.data.displayKey}
              details={handleNewDetails}
              closePopup={handleModalCloseClick}
            />
          )}
        </Modal>
      </div>
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    Level1_Dropdown: state.Level1_Dropdown,
    Level2_Dropdown: state.Level2_Dropdown,
    Level3_Dropdown: state.Level3_Dropdown
  };
};
export default connect(mapStateToProps, null)(MultiSelectField);
