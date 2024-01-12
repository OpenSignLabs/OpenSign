import React from "react";
import { themeColor } from "../../utils/ThemeColor/backColor";
import { getWidgetType } from "../../utils/Utils";

function AllWidgets(props) {
  const signStyle = "signatureBtn";

  return props.updateWidgets.map((item, ind) => {
    return (
      <div
        key={ind}
        ref={(element) => {
          item.ref(element);
          if (element) {
            if (props?.signRef) {
              props.signRef.current = element;
            }
          }
        }}
        className={signStyle}
        onMouseMove={props?.handleDivClick}
        onMouseDown={props?.handleMouseLeave}
        style={{
          // opacity: isDragSign ? 0.5 : 1,
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.18)",
          marginLeft: `${props?.marginLeft}px`
        }}
      >
        {/* <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: "5px"
          }}
        >
          <i
            class="fa-sharp fa-solid fa-grip-vertical"
            style={{ color: "#908d8d", fontSize: "13px" }}
          ></i>
          <span
            style={{
              fontWeight: "400",
              fontSize: "15px",
              // padding: "3px 20px 0px 20px",
              color: "black",
              marginLeft: "5px"
            }}
          >
            {item.type}
          </span>
        </div>
        <div
          style={{
            backgroundColor: themeColor(),
            padding: "0 5px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <i
            style={{ color: "white", fontSize: item.iconSize }}
            className={item.icon}
          ></i>
        </div> */}
        {getWidgetType(item)}
      </div>
    );
  });
}

export default AllWidgets;
