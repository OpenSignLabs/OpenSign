import React, { useEffect, useState } from "react";
import Parse from "parse";
import CreateFolder from "./CreateFolder";
import ModalUi from "../../../primitives/ModalUi";

const FolderModal = (props) => {
  const [clickFolder, setClickFolder] = useState("");
  const [folderList, setFolderList] = useState([]);
  const [tabList, setTabList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  //   below useEffect is called when user open popup
  useEffect(() => {
    if (props.isOpenModal) {
      fetchFolder();
    }
    // eslint-disable-next-line
  }, [props.isOpenModal]);

  // `fetchFolder` is used to fetch of folder list created by user on basis of folderPtr or without folderPtr
  const fetchFolder = async (folderPtr) => {
    setIsLoader(true);
    try {
      const FolderQuery = new Parse.Query(props.folderCls);
      if (folderPtr) {
        FolderQuery.equalTo("Folder", folderPtr);
        FolderQuery.equalTo("Type", "Folder");
      } else {
        FolderQuery.doesNotExist("Folder");
        FolderQuery.equalTo("Type", "Folder");
      }

      const res = await FolderQuery.find();
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

  // `handleSelect` is used to save pointer of folder selected by user and it's path in state
  const handleSelect = (item) => {
    setFolderList([]);
    setClickFolder({ ObjectId: item.objectId, Name: item.Name });
    if (tabList.length > 0) {
      const tab = tabList.some((x) => x.objectId === item.objectId);
      if (!tab) {
        setTabList((tabs) => [...tabs, item]);
        const folderPtr = {
          __type: "Pointer",
          className: props.folderCls,
          objectId: item.objectId
        };
        fetchFolder(folderPtr);
      }
    } else {
      setTabList((tabs) => [...tabs, item]);
      const folderPtr = {
        __type: "Pointer",
        className: props.folderCls,
        objectId: item.objectId
      };

      fetchFolder(folderPtr);
    }
  };

  // `handleSubmit` is used to pass folderPtr to parent component
  const handleSubmit = () => {
    let url = "OpenSign™ Drive";
    tabList.forEach((t) => {
      url = url + " / " + t.Name;
    });
    if (props.onSuccess) {
      props.onSuccess(clickFolder);
    }
    // SetIsOpen(false);
    props.setIsOpenMoveModal(false);
  };

  // `handleCancel` is used to clear list of folder, close popup and folderUrl
  const handleCancel = () => {
    // SetIsOpen(false);
    props.setIsOpenMoveModal(false);
    setClickFolder({});
    setFolderList([]);
    setTabList([]);
  };

  // `handleCancel` is call when user click on folder name from path/tab in popup
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
          className: props.folderCls,
          objectId: list[_len].objectId
        };
        setTabList(list);
      } else {
        setClickFolder({});
        setFolderList([]);
        setTabList([]);
      }
      fetchFolder(folderPtr);
    }
  };
  // `handleCreate` is used to open folder creation form in popup
  const handleCreate = () => {
    setIsAdd(!isAdd);
  };
  // `handleAddFolder` is call when user folder created successfully and it fetch folder list on the basis of folderPtr or without folderPtr
  const handleAddFolder = (newFolder) => {
    props.setPdfData((prev) => [...prev, newFolder?.toJSON()]);
    if (clickFolder && clickFolder.ObjectId) {
      fetchFolder({
        __type: "Pointer",
        className: props.folderCls,
        objectId: clickFolder.ObjectId
      });
    } else {
      fetchFolder();
    }
    handleCreate();
  };
  return (
    <div className="text-xs mt-2 ">
      <ModalUi
        title={"Select Folder"}
        isOpen={props.isOpenModal}
        handleClose={handleCancel}
      >
        <div className="w-full min-w-[300px] md:min-w-[500px] max-w-[500px] px-3">
          <div className="py-2 text-[#ac4848] text-[14px] font-[500]">
            <span
              className="cursor-pointer"
              title="OpenSign™ Drive"
              onClick={(e) => removeTabListItem(e)}
            >
              OpenSign™ Drive /{" "}
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
            <div className="max-h-[210px] overflow-auto">
              {!isAdd &&
                folderList.length > 0 &&
                folderList.map((folder) => (
                  <div
                    key={folder.Name}
                    className="border-[1px] border-[#8a8a8a] px-2 py-2 mb-2 cursor-pointer "
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
            </div>
            {isAdd && (
              <CreateFolder
                parentFolderId={clickFolder && clickFolder.ObjectId}
                folderCls={props.folderCls}
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
            className="text-[30px] cursor-pointer text-[#32a3ac]"
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
      </ModalUi>
    </div>
  );
};

export default FolderModal;
