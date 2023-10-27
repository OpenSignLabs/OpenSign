import React, { useState } from "react";
import check from "../../assests/checkBox.png";
import { themeColor } from "../../utils/ThemeColor/backColor";

function SignerListPlace({
  signerPos,
  signersdata,
  isSelectListId,
  setSignerObjId,
  setIsSelectId,
  setContractName
}) {
  const color = [
    "#93a3db",
    "#e6c3db",
    "#c0e3bc",
    "#bce3db",
    "#b8ccdb",
    "#ceb8db",
    "#ffccff",
    "#99ffcc",
    "#cc99ff",
    "#ffcc99",
    "#66ccff",
    "#ffffcc",
  ];

  const nameColor = [
    "#304fbf",
    "#7d5270",
    "#5f825b",
    "#578077",
    "#576e80",
    "#6d527d",
    "#cc00cc",
    "#006666",
    "#cc00ff",
    "#ff9900",
    "#336699",
    "#cc9900",
  ];
  const [isHover, setIsHover] = useState();

  //function for onhover signer name change background color
  const onHoverStyle = (ind) => {
    const style = {
      background: color[ind % color.length],
      padding: "10px",
      marginTop: "2px",
      display: "flex",
      flexDirection: "row",
      borderBottom: "1px solid #e3e1e1",
    };
    return style;
  };
  //function for onhover signer name remove background color
  const nonHoverStyle = (ind) => {
    const style = {
      // width:"250px",
      padding: "10px",
      marginTop: "2px",
      display: "flex",
      flexDirection: "row",

      justifyContent: "space-between",
    };
    return style;
  };

  const getFirstLetter = (name) => {
    const firstLetter = name.charAt(0);
    return firstLetter;
  };

  return (
    <div  >
      <div
        style={{
          background: themeColor(),

          padding: "5px",
        }}
      >
        <span className="signedStyle">Reicipents</span>
      </div>
       
      <div className="signerList">
        {signersdata.Signers &&
          signersdata.Signers.map((obj, ind) => {
            return (
              <div
                data-tut="reactourFirst"
                onMouseEnter={() => setIsHover(ind)}
                onMouseLeave={() => setIsHover(null)}
                key={ind}
                style={
                  isHover === ind || isSelectListId === ind
                    ? onHoverStyle(ind)
                    : nonHoverStyle(ind)
                }
                onClick={() => {
                  setSignerObjId(obj.objectId);
                  setIsSelectId(ind);
                  setContractName(obj.className)
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div
                    className="signerStyle"
                    style={{
                      background: nameColor[ind % nameColor.length],
                      width: 20,
                      height: 20,
                      display: "flex",
                      borderRadius: 30 / 2,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: "20px",
                      marginTop: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "8px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {" "}
                      {getFirstLetter(obj.Name)}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="userName">{obj.Name}</span>
                    <span className="useEmail">{obj.Email}</span>
                  </div>
                </div>
                {signerPos.map((data, key) => {
                  return (
                    data.signerObjId === obj.objectId && (
                      <div key={key}>
                        <img alt="no img" src={check} width={20} height={20} />
                      </div>
                    )
                  );
                })}

                <hr />
              </div>
            );
          })}
      </div>
    
    </div>
  );
}

export default SignerListPlace;
