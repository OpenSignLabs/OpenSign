import React, { useEffect } from "react";
import axios from "axios";

function DefaultSignature({
  themeColor,
  defaultSignImg,
  setShowAlreadySignDoc,
  setDefaultSignImg,
  userObjectId,
  setIsLoading,
  xyPostion,
}) {
  useEffect(() => {
    getDefaultSignature(userObjectId);
  }, []);

  //function for fetch default sigature added bu users
  const getDefaultSignature = async (userObjectId) => {
    await axios
      .get(
        `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
          "_appName"
        )}_Signature?where={"UserId": {"__type": "Pointer","className": "_User", "objectId":"${userObjectId}"}}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken"),
          },
        }
      )
      .then((Listdata) => {
        const json = Listdata.data;
        const res = json.results;

        if (res[0] && res.length > 0) {
          setDefaultSignImg(res[0].ImageURL);
        }
        const loadObj = {
          isLoad: false,
        };
        setIsLoading(loadObj);
      })
      .catch((err) => {
        // this.setState({ loading: false });
        console.log("axois err ", err);
      });
  };

  const confirmToaddDefaultSign = () => {
    if (xyPostion.length > 0) {
      const alreadySign = {
        status: true,
        mssg: "Are you sure you want to sign at requested locations?",
        sure: true,
      };
      setShowAlreadySignDoc(alreadySign);
    } else {
      alert("please select position!");
    }
  };

  return (
    <div className="signerComponent">
      <div
        style={{
          background: themeColor(),
          color: "white",
          padding: "5px",
          fontFamily: "sans-serif",
        }}
      >
        Signature
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "10px",
          fontWeight: "600",
        }}
      >
        {defaultSignImg ? (
          <>
            <p>Your Signature</p>
            <div className="defaultSignBox">
              <img
                alt="default img"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
                src={defaultSignImg}
              />
            </div>
            <button
              style={{
                background: themeColor(),
                color: "white",
                marginTop: "20px",
                cursor: "pointer",
              }}
              type="button"
              className="finishBtn finishnHover"
              onClick={() => confirmToaddDefaultSign()}
            >
              Auto Sign All
            </button>
          </>
        ) : (
          <div style={{ margin: "10px" }}>
            <span>Click a signature placeholder to start signing the document!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DefaultSignature;
