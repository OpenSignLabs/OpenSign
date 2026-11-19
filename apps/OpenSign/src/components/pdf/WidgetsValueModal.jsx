import { updateLinkedInitials } from "../../utils/linkedFields";
import { createSaveActions } from "./widgetsValueModalSaveActions";
import { useModalActions } from "./widgetsValueModalActions";
import { createFieldActions } from "./widgetsValueModalFieldActions";
import { createSignatureActions } from "./widgetsValueModalSignatureActions";
import { createWidgetTypeRenderer } from "./widgetsValueModalRenderer";
import { useSignatureEffects } from "./widgetsValueModalEffects";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import {
  changeDateToMomentFormat,
  checkRegularExpress,
  compressedFileSize,
  getMonth,
  getYear,
  months,
  onSaveImage,
  onSaveSign,
  radioButtonWidget,
  cellsWidget,
  drawWidget,
  textInputWidget,
  textWidget,
  years,
  convertJpegToPng,
  convertBase64ToFile,
  generatePdfName,
  getDefaultDate,
  getDefaultFormat,
  getBase64MimeType,
  onChangeInput,
  isEmptyValue
} from "../../constant/Utils";
import moment from "moment";
import {
  setIsShowModal,
  setScrollTriggerId,
  setPrefillImg,
  setPrefillImgLoad,
  setSignatureRes,
} from "../../redux/reducers/widgetSlice";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../primitives/Loader";
import {
} from "../../utils";

const fontOptions = [
  { value: "Fasthand" },
  { value: "Dancing Script" },
  { value: "Cedarville Cursive" },
  { value: "Delicious Handrawn" }
  // Add more font options as needed
];
const textInputcls =
  "op-input op-input-bordered op-input-sm focus:outline-none text-base-content hover:border-base-content w-full text-xs";

function WidgetsValueModal(props) {
  const dispatch = useDispatch();
  const {
    signatureResponse,
    prefillImg,
    defaultSignImg,
    myInitial,
    lastIndex: lastWidget,
    typedSignFont,
    saveSignCheckbox: mysign,
    myStamp
  } = useSelector((state) => state.widget);
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const {
    xyPosition,
    uniqueId,
    pageNumber,
    currWidgetsDetails,
    setXyPosition,
    isSave,
    signatureTypes,
    penColors
  } = props;
  const previousWidgetRes = signatureResponse?.find(
    (item) => item.type === currWidgetsDetails?.type
  );
  const [penColor, setPenColor] = useState("");
  const [isOptional, setIsOptional] = useState(true);
  const [isTab, setIsTab] = useState("");
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [isSignTypes, setIsSignTypes] = useState(true);
  const [typedSignature, setTypedSignature] = useState(
    previousWidgetRes?.value || ""
  );
  const [selectDate, setSelectDate] = useState({});
  const [isLastWidget, setIsLastWidget] = useState(false);
  const [signature, setSignature] = useState();
  const [isImageSelect, setIsImageSelect] = useState(false);
  const [isFinish, setIsFinish] = useState(false);
  const [fontSelect, setFontSelect] = useState(
    previousWidgetRes?.font || fontOptions[0].value
  );
  const [isSavedSign, setIsSavedSign] = useState(false);
  const [isAutoSign, setIsAutoSign] = useState(false);
  const [image, setImage] = useState(null);
  const [isLoader, setIsLoader] = useState(false);
  const [hint, setHint] = useState("");
  const [isShowValidation, setIsShowValidation] = useState(false);
  const [removeBgEnabled, setRemoveBgEnabled] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [selectedCheckbox, setSelectedCheckbox] = useState(
    currWidgetsDetails.type === "checkbox" &&
      (currWidgetsDetails?.options?.response ||
        currWidgetsDetails?.options?.defaultValue ||
        [])
  );
  const [startDate, setStartDate] = useState(
    currWidgetsDetails?.options?.response
      ? getDefaultDate(
          currWidgetsDetails?.options?.response,
          currWidgetsDetails?.options?.validation?.format
        )
      : ""
  );
  const accesstoken = localStorage.getItem("accesstoken") || "";
  const senderUser = localStorage.getItem(
    `Parse/${localStorage.getItem("parseAppId")}/currentUser`
  );
  const kiosk_signer =
    props?.kiosk_signer || JSON.parse(localStorage.getItem("kiosk_signer"));
  const jsonSender = senderUser && JSON.parse(senderUser);
  const currentUserName = jsonSender && jsonSender?.name;
  const type = currWidgetsDetails?.type;
  const widgetTypeTranslation = t(`widgets-name.${currWidgetsDetails?.type}`);

  const getLogicMap = () => new Map();


  const [widgetValue, setWidgetValue] = useState(() => {
    if (currWidgetsDetails.type === "checkbox") {
      return undefined;
    }
    return (
      currWidgetsDetails?.options?.response ||
      currWidgetsDetails?.options?.defaultValue
    );
  });
  const blocked = [
  ];
  const blockedTab = ["mysignature", "myinitials", "myStamp"];
  const showClearbtn =
    (!blocked.includes(type) && !blockedTab.includes(isTab));
  const isSignOrInitials = ["signature", "initials"].includes(
    currWidgetsDetails?.type
  );
  const isImageOrStamp = ["image", "stamp"].includes(currWidgetsDetails?.type);
  const widgetRef = useRef(null);
  useEffect(() => {
    const val =
      currWidgetsDetails?.options?.response ||
      currWidgetsDetails?.options?.defaultValue ||
      "";
    setWidgetValue(String(val || ""));
  }, [currWidgetsDetails?.key, currWidgetsDetails?.options?.cellCount]);
  useEffect(() => {
    dispatch(setScrollTriggerId(currWidgetsDetails?.key));
    handlePenColor();
    return () => dispatch(setScrollTriggerId());
  }, []);

  const handlePenColor = () => {
    if (penColors && Array.isArray(penColors) && penColors?.length > 0) {
      setPenColor(penColors?.[0] || "blue");
    } else {
      setPenColor("blue");
    }
  };
  // below useEffect is used to focus text widgets when user open modal
  useEffect(() => {
    if (widgetRef?.current) {
      const clearFocus = setTimeout(
        () => widgetRef?.current.focus({ preventScroll: true }),
        10
      );
      return () => clearTimeout(clearFocus);
    }
  }, [widgetRef.current]);

  useEffect(() => {
    if (
      [
        "name",
        "email",
        "job title",
        "company",
        textInputWidget,
        cellsWidget
      ].includes(currWidgetsDetails?.type)
    ) {
      if (currWidgetsDetails?.options?.hint) {
        setHint(currWidgetsDetails?.options.hint);
      } else if (currWidgetsDetails?.options?.validation?.type) {
        checkRegularExpress(
          currWidgetsDetails?.options?.validation?.type,
          setHint
        );
      } else {
        setHint(currWidgetsDetails?.type);
      }
    }

    else if (currWidgetsDetails?.type === "date") {
      setHint(currWidgetsDetails?.options.hint || "");
    } else if (isSignOrInitials) {
      if (currWidgetsDetails?.signatureType) {
        setIsTab(currWidgetsDetails?.signatureType);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currWidgetsDetails]); // Added currWidgetsDetails to dependency array for reset logic

  useEffect(() => {
    // Reset originalImage and removeBgEnabled when widget details change
    setOriginalImage(null);
    setRemoveBgEnabled(false);
  }, [currWidgetsDetails?.key]);

  //function to save date and format after selected new date in response field and after finish document it should embed the new selected date instead of current date
  useEffect(() => {
    if (currWidgetsDetails?.type === "date") {
      const isDateChange = true;
      const dateObj = {
        date: startDate,
        format: getDefaultFormat(
          currWidgetsDetails?.options?.validation?.format
        )
      };
      handleSaveDate(dateObj, isDateChange); //function to save date and format in local array
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);
  //function to save date and format on local array onchange date and onclick format
  const handleSaveDate = (data, isDateChange) => {
    let updateDate = data.date;
    let date;
    if (data?.format === "dd-MM-yyyy") {
      date = isDateChange
        ? moment(updateDate).format(changeDateToMomentFormat(data.format))
        : updateDate;
    } else {
      //using moment package is used to change date as per the format provided in selectDate obj e.g. - MM/dd/yyyy -> 03/12/2024
      const newDate = new Date(updateDate);
      date = moment(newDate.getTime()).format(
        changeDateToMomentFormat(data?.format)
      );
    }
    //`onChangeInput` is used to save data related to date in a placeholder field
    onChangeInput(
      date,
      currWidgetsDetails,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId,
      false,
      data?.format,
      currWidgetsDetails?.options?.fontSize,
      currWidgetsDetails?.options?.fontColor,
      null,
      null,
    );
    setSelectDate({ date: date, format: data?.format });
  };
  useEffect(() => {
    handleTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureTypes]);
  //function for image upload or update
  const { onImageChange, handleSavePrefillImg, syncSavedInitials, handleSaveImage, handleSaveSignature } = createSaveActions({
    dispatch, setIsLoader, currWidgetsDetails, image, setOriginalImage,
    setRemoveBgEnabled, compressedFileSize, generatePdfName, getBase64MimeType,
    setPrefillImg, convertBase64ToFile, xyPosition, uniqueId, setPrefillImgLoad,
    myStamp, convertJpegToPng, setXyPosition, onSaveImage, isAutoSign, isTab,
    setSignatureRes, props, pageNumber, setIsAutoSign, setIsImageSelect,
    setImage, myInitial, defaultSignImg, signature, onSaveSign, fontSelect,
    penColor, updateLinkedInitials
  });

  const signatureActions = createSignatureActions({
    currWidgetsDetails, signatureTypes, defaultSignImg, signatureResponse,
    setIsSignTypes, setIsTab, setIsImageSelect, myInitial, myStamp, canvasRef,
    setImage, setOriginalImage, setRemoveBgEnabled, setSignature, isTab,
    setTypedSignature, setWidgetValue, xyPosition, props, setXyPosition,
    uniqueId, setSelectedCheckbox, setStartDate, signature, image, setIsLoader,
    mysign, dispatch, t, accesstoken, isSavedSign, handlePenColor,
    handleSaveImage, handleSaveSignature, textWidth, textHeight, typedSignature,
    setIsAutoSign, isAutoSign
  });
  const {
    handleTab, isTabEnabled, handleClear, handleSignatureChange, handleSaveToMySign,
    handleSaveBtn, resetToDefault, autoSignAll
  } = signatureActions;

  const signatureEffects = useSignatureEffects({
    typedSignFont, fontSelect, setFontSelect, fontOptions, currWidgetsDetails,
    signatureResponse, canvasRef, isSignOrInitials, isTab, setSignature, setImage,
    isImageOrStamp, xyPosition, uniqueId, prefillImg, currentUserName,
    kiosk_signer, props, typedSignature, setTypedSignature, setTextWidth,
    setTextHeight, dispatch, image, originalImage, isImageSelect, removeBgEnabled,
    setOriginalImage, setIsLoader, setRemoveBgEnabled, penColor
  });
  const { convertToImg, handleWidgetsResponse } = signatureEffects;
  const fieldActions = createFieldActions({
    isSavedSign, setIsSavedSign, t, currWidgetsDetails, selectedCheckbox,
    setSelectedCheckbox, xyPosition, props, setXyPosition, uniqueId, widgetValue,
    setWidgetValue, setStartDate, setIsShowValidation
  });
  const {
    savesigncheckbox, handleCheckboxValue, handleRadioCheck, handleCheckRadio,
    ExampleCustomInput, handleOnDateChange, getDropdownText,
    handleOnchangeTextBox, updateCells, handleCellsInput
  } = fieldActions;
  const modalActions = useModalActions({
    currWidgetsDetails, props, setIsOptional, uniqueId, xyPosition, lastWidget,
    setIsLastWidget, isOptional, t, widgetValue, setIsShowValidation,
    isShowValidation, dispatch, setXyPosition, signature, image, myInitial,
    defaultSignImg, myStamp, typedSignature, handleSaveBtn, isSave, handleClear,
    setIsFinish, setPageNumber: props.setPageNumber, selectedCheckbox, isTab, widgetTypeTranslation
  });
  const {
    handleCheckOptional, HandleRequiredField, validateExpression, handleValidation,
    clearWidgetResponse, handleClickOnNext, handleDisable, handleclose, handleFinish,
    handleFinishButton, formatWidgetName
  } = modalActions;
  const getWidgetType = createWidgetTypeRenderer({
    currWidgetsDetails, myStamp, t, setIsTab, isTabEnabled, defaultSignImg,
    uniqueId, autoSignAll, myInitial, penColor, canvasRef, handleSignatureChange,
    penColors, convertToImg, fontSelect, typedSignature, setPenColor, mysign,
    accesstoken, image, onImageChange, isImageSelect, isImageOrStamp,
    removeBgEnabled, setRemoveBgEnabled, previousWidgetRes, setTypedSignature,
    fontOptions, setFontSelect, isSignTypes, isLoader, isTab, widgetRef,
    selectedCheckbox, handleCheckboxValue, textInputWidget, widgetValue,
    handleOnchangeTextBox, textInputcls, handleValidation, cellsWidget,
    handleCellsInput, hint, getDropdownText, startDate, months, getMonth, years,
    getYear, handleOnDateChange, selectDate, setSelectDate, handleSaveDate,
    widgetTypeTranslation, radioButtonWidget, handleRadioCheck, handleCheckRadio,
    textWidget, drawWidget, props, savesigncheckbox, setIsImageSelect,
    isSignOrInitials, ExampleCustomInput
  });


  return (
    <>
      <ModalUi
        isOpen={true}
        handleClose={() => handleclose()}
        position="bottom"
      >
        <div className="h-[100%] p-[18px]">
          {isLoader && (
            <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-base-content/30 z-50">
              <Loader />
            </div>
          )}
          {isFinish ? (
            <>
              <div className="p-1 mt-3">
                <span className="text-base text-base-content">
                  {
                        t("finish-mssg")
                  }
                </span>
              </div>
              <div className="flex gap-3 items-center mt-4">
                <button
                  type="button"
                  className="op-btn op-btn-primary op-btn-sm px-4"
                  onClick={() => handleFinish()}
                >
                  {
                        t("finish")
                  }
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-secondary op-btn-sm px-[18px]"
                  onClick={() => dispatch(setIsShowModal({}))}
                >
                  {t("review")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="relative inline-block">
                  <span className="text-base text-base-content">
                    {formatWidgetName(currWidgetsDetails?.options?.name)}
                  </span>
                  {!isOptional && (
                    <span className="absolute -top-1 -right-2 text-red-500 text-lg">
                      *
                    </span>
                  )}
                </div>
                <div className="flex flex-col justify-center m-2 mt-3">
                  <div className="flex justify-center">
                    {getWidgetType(currWidgetsDetails?.type)}
                  </div>
                  {isShowValidation && (
                    <span className="text-[12px] text-red-500">
                      {t("validation-alert-1")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-center">
                {showClearbtn ? (
                  <button
                    type="button"
                    className="op-btn op-btn-ghost op-btn-sm text-base-content mr-1"
                    onClick={handleClear}
                  >
                    {t("clear")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="op-btn op-btn-ghost text-base-content op-btn-sm mr-1 cursor-default"
                  ></button>
                )}
                <div className="flex items-center gap-2">
                  {(!isSave || props?.role === "prefill") && (
                    <HandleRequiredField />
                  )}
                  {isSave ? (
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm"
                      onClick={() => handleClickOnNext()}
                      disabled={handleDisable()}
                    >
                      {t("save")}
                    </button>
                  ) : isLastWidget ? (
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm"
                      disabled={handleDisable()}
                      onClick={() => handleClickOnNext(true)} // isFinishDoc
                    >
                      {t("done")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm text-xs md:text-sm"
                      onClick={() => handleClickOnNext()}
                      disabled={handleDisable()}
                    >
                      {t("next-field")}
                      <i className="fa-light fa-forward-step"></i>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </ModalUi>
    </>
  );
}

export default WidgetsValueModal;
