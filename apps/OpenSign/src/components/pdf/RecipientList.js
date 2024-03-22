import React, { useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  color,
  darkenColor,
  getFirstLetter,
  isMobile,
  nameColor
} from "../../constant/Utils";

const RecipientList = (props) => {
  const [animationParent] = useAutoAnimate();
  const [isHover, setIsHover] = useState();
  const [isEdit, setIsEdit] = useState(false);
  //function for onhover signer name change background color
  const inputRef = useRef(null);
  const onHoverStyle = (ind, blockColor) => {
    const style = {
      background: blockColor ? blockColor : color[ind % color.length],
      padding: "10px",
      marginTop: "2px",
      display: "flex",
      flexDirection: "row",
      borderBottom: "1px solid #e3e1e1",
      alignItems: "center"
    };
    return style;
  };
  //function for onhover signer name remove background color
  const nonHoverStyle = () => {
    const style = {
      padding: "10px",
      marginTop: "2px",
      display: "flex",
      flexDirection: "row",
      borderBottom: "1px solid #e3e1e1",
      alignItems: "center"
    };
    return style;
  };
  const isWidgetExist = (Id) => {
    return props.signerPos.some((x) => x.Id === Id);
  };

  //handle drag start
  const handleDragStart = (e, id) => {
    // `e.dataTransfer.setData('text/plain')`is used to set the data to be transferred during a drag operation.
    // The first argument specifies the type of data being set, and the second argument is the actual data you want to transfer.
    e.dataTransfer.setData("text/plain", id);
  };

  //handleDragOver prevents the default behavior of the dragover event, which is necessary for the drop event to be triggered.
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  //handle draggable element drop and also used in mobile view on up and down key to chnage sequence of recipient's list
  const handleChangeSequence = (e, ind, isUp, isDown) => {
    e.preventDefault();
    let draggedItemId;
    let index = ind;

    //if isUp true then set item's id and index in mobile view
    if (isUp) {
      draggedItemId = index;
      index = index - 1;
    }
    //if isDown true then set item's id and index in mobile view
    else if (isDown) {
      draggedItemId = index;
      index = index + 1;
    } //else set id on drag element in desktop viiew
    else {
      //`e.dataTransfer.getData('text/plain')` is used to get data that you have saved.
      draggedItemId = e.dataTransfer.getData("text/plain");
    }

    //convert string to number
    const intDragId = parseInt(draggedItemId);
    //get that item to change position
    const draggedItem = props.signersdata.filter((_, ind) => ind === intDragId);
    const remainingItems = props.signersdata.filter(
      (_, ind) => ind !== intDragId
    );
    //splice method is used to replace or add new value in array at specific index
    remainingItems.splice(index, 0, ...draggedItem);

    //set current draggable recipient details,objectId,index,contract_className ... after replace recipient list
    props.setSignersData(remainingItems);
    props.setSignerObjId(remainingItems[index]?.objectId || "");
    props.setIsSelectId(index);
    props.setContractName(remainingItems[index]?.className || "");
    props.setUniqueId(remainingItems[index]?.Id);
    props.setRoleName(remainingItems[index]?.Role);
    props.setBlockColor(remainingItems[index]?.blockColor);
  };

  return (
    <>
      {props.signersdata.length > 0 &&
        props.signersdata.map((obj, ind) => {
          return (
            <div
              ref={animationParent}
              key={ind}
              draggable={props.sendInOrder && !isMobile ? true : false}
              onDragStart={(e) =>
                props.sendInOrder && !isMobile && handleDragStart(e, ind)
              }
              onDragOver={(e) =>
                props.sendInOrder && !isMobile && handleDragOver(e)
              }
              onDrop={(e) =>
                props.sendInOrder && !isMobile && handleChangeSequence(e, ind)
              }
              data-tut="reactourFirst"
              onMouseEnter={() => setIsHover(ind)}
              onMouseLeave={() => setIsHover(null)}
              className={props.sendInOrder && "dragCursor"}
              style={
                (!isMobile && isHover === ind) || props.isSelectListId === ind
                  ? onHoverStyle(ind, obj?.blockColor)
                  : nonHoverStyle(ind)
              }
              onClick={(e) => {
                e.preventDefault();
                props.setSignerObjId(obj?.objectId || "");
                props.setIsSelectId(ind);
                props.setContractName(obj?.className || "");
                props.setUniqueId(obj.Id);
                props.setRoleName(obj.Role);
                props.setBlockColor(obj?.blockColor);
                if (props.handleModal) {
                  props.handleModal();
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%"
                }}
              >
                <div
                  style={{
                    background: obj?.blockColor
                      ? darkenColor(obj?.blockColor, 0.4)
                      : nameColor[ind % nameColor.length],
                    width: 30,
                    height: 30,
                    display: "flex",
                    borderRadius: 30 / 2,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: "12px"
                  }}
                >
                  <span
                    className={props.sendInOrder && "dragCursor"}
                    style={{
                      fontSize: "12px",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "white",
                      textTransform: "uppercase"
                    }}
                  >
                    {isWidgetExist(obj.Id) ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      <>
                        {obj.Name
                          ? getFirstLetter(obj.Name)
                          : getFirstLetter(obj.Role)}
                      </>
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: obj.Name ? "column" : "row",
                    alignItems: "center"
                  }}
                >
                  {obj.Name ? (
                    <span className={"userName"}>{obj.Name}</span>
                  ) : (
                    <>
                      <span
                        className="userName"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setIsEdit({ [obj.Id]: true });
                          props.setRoleName(obj.Role);
                        }}
                      >
                        {isEdit?.[obj.Id] && props.handleRoleChange ? (
                          <input
                            ref={inputRef}
                            style={{
                              backgroundColor: "transparent",
                              width: "inherit",
                              padding: "3px"
                            }}
                            value={obj.Role}
                            onChange={(e) => props.handleRoleChange(e, obj.Id)}
                            onBlur={() => {
                              setIsEdit({});
                              props.handleOnBlur(obj.Role, obj.Id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                inputRef.current.blur();
                              }
                            }}
                          />
                        ) : (
                          <span style={{ padding: "3px" }}>{obj.Role}</span>
                        )}
                      </span>
                    </>
                  )}
                  {obj.Name && <span className={"useEmail"}>{obj.Role}</span>}
                </div>
              </div>
              {isMobile && props.sendInOrder && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5
                  }}
                >
                  <div
                    onClick={(e) => {
                      if (ind !== 0) {
                        e.stopPropagation();
                        handleChangeSequence(e, ind, "up");
                      }
                    }}
                    style={{ color: ind === 0 ? "gray" : "black" }}
                  >
                    ▲
                  </div>
                  <div
                    onClick={(e) => {
                      if (ind !== props.signersdata.length - 1) {
                        e.stopPropagation();
                        handleChangeSequence(e, ind, null, "down");
                      }
                    }}
                    style={{
                      color:
                        ind === props.signersdata.length - 1 ? "gray" : "black"
                    }}
                  >
                    ▼
                  </div>
                </div>
              )}
              {props.handleDeleteUser && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    props.handleDeleteUser(obj.Id);
                  }}
                  style={{ cursor: "pointer", marginLeft: "5px" }}
                >
                  <i className="fa-regular fa-trash-can"></i>
                </div>
              )}
              <hr />
            </div>
          );
        })}
    </>
  );
};

export default RecipientList;
