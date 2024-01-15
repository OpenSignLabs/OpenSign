import React, { useState } from "react";
import { onChangeInput } from "../../utils/Utils";

function PlaceholderType(props) {
  const [selectOption, setSelectOption] = useState("");

  const handleInputBlur = () => {
    props.setDraggingEnabled(true);
  };
  switch (props.pos.type) {
    case "signature":
      return props.pos.SignUrl ? (
        <img
          alt="signimg"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "10px",
            color: "black",
            justifyContent: "center"
          }}
        >
          <div>{props.pos.type}</div>

          {props?.handleUserName &&
            props?.handleUserName(props?.data.signerObjId, props?.data.Role)}
        </div>
      );

    case "stamp":
      return props.pos.SignUrl ? (
        <img
          alt="signimg"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      ) : (
        <div
          style={{
            fontSize: "12px",
            color: "black",
            justifyContent: "center"
          }}
        >
          <div>{props.pos.type}</div>

          {props?.handleUserName &&
            props?.handleUserName(props?.data?.signerObjId, props?.data?.Role)}
        </div>
      );

    case "checkbox":
      return (
        <input
          className="inputPlaceholder"
          style={{ outlineColor: "#007bff" }}
          type="checkbox"
          disabled={props.isPlaceholder}
          onBlur={handleInputBlur}
          onChange={(e) =>
            onChangeInput(
              e.target.checked,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            )
          }
        />
      );
    case "text":
      return (
        <input
          className="inputPlaceholder"
          type="text"
          tabIndex="0"
          disabled={props.isPlaceholder}
          onBlur={handleInputBlur}
          onChange={(e) =>
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            )
          }
        />
      );
    case "dropdown":
      return !props.isPlaceholder ? (
        <select
          className="inputPlaceholder"
          id="myDropdown"
          value={selectOption}
          onChange={(e) => {
            setSelectOption(e.target.value);
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            );
          }}
        >
          {/* Default/Title option */}
          <option value="" disabled hidden>
            {props.pos.widgetName}
          </option>

          {props.pos.widgetOption.map((data, ind) => {
            return <option value={data}>{data}</option>;
          })}
        </select>
      ) : (
        <div className="inputPlaceholder">
          {props.pos.widgetName ? props.pos.widgetName : props.pos.type}
        </div>
      );
    case "initials":
      return (
        <img
          alt="signimg"
          src={props.pos.SignUrl}
          style={{
            width: "99%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      );
    case "name":
      return (
        <div
          style={{
            color: "black",
            fontSize: "14px"
          }}
        >
          <span>{props.pos.widgetValue}</span>
        </div>
      );
    case "company":
      return (
        <div
          style={{
            fontSize: "14px",
            color: "black"
          }}
        >
          <div>{props.pos.widgetValue}</div>
        </div>
      );
    case "job title":
      return (
        <div
          style={{
            fontSize: "14px",
            color: "black"
          }}
        >
          <div>{props.pos.widgetValue}</div>
        </div>
      );
    case "date":
      return (
        <input
          className="inputPlaceholder"
          style={{ outlineColor: "#007bff" }}
          type="date"
          disabled={props.isPlaceholder}
          onBlur={handleInputBlur}
          onChange={(e) =>
            onChangeInput(
              e.target.value,
              props.pos.key,
              props.xyPostion,
              props.index,
              props.setXyPostion,
              props.data && props.data.signerObjId,
              false
            )
          }
        />
      );
    default:
      return props.pos.SignUrl ? (
        <div style={{ pointerEvents: "none" }}>
          <img
            alt="signimg"
            src={props.pos.SignUrl}
            style={{
              width: "99%",
              height: "100%",
              objectFit: "contain"
            }}
          />
        </div>
      ) : (
        <div
          style={{
            fontSize: "10px",
            color: "black",
            justifyContent: "center"
          }}
        >
          {props.pos.isStamp ? <div>stamp</div> : <div>signature</div>}
          {props?.handleUserName &&
            props?.handleUserName(props?.data?.signerObjId, props?.data?.Role)}
        </div>
      );
  }
}

export default PlaceholderType;
