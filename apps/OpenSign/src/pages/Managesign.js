import React, { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import "../styles/managesign.css";
import "../styles/signature.css";
import { toDataUrl } from "../constant/Utils";
import Parse from "parse";
import { appInfo } from "../constant/appinfo";
const ManageSign = () => {
  const appName = appInfo.appname;
  const [penColor, setPenColor] = useState("blue");
  const [initialPen, setInitialPen] = useState("blue");
  const [image, setImage] = useState();
  const [signName, setSignName] = useState("");
  const [signature, setSignature] = useState("");
  const [warning, setWarning] = useState(false);
  const [nameWarning, setNameWarning] = useState(false);
  const [isvalue, setIsValue] = useState(false);
  const allColor = ["blue", "red", "black"];
  const [isLoader, setIsLoader] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
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
  // cWT92Z2ycy
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

    if (!signName) {
      setNameWarning(true);
    } else if (!isvalue) {
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
      // console.log("isUrl ", isUrl);
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
      return response?.url();
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
        setIsSuccess(true);
        return res;
      } catch (err) {
        console.log(err);
        setIsLoader(false);
        alert(`${err.message}`);
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
        setIsSuccess(true);
        return res;
      } catch (err) {
        console.log(err);
        setIsLoader(false);
        alert(`${err.message}`);
      }
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
        backgroundColor: "white",
        maxHeight: "500px",
        overflow: "auto"
      }}
    >
      {isLoader && (
        <div className="absolute bg-black bg-opacity-75 inset-0 z-50 flex justify-center items-center">
          <div style={{ height: "300px" }}>
            <div
              style={{
                marginLeft: "45%",
                marginTop: "150px",
                fontSize: "45px",
                color: "#3dd3e0"
              }}
              className="loader-37"
            ></div>
          </div>
        </div>
      )}
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
          width: "100%",
          paddingRight: "10px"
        }}
      >
        <div style={{ margin: 20 }}>
          <div
            style={{
              fontWeight: "700",
              fontSize: 15,
              color: "#000",
              paddingBottom: 8
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
                paddingBottom: 5
              }}
            >
              Signer&apos;s Name
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
                fontSize: 12
              }}
              required
              onFocus={() => setNameWarning(false)}
              onChange={(e) => setSignName(e.target.value)}
            />

            <label
              htmlFor="imgoverview"
              style={{
                fontSize: 12,
                paddingBottom: 5
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
                    paddingLeft: 10
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10
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
                          border: "2px solid #888"
                          // marginBottom: 6
                        }}
                        className="signatureCanvas"
                      >
                        <img
                          alt="preview image"
                          src={image}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
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
                          className: "signatureCanvas"
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
                        justifyContent: "space-between"
                        // width: 460,
                      }}
                      className="penContainerDefault"
                    >
                      <div>
                        {!image && (
                          <div
                            style={{ display: "flex", flexDirection: "row" }}
                          >
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
                                  className="fa solid fa-pen-nib"
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
                          className="clearbtn cursor-pointer"
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
                <span className="signature">Initials</span>
              </div>
              <div>
                {isInitials ? (
                  <div
                    style={{
                      position: "relative",
                      border: "2px solid #888"
                      // marginBottom: 6
                    }}
                    className="intialSignature"
                  >
                    <img
                      alt="preview image"
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between"
                  }}
                  className="penContainerInitial"
                >
                  <div>
                    {!isInitials && (
                      <div style={{ display: "flex", flexDirection: "row" }}>
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
                              className="fa solid fa-pen-nib"
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
                      className="clearbtn cursor-pointer"
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
      </div>
    </div>
  );
};

export default ManageSign;
