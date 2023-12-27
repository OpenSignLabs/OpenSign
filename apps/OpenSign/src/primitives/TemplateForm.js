import React, { useState } from "react";
import sanitizeFileName from "./sanitizeFileName";
import Parse from "parse";
import DropboxChooser from "../components/fields/DropboxChoose";
import Alert from "./Alert";
import SelectFolder from "../components/fields/SelectFolder";
// import SignersInput from "../components/fields/SignersInput";
import Title from "../components/Title";
import { useNavigate } from "react-router-dom";
import { templateCls } from "../constant/const";

const TemplateForm = () => {
  const navigate = useNavigate();
  const [signers, setSigners] = useState([]);
  const [folder, setFolder] = useState({ ObjectId: "", Name: "" });
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Note: "Please review and sign this document"
  });
  const [fileupload, setFileUpload] = useState([]);
  const [fileload, setfileload] = useState(false);
  const [percentage, setpercentage] = useState(0);
  const [isAlert, setIsAlert] = useState(false);
  const handleStrInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInput = (e) => {
    setpercentage(0);
    try {
      let files = e.target.files;
      if (typeof files[0] !== "undefined") {
        const mb = Math.round(files[0].bytes / Math.pow(1024, 2));
        if (mb > 10) {
          alert(
            `The selected file size is too large. Please select a file less than ${Math.round(
              10
            )} MB`
          );
          return;
        }

        handleFileUpload(files[0]);
      } else {
        alert("Please select file.");
        return false;
      }
    } catch (error) {
      alert(error.message);
      return false;
    }
  };

  const handleFileUpload = async (file) => {
    Parse.serverURL = process.env.REACT_APP_SERVERURL;
    Parse.initialize(process.env.REACT_APP_APPID);
    setfileload(true);
    const fileName = file.name;
    const name = sanitizeFileName(fileName);
    const pdfFile = file;
    const parseFile = new Parse.File(name, pdfFile);

    try {
      const response = await parseFile.save({
        progress: (progressValue, loaded, total, { type }) => {
          if (type === "upload" && progressValue !== null) {
            const percentCompleted = Math.round((loaded * 100) / total);
            setpercentage(percentCompleted);
          }
        }
      });

      // The response object will contain information about the uploaded file
      // You can access the URL of the uploaded file using response.url()
      setFileUpload(response.url());
      setfileload(false);
      if (response.url()) {
        return response.url();
      }
    } catch (error) {
      setfileload(false);
      setpercentage(0);
      console.error("Error uploading file:", error);
    }
  };

  const dropboxSuccess = async (files) => {
    setfileload(true);
    const file = files[0];
    const url = file.link;
    const mb = Math.round(file.bytes / Math.pow(1024, 2));

    if (mb > 10) {
      setTimeout(() => {
        alert(
          `The selected file size is too large. Please select a file less than 10 MB`
        );
      }, 500);
      return;
    } else {
      const name = sanitizeFileName(file.name);

      const parseFile = new Parse.File(name, { uri: url });

      try {
        const response = await parseFile.save({
          progress: (progressValue, loaded, total, { type }) => {
            if (type === "upload" && progressValue !== null) {
              const percentCompleted = Math.round((loaded * 100) / total);
              setpercentage(percentCompleted);
            }
          }
        });
        setFileUpload(response.url());
        setfileload(false);

        if (response.url()) {
          return response.url();
        }
      } catch (error) {
        setfileload(false);
        setpercentage(0);
        console.error("Error uploading file:", error);
      }
    }
  };
  const dropboxCancel = async () => {};
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentUser = Parse.User.current();
      const template = new Parse.Object(templateCls);
      Object.entries(formData).forEach((item) =>
        template.set(item[0], item[1])
      );
      template.set("URL", fileupload);
      template.set("CreatedBy", Parse.User.createWithoutData(currentUser.id));
      if (folder && folder.ObjectId) {
        template.set("Folder", {
          __type: "Pointer",
          className: templateCls,
          objectId: folder.ObjectId
        });
      }
      if (signers && signers.length > 0) {
        template.set("Signers", signers);
      }
      const ExtCls = JSON.parse(localStorage.getItem("Extand_Class"));
      template.set("ExtUserPtr", {
        __type: "Pointer",
        className: "contracts_Users",
        objectId: ExtCls[0].objectId
      });

      const res = await template.save();
      if (res) {
        setIsAlert(true);
        setTimeout(() => {
          setIsAlert(false);
        }, 1000);
        setSigners([]);
        setFolder({ ObjectId: "", Name: "" });
        setFormData({
          Name: "",
          Description: "",
          Note: ""
        });
        setFileUpload([]);
        setpercentage(0);
        navigate(
          "/asmf/remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/template/" +
            res.id
        );
      }
    } catch (err) {
      console.log("err ", err);
      setIsAlert(true);
    }
  };

  const handleFolder = (data) => {
    setFolder(data);
  };
  // const handleSigners = (data) => {
  //   if (data && data.length > 0) {
  //     const updateSigners = data.map((x) => ({
  //       __type: "Pointer",
  //       className: "contracts_Contactbook",
  //       objectId: x
  //     }));
  //     setSigners(updateSigners);
  //   }
  // };

  const handleReset = () => {
    setSigners([]);
    setFolder({ ObjectId: "", Name: "" });
    setFormData({
      Name: "",
      Description: "",
      Note: ""
    });
    setFileUpload([]);
    setpercentage(0);
  };
  return (
    <div className="shadow-md rounded my-2 p-3 bg-[#ffffff] md:border-[1px] md:border-gray-600/50">
      <Title title="New Template" />
      {isAlert && <Alert type="success">Template created successfully!</Alert>}
      <form onSubmit={handleSubmit}>
        <h1 className="text-[20px] font-semibold mb-4">New Template</h1>
        {fileload && (
          <div className="flex items-center gap-x-2">
            <div className="h-2 rounded-full w-[200px] md:w-[400px] bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-black text-sm">{percentage}%</span>
          </div>
        )}
        <div className="text-xs">
          <label className="block">
            File<span className="text-red-500 text-[13px]">*</span>
          </label>
          {fileupload.length > 0 ? (
            <div className="flex gap-2 justify-center items-center">
              <div className="flex justify-between items-center px-2 py-2 w-full font-bold rounded border-[1px] border-[#ccc] text-gray-500 bg-white text-[13px]">
                <div className="break-all">
                  file selected : {fileupload?.split("/")[3]?.split("_")[1]}
                </div>
                <div
                  onClick={() => {
                    setFileUpload([]);
                  }}
                  className="cursor-pointer px-[10px] text-[20px] font-bold bg-white text-red-500"
                >
                  <i className="fa-solid fa-xmark"></i>
                </div>
              </div>
              {process.env.DROPBOX_APP_KEY && (
                <DropboxChooser
                  onSuccess={dropboxSuccess}
                  onCancel={dropboxCancel}
                />
              )}
            </div>
          ) : (
            <div className="flex gap-2 justify-center items-center">
              <input
                type="file"
                className="bg-white px-2 py-1.5 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                onChange={(e) => handleFileInput(e)}
                accept="application/pdf,application/vnd.ms-excel"
                required
              />
              {process.env.DROPBOX_APP_KEY && (
                <DropboxChooser
                  onSuccess={dropboxSuccess}
                  onCancel={dropboxCancel}
                />
              )}
            </div>
          )}
        </div>
        <div className="text-xs mt-2">
          <label className="block">
            Title<span className="text-red-500 text-[13px]">*</span>
          </label>
          <input
            name="Name"
            className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
            value={formData.Name}
            onChange={(e) => handleStrInput(e)}
            required
          />
        </div>
        <div className="text-xs mt-2">
          <label className="block">
            Note<span className="text-red-500 text-[13px]">*</span>
          </label>
          <input
            name="Note"
            className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
            value={formData.Note}
            onChange={(e) => handleStrInput(e)}
            required
          />
        </div>
        <div className="text-xs mt-2">
          <label className="block">Description</label>
          <input
            name="Description"
            className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
            value={formData.Description}
            onChange={(e) => handleStrInput(e)}
          />
        </div>
        {/* <SignersInput onChange={handleSigners} /> */}
        <SelectFolder onSuccess={handleFolder} folderCls={templateCls} />
        <div className="flex items-center mt-3 gap-2 text-white">
          <button
            className="bg-[#1ab6ce] rounded-sm shadow-md text-[14px] font-semibold uppercase text-white py-1.5 px-2.5 focus:outline-none"
            type="submit"
          >
            Submit
          </button>
          <div
            className="bg-[#188ae2] rounded-sm shadow-md text-[14px] font-semibold uppercase text-white py-1.5 px-2.5 text-center ml-[2px] focus:outline-none"
            onClick={() => handleReset()}
          >
            Reset
          </div>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm;
