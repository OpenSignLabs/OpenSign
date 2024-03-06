import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formJson } from "../json/FormJson";
import AddUser from "../components/AddUser";
import sanitizeFileName from "../primitives/sanitizeFileName";
import Parse from "parse";
import DropboxChooser from "../components/fields/DropboxChoose";
import Alert from "../primitives/Alert";
import SelectFolder from "../components/fields/SelectFolder";
import SignersInput from "../components/fields/SignersInput";
import Title from "../components/Title";
import PageNotFound from "./PageNotFound";

function Form() {
  const { id } = useParams();

  if (id === "lM0xRnM3iE") {
    return <AddUser />;
  } else {
    const config = formJson[id];
    if (config) {
      return <Forms {...config} />;
    } else {
      return <PageNotFound prefix={"Form"} />;
    }
  }
}

const Forms = (props) => {
  const navigate = useNavigate();
  const [signers, setSigners] = useState([]);
  const [folder, setFolder] = useState({ ObjectId: "", Name: "" });
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Note: "Please review and sign this document",
    TimeToCompleteDays: 15,
    SendinOrder: "false"
  });
  const [fileupload, setFileUpload] = useState([]);
  const [fileload, setfileload] = useState(false);
  const [percentage, setpercentage] = useState(0);
  const [isAlert, setIsAlert] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isErr, setIsErr] = useState("");
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
    e.stopPropagation();
    setIsSubmit(true);
    try {
      const currentUser = Parse.User.current();
      const object = new Parse.Object(props.Cls);
      object.set("Name", formData?.Name);
      object.set("Description", formData?.Description);
      object.set("Note", formData?.Note);
      if (props.title === "Request Signatures") {
        object.set(
          "TimeToCompleteDays",
          parseInt(formData?.TimeToCompleteDays)
        );
        const isChecked = formData.SendinOrder === "true" ? true : false;
        object.set("SendinOrder", isChecked);
      }
      object.set("URL", fileupload);
      object.set("CreatedBy", Parse.User.createWithoutData(currentUser.id));
      if (folder && folder.ObjectId) {
        object.set("Folder", {
          __type: "Pointer",
          className: props.Cls,
          objectId: folder.ObjectId
        });
      }
      if (signers && signers.length > 0) {
        object.set("Signers", signers);
      }
      const ExtCls = JSON.parse(localStorage.getItem("Extand_Class"));
      object.set("ExtUserPtr", {
        __type: "Pointer",
        className: "contracts_Users",
        objectId: ExtCls[0].objectId
      });

      const res = await object.save();
      if (res) {
        setSigners([]);
        setFolder({ ObjectId: "", Name: "" });
        setFormData({
          Name: "",
          Description: "",
          Note: ""
        });
        setFileUpload([]);
        setpercentage(0);
        navigate(`/${props?.redirectRoute}/${res.id}`);
      }
    } catch (err) {
      console.log("err ", err);
      setIsErr(true);
    } finally {
      setIsAlert(true);
      setTimeout(() => {
        setIsAlert(false);
      }, 1000);
      setIsSubmit(false);
    }
  };

  const handleFolder = (data) => {
    setFolder(data);
  };
  const handleSigners = (data) => {
    if (data && data.length > 0) {
      const updateSigners = data.map((x) => ({
        __type: "Pointer",
        className: "contracts_Contactbook",
        objectId: x
      }));
      setSigners(updateSigners);
    }
  };

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
      <Title title={props?.title} />
      {isAlert && (
        <Alert type={isErr ? "danger" : "success"}>
          {isErr
            ? "Something went wrong please try again!"
            : `${props.msgVar} created successfully!`}
        </Alert>
      )}
      {isSubmit ? (
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
      ) : (
        <form onSubmit={handleSubmit}>
          <h1 className="text-[20px] font-semibold mb-4">{props?.title}</h1>
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
                    file selected :{" "}
                    {fileupload?.split("/")?.pop()?.split("_")[1]}
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
                {process.env.REACT_APP_DROPBOX_API_KEY && (
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
                  accept="application/pdf"
                  required
                />
                {process.env.REACT_APP_DROPBOX_API_KEY && (
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
            <label className="block">Description</label>
            <input
              name="Description"
              className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
              value={formData.Description}
              onChange={(e) => handleStrInput(e)}
            />
          </div>
          {props.signers && <SignersInput onChange={handleSigners} required />}
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
          <SelectFolder onSuccess={handleFolder} folderCls={props.Cls} />

          {props.title === "Request Signatures" && (
            <div className="text-xs mt-2">
              <label className="block">
                Time To Complete (Days)
                <span className="text-red-500 text-[13px]">*</span>
              </label>
              <input
                type="number"
                name="TimeToCompleteDays"
                className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                value={formData.TimeToCompleteDays}
                onChange={(e) => handleStrInput(e)}
                required
              />
            </div>
          )}
          {props.title !== "Sign Yourself" && (
            <div className="text-xs mt-2">
              <label className="block">Send In Order</label>
              <div className="flex items-center gap-2 ml-2 mb-1">
                <input
                  type="radio"
                  value={"true"}
                  name="SendinOrder"
                  checked={formData.SendinOrder === "true"}
                  className=""
                  onChange={handleStrInput}
                />
                <div className="text-center">Yes</div>
              </div>
              <div className="flex items-center gap-2 ml-2 mb-1">
                <input
                  type="radio"
                  value={"false"}
                  name="SendinOrder"
                  checked={formData.SendinOrder === "false"}
                  onChange={handleStrInput}
                />
                <div className="text-center">No</div>
              </div>
            </div>
          )}
          <div className="flex items-center mt-3 gap-2 text-white">
            <button
              className={`${
                isSubmit && "cursor-progress"
              } bg-[#1ab6ce] rounded-sm shadow-md text-[13px] font-semibold uppercase text-white py-1.5 px-2.5 focus:outline-none`}
              type="submit"
              disabled={isSubmit}
            >
              Submit
            </button>
            <div
              className="bg-[#188ae2] rounded-sm shadow-md text-[13px] font-semibold uppercase text-white py-1.5 px-2.5 text-center ml-[2px] focus:outline-none"
              onClick={() => handleReset()}
            >
              Reset
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
export default Form;
