import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formJson } from "../json/FormJson";
import AddUser from "../components/AddUser";
import sanitizeFileName from "../primitives/sanitizeFileName";
import Parse from "parse";
import DropboxChooser from "../components/shared/fields/DropboxChoose";
import Alert from "../primitives/Alert";
import SelectFolder from "../components/shared/fields/SelectFolder";
import SignersInput from "../components/shared/fields/SignersInput";
import Title from "../components/Title";
import PageNotFound from "./PageNotFound";
import { SaveFileSize } from "../constant/saveFileSize";
import { checkIsSubscribed, getFileName, toDataUrl } from "../constant/Utils";
import { PDFDocument } from "pdf-lib";
import axios from "axios";
import { isEnableSubscription, submitBtn } from "../constant/const";
import ModalUi from "../primitives/ModalUi";
import { Tooltip } from "react-tooltip";
import Upgrade from "../primitives/Upgrade";
import PremiumAlertHeader from "../primitives/PremiumAlertHeader";

// `Form` render all type of Form on this basis of their provided in path
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
  const maxFileSize = 20;
  const abortController = new AbortController();
  const inputFileRef = useRef(null);
  const navigate = useNavigate();
  const [signers, setSigners] = useState([]);
  const [folder, setFolder] = useState({ ObjectId: "", Name: "" });
  const [formData, setFormData] = useState({
    Name: "",
    Description: "",
    Note: "",
    TimeToCompleteDays: 15,
    SendinOrder: "false",
    password: "",
    file: "",
    remindOnceInEvery: 5,
    autoreminder: false
  });
  const [fileupload, setFileUpload] = useState("");
  const [fileload, setfileload] = useState(false);
  const [percentage, setpercentage] = useState(0);
  const [isReset, setIsReset] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isErr, setIsErr] = useState("");
  const [isPassword, setIsPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isCorrectPass, setIsCorrectPass] = useState(true);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const handleStrInput = (e) => {
    setIsCorrectPass(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    handleReset();
    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title]);

  useEffect(() => {
    fetchSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchSubscription = async () => {
    if (isEnableSubscription) {
      const getIsSubscribe = await checkIsSubscribed();
      setIsSubscribe(getIsSubscribe);
    }
  };

  function getFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target.result);
      };

      reader.onerror = (e) => {
        reject(e.target.error);
      };

      reader.readAsArrayBuffer(file);
    });
  }
  const handleFileInput = async (e) => {
    setpercentage(0);
    try {
      let files = e.target.files;
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
      if (typeof files[0] !== "undefined") {
        const mb = Math.round(files[0].size / Math.pow(1024, 2));
        if (mb > maxFileSize) {
          alert(
            `The selected file size is too large. Please select a file less than ${maxFileSize} MB`
          );
          setFileUpload("");
          e.target.value = "";
          return;
        } else {
          if (files?.[0]?.type === "application/pdf") {
            try {
              const res = await getFileAsArrayBuffer(files[0]);
              await PDFDocument.load(res);
              handleFileUpload(files[0]);
            } catch (err) {
              if (err?.message?.includes("is encrypted")) {
                try {
                  await Parse.Cloud.run("encryptedpdf", {
                    email: Parse.User.current().getEmail()
                  });
                } catch (err) {
                  console.log("err in sending posthog encryptedpdf", err);
                }
                // console.log("err ", err);
                try {
                  setIsDecrypting(true);
                  const fileName = files?.[0].name;
                  const size = files?.[0].size;
                  const name = sanitizeFileName(fileName);
                  const url = "https://ai.nxglabs.in/decryptpdf"; //"https://ai.nxglabs.in/decryptpdf"; //
                  let formData = new FormData();
                  formData.append("file", files[0]);
                  formData.append("password", "");
                  const config = {
                    headers: {
                      "content-type": "multipart/form-data"
                      // sessiontoken: Parse.User.current().getSessionToken()
                    },
                    responseType: "blob"
                  };
                  const response = await axios.post(url, formData, config);
                  const pdfBlob = new Blob([response.data], {
                    type: "application/pdf"
                  });
                  const pdfFile = new File([pdfBlob], name, {
                    type: "application/pdf"
                  });
                  setIsDecrypting(false);
                  setfileload(true);

                  // Upload the file to Parse Server
                  const parseFile = new Parse.File(
                    name,
                    pdfFile,
                    "application/pdf"
                  );

                  await parseFile.save({
                    progress: (progressValue, loaded, total, { type }) => {
                      if (type === "upload" && progressValue !== null) {
                        const percentCompleted = Math.round(
                          (loaded * 100) / total
                        );
                        setpercentage(percentCompleted);
                      }
                    }
                  });

                  // Retrieve the URL of the uploaded file
                  if (parseFile.url()) {
                    setFileUpload(parseFile.url());
                    setfileload(false);
                    const tenantId = localStorage.getItem("TenantId");
                    SaveFileSize(size, parseFile.url(), tenantId);
                    return parseFile.url();
                  }
                } catch (err) {
                  setfileload(false);
                  setpercentage(0);
                  if (err?.response?.status === 401) {
                    setIsPassword(true);
                  } else {
                    console.log("Error uploading file: ", err?.response);
                    setIsDecrypting(false);
                    e.target.value = "";
                  }
                }
              } else {
                console.log("err ", err);
                setFileUpload("");
                e.target.value = "";
              }
            }
          } else {
            const isImage = files?.[0]?.type.includes("image/");
            if (isImage) {
              const image = await toDataUrl(files[0]);
              const pdfDoc = await PDFDocument.create();
              let embedImg;
              if (files?.[0]?.type === "image/png") {
                embedImg = await pdfDoc.embedPng(image);
              } else {
                embedImg = await pdfDoc.embedJpg(image);
              }

              // Get image dimensions
              const imageWidth = embedImg.width;
              const imageHeight = embedImg.height;
              const page = pdfDoc.addPage([imageWidth, imageHeight]);
              page.drawImage(embedImg, {
                x: 0,
                y: 0,
                width: imageWidth,
                height: imageHeight
              });
              const getFile = await pdfDoc.save({
                useObjectStreams: false
              });
              setfileload(true);
              const fileName = files[0].name;
              const size = files[0].size;
              const name = sanitizeFileName(fileName);
              const pdfName = `${name?.split(".")[0]}.pdf`;
              const parseFile = new Parse.File(
                pdfName,
                [...getFile],
                "application/pdf"
              );

              try {
                const response = await parseFile.save({
                  progress: (progressValue, loaded, total, { type }) => {
                    if (type === "upload" && progressValue !== null) {
                      const percentCompleted = Math.round(
                        (loaded * 100) / total
                      );
                      setpercentage(percentCompleted);
                    }
                  }
                });
                // The response object will contain information about the uploaded file
                // You can access the URL of the uploaded file using response.url()
                setFileUpload(response.url());
                setfileload(false);
                if (response.url()) {
                  const tenantId = localStorage.getItem("TenantId");
                  SaveFileSize(size, response.url(), tenantId);
                  return response.url();
                }
              } catch (error) {
                e.target.value = "";
                setfileload(false);
                setpercentage(0);
                console.error("Error uploading file:", error);
              }
            } else {
              if (isEnableSubscription) {
                try {
                  setfileload(true);
                  const url = "https://ai.nxglabs.in/docxtopdf";
                  let formData = new FormData();
                  formData.append("file", files[0]);
                  const config = {
                    headers: {
                      "content-type": "multipart/form-data",
                      sessiontoken: Parse.User.current().getSessionToken()
                    },
                    signal: abortController.signal
                  };
                  const res = await axios.post(url, formData, config);
                  if (res.data) {
                    setFileUpload(res.data.url);
                    setfileload(false);
                  }
                } catch (err) {
                  e.target.value = "";
                  setfileload(false);
                  setpercentage(0);
                  console.log("err in libreconverter ", err);
                }
              }
            }
          }
        }
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
    const size = file.size;
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
        const tenantId = localStorage.getItem("TenantId");
        SaveFileSize(size, response.url(), tenantId);
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
    const size = file.bytes;
    const url = file.link;
    const mb = Math.round(file.bytes / Math.pow(1024, 2));

    if (mb > maxFileSize) {
      setTimeout(() => {
        alert(
          `The selected file size is too large. Please select a file less than ${maxFileSize} MB`
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
          const tenantId = localStorage.getItem("TenantId");
          SaveFileSize(size, response.url(), tenantId);
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
    if (fileupload) {
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
        }
        if (props.title !== "Sign Yourself") {
          const isChecked = formData.SendinOrder === "false" ? false : true;
          object.set("SendinOrder", isChecked);
          object.set("AutomaticReminders", formData.autoreminder);
          object.set("RemindOnceInEvery", parseInt(formData.remindOnceInEvery));
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
          setFileUpload("");
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
    } else {
      alert("Please wait until the PDF has been uploading.");
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
    setIsReset(true);
    setSigners([]);
    setFolder({ ObjectId: "", Name: "" });
    setFormData({
      Name: "",
      Description: "",
      Note:
        props.title === "Sign Yourself"
          ? "Note to myself"
          : "Please review and sign this document",
      TimeToCompleteDays: 15,
      SendinOrder: "true",
      password: "",
      file: "",
      remindOnceInEvery: 5,
      autoreminder: false
    });
    setFileUpload("");
    setpercentage(0);
    setTimeout(() => setIsReset(false), 50);
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPassword(false);
    setfileload(true);
    try {
      const fileName = formData?.file?.name;
      const size = formData?.file?.size;
      const name = sanitizeFileName(fileName);
      const url = "https://ai.nxglabs.in/decryptpdf"; //
      let Data = new FormData();
      Data.append("file", formData?.file);
      Data.append("password", formData.password);
      const config = {
        headers: {
          "content-type": "multipart/form-data"
          // sessiontoken: Parse.User.current().getSessionToken()
        },
        responseType: "blob"
      };
      const response = await axios.post(url, Data, config);
      const pdfBlob = new Blob([response.data], {
        type: "application/pdf"
      });
      const pdfFile = new File([pdfBlob], name, {
        type: "application/pdf"
      });
      setIsDecrypting(false);
      // Upload the file to Parse Server
      const parseFile = new Parse.File(name, pdfFile, "application/pdf");

      await parseFile.save({
        progress: (progressValue, loaded, total, { type }) => {
          if (type === "upload" && progressValue !== null) {
            const percentCompleted = Math.round((loaded * 100) / total);
            setpercentage(percentCompleted);
          }
        }
      });

      // Retrieve the URL of the uploaded file
      if (parseFile.url()) {
        setFormData((prev) => ({ ...prev, password: "" }));
        setFileUpload(parseFile.url());
        setfileload(false);
        const tenantId = localStorage.getItem("TenantId");
        SaveFileSize(size, parseFile.url(), tenantId);
        return parseFile.url();
      }
    } catch (err) {
      setfileload(false);
      setpercentage(0);
      if (err?.response?.status === 401) {
        setIsPassword(true);
        setIsCorrectPass(false);
      } else {
        console.log("Error uploading file: ", err?.response);
        setFormData((prev) => ({ ...prev, password: "" }));
        setIsDecrypting(false);
        if (inputFileRef.current) {
          inputFileRef.current.value = ""; // Set file input value to empty string
        }
      }
    }
  };
  const handeCloseModal = () => {
    setIsPassword(false);
    setFormData((prev) => ({ ...prev, file: "", password: "" }));
    setIsDecrypting(false);
    setfileload(false);
    if (inputFileRef.current) {
      inputFileRef.current.value = ""; // Set file input value to empty string
    }
  };
  const handleAutoReminder = () => {
    setFormData((prev) => ({ ...prev, autoreminder: !formData.autoreminder }));
  };
  return (
    <div className="shadow-md rounded my-2 p-3 bg-base-100 text-base-content md:border-[1px] md:border-gray-600/50">
      <Title title={props?.title} />
      {isAlert && (
        <Alert type={isErr ? "danger" : "success"}>
          {isErr
            ? "Something went wrong please try again!"
            : `${props.msgVar} created successfully!`}
        </Alert>
      )}
      {isSubmit ? (
        <div className="h-[300px] text-[45px] text-[#3dd3e0] flex justify-center items-center">
          <div className="loader-37"></div>
        </div>
      ) : (
        <>
          <ModalUi
            isOpen={isPassword}
            handleClose={() => handeCloseModal()}
            title={"Enter Pdf Password"}
          >
            <form onSubmit={handlePasswordSubmit}>
              <div className="px-6 pt-3 pb-2">
                <label className="mb-2 text-xs">Password</label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handleStrInput(e)}
                  className="px-3 py-2 w-full border-[1px] border-gray-300 rounded focus:outline-none text-xs"
                  placeholder="Enter pdf password"
                  required
                />
                {!isCorrectPass ? (
                  <p className="ml-2 text-[11px] text-red-600">
                    Please provide correct password
                  </p>
                ) : (
                  <p className="ml-2 text-[11px] text-transparent text-red-600">
                    .
                  </p>
                )}
              </div>
              <hr />
              <div className="px-6 my-3">
                <button type="submit" className={submitBtn}>
                  Submit
                </button>
              </div>
            </form>
          </ModalUi>
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
                <span className="text-base-content text-sm">{percentage}%</span>
              </div>
            )}
            {isDecrypting && (
              <div className="flex items-center gap-x-2">
                <span className="text-base-content text-sm">
                  Decrypting pdf please wait...
                </span>
              </div>
            )}
            <div className="text-xs">
              <label className="block">
                {`File (pdf, png, jpg, jpeg${
                  isEnableSubscription ? ", docx)" : ")"
                }`}
                <span className="text-red-500 text-[13px]">*</span>
              </label>
              {fileupload.length > 0 ? (
                <div className="flex gap-2 justify-center items-center">
                  <div className="flex justify-between items-center op-input op-input-bordered op-input-sm w-full text-x text-[13px]">
                    <div className="break-all">
                      file selected : {getFileName(fileupload)}
                    </div>
                    <div
                      onClick={() => setFileUpload("")}
                      className="cursor-pointer px-[10px] text-[20px] font-bold text-red-500"
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
                <div className="flex gap-2 justify-center items-center ">
                  <input
                    type="file"
                    className="op-file-input op-file-input-bordered op-file-input-sm w-full text-xs"
                    onChange={(e) => handleFileInput(e)}
                    ref={inputFileRef}
                    accept={
                      isEnableSubscription
                        ? "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                        : "application/pdf,image/png,image/jpeg"
                    }
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
                {props.title === "New Template"
                  ? "Template Title"
                  : "Document Title"}
                <span className="text-red-500 text-[13px]">*</span>
              </label>
              <input
                name="Name"
                className="op-input op-input-bordered op-input-sm w-full text-xs"
                value={formData.Name}
                onChange={(e) => handleStrInput(e)}
                required
              />
            </div>
            <div className="text-xs mt-2">
              <label className="block">Description</label>
              <input
                name="Description"
                className="op-input op-input-bordered op-input-sm w-full text-xs"
                value={formData.Description}
                onChange={(e) => handleStrInput(e)}
              />
            </div>
            {props.signers && (
              <SignersInput
                onChange={handleSigners}
                isReset={isReset}
                required
              />
            )}
            <div className="text-xs mt-2">
              <label className="block">
                Note<span className="text-red-500 text-[13px]">*</span>
              </label>
              <input
                name="Note"
                className="op-input op-input-bordered op-input-sm w-full text-xs"
                value={formData.Note}
                onChange={(e) => handleStrInput(e)}
                required
              />
            </div>
            {props.title !== "New Template" && (
              <SelectFolder
                onSuccess={handleFolder}
                folderCls={props.Cls}
                isReset={isReset}
              />
            )}
            {props.title === "Request Signatures" && (
              <div className="text-xs mt-2">
                <label className="block">
                  Time To Complete (Days)
                  <span className="text-red-500 text-[13px]">*</span>
                </label>
                <input
                  type="number"
                  name="TimeToCompleteDays"
                  className="op-input op-input-bordered op-input-sm w-full text-xs"
                  value={formData.TimeToCompleteDays}
                  onChange={(e) => handleStrInput(e)}
                  required
                />
              </div>
            )}
            {props.title !== "Sign Yourself" && (
              <>
                <div className="text-xs mt-2">
                  <label className="block">
                    Send In Order
                    <a data-tooltip-id="sendInOrder-tooltip" className="ml-1">
                      <sup>
                        <i
                          className="fa-solid fa-question rounded-full"
                          style={{
                            borderColor: "#33bbff",
                            color: "#33bbff",
                            fontSize: 13,
                            borderWidth: 1.5,
                            padding: "1.5px 4px"
                          }}
                        ></i>
                      </sup>
                    </a>
                    <Tooltip id="sendInOrder-tooltip" className="z-50">
                      <div className="max-w-[200px] md:max-w-[450px]">
                        <p className="font-bold">Send in Order</p>
                        <p>
                          Choose how you want the signing requests to be sent to
                          the document signers:
                        </p>
                        <p className="p-[5px]">
                          <ol className="list-disc">
                            <li>
                              <span className="font-bold">Yes:</span>
                              <span>
                                Selecting this option will send the signing
                                request to the first signer initially. Once the
                                first signer completes their part, the next
                                signer in the sequence will receive the request.
                                This process continues until all signers have
                                signed the document. This method ensures that
                                the document is signed in a specific order.
                              </span>
                            </li>
                            <li>
                              <span className="font-bold">No: </span>
                              <span>
                                Selecting this option will send the signing
                                links to all signers simultaneously. Every
                                signer can sign the document at their
                                convenience, regardless of whether other signers
                                have completed their signatures. This method is
                                faster but does not enforce any signing order
                                among the participants.
                              </span>
                            </li>
                          </ol>
                        </p>

                        <p>
                          Select the option that best suits the needs of your
                          document processing.
                        </p>
                      </div>
                    </Tooltip>
                  </label>
                  <div className="flex items-center gap-2 ml-2 mb-1">
                    <input
                      type="radio"
                      value={"true"}
                      className="op-radio op-radio-xs"
                      name="SendinOrder"
                      checked={formData.SendinOrder === "true"}
                      onChange={handleStrInput}
                    />
                    <div className="text-center">Yes</div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 mb-1">
                    <input
                      type="radio"
                      value={"false"}
                      name="SendinOrder"
                      className="op-radio op-radio-xs"
                      checked={formData.SendinOrder === "false"}
                      onChange={handleStrInput}
                    />
                    <div className="text-center">No</div>
                  </div>
                </div>
                <div className="text-xs mt-2">
                  {!isEnableSubscription && (
                    <PremiumAlertHeader
                      message={
                        "Disable Auto reminder is free in beta, this feature will incur a fee later."
                      }
                    />
                  )}
                  <span
                    className={
                      isSubscribe || !isEnableSubscription
                        ? "font-semibold"
                        : "font-semibold text-gray-300"
                    }
                  >
                    Auto reminder{"  "}
                    {!isSubscribe && isEnableSubscription && <Upgrade />}
                  </span>
                  <label
                    className={`${
                      isSubscribe || !isEnableSubscription
                        ? "cursor-pointer "
                        : "pointer-events-none opacity-50"
                    } relative block items-center mb-0`}
                  >
                    <input
                      type="checkbox"
                      className="op-toggle transition-all checked:[--tglbg:#3368ff] checked:bg-white"
                      checked={formData.autoreminder}
                      onChange={handleAutoReminder}
                    />
                  </label>
                </div>
                {formData?.autoreminder === true && (
                  <div className="text-xs mt-2">
                    <label className="block">
                      Remind once in every (Days)
                      <span className="text-red-500 text-[13px]">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.remindOnceInEvery}
                      name="remindOnceInEvery"
                      className="op-input op-input-bordered op-input-sm w-full text-xs"
                      onChange={handleStrInput}
                      required
                    />
                  </div>
                )}
              </>
            )}
            <div className="flex items-center mt-3 gap-2 text-white">
              <button
                className={`${
                  isSubmit ? "cursor-progress" : ""
                } op-btn op-btn-primary`}
                type="submit"
                disabled={isSubmit}
              >
                Next
              </button>
              <div
                className="op-btn op-btn-neutral"
                onClick={() => handleReset()}
              >
                Reset
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
export default Form;
