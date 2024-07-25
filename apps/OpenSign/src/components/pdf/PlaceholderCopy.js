import React, { useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import { randomId, textWidget } from "../../constant/Utils";

function PlaceholderCopy(props) {
  const copyType = ["All pages", "All pages but last", "All pages but first"];
  const [selectCopyType, setSelectCopyType] = useState("");
  //function for get copy placeholder position
  const getCopyPlaceholderPosition = (
    type,
    currentPlaceholder,
    newPageNumber,
    existPlaceholderPosition
  ) => {
    const filterPosition =
      existPlaceholderPosition &&
      existPlaceholderPosition.filter(
        (data) => data.xPosition !== currentPlaceholder.xPosition
      );
    //copy all page placeholder at requested position except first page
    if (newPageNumber === 1 && type === "first") {
      if (filterPosition && filterPosition.length > 0) {
        return {
          pageNumber: newPageNumber,
          pos: [...filterPosition]
        };
      }
    }
    //copy all page placeholder at requested position except  last page
    else if (newPageNumber === props.allPages && type === "last") {
      if (existPlaceholderPosition) {
        return {
          pageNumber: newPageNumber,
          pos: [...filterPosition]
        };
      }
    }
    //copy all page placeholder at requested position with existing placeholder position
    else if (existPlaceholderPosition) {
      return {
        pageNumber: newPageNumber,
        pos: [...filterPosition, currentPlaceholder]
      };
    }
    //copy all page placeholder at requested position
    else {
      return {
        pageNumber: newPageNumber,
        pos: [currentPlaceholder]
      };
    }
  };

  //function for copy placeholder as per select copy type
  const copyPlaceholder = (type) => {
    let newPlaceholderPosition = [];
    let newPageNumber = 1;
    const signerPosition = props.xyPostion;
    const signerId = props.signerObjId ? props.signerObjId : props.Id;

    //handle placeholder array and copy for multiple signers placeholder at requested location
    if (signerId) {
      //get current signers data
      let filterSignerPosition;
      if (props?.signerObjId) {
        filterSignerPosition = signerPosition.filter(
          (data) => data.signerObjId === signerId
        );
      } else {
        filterSignerPosition = signerPosition.filter(
          (item) => item.Id === signerId
        );
      }
      //get current pagenumber's all placeholder position data
      const placeholderPosition = filterSignerPosition[0].placeHolder.filter(
        (data) => data.pageNumber === props.pageNumber
      );
      //get current placeholder position data which user want to copy
      const currentPlaceholder = placeholderPosition[0].pos.find(
        (position) => position.key === props.signKey
      );

      for (let i = 0; i < props.allPages; i++) {
        const newId = randomId();
        currentPlaceholder.key = newId;
        //get exist placeholder position for particular page
        const existPlaceholder = filterSignerPosition[0].placeHolder.filter(
          (data) => data.pageNumber === newPageNumber
        );
        const existPlaceholderPosition =
          existPlaceholder[0] && existPlaceholder[0].pos;

        //function for get copy to requested location of placeholder position
        const getPlaceholderObj = getCopyPlaceholderPosition(
          type,
          currentPlaceholder,
          newPageNumber,
          existPlaceholderPosition
        );
        if (getPlaceholderObj) {
          newPlaceholderPosition.push(getPlaceholderObj);
        }
        newPageNumber++;
      }
      let updatedSignerPlaceholder;
      if (props?.signerObjId) {
        updatedSignerPlaceholder = signerPosition.map((signersData) => {
          if (signersData.signerObjId === props.signerObjId) {
            return {
              ...signersData,
              placeHolder: newPlaceholderPosition
            };
          }
          return signersData;
        });
      } else {
        updatedSignerPlaceholder = signerPosition.map((signersData) => {
          if (signersData.Id === props.Id) {
            return {
              ...signersData,
              placeHolder: newPlaceholderPosition
            };
          }
          return signersData;
        });
      }

      const signersData = signerPosition;
      signersData.splice(0, signerPosition.length, ...updatedSignerPlaceholder);
      props.setXyPostion(signersData);
    }
    //handle signyourself array and copy for single signers placeholder at requested location
    else {
      const xyPostion = props.xyPostion;

      const placeholderPosition = xyPostion.filter(
        (data) => data.pageNumber === props.pageNumber
      );
      //get current placeholder position data which user want to copy
      const currentPlaceholder = placeholderPosition[0].pos.find(
        (pos) => pos.key === props.signKey
      );

      for (let i = 0; i < props.allPages; i++) {
        //get exist placeholder position for particular page
        const existPlaceholder = xyPostion.filter(
          (data) => data.pageNumber === newPageNumber
        );
        const existPlaceholderPosition =
          existPlaceholder[0] && existPlaceholder[0].pos;

        const newId = randomId();
        currentPlaceholder.key = newId;
        //function for get copy to requested location of placeholder position
        const getPlaceholderObj = getCopyPlaceholderPosition(
          type,
          currentPlaceholder,
          newPageNumber,
          existPlaceholderPosition
        );
        if (getPlaceholderObj) {
          newPlaceholderPosition.push(getPlaceholderObj);
        }

        newPageNumber++;
      }
      props.setXyPostion(newPlaceholderPosition);
    }
  };

  //function for getting selected type placeholder copy
  const handleApplyCopy = () => {
    if (selectCopyType === "All pages") {
      copyPlaceholder("all");
    } else if (selectCopyType === "All pages but last") {
      copyPlaceholder("last");
    } else if (selectCopyType === "All pages but first") {
      copyPlaceholder("first");
    }
  };
  const handleUniqueId = () => {
    if (props.widgetType === textWidget) {
      props.setUniqueId(props?.tempSignerId);
      props.setTempSignerId("");
    }
    props.setIsPageCopy(false);
  };
  return (
    <ModalUi
      isOpen={props.isPageCopy}
      title={"Copy to all pages"}
      handleClose={() => handleUniqueId()}
    >
      <div className="h-full p-[20px] text-base-content">
        {copyType.map((data, key) => {
          return (
            <div key={key} className="flex flex-col">
              <label className="text-[16px] font-medium">
                <input
                  className="mr-[8px] op-radio op-radio-xs"
                  type="radio"
                  value={data}
                  onChange={() => setSelectCopyType(data)}
                  checked={selectCopyType === data}
                />

                {data}
              </label>
            </div>
          );
        })}

        <div className="flex bg-[#9f9f9f] w-full my-[15px]"></div>
        <button
          onClick={() => {
            handleApplyCopy();
            handleUniqueId();
          }}
          type="button"
          disabled={!selectCopyType}
          className="op-btn op-btn-primary"
        >
          Apply
        </button>
        <button
          type="button"
          className="op-btn op-btn-ghost"
          onClick={() => handleUniqueId()}
        >
          Cancel
        </button>
      </div>
    </ModalUi>
  );
}

export default PlaceholderCopy;
