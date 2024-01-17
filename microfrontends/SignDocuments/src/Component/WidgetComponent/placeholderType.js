import React, { useEffect, useState } from "react";
import { onChangeInput } from "../../utils/Utils";

function PlaceholderType(props) {
  const [selectOption, setSelectOption] = useState("");
  const type = props.pos.type;
  const handleInputBlur = () => {
    props.setDraggingEnabled(true);
  };
  useEffect(() => {
    if (props.isNeedSign && props.data?.signerObjId === props.signerObjId) {
      onChangeInput(
        props.pdfDetails,
        null,
        props.xyPostion,
        null,
        props.setXyPostion,
        props.signerObjId,
        props.initial
      );
    }
  }, [type]);

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
          disabled={
            props.isNeedSign && props.data?.signerObjId !== props.signerObjId
              ? true
              : props.isPlaceholder
          }
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
          disabled={
            props.isNeedSign && props.data?.signerObjId !== props.signerObjId
              ? true
              : props.isPlaceholder
          }
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
      return props.data?.signerObjId === props.signerObjId ? (
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
      return props.pos.SignUrl ||
        props.data?.signerObjId === props.signerObjId ? (
        <img
          alt="signimg"
          src={props.pos?.SignUrl ? props.pos?.SignUrl : props.initial}
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

    case "name":
      return props.isNeedSign &&
        props.data?.signerObjId === props.signerObjId ? (
        <input
          className="inputPlaceholder"
          type="text"
          value={
            props.pos.widgetValue
              ? props.pos.widgetValue
              : props.pdfDetails.ExtUserPtr.Name
          }
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
      ) : props.pos.widgetValue ? (
        <div
          style={{
            color: "black",
            fontSize: "14px"
          }}
        >
          <span>{props.pos.widgetValue}</span>
        </div>
      ) : (
        <div
          style={{
            color: "black",
            fontSize: "14px"
          }}
        >
          <span>{props.pos.type}</span>
        </div>
      );

    case "company":
      return props.isNeedSign &&
        props.data?.signerObjId === props.signerObjId ? (
        <input
          className="inputPlaceholder"
          type="text"
          value={
            props.pos.widgetValue
              ? props.pos.widgetValue
              : props.pdfDetails.ExtUserPtr.Company
          }
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
      ) : props.pos.widgetValue ? (
        <div
          style={{
            color: "black",
            fontSize: "14px"
          }}
        >
          <span>{props.pos.widgetValue}</span>
        </div>
      ) : (
        <div
          style={{
            color: "black",
            fontSize: "14px"
          }}
        >
          <span>{props.pos.type}</span>
        </div>
      );

    case "job title":
      return props.isNeedSign &&
        props.data?.signerObjId === props.signerObjId ? (
        <input
          className="inputPlaceholder"
          type="text"
          value={
            props.pos.widgetValue
              ? props.pos.widgetValue
              : props.pdfDetails.ExtUserPtr.JobTitle
          }
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
      ) : props.pos.widgetValue ? (
        <div
          style={{
            color: "black",
            fontSize: "14px"
          }}
        >
          <span>{props.pos.widgetValue}</span>
        </div>
      ) : (
        <div
          style={{
            color: "black",
            fontSize: "14px"
          }}
        >
          <span>{props.pos.type}</span>
        </div>
      );
    case "date":
      return (
        <input
          className="inputPlaceholder"
          style={{ outlineColor: "#007bff" }}
          type="date"
          disabled={
            props.isNeedSign ? false : props.isPlaceholder ? true : false
          }
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
