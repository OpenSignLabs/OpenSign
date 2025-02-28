import React, { useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import {
  handleCopyNextToWidget,
  randomId,
  textWidget
} from "../../constant/Utils";
import { useTranslation } from "react-i18next";

function PlaceholderCopy(props) {
  const { t } = useTranslation();
  const copyType = [
    { id: 1, type: "All pages" },
    { id: 2, type: "All pages but last" },
    { id: 3, type: "All pages but first" },
    { id: 4, type: "Next to current widget" }
  ];
  const [selectCopyType, setSelectCopyType] = useState(1);
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
    if (newPageNumber === 1 && type === 3) {
      if (filterPosition && filterPosition.length > 0) {
        return {
          pageNumber: newPageNumber,
          pos: [...filterPosition]
        };
      }
    }
    //copy all page placeholder at requested position except  last page
    else if (newPageNumber === props.allPages && type === 2) {
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
    if (selectCopyType === 4) {
      const signerPosition = props.xyPostion;
      let currentXYposition;
      const signerId = props.signerObjId ? props.signerObjId : props.Id;
      if (signerId) {
        const filterSignerPosition = signerPosition.filter(
          (item) => item?.Id === signerId
        );
        currentXYposition = filterSignerPosition[0].placeHolder.filter(
          (data) => data.pageNumber === props?.pageNumber
        );
        //get current placeholder position data which user want to copy
        currentXYposition = currentXYposition[0].pos.find(
          (position) => position.key === props.signKey
        );
        //function to create new widget next to just widget
        handleCopyNextToWidget(
          currentXYposition,
          props.widgetType,
          props.xyPostion,
          props.pageNumber,
          props.setXyPostion,
          props?.Id
        );
      } else {
        const getIndex = props?.xyPostion.findIndex(
          (data) => data.pageNumber === props.pageNumber
        );
        const placeholderPosition = props?.xyPostion[getIndex];
        //get current placeholder position data which user want to copy
        currentXYposition = placeholderPosition.pos.find(
          (pos) => pos.key === props.signKey
        );
        //function to create new widget next to just widget
        handleCopyNextToWidget(
          currentXYposition,
          props.widgetType,
          props.xyPostion,
          getIndex,
          props.setXyPostion
        );
      }
    } else {
      copyPlaceholder(selectCopyType);
    }
  };
  const handleUniqueId = () => {
    const signerId = props.signerObjId ? props.signerObjId : props.Id;
    if (signerId && props.widgetType === textWidget) {
      props.setUniqueId(props?.tempSignerId);
      props.setTempSignerId("");
    }
    props.setIsPageCopy(false);
    setSelectCopyType(1);
  };
  return (
    <ModalUi
      isOpen={props.isPageCopy}
      title={t("copy-title")}
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
                  value={data.id}
                  onChange={() => setSelectCopyType(data.id)}
                  checked={selectCopyType === data.id}
                />
                {t(`copy-type.${data.type}`)}
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
          {t("apply")}
        </button>
        <button
          type="button"
          className="op-btn op-btn-ghost"
          onClick={() => handleUniqueId()}
        >
          {t("cancel")}
        </button>
      </div>
    </ModalUi>
  );
}

export default PlaceholderCopy;
