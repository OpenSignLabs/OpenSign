import React, { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import redPen from "../assests/redPen.png";
import bluePen from "../assests/bluePen.png";
import blackPen from "../assests/blackPen.png";
import "../css/custom.css";
import "../css/signature.css";
import axios from "axios";
import { toDataUrl } from "../utils/toDataUrl";

// console.log("appName ", appName)
const ManageSign = () => {
  let appName;
  const [penColor, setPenColor] = useState("blue");
  const [initialPen, setInitialPen] = useState("blue");
  const [image, setImage] = useState();
  const [signName, setSignName] = useState("");
  const [signature, setSignature] = useState("");
  const [warning, setWarning] = useState(false);
  const [nameWarning, setNameWarning] = useState(false);
  const [isvalue, setIsValue] = useState(false);
  const allColor = [bluePen, redPen, blackPen];
  const [isLoader, setIsLoader] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [Initials, setInitials] = useState("");
  const [isInitials, setIsInitials] = useState(false);
  const [id, setId] = useState("");
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const initailsRef = useRef(null);
  useEffect(() => {
    getLocalStorageValue();
  }, []);

  //function for get localstorage value first and than call another function.
  const getLocalStorageValue = () => {
    let User = JSON.parse(
      localStorage.getItem(
        "Parse/" + localStorage.getItem("parseAppId") + "/currentUser"
      )
    );
    appName =
      localStorage.getItem("_appName") && localStorage.getItem("_appName");
    if (User) {
      fetchUserSign(User);
    }
  };

  const fetchUserSign = async (User) => {
    const userId = {
      __type: "Pointer",
      className: "_User",
      objectId: User.objectId,
    };
    const strObj = JSON.stringify(userId);
    const url =
      localStorage.getItem("baseUrl") +
      `classes/${appName}_Signature?where={"UserId":${strObj}}&limit=1`;

    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      // "X-Parse-Session-Token": localStorage.getItem("accesstoken"),
    };
    const res = await axios
      .get(url, { headers: headers })
      .then((res) => {
        if (res.data.results.length > 0) {
          setId(res.data.results[0].objectId);
          setSignName(res.data.results[0].SignatureName);
          // console.log(res.data.results[0].ImageURL);
          setImage(res.data.results[0].ImageURL);
          if (res.data.results[0] && res.data.results[0].Initials) {
            setInitials(res.data.results[0].Initials);
            setIsInitials(true);
          }
        }
        setIsLoader(false);
        return res;
      })
      .catch((error) => {
        console.log(error);
        alert(`${error.message}`);
      });
    return res;
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

  // const handleReset = () => {
  //   if (canvasRef.current) {
  //     canvasRef.current.clear();
  //   }
  //   if (imageRef.current) {
  //     imageRef.current.value = "";
  //   }
  //   setImage("");
  //   setSignature("");
  //   setIsValue(false);
  //   setSignName("");
  // };
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

    if (!signName) {
      setNameWarning(true);
      // setTimeout(() => setNameWarning(false), 1000);
    } else if (!isvalue) {
      setWarning(true);
      setTimeout(() => setWarning(false), 1000);
    } else {
      setIsLoader(true);
      const replaceSpace = signName.replace(/ /g, "_");
      let file;
      if (signature) {
        file = base64StringtoFile(signature, `${replaceSpace}.png`);
      } else {
        if (!isUrl) {
          file = base64StringtoFile(image, `${replaceSpace}.png`);
        }
      }
      console.log("isUrl ", isUrl);
      let imgUrl;
      if (!isUrl) {
        imgUrl = await uploadFile(file);
      } else {
        imgUrl = { data: { imageUrl: image } };
      }
      let initialsUrl = "";
      if (Initials) {
        const initialsImg = base64StringtoFile(Initials, `${replaceSpace}.png`);
        initialsUrl = await uploadFile(initialsImg);
      }
      if (imgUrl.data && imgUrl.data.imageUrl) {
        await saveEntry({
          name: signName,
          url: imgUrl.data.imageUrl,
          initialsUrl: initialsUrl,
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
    let parseBaseUrl = localStorage.getItem("baseUrl");
    parseBaseUrl = parseBaseUrl.slice(0, -4);
    const url = parseBaseUrl + `file_upload`;
    const formData = new FormData();
    formData.append("file", file);
    const config = {
      headers: {
        "content-type": "multipart/form-data",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      },
      onUploadProgress: function (progressEvent) {
        let percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        // setpercentage(percentCompleted);
      },
    };
    const response = await axios
      .post(url, formData, config)
      .then((res) => {
        if (res.data.status === "Error") {
          alert(res.data.message);
        }
        return res;
      })
      .catch((error) => {
        console.log(error);
        setIsLoader(false);
        alert(`${error.message}`);
      });
    return response;
  };

  const saveEntry = async (obj) => {
    if (id) {
      const User = JSON.parse(
        localStorage.getItem(
          "Parse/" + localStorage.getItem("parseAppId") + "/currentUser"
        )
      );
      const url =
        localStorage.getItem("baseUrl") +
        `classes/${localStorage.getItem("_appName")}_Signature/${id}`;
      const body = {
        Initials: obj.initialsUrl ? obj.initialsUrl.data.imageUrl : "",
        ImageURL: obj.url,
        SignatureName: obj.name,
        UserId: {
          __type: "Pointer",
          className: "_User",
          objectId: User.objectId,
        },
      };
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        // "X-Parse-Session-Token": localStorage.getItem("accesstoken"),
      };
      const res = await axios
        .put(url, body, { headers: headers })
        .then((res) => {
          // handleReset();
          setIsLoader(false);
          setIsSuccess(true);
          return res;
        })
        .catch((error) => {
          console.log(error);
          setIsLoader(false);
          alert(`${error.message}`);
        });
      return res;
    } else {
      const User = JSON.parse(
        localStorage.getItem(
          "Parse/" + localStorage.getItem("parseAppId") + "/currentUser"
        )
      );
      const url =
        localStorage.getItem("baseUrl") +
        `classes/${localStorage.getItem("_appName")}_Signature`;
      const body = {
        Initials: obj.initialsUrl ? obj.initialsUrl.data.imageUrl : "",
        ImageURL: obj.url,
        SignatureName: obj.name,
        UserId: {
          __type: "Pointer",
          className: "_User",
          objectId: User.objectId,
        },
      };
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        // "X-Parse-Session-Token": localStorage.getItem("accesstoken"),
      };
      const res = await axios
        .post(url, body, { headers: headers })
        .then((res) => {
          // handleReset();
          setIsLoader(false);
          setIsSuccess(true);
          return res;
        })
        .catch((error) => {
          console.log(error);
          setIsLoader(false);
          alert(`${error.message}`);
        });
      return res;
    }
  };
  const handleSignatureBtn = () => {
    if (imageRef.current) {
      imageRef.current.value = "";
    }
    setImage("");
  };
  const handleUploadBtn = () => {
    imageRef.current.click();
  };
  const handleInitialsChange = () => {
    setInitials(initailsRef.current.toDataURL());
    setIsValue(true);
  };
  return (
    <div
      style={{
        maxHeight: "500px",
        overflow: "auto",
      }}
    >
      {isSuccess && (
        <div
          className="alert alert-success successBox"
          role="alert"
          onAnimationEnd={() => setIsSuccess(false)}
        >
          Signature saved successfully!
        </div>
      )}

      <div
        className="mainDiv"
        style={{
          // height: "100%",

          width: "100%",
          paddingRight: "10px",

          // maxHeight:"500px",
        }}
      >
        <div style={{ margin: 20 }}>
          <div
            style={{
              fontWeight: "700",
              fontSize: 15,
              color: "#000",
              paddingBottom: 8,
            }}
          >
            Manage Signature
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label
              htmlFor="signName"
              style={{
                fontSize: 12,
                position: "relative",
                paddingBottom: 5,
              }}
            >
              Signer's Name
              {nameWarning && (
                <div
                  className="warning nameWarning"
                  style={{ fontSize: 12 }}
                  onAnimationEnd={() => setNameWarning(false)}
                >
                  <i
                    className="fas fa-exclamation-circle"
                    style={{ color: "#fab005", fontSize: 15 }}
                  ></i>{" "}
                  Please fill input field
                </div>
              )}
            </label>
            <input
              id="signName"
              className="signInputManage"
              value={signName}
              style={{
                border: "1px solid #ccc",
                borderRadius: 4,

                height: 35,
                padding: "6px 12px",
                marginBottom: 10,
                fontSize: 12,
              }}
              required
              onFocus={() => setNameWarning(false)}
              onChange={(e) => setSignName(e.target.value)}
            />

            <label
              htmlFor="imgoverview"
              style={{
                fontSize: 12,
                paddingBottom: 5,
              }}
            >
              Signature/Image
            </label>
          </div>
          <div className="signBlock">
            <div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "50%",
                    paddingLeft: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <>
                      <span
                        onClick={() => handleSignatureBtn()}
                        className="signature"
                      >
                        Signature
                      </span>
                    </>

                    <span
                      onClick={() => handleUploadBtn()}
                      className="imgupload"
                    >
                      Upload Image
                    </span>
                    <input
                      type="file"
                      onChange={onImageChange}
                      className="filetype"
                      accept="image/*"
                      ref={imageRef}
                      hidden
                    />
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <div>
                    {image ? (
                      <div
                        style={{
                          position: "relative",

                          border: "2px solid #888",
                          marginBottom: 6,
                        }}
                        className="signatureCanvas"
                      >
                        <img
                          alt="preview image"
                          src={image}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    ) : (
                      <SignatureCanvas
                        ref={canvasRef}
                        penColor={penColor}
                        canvasProps={{
                          width: "456px",
                          height: "180px",
                          className: "signatureCanvas",
                        }}
                        backgroundColor="rgb(255, 255, 255)"
                        onEnd={() =>
                          handleSignatureChange(canvasRef.current.toDataURL())
                        }
                        dotSize={1}
                      />
                    )}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        // width: 460,
                      }}
                      className="penContainer"
                    >
                      <div>
                        {!image && (
                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            {allColor.map((data, key) => {
                              return (
                                <img
                                  alt="black img"
                                  style={{
                                    border: "none",
                                    margin: "5px",
                                    borderBottom:
                                      key == 0 && penColor == "blue"
                                        ? "2px solid blue"
                                        : key == 1 && penColor == "red"
                                        ? "2px solid red"
                                        : key == 2 && penColor == "black"
                                        ? "2px solid black"
                                        : "2px solid white",
                                  }}
                                  onClick={() => {
                                    if (key == 0) {
                                      setPenColor("blue");
                                    } else if (key == 1) {
                                      setPenColor("red");
                                    } else if (key == 2) {
                                      setPenColor("black");
                                    }
                                  }}
                                  key={key}
                                  src={data}
                                  width={20}
                                  height={20}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div>
                        <div
                          type="button"
                          className="clearbtn"
                          onClick={() => handleClear()}
                        >
                          Clear
                        </div>
                      </div>
                    </div>
                  </div>
                  {warning && (
                    <div
                      className="warning signWarning"
                      style={{ fontSize: 12 }}
                    >
                      <i
                        className="fas fa-exclamation-circle"
                        style={{ color: "#fab005", fontSize: 15 }}
                      ></i>{" "}
                      Please upload signature/Image
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ margin: "6px 5px 18px" }}>
                <span
                  // onClick={() => handleSignatureBtn()}
                  className="signature"
                >
                  Initials
                </span>
              </div>
              <div>
                {isInitials ? (
                  <div
                    style={{
                      position: "relative",

                      border: "2px solid #888",
                      marginBottom: 6,
                    }}
                    className="signatureCanvas"
                  >
                    <img
                      alt="preview image"
                      src={Initials}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ) : (
                  <SignatureCanvas
                    ref={initailsRef}
                    penColor={initialPen}
                    canvasProps={{
                      width: "456px",
                      height: "180px",
                      className: "signatureCanvas",
                    }}
                    backgroundColor="rgb(255, 255, 255)"
                    onEnd={() =>
                      handleInitialsChange(initailsRef.current.toDataURL())
                    }
                    dotSize={1}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    // width: 460,
                  }}
                  className="penContainer"
                >
                  <div>
                    {!isInitials && (
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        {allColor.map((data, key) => {
                          return (
                            <img
                              style={{
                                border: "none",
                                margin: "5px",
                                borderBottom:
                                  key == 0 && initialPen == "blue"
                                    ? "2px solid blue"
                                    : key == 1 && initialPen == "red"
                                    ? "2px solid red"
                                    : key == 2 && initialPen == "black"
                                    ? "2px solid black"
                                    : "2px solid white",
                              }}
                              onClick={() => {
                                if (key == 0) {
                                  setInitialPen("blue");
                                } else if (key == 1) {
                                  setInitialPen("red");
                                } else if (key == 2) {
                                  setInitialPen("black");
                                }
                              }}
                              key={key}
                              src={data}
                              width={20}
                              height={20}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      type="button"
                      className="clearbtn"
                      onClick={() => handleClearInitials()}
                    >
                      Clear
                    </div>
                  </div>
                </div>
              </div>
              {/* {!warning && (
                <div className="warning signWarning" style={{ fontSize: 12 }}>
                  <i
                    className="fas fa-exclamation-circle"
                    style={{ color: "#fab005", fontSize: 15 }}
                  ></i>{" "}
                  Please upload signature/Image
                </div>
              )} */}
            </div>
          </div>
          <div style={{ paddingTop: 10 }}>
            <button
              className="customBtn successBtn"
              onClick={(e) => handleSubmit(e)}
            >
              save
            </button>
          </div>
        </div>
        {isLoader && (
          <div className="loaderContainer">
            <div className="loader"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSign;
