import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SignatureCanvas from "react-signature-canvas";
import Parse from "parse";
import {
  generateTitleFromFilename,
  getBase64FromUrl,
  getSecureUrl
} from "../../constant/Utils";
import sanitizeFileName from "../../primitives/sanitizeFileName";
import { SaveFileSize } from "../../constant/saveFileSize";
import Loader from "../../primitives/Loader";

function SignPad(props) {
  const { t } = useTranslation();
  const [penColor, setPenColor] = useState("blue");
  const allColor = ["blue", "red", "black"];
  const canvasRef = useRef(null);
  const [isDefaultSign, setIsDefaultSign] = useState(false);
  const [isTab, setIsTab] = useState("");
  const [isSignImg, setIsSignImg] = useState("");
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [signatureType, setSignatureType] = useState("");
  const [isSignTypes, setIsSignTypes] = useState(true);
  const [typedSignature, setTypedSignature] = useState("");
  const fontOptions = [
    { value: "Fasthand" },
    { value: "Dancing Script" },
    { value: "Cedarville Cursive" },
    { value: "Delicious Handrawn" }
    // Add more font options as needed
  ];
  const [fontSelect, setFontSelect] = useState(fontOptions[0].value);
  const [isSavedSign, setIsSavedSign] = useState(false);
  const [isLoader, setIsLoader] = useState(false);
  const accesstoken = localStorage.getItem("accesstoken") || "";
  const senderUser = localStorage.getItem(
    `Parse/${localStorage.getItem("parseAppId")}/currentUser`
  );
  const jsonSender = senderUser && JSON.parse(senderUser);
  const currentUserName = jsonSender && jsonSender?.name;
  useEffect(() => {
    handleTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.signatureTypes]);
  function handleTab() {
    const signtypes = props?.signatureTypes || [];
    const defaultIndex = signtypes?.findIndex(
      (x) =>
        x.name === "default" &&
        x.enabled === true &&
        props.defaultSign &&
        (props?.currWidgetsDetails?.type || props.widgetType) !== "image" &&
        (props?.currWidgetsDetails?.type || props.widgetType) !== "stamp"
    );
    const getIndex =
      defaultIndex !== -1 // Check if the default index exists
        ? defaultIndex // If found, use it
        : signtypes?.findIndex((x) => x.enabled === true);

    if (getIndex !== -1) {
      setIsSignTypes(true);
      const tab = props?.signatureTypes[getIndex].name;
      if (tab === "draw") {
        setIsTab("draw");
        setSignatureType("draw");
      } else if (tab === "upload") {
        props?.setIsImageSelect(true);
        setIsTab("uploadImage");
      } else if (tab === "typed") {
        setIsTab("type");
      } else if (tab === "default") {
        if (
          (props?.isInitial && props?.myInitial) ||
          (!props?.isInitial && props?.defaultSign)
        ) {
          setIsDefaultSign(true);
          setIsTab("mysignature");
        } else {
          setIsTab("draw");
        }
      } else {
        setIsTab(true);
      }
    } else {
      setIsSignTypes(false);
    }
  }
  function isTabEnabled(tabName) {
    const isEnabled = props?.signatureTypes.find(
      (x) => x.name === tabName
    )?.enabled;
    return isEnabled;
  }

  //function for clear signature image
  const handleClear = () => {
    if (isTab === "draw") {
      if (canvasRef.current) {
        canvasRef.current.clear();
      } else if (props?.isStamp) {
        props?.setImage("");
      }
      setIsSignImg("");
    } else if (isTab === "uploadImage") {
      props?.setImage("");
    }
  };
  //function for set signature url
  const handleSignatureChange = (data) => {
    props?.setSignature(data);
    setIsSignImg(data);
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
        const fileRes = await getSecureUrl(response.url());
        if (fileRes.url) {
          const tenantId = localStorage.getItem("TenantId");
          SaveFileSize(file.size, fileRes.url, tenantId);
          return fileRes?.url;
        } else {
          alert(`${t("something-went-wrong-mssg")}`);
          return false;
        }
      } else {
        alert(`${t("something-went-wrong-mssg")}`);
        return false;
      }
    } catch (err) {
      console.log("sign upload err", err);
      alert(`${err.message}`);
      return false;
    }
  };

  // `handlesavesign` is used to save signaute, initials, stamp as a default
  const handleSaveSign = async () => {
    if (isSignImg || props?.image?.src) {
      setIsLoader(true);
      try {
        const User = Parse?.User?.current();
        const sanitizename = generateTitleFromFilename(User?.get("name"));
        const replaceSpace = sanitizeFileName(sanitizename);
        let file;
        if (isSignImg) {
          file = base64StringtoFile(isSignImg, `${replaceSpace}__sign`);
        } else {
          file = base64StringtoFile(props?.image?.src, `${replaceSpace}__sign`);
        }
        const imageUrl = await uploadFile(file);
        const userId = {
          __type: "Pointer",
          className: "_User",
          objectId: User?.id
        };
        if (imageUrl) {
          //  below code is used to save or update default signaute, initials, stamp
          try {
            const signCls = new Parse.Object("contracts_Signature");
            if (props?.saveSignCheckbox?.signId) {
              signCls.id = props.saveSignCheckbox.signId;
            }
            if (
              props.currWidgetsDetails?.type === "initials" ||
              props?.widgetType === "initials"
            ) {
              signCls.set("Initials", imageUrl);
            } else if (
              props.currWidgetsDetails?.type === "signature" ||
              props?.widgetType === "signature"
            ) {
              signCls.set("ImageURL", imageUrl);
            }
            signCls.set("UserId", userId);
            const signRes = await signCls.save();
            if (signRes) {
              props.saveSignCheckbox.signId;
              props.setSaveSignCheckbox((prev) => ({
                ...prev,
                signId: signRes?.id
              }));
              const _signRes = JSON.parse(JSON.stringify(signRes));
              if (
                props.currWidgetsDetails?.type === "signature" ||
                props?.widgetType === "signature"
              ) {
                const defaultSign = await getBase64FromUrl(
                  _signRes?.ImageURL,
                  true
                );
                props.setDefaultSignImg(defaultSign);
              } else if (
                props.currWidgetsDetails?.type === "initials" ||
                props?.widgetType === "initials"
              ) {
                const defaultInitials = await getBase64FromUrl(
                  _signRes?.Initials,
                  true
                );
                props.setMyInitial(defaultInitials);
              }
              alert(t("saved-successfully"));
            }
            return signRes;
          } catch (err) {
            console.log(err);
            alert(`${err.message}`);
          } finally {
            setIsLoader(false);
          }
        }
      } catch (err) {
        console.log("Err while saving signature", err);
      }
    }
  };

  const handleSaveBtn = async () => {
    if (accesstoken && isSavedSign) {
      await handleSaveSign();
      resetToDefault();
    } else {
      resetToDefault();
    }
  };
  const resetToDefault = () => {
    props?.setCurrWidgetsDetails({});
    if (!props?.image) {
      if (isTab === "mysignature") {
        setIsSignImg("");
        if (props?.isInitial) {
          props?.onSaveSign(signatureType, "initials");
        } else {
          props?.onSaveSign(null, "default");
        }
      } else {
        if (isTab === "type") {
          setIsSignImg("");
          props?.onSaveSign(
            null,
            false,
            !props?.isInitial && textWidth > 150 ? 150 : textWidth,
            !props?.isInitial && textHeight > 35 ? 35 : textHeight,
            typedSignature
          );
        } else {
          setIsSignImg("");
          canvasRef.current.clear();
          props?.onSaveSign(signatureType);
        }
      }
      setPenColor("blue");
    } else {
      setIsSignImg("");
      props?.onSaveImage(signatureType);
    }
    props?.setIsSignPad(false);
    props?.setIsInitial && props?.setIsInitial(false);
    props?.setIsImageSelect(false);
    setIsDefaultSign(false);
    props?.setImage();
    handleTab();
    props?.setIsStamp(false);
  };
  //save button component
  const SaveBtn = () => {
    return (
      <div>
        {(isTab === "draw" || isTab === "uploadImage") && (
          <button
            type="button"
            className="op-btn op-btn-ghost mr-1 mt-[2px]"
            onClick={() => handleClear()}
          >
            {t("clear")}
          </button>
        )}
        <button
          onClick={() => handleSaveBtn()}
          type="button"
          className={`${
            isSignImg ||
            props?.image ||
            isDefaultSign ||
            textWidth ||
            props.isAutoSign
              ? ""
              : "pointer-events-none"
          } op-btn op-btn-primary shadow-lg`}
          disabled={
            (isTab === "draw" && isSignImg) ||
            (isTab === "image" && props?.image) ||
            (isTab === "mysignature" && isDefaultSign) ||
            (isTab === "type" && typedSignature) ||
            props.isAutoSign
              ? false
              : props?.image
                ? false
                : true
          }
        >
          {t("save")}
        </button>
      </div>
    );
  };
  const autoSignAll = () => {
    return (
      <label className="cursor-pointer flex items-center mb-[6px] text-center text-[11px] md:text-base">
        <input
          className="mr-2 md:mr-3 op-checkbox op-checkbox-xs md:op-checkbox-sm"
          type="checkbox"
          value={props.isAutoSign}
          onChange={(e) => {
            props.setIsAutoSign(e.target.checked);
          }}
        />
        {t("auto-sign-mssg")}
      </label>
    );
  };
  //useEffect for set already draw or save signature url/text url of signature text type and draw type for initial type and signature type widgets
  useEffect(() => {
    if (props?.currWidgetsDetails && canvasRef.current && props.isSignPad) {
      const isWidgetType = props?.currWidgetsDetails?.type;
      const signatureType = props?.currWidgetsDetails?.signatureType;
      const url = props?.currWidgetsDetails?.SignUrl;
      //checking widget type and draw type signature url
      if (props?.isInitial) {
        if (isWidgetType === "initials" && signatureType === "draw" && url) {
          canvasRef.current.fromDataURL(url);
        }
      } else if (
        isWidgetType === "signature" &&
        signatureType === "draw" &&
        url
      ) {
        canvasRef.current.fromDataURL(url);
      }

      const trimmedName = currentUserName && currentUserName?.trim();
      const firstCharacter = trimmedName?.charAt(0);
      const userName = props?.isInitial ? firstCharacter : currentUserName;
      const signatureValue = props?.currWidgetsDetails?.typeSignature;
      setTypedSignature(signatureValue || userName || "");
      setFontSelect("Fasthand");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isSignPad]);
  useEffect(() => {
    const loadFont = async () => {
      try {
        await document.fonts.load(`20px ${fontSelect}`);
        const selectFontSTyle = fontOptions.find(
          (font) => font.value === fontSelect
        );
        setFontSelect(selectFontSTyle?.value || fontOptions[0].value);
      } catch (error) {
        console.error("Error loading font:", error);
      }
    };

    loadFont();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSelect]);
  useEffect(() => {
    // Load the default signature after the component mounts
    if (canvasRef.current) {
      canvasRef.current.fromDataURL(isSignImg);
    }
    if (isTab === "type") {
      const trimmedName = typedSignature
        ? typedSignature?.trim()
        : currentUserName?.trim();
      const firstCharacter = trimmedName?.charAt(0);
      const userName = props?.isInitial ? firstCharacter : typedSignature;
      const signatureValue = props?.currWidgetsDetails?.typeSignature;
      setTypedSignature(signatureValue || userName || "");
      convertToImg(fontSelect, userName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTab]);
  //function for convert input text value in image
  const convertToImg = async (fontStyle, text, color) => {
    //get text content to convert in image
    const textContent = text;
    const fontfamily = fontStyle
      ? fontStyle
      : fontSelect
        ? fontSelect
        : "Fasthand";
    const fontSizeValue = "40px";
    //creating span for getting text content width
    const span = document.createElement("span");
    span.textContent = textContent;
    span.style.font = `${fontSizeValue} ${fontfamily}`; // here put your text size and font family
    span.style.color = color ? color : penColor;
    span.style.display = "hidden";
    document.body.appendChild(span); // Replace 'container' with the ID of the container element

    //create canvas to render text in canvas and convert in image
    const canvasElement = document.createElement("canvas");
    // Draw the text content on the canvas
    const ctx = canvasElement.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;
    const addExtraWidth = props?.isInitial ? 10 : 50;
    const width = span.offsetWidth + addExtraWidth;
    const height = span.offsetHeight;
    setTextWidth(width);
    setTextHeight(height);
    const font = span.style["font"];
    // Set the canvas dimensions to match the span
    canvasElement.width = width * pixelRatio;
    canvasElement.height = height * pixelRatio;

    // You can customize text styles if needed
    ctx.font = font;
    ctx.fillStyle = color ? color : penColor; // Set the text color
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.scale(pixelRatio, pixelRatio);
    // Draw the content of the span onto the canvas
    ctx.fillText(span.textContent, width / 2, height / 2); // Adjust the x,y-coordinate as needed
    //remove span tag
    document.body.removeChild(span);
    // Convert the canvas to image data
    const dataUrl = canvasElement.toDataURL("image/png");
    props?.setSignature(dataUrl);
  };
  const PenColorComponent = (props) => {
    return (
      <div className="flex flex-row items-center m-[5px] gap-2">
        {allColor.map((data, key) => {
          return (
            <i
              key={key}
              onClick={() => {
                props?.convertToImg &&
                  props?.convertToImg(fontSelect, typedSignature, data);
                setPenColor(allColor[key]);
              }}
              className={`border-b-[2px] ${
                key === 0 && penColor === "blue"
                  ? "border-blue-600"
                  : key === 1 && penColor === "red"
                    ? "border-red-500"
                    : key === 2 && penColor === "black"
                      ? "border-black"
                      : "border-white"
              } text-[${data}] text-[16px] fa-light fa-pen-nib`}
            ></i>
          );
        })}
      </div>
    );
  };

  // `handleCancelBtn` function trigger when user click on cross button
  const handleCancelBtn = () => {
    setPenColor("blue");
    props?.setIsSignPad(false);
    props?.setIsInitial && props?.setIsInitial(false);
    props?.setIsImageSelect(false);
    setIsDefaultSign(false);
    props?.setImage();
    handleTab();
    props?.setIsStamp(false);
  };

  const savesigncheckbox = (
    <label className="cursor-pointer flex items-center mb-0 text-center text-[11px] md:text-base">
      <input
        className="mr-2 md:mr-3 op-checkbox op-checkbox-xs md:op-checkbox-sm"
        type="checkbox"
        checked={isSavedSign}
        onChange={(e) => setIsSavedSign(e.target.checked)}
      />
      Save {props?.currWidgetsDetails?.type || props?.widgetType}
    </label>
  );
  return (
    <div>
      {props?.isSignPad && (
        <div className="op-modal op-modal-open">
          <div className="op-modal-box px-[13px] pt-2 pb-0">
            {isLoader && (
              <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-base-content/30 z-50">
                <Loader />
              </div>
            )}
            {isSignTypes ? (
              <>
                <div className="flex justify-between text-base-content items-center">
                  <div className="text-[1.2rem]">
                    <div className="flex flex-row justify-between mt-[3px]">
                      <div className="flex flex-row justify-between gap-[5px] md:gap-[8px] text-[11px] md:text-base">
                        {props?.isStamp ? (
                          <span className="text-base-content font-bold text-lg">
                            {props?.widgetType === "image" ||
                            props?.currWidgetsDetails?.type === "image"
                              ? t("upload-image")
                              : t("upload-stamp-image")}
                          </span>
                        ) : (
                          <>
                            {!props?.isInitial &&
                            props?.defaultSign &&
                            isTabEnabled("default") ? (
                              <div>
                                <span
                                  onClick={() => {
                                    setIsDefaultSign(true);
                                    props?.setIsImageSelect(true);
                                    setIsTab("mysignature");
                                    setSignatureType("");
                                    props?.setImage();
                                  }}
                                  className={`${
                                    isTab === "mysignature"
                                      ? "op-link-primary"
                                      : "no-underline"
                                  } op-link underline-offset-8 ml-[2px]`}
                                >
                                  {t("my-signature")}
                                </span>
                              </div>
                            ) : (
                              props?.isInitial &&
                              props?.myInitial &&
                              isTabEnabled("default") && (
                                <div>
                                  <span
                                    onClick={() => {
                                      setIsDefaultSign(true);
                                      props?.setIsImageSelect(true);
                                      setIsTab("mysignature");
                                      setSignatureType("");
                                      props?.setImage();
                                    }}
                                    className={`${
                                      isTab === "mysignature"
                                        ? "op-link-primary"
                                        : "no-underline"
                                    } op-link underline-offset-8 ml-[2px]`}
                                  >
                                    {t("my-initials")}
                                  </span>
                                </div>
                              )
                            )}
                            {isTabEnabled("draw") && (
                              <div>
                                <span
                                  onClick={() => {
                                    setIsDefaultSign(false);
                                    props?.setIsImageSelect(false);
                                    setIsTab("draw");
                                    props?.setImage();
                                    if (isSignImg) {
                                      props?.setSignature(isSignImg);
                                    }
                                  }}
                                  className={`${
                                    isTab === "draw"
                                      ? "op-link-primary"
                                      : "no-underline"
                                  } op-link underline-offset-8 ml-[2px]`}
                                >
                                  {t("draw")}
                                </span>
                              </div>
                            )}
                            {isTabEnabled("upload") && (
                              <div>
                                <span
                                  onClick={() => {
                                    setIsDefaultSign(false);
                                    props?.setIsImageSelect(true);
                                    setIsTab("uploadImage");
                                    setSignatureType("");
                                  }}
                                  className={`${
                                    isTab === "uploadImage"
                                      ? "op-link-primary"
                                      : "no-underline"
                                  } op-link underline-offset-8 ml-[2px]`}
                                >
                                  {t("upload-image")}
                                </span>
                              </div>
                            )}
                            {isTabEnabled("typed") && (
                              <div>
                                <span
                                  onClick={() => {
                                    setIsDefaultSign(false);
                                    props?.setIsImageSelect(false);
                                    setIsTab("type");
                                    setSignatureType("");
                                    props?.setImage();
                                  }}
                                  className={`${
                                    isTab === "type"
                                      ? "op-link-primary"
                                      : "no-underline"
                                  } op-link underline-offset-8 ml-[2px]`}
                                >
                                  {t("type")}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-[1.5rem] cursor-pointer"
                    onClick={handleCancelBtn}
                  >
                    &times;
                  </div>
                </div>
                <div className="p-[20px] h-full">
                  {isDefaultSign ? (
                    <>
                      {!props?.isInitial &&
                        props?.defaultSign &&
                        isTabEnabled("default") && (
                          <>
                            <div className="flex justify-center">
                              <div
                                className={`${
                                  props?.isInitial
                                    ? "intialSignatureCanvas"
                                    : "signatureCanvas"
                                } bg-white border-[1.3px] border-[#007bff] flex flex-col justify-center items-center mb-[6px] cursor-pointer`}
                              >
                                <img
                                  alt="stamp img"
                                  className="w-full h-full object-contain bg-white"
                                  draggable="false"
                                  src={
                                    props?.isInitial
                                      ? props?.myInitial
                                      : props?.defaultSign
                                  }
                                />
                              </div>
                            </div>
                            {props.setIsAutoSign && autoSignAll()}
                            <div className="flex justify-end">
                              <SaveBtn />
                            </div>
                          </>
                        )}

                      {props?.isInitial &&
                        props?.myInitial &&
                        isTabEnabled("default") && (
                          <>
                            <div className="flex justify-center">
                              <div
                                className={`${
                                  props?.isInitial
                                    ? "intialSignatureCanvas"
                                    : "signatureCanvas"
                                } bg-white border-[1.3px] border-[#007bff] flex flex-col justify-center items-center mb-[6px] cursor-pointer`}
                              >
                                <img
                                  alt="stamp img"
                                  className="w-full h-full object-contain bg-white"
                                  draggable="false"
                                  src={
                                    props?.isInitial
                                      ? props?.myInitial
                                      : props?.defaultSign
                                  }
                                />
                              </div>
                            </div>
                            {props.setIsAutoSign && autoSignAll()}
                            <div className="flex justify-end">
                              <SaveBtn />
                            </div>
                          </>
                        )}
                    </>
                  ) : props?.isImageSelect || props?.isStamp ? (
                    !props?.image ? (
                      <div className="flex justify-center">
                        <div
                          className={`${
                            props?.isInitial
                              ? "intialSignatureCanvas"
                              : "signatureCanvas"
                          } bg-white border-[1.3px] border-[#007bff] flex flex-col justify-center items-center mb-[6px] cursor-pointer`}
                          onClick={() => props?.imageRef.current.click()}
                        >
                          <input
                            type="file"
                            onChange={props?.onImageChange}
                            className="filetype"
                            accept="image/png,image/jpeg"
                            ref={props?.imageRef}
                            hidden
                          />
                          <i className="fa-light fa-cloud-upload-alt uploadImgLogo"></i>
                          <div className="text-[10px]">{t("upload")}</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center">
                          <div
                            className={`${
                              props?.isInitial
                                ? "intialSignatureCanvas"
                                : "signatureCanvas"
                            } bg-white border-[1.3px] border-[#007bff] mb-[6px] overflow-hidden`}
                          >
                            <img
                              alt="print img"
                              ref={props?.imageRef}
                              src={props?.image.src}
                              draggable="false"
                              className="object-contain h-full w-full"
                            />
                          </div>
                        </div>
                        {props.setIsAutoSign && autoSignAll()}
                        <div className="flex justify-end">
                          <SaveBtn />
                        </div>
                      </>
                    )
                  ) : isTab === "type" ? (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="mr-[5px] text-[12px]">
                          {props?.isInitial
                            ? t("initial-teb")
                            : t("signature-tab")}
                          :
                        </span>
                        <input
                          maxLength={props?.isInitial ? 3 : 30}
                          style={{ fontFamily: fontSelect, color: penColor }}
                          type="text"
                          className="ml-1 op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-[20px]"
                          placeholder={
                            props?.isInitial
                              ? t("initial-type")
                              : t("signature-type")
                          }
                          value={typedSignature}
                          onChange={(e) => {
                            setTypedSignature(e.target.value);
                            convertToImg(fontSelect, e.target.value);
                          }}
                        />
                      </div>
                      <div className="border-[1px] border-[#d6d3d3] mt-[10px] ml-[5px]">
                        {fontOptions.map((font, ind) => {
                          return (
                            <div
                              key={ind}
                              style={{
                                cursor: "pointer",
                                fontFamily: font.value,
                                backgroundColor:
                                  fontSelect === font.value &&
                                  "rgb(206 225 247)"
                              }}
                              onClick={() => {
                                setFontSelect(font.value);
                                convertToImg(font.value, typedSignature);
                              }}
                            >
                              <div
                                className="py-[5px] px-[10px] text-[20px]"
                                style={{ color: penColor }}
                              >
                                {typedSignature
                                  ? typedSignature
                                  : "Your signature"}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-col justify-between mt-[10px]">
                        {props.setIsAutoSign && autoSignAll()}
                        <div className="flex flex-row justify-between mt-[10px]">
                          <PenColorComponent convertToImg={convertToImg} />
                          <SaveBtn />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center">
                        <SignatureCanvas
                          ref={canvasRef}
                          penColor={penColor}
                          canvasProps={{
                            className: `${
                              props?.isInitial
                                ? "intialSignatureCanvas"
                                : "signatureCanvas"
                            } border-[1.3px] border-[#007bff]`
                          }}
                          onEnd={() =>
                            handleSignatureChange(
                              canvasRef.current?.toDataURL()
                            )
                          }
                          dotSize={1}
                        />
                      </div>
                      <div className="flex flex-col justify-between mt-[10px]">
                        {props.setIsAutoSign && autoSignAll()}
                        {accesstoken &&
                          props?.saveSignCheckbox?.isVisible &&
                          savesigncheckbox}
                        <div className="flex flex-row justify-between mt-[10px]">
                          <PenColorComponent />
                          <SaveBtn />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div>
                <div className="relative flex flex-row items-center justify-between">
                  <div className="text-base-content font-bold text-lg">
                    Signature
                  </div>
                  <div
                    className="text-[1.5rem] cursor-pointer"
                    onClick={handleCancelBtn}
                  >
                    &times;
                  </div>
                </div>
                <div className="mx-3 mb-6 mt-3">
                  <p>{t("at-least-one-signature-type")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SignPad;
