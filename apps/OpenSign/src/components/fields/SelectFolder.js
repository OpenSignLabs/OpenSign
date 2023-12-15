import React, { useEffect, useState } from "react";
import Parse from "parse";
import CreateFolder from "./CreateFolder";

const SelectFolder = ({ required, onSuccess, folderCls }) => {
  const [isOpen, SetIsOpen] = useState(false);
  const [clickFolder, setClickFolder] = useState("");
  const [selectFolder, setSelectedFolder] = useState({});
  const [folderList, setFolderList] = useState([]);
  const [tabList, setTabList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [isAdd, setIsAdd] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setIsAdd(false);
      setClickFolder({});
      setFolderList([]);
      setTabList([]);
      fetchFolder();
    }
  }, [isOpen]);
  const fetchFolder = async (folderPtr) => {
    setIsLoader(true);
    try {
      const fetchFolder = new Parse.Query(folderCls);
      if (folderPtr) {
        fetchFolder.equalTo("Folder", folderPtr);
        fetchFolder.equalTo("Type", "Folder");
      } else {
        fetchFolder.doesNotExist("Folder");
        fetchFolder.equalTo("Type", "Folder");
      }

      const res = await fetchFolder.find();
      if (res) {
        const result = JSON.parse(JSON.stringify(res));
        if (result) {
          setFolderList(result);
          setIsLoader(false);
        }
        setIsLoader(false);
      }
    } catch (error) {
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
    setFolderPath(url);
    setSelectedFolder(clickFolder);
    if (onSuccess) {
      onSuccess(clickFolder);
    }
    SetIsOpen(false);
  };
  const handleCancel = () => {
    SetIsOpen(false);
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
        setSelectedFolder({});
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
    <div className="text-xs mt-2 ">
      <div>
        <label className="block">
          Select Folder
          {required && <span className="text-red-500 text-[13px]">*</span>}
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
      </div>
      {isOpen && (
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
      )}
    </div>
  );
};

export default SelectFolder;
