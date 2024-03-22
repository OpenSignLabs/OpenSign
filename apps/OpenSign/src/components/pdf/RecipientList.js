import React, { useRef, useState } from "react";
import {
  color,
  darkenColor,
  getFirstLetter,
  isMobile,
  nameColor
} from "../../constant/Utils";
import dragIcon from "../../assets/images/dragIcon.png";

const RecipientList = (props) => {
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
    // `e.dataTransfer.getData('text/plain')`is used to set the data to be transferred during a drag operation.
    // The first argument specifies the type of data being set, and the second argument is the actual data you want to transfer.
    e.dataTransfer.setData("text/plain", id);
  };

  //handleDragOver prevents the default behavior of the dragover event, which is necessary for the drop event to be triggered.
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  //handle draggable element drop
  const handleDrop = (e, index) => {
    e.preventDefault();
    //`e.dataTransfer.getData('text/plain')` is used to get data thet you have save.
    const draggedItemId = e.dataTransfer.getData("text/plain");
    //convert string to number
    const intDragId = parseInt(draggedItemId);
    const draggedItem = props.signersdata.filter(
      (item) => item.Id === intDragId
    );
    const remainingItems = props.signersdata.filter(
      (item) => item.Id !== intDragId
    );
    //splice method is used to replace or add new value in array at specific index
    remainingItems.splice(index, 0, ...draggedItem);
    props.setSignersData(remainingItems);

    //set current draggable recipient details after replace recipient list
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
              key={ind}
              draggable={props.sendInOrder ? true : false}
              onDragStart={(e) =>
                props.sendInOrder && handleDragStart(e, obj.Id)
              }
              onDragOver={(e) => props.sendInOrder && handleDragOver(e)}
              onDrop={(e) => props.sendInOrder && handleDrop(e, ind, obj.Id)}
              data-tut="reactourFirst"
              onMouseEnter={() => setIsHover(ind)}
              onMouseLeave={() => setIsHover(null)}
              className={props.sendInOrder && "dragCursor"}
              style={
                isHover === ind || props.isSelectListId === ind
                  ? onHoverStyle(ind, obj?.blockColor)
                  : nonHoverStyle(ind)
              }
              onClick={() => {
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
              onTouchEnd={(e) => {
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
                          obj.Role
                        )}
                      </span>
                    </>
                  )}
                  {obj.Name && <span className={"useEmail"}>{obj.Role}</span>}
                </div>
              </div>
              {isMobile && props.sendInOrder && (
                <img
                  alt="loader img"
                  src={dragIcon}
                  className="widgets"
                  style={{ width: 20, height: 20 }}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                  onTouchStart={(e) => e.preventDefault()}
                />
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
