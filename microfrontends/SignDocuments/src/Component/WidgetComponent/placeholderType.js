import React, { useEffect, useState } from "react";
import { onChangeInput } from "../../utils/Utils";
import "../../css/signature.css";

function PlaceholderType(props) {
  const [selectOption, setSelectOption] = useState("");
  const type = props.pos.type;
  const handleInputBlur = () => {
    props.setDraggingEnabled(true);
  };

  useEffect(() => {
    const senderUser = localStorage.getItem(`Extand_Class`);
    const jsonSender = JSON.parse(senderUser);

    if (props.isNeedSign && props.data?.signerObjId === props.signerObjId) {
      onChangeInput(
        jsonSender && jsonSender[0],
        null,
        props.xyPostion,
        null,
        props.setXyPostion,
        props.signerObjId,
        true
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
            props?.handleUserName(props?.data.Id, props?.data.Role)}
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
            props?.handleUserName(props?.data.Id, props?.data.Role)}
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
          checked={props.pos.widgetValue}
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
            props?.handleUserName(props?.data.Id, props?.data.Role)}
        </div>
      );

    case "name":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          tabIndex="0"
          placeholder="name"
          className="inputPlaceholder"
          type="text"
          value={props.pos.widgetValue}
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
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          className="inputPlaceholder"
          type="text"
          placeholder="company"
          value={props.pos.widgetValue && props.pos.widgetValue}
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
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          className="inputPlaceholder"
          type="text"
          placeholder="job title"
          value={props.pos.widgetValue && props.pos.widgetValue}
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
          placeholder="mm/dd/yyyy"
          className="inputPlaceholder"
          style={{ outlineColor: "#007bff" }}
          type="date"
          disabled={props.isPlaceholder ? true : false}
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

    case "image":
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
            props?.handleUserName(props?.data.Id, props?.data.Role)}
        </div>
      );
    case "email":
      return props.isSignYourself ||
        (props.isNeedSign && props.data?.signerObjId === props.signerObjId) ? (
        <input
          className="inputPlaceholder"
          type="text"
          placeholder="email"
          value={props.pos.widgetValue && props.pos.widgetValue}
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
            props?.handleUserName(props?.data.Id, props?.data.Role)}
        </div>
      );
  }
}

export default PlaceholderType;
