import { useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  color,
  darkenColor,
  getFirstLetter,
  isMobile,
  nameColor
} from "../../constant/Utils";
const cursor =
  "cursor-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAASElEQVR4nGNgwAMkJSUbpKSkOvCpIaT5PxSTbogUQjMYMwxeIIXmVFIxA8UGDDyQGg0DnIDi6JKUlCxHMqCeZAOghjSAMD5FAKfeaURdUFxCAAAAAElFTkSuQmCC'),_pointer]";
const RecipientList = (props) => {
  const [animationParent] = useAutoAnimate();
  const [isHover, setIsHover] = useState();
  const [isPrefill, setIsPrefill] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  //function for onhover signer name change background color
  const inputRef = useRef(null);
  const isWidgetExist = (Id) => {
    return props.signerPos.some((x) => x.Id === Id && x.placeHolder);
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

  //handle draggable element drop and also used in mobile view on up and down key to change sequence of recipient's list
  const handleChangeSequence = (e, ind, isUp, isDown, obj) => {
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
    props?.setSignersData(remainingItems);
    props?.setIsSelectId(index);
    props?.setUniqueId(remainingItems[index]?.Id);
    props?.setRoleName(remainingItems[index]?.Role);
    props?.setBlockColor(obj.blockColor);
    //change order of placeholder's list using sorting method
    //`remainingItems` is correct order of signers after change order
    const changeOrderSignerList = props?.signerPos.sort((a, b) => {
      //`indexA` and `indexB` is to get element position using index in correct order array
      const indexA = remainingItems.findIndex((item) => item.Id === a.Id);
      const indexB = remainingItems.findIndex((item) => item.Id === b.Id);
      //and then compare `indexA - indexB` value
      //if positive it means indexB element comes before indexA then need to sorting
      //if negative it means indexA element is on correct position do not need to sorting
      return indexA - indexB;
    });
    props?.setSignerPos(changeOrderSignerList);
  };
  const handleSelectRecipient = (e, index, obj, prefill) => {
    e.preventDefault();
    props?.setIsSelectId(index);
    props?.setUniqueId(obj.Id);
    props?.setRoleName(obj.Role);
    props?.setBlockColor(obj?.blockColor);
    props?.handleModal && props?.handleModal();
    setIsPrefill(prefill ?? false);
    props.setIsTour && props?.setIsTour(false);
  };
  const isSelected = (ind) => {
    const isUserSelected =
      (!isMobile && isHover === ind) ||
      (!isPrefill && props.isSelectListId === ind);
    return isUserSelected;
  };
  return (
    <>
      {props?.prefillSigner?.length > 0 &&
        props?.prefillSigner?.map((obj, ind) => (
          <div
            key={ind}
            data-tut="prefillTour"
            className={`${
              props.uniqueId === obj.Id
                ? "op-bg-primary text-white"
                : "transparent text-base-content"
            } cursor-pointer px-2 py-1 m-1 mb-2 border-[1px] gap-1 rounded-xl flex justify-center items-center op-border-primary text-[12px] font-bold whitespace-nowrap text-ellipsis`}
            onClick={(e) => handleSelectRecipient(e, ind, obj, true)}
          >
            <i
              className={`${props.uniqueId === obj.Id ? "bg-white op-text-primary" : "op-bg-primary text-white"} w-[20px] h-[20px] flex justify-center items-center text-[10px] fa-light fa-signature rounded-full`}
            ></i>
            <span>{obj.Name}</span>
          </div>
        ))}
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
                props.sendInOrder &&
                !isMobile &&
                handleChangeSequence(e, ind, null, null, obj)
              }
              data-tut="recipientArea"
              onMouseEnter={() => setIsHover(ind)}
              onMouseLeave={() => setIsHover(null)}
              className={`${
                props.sendInOrder
                  ? props.isMailSend
                    ? "pointer-events-none bg-opacity-80"
                    : `text-[12px] font-bold ${cursor}`
                  : props.isMailSend && "pointer-events-none bg-opacity-80"
              } flex flex-row rounded-xl px-2 py-[10px] mt-1 mx-1 items-center last:mb-0.5`}
              style={{
                background:
                  (!isMobile && isHover === ind) || props.uniqueId === obj.Id
                    ? obj?.blockColor
                      ? obj?.blockColor
                      : color[ind % color.length]
                    : "transparent"
              }}
              onClick={(e) => handleSelectRecipient(e, ind, obj)}
            >
              <div className="flex flex-row items-center w-full overflow-hidden pr-2">
                <div
                  className="flex flex-shrink-0 w-[30px] h-[30px] rounded-full items-center justify-center mr-2"
                  style={{
                    background: obj?.blockColor
                      ? darkenColor(obj?.blockColor, 0.4)
                      : nameColor[ind % nameColor.length]
                  }}
                >
                  <span className="text-white uppercase font-bold text-center text-[12px]">
                    {isWidgetExist(obj.Id) ? (
                      <i className="fa-light fa-check"></i>
                    ) : (
                      <>{getFirstLetter(obj?.Name ?? obj?.Role)}</>
                    )}
                  </span>
                </div>
                <div
                  className={`${obj.Name ? "flex-col" : "flex-row"} ${
                    isSelected(ind) ? "text-[#424242]" : "text-base-content"
                  } flex overflow-hidden flex-grow-0`}
                >
                  {obj.Name ? (
                    <span className="text-[12px] font-bold truncate whitespace-nowrap">
                      {obj.Name}
                    </span>
                  ) : (
                    <span
                      className="text-[12px] font-bold truncate whitespace-nowrap cursor-pointer"
                      onClick={() => {
                        setIsEdit({ [obj.Id]: true });
                        props.setRoleName(obj.Role);
                      }}
                    >
                      {isEdit?.[obj.Id] && props.handleRoleChange ? (
                        <input
                          ref={inputRef}
                          className="bg-transparent p-[3px] w-full"
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
                        <span className="text-[13px] 2xl:text-[17px]">
                          {obj.Role}
                        </span>
                      )}
                    </span>
                  )}
                  {obj.Name && (
                    <span className="text-[10px] font-medium truncate whitespace-nowrap">
                      {obj?.Role || obj?.Email}
                    </span>
                  )}
                </div>
              </div>
              {isMobile && props.sendInOrder && (
                <div className="flex flex-row items-center gap-[5px] mr-2">
                  <div
                    onClick={(e) => {
                      if (ind !== 0) {
                        e.stopPropagation();
                        handleChangeSequence(e, ind, "up", null, obj);
                      }
                    }}
                    className={ind === 0 ? "text-[gray]" : "text-black"}
                  >
                    ▲
                  </div>
                  <div
                    onClick={(e) => {
                      if (ind !== props.signersdata.length - 1) {
                        e.stopPropagation();
                        handleChangeSequence(e, ind, null, "down", obj);
                      }
                    }}
                    className={
                      ind === props.signersdata.length - 1
                        ? "text-[gray]"
                        : "text-black"
                    }
                  >
                    ▼
                  </div>
                </div>
              )}
              {props.handleDeleteUser && obj?.Role !== "prefill" && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    props.handleDeleteUser(obj.Id);
                  }}
                  className={`${isSelected(ind) ? "text-[#424242]" : "text-base-content"} cursor-pointer`}
                >
                  <i className="fa-light fa-trash-can 2xl:text-[22px]"></i>
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
