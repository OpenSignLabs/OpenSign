import React from "react";
import stamp from "../../assests/stamp2.png";
import sign from "../../assests/sign3.png";
import { themeColor } from "../../utils/ThemeColor/backColor";

function DragElement({ type, id }) {
  const selectedId = id;
   
  return (
    <div>
      {selectedId === 3 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            userSelect: "none",
          }}
        >
          <img
            alt="sign img"
            style={{
              width: "25px",
              height: "23px",
              background: themeColor(),
            }}
            src={sign}
          />
          <span style={{ color: themeColor(), fontSize: "12px" }}>
            Signature
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            userSelect: "none",
          }}
        >
          <img
            alt="stamp img"
            style={{
              width: "25px",
              height: "23px",
              background: themeColor(),
            }}
            src={stamp}
          />
          <span style={{ color: themeColor(), fontSize: "12px" }}>Stamp</span>
        </div>
      )}
    </div>
  );
}

export default DragElement;
