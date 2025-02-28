import React, { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SignatureCanvas from "react-signature-canvas";

function SignPad(props) {
  const { t } = useTranslation();
  const [penColor, setPenColor] = useState("blue");
  const allColor = ["blue", "red", "black"];
  const canvasRef = useRef(null);
  const [isDefaultSign, setIsDefaultSign] = useState(false);
  const [isTab, setIsTab] = useState("");
  const [isSignImg, setIsSignImg] = useState("");
  const [signValue, setSignValue] = useState("");
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [signatureType, setSignatureType] = useState("");
  const [isSignTypes, setIsSignTypes] = useState(true);
  const fontOptions = [
    { value: "Fasthand" },
    { value: "Dancing Script" },
    { value: "Cedarville Cursive" },
    { value: "Delicious Handrawn" }
    // Add more font options as needed
  ];
  const [fontSelect, setFontSelect] = useState(fontOptions[0].value);

  const senderUser =
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    ) &&
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
  const jsonSender = JSON.parse(senderUser);
  const currentUserName = jsonSender && jsonSender?.name;

  useEffect(() => {
    handleTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.signatureTypes]);

  function handleTab() {
    const signtypes = props?.signatureTypes || [];
    const index = signtypes?.findIndex((x) => x.enabled === true);
    if (index !== -1) {
      setIsSignTypes(true);
      const tab = props?.signatureTypes[index].name;
      if (tab === "draw") {
        setIsTab("draw");
        setSignatureType("draw");
      } else if (tab === "upload") {
        props?.setIsImageSelect(true);
        setIsTab("uploadImage");
      } else if (tab === "typed") {
        setIsTab("type");
      } else if (tab === "default") {
        setIsTab("mysignature");
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
    props?.setCurrWidgetsDetails({});
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
          onClick={() => {
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
                    !props?.isInitial && textHeight > 35 ? 35 : textHeight
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
            props?.setIsInitial(false);
            props?.setIsImageSelect(false);
            setIsDefaultSign(false);
            props?.setImage();
            handleTab();
            setSignValue("");
            props?.setIsStamp(false);
          }}
          type="button"
          className={`${
            isSignImg || props?.image || isDefaultSign || textWidth
              ? ""
              : "pointer-events-none"
          } op-btn op-btn-primary shadow-lg`}
          disabled={
            (isTab === "draw" && isSignImg) ||
            (isTab === "image" && props?.image) ||
            (isTab === "mysignature" && isDefaultSign) ||
            (isTab === "type" && signValue)
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
  //useEffect for set already draw or save signature url/text url of signature text type and draw type for initial type and signature type widgets
  useEffect(() => {
    if (props?.currWidgetsDetails && canvasRef.current) {
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
    }

    const trimmedName = currentUserName && currentUserName?.trim();
    const firstCharacter = trimmedName?.charAt(0);
    const userName = props?.isInitial ? firstCharacter : currentUserName;
    setSignValue(userName || "");
    setFontSelect("Fasthand");

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
      const trimmedName = signValue
        ? signValue?.trim()
        : currentUserName?.trim();
      const firstCharacter = trimmedName?.charAt(0);
      const userName = props?.isInitial ? firstCharacter : signValue;
      setSignValue(userName);
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
      <div className="flex flex-row items-start">
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
                props?.convertToImg &&
                  props?.convertToImg(fontSelect, signValue, data);
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
    );
  };

  // `handleCancelBtn` function trigger when user click on cross button
  const handleCancelBtn = () => {
    setPenColor("blue");
    props?.setIsSignPad(false);
    props?.setIsInitial(false);
    props?.setIsImageSelect(false);
    setIsDefaultSign(false);
    props?.setImage();
    handleTab();
    setSignValue("");
    props?.setIsStamp(false);
  };
  return (
    <div>
      {props?.isSignPad && (
        <div className="op-modal op-modal-open">
          <div className="op-modal-box px-[13px] pt-2 pb-0">
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
                      <div className="flex justify-center">
                        <div
                          style={{
                            border: "1.3px solid #007bff",
                            borderRadius: "2px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 6,
                            cursor: "pointer"
                          }}
                          className={
                            props?.isInitial
                              ? "intialSignatureCanvas"
                              : "signatureCanvas"
                          }
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
                      <div className="flex justify-end">
                        <SaveBtn />
                      </div>
                    </>
                  ) : props?.isImageSelect || props?.isStamp ? (
                    !props?.image ? (
                      <div className="flex justify-center">
                        <div
                          style={{
                            border: "1.3px solid #007bff",
                            borderRadius: "2px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 6,
                            cursor: "pointer"
                          }}
                          className={
                            props?.isInitial
                              ? "intialSignatureCanvas"
                              : "signatureCanvas"
                          }
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
                            style={{
                              border: "1.3px solid #007bff",
                              borderRadius: "2px",
                              marginBottom: 6,
                              overflow: "hidden"
                            }}
                            className={
                              props?.isInitial
                                ? "intialSignatureCanvas"
                                : "signatureCanvas"
                            }
                          >
                            <img
                              alt="print img"
                              ref={props?.imageRef}
                              src={props?.image.src}
                              draggable="false"
                              className=" object-contain h-full w-full"
                            />
                          </div>
                        </div>
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
                          placeholder="Your signature"
                          value={signValue}
                          onChange={(e) => {
                            setSignValue(e.target.value);
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
                                convertToImg(font.value, signValue);
                              }}
                            >
                              <div
                                style={{
                                  padding: "5px 10px 5px 10px",
                                  fontSize: "20px",
                                  color: penColor
                                }}
                              >
                                {signValue ? signValue : "Your signature"}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-row justify-between mt-[10px]">
                        <PenColorComponent convertToImg={convertToImg} />
                        <SaveBtn />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center">
                        <SignatureCanvas
                          ref={canvasRef}
                          penColor={penColor}
                          canvasProps={{
                            className: props?.isInitial
                              ? "intialSignatureCanvas"
                              : "signatureCanvas",
                            style: {
                              border: "1.6px solid #007bff",
                              borderRadius: "2px"
                            }
                          }}
                          // backgroundColor="rgb(255, 255, 255)"
                          onEnd={() =>
                            handleSignatureChange(
                              canvasRef.current?.toDataURL()
                            )
                          }
                          dotSize={1}
                        />
                      </div>
                      <div className="flex flex-row justify-between mt-[10px]">
                        <PenColorComponent />
                        <SaveBtn />
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="">
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
