import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { formJson } from "../json/FormJson";
import Parse from "parse";
import Alert from "../primitives/Alert";
import SelectFolder from "../components/shared/fields/SelectFolder";
import SignersInput from "../components/shared/fields/SignersInput";
import Title from "../components/Title";
import PageNotFound from "./PageNotFound";
import { SaveFileSize } from "../constant/saveFileSize";
import {
  flattenPdf,
  generatePdfName,
  generateTitleFromFilename,
  getSecureUrl,
  toDataUrl,
  decryptPdf,
  base64ToFile,
  getFileAsArrayBuffer,
  removeTrailingSegment
} from "../constant/Utils";
import { PDFDocument } from "pdf-lib";
import axios from "axios";
import {
  maxFileSize,
  maxDescriptionLength,
  maxNoteLength,
  maxTitleLength
} from "../constant/const";
import ModalUi from "../primitives/ModalUi";
import { Tooltip } from "react-tooltip";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";

// `Form` render all type of Form on this basis of their provided in path
function Form() {
  const { id } = useParams();

  const config = formJson[id];
  if (config) {
    return <Forms {...config} />;
  } else {
    return <PageNotFound prefix={"Form"} />;
  }
}

const Forms = (props) => {
  const appName =
    "OpenSign™";
  const { t } = useTranslation();
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
    autoreminder: false,
    IsEnableOTP: "false",
    IsTourEnabled: "false",
    NotifyOnSignatures: "",
    Bcc: [],
    RedirectUrl: "",
    AllowModifications: false
  });
  const [fileupload, setFileUpload] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileload, setfileload] = useState(false);
  const [percentage, setpercentage] = useState(0);
  const [isReset, setIsReset] = useState(false);
  const [isAlert, setIsAlert] = useState({ type: "success", message: "" });
  const [isSubmit, setIsSubmit] = useState(false);
  const [isPassword, setIsPassword] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isCorrectPass, setIsCorrectPass] = useState(true);
  const [isAdvanceOpt, setIsAdvanceOpt] = useState(false);
  const [bcc, setBcc] = useState([]);

  const handleStrInput = (e) => {
    setIsCorrectPass(true);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const extUserData =
    localStorage.getItem("Extand_Class") &&
    JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
  const sendinorder =
    extUserData?.SendinOrder !== undefined && extUserData?.SendinOrder === false
      ? "false"
      : "true";
  const istourenabled =
    extUserData?.IsTourEnabled !== undefined &&
    extUserData?.IsTourEnabled === false
      ? "false"
      : "true";
  useEffect(() => {
    handleReset();
    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title]);

  useEffect(() => {
    initializeValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const initializeValues = async () => {
      setFormData((obj) => ({
        ...obj,
        NotifyOnSignatures: true,
        SendinOrder: sendinorder,
        IsTourEnabled: istourenabled
      }));
  };

  // `removeFile` is used to reset progress, percentage and remove file if exists
  const removeFile = (e) => {
    setfileload(false);
    setpercentage(0);
    if (e) {
      e.target.value = "";
    }
  };
  const handleFileInput = async (e) => {
    setpercentage(0);
    try {
      const files = Array.from(e.target.files);
      const filesNameArr = files.map((f) => f.name);
      setSelectedFiles(filesNameArr);
      if (!files.length) {
        alert(t("file-alert-2"));
        return;
      }
      // setFormData((prev) => ({ ...prev, file: files[0] }));
      const totalMb = Math.round(
        files.reduce((sum, f) => sum + f.size, 0) / Math.pow(1024, 2)
      );
      if (totalMb > maxFileSize) {
        alert(`${t("file-alert-1")} ${maxFileSize} MB`);
        setFileUpload("");
        setSelectedFiles([]);
        removeFile(e);
        return;
      }

      const pdfBuffers = [];
      for (const file of files) {
        setFormData((prev) => ({ ...prev, file: file }));
        if (file.type === "application/pdf") {
          try {
            const buffer = await getFileAsArrayBuffer(file);
            const flat = await flattenPdf(buffer);
            pdfBuffers.push(flat);
          } catch (err) {
            if (err?.message?.includes("is encrypted")) {
              try {
                setIsDecrypting(true);
                const pdfFile = await decryptPdf(file, "");
                setIsDecrypting(false);
                setfileload(true);
                const res = await getFileAsArrayBuffer(pdfFile);
                const flatPdf = await flattenPdf(res);
                // Upload the file to Parse Server
                pdfBuffers.push(flatPdf);
              } catch (err) {
                removeFile(e);
                if (err?.response?.status === 401) {
                  // setIsPassword(true);
                  const password = prompt(
                    `PDF "${file.name}" is password-protected. Enter password:`
                  );

                  if (password) {
                    try {
                      const pdfFile = await decryptPdf(file, password);
                      setIsDecrypting(false);
                      setfileload(true);
                      const res = await getFileAsArrayBuffer(pdfFile);
                      const flatPdf = await flattenPdf(res);
                      // Upload the file to Parse Server
                      pdfBuffers.push(flatPdf);
                    } catch (err) {
                      console.error(
                        "Incorrect password or decryption failed",
                        err
                      );
                      setSelectedFiles(
                        filesNameArr.filter((f) => f !== file.name)
                      );
                      setIsDecrypting(false);
                      setfileload(false);
                      removeFile(e);
                      alert(`Incorrect password for file: ${file.name}`);
                    }
                  } else {
                    console.error("password not provided");
                    setSelectedFiles(
                      filesNameArr.filter((f) => f !== file.name)
                    );
                    setIsDecrypting(false);
                    setfileload(false);
                    removeFile(e);
                  }
                } else {
                  console.log("Error uploading file: ", err?.response);
                  setIsDecrypting(false);
                  e.target.value = "";
                  removeFile(e);
                }
              }
            } else {
              console.log("err ", err);
              removeFile(e);
            }
          }
        } else if (file.type.includes("image/")) {
          const image = await toDataUrl(file);
          const pdfDoc = await PDFDocument.create();
          const embed =
            file.type === "image/png"
              ? await pdfDoc.embedPng(image)
              : await pdfDoc.embedJpg(image);
          const page = pdfDoc.addPage([embed.width, embed.height]);
          page.drawImage(embed, {
            x: 0,
            y: 0,
            width: embed.width,
            height: embed.height
          });
          const bytes = await pdfDoc.save({ useObjectStreams: false });
          pdfBuffers.push(bytes);
        } else if (
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.name.toLowerCase().endsWith(".docx")
        ) {
          try {
            const baseApi = localStorage.getItem("baseUrl") || "";
            const url = removeTrailingSegment(baseApi) + "/docxtopdf";
            let fd = new FormData();
            fd.append("file", file);
            setfileload(true);
            setpercentage(0);
            const config = {
              headers: {
                "content-type": "multipart/form-data",
                sessiontoken: Parse.User.current().getSessionToken()
              },
              signal: abortController.signal,
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                  );
                  setpercentage(percentCompleted);
                }
              }
            };
            const res = await axios.post(url, fd, config);
            if (res.data?.url) {
              const pdfRes = await axios.get(res.data.url, {
                responseType: "arraybuffer"
              });
              pdfBuffers.push(pdfRes.data);
            }
            setfileload(false);
          } catch (err) {
            setfileload(false);
            removeFile(e);
            console.log("err in docx to pdf ", err);
            const error = isOpenSignDomain
              ? `${t("docx-error")} ${t("docx-error-contact")}`
              : t("docx-error");
            alert(error);
            return;
          }
        }
      }

      if (!pdfBuffers.length) {
        alert(t("file-alert-2"));
        setSelectedFiles([]);
        return;
      }

      setfileload(true);
      const merged = await PDFDocument.create();
      for (const bytes of pdfBuffers) {
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }

      const pdfBytes = await merged.save({ useObjectStreams: false });
      const name = generatePdfName(16);
      const pdfName = `${name}.pdf`;
      let uploadedUrl = "";
        const parseFile = new Parse.File(
          pdfName,
          [...pdfBytes],
          "application/pdf"
        );
        const response = await parseFile.save({
          progress: (progressValue, loaded, total, { type }) => {
            if (type === "upload" && progressValue !== null) {
              const percentCompleted = Math.round((loaded * 100) / total);
              setpercentage(percentCompleted);
            }
          }
        });
        if (response.url()) {
          const fileRes = await getSecureUrl(response.url());
          if (fileRes.url) {
            uploadedUrl = fileRes.url;
          }
        }
      if (uploadedUrl) {
        const tenantId = localStorage.getItem("TenantId");
        SaveFileSize(pdfBytes.byteLength, uploadedUrl, tenantId);
        setFileUpload(uploadedUrl);
        setfileload(false);
        const title = generateTitleFromFilename(filesNameArr?.[0]);
        setFormData((obj) => ({ ...obj, Name: title }));
        removeFile(e);
      } else {
        setfileload(false);
        removeFile(e);
        setSelectedFiles([]);
      }
    } catch (error) {
      alert(error.message);
      setSelectedFiles([]);
    }
  };
  // `isValidURL` is used to check valid webhook url
  function isValidURL(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch (error) {
      return false;
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileupload) {
      if (formData?.Name?.length > maxTitleLength) {
        alert(t("title-length-alert"));
        return;
      }
      if (formData?.Note?.length > maxNoteLength) {
        alert(t("note-length-alert"));
        return;
      }
      if (formData?.Description?.length > maxDescriptionLength) {
        alert(t("description-length-alert"));
        return;
      }
      if (formData.RedirectUrl && !isValidURL(formData?.RedirectUrl)) {
        alert(t("invalid-redirect-url"));
        return;
      }
      setIsSubmit(true);
      try {
        const currentUser = Parse.User.current();
        const object = new Parse.Object(props.Cls);
        object.set("Name", formData?.Name);
        object.set("Description", formData?.Description);
        object.set("Note", formData?.Note);
        if (props.title === "Request Signatures") {
          if (
            extUserData?.TenantId?.RequestBody &&
            extUserData?.TenantId?.RequestSubject
          ) {
            object.set("RequestBody", extUserData?.TenantId?.RequestBody);
            object.set("RequestSubject", extUserData?.TenantId?.RequestSubject);
          }
        }
        if (props.title !== "Sign Yourself") {
          const isChecked = formData.SendinOrder === "false" ? false : true;
          const isTourEnabled =
            formData?.IsTourEnabled === "false" ? false : true;
          const remindOnceInEvery = parseInt(formData.remindOnceInEvery);
          const TimeToCompleteDays = parseInt(formData?.TimeToCompleteDays);
          const AutomaticReminders = formData.autoreminder;
          const reminderCount = TimeToCompleteDays / remindOnceInEvery;
          if (AutomaticReminders && reminderCount > 15) {
            alert(t("only-15-reminder-allowed"));
            return;
          }
          object.set("SendinOrder", isChecked);
          object.set("AutomaticReminders", AutomaticReminders);
          object.set("RemindOnceInEvery", remindOnceInEvery);
          object.set("IsTourEnabled", isTourEnabled);
          object.set("TimeToCompleteDays", TimeToCompleteDays);
            object.set("AllowModifications", false);
            object.set("IsEnableOTP", false);
            if (formData.NotifyOnSignatures !== undefined) {
              object.set("NotifyOnSignatures", formData.NotifyOnSignatures);
            }
          if (formData?.RedirectUrl) {
            object.set("RedirectUrl", formData.RedirectUrl);
          }
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
        if (bcc && bcc.length > 0) {
          const Bcc = bcc.map((x) => ({
            __type: "Pointer",
            className: "contracts_Contactbook",
            objectId: x.objectId
          }));
          object.set("Bcc", Bcc);
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
          setBcc([]);
          setFolder({ ObjectId: "", Name: "" });
          const notifySign =
                extUserData?.NotifyOnSignatures !== undefined
                ? extUserData?.NotifyOnSignatures
                : true;
          setFormData({
            Name: "",
            Description: "",
            Note:
              props.title === "Sign Yourself"
                ? "Note to myself"
                : "Please review and sign this document",
            TimeToCompleteDays: 15,
            SendinOrder: sendinorder,
            password: "",
            file: "",
            NotifyOnSignatures: notifySign,
            remindOnceInEvery: 5,
            autoreminder: false,
            IsEnableOTP: "false",
            IsTourEnabled: istourenabled,
            RedirectUrl: "",
            AllowModifications: false
          });
          setFileUpload("");
          setSelectedFiles([]);
          setpercentage(0);
          navigate(`/${props?.redirectRoute}/${res.id}`);
        }
      } catch (err) {
        console.log("err ", err);
        if (err.message === "only 15 reminder allowed") {
          setIsAlert({
            type: "danger",
            message: t("only-15-reminder-allowed")
          });
        } else {
          setIsAlert({
            type: "danger",
            message: t("something-went-wrong-mssg")
          });
        }
      } finally {
        setTimeout(() => setIsAlert({ type: "success", message: "" }), 1000);
        setIsSubmit(false);
      }
    } else {
      alert(t("file-alert-3"));
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

  const handleBcc = (data) => {
    if (data && data.length > 0) {
      const trimEmail = data.map((item) => ({
        objectId: item?.value,
        Name: item?.label,
        Email: item?.email
      }));
      setBcc(trimEmail);
    }
  };

  const handleReset = () => {
    setIsReset(true);
    setSigners([]);
    setBcc([]);
    setFolder({ ObjectId: "", Name: "" });
    const notifySign =
          extUserData?.NotifyOnSignatures !== undefined
          ? extUserData?.NotifyOnSignatures
          : true;
    let obj = {
      Name: "",
      Description: "",
      Note:
        props.title === "Sign Yourself"
          ? "Note to myself"
          : "Please review and sign this document",
      TimeToCompleteDays: 15,
      SendinOrder: sendinorder,
      password: "",
      file: "",
      remindOnceInEvery: 5,
      autoreminder: false,
      IsEnableOTP: "false",
      IsTourEnabled: istourenabled,
      NotifyOnSignatures: notifySign,
      RedirectUrl: "",
      AllowModifications: false
    };
    setFormData(obj);
    removeFile();
    setFileUpload("");
    setSelectedFiles([]);
    setTimeout(() => setIsReset(false), 50);
  };
  const handleCancel = () => {
    navigate("/dashboard/35KBoSgoAK");
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPassword(false);
    setfileload(true);
    try {
      const size = formData?.file?.size;
      const name = generatePdfName(16);
      const pdfFile = await decryptPdf(formData?.file, formData?.password);
      setIsDecrypting(false);
        const res = await getFileAsArrayBuffer(pdfFile);
        const flatPdf = await flattenPdf(res);
        const parseFile = new Parse.File(name, [...flatPdf], "application/pdf");
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
          const fileRes = await getSecureUrl(parseFile.url());
          if (fileRes.url) {
            setFileUpload(fileRes.url);
            removeFile();
            const title = generateTitleFromFilename(formData?.file?.name);
            setFormData((obj) => ({ ...obj, password: "", Name: title }));
            const tenantId = localStorage.getItem("TenantId");
            SaveFileSize(size, fileRes.url, tenantId);
            return fileRes.url;
          } else {
            removeFile();
            setFormData((prev) => ({ ...prev, password: "" }));
            setIsDecrypting(false);
            if (inputFileRef.current) {
              inputFileRef.current.value = ""; // Set file input value to empty string
            }
          }
        } else {
          removeFile();
          setFormData((prev) => ({ ...prev, password: "" }));
          setIsDecrypting(false);
          if (inputFileRef.current) {
            inputFileRef.current.value = ""; // Set file input value to empty string
          }
        }
    } catch (err) {
      removeFile();
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

  // `handleNotifySignChange` is trigger when user change radio of notify on signatures
  const handleNotifySignChange = (value) => {
    setFormData((obj) => ({ ...obj, NotifyOnSignatures: value }));
  };

  return (
    <div className="shadow-md rounded-box my-[2px] p-3 bg-base-100 text-base-content">
      <Title title={props?.title} />
      {isAlert?.message && <Alert type={isAlert.type}>{isAlert.message}</Alert>}
      {isSubmit ? (
        <div className="h-[300px] flex justify-center items-center">
          <Loader />
        </div>
      ) : (
        <>
          <ModalUi
            isOpen={isPassword}
            handleClose={() => handeCloseModal()}
            title={t("enter-pdf-password")}
          >
            <form onSubmit={handlePasswordSubmit}>
              <div className="px-6 pt-3 pb-2">
                <label className="mb-2 text-xs text-base-content">
                  {t("password")}
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={(e) => handleStrInput(e)}
                  className="w-full op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                  placeholder="Enter pdf password"
                  onInvalid={(e) =>
                    e.target.setCustomValidity(t("input-required"))
                  }
                  onInput={(e) => e.target.setCustomValidity("")}
                  required
                />
                <p
                  className={`${
                    !isCorrectPass
                      ? "text-red-600"
                      : "text-transparent pointer-events-none"
                  } ml-2 text-[11px] `}
                >
                  {t("correct-password")}
                </p>
              </div>
              <div className="px-6 mb-3">
                <button type="submit" className="op-btn op-btn-primary">
                  {t("submit")}
                </button>
              </div>
            </form>
          </ModalUi>
          <form onSubmit={handleSubmit}>
            <div className="mb-[11px]">
              <h1 className="text-[20px] font-semibold">
                {t(`form-name.${props?.title}`)}
              </h1>
              {props.title === "Sign Yourself" && (
                <div className="text-gray-500 text-xs mt-1">
                  {t("signyour-self-description")}
                </div>
              )}
              {props.title === "Request Signatures" && (
                <div className="text-gray-500 text-xs mt-1">
                  {t("requestsign-description")}
                </div>
              )}
              {props.title === "New Template" && (
                <div className="text-gray-500 text-xs mt-1">
                  {t("template-form-description")}
                </div>
              )}
            </div>
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
                  {t("decrypting-pdf")}
                </span>
              </div>
            )}
            <div className="text-xs">
              <label className="block">
                {`${`${t("report-heading.File")} (${t("file-type")}`}${", docx)"}`}
                <span className="text-red-500 text-[13px]">*</span>
              </label>
              {fileupload.length > 0 ? (
                <div className="flex gap-1 justify-center items-center">
                  <div className="flex justify-between items-center op-input op-input-bordered op-input-sm w-full h-full text-[13px]">
                    <div className="break-all cursor-default">
                      {t("file-selected")}: {selectedFiles.join(", ")}
                    </div>
                    <div
                      onClick={() => {
                        setFileUpload("");
                        setSelectedFiles([]);
                      }}
                      className="cursor-pointer px-[10px] text-[20px] font-bold text-red-500"
                    >
                      <i className="fa-light fa-xmark"></i>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-1 justify-center items-center">
                  <input
                    type="file"
                    multiple
                    className="op-file-input op-file-input-bordered op-file-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    onChange={(e) => handleFileInput(e)}
                    ref={inputFileRef}
                    accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                    onInvalid={(e) =>
                      e.target.setCustomValidity(t("input-required"))
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    required
                  />
                </div>
              )}
            </div>
            <div className="text-xs mt-2">
              <label className="block">
                {props.title === "New Template"
                  ? t("template-title")
                  : t("document-title")}
                <span className="text-red-500 text-[13px]">*</span>
              </label>
              <input
                name="Name"
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                value={formData.Name}
                onChange={(e) => handleStrInput(e)}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
            {props.title === "New Template" && (
              <div className="text-xs mt-2">
                <label className="block">{t("description")}</label>
                <input
                  name="Description"
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                  value={formData.Description}
                  onChange={(e) => handleStrInput(e)}
                />
              </div>
            )}
            {props.signers && (
              <SignersInput
                label={t("signers")}
                onChange={handleSigners}
                isReset={isReset}
                helptextZindex={50}
                required
              />
            )}
            <div className="text-xs mt-2">
              <label className="block">
                {t("report-heading.Note")}
                <span className="text-red-500 text-[13px]">*</span>
              </label>
              <input
                name="Note"
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                value={formData.Note}
                onChange={(e) => handleStrInput(e)}
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
              />
            </div>
            {props.title === "Sign Yourself" ? (
              <SelectFolder
                onSuccess={handleFolder}
                folderCls={props.Cls}
                isReset={isReset}
              />
            ) : (
              <div className="flex flex-col md:flex-row w-full mt-4 md:mt-10 gap-3 ">
                <div className="card bg-base-100 rounded-box  flex-grow p-3  ">
                  {props.title !== "New Template" ? (
                    <SelectFolder
                      onSuccess={handleFolder}
                      folderCls={props.Cls}
                      isReset={isReset}
                    />
                  ) : (
                    <>
                      <span className=" mb-2 font-[400]">
                        {t("form-title-1")}
                      </span>
                      <div className="text-xs mt-3">
                        <label className="block">
                          {t("send-in-order")}
                          <a
                            data-tooltip-id="sendInOrder-tooltip"
                            className="ml-1"
                          >
                            <sup>
                              <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                            </sup>
                          </a>
                          <Tooltip id="sendInOrder-tooltip" className="z-[999]">
                            <div className="max-w-[200px] md:max-w-[450px]">
                              <p className="font-bold">{t("send-in-order")}</p>
                              <p>{t("send-in-order-help.p1")}</p>
                              <div className="p-[5px]">
                                <ol className="list-disc">
                                  <li>
                                    <span className="font-bold">
                                      {t("yes")}:{" "}
                                    </span>
                                    <span>{t("send-in-order-help.p2")}</span>
                                  </li>
                                  <li>
                                    <span className="font-bold">
                                      {t("no")}:{" "}
                                    </span>
                                    <span>{t("send-in-order-help.p3")}</span>
                                  </li>
                                </ol>
                              </div>
                              <p>{t("send-in-order-help.p4")}</p>
                            </div>
                          </Tooltip>
                        </label>
                        <div className="flex flex-col md:flex-row md:gap-4">
                          <div className="flex items-center gap-2 ml-2 mb-1">
                            <input
                              type="radio"
                              value={"true"}
                              className="op-radio op-radio-xs"
                              name="SendinOrder"
                              checked={formData.SendinOrder === "true"}
                              onChange={handleStrInput}
                            />
                            <div className="text-center">{t("yes")}</div>
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
                            <div className="text-center">{t("no")}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {isAdvanceOpt && (
                    <>
                      {props.title === "New Template" &&
                        formData?.autoreminder === true && (
                          <div className="text-xs mt-2">
                            <label className="block">
                              {t("remind-once")}
                              <span className="text-red-500 text-[13px]">
                                *
                              </span>
                            </label>
                            <input
                              type="number"
                              value={formData.remindOnceInEvery}
                              name="remindOnceInEvery"
                              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                              onChange={handleStrInput}
                              onInvalid={(e) =>
                                e.target.setCustomValidity(t("input-required"))
                              }
                              onInput={(e) => e.target.setCustomValidity("")}
                              required
                            />
                          </div>
                        )}
                      {props.title !== "New Template" && (
                        <>
                          <span className=" mt-2 font-[400]">
                            {t("form-title-1")}
                          </span>
                          <div className="text-xs mt-3">
                            <label className="block">
                              {t("send-in-order")}
                              <a
                                data-tooltip-id="sendInOrder-tooltip"
                                className="ml-1"
                              >
                                <sup>
                                  <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                                </sup>
                              </a>
                              <Tooltip
                                id="sendInOrder-tooltip"
                                className="z-[999]"
                              >
                                <div className="max-w-[200px] md:max-w-[450px]">
                                  <p className="font-bold">
                                    {t("send-in-order")}
                                  </p>
                                  <p>{t("send-in-order-help.p1")}</p>
                                  <div className="p-[5px]">
                                    <ol className="list-disc">
                                      <li>
                                        <span className="font-bold">
                                          {t("yes")}:{" "}
                                        </span>
                                        <span>
                                          {t("send-in-order-help.p2")}
                                        </span>
                                      </li>
                                      <li>
                                        <span className="font-bold">
                                          {t("no")}:{" "}
                                        </span>
                                        <span>
                                          {t("send-in-order-help.p3")}
                                        </span>
                                      </li>
                                    </ol>
                                  </div>
                                  <p>{t("send-in-order-help.p4")}</p>
                                </div>
                              </Tooltip>
                            </label>
                            <div className="flex flex-col md:flex-row md:gap-4">
                              <div className="flex items-center gap-2 ml-2 mb-1">
                                <input
                                  type="radio"
                                  value={"true"}
                                  className="op-radio op-radio-xs"
                                  name="SendinOrder"
                                  checked={formData.SendinOrder === "true"}
                                  onChange={handleStrInput}
                                />
                                <div className="text-center">{t("yes")}</div>
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
                                <div className="text-center">{t("no")}</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="overflow-y-auto z-[40] transition-all">
                        {props.title !== "Sign yourself" && (
                          <div className="text-xs mt-2">
                            <label className="block">
                              {t("time-to-complete")}
                              <span className="text-red-500 text-[13px]">
                                *
                              </span>
                            </label>
                            <input
                              type="number"
                              name="TimeToCompleteDays"
                              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                              value={formData.TimeToCompleteDays}
                              onChange={(e) => handleStrInput(e)}
                              onInvalid={(e) =>
                                e.target.setCustomValidity(t("input-required"))
                              }
                              onInput={(e) => e.target.setCustomValidity("")}
                              required
                            />
                          </div>
                        )}
                      </div>
                      {props.bcc && (
                        <SignersInput
                          label={t("Bcc")}
                          initialData={bcc}
                          onChange={handleBcc}
                          isReset={isReset}
                          helptextZindex={50}
                          helpText={t("bcc-help")}
                          isCaptureAllData
                        />
                      )}
                    </>
                  )}
                </div>
                {isAdvanceOpt && (
                  <div
                    style={{
                      height:
                              props.title === "New Template"
                            ? "100px"
                            : "280px"
                    }}
                    className="w-[1px] bg-gray-300 m-auto hidden md:inline-block"
                  ></div>
                )}
                {isAdvanceOpt && (
                  <div className="card bg-base-100 rounded-box  p-3 flex-grow ">
                    {formData?.autoreminder === true &&
                      props.title !== "New Template" && (
                        <div className="text-xs mt-2">
                          <label className="block">
                            {t("remind-once")}
                            <span className="text-red-500 text-[13px]">*</span>
                          </label>
                          <input
                            type="number"
                            value={formData.remindOnceInEvery}
                            name="remindOnceInEvery"
                            className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                            onChange={handleStrInput}
                            onInvalid={(e) =>
                              e.target.setCustomValidity(t("input-required"))
                            }
                            onInput={(e) => e.target.setCustomValidity("")}
                            required
                          />
                        </div>
                      )}
                    <span className="font-[400] mt-2">{t("form-title-2")}</span>
                    <div className="text-xs mt-3">
                      <label className="block">
                        <span>
                          {t("enable-tour")}
                          <a
                            data-tooltip-id="istourenabled-tooltip"
                            className="ml-1"
                          >
                            <sup>
                              <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                            </sup>
                          </a>
                        </span>
                        <Tooltip id="istourenabled-tooltip" className="z-[999]">
                          <div className="max-w-[200px] md:max-w-[450px]">
                            <p className="font-bold">{t("enable-tour")}</p>
                            <div className="p-[5px]">
                              <ol className="list-disc">
                                <li>
                                  <span className="font-bold">
                                    {t("yes")}:{" "}
                                  </span>
                                  <span>{t("istourenabled-help.p1")}</span>
                                </li>
                                <li>
                                  <span className="font-bold">{t("no")}: </span>
                                  <span>{t("istourenabled-help.p2")}</span>
                                </li>
                              </ol>
                            </div>
                            <p>
                              {t("istourenabled-help.p3", { appName: appName })}
                            </p>
                          </div>
                        </Tooltip>
                      </label>
                      <div className="flex flex-col md:flex-row md:gap-4">
                        <div className="flex items-center gap-2 ml-2 mb-1">
                          <input
                            type="radio"
                            value={"true"}
                            className="op-radio op-radio-xs"
                            name="IsTourEnabled"
                            checked={formData.IsTourEnabled === "true"}
                            onChange={handleStrInput}
                          />
                          <div className="text-center">{t("yes")}</div>
                        </div>
                        <div className="flex items-center gap-2 ml-2 mb-1">
                          <input
                            type="radio"
                            value={"false"}
                            name="IsTourEnabled"
                            className="op-radio op-radio-xs"
                            checked={formData.IsTourEnabled === "false"}
                            onChange={handleStrInput}
                          />
                          <div className="text-center">{t("no")}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs mt-3">
                      <label className="block">
                        {t("notify-on-signatures")}
                        <a data-tooltip-id="nos-tooltip" className="ml-1">
                          <sup>
                            <i className="fa-light fa-question rounded-full border-[#33bbff] text-[#33bbff] text-[13px] border-[1px] py-[1.5px] px-[4px]"></i>
                          </sup>
                        </a>
                        <Tooltip id="nos-tooltip" className="z-[999]">
                          <div className="max-w-[200px] md:max-w-[450px] text-[11px]">
                            <p className="font-bold">
                              {t("notify-on-signatures")}
                            </p>
                            <p>{t("notify-on-signatures-help.p1")}</p>
                            <p>{t("notify-on-signatures-help.note")}</p>
                          </div>
                        </Tooltip>
                      </label>
                      <div className="flex flex-col md:flex-row md:gap-4">
                        <div
                          className={
                            `flex items-center gap-2 ml-2 mb-1`
                          }
                        >
                          <input
                            className="mr-[2px] op-radio op-radio-xs"
                            type="radio"
                            onChange={() => handleNotifySignChange(true)}
                            checked={formData.NotifyOnSignatures === true}
                          />
                          <div className="text-center">{t("yes")}</div>
                        </div>
                        <div
                          className={
                            `flex items-center gap-2 ml-2 mb-1`
                          }
                        >
                          <input
                            className="mr-[2px] op-radio op-radio-xs"
                            type="radio"
                            onChange={() => handleNotifySignChange(false)}
                            checked={formData.NotifyOnSignatures === false}
                          />
                          <div className="text-center">{t("no")}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs mt-2">
                      <label className="block">{t("redirect-url")}</label>
                      <input
                        name="RedirectUrl"
                        className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                        value={formData.RedirectUrl}
                        onChange={(e) => handleStrInput(e)}
                        onInvalid={(e) =>
                          e.target.setCustomValidity(t("input-required"))
                        }
                        onInput={(e) => e.target.setCustomValidity("")}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAdvanceOpt && props.title !== "Sign Yourself" ? (
              <span
                onClick={() => setIsAdvanceOpt(!isAdvanceOpt)}
                className={`mt-2.5 op-link op-link-primary text-sm`}
              >
                {t("hide-advanced-options")}
              </span>
            ) : (
              props.title !== "Sign Yourself" && (
                <span
                  onClick={() => setIsAdvanceOpt(!isAdvanceOpt)}
                  className={`mt-2.5 op-link op-link-primary text-sm`}
                >
                  {t("advanced-options")}
                </span>
              )
            )}
            <div className="flex items-center mt-3 gap-2">
              <button
                className={`${
                  isSubmit || !fileupload ? "cursor-progress" : ""
                } op-btn op-btn-primary`}
                type="submit"
                disabled={isSubmit || !fileupload}
              >
                {t("next")}
              </button>
              <div
                className="op-btn op-btn-ghost"
                onClick={() => handleCancel()}
              >
                {t("cancel")}
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
export default Form;
