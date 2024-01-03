import React from "react";
import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import redPen from "../../assests/redPen.png";
import bluePen from "../../assests/bluePen.png";
import blackPen from "../../assests/blackPen.png";
import Modal from "react-bootstrap/Modal";
import { themeColor } from "../../utils/ThemeColor/backColor";
import { useEffect } from "react";

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
  setSignature
}) {
  const [penColor, setPenColor] = useState("blue");
  const allColor = [bluePen, redPen, blackPen];
  const canvasRef = useRef(null);
  const [isDefaultSign, setIsDefaultSign] = useState(false);
  const [isTab, setIsTab] = useState("draw");
  const [isSignImg, setIsSignImg] = useState("");
  const [signValue, setSignValue] = useState("");
  const [textWidth, setTextWidth] = useState(null);
  const fontOptions = [
    { value: "Fasthand" },
    { value: "Dancing Script" },
    { value: "Cedarville Cursive" },
    { value: "Delicious Handrawn" }
    // Add more font options as needed
  ];
  const [fontSelect, setFontSelect] = useState(fontOptions[0].value);

  useEffect(() => {
    const senderUser =
      localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      ) &&
      localStorage.getItem(
        `Parse/${localStorage.getItem("parseAppId")}/currentUser`
      );
    const jsonSender = JSON.parse(senderUser);

    const currentUserName = jsonSender && jsonSender.name;
    //function for clear signature
    setSignValue(currentUserName);
  }, []);
  //function for clear signature
  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }

    setIsSignImg("");
  };
  //function for set signature url
  const handleSignatureChange = (dataURL) => {
    // canvasRef.current.backgroundColor = 'rgb(165, 26, 26)'
    setSignature(canvasRef.current.toDataURL());
    setIsSignImg(canvasRef.current.toDataURL());
  };

  //save button component
  const SaveBtn = () => {
    return (
      <div>
        {!isStamp && !isImageSelect && (
          <button
            style={{
              color: "black"
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
              if (isDefaultSign) {
                setIsSignImg("");
                onSaveSign(isDefaultSign);
              } else {
                if (isTab === "type") {
                  setIsSignImg("");
                  onSaveSign(false, textWidth, 25);
                } else {
                  setIsSignImg("");
                  onSaveSign();
                }
              }

              setPenColor("blue");
            } else {
              setIsSignImg("");
              onSaveImage();
            }
            setIsSignPad(false);

            setIsImageSelect(false);
            setIsDefaultSign(false);
            setImage();
            setIsTab("draw");
          }}
          style={{
            background: themeColor(),
            color: "white"
          }}
          disabled={
            isSignImg || image || isDefaultSign || textWidth ? false : true
          }
          type="button"
          className={
            isSignImg || image ? "finishBtn saveBtn" : "disabledFinish saveBtn"
          }
        >
          Save
        </button>
      </div>
    );
  };

  useEffect(() => {
    // Load the default signature after the component mounts
    if (canvasRef.current) {
      canvasRef.current.fromDataURL(isSignImg);
    }
    if (isTab === "type") {
      convertToImg();
    }
  }, [isTab]);
  //function for convert input text value in image
  const convertToImg = async (fontStyle) => {
    //get text content to convert in image
    const textContent = signValue;
    const fontfamily = fontStyle ? fontStyle : fontSelect;
    // Calculate the width of the text content
    const textWidth = getTextWidth(textContent, fontfamily);
    // Increase pixel ratio for higher resolution
    const pixelRatio = window.devicePixelRatio || 1;
    // Create a canvas with the calculated width
    const canvas = document.createElement("canvas");
    canvas.width = textWidth * pixelRatio + 10 * pixelRatio;
    canvas.height = 20 * pixelRatio; // You can adjust the height as needed
    setTextWidth(textWidth * pixelRatio);

    // Draw the text content on the canvas
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(pixelRatio, pixelRatio);
    context.font = `13px ${fontfamily}`; // You can adjust the font size and style
    context.fillText(textContent, 0, 10); // Adjust the y-coordinate as needed

    // Convert the canvas to image data
    const dataUrl = canvas.toDataURL("image/png");

    setSignature(dataUrl);
  };

  //for getting text content width render text in span tag and get width
  const getTextWidth = (text, fontfamily) => {
    const tempSpan = document.createElement("span");
    tempSpan.innerText = text;
    tempSpan.style.visibility = "hidden";
    tempSpan.style.fontFamily = fontfamily;
    document.body.appendChild(tempSpan);
    const width = tempSpan.getBoundingClientRect().width;
    document.body.removeChild(tempSpan);
    return width;
  };
  return (
    <div>
      {/*isSignPad  */}
      <Modal show={isSignPad}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            background: "white",
            borderBottom: "1.6px solid #ebe6e6",
            marginTop: "15px"
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
              <span style={{ color: themeColor() }} className="signTab">
                Upload Image
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
                      color: isTab === "draw" ? themeColor() : "#515252",

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
                      color: isTab === "uploadImage" ? themeColor() : "#515252"
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
                      color: isTab === "type" ? themeColor() : "#515252",

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
                {defaultSign && (
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
                          isTab === "mysignature" ? themeColor() : "#515252"
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
                )}
              </>
            )}
          </div>

          <button
            style={{
              border: "0px",
              background: "none",
              paddingLeft: "7px",
              paddingRight: "7px",
              marginRight: "5px"
            }}
            onClick={() => {
              setPenColor("blue");
              setIsSignPad(false);

              setIsImageSelect(false);
              setIsDefaultSign(false);
              setImage();
              setIsTab("draw");
            }}
          >
            X
          </button>
        </div>

        {/* signature modal */}
        <Modal.Body className="modalBody">
          {isDefaultSign ? (
            <>
              <div
                style={{
                  border: "1px solid black",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 6,
                  cursor: "pointer"
                  //  background:'rgb(255, 255, 255)'
                }}
                className="signatureCanvas"
              >
                <img
                  alt="stamp img"
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "rgb(255, 255, 255)",
                    objectFit: "contain"
                  }}
                  src={defaultSign}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SaveBtn />
              </div>
            </>
          ) : isImageSelect || isStamp ? (
            !image ? (
              <div
                style={{
                  border: "1px solid black",

                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 6,
                  cursor: "pointer"
                }}
                className="signatureCanvas"
                onClick={() => imageRef.current.click()}
              >
                <input
                  type="file"
                  onChange={onImageChange}
                  className="filetype"
                  accept="image/*"
                  ref={imageRef}
                  hidden
                  // style={{ display: "none" }}
                />
                <i className="fas fa-cloud-upload-alt uploadImgLogo"></i>
                <div className="uploadImg">Upload</div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    // position: "relative",

                    border: "1px solid black",
                    marginBottom: 6,
                    // justifyContent:"center"
                    overflow: "hidden"
                  }}
                  className="signatureCanvas"
                >
                  <img
                    alt="print img"
                    ref={imageRef}
                    // alt="preview image"
                    src={image.src}
                    style={{
                      //overflow:"hidden",
                      objectFit: "contain"
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                <span className="signatureText">Signature:</span>
                <input
                  maxLength={15}
                  style={{ fontFamily: fontSelect }}
                  type="text"
                  className="signatureInput"
                  placeholder="Your signature"
                  value={signValue}
                  onChange={(e) => {
                    setSignValue(e.target.value);
                    convertToImg();
                  }}
                />
              </div>
              <div className="fontOptionContainer">
                {fontOptions.map((font, ind) => {
                  return (
                    <div
                      key={ind}
                      style={{
                        fontFamily: font.value,
                        backgroundColor:
                          fontSelect === font.value && "rgb(206 225 247)"
                      }}
                      onClick={() => {
                        setFontSelect(font.value);
                        convertToImg(font.value);
                      }}
                    >
                      <div
                        style={{
                          padding: "5px 10px 5px 10px",
                          fontSize: "20px"
                        }}
                      >
                        {signValue ? signValue : "Your signature"}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <SaveBtn />
              </div>
            </div>
          ) : (
            <>
              <SignatureCanvas
                ref={canvasRef}
                penColor={penColor}
                canvasProps={{
                  className: "signatureCanvas"
                }}
                backgroundColor="rgb(255, 255, 255)"
                onEnd={() =>
                  handleSignatureChange(canvasRef.current.toDataURL())
                }
                dotSize={1}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: "4px"
                }}
              >
                <div style={{ display: "flex", flexDirection: "row" }}>
                  {allColor.map((data, key) => {
                    return (
                      <img
                        key={key}
                        alt="pen img"
                        style={{
                          border: "none",
                          margin: "5px",
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
                        src={data}
                        width={20}
                        height={20}
                      />
                      // </button>
                    );
                  })}
                </div>

                <SaveBtn />
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default SignPad;
