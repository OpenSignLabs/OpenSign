import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { themeColor } from "../../constant/const";

function SignPad({
  isSignPad,
  isStamp,
  setIsImageSelect,
  onSaveSign,
  setIsSignPad,
  setImage,
  isImageSelect,
  imageRef,
  onImageChange,
  onSaveImage,
  image,
  defaultSign,
  setSignature,
  myInitial,
  isInitial,
  setIsInitial,
  setIsStamp,
  widgetType
}) {
  const [penColor, setPenColor] = useState("blue");
  const allColor = ["blue", "red", "black"];
  const canvasRef = useRef(null);
  const [isDefaultSign, setIsDefaultSign] = useState(false);
  const [isTab, setIsTab] = useState("draw");
  const [isSignImg, setIsSignImg] = useState("");
  const [signValue, setSignValue] = useState("");
  const [textWidth, setTextWidth] = useState(null);
  const [textHeight, setTextHeight] = useState(null);
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

  const currentUserName = jsonSender && jsonSender.name;

  useEffect(() => {
    const trimmedName = currentUserName.trim();
    const firstCharacter = trimmedName.charAt(0);
    const userName = isInitial ? firstCharacter : currentUserName;
    setSignValue(userName);
    setFontSelect("Fasthand");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //function for clear signature image
  const handleClear = () => {
    if (isTab === "draw") {
      if (canvasRef.current) {
        canvasRef.current.clear();
      } else if (isStamp) {
        setImage("");
      }

      setIsSignImg("");
    } else if (isTab === "uploadImage") {
      setImage("");
    }
    setIsInitial(false);
  };
  //function for set signature url
  const handleSignatureChange = () => {
    setSignature(canvasRef.current.toDataURL());
    setIsSignImg(canvasRef.current.toDataURL());
  };

  //save button component
  const SaveBtn = () => {
    return (
      <div style={{ marginTop: "2px" }}>
        {(isTab === "draw" || isTab === "uploadImage") && (
          <button
            style={{
              color: "black",
              border: "1px solid #ccc"
            }}
            type="button"
            className="finishBtn saveBtn"
            onClick={() => handleClear()}
          >
            Clear
          </button>
        )}

        <button
          onClick={() => {
            if (!image) {
              if (isTab === "mysignature") {
                setIsSignImg("");
                if (isInitial) {
                  onSaveSign("initials");
                } else {
                  onSaveSign("default");
                }
              } else {
                if (isTab === "type") {
                  setIsSignImg("");
                  onSaveSign(false, textWidth, textHeight);
                } else {
                  onSaveSign();
                }
              }

              setPenColor("blue");
            } else {
              setIsSignImg("");
              onSaveImage();
            }
            setIsSignPad(false);
            setIsInitial(false);
            setIsImageSelect(false);
            setIsDefaultSign(false);
            setImage();
            setIsTab("draw");
            setSignValue("");
            setIsStamp(false);
          }}
          style={{
            background: themeColor,
            color: "white"
          }}
          disabled={
            isSignImg || image || isDefaultSign || textWidth ? false : true
          }
          type="button"
          className={
            isSignImg || image || isDefaultSign || textWidth
              ? "finishBtn saveBtn"
              : "disabledFinish saveBtn"
          }
        >
          Save
        </button>
      </div>
    );
  };

  useEffect(() => {
    if (canvasRef.current && isSignImg) {
      canvasRef.current.fromDataURL(isSignImg);
    }
    const trimmedName = currentUserName.trim();
    const firstCharacter = trimmedName.charAt(0);
    const userName = isInitial ? firstCharacter : currentUserName;
    setSignValue(userName);
    setFontSelect("Fasthand");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignPad]);
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
      const trimmedName = signValue ? signValue.trim() : currentUserName.trim();
      const firstCharacter = trimmedName.charAt(0);
      const userName = isInitial ? firstCharacter : signValue;
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

    //creating span for getting text content width
    const span = document.createElement("span");
    span.textContent = textContent;
    span.style.font = `20px ${fontfamily}`; // here put your text size and font family
    span.style.color = color ? color : penColor;
    span.style.display = "hidden";
    document.body.appendChild(span); // Replace 'container' with the ID of the container element

    //create canvas to render text in canvas and convert in image
    const canvasElement = document.createElement("canvas");
    // Draw the text content on the canvas
    const ctx = canvasElement.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;
    const width = span.offsetWidth;
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
    setSignature(dataUrl);
  };

  const PenColorComponent = (props) => {
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
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
              className="fa solid fa-pen-nib"
              width={20}
              height={20}
            ></i>
          );
        })}
      </div>
    );
  };
  return (
    <div>
      {isSignPad && (
        <div className="modaloverlay">
          <div className="modalcontainer">
            <div
              className="modalheader"
              style={{ padding: "0 13px", marginTop: "5px" }}
            >
              <div className="modaltitle">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    background: "white",
                    marginTop: "3px"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      alignItems: "end",
                      gap: 10
                    }}
                  >
                    {isStamp ? (
                      <span style={{ color: themeColor }} className="signTab">
                        {widgetType === "image"
                          ? "Upload image"
                          : "Upload stamp image"}
                      </span>
                    ) : (
                      <>
                        <div>
                          <span
                            onClick={() => {
                              setIsDefaultSign(false);
                              setIsImageSelect(false);
                              setIsTab("draw");
                              setImage();
                            }}
                            style={{
                              color: isTab === "draw" ? themeColor : "#515252",
                              marginLeft: "2px"
                            }}
                            className="signTab"
                          >
                            Draw
                          </span>

                          <div
                            style={{
                              border:
                                isTab === "draw"
                                  ? "1.5px solid #108783"
                                  : "1.5px solid #ffffff"
                            }}
                          ></div>
                        </div>
                        <div>
                          <span
                            onClick={() => {
                              setIsDefaultSign(false);
                              setIsImageSelect(true);
                              setIsTab("uploadImage");
                            }}
                            style={{
                              color:
                                isTab === "uploadImage" ? themeColor : "#515252"
                            }}
                            className="signTab"
                          >
                            Upload Image
                          </span>
                          <div
                            style={{
                              border:
                                isTab === "uploadImage"
                                  ? "1.5px solid #108783"
                                  : "1.5px solid #ffffff"
                            }}
                          ></div>
                        </div>
                        <div>
                          <span
                            onClick={() => {
                              setIsDefaultSign(false);
                              setIsImageSelect(false);
                              setIsTab("type");
                              setImage();
                            }}
                            style={{
                              color: isTab === "type" ? themeColor : "#515252",
                              marginLeft: "2px"
                            }}
                            className="signTab"
                          >
                            Type
                          </span>

                          <div
                            style={{
                              border:
                                isTab === "type"
                                  ? "1.5px solid #108783"
                                  : "1.5px solid #ffffff"
                            }}
                          ></div>
                        </div>
                        {!isInitial && defaultSign ? (
                          <div>
                            <span
                              onClick={() => {
                                setIsDefaultSign(true);
                                setIsImageSelect(true);
                                setIsTab("mysignature");
                                setImage();
                              }}
                              style={{
                                color:
                                  isTab === "mysignature"
                                    ? themeColor
                                    : "#515252"
                              }}
                              className="signTab"
                            >
                              My Signature
                            </span>
                            <div
                              style={{
                                border:
                                  isTab === "mysignature"
                                    ? "1.5px solid #108783"
                                    : "1.5px solid #ffffff"
                              }}
                            ></div>
                          </div>
                        ) : (
                          isInitial &&
                          myInitial && (
                            <div>
                              <span
                                onClick={() => {
                                  setIsDefaultSign(true);
                                  setIsImageSelect(true);
                                  setIsTab("mysignature");
                                  setImage();
                                }}
                                style={{
                                  color:
                                    isTab === "mysignature"
                                      ? themeColor
                                      : "#515252"
                                }}
                                className="signTab"
                              >
                                My Initials
                              </span>
                              <div
                                style={{
                                  border:
                                    isTab === "mysignature"
                                      ? "1.5px solid #108783"
                                      : "1.5px solid #ffffff"
                                }}
                              ></div>
                            </div>
                          )
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div
                className="closebtn"
                style={{ color: "black" }}
                onClick={() => {
                  setPenColor("blue");
                  setIsSignPad(false);
                  setIsInitial(false);
                  setIsImageSelect(false);
                  setIsDefaultSign(false);
                  setImage();
                  setIsTab("draw");
                  setSignValue("");
                  setIsStamp(false);
                }}
              >
                &times;
              </div>
            </div>
            <div style={{ height: "100%", padding: 20 }}>
              {isDefaultSign ? (
                <>
                  <div style={{ display: "flex", justifyContent: "center" }}>
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
                        isInitial ? "intialSignatureCanvas" : "signatureCanvas"
                      }
                    >
                      <img
                        alt="stamp img"
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "rgb(255, 255, 255)",
                          objectFit: "contain"
                        }}
                        draggable="false"
                        src={isInitial ? myInitial : defaultSign}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <SaveBtn />
                  </div>
                </>
              ) : isImageSelect || isStamp ? (
                !image ? (
                  <div style={{ display: "flex", justifyContent: "center" }}>
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
                        isInitial ? "intialSignatureCanvas" : "signatureCanvas"
                      }
                      onClick={() => imageRef.current.click()}
                    >
                      <input
                        type="file"
                        onChange={onImageChange}
                        className="filetype"
                        accept="image/*"
                        ref={imageRef}
                        hidden
                      />
                      <i className="fas fa-cloud-upload-alt uploadImgLogo"></i>
                      <div className="uploadImg">Upload</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div
                        style={{
                          border: "1.3px solid #007bff",
                          borderRadius: "2px",
                          marginBottom: 6,
                          overflow: "hidden"
                        }}
                        className={
                          isInitial
                            ? "intialSignatureCanvas"
                            : "signatureCanvas"
                        }
                      >
                        <img
                          alt="print img"
                          ref={imageRef}
                          src={image.src}
                          draggable="false"
                          style={{
                            objectFit: "contain",
                            height: "100%",
                            width: "100%"
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <SaveBtn />
                    </div>
                  </>
                )
              ) : isTab === "type" ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span className="signatureText">
                      {isInitial ? "Initials" : "Signature"}:
                    </span>

                    <input
                      maxLength={isInitial ? 3 : 30}
                      style={{ fontFamily: fontSelect, color: penColor }}
                      type="text"
                      className="signatureInput"
                      placeholder="Your signature"
                      value={signValue}
                      onChange={(e) => {
                        setSignValue(e.target.value);
                        convertToImg(fontSelect, e.target.value);
                      }}
                    />
                  </div>

                  <div className="fontOptionContainer">
                    {fontOptions.map((font, ind) => {
                      return (
                        <div
                          key={ind}
                          style={{
                            cursor: "pointer",
                            fontFamily: font.value,
                            backgroundColor:
                              fontSelect === font.value && "rgb(206 225 247)"
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

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: "10px"
                    }}
                  >
                    <PenColorComponent convertToImg={convertToImg} />
                    <SaveBtn />
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <SignatureCanvas
                      ref={canvasRef}
                      penColor={penColor}
                      canvasProps={{
                        className: isInitial
                          ? "intialSignatureCanvas"
                          : "signatureCanvas",
                        style: {
                          border: "1.6px solid #007bff",
                          borderRadius: "2px"
                        }
                      }}
                      backgroundColor="rgb(255, 255, 255)"
                      onEnd={() =>
                        handleSignatureChange(canvasRef.current.toDataURL())
                      }
                      dotSize={1}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: "10px"
                    }}
                  >
                    <PenColorComponent />
                    <SaveBtn />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignPad;
