import { useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import { handleCopyNextToWidget, randomId } from "../../constant/Utils";
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
    newPlaceholder,
    newPageNumber,
    existPlaceholderPosition
  ) => {
    //remove existing page position when used option copy but first or copy but last
    const filterPosition =
      existPlaceholderPosition &&
      existPlaceholderPosition.filter(
        (data) => data.xPosition !== newPlaceholder.xPosition
      );
    //first option - copy all page but not first
    //copy all page placeholder at requested position except first page
    if (newPageNumber === 1 && type === 3) {
      //when user choose this option and placed widget on first page then do not remove first page widget
      //it should be copy all page included first page on same postion
      if (props.pageNumber === 1) {
        return {
          pageNumber: newPageNumber,
          pos: [...existPlaceholderPosition]
        };
      } //else when user copy widget and choose this option and not at first page then copy all page but not at first
      else if (filterPosition && filterPosition.length > 0) {
        return {
          pageNumber: newPageNumber,
          pos: [...filterPosition]
        };
      }
    }
    //second option - copy all page but not last
    //copy all page placeholder at requested position except  last page
    else if (newPageNumber === props.allPages && type === 2) {
      if (existPlaceholderPosition) {
        //when user choose this option and placed widget on last page then do not remove last page widget
        //it should be copy all page included last page on same postion
        if (props.pageNumber === props.allPages) {
          return {
            pageNumber: newPageNumber,
            pos: [...existPlaceholderPosition]
          };
        } else {
          return {
            pageNumber: newPageNumber,
            pos: [...filterPosition]
          };
        }
      }
    }
    //this optin - copy all page with exiting widgets on same page
    //copy all page placeholder at requested position with existing placeholder position
    else if (existPlaceholderPosition) {
      if (newPageNumber === props.pageNumber) {
        return {
          pageNumber: props.pageNumber,
          pos: [...existPlaceholderPosition]
        };
      } else {
        return {
          pageNumber: newPageNumber,
          pos: [...existPlaceholderPosition, newPlaceholder]
        };
      }
    }
    //copy all page placeholder at requested position
    else {
      if (newPageNumber === props.pageNumber) {
        return {
          pageNumber: props.pageNumber,
          pos: [...existPlaceholderPosition]
        };
      } else {
        return {
          pageNumber: newPageNumber,
          pos: [newPlaceholder]
        };
      }
    }
  };
  //function for copy placeholder as per select copy type
  const copyPlaceholder = (type) => {
    let newPlaceholderPosition = [];
    let newPageNumber = 1;
    const signerPosition = props.xyPosition;
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
        const nameId = randomId(2)
        const widgetName = `${currentPlaceholder?.options?.name}${nameId}`;
        const newPlaceholder = {
          ...currentPlaceholder,
          key: newId,
          options: { ...currentPlaceholder?.options, name: widgetName }
        };
        //get exist placeholder position for particular page
        const existPlaceholder = filterSignerPosition[0].placeHolder.filter(
          (data) => data.pageNumber === newPageNumber
        );
        const existPlaceholderPosition =
          existPlaceholder[0] && existPlaceholder[0].pos;

        //function for get copy to requested location of placeholder position
        const getPlaceholderObj = getCopyPlaceholderPosition(
          type,
          newPlaceholder,
          newPageNumber,
          existPlaceholderPosition
        );
        if (getPlaceholderObj?.pos) {
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
      props.setXyPosition(signersData);
    }
    //handle signyourself array and copy for single signers placeholder at requested location
    else {
      const xyPosition = props.xyPosition;

      const placeholderPosition = xyPosition.filter(
        (data) => data.pageNumber === props.pageNumber
      );
      //get current placeholder position data which user want to copy
      const currentPlaceholder = placeholderPosition[0].pos.find(
        (pos) => pos.key === props.signKey
      );

      for (let i = 0; i < props.allPages; i++) {
        //get exist placeholder position for particular page
        const existPlaceholder = xyPosition.filter(
          (data) => data.pageNumber === newPageNumber
        );
        const existPlaceholderPosition =
          existPlaceholder[0] && existPlaceholder[0].pos;

        const newId = randomId();
        const newPlaceholder = { ...currentPlaceholder, key: newId };
        //function for get copy to requested location of placeholder position
        const getPlaceholderObj = getCopyPlaceholderPosition(
          type,
          newPlaceholder,
          newPageNumber,
          existPlaceholderPosition
        );
        if (getPlaceholderObj) {
          newPlaceholderPosition.push(getPlaceholderObj);
        }

        newPageNumber++;
      }
      props.setXyPosition(newPlaceholderPosition);
    }
  };

  //function for getting selected type placeholder copy
  const handleApplyCopy = () => {
    const newId = randomId();
    if (selectCopyType === 4) {
      const signerPosition = props.xyPosition;
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
          newId,
          currentXYposition,
          props.xyPosition,
          props.pageNumber,
          props.setXyPosition,
          props?.Id
        );
      } else {
        const getIndex = props?.xyPosition.findIndex(
          (data) => data.pageNumber === props.pageNumber
        );
        const placeholderPosition = props?.xyPosition[getIndex];
        //get current placeholder position data which user want to copy
        currentXYposition = placeholderPosition.pos.find(
          (pos) => pos.key === props.signKey
        );
        //function to create new widget next to just widget
        handleCopyNextToWidget(
          newId,
          currentXYposition,
          props.xyPosition,
          getIndex,
          props.setXyPosition
        );
      }
    } else {
      copyPlaceholder(selectCopyType);
    }
  };
  const handleUniqueId = () => {
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

        <div className="flex flex-row bg-[#9f9f9f] w-full my-[15px]"></div>
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
          className="op-btn op-btn-ghost text-base-content ml-2"
          onClick={() => handleUniqueId()}
        >
          {t("cancel")}
        </button>
      </div>
    </ModalUi>
  );
}

export default PlaceholderCopy;
