import React, { useState } from "react";
import { onChangeInput } from "../../utils/Utils";

function PlaceholderType(props) {
  const [selectOption, setSelectOption] = useState("");

  switch (props.pos.type) {
    case "signature":
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
          <div>{props.pos.type}</div>

          {props?.handleUserName &&
            props?.handleUserName(props?.data.signerObjId, props?.data.Role)}
        </div>
      );

    case "stamp":
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
          type="checkbox"
          disabled={props.isPlaceholder}
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
          disabled={props.isPlaceholder}
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
