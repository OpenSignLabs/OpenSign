import React, { useEffect, useState } from "react";
import Parse from "parse";
import CreateFolder from "./CreateFolder";
import ModalUi from "../../../primitives/ModalUi";
import Tooltip from "../../../primitives/Tooltip";
import { useTranslation } from "react-i18next";

const SelectFolder = ({ required, onSuccess, folderCls, isReset }) => {
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  const { t } = useTranslation();
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
    // eslint-disable-next-line
  }, [isOpen]);
  // below useEffect is used to reset folder selection if user pass isReset = true from parent component
  useEffect(() => {
    if (isReset == true) {
      handleReset();
    }
  }, [isReset]);
  const handleReset = () => {
    setFolderPath({});
    setSelectedFolder("");
    setClickFolder("");
    setIsAdd(false);
    setFolderList([]);
    setTabList([]);
  };
  // `fetchFolder` is used to fetch of folder list created by user on basis of folderPtr or without folderPtr
  const fetchFolder = async (folderPtr) => {
    setIsLoader(true);
    try {
      const FolderQuery = new Parse.Query(folderCls);
      if (folderPtr) {
        FolderQuery.equalTo("Folder", folderPtr);
        FolderQuery.notEqualTo("IsArchive", true);
        FolderQuery.descending("Type");
        FolderQuery.equalTo("CreatedBy", Parse.User.current());
      } else {
        FolderQuery.doesNotExist("Folder");
        FolderQuery.notEqualTo("IsArchive", true);
        FolderQuery.descending("Type");
        FolderQuery.equalTo("CreatedBy", Parse.User.current());
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

  // `handleSubmit` is used to pass folderPtr to parent component
  const handleSubmit = () => {
    let url = drivename + " Drive";
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

  // `handleCancel` is used to clear list of folder, close popup and folderUrl
  const handleCancel = () => {
    SetIsOpen(false);
    setClickFolder({});
    setFolderList([]);
    setTabList([]);
  };

  // `handleCancel` is call when user click on folder name from path/tab in popup
  const removeTabListItem = async (e, i) => {
    e.preventDefault();
    setIsLoader(true);
    setIsAdd(false);
    if (i !== undefined) {
      setFolderList([]);
      const list = tabList.filter((folder, j) => j <= i && folder);
      const index = list.length - 1;
      const folderPtr = {
        __type: "Pointer",
        className: folderCls,
        objectId: list[index].objectId
      };
      fetchFolder(folderPtr);
      setTabList(list);
    } else {
      setClickFolder({});
      setSelectedFolder({});
      setFolderList([]);
      setTabList([]);
      fetchFolder();
    }
  };
  // `handleCreate` is used to open folder creation form in popup
  const handleCreate = () => setIsAdd(true);
  const handleBack = () => setIsAdd(false);

  // `handleAddFolder` is call when user folder created successfully and it fetch folder list on the basis of folderPtr or without folderPtr
  const handleAddFolder = (newFolder) => {
    setFolderList([]);
    if (clickFolder && clickFolder.ObjectId) {
      fetchFolder({
        __type: "Pointer",
        className: folderCls,
        objectId: newFolder.objectId // clickFolder.ObjectId
      });
    } else {
      fetchFolder();
    }
    setClickFolder({ ObjectId: newFolder.objectId, Name: newFolder.Name });
    setTabList((prev) => [...prev, newFolder]);
    handleBack();
  };
  return (
    <div className="text-xs mt-2 ">
      <div>
        <label className="block">
          {t("select-folder")}
          {required && <span className="text-red-500 text-[13px]">*</span>}
        </label>
      </div>
      <div className="relative max-w-sm">
        <div
          onClick={() => SetIsOpen(true)}
          className="cursor-pointer rounded px-[20px] py-[20px] bg-base-100 border-[1px] border-base-200 shadow flex max-w-sm gap-8 items-center"
        >
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="w-[40px] h-[40px] fill-current"
            >
              <path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z" />
            </svg>
          </div>
          <div className="font-semibold ">
            <div className="flex items-center gap-2">
              <p>
                {selectFolder && selectFolder.Name
                  ? selectFolder.Name
                  : t("OpenSign-drive", { appName: drivename })}
              </p>
              <div className="text-sm">
                <i
                  className="fa-light fa-pencil cursor-pointer"
                  title={t("select-folder")}
                  aria-hidden="true"
                ></i>
              </div>
            </div>
            <p className="text-[10px] text-gray-400">
              {selectFolder && selectFolder.Name ? `(${folderPath})` : ""}
            </p>
          </div>
        </div>
        <div className="absolute top-2 right-1 cursor-pointer">
          <Tooltip message={t("select-folder-help", { appName: drivename })} />
        </div>
      </div>
      <ModalUi
        title={t("select-folder")}
        isOpen={isOpen}
        handleClose={handleCancel}
      >
        <div className="w-full min-w-[300px] md:min-w-[500px] max-w-[500px] px-3">
          <div className="pt-1 text-[#ac4848] text-[14px] font-[500]">
            <span
              className="cursor-pointer"
              title={`${drivename} Drive`}
              onClick={(e) => removeTabListItem(e)}
            >
              {t("OpenSign-drive", { appName: drivename })} /{" "}
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
            <hr className="bg-[#8a8a8a] mt-[0.750rem]" />
          </div>
          <div className="mb-2">
            {!isAdd && (
              <div className="max-h-[210px] overflow-auto">
                {folderList.length > 0
                  ? folderList.map((folder) => (
                      <div
                        key={folder.objectId}
                        className={`${
                          folder.Type === "Folder"
                            ? "cursor-pointer"
                            : "cursor-default"
                        } border-b-[1px] border-[#8a8a8a] py-2 mb-0.5"`}
                        onClick={() =>
                          folder.Type === "Folder" && handleSelect(folder)
                        }
                      >
                        <div className="flex items-center gap-2">
                          {folder.Type === "Folder" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              className="w-[1.4rem] h-[1.4rem] fill-current"
                            >
                              <path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 384 512"
                              className="w-[1.4rem] h-[1.4rem] fill-current op-text-primary"
                            >
                              <path d="M374.629 150.627L233.371 9.373C227.371 3.371 219.23 0 210.746 0H64C28.652 0 0 28.652 0 64V448C0 483.345 28.652 512 64 512H320C355.348 512 384 483.345 384 448V173.254C384 164.767 380.629 156.629 374.629 150.627ZM224 22.629L361.375 160H248C234.781 160 224 149.234 224 136V22.629ZM368 448C368 474.467 346.469 496 320 496H64C37.531 496 16 474.467 16 448V64C16 37.533 37.531 16 64 16H208V136C208 158.062 225.938 176 248 176H368V448ZM96 264C96 268.406 99.594 272 104 272H280C284.406 272 288 268.406 288 264S284.406 256 280 256H104C99.594 256 96 259.594 96 264ZM280 320H104C99.594 320 96 323.594 96 328S99.594 336 104 336H280C284.406 336 288 332.406 288 328S284.406 320 280 320ZM280 384H104C99.594 384 96 387.594 96 392S99.594 400 104 400H280C284.406 400 288 396.406 288 392S284.406 384 280 384Z" />
                            </svg>
                          )}
                          <span className="font-semibold">{folder.Name}</span>
                        </div>
                      </div>
                    ))
                  : !isLoader && (
                      <div className="text-base-content text-center my-2">
                        {t("no-data")}
                      </div>
                    )}
              </div>
            )}
            {isAdd && (
              <CreateFolder
                parentFolderId={clickFolder && clickFolder.ObjectId}
                folderCls={folderCls}
                onSuccess={handleAddFolder}
                onBack={handleBack}
              />
            )}
            {isLoader && (
              <div className="flex justify-center my-4">
                <i className="fa-light fa-spinner fa-spin-pulse text-[30px]"></i>
              </div>
            )}
          </div>
        </div>
        <hr />
        {!isAdd && (
          <div className="flex justify-between items-center py-[.75rem] px-[1.25rem]">
            <div
              className="op-btn op-btn-primary op-btn-sm"
              title={t("save-here")}
              onClick={handleSubmit}
            >
              <i className="fa-light fa-save" aria-hidden="true"></i>
              {t("save-here")}
            </div>
            <div
              className="op-btn op-btn-seconday op-btn-sm"
              title={t("add-folder")}
              onClick={handleCreate}
            >
              <i className="fa-light fa-square-plus" aria-hidden="true"></i>
              <span className="">{t("add-folder")}</span>
            </div>
          </div>
        )}
      </ModalUi>
    </div>
  );
};

export default SelectFolder;
