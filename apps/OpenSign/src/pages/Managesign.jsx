import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import "../styles/managesign.css";
import "../styles/signature.css";
import {
  generateTitleFromFilename,
  getSecureUrl,
  toDataUrl
} from "../constant/Utils";
import Parse from "parse";
import { SaveFileSize } from "../constant/saveFileSize";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import { sanitizeFileName } from "../utils";
const ManageSign = () => {
  const { t } = useTranslation();
  const [penColor, setPenColor] = useState("blue");
  const [initialPen, setInitialPen] = useState("blue");
  const [image, setImage] = useState();
  const [signName, setSignName] = useState("");
  const [signature, setSignature] = useState("");
  const [warning, setWarning] = useState(false);
  const [isvalue, setIsValue] = useState(false);
  const allColor = ["blue", "red", "black"];
  const [isLoader, setIsLoader] = useState(true);
  const [isAlert, setIsAlert] = useState({ type: "success", message: "" });
  const [Initials, setInitials] = useState("");
  const [isInitials, setIsInitials] = useState(false);
  const [id, setId] = useState("");
  const [imgInitials, setImgInitials] = useState("");
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const initailsRef = useRef(null);
  const imgInitialsRef = useRef(null);
  useEffect(() => {
    fetchUserSign();
    // eslint-disable-next-line
  }, []);
  const fetchUserSign = async () => {
    const User = Parse.User.current();
    if (User) {
      const userId = {
        __type: "Pointer",
        className: "_User",
        objectId: User.id
      };
      try {
        const signCls = "contracts_Signature";
        const signQuery = new Parse.Query(signCls);
        signQuery.equalTo("UserId", userId);
        const signRes = await signQuery.first();
        if (signRes) {
          const res = signRes.toJSON();
          setId(res.objectId);
          if (res?.SignatureName) {
            const sanitizename = generateTitleFromFilename(res?.SignatureName);
            const replaceSpace = sanitizeFileName(sanitizename);
            setSignName(replaceSpace);
          }
          setImage(res?.ImageURL);
          if (res && res.Initials) {
            // setInitials(res.Initials);
            setIsInitials(true);
            setImgInitials(res?.Initials);
          }
        } else {
          if (User?.get("name")) {
            const sanitizename = generateTitleFromFilename(User?.get("name"));
            const replaceSpace = sanitizeFileName(sanitizename);
            setSignName(replaceSpace);
          }
        }
        setIsLoader(false);
      } catch (err) {
        console.log("Err", err);
        alert(`${err.message}`);
      }
    }
  };
  const handleSignatureChange = () => {
    if (imageRef.current) {
      imageRef.current.value = "";
    }
    setImage("");
    setSignature(canvasRef.current.toDataURL());
    setIsValue(true);
  };
  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    if (imageRef.current) {
      imageRef.current.value = "";
    }
    setImage("");
    setSignature("");
    setIsValue(false);
  };

  const handleClearInitials = () => {
    if (initailsRef.current) {
      initailsRef.current.clear();
    }
    if (imgInitialsRef.current) {
      imgInitialsRef.current.value = "";
    }
    setImgInitials("");
    setInitials("");
    if (image) {
      setIsValue(true);
    }
    setIsInitials(false);
  };

  const onImageChange = async (event) => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setSignature("");
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64Img = await toDataUrl(file);
      setImage(base64Img);
      setIsValue(true);
    } else {
      setImage("");
      setIsValue(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUrl = image?.includes("https") || image?.includes("http");
    if (!isvalue) {
      setWarning(true);
      setTimeout(() => setWarning(false), 1000);
    } else {
      setIsLoader(true);
      const sanitizename = generateTitleFromFilename(signName);
      const replaceSpace = sanitizeFileName(sanitizename);
      let file;
      if (signature) {
        file = base64StringtoFile(signature, `${replaceSpace}_sign`);
      } else {
        if (image && !isUrl) {
          file = base64StringtoFile(image, `${replaceSpace}__sign`);
        }
      }
      let imgUrl;
      if (file && !isUrl) {
        imgUrl = await uploadFile(file);
      } else {
        imgUrl = image;
      }
      const isInitialsUrl =
        imgInitials?.includes("https") || imgInitials?.includes("http");

      let initialFile;
      if (Initials) {
        initialFile = base64StringtoFile(Initials, `${replaceSpace}_sign`);
      } else {
        if (imgInitials && !isInitialsUrl) {
          initialFile = base64StringtoFile(
            imgInitials,
            `${replaceSpace}__sign`
          );
        }
      }
      let initialsUrl;
      if (initialFile && !isInitialsUrl) {
        initialsUrl = await uploadFile(initialFile);
      } else {
        initialsUrl = imgInitials;
      }
      if (imgUrl) {
        await saveEntry({
          name: signName,
          url: imgUrl,
          initialsUrl: initialsUrl
        });
      }
    }
  };
  function base64StringtoFile(base64String, filename) {
    let arr = base64String.split(","),
      // type of uploaded image
      mime = arr[0].match(/:(.*?);/)[1],
      // decode base64
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const ext = mime.split("/").pop();
    const name = `${filename}.${ext}`;
    return new File([u8arr], name, { type: mime });
  }

  const uploadFile = async (file) => {
    try {
      const parseFile = new Parse.File(file.name, file);
      const response = await parseFile.save();
      if (response?.url()) {
        const fileRes = await getSecureUrl(response?.url());
        if (fileRes?.url) {
          const tenantId = localStorage.getItem("TenantId");
          const userId = Parse?.User?.current()?.id;
          SaveFileSize(file.size, fileRes?.url, tenantId, userId);
          return fileRes?.url;
        } else {
          alert(t("something-went-wrong-mssg"));
          setIsLoader(false);
          return false;
        }
      } else {
        alert(t("something-went-wrong-mssg"));
        setIsLoader(false);
        return false;
      }
    } catch (err) {
      console.log("sign upload err", err);
      setIsLoader(false);
      alert(`${err.message}`);
    }
  };

  const saveEntry = async (obj) => {
    const signCls = "contracts_Signature";
    const User = Parse?.User?.current()?.id;
    const userId = { __type: "Pointer", className: "_User", objectId: User };
    if (id) {
      try {
        const updateSign = new Parse.Object(signCls);
        updateSign.id = id;
        updateSign.set("Initials", obj.initialsUrl ? obj.initialsUrl : "");
        updateSign.set("ImageURL", obj.url ? obj.url : "");
        updateSign.set("SignatureName", obj.name);
        updateSign.set("UserId", userId);
        const res = await updateSign.save();
        setIsAlert({ type: "success", message: t("signature-saved-alert") });
        return res;
      } catch (err) {
        console.log(err);
        setIsAlert({ type: "danger", message: `${err.message}` });
      } finally {
        setIsLoader(false);
        setTimeout(() => setIsAlert({}), 2000);
      }
    } else {
      try {
        const updateSign = new Parse.Object(signCls);
        updateSign.set("Initials", obj.initialsUrl ? obj.initialsUrl : "");
        updateSign.set("ImageURL", obj.url);
        updateSign.set("SignatureName", obj.name);
        updateSign.set("UserId", userId);
        const res = await updateSign.save();
        setIsAlert({ type: "success", message: t("signature-saved-alert") });
        return res;
      } catch (err) {
        console.log(err);
        setIsAlert({ type: "success", message: `${err.message}` });
      } finally {
        setIsLoader(false);
        setTimeout(() => setIsAlert({}), 2000);
      }
    }
  };

  const handleUploadBtn = () => {
    imageRef.current.click();
  };
  const handleInitialsChange = () => {
    setInitials(initailsRef.current.toDataURL());
    if (image || signature) {
      setIsValue(true);
    }
  };
  const handleUploadInitials = () => {
    imgInitialsRef.current.click();
  };
  const onImgInitialsChange = async (event) => {
    if (initailsRef.current) {
      initailsRef.current.clear();
    }
    setInitials("");
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64Img = await toDataUrl(file);
      setImgInitials(base64Img);
      if (image || signature) {
        setIsValue(true);
      }
    } else {
      setImgInitials("");
      setIsValue(false);
    }
  };
  return (
    <div className="relative h-full bg-base-100 text-base-content flex shadow-md rounded-box overflow-auto">
      {isLoader && (
        <div className="absolute bg-black bg-opacity-30 z-50 w-full h-full flex justify-center items-center">
          <Loader />
        </div>
      )}
      {isAlert?.message && <Alert type={isAlert.type}>{isAlert.message}</Alert>}
      <div className="relative w-full">
        <div className="ml-[5px] my-[20px] md:m-[20px]">
          <div className="text-[20px] font-semibold m-[10px] md:m-0 mb-2">
            {t("my-signature")}
          </div>
          <div className="flex flex-col md:flex-row gap-0 md:gap-[12px]">
            <div className="relative">
              <span className="font-medium select-none flex mb-[10px] pl-[10px]">
                {t("signature")}
              </span>
              <input
                type="file"
                onChange={onImageChange}
                className="filetype"
                accept="image/*"
                ref={imageRef}
                hidden
              />
              <div className="relative">
                {image ? (
                  <div className="mysignatureCanvas relative border-[2px] border-[#888] rounded-box overflow-hidden">
                    <img
                      alt="signature"
                      src={image}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <SignatureCanvas
                    ref={canvasRef}
                    penColor={penColor}
                    canvasProps={{
                      className:
                        "mysignatureCanvas border-[2px] border-[#888] rounded-box"
                    }}
                    onEnd={() =>
                      handleSignatureChange(canvasRef.current.toDataURL())
                    }
                    dotSize={1}
                  />
                )}
                <div className="penContainerDefault flex flex-row justify-between">
                  <div>
                    {!image && (
                      <div className="flex flex-row gap-1.5 m-[5px]">
                        {allColor.map((data, key) => {
                          return (
                            <i
                              key={key}
                              onClick={() => setPenColor(allColor[key])}
                              className={`border-b-[2px] ${key === 0 && penColor === "blue" ? "border-blue-600" : key === 1 && penColor === "red" ? "border-red-500" : key === 2 && penColor === "black" ? "border-black" : "border-white"} text-[${data}] text-[16px] fa-light fa-pen-nib`}
                            ></i>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row gap-2 text-sm md:text-base mr-1">
                    <div
                      type="button"
                      className="op-link"
                      onClick={() => handleUploadBtn()}
                    >
                      {t("upload")}
                    </div>
                    <div
                      type="button"
                      className="op-link"
                      onClick={() => handleClear()}
                    >
                      {t("clear")}
                    </div>
                  </div>
                </div>
                {warning && (
                  <span className="customwarning signWarning text-[12px] w-[220px] md:w-[300px]">
                    <i className="fa-light fa-exclamation-circle text-[#fab005] text-[15px] mr-[4px]"></i>
                    {t("upload-signature/Image")}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <span className="font-medium select-none flex mb-[10px] pl-[10px]">
                {t("initials")}
              </span>
              <input
                type="file"
                onChange={onImgInitialsChange}
                className="filetype"
                accept="image/*"
                ref={imgInitialsRef}
                hidden
              />
              <div>
                {imgInitials ? (
                  <div className="intialSignature relative border-[1px] border-[#888] rounded-box overflow-hidden">
                    <img
                      alt="inititals"
                      src={imgInitials}
                      className="w-[100%] h-[100%] object-contain"
                    />
                  </div>
                ) : (
                  <SignatureCanvas
                    ref={initailsRef}
                    penColor={initialPen}
                    canvasProps={{
                      className: "intialSignature rounded-box"
                    }}
                    onEnd={() => handleInitialsChange()}
                    dotSize={1}
                  />
                )}
                <div className="flex flex-row justify-between w-[183px]">
                  <div>
                    {!isInitials && (
                      <div className="flex flex-row gap-1.5 m-[5px]">
                        {allColor.map((data, key) => {
                          return (
                            <i
                              key={key}
                              onClick={() => setInitialPen(allColor[key])}
                              className={`border-b-[2px] ${key === 0 && initialPen === "blue" ? "border-blue-600" : key === 1 && initialPen === "red" ? "border-red-500" : key === 2 && initialPen === "black" ? "border-black" : "border-white"} text-[${data}] text-[16px] fa-light fa-pen-nib`}
                            ></i>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row gap-1">
                    <div
                      type="button"
                      className="op-link text-sm md:text-base mr-1"
                      onClick={() => handleUploadInitials()}
                    >
                      {t("upload")}
                    </div>
                    <div>
                      <div
                        type="button"
                        className="op-link text-sm md:text-base mr-1"
                        onClick={() => handleClearInitials()}
                      >
                        {t("clear")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-3 ml-2 md:ml-0">
            <button
              className="op-btn op-btn-primary"
              onClick={(e) => handleSubmit(e)}
            >
              {t("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSign;
