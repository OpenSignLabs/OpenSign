import { useState, useEffect } from "react";
import ModalUi from "../../primitives/ModalUi";
import {
  drawWidget,
  handleCopyNextToWidget,
  randomId
} from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import { setPrefillImg } from "../../redux/reducers/widgetSlice";
import { useDispatch, useSelector } from "react-redux";

function PlaceholderCopy(props) {
  const { prefillImg } = useSelector((state) => state.widget);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const copyType = [
    { id: 1, type: "All pages" },
    { id: 2, type: "All pages but last" },
    { id: 3, type: "All pages but first" },
    { id: 4, type: "Next to current widget" },
    { id: 5, type: "Page range" }
  ];
  const [selectCopyType, setSelectCopyType] = useState(1);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(props.pageNumber);

  // Auto set default range when selecting page range
  useEffect(() => {
    if (selectCopyType === 5) {
      setFromPage(props.pageNumber);
      setToPage(props.allPages);
    }
  }, [selectCopyType, props.pageNumber, props.allPages]);
  //function for get copy placeholder position
  const getCopyPlaceholderPosition = (
    type,
    newPlaceholder,
    newPageNumber,
    existPlaceholderPosition
  ) => {
    //Get source page dimensions (page where widget currently exists)
    const sourcePage = props?.pdfOriginalWH?.find(
      (x) => x?.pageNumber === props.pageNumber
    );

    // Get target page dimensions (page where widget is being copied)
    const targetPage = props?.pdfOriginalWH?.find(
      (x) => x?.pageNumber === newPageNumber
    );

    // Extract width & height of source and target pages
    const sourcePageHeight = sourcePage?.height;
    const sourcePageWidth = sourcePage?.width;

    const targetPageHeight = targetPage?.height;
    const targetPageWidth = targetPage?.width;

    // Create a copy of placeholder to safely modify position
    let updatedPlaceholder = { ...newPlaceholder };

    /*  
  - Landscape & portrait pages have different dimensions
  - Directly copying x/y may push widget outside page
  - So we scale position proportionally
  - Then clamp it to stay inside page boundaries
*/
    if (
      sourcePageHeight &&
      targetPageHeight &&
      newPageNumber !== props.pageNumber
    ) {
      // Fallback widget dimensions (in case not defined)
      const widgetHeight = newPlaceholder?.height || 60;
      const widgetWidth = newPlaceholder?.width || 150;

      //Calculate scaling ratio between source and target page
      const heightRatio = targetPageHeight / sourcePageHeight;
      const widthRatio = targetPageWidth / sourcePageWidth;

      // Scale original position proportionally
      let updatedY = newPlaceholder.yPosition * heightRatio;
      let updatedX = newPlaceholder.xPosition * widthRatio;

      /*
    If widget exceeds page height,
    shift it upward to fit inside page.
  */
      if (updatedY + widgetHeight > targetPageHeight) {
        updatedY = targetPageHeight - widgetHeight - 10; // 10px padding
      }

      // Prevent negative Y position
      if (updatedY < 0) updatedY = 0;

      /*
    If widget exceeds page width,
    shift it left to fit inside page.
  */
      if (updatedX + widgetWidth > targetPageWidth) {
        updatedX = targetPageWidth - widgetWidth - 10; // 10px padding
      }

      // Prevent negative X position
      if (updatedX < 0) updatedX = 0;

      //Update placeholder with safe adjusted position
      updatedPlaceholder = {
        ...updatedPlaceholder,
        xPosition: updatedX,
        yPosition: updatedY
      };
    }

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
          pos: [...existPlaceholderPosition, updatedPlaceholder]
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
          pos: [updatedPlaceholder]
        };
      }
    }
  };
  //function for copy placeholder as per select copy type
  const copyPlaceholder = (type, start = 1, end = props.allPages) => {
    let newPlaceholderPosition = [];
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

      if (!filterSignerPosition.length) return;

      const signerData = filterSignerPosition[0];
      //get current pagenumber's all placeholder position data
      const placeholderPosition = signerData.placeHolder.filter(
        (data) => data.pageNumber === props.pageNumber
      );

      if (!placeholderPosition.length) return;
      //get current placeholder position data which user want to copy

      const currentPlaceholder = placeholderPosition[0].pos.find(
        (position) => position.key === props.signKey
      );

      if (!currentPlaceholder) return;

      //Copy for selected range only
      for (let i = start; i <= end; i++) {
        const newId = randomId();
        const nameId = randomId(2);
        const widgetName = `${currentPlaceholder?.type}${nameId}`;
        const newPlaceholder = {
          ...currentPlaceholder,
          key: newId,
          options: { ...currentPlaceholder?.options, name: widgetName }
        };
        //get exist placeholder position for particular page
        const existPlaceholder = signerData.placeHolder.find(
          (data) => data.pageNumber === i
        );
        const existPlaceholderPosition =
          existPlaceholder && existPlaceholder.pos;
        //function for get copy to requested location of placeholder position
        const getPlaceholderObj = getCopyPlaceholderPosition(
          type,
          newPlaceholder,
          i,
          existPlaceholderPosition
        );
        if (getPlaceholderObj?.pos) {
          newPlaceholderPosition.push(getPlaceholderObj);
        }
        // Prefill image handling
        if (
          signerData?.Role === "prefill" &&
          currentPlaceholder?.options?.response &&
          (currentPlaceholder?.type === "image" ||
            currentPlaceholder?.type === drawWidget)
        ) {
          const getPrefillImg = prefillImg?.find(
            (x) => x.id === currentPlaceholder?.key
          );
          const base64Img = getPrefillImg?.base64;
          dispatch(
            setPrefillImg({
              id: newId,
              base64: base64Img
            })
          );
        }
      }

      // MERGE instead of replace
      const updatedSignerPlaceholder = signerPosition.map((signersData) => {
        const match = props?.signerObjId
          ? signersData.signerObjId === props.signerObjId
          : signersData.Id === props.Id;

        if (!match) return signersData;

        const oldPlaceholders = signersData.placeHolder || [];

        // Keep pages outside selected range
        const filteredOld = oldPlaceholders.filter(
          (page) => page.pageNumber < start || page.pageNumber > end
        );

        return {
          ...signersData,
          placeHolder: [...filteredOld, ...newPlaceholderPosition]
        };
      });

      // No mutation
      props.setXyPosition(updatedSignerPlaceholder);
    }
    //handle signyourself array and copy for single signers placeholder at requested location
    else {
      const xyPosition = props.xyPosition;

      const currentPageData = xyPosition.find(
        (data) => data.pageNumber === props.pageNumber
      );

      if (!currentPageData) return;

      const currentPlaceholder = currentPageData.pos.find(
        (pos) => pos.key === props.signKey
      );

      if (!currentPlaceholder) return;

      // 🔁 Copy only selected range (even if start === end)
      for (let i = start; i <= end; i++) {
        const existPlaceholder = xyPosition.find(
          (data) => data.pageNumber === i
        );

        const existPlaceholderPosition =
          existPlaceholder && existPlaceholder.pos;

        const newId = randomId();

        const newPlaceholder = {
          ...currentPlaceholder,
          key: newId
        };

        const getPlaceholderObj = getCopyPlaceholderPosition(
          type,
          newPlaceholder,
          i,
          existPlaceholderPosition
        );

        if (getPlaceholderObj?.pos) {
          newPlaceholderPosition.push(getPlaceholderObj);
        }
      }

      // ✅ MERGE instead of replace
      const filteredOld = xyPosition.filter(
        (page) => page.pageNumber < start || page.pageNumber > end
      );

      const finalData = [...filteredOld, ...newPlaceholderPosition];

      props.setXyPosition(finalData);
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
          props?.pdfOriginalWH,
          props?.Id
        );
        if (
          filterSignerPosition[0]?.Role === "prefill" &&
          currentXYposition?.options?.response &&
          (currentXYposition?.type === "image" ||
            currentXYposition?.type === drawWidget)
        ) {
          const getPrefillImg = prefillImg?.find(
            (x) => x.id === currentXYposition?.key
          );
          const base64Img = getPrefillImg?.base64;
          dispatch(
            setPrefillImg({
              id: newId,
              base64: base64Img
            })
          );
        }
      } else {
        currentXYposition = props?.xyPosition.find(
          (data) => data.pageNumber === props?.pageNumber
        );
        //get current placeholder position data which user want to copy
        currentXYposition = currentXYposition?.pos.find(
          (position) => position.key === props.signKey
        );
        //function to create new widget next to just widget
        handleCopyNextToWidget(
          newId,
          currentXYposition,
          props.xyPosition,
          props.pageNumber,
          props.setXyPosition,
          props?.pdfOriginalWH
        );
      }
    } else if (selectCopyType === 5) {
      if (!fromPage || !toPage) return;

      const start = Number(fromPage);
      const end = Number(toPage);
      const totalPages = props.allPages;

      if (start >= 1 && end <= totalPages && start <= end) {
        copyPlaceholder(selectCopyType, start, end);
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
        {copyType.map((data) => (
          <div key={data.id} className="flex flex-col">
            <label className="text-[16px] font-medium items-center">
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
        ))}

        {/* ✅ PAGE RANGE UI */}
        {selectCopyType === 5 && (
          <div className="flex items-center gap-2 mt-4">
            <span>From</span>
            <input
              type="number"
              value={fromPage}
              min={1}
              max={props.allPages}
              onKeyDown={(e) => {
                // block invalid characters
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value;

                // allow empty while typing
                if (value === "") {
                  setFromPage("");
                  return;
                }

                const numericValue = Number(value);

                // 🚫 BLOCK if outside range
                if (numericValue < 1 || numericValue > props.allPages) {
                  return; // do NOT update state
                }

                setFromPage(numericValue);
              }}
              className="w-16 border px-2 py-1 rounded"
            />

            <span>To</span>
            <input
              type="number"
              value={toPage}
              min={1}
              max={props.allPages}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                  setToPage("");
                  return;
                }

                const numericValue = Number(value);

                if (numericValue < 1 || numericValue > props.allPages) {
                  return;
                }

                setToPage(numericValue);
              }}
              className="w-16 border px-2 py-1 rounded"
            />

            <span>out of {props.allPages} pages</span>
          </div>
        )}

        <div className="flex flex-row bg-[#9f9f9f] w-full my-[15px]" />

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
