import React, { useState } from "react";
import { themeColor } from "../../utils/ThemeColor/backColor";
import ModalUi from "../../premitives/ModalUi";

function PlaceholderCopy(props) {
  const copyType = ["All pages", "All pages but last", "All pages but first"];
  const [selectCopyType, setSelectCopyType] = useState("");

  //get RandomKey Id
  const randomKey = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return randomId;
  };

  //function for get copy placeholder position
  const getCopyPlaceholderPosition = (
    type,
    rest,
    newPageNumber,
    existPlaceholderPosition
  ) => {
    let obj;

    const filterPosition =
      existPlaceholderPosition &&
      existPlaceholderPosition.filter(
        (data) => data.xPosition !== rest.xPosition
      );
    //copy all page placeholder at requested position except first page
    if (newPageNumber === 1 && type === "first") {
      if (filterPosition && filterPosition.length > 0) {
        return (obj = {
          pageNumber: newPageNumber,
          pos: [...filterPosition]
        });
      }
    }
    //copy all page placeholder at requested position except  last page
    else if (newPageNumber === props.allPages && type === "last") {
      if (existPlaceholderPosition) {
        return (obj = {
          pageNumber: newPageNumber,
          pos: [...filterPosition]
        });
      }
    }
    //copy all page placeholder at requested position with existing placeholder position
    else if (existPlaceholderPosition) {
      return (obj = {
        pageNumber: newPageNumber,
        pos: [...filterPosition, rest]
      });
    }
    //copy all page placeholder at requested position
    else {
      return (obj = {
        pageNumber: newPageNumber,
        pos: [rest]
      });
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
      const currentPlaceholder = placeholderPosition[0].pos.filter(
        (position) => position.key === props.signKey
      );
      const { key, ...rest } = currentPlaceholder[0];
      for (let i = 0; i < props.allPages; i++) {
        const newId = randomKey();
        rest.key = newId;
        //get exist placeholder position for particular page
        const existPlaceholder = filterSignerPosition[0].placeHolder.filter(
          (data) => data.pageNumber === newPageNumber
        );
        const existPlaceholderPosition =
          existPlaceholder[0] && existPlaceholder[0].pos;

        //function for get copy to requested location of placeholder position
        const getPlaceholderObj = getCopyPlaceholderPosition(
          type,
          rest,
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
        updatedSignerPlaceholder = signerPosition.map((signersData, ind) => {
          if (signersData.signerObjId === props.signerObjId) {
            return {
              ...signersData,
              placeHolder: newPlaceholderPosition
            };
          }
          return signersData;
        });
      } else {
        updatedSignerPlaceholder = signerPosition.map((signersData, ind) => {
          if (signersData.Id === props.Id) {
            return {
              ...signersData,
              placeHolder: newPlaceholderPosition
            };
          }
          return signersData;
        });
      }
      // const updatedSignerPlaceholder = signerPosition.map(
      //   (signersData, ind) => {
      //     if (signersData.signerObjId === props.signerObjId) {
      //       return {
      //         ...signersData,
      //         placeHolder: newPlaceholderPosition
      //       };
      //     }
      //     return signersData;
      //   }
      // );

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
      const currentPlaceholder = placeholderPosition[0].pos.filter(
        (pos) => pos.key === props.signKey
      );
      const { key, ...rest } = currentPlaceholder[0];
      for (let i = 0; i < props.allPages; i++) {
        //get exist placeholder position for particular page
        const existPlaceholder = xyPostion.filter(
          (data) => data.pageNumber === newPageNumber
        );
        const existPlaceholderPosition =
          existPlaceholder[0] && existPlaceholder[0].pos;

        const newId = randomKey();
        rest.key = newId;
        //function for get copy to requested location of placeholder position
        const getPlaceholderObj = getCopyPlaceholderPosition(
          type,
          rest,
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

  return (
    <ModalUi
      isOpen={props.isPageCopy}
      title={"Copy to all pages"}
      handleClose={() => {
        props.setIsPageCopy(false);
      }}
    >
      <div style={{ height: "100%", padding: 20 }}>
        {copyType.map((data, key) => {
          return (
            <div key={key} style={{ display: "flex", flexDirection: "column" }}>
              <label key={key} style={{ fontSize: "16px", fontWeight: "500" }}>
                <input
                  style={{ accentColor: "red", marginRight: "10px" }}
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

        <div
          style={{
            height: "1px",
            backgroundColor: "#9f9f9f",
            width: "100%",
            marginTop: "15px",
            marginBottom: "15px"
          }}
        ></div>
        <button
          onClick={() => {
            handleApplyCopy();
            props.setIsPageCopy(false);
          }}
          style={{
            background: themeColor()
          }}
          type="button"
          disabled={!selectCopyType}
          className="finishBtn"
        >
          Apply
        </button>
        <button
          type="button"
          className="finishBtn cancelBtn"
          onClick={() => props.setIsPageCopy(false)}
        >
          Cancel
        </button>
      </div>
    </ModalUi>
  );
}

export default PlaceholderCopy;
