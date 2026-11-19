import { useEffect } from "react";
import RegexParser from "regex-parser";
import { emailRegex } from "../../constant/const";
import {
  clearResponse, drawWidget, isEmptyValue, nextPendingWidget
} from "../../constant/Utils";
import { setIsShowModal, setLastIndex, setPrefillImg } from "../../redux/reducers/widgetSlice";

/** Build the required-field, validation, and signer navigation callbacks. */
export function useModalActions(context) {
  const {
    currWidgetsDetails, props, setIsOptional, uniqueId, xyPosition, lastWidget,
    setIsLastWidget, isOptional, t, widgetValue, setIsShowValidation,
    isShowValidation, dispatch, setXyPosition, signature, image,
    myInitial, defaultSignImg, myStamp, typedSignature, handleSaveBtn,
    isSave, setIsFinish, setPageNumber, handleClear, selectedCheckbox, isTab,
    widgetTypeTranslation
  } = context;
  //function is used to check current widget is required or optional
  const handleCheckOptional = () => {

    const effectiveStatus =
      currWidgetsDetails?.options?.status ||
      "required";
    let isRequired = false;
    const isCheckBox =
      !currWidgetsDetails.options?.isReadOnly &&
      currWidgetsDetails.type === "checkbox";
    if (isCheckBox && props?.role !== "prefill") {
      //get minimum required count if  exist
      const minCount =
        currWidgetsDetails?.options?.validation?.minRequiredCount;
      const parseMin = minCount && parseInt(minCount);
      if (parseMin > 0) {
        isRequired = true;
      }
    } else {
      isRequired = effectiveStatus === "required";
    }
    if (isRequired) {
      setIsOptional(false);
    }
  };

  //function is used to show how many field left and how many total widget
  const HandleRequiredField = () => {

    let widgetsPosition = [];
    if (uniqueId) {
      const currSignerWidget = xyPosition?.find(
        (data) => data?.Id === uniqueId
      );
      widgetsPosition = currSignerWidget.placeHolder;
    } else {
      widgetsPosition = xyPosition;
    }

    //generate all nested level in single level
    const flatPlaceholder = widgetsPosition?.flatMap((page) =>
      page.pos
        .filter((widget) => {
          if (widget.options?.isReadOnly) return false;
          return true;
        })
        .map((widget) => ({ widget, pageNumber: page.pageNumber }))
    );
    let totalWidget = 0;
    let alreadyValue = 0;
    flatPlaceholder?.forEach(({ widget: field }) => {
      const isValueExist =
        field.options?.response || field.options?.defaultValue;
      totalWidget++;
      if (isValueExist) {
        alreadyValue++;
      }
    });

    const leftRequiredWidget = totalWidget - alreadyValue;
    useEffect(() => {
      handleCheckOptional();
      if (
        currWidgetsDetails?.key === lastWidget ||
        flatPlaceholder?.length === 1
      ) {
        setIsLastWidget(true);
      }
    }, []);
    return (
      <span className="text-center text-[12px] text-base-content">
        {t("required-mssg", { leftRequiredWidget, totalWidget })}
      </span>
    );
  };
  //function to validate text widget expression or type
  const validateExpression = (regexValidation) => {
    if (widgetValue && regexValidation) {
      let regexObject = regexValidation;
      if (currWidgetsDetails?.options?.validation?.type === "regex") {
        regexObject = RegexParser(regexValidation);
      }
      let isValidate = regexObject.test(widgetValue);
      if (!isValidate) {
        setIsShowValidation(true);
      }
    }
  };
  //function is used when user enter value in any textbox then check validation
  const handleValidation = () => {
    const validateType = currWidgetsDetails?.options?.validation?.type;
    let regexValidation;
    switch (validateType) {
      case "email":
        regexValidation = emailRegex;
        validateExpression(regexValidation);
        break;
      case "number":
        regexValidation = /^[0-9\s]*$/;
        validateExpression(regexValidation);
        break;
      case "ssn":
        regexValidation = /^(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/;
        validateExpression(regexValidation);
        break;
      default:
        // Grab the current pattern (if it exists)
        const pattern = currWidgetsDetails?.options?.validation?.pattern;
        // Removed `backwordSupportPattern` (/^[a-zA-Z0-9s]+$/) — it blocked spaces and special characters.
        const backwordSupportPattern =
          pattern && pattern === "/^[a-zA-Z0-9s]+$/" ? "" : pattern; // If it matches exactly '/^[a-zA-Z0-9s]+$/', clear it
        regexValidation = backwordSupportPattern || "";
        validateExpression(regexValidation);
        break;
    }
  };

  // `clearWidgetResponse` is used to clear response of signature, stamp, image, initials, draw widget based on id
  const clearWidgetResponse = () => {
    const widgetKey = currWidgetsDetails?.key;
    const isOptional =
      currWidgetsDetails?.options?.status === "optional" || false;
    if (widgetKey && isOptional) {
      const isPrefill = xyPosition.some(
        ({ Id, Role }) => Id === uniqueId && Role === "prefill"
      );
      if (isPrefill) dispatch(setPrefillImg({ id: widgetKey, base64: "" }));

      setXyPosition((prev) =>
        prev.map((signer) => {
          if (signer.Id !== uniqueId) return signer;

          const idx = signer?.placeHolder?.findIndex((p) =>
            p.pos?.some((w) => w.key === widgetKey)
          );
          if (idx === -1) return signer;

          return {
            ...signer,
            placeHolder: clearResponse(widgetKey, signer.placeHolder, idx)
          };
        })
      );
    }
  };

  //function too use on click on next/finish button then update modal UI according to current widgets
  const handleClickOnNext = async (isFinishDoc) => {
    if (
      ["signature", "stamp", "image", "initials", drawWidget].includes(
        currWidgetsDetails?.type
      )
    ) {
      if (
        signature ||
        image ||
        myInitial ||
        defaultSignImg ||
        myStamp ||
        typedSignature
      ) {
        //function to save all type draw or image
        handleSaveBtn();
      } else {
        clearWidgetResponse();
      }
    }
    if (isSave) {
      handleclose();
    }
    //condition when there are no any details left for response and current widget is last widget then
    //on click on finish button embed all widget's details on pdf and finish document
    if (isFinishDoc) {
      setIsFinish(true);
      props.setCurrWidgetsDetails(currWidgetsDetails);
    } else if (!isSave) {
      const widgetsPosition = xyPosition?.find((data) => data.Id === uniqueId);
      const nextItem = nextPendingWidget(widgetsPosition?.placeHolder, currWidgetsDetails?.key);
      if (nextItem) {
        props.setPageNumber(nextItem.pageNumber);
        dispatch(setIsShowModal({ [nextItem.widget.key]: true }));
        props.setCurrWidgetsDetails({ ...nextItem.widget, pageNumber: nextItem.pageNumber });
      } else {
        handleclose();
      }
    }

  };
  //function is used to disable/enable save button
  const handleDisable = () => {
    if (!isShowValidation) {
      if (isOptional && uniqueId) {
        return false;
      } else if (
        ["signature", "stamp", "image", "initials", drawWidget].includes(
          currWidgetsDetails?.type
        )
      ) {
        const { type } = currWidgetsDetails || {};
        //conditions based on widget type or active tab
        const conditions = {
          draw: !signature, // Draw tab requires a drawn signature
          image: !image, // Upload tab requires an image
          mysignature: !defaultSignImg, // My Signature tab requires a saved/default signature
          type: !(typedSignature?.trim()?.length > 0), // Type tab requires non-empty typed signature
          myinitials: !myInitial,
          myStamp: !myStamp,
          uploadStamp: !image
        };
        // First check conditions based on widget type
        if (type && conditions.hasOwnProperty(type)) {
          return conditions[type];
        }
        //If type doesn't match, check based on active tab
        if (isTab && conditions.hasOwnProperty(isTab)) {
          return conditions[isTab];
        }

        return true; // default
      } else if (
        currWidgetsDetails?.type === "checkbox" &&
        selectedCheckbox?.length > 0
      ) {
        return false;
      } else if (isEmptyValue(widgetValue)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };
  const handleclose = () => {
    // If validation is shown, clear the response and close the modal
    if (isShowValidation) {
      handleClear();
      setIsShowValidation(false);
    }
    dispatch(setIsShowModal({}));
    dispatch(setLastIndex(""));
  };
  //function is used to execute the finish button functionality
  const handleFinish = () => {
    props?.finishDocument();
    dispatch(setIsShowModal({}));
  };

  useEffect(() => {
    if (!isSave) {
      handleFinishButton();
    }
  }, [isSave]);
  //'handleFinishButton' function is used to show finish button click on any widget if all required widgets have response
  const handleFinishButton = () => {
    const widgetsPosition = xyPosition?.find((data) => data.Id === uniqueId);

    //using 'flatMap' create all nested array in one level
    const editableWidgets = widgetsPosition?.placeHolder?.flatMap((page) =>
      page.pos
        .filter((widget) => {
          if (widget.options?.isReadOnly) return false;
          return true; // ← outside ee block
        })
        .map((widget) => ({ ...widget, pageNumber: page.pageNumber }))
    );
    const getcurrentwidget = editableWidgets?.find(
      (data) => data?.key === currWidgetsDetails?.key
    );
    if (getcurrentwidget?.options?.response) {
      props?.setCurrWidgetsDetails(getcurrentwidget);
    }
    let isResponse = true;
    //condition to check all required widgets have response or not then show finish button
    for (const data of editableWidgets) {
      // Use the dynamic required status (respects require/optional logic actions).
      const effectiveStatus =
        data.options?.status ||
        "required";
      if (data?.type === "checkbox") {
        const minCount = data.options?.validation?.minRequiredCount;
        const parseMin = minCount && parseInt(minCount);
        const hasNoResponse =
          (!Array.isArray(data?.options?.response) ||
            data.options.response.length === 0) &&
          (!Array.isArray(data?.options?.defaultValue) ||
            data.options.defaultValue.length === 0);
        if (parseMin > 0 && hasNoResponse) {
          isResponse = false;
          break;
        }
      } else if (
        !data.options.response &&
        !data?.options?.defaultValue &&
        effectiveStatus === "required"
      ) {
        isResponse = false;
        break;
      }
    }
    if (isResponse) {
      setIsLastWidget(true);
    }
  };

  const formatWidgetName = (widgetName) => {
    if (!widgetName) return widgetTypeTranslation;

    const parts = widgetName.split("-");
    const [first] = parts;
    const lastWord = parts.length > 1 ? `-${parts[parts.length - 1]}` : "";

    return currWidgetsDetails?.type === first
      ? `${first}${lastWord}`
      : widgetName;
  };
  return {
    handleCheckOptional, HandleRequiredField, validateExpression, handleValidation,
    clearWidgetResponse, handleClickOnNext, handleDisable, handleclose, handleFinish,
    handleFinishButton, formatWidgetName
  };
}
