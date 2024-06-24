import React, { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import "../styles/managesign.css";
import "../styles/signature.css";
import { toDataUrl } from "../constant/Utils";
import Parse from "parse";
import { appInfo } from "../constant/appinfo";
import { SaveFileSize } from "../constant/saveFileSize";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";
const ManageSign = () => {
  const appName = appInfo.appname;
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
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const initailsRef = useRef(null);
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
        const signCls = `${appName}_Signature`;
        const signQuery = new Parse.Query(signCls);
        signQuery.equalTo("UserId", userId);
        const signRes = await signQuery.first();
        if (signRes) {
          const res = signRes.toJSON();
          setId(res.objectId);
          setSignName(res?.SignatureName);
          setImage(res.ImageURL);
          if (res && res.Initials) {
            setInitials(res.Initials);
            setIsInitials(true);
          }
        } else {
          setSignName(User?.get("name") || "");
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
    setInitials("");
    setIsValue(true);
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
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUrl = image.includes("https");

    if (!isvalue) {
      setWarning(true);
      setTimeout(() => setWarning(false), 1000);
    } else {
      setIsLoader(true);
      const replaceSpace = signName.replace(/ /g, "_");
      let file;
      if (signature) {
        file = base64StringtoFile(signature, `${replaceSpace}_sign.png`);
      } else {
        if (!isUrl) {
          file = base64StringtoFile(image, `${replaceSpace}__sign.png`);
        }
      }
      let imgUrl;
      if (!isUrl) {
        imgUrl = await uploadFile(file);
      } else {
        imgUrl = image;
      }
      let initialsUrl = "";
      const isInitialsUrl = Initials.includes("https");
      if (!isInitialsUrl && Initials) {
        const initialsImg = base64StringtoFile(
          Initials,
          `${replaceSpace}_initials.png`
        );
        initialsUrl = await uploadFile(initialsImg);
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
    var arr = base64String.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const uploadFile = async (file) => {
    try {
      const parseFile = new Parse.File(file.name, file);
      const response = await parseFile.save();
      if (response?.url()) {
        const tenantId = localStorage.getItem("TenantId");
        SaveFileSize(file.size, response.url(), tenantId);
        return response?.url();
      }
    } catch (err) {
      console.log("sign upload err", err);
      setIsLoader(false);
      alert(`${err.message}`);
    }
  };

  const saveEntry = async (obj) => {
    const signCls = `${appName}_Signature`;
    const User = Parse.User.current().id;
    const userId = { __type: "Pointer", className: "_User", objectId: User };
    if (id) {
      try {
        const updateSign = new Parse.Object(signCls);
        updateSign.id = id;
        updateSign.set("Initials", obj.initialsUrl ? obj.initialsUrl : "");
        updateSign.set("ImageURL", obj.url);
        updateSign.set("SignatureName", obj.name);
        updateSign.set("UserId", userId);
        const res = await updateSign.save();
        setIsLoader(false);
        setIsAlert({
          type: "success",
          message: "Signature saved successfully."
        });
        setTimeout(() => setIsAlert({}), 2000);
        return res;
      } catch (err) {
        console.log(err);
        setIsLoader(false);
        setIsAlert({
          type: "danger",
          message: `${err.message}`
        });
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
        setIsLoader(false);
        setIsAlert({
          type: "success",
          message: "Signature saved successfully."
        });
        setTimeout(() => setIsAlert({}), 2000);
        return res;
      } catch (err) {
        console.log(err);
        setIsLoader(false);
        setIsAlert({
          type: "success",
          message: `${err.message}`
        });
        setTimeout(() => setIsAlert({}), 2000);
      }
    }
  };

  const handleUploadBtn = () => {
    imageRef.current.click();
  };
  const handleInitialsChange = () => {
    setInitials(initailsRef.current.toDataURL());
    setIsValue(true);
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
            My Signature
          </div>
          <div className="flex flex-col md:flex-row gap-0 md:gap-[12px]">
            <div className="relative">
              <span className="font-medium select-none flex mb-[10px] pl-[10px]">
                Signature
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
                <div>
                  {image ? (
                    <div className="signatureCanvas relative border-[2px] border-[#888]">
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
                        width: "456px",
                        height: "180px",
                        className: "signatureCanvas"
                      }}
                      backgroundColor="rgb(255, 255, 255)"
                      onEnd={() =>
                        handleSignatureChange(canvasRef.current.toDataURL())
                      }
                      dotSize={1}
                    />
                  )}
                  <div className="penContainerDefault flex flex-row justify-between">
                    <div>
                      {!image && (
                        <div className="flex flex-row">
                          {allColor.map((data, key) => {
                            return (
                              <i
                                style={{
                                  margin: "5px",
                                  color: data,
                                  borderBottom:
                                    key === 0 && penColor === "blue"
                                      ? "2px solid blue"
                                      : key === 1 && penColor === "red"
                                        ? "2px solid red"
                                        : key === 2 && penColor === "black"
                                          ? "2px solid black"
                                          : "2px solid white"
                                }}
                                onClick={() => {
                                  if (key === 0) {
                                    setPenColor("blue");
                                  } else if (key === 1) {
                                    setPenColor("red");
                                  } else if (key === 2) {
                                    setPenColor("black");
                                  }
                                }}
                                key={key}
                                className="fa-light fa-pen-nib"
                                width={20}
                                height={20}
                              ></i>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row gap-2">
                      <div
                        type="button"
                        className="op-link"
                        onClick={() => handleUploadBtn()}
                      >
                        Upload image
                      </div>
                      <div
                        type="button"
                        className="op-link"
                        onClick={() => handleClear()}
                      >
                        Clear
                      </div>
                    </div>
                  </div>
                </div>
                {warning && (
                  <span className="customwarning signWarning text-[12px] w-[220px] md:w-[300px]">
                    <i className="fa-light fa-exclamation-circle text-[#fab005] text-[15px] mr-[4px]"></i>
                    Please upload signature/Image
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <span className="font-medium select-none flex mb-[10px] pl-[10px]">
                Initials
              </span>
              <div>
                {isInitials ? (
                  <div className="intialSignature relative border-[1px] border-[#888]">
                    <img
                      alt="inititals"
                      src={Initials}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain"
                      }}
                    />
                  </div>
                ) : (
                  <SignatureCanvas
                    ref={initailsRef}
                    penColor={initialPen}
                    canvasProps={{
                      className: "intialSignature"
                    }}
                    backgroundColor="rgb(255, 255, 255)"
                    onEnd={() =>
                      handleInitialsChange(initailsRef.current.toDataURL())
                    }
                    dotSize={1}
                  />
                )}
                <div className="flex flex-row justify-between w-[183px]">
                  <div>
                    {!isInitials && (
                      <div className="flex flex-row">
                        {allColor.map((data, key) => {
                          return (
                            <i
                              style={{
                                margin: "5px",
                                color: data,
                                borderBottom:
                                  key === 0 && initialPen === "blue"
                                    ? "2px solid blue"
                                    : key === 1 && initialPen === "red"
                                      ? "2px solid red"
                                      : key === 2 && initialPen === "black"
                                        ? "2px solid black"
                                        : "2px solid white"
                              }}
                              onClick={() => {
                                if (key === 0) {
                                  setInitialPen("blue");
                                } else if (key === 1) {
                                  setInitialPen("red");
                                } else if (key === 2) {
                                  setInitialPen("black");
                                }
                              }}
                              key={key}
                              className="fa-light fa-pen-nib"
                              width={20}
                              height={20}
                            ></i>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      type="button"
                      className="op-link"
                      onClick={() => handleClearInitials()}
                    >
                      Clear
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
              save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSign;
