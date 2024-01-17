import React, { useState } from "react";
import BorderResize from "../component/borderResize";
import PlaceholderBorder from "./placeholderBorder";
import { Rnd } from "react-rnd";
import { defaultWidthHeight } from "../../utils/Utils";
import PlaceholderType from "./placeholderType";

function Placeholder(props) {
  const [isDraggingEnabled, setDraggingEnabled] = useState(true);

  //onclick placeholder function to open signature pad
  const handlePlaceholderClick = () => {
    if (props.pos.type === "text" || props.pos.type === "checkbox") {
      setDraggingEnabled(false);
    }
    if ((props.isNeedSign || props.isSignYourself) && !props.isDragging) {
      if (props.pos.type) {
        if (props.pos.type === "signature" || props.pos.type === "stamp") {
          props.setIsSignPad(true);
          props.setSignKey(props.pos.key);
          props.setIsStamp(props.pos.isStamp);
        }
      } else {
        props.setIsSignPad(true);
        props.setSignKey(props.pos.key);
        props.setIsStamp(props.pos?.isStamp ? props.pos.isStamp : false);
      }
    } else if (
      props.isPlaceholder &&
      props.pos.type === "dropdown" &&
      !props.isDragging
    ) {
      props?.setShowDropdown(true);
      props?.setSignKey(props.pos.key);
      props.setUniqueId(props.data.Id);
    } else if (!props.pos.type) {
      if (
        !props.pos.type &&
        props.isNeedSign &&
        props.data.signerObjId === props.signerObjId
      ) {
        props.setIsSignPad(true);
        props.setSignKey(props.pos.key);
        props.setIsStamp(props.pos.isStamp);
      } else if (
        (props.isNeedSign && props.pos.type === "signature") ||
        props.pos.type === "stamp"
      ) {
        props.setIsSignPad(true);
        props.setSignKey(props.pos.key);
        props.setIsStamp(props.pos.isStamp);
      } else if (props.isNeedSign && props.pos.type === "dropdown") {
        props.setSignKey(props.pos.key);
      }
    }
  };

  return (
    <Rnd
      //   ref={nodeRef}
      key={props.pos.key}
      lockAspectRatio={
        props.pos.Width
          ? props.pos.Width / props.pos.Height
          : defaultWidthHeight(props.pos.type).width /
            defaultWidthHeight(props.pos.type).height
      }
      enableResizing={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: false,
        bottomRight:
          props.data && props.isNeedSign
            ? props.data?.signerObjId === props.signerObjId
              ? true
              : false
            : true,
        bottomLeft: false,
        topLeft: false
      }}
      bounds="parent"
      className="signYourselfBlock"
      style={{
        border: "1px solid #007bff",
        borderRadius: "2px",
        textAlign:
          props.pos.type !== "name" &&
          props.pos.type !== "company" &&
          props.pos.type !== "job title" &&
          "center",
        cursor:
          props.data && props.isNeedSign
            ? props.data?.signerObjId === props.signerObjId
              ? "pointer"
              : "not-allowed"
            : "all-scroll",
        zIndex: "1",
        background: props.data ? props.data.blockColor : "rgb(203 233 237)"
      }}
      onDrag={() => {
        setDraggingEnabled(true);
        props.handleTabDrag && props.handleTabDrag(props.pos.key);
      }}
      size={{
        width: props.posWidth(props.pos, props.isSignYourself),
        height: props.posHeight(props.pos, props.isSignYourself)
      }}
      onResizeStart={() => {
        setDraggingEnabled(true);
        props.setIsResize && props.setIsResize(true);
      }}
      onResizeStop={() => {
        props.setIsResize && props.setIsResize(false);
      }}
      disableDragging={props.isNeedSign ? true : !isDraggingEnabled}
      onDragStop={(event, dragElement) =>
        props.handleStop &&
        props.handleStop(event, dragElement, props.signerObjId, props.pos.key)
      }
      default={{
        x: props.xPos(props.pos, props.isSignYourself),
        y: props.yPos(props.pos, props.isSignYourself)
      }}
      onResize={(e, direction, ref, delta, position) => {
        props.handleSignYourselfImageResize &&
          props.handleSignYourselfImageResize(
            ref,
            props.pos.key,
            props.xyPostion,
            props.setXyPostion,
            props.index,
            props.data && props.data.Id,
            false
          );
      }}
      onClick={() => {
        props.isNeedSign && props.data?.signerObjId === props.signerObjId
          ? handlePlaceholderClick()
          : props.isPlaceholder
            ? handlePlaceholderClick()
            : props.isSignYourself && handlePlaceholderClick();
      }}
    >
      {props.isShowBorder ? (
        <BorderResize right={-12} top={-11} />
      ) : props.data && props.isNeedSign ? (
        props.data?.signerObjId === props.signerObjId ? (
          <BorderResize />
        ) : (
          <></>
        )
      ) : (
        <BorderResize />
      )}

      {props.isShowBorder && <PlaceholderBorder pos={props.pos} />}
      <div
        style={{
          left: props.xPos(props.pos, props.isSignYourself),
          top: props.yPos(props.pos, props.isSignYourself),
          width: props.posWidth(props.pos, props.isSignYourself),
          height: props.posHeight(props.pos, props.isSignYourself),
          zIndex: "10"
        }}
        onTouchEnd={(e) => handlePlaceholderClick()}
      >
        {props.isShowBorder && (
          <>
            {props.isPlaceholder && (
              <i
                data-tut="reactourLinkUser"
                className="fa-regular fa-user signUserIcon"
                onClick={(e) => {
                  e.stopPropagation();
                  props.handleLinkUser(props.data.Id);
                  props.setUniqueId(props.data.Id);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  props.handleLinkUser(props.data.Id);
                  props.setUniqueId(props.data.Id);
                }}
                style={{
                  color: "#188ae2"
                }}
              ></i>
            )}

            <i
              className="fa-regular fa-copy signCopy"
              onClick={(e) => {
                if (props.data) {
                  props.setSignerObjId(props.data.signerObjId);
                }
                e.stopPropagation();
                props.setIsPageCopy(true);
                props.setSignKey(props.pos.key);
              }}
              onTouchEnd={(e) => {
                if (props.data) {
                  props.setSignerObjId(props.data.signerObjId);
                }
                e.stopPropagation();
                props.setIsPageCopy(true);
                props.setSignKey(props.pos.key);
              }}
              style={{
                color: "#188ae2"
              }}
            ></i>
            <i
              className="fa-regular fa-circle-xmark signCloseBtn"
              onClick={(e) => {
                e.stopPropagation();

                if (props.data) {
                  props.handleDeleteSign(props.pos.key, props.data.Id);
                } else {
                  props.handleDeleteSign(props.pos.key);
                  props.setIsStamp(false);
                }
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                if (props.data) {
                  props.handleDeleteSign(props.pos.key, props.data.Id);
                } else {
                  props.handleDeleteSign(props.pos.key);
                  props.setIsStamp(false);
                }
              }}
              style={{
                color: "#188ae2"
              }}
            ></i>
          </>
        )}

        <PlaceholderType
          pos={props.pos}
          xyPostion={props.xyPostion}
          index={props.index}
          setXyPostion={props.setXyPostion}
          data={props.data}
          setSignKey={props.setSignKey}
          isShowDropdown={props?.isShowDropdown}
          isPlaceholder={props.isPlaceholder}
          signerObjId={props.signerObjId}
          handleUserName={props.handleUserName}
          setDraggingEnabled={setDraggingEnabled}
          pdfDetails={props?.pdfDetails && props?.pdfDetails[0]}
          isNeedSign={props.isNeedSign}
          initial={props.initial}
        />
      </div>
    </Rnd>
  );
}

export default Placeholder;
