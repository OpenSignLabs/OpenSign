import React, { useEffect, useState } from "react";
import CreateFolder from "./CreateFolder";
import ModalUi from "./ModalUi";
import axios from "axios";
import { themeColor } from "../utils/ThemeColor/backColor";
import "../css/selectFolder.css";

const SelectFolder = ({
  required,
  onSuccess,
  folderCls,
  isOpenModal,
  setIsOpenMoveModal
}) => {
  const [clickFolder, setClickFolder] = useState("");
  // const [selectFolder, setSelectedFolder] = useState({});
  const [folderList, setFolderList] = useState([]);
  const [tabList, setTabList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  // const [folderPath, setFolderPath] = useState("");
  const [isAdd, setIsAdd] = useState(false);
  useEffect(() => {
    if (isOpenModal) {
      setIsAdd(false);
      setClickFolder({});
      setFolderList([]);
      setTabList([]);
      fetchFolder();
    }
  }, []);
  const fetchFolder = async (folderPtr) => {
    setIsLoader(true);

    // try {
    //   console.log("folder",folderCls,folderPtr)
    //   const FolderQuery = new Parse.Query('contracts_Document');
    //   console.log("folder",FolderQuery)
    //   if (folderPtr) {
    //     FolderQuery.equalTo("Folder", folderPtr);
    //     FolderQuery.equalTo("Type", "Folder");
    //   } else {
    //     FolderQuery.doesNotExist("Folder");
    //     FolderQuery.equalTo("Type", "Folder");
    //   }
    //   console.log("newres",FolderQuery)
    //   const res = await FolderQuery.count();
    //   console.log("res",res)
    //   // if (res) {
    //   //   const result = JSON.parse(JSON.stringify(res));
    //   //   if (result) {
    //   //     setFolderList(result);
    //   //     setIsLoader(false);
    //   //   }
    //   //   setIsLoader(false);
    //   // }
    // } catch (error) {
    //   setIsLoader(false);
    // }
    let url;
    const classUrl = `${localStorage.getItem("baseUrl")}classes/${folderCls}`;

    if (folderPtr) {
      url = `${classUrl}?where={"Folder": {"__type":"Pointer","className":${folderCls},"objectId":"${folderPtr.objectId}"},"Type":"Folder"}`;
    } else {
      url = `${classUrl}?where={"Folder":{"$exists":false},"Type":"Folder"}`;
    }
    try {
      const res = await axios.get(url, {
        headers: {
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      });

      if (res.data.results) {
        setFolderList(res.data.results);
        setIsLoader(false);
        setIsAdd(false);
      }
      setIsLoader(false);
    } catch (err) {
      console.log("err", err);
      setIsLoader(false);
    }
  };
  const handleSelect = (item) => {
    setFolderList([]);
    setClickFolder({ ObjectId: item.objectId, Name: item.Name });
    if (tabList.length > 0) {
      const tab = tabList.some((x) => x.objectId === item.objectId);
      if (!tab) {
        setTabList((tabs) => [...tabs, item]);
        const folderPtr = {
          __type: "Pointer",
          className: folderCls,
          objectId: item.objectId
        };
        fetchFolder(folderPtr);
      }
    } else {
      setTabList((tabs) => [...tabs, item]);
      const folderPtr = {
        __type: "Pointer",
        className: folderCls,
        objectId: item.objectId
      };

      fetchFolder(folderPtr);
    }
  };

  const handleSubmit = () => {
    let url = "Root";
    tabList.forEach((t) => {
      url = url + " / " + t.Name;
    });
    // setFolderPath(url);
    // setSelectedFolder(clickFolder);
    if (onSuccess) {
      onSuccess(clickFolder);
    }
    setIsOpenMoveModal(false);
  };
  const handleCancel = () => {
    setIsOpenMoveModal(false);
    setClickFolder({});
    setFolderList([]);
    setTabList([]);
  };

  const removeTabListItem = async (e, i) => {
    e.preventDefault();
    // setEditable(false);
    if (!isAdd) {
      setIsLoader(true);
      let folderPtr;
      if (i) {
        setFolderList([]);
        let list = tabList.filter((itm, j) => {
          if (j <= i) {
            return itm;
          }
        });
        let _len = list.length - 1;
        folderPtr = {
          __type: "Pointer",
          className: folderCls,
          objectId: list[_len].objectId
        };
        setTabList(list);
      } else {
        setClickFolder({});
        // setSelectedFolder({});
        setFolderList([]);
        setTabList([]);
      }
      fetchFolder(folderPtr);
    }
  };
  const handleCreate = () => {
    setIsAdd(!isAdd);
  };
  const handleAddFolder = () => {
    setFolderList([]);
    if (clickFolder && clickFolder.ObjectId) {
      fetchFolder({
        __type: "Pointer",
        className: folderCls,
        objectId: clickFolder.ObjectId
      });
    } else {
      fetchFolder();
    }
  };

  return (
    <div className="text-xs mt-2">
      {/* <div>
        <label className="block">
          Select Folder
          {required && <span style={{ color: "red", fontSize: 13 }}> *</span>}
        </label>
      </div>
      <div className="rounded px-[20px] py-[20px] bg-white border border-gray-200 shadow flex max-w-sm gap-8 items-center">
        <div>
          <i
            className="far fa-folder-open text-[40px] text-[#33bbff]"
            style={{ fontSize: "40px" }}
            aria-hidden="true"
          ></i>
        </div>
        <div className="font-semibold ">
          <div className="flex items-center gap-2">
            <p>
              {selectFolder && selectFolder.Name ? selectFolder.Name : "Root"}
            </p>
            <div className="text-black text-sm" onClick={() => SetIsOpen(true)}>
              <i
                className="fa fa-pencil"
                title="Select Folder"
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <p className="text-[10px] text-gray-400">
            {selectFolder && selectFolder.Name ? `(${folderPath})` : ""}
          </p>
        </div>
      </div> */}
      <ModalUi
        id="asd"
        title={"Select Folder"}
        isOpen={isOpenModal}
        handleClose={handleCancel}
      >
        {" "}
        <div style={{ width: "100%", padding: "1rem" }}>
          <div
            style={{
              paddingTop: "2px",
              color: "#ac4848",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            <span
              style={{ cursor: "pointer" }}
              title="Root"
              onClick={(e) => {
                setIsAdd(false);
                removeTabListItem(e);
              }}
            >
              Root /{" "}
            </span>
            {tabList &&
              tabList.map((tab, i) => (
                <React.Fragment key={`${tab.objectId}-${i}`}>
                  <span
                    style={{ cursor: "pointer" }}
                    title={tab.Name}
                    onClick={(e) => {
                      setIsAdd(false);
                      removeTabListItem(e, i);
                    }}
                  >
                    {tab.Name}
                  </span>
                  {" / "}
                </React.Fragment>
              ))}
            <hr className="hrStyle" />
          </div>
          <div style={{ margin: "2px 0 3px 0" }}>
            {!isAdd &&
              folderList.length > 0 &&
              folderList.map((folder) => (
                <div
                  key={folder.Name}
                  style={{
                    border: "1.7px solid #c3bcbc",
                    padding: "6px",
                    marginBottom: "5px",
                    cursor: "pointer"
                  }}
                  onClick={() => handleSelect(folder)}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "2" }}
                  >
                    <i
                      style={{ color: "#33bbff", fontSize: "1.4rem" }}
                      className="fa fa-folder   "
                      aria-hidden="true"
                    ></i>
                    <span
                      style={{
                        fontWeight: "500",
                        marginLeft: "10px",
                        fontSize: "14px"
                      }}
                    >
                      {folder.Name}
                    </span>
                  </div>
                </div>
              ))}
            {isAdd && (
              <CreateFolder
                parentFolderId={clickFolder && clickFolder.ObjectId}
                folderCls={folderCls}
                onSuccess={handleAddFolder}
                setIsAdd={setIsAdd}
              />
            )}
            {isLoader && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <i
                  style={{ fontSize: "30px" }}
                  className="fa-solid fa-spinner fa-spin-pulse "
                ></i>
              </div>
            )}
          </div>
        </div>
        <hr className="hrStyle" />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px"
          }}
        >
          <div
            style={{ fontSize: "30px", cursor: "pointer", color: themeColor() }}
            title="Save Here"
            onClick={handleCreate}
          >
            {isAdd ? (
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
            ) : (
              <i className="fa-solid fa-square-plus" aria-hidden="true"></i>
            )}
          </div>
          <div
            style={{ fontSize: "30px", cursor: "pointer" }}
            title="Save Here"
            onClick={handleSubmit}
          >
            <i className="fas fa-save" aria-hidden="true"></i>
          </div>
        </div>
      </ModalUi>
      {/* {isOpen && (
        <div
          className={`fixed z-40 top-20 left-1/2 transform -translate-x-1/2 border-[1px] text-sm bg-white rounded `}
        >
          <div className="flex justify-between items-center py-[.75rem] px-[1.25rem] bg-[#f5f5f5]">
            <div className="font-semibold text-lg text-black">
              Select Folder
            </div>
            <div
              onClick={handleCancel}
              className="px-2 py-1 border-[1px] border-[#8a8a8a] bg-white rounded cursor-pointer"
            >
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>
          <hr />
          <div className="w-full min-w-[300px] md:min-w-[500px] px-3">
            <div className="py-2 text-[#ac4848] text-[14px] font-[500]">
              <span
                className="cursor-pointer"
                title="Root"
                onClick={(e) => removeTabListItem(e)}
              >
                Root /{" "}
              </span>
              {tabList &&
                tabList.map((tab, i) => (
                  <React.Fragment key={`${tab.objectId}-${i}`}>
                    <span
                      className="cursor-pointer"
                      title={tab.Name}
                      onClick={(e) => removeTabListItem(e, i)}
                    >
                      {tab.Name}
                    </span>
                    {" / "}
                  </React.Fragment>
                ))}
              <hr />
            </div>
            <div className="mt-2 mb-3">
              {!isAdd &&
                folderList.length > 0 &&
                folderList.map((folder) => (
                  <div
                    key={folder.Name}
                    className="border-[1px] border-[#8a8a8a] px-2 py-2 mb-2 cursor-pointer"
                    onClick={() => handleSelect(folder)}
                  >
                    <div className="flex items-center gap-2">
                      <i
                        className="fa fa-folder text-[#33bbff] text-[1.4rem]"
                        aria-hidden="true"
                      ></i>
                      <span className="font-semibold">{folder.Name}</span>
                    </div>
                  </div>
                ))}
              {isAdd && (
                <CreateFolder
                  parentFolderId={clickFolder && clickFolder.ObjectId}
                  folderCls={folderCls}
                  onSuccess={handleAddFolder}
                />
              )}
              {isLoader && (
                <div className="flex justify-center">
                  <i className="fa-solid fa-spinner fa-spin-pulse text-[30px]"></i>
                </div>
              )}
            </div>
          </div>
          <hr />
          <div className="flex justify-between items-center py-[.75rem] px-[1.25rem]">
            <div
              className="text-[30px] cursor-pointer text-[#33bbff]"
              title="Save Here"
              onClick={handleCreate}
            >
              {isAdd ? (
                <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              ) : (
                <i className="fa-solid fa-square-plus" aria-hidden="true"></i>
              )}
            </div>
            <div
              className="text-[30px] cursor-pointer"
              title="Save Here"
              onClick={handleSubmit}
            >
              <i className="fas fa-save" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default SelectFolder;
