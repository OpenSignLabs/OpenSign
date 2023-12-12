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
  const [isTab, setIsTab] = useState("signature");
  const [isSignImg, setIsSignImg] = useState("");
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
                setIsSignImg("");
                onSaveSign();
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
            setIsTab("signature");
          }}
          style={{
            background: themeColor(),
            color: "white"
          }}
          disabled={isSignImg || image || isDefaultSign ? false : true}
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
  }, [isTab]);

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

              // background: themeColor(),
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
                      setIsTab("signature");
                      setImage();
                    }}
                    style={{
                      color: isTab === "signature" ? themeColor() : "#515252",
                      marginLeft: "2px"
                    }}
                    className="signTab"
                  >
                    Signature
                  </span>

                  <div
                    style={{
                      border:
                        isTab === "signature"
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
              setIsTab("signature");
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
                }}
                className="signatureCanvas"
              >
                <img
                  alt="stamp img"
                  style={{
                    width: "100%",
                    height: "100%",
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
                />
                <i className="fas fa-cloud-upload-alt uploadImgLogo"></i>
                <div className="uploadImg">Upload</div>
              </div>
            ) : (
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
                  }}
                  className="signatureCanvas"
                >
                  <img
                    alt="stamp img"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain"
                    }}
                    ref={imageRef}
                    src={image.src}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <SaveBtn />
                </div>
              </>
            )
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
