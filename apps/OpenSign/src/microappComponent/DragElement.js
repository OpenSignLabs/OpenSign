import React from "react";
import { themeColor } from "./themeColor";

function DragElement(item) {
  const getWidgets = [
    {
      type: "signature",
      icon: "fa-solid fa-pen-nib",
      iconSize: "20px"
    },
    {
      type: "stamp",
      icon: "fa-solid fa-stamp",
      iconSize: "19px"
    },
    {
      type: "dropdown",
      icon: "fa-solid fa-circle-chevron-down",
      iconSize: "19px"
    },
    {
      type: "checkbox",
      icon: "fa-solid fa-square-check",
      iconSize: "22px"
    },
    {
      type: "text",
      icon: "fa-solid fa-font",
      iconSize: "21px"
    },
    {
      type: "initials",
      icon: "fa-solid fa-signature",
      iconSize: "15px"
    },
    {
      type: "name",
      icon: "fa-solid fa-user",
      iconSize: "21px"
    },
    {
      type: "company",
      icon: "fa-solid fa-building",
      iconSize: "24px"
    },
    {
      type: "job title",
      icon: "fa-solid fa-address-card",
      iconSize: "16px"
    },
    {
      type: "date",
      icon: "fa-solid fa-calendar-days",
      iconSize: "19px"
    }
  ];

  const filterWidgetPreview = getWidgets.filter(
    (data) => data.type === item?.text
  );

  return (
    <div
      className="signatureBtn"
      style={{
        // opacity: isDragSign ? 0.5 : 1,
        boxShadow:
          "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.18)",
        marginLeft: "5px"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginLeft: "5px"
        }}
      >
        <i
          className="fa-sharp fa-solid fa-grip-vertical"
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
          {filterWidgetPreview[0].type}
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
          style={{ color: "white", fontSize: filterWidgetPreview[0].iconSize }}
          className={filterWidgetPreview[0].icon}
        ></i>
      </div>
    </div>
  );
}

export default DragElement;
