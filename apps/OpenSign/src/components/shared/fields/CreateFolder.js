import React, { useEffect, useState } from "react";
import Parse from "parse";
import Alert from "../../../primitives/Alert";
import Loader from "../../../primitives/Loader";
import { useTranslation } from "react-i18next";

const CreateFolder = ({ parentFolderId, onSuccess, folderCls }) => {
  const folderPtr = {
    __type: "Pointer",
    className: folderCls,
    objectId: parentFolderId
  };
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [folderList, setFolderList] = useState([]);
  const [isAlert, setIsAlert] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const [selectedParent, setSelectedParent] = useState();
  const [alert, setAlert] = useState({ type: "info", message: "" });
  useEffect(() => {
    fetchFolder();
    // eslint-disable-next-line
  }, []);

  const fetchFolder = async () => {
    try {
      const FolderQuery = new Parse.Query(folderCls);
      if (parentFolderId) {
        FolderQuery.equalTo("Folder", folderPtr);
        FolderQuery.equalTo("Type", "Folder");
        FolderQuery.notEqualTo("IsArchive", true);
        FolderQuery.equalTo("CreatedBy", Parse.User.current());
      } else {
        FolderQuery.doesNotExist("Folder");
        FolderQuery.equalTo("Type", "Folder");
        FolderQuery.notEqualTo("IsArchive", true);
        FolderQuery.equalTo("CreatedBy", Parse.User.current());
      }

      const res = await FolderQuery.find();
      if (res) {
        const result = JSON.parse(JSON.stringify(res));
        if (result) {
          setFolderList(result);
        }
      }
    } catch (error) {
      console.log("Err ", error);
    }
  };
  const handleCreateFolder = async (event) => {
    event.preventDefault();
    handleLoader(true);
    if (name) {
      const currentUser = Parse.User.current();
      const exsitQuery = new Parse.Query(folderCls);
      exsitQuery.equalTo("Name", name);
      exsitQuery.equalTo("Type", "Folder");
      exsitQuery.notEqualTo("IsArchive", true);
      if (parentFolderId) {
        exsitQuery.equalTo("Folder", folderPtr);
      }
      const templExist = await exsitQuery.first();
      if (templExist) {
        setAlert({ type: "danger", message: t("folder-already-exist") });
        setIsAlert(true);
        setTimeout(() => {
          setIsAlert(false);
        }, 1000);
      } else {
        const template = new Parse.Object(folderCls);
        template.set("Name", name);
        template.set("Type", "Folder");

        if (selectedParent) {
          template.set("Folder", {
            __type: "Pointer",
            className: folderCls,
            objectId: selectedParent
          });
        } else if (parentFolderId) {
          template.set("Folder", folderPtr);
        }
        template.set("CreatedBy", Parse.User.createWithoutData(currentUser.id));
        const res = await template.save();
        if (res) {
          handleLoader(false);
          setAlert({
            type: "success",
            message: t("folder-created-successfully")
          });
          setIsAlert(true);
          setTimeout(() => {
            setIsAlert(false);
          }, 1000);
          if (onSuccess) {
            onSuccess(res);
          }
        }
      }
    } else {
      handleLoader(false);
      setAlert({ type: "info", message: t("fill-folder-name") });
      setIsAlert(true);
      setTimeout(() => {
        setIsAlert(false);
      }, 1000);
    }
  };
  const handleOptions = (e) => {
    setSelectedParent(e.target.value);
  };
  const handleLoader = (status) => {
    setIsLoader(status);
  };
  return (
    <div>
      {isAlert && <Alert type={alert.type}>{alert.message}</Alert>}
      <div id="createFolder" className="relative">
        {isLoader && (
          <div className="absolute h-full w-full flex justify-center items-center">
            <Loader />
          </div>
        )}
        <h1 className="text-base font-semibold mt-[0.4rem]">
          {t("create-folder")}
        </h1>
        <div className="text-xs mt-2">
          <label className="block">
            {t("name")}
            <span className="text-red-500 text-[13px]">*</span>
          </label>
          <input
            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
            onInput={(e) => e.target.setCustomValidity("")}
            required
          />
        </div>
        <div className="text-xs mt-2">
          <label className="block">{t("parent-folder")}</label>
          <select
            value={selectedParent}
            onChange={handleOptions}
            className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
          >
            <option>select</option>
            {folderList.length > 0 &&
              folderList.map((x) => (
                <option key={x.objectId} value={x.objectId}>
                  {x.Name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <button
            onClick={handleCreateFolder}
            disabled={isLoader}
            className="op-btn op-btn-primary op-btn-sm mt-3"
          >
            <i className="fa-light fa-plus"></i>
            <span>{t("create")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolder;
