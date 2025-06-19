import React, { forwardRef, useEffect, useRef, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import { useTranslation } from "react-i18next";
import { removeBackground } from "@imgly/background-removal";
import {
  changeDateToMomentFormat,
  checkRegularExpress,
  compressedFileSize,
  getMonth,
  getYear,
  months,
  onChangeInput,
  onSaveImage,
  onSaveSign,
  radioButtonWidget,
  selectCheckbox,
  textInputWidget,
  cellsWidget,
  textWidget,
  years
} from "../../constant/Utils";
import CellsWidget from "./CellsWidget";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SignatureCanvas from "react-signature-canvas";
import Parse from "parse";
import {
  generateTitleFromFilename,
  getBase64FromUrl,
  getSecureUrl
} from "../../constant/Utils";
import sanitizeFileName from "../../primitives/sanitizeFileName";
import { SaveFileSize } from "../../constant/saveFileSize";
import moment from "moment";
import {
  setSaveSignCheckbox,
  setDefaultSignImg,
  setIsShowModal,
  setMyInitial,
  setLastIndex
} from "../../redux/reducers/widgetSlice";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../primitives/Loader";
import { emailRegex } from "../../constant/const";
import RegexParser from "regex-parser";

//function to get default format
const getDefaultFormat = (dateFormat) => dateFormat || "MM/dd/yyyy";
//function to convert formatted date to new Date() format
const getDefaultDate = (dateStr, format) => {
  //get valid date format for moment to convert formatted date to new Date() format
  const formats = changeDateToMomentFormat(format);
  const parsedDate = moment(dateStr, formats);
  let date;
  if (parsedDate.isValid()) {
    date = new Date(parsedDate.toISOString());
    return date;
  } else {
    date = new Date();
    return date;
  }
};
const fontOptions = [
  { value: "Fasthand" },
  { value: "Dancing Script" },
  { value: "Cedarville Cursive" },
  { value: "Delicious Handrawn" }
  // Add more font options as needed
];
function WidgetsValueModal(props) {
  const dispatch = useDispatch();
  const saveSignCheckbox = useSelector(
    (state) => state.widget.saveSignCheckbox
  );
  const defaultSignImg = useSelector((state) => state.widget.defaultSignImg);
  const myInitial = useSelector((state) => state.widget.myInitial);
  const lastWidget = useSelector((state) => state.widget.lastIndex);
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const {
    xyPosition,
    uniqueId,
    pageNumber,
    currWidgetsDetails,
    setXyPosition,
    isSave,
    setUniqueId,
    tempSignerId,
    signatureTypes,
    setCellCount,
    allowCellResize = true
  } = props;
  const [penColor, setPenColor] = useState("blue");
  const [isOptional, setIsOptional] = useState(true);
  const [isDefaultSign, setIsDefaultSign] = useState(false);
  const [isTab, setIsTab] = useState("");
  const [textWidth, setTextWidth] = useState(0);
  const [textHeight, setTextHeight] = useState(0);
  const [isSignTypes, setIsSignTypes] = useState(true);
  const [typedSignature, setTypedSignature] = useState("");
  const [selectDate, setSelectDate] = useState({});
  const [isLastWidget, setIsLastWidget] = useState(false);
  const [signature, setSignature] = useState();
  const [isImageSelect, setIsImageSelect] = useState(false);
  const [isFinish, setIsFinish] = useState(false);
  const [imgWH, setImgWH] = useState({});
  const [fontSelect, setFontSelect] = useState(fontOptions[0].value);
  const [isSavedSign, setIsSavedSign] = useState(false);
  const [isAutoSign, setIsAutoSign] = useState(false);
  const [image, setImage] = useState(null);
  const [isLoader, setIsLoader] = useState(false);
  const [hint, setHint] = useState("");
  const [isShowValidation, setIsShowValidation] = useState(false);
  const [removeBgEnabled, setRemoveBgEnabled] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const accesstoken = localStorage.getItem("accesstoken") || "";
  const senderUser = localStorage.getItem(
    `Parse/${localStorage.getItem("parseAppId")}/currentUser`
  );
  const jsonSender = senderUser && JSON.parse(senderUser);
  const currentUserName = jsonSender && jsonSender?.name;
  const widgetTypeTranslation = t(`widgets-name.${currWidgetsDetails?.type}`);
  const [widgetValue, setWidgetValue] = useState(
    currWidgetsDetails.type !== "checkbox" &&
      (currWidgetsDetails?.options?.response ||
        currWidgetsDetails?.options?.defaultValue)
  );
  const [cellsValue, setCellsValue] = useState(() => {
    const count = currWidgetsDetails?.options?.cellCount || 5;
    const val =
      currWidgetsDetails?.options?.response ||
      currWidgetsDetails?.options?.defaultValue ||
      "";
    return Array.from({ length: count }, (_, i) => val[i] || "");
  });
  const cellRefs = useRef([]);
  // keep track of the first empty cell to automatically focus it after updates
  useEffect(() => {
    const index = cellsValue.findIndex((v) => !v);
    if (index !== -1) {
      setTimeout(() => {
        cellRefs.current[index]?.focus();
      }, 0);
    }
  }, [cellsValue]);

  useEffect(() => {
    const count = currWidgetsDetails?.options?.cellCount || 5;
    const val =
      currWidgetsDetails?.options?.response ||
      currWidgetsDetails?.options?.defaultValue ||
      "";
    setCellsValue(Array.from({ length: count }, (_, i) => val[i] || ""));
  }, [currWidgetsDetails?.key, currWidgetsDetails?.options?.cellCount]);
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
      : new Date()
  );
  const allColor = ["blue", "red", "black"];
  const textInputcls =
    "op-input op-input-bordered op-input-sm focus:outline-none text-base-content hover:border-base-content w-full text-xs";
  const isTabCls = "bg-[#002864] text-white rounded-[15px] px-[10px] py-[4px]";
  useEffect(() => {
    if (
      ["name", "email", "job title", "company", textInputWidget].includes(
        currWidgetsDetails?.type
      )
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
      currWidgetsDetails?.key,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId,
      false,
      data?.format,
      currWidgetsDetails?.options?.fontSize || 12,
      currWidgetsDetails?.options?.fontColor || "black"
    );
    setSelectDate({ date: date, format: data?.format });
  };
  useEffect(() => {
    handleTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureTypes]);
  //function for image upload or update
  const onImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setOriginalImage(null); // Reset original image when a new file is selected
      setRemoveBgEnabled(false); // Optionally reset toggle
      // Ensure compressedFileSize calls setImage, which then triggers the useEffect for BG removal.
      compressedFileSize(file, setImgWH, setImage);
    }
  };
  //function is used to save image,stamp widgets data
  const handleSaveImage = () => {
    const widgetsType = currWidgetsDetails?.type;
    //`isApplyAll` is used when user edit stamp then updated signature apply all existing drawn signatures
    const isApplyAll = true;
    //check condition signyour-self or other flow
    if (uniqueId) {
      setXyPosition((prev) =>
        prev.map((signer) => {
          if (signer.Id !== uniqueId) return signer;

          // Find the placeholder index for current page
          const index = signer.placeHolder.findIndex(
            (x) => x.pageNumber === pageNumber
          );

          // Get updated placeholder list
          const updatedPlaceholders = onSaveImage(
            signer.placeHolder,
            index,
            currWidgetsDetails?.key,
            imgWH,
            image,
            isAutoSign,
            widgetsType,
            isApplyAll
          );

          return {
            ...signer,
            placeHolder: updatedPlaceholders
          };
        })
      );
    } else {
      const index = props?.xyPosition?.findIndex((object) => {
        return object.pageNumber === pageNumber;
      });
      const getImage = onSaveImage(
        props?.xyPosition,
        index,
        currWidgetsDetails?.key,
        imgWH,
        image
      );
      setXyPosition(getImage);
    }
    setIsAutoSign(false);
  };

  //function is used to save draw type or initial type signature
  const handleSaveSignature = (
    type,
    isDefaultSign,
    width,
    height,
    typedSignature
  ) => {
    //get current click widget type
    const widgetsType = currWidgetsDetails?.type;
    //if there are any width and height then it will typed signature
    const isTypeText = width && height ? true : false;
    //final getting signature url via default select sign/default initial sign/self draw sign
    const signatureImg = isDefaultSign
      ? isDefaultSign === "initials"
        ? myInitial
        : defaultSignImg
      : signature;

    let imgWH = { width: width ? width : "", height: height ? height : "" };
    setIsImageSelect(false);
    setImage();
    //set default signature image width and height
    if (isDefaultSign) {
      const img = new Image();
      img.src = defaultSignImg;
      if (img.complete) {
        imgWH = { width: img.width, height: img.height };
      }
    }
    //`isApplyAll` is used when user edit signature/initial then updated signature apply all existing drawn signatures
    const isApplyAll = true;
    if (uniqueId) {
      setXyPosition((prevState) =>
        prevState.map((signer) => {
          if (signer.Id !== uniqueId) return signer;

          const placeholderIndex = signer.placeHolder.findIndex(
            (x) => x.pageNumber === pageNumber
          );

          const updatedPlaceholders = onSaveSign(
            type,
            signer.placeHolder,
            placeholderIndex,
            currWidgetsDetails?.key,
            signatureImg,
            imgWH,
            isDefaultSign,
            isTypeText,
            typedSignature,
            isAutoSign,
            widgetsType,
            isApplyAll
          );
          return {
            ...signer,
            placeHolder: updatedPlaceholders
          };
        })
      );
    } else {
      const index = props?.xyPosition?.findIndex((object) => {
        return object.pageNumber === pageNumber;
      });
      const getUpdatePosition = onSaveSign(
        type,
        props?.xyPosition,
        index,
        currWidgetsDetails?.key,
        signatureImg,
        imgWH,
        isDefaultSign,
        isTypeText,
        typedSignature
      );
      setXyPosition(getUpdatePosition);
    }
    setIsAutoSign(false);
  };

  //function to handle allowed tab in signature pad
  function handleTab() {
    const signtypes = signatureTypes || [];
    const defaultIndex = signtypes?.findIndex(
      (x) =>
        x.name === "default" &&
        x.enabled === true &&
        defaultSignImg &&
        currWidgetsDetails?.type !== "image" &&
        currWidgetsDetails?.type !== "stamp"
    );
    const getIndex =
      defaultIndex !== -1 // Check if the default index exists
        ? defaultIndex // If found, use it
        : signtypes?.findIndex((x) => x.enabled === true);

    if (getIndex !== -1) {
      setIsSignTypes(true);
      const tab = signatureTypes?.[getIndex].name;
      if (tab === "draw") {
        setIsTab("draw");
      } else if (tab === "upload") {
        setIsImageSelect(true);
        setIsTab("uploadImage");
      } else if (tab === "typed") {
        setIsTab("type");
      } else if (tab === "default") {
        if (
          (currWidgetsDetails?.type === "initials" && myInitial) ||
          (currWidgetsDetails?.type !== "initials" && defaultSignImg)
        ) {
          setIsDefaultSign(true);
          setIsTab("mysignature");
        } else {
          setIsTab("draw");
        }
      } else {
        setIsTab(true);
      }
    } else {
      setIsSignTypes(false);
    }
  }
  function isTabEnabled(tabName) {
    const isEnabled = signatureTypes?.find((x) => x.name === tabName)?.enabled;
    return isEnabled;
  }

  //function for clear signature image
  const handleClear = () => {
    if (
      ["signature", "initials", "stamp", "image"].includes(
        currWidgetsDetails?.type
      )
    ) {
      if (canvasRef.current) {
        canvasRef.current.clear();
      }
      setImage(null);
      setOriginalImage(null); // Add this
      setRemoveBgEnabled(false); // Optionally reset toggle
      setSignature("");
      if (isTab === "type") {
        setTypedSignature("");
      }
    } else {
      if (currWidgetsDetails?.type === cellsWidget) {
        const count =
          currWidgetsDetails?.options?.cellCount || cellsValue.length || 1;
        const cleared = Array.from({ length: count }, () => "");
        setCellsValue(cleared);
        const combined = cleared.join("");
        setWidgetValue(combined);
        onChangeInput(
          combined,
          currWidgetsDetails?.key,
          xyPosition,
          props.index,
          setXyPosition,
          uniqueId
        );
      } else {
        setWidgetValue("");
        onChangeInput(
          "",
          currWidgetsDetails?.key,
          xyPosition,
          props.index,
          setXyPosition,
          uniqueId
        );
      }
    }
  };
  //function for set signature url
  const handleSignatureChange = (data) => {
    setSignature(data);
  };
  function base64StringtoFile(base64String, filename) {
    let arr = base64String.split(","),
      // type of uploaded image
      mime = arr[0].match(/:(.*?);/)[1],
      // decode base64
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const ext = mime.split("/").pop();
    const name = `${filename}.${ext}`;
    return new File([u8arr], name, { type: mime });
  }

  const uploadFile = async (file) => {
    try {
      const parseFile = new Parse.File(file.name, file);
      const response = await parseFile.save();
      if (response?.url()) {
        const fileRes = await getSecureUrl(response.url());
        if (fileRes.url) {
          const tenantId = localStorage.getItem("TenantId");
          SaveFileSize(file.size, fileRes.url, tenantId);
          return fileRes?.url;
        } else {
          alert(`${t("something-went-wrong-mssg")}`);
          return false;
        }
      } else {
        alert(`${t("something-went-wrong-mssg")}`);
        return false;
      }
    } catch (err) {
      console.log("sign upload err", err);
      alert(`${err.message}`);
      return false;
    }
  };

  // `handlesavesign` is used to save signaute, initials, stamp as a default
  const handleSaveSign = async () => {
    if (signature || image?.src) {
      setIsLoader(true);
      try {
        const User = Parse?.User?.current();
        const sanitizename = generateTitleFromFilename(User?.get("name"));
        const replaceSpace = sanitizeFileName(sanitizename);
        let file;
        if (signature) {
          file = base64StringtoFile(signature, `${replaceSpace}__sign`);
        } else {
          file = base64StringtoFile(image?.src, `${replaceSpace}__sign`);
        }
        const imageUrl = await uploadFile(file);
        const userId = {
          __type: "Pointer",
          className: "_User",
          objectId: User?.id
        };
        if (imageUrl) {
          //  below code is used to save or update default signaute, initials, stamp
          try {
            const signCls = new Parse.Object("contracts_Signature");
            if (props?.saveSignCheckbox?.signId) {
              signCls.id = props.saveSignCheckbox.signId;
            }
            if (currWidgetsDetails?.type === "initials") {
              signCls.set("Initials", imageUrl);
            } else if (currWidgetsDetails?.type === "signature") {
              signCls.set("ImageURL", imageUrl);
            }
            signCls.set("UserId", userId);
            const signRes = await signCls.save();
            if (signRes) {
              // props.saveSignCheckbox.signId;
              dispatch(
                setSaveSignCheckbox({
                  ...saveSignCheckbox,
                  signId: signRes?.id
                })
              );
              const _signRes = JSON.parse(JSON.stringify(signRes));
              if (currWidgetsDetails?.type === "signature") {
                const defaultSign = await getBase64FromUrl(
                  _signRes?.ImageURL,
                  true
                );
                dispatch(setDefaultSignImg(defaultSign));
              } else if (currWidgetsDetails?.type === "initials") {
                const defaultInitials = await getBase64FromUrl(
                  _signRes?.Initials,
                  true
                );
                dispatch(setMyInitial(defaultInitials));
              }
              alert(t("saved-successfully"));
            }
            return signRes;
          } catch (err) {
            console.log(err);
            alert(`${err.message}`);
          } finally {
            setIsLoader(false);
          }
        }
      } catch (err) {
        console.log("Err while saving signature", err);
      }
    }
  };

  const handleSaveBtn = async () => {
    if (accesstoken && isSavedSign) {
      await handleSaveSign();
      resetToDefault();
    } else {
      resetToDefault();
    }
  };
  const resetToDefault = () => {
    props?.setCurrWidgetsDetails({});
    if (!image) {
      if (isTab === "mysignature") {
        setSignature("");
        if (currWidgetsDetails?.type === "initials") {
          handleSaveSignature(isTab, "initials");
        } else {
          handleSaveSignature(null, "default");
        }
      } else {
        if (isTab === "type") {
          setSignature("");
          handleSaveSignature(
            null,
            false,
            !currWidgetsDetails?.type === "initials" && textWidth > 150
              ? 150
              : textWidth,
            !currWidgetsDetails?.type === "initials" && textHeight > 35
              ? 35
              : textHeight,
            typedSignature
          );
        } else {
          setSignature("");
          canvasRef?.current?.clear();
          handleSaveSignature(isTab);
        }
      }
      setPenColor("blue");
    } else {
      setSignature("");
      handleSaveImage();
    }
    setIsImageSelect(false);
    setIsDefaultSign(false);
    setImage();
    handleTab();
  };
  const autoSignAll = (
    <label className="mb-0 cursor-pointer flex items-center text-sm">
      <input
        className="mr-2 md:mr-3 op-checkbox op-checkbox-xs md:op-checkbox-sm"
        type="checkbox"
        value={isAutoSign}
        onChange={(e) => {
          setIsAutoSign(e.target.checked);
        }}
      />
      {t("auto-sign-mssg")}
    </label>
  );

  useEffect(() => {
    const loadFont = async () => {
      try {
        await document.fonts.load(`20px ${fontSelect}`);
        const selectFontSTyle = fontOptions.find(
          (font) => font.value === fontSelect
        );
        setFontSelect(selectFontSTyle?.value || fontOptions[0].value);
      } catch (error) {
        console.error("Error loading font:", error);
      }
    };

    loadFont();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSelect]);

  useEffect(() => {
    if (currWidgetsDetails?.options?.response) {
      const url = currWidgetsDetails?.options?.response;
      if (["signature", "initials"].includes(currWidgetsDetails?.type)) {
        if (isTab === "draw" && currWidgetsDetails?.signatureType === "draw") {
          setSignature(url);
          // Load the default signature after the component mounts
          if (canvasRef.current) {
            canvasRef.current.fromDataURL(url);
          }
        } else if (isTab === "uploadImage" && currWidgetsDetails?.ImageType) {
          setImage({ imgType: currWidgetsDetails?.ImageType, src: url });
        }
      } else if (["image", "stamp"].includes(currWidgetsDetails?.type)) {
        setImage({ imgType: currWidgetsDetails?.ImageType, src: url });
      }
    }
    if (isTab === "type") {
      const trimmedName = typedSignature
        ? typedSignature?.trim()
        : currentUserName?.trim();
      const firstCharacter = trimmedName?.charAt(0);
      const userName =
        currWidgetsDetails?.type === "initials"
          ? firstCharacter
          : typedSignature;
      const signatureValue = currWidgetsDetails?.typeSignature;
      setTypedSignature(signatureValue || userName || "");
      convertToImg(fontSelect, userName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTab]);
  // function for convert input text value in image
  const convertToImg = async (fontStyle, text, color) => {
    // 1) Read the max widget dimensions:
    const maxWidth = currWidgetsDetails.Width; // e.g. 150 px
    const maxHeight = currWidgetsDetails.Height; // e.g.  40 px

    // 2) Pick a “baseline” font size for measurement:
    const baselineFontSizePx = 40;
    const chosenFontFamily = fontStyle || fontSelect || "Fasthand";
    const fillColor = color || penColor;

    // 3) Create a temporary <span> (hidden) to measure the text at 40px:
    const span = document.createElement("span");
    span.textContent = text;
    span.style.font = `${baselineFontSizePx}px ${chosenFontFamily}`;
    span.style.visibility = "hidden"; // keep it in the DOM so offsetWidth/Height works
    span.style.whiteSpace = "nowrap"; // so we measure a single line
    document.body.appendChild(span);

    // Measured size at 40px:
    const measuredWidth = span.offsetWidth;
    const measuredHeight = span.offsetHeight;
    document.body.removeChild(span);

    // 4) Compute uniform scale so that 40px‐sized text fits inside (maxWidth × maxHeight):
    const scaleX = maxWidth / measuredWidth;
    const scaleY = maxHeight / measuredHeight;
    const scale = Math.min(scaleX, scaleY, 1); // never scale up beyond 1

    // 5) Final text size in **CSS px**:
    const finalFontSizePx = baselineFontSizePx * scale;

    // 6) Create a <canvas> that is ALWAYS maxWidth × maxHeight in **CSS px**,
    //    but use devicePixelRatio for sharpness.
    const pixelRatio = window.devicePixelRatio || 1;
    const canvas = document.createElement("canvas");

    // ★ Instead of using `finalTextWidth/Height`, force it to be the max box:
    canvas.width = Math.ceil(maxWidth * pixelRatio);
    canvas.height = Math.ceil(maxHeight * pixelRatio);

    const ctx = canvas.getContext("2d");
    ctx.scale(pixelRatio, pixelRatio);

    // 7) Draw the text **centered** inside the full maxWidth×maxHeight box:
    ctx.font = `${finalFontSizePx}px ${chosenFontFamily}`;
    ctx.fillStyle = fillColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // ★ Center = (maxWidth/2, maxHeight/2):
    const centerX = maxWidth / 2;
    const centerY = maxHeight / 2;

    ctx.fillText(text, centerX, centerY);

    // 8) Export to a PNG data-URL:
    const dataUrl = canvas.toDataURL("image/png");
    setSignature(dataUrl);
  };
  const PenColorComponent = (props) => {
    return (
      <div className="flex flex-row items-center m-[5px] gap-3">
        <span className="text-base-content">Options</span>
        {allColor.map((data, key) => {
          return (
            <i
              key={key}
              onClick={() => {
                props?.convertToImg &&
                  props?.convertToImg(fontSelect, typedSignature, data);
                setPenColor(allColor[key]);
              }}
              className={`border-b-[2px] cursor-pointer ${key === 0 && penColor === "blue" ? "border-blue-600" : key === 1 && penColor === "red" ? "border-red-500" : key === 2 && penColor === "black" ? "border-black" : "border-white"} text-[${data}] text-[16px] fa-light fa-pen-nib`}
            ></i>
          );
        })}
      </div>
    );
  };

  // `handleCancelBtn` function trigger when user click on cross button
  const handleCancelBtn = () => {
    setPenColor("blue");
    setIsImageSelect(false);
    setIsDefaultSign(false);
    setImage(null);
    setOriginalImage(null); // Add this
    setRemoveBgEnabled(false); // Add this
    handleTab();
  };

  // Effect to store original image and apply initial BG removal if enabled
  useEffect(() => {
    if (
      image?.src &&
      !originalImage &&
      (isImageSelect || ["image", "stamp"].includes(currWidgetsDetails?.type))
    ) {
      // If there's an image, and we haven't stored an original for it yet,
      // and we are in a relevant tab/widget type for uploads
      setOriginalImage(image); // Store the current image as original

      if (removeBgEnabled) {
        setIsLoader(true);
        removeBackground(image.src)
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImage({ src: reader.result, imgType: blob.type });
            };
            reader.onerror = () => {
              console.error(
                "Error converting blob to data URL after BG removal."
              );
              // setImage(image); // Already original if error
            };
            reader.readAsDataURL(blob);
          })
          .catch((error) => {
            console.error("Error removing background:", error);
            // setImage(image); // Already original if error
          })
          .finally(() => setIsLoader(false));
      }
    }
  }, [
    image,
    originalImage,
    removeBgEnabled,
    isImageSelect,
    currWidgetsDetails?.type,
    setIsLoader,
    setImage,
    setOriginalImage
  ]);

  // Effect for toggling BG removal ON/OFF
  useEffect(() => {
    if (
      !originalImage?.src ||
      !(isImageSelect || ["image", "stamp"].includes(currWidgetsDetails?.type))
    ) {
      // No original image to process or not in a relevant upload state
      return;
    }

    if (removeBgEnabled) {
      // removeBgEnabled is true
      // Only process if current image is the original (BG not yet removed or was reverted)
      if (image?.src === originalImage.src) {
        setIsLoader(true);
        removeBackground(originalImage.src)
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImage({ src: reader.result, imgType: blob.type });
            };
            reader.onerror = () => {
              console.error("Error converting blob to data URL for toggle ON.");
              setImage(originalImage); // Fallback
            };
            reader.readAsDataURL(blob);
          })
          .catch((error) => {
            console.error("Error removing background for toggle ON:", error);
            setImage(originalImage); // Fallback
          })
          .finally(() => setIsLoader(false));
      }
    } else {
      // removeBgEnabled is false, revert to originalImage
      if (image?.src !== originalImage.src) {
        setImage(originalImage);
      }
    }
  }, [
    removeBgEnabled,
    originalImage,
    image,
    isImageSelect,
    currWidgetsDetails?.type,
    setImage,
    setIsLoader
  ]);

  const savesigncheckbox = (
    <label className="cursor-pointer flex items-center mb-0 text-center text-sm">
      <input
        className="mr-2 md:mr-3 op-checkbox op-checkbox-xs md:op-checkbox-sm"
        type="checkbox"
        checked={isSavedSign}
        onChange={(e) => setIsSavedSign(e.target.checked)}
      />
      {t("save")} {currWidgetsDetails?.type}
    </label>
  );
  //function for set checked and unchecked value of checkbox
  const handleCheckboxValue = (isChecked, ind) => {
    let updateSelectedCheckbox = [],
      checkedList;
    updateSelectedCheckbox = selectedCheckbox ? [...selectedCheckbox] : [];

    //if user select any option then add selected option
    if (isChecked) {
      updateSelectedCheckbox.push(ind);
      setSelectedCheckbox(updateSelectedCheckbox);
    } else {
      //else user unselect any option then remove that option
      checkedList = selectedCheckbox?.filter((data) => data !== ind);
      setSelectedCheckbox([...checkedList]);
    }
    onChangeInput(
      checkedList ? checkedList : updateSelectedCheckbox,
      currWidgetsDetails?.key,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId,
      false
    );
  };

  const handleRadioCheck = (data) => {
    return widgetValue === data;
  };

  //function to handle select radio widget and set value seletced by user
  const handleCheckRadio = (data) => {
    setWidgetValue(data);
    onChangeInput(
      data,
      currWidgetsDetails?.key,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId,
      false
    );
  };
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      style={{
        fontFamily: "Arial, sans-serif"
      }}
      // className={`${selectWidgetCls} overflow-hidden`}
      onClick={onClick}
      ref={ref}
    >
      {value}
      <i className="fa-light fa-calendar ml-[5px]"></i>
    </div>
  ));
  ExampleCustomInput.displayName = "ExampleCustomInput";
  //function to set onchange date
  const handleOnDateChange = (date) => {
    setStartDate(date);
  };
  const handleOnchangeTextBox = (e) => {
    // hide any prior validation error while typing
    setIsShowValidation(false);
    setWidgetValue(e.target.value);
    onChangeInput(
      e.target.value,
      currWidgetsDetails?.key,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId
    );
  };
  const updateCells = (updated) => {
    setCellsValue(updated);
    const combined = updated.join("");
    setWidgetValue(combined);
    props.setCurrWidgetsDetails?.((prev) =>
      prev && prev.key === currWidgetsDetails?.key
        ? { ...prev, options: { ...prev.options, response: combined } }
        : prev
    );
    onChangeInput(
      combined,
      currWidgetsDetails?.key,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId
    );
  };

  const handleCellsInput = (e, idx) => {
    setIsShowValidation(false);
    const val = e.target.value.slice(0, 1);
    const updated = [...cellsValue];
    updated[idx] = val;
    updateCells(updated);
  };
  const handleCellsKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !cellsValue[idx] && idx > 0) {
      e.preventDefault();
      cellRefs.current[idx - 1]?.focus();
    }
  };

  const handleCellResize = (newCount) => {
    let updated = [...cellsValue];
    if (newCount > updated.length) {
      updated = [...updated, ...Array(newCount - updated.length).fill("")];
    } else if (newCount < updated.length) {
      updated = updated.slice(0, newCount);
    }
    cellRefs.current = cellRefs.current.slice(0, newCount);
    updateCells(updated);
    setCellCount?.(currWidgetsDetails?.key, newCount);
  };

  // when focus leaves the cells widget, validate the input
  const handleCellsBlur = (e, idx) => {
    handleInputBlur();
  };
  //function is used to show widgets on modal according to selected widget type checkbox/date/radio/drodown/textbox/signature/image
  const getWidgetType = (type) => {
    switch (type) {
      case "image":
      case "initials":
      case "stamp":
      case "signature":
        return (
          <div className="flex flex-col">
            {isLoader && (
              <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-base-content/30 z-50">
                <Loader />
              </div>
            )}
            {isSignTypes ? (
              <>
                {currWidgetsDetails?.type !== "stamp" &&
                  currWidgetsDetails?.type !== "image" && (
                    <div className="text-base-content rounded-[4px] tabWidth">
                      <div className="ml-3 flex justify-start gap-4 text-[11px] md:text-base my-[3px]">
                        <>
                          {currWidgetsDetails?.type !== "initials" &&
                          defaultSignImg &&
                          isTabEnabled("default") ? (
                            <div>
                              <span
                                onClick={() => {
                                  setIsDefaultSign(true);
                                  setIsImageSelect(true);
                                  setIsTab("mysignature");
                                  setImage();
                                }}
                                className={`${
                                  isTab === "mysignature" && `${isTabCls}`
                                } ml-[2px] cursor-pointer`}
                              >
                                {t("my-signature")}
                              </span>
                            </div>
                          ) : (
                            currWidgetsDetails?.type === "initials" &&
                            myInitial &&
                            isTabEnabled("default") && (
                              <div>
                                <span
                                  onClick={() => {
                                    setIsDefaultSign(true);
                                    setIsImageSelect(true);
                                    setIsTab("mysignature");
                                    setImage();
                                  }}
                                  className={`${
                                    isTab === "mysignature" && `${isTabCls}`
                                  }   ml-[2px] cursor-pointer`}
                                >
                                  {t("my-initials")}
                                </span>
                              </div>
                            )
                          )}
                          {isTabEnabled("draw") && (
                            <div>
                              <span
                                onClick={() => {
                                  setIsDefaultSign(false);
                                  setIsImageSelect(false);
                                  setIsTab("draw");
                                  setImage();
                                  setSignature("");
                                }}
                                className={`${
                                  isTab === "draw" && `${isTabCls}`
                                }   ml-[2px] cursor-pointer`}
                              >
                                {t("draw")}
                              </span>
                            </div>
                          )}
                          {isTabEnabled("upload") && (
                            <div>
                              <span
                                onClick={() => {
                                  setIsDefaultSign(false);
                                  setIsImageSelect(true);
                                  setIsTab("uploadImage");
                                }}
                                className={`${
                                  isTab === "uploadImage" && `${isTabCls}`
                                }  ml-[2px] cursor-pointer`}
                              >
                                {t("upload-image")}
                              </span>
                            </div>
                          )}
                          {isTabEnabled("typed") && (
                            <div>
                              <span
                                onClick={() => {
                                  setIsDefaultSign(false);
                                  setIsImageSelect(false);
                                  setIsTab("type");
                                  setImage();
                                }}
                                className={`${
                                  isTab === "type" && `${isTabCls}`
                                } ml-[2px] cursor-pointer`}
                              >
                                {t("type")}
                              </span>
                            </div>
                          )}
                        </>
                      </div>
                    </div>
                  )}
                <div
                  className={`${
                    currWidgetsDetails?.type === "stamp" ||
                    currWidgetsDetails?.type === "image"
                      ? ""
                      : "mt-3"
                  } h-full`}
                >
                  {isDefaultSign ? (
                    <>
                      {currWidgetsDetails?.type !== "initials" &&
                        defaultSignImg &&
                        isTabEnabled("default") && (
                          <>
                            <div className="flex justify-center">
                              <div
                                className={`${currWidgetsDetails?.type === "initials" ? "intialSignatureCanvas" : "signatureCanvas"} border-[1.3px] border-gray-300 rounded-[4px] flex flex-col justify-center items-center mb-[6px] cursor-pointer`}
                              >
                                <img
                                  alt="stamp img"
                                  className="w-full h-full object-contain"
                                  draggable="false"
                                  src={
                                    currWidgetsDetails?.type === "initials"
                                      ? myInitial
                                      : defaultSignImg
                                  }
                                />
                              </div>
                            </div>
                            {/* Standalone autoSignAll for "My Signature/Initials" (isDefaultSign) if conditions met */}
                            {setIsAutoSign && uniqueId && (
                              <div className="flex justify-center my-2">
                                {autoSignAll}
                              </div>
                            )}
                          </>
                        )}

                      {currWidgetsDetails?.type === "initials" &&
                        myInitial &&
                        isTabEnabled("default") && (
                          <>
                            <div className="flex justify-center">
                              <div
                                className={`${currWidgetsDetails?.type === "initials" ? "intialSignatureCanvas" : "signatureCanvas"} bg-white border-[1.3px] border-gray-300 flex flex-col justify-center items-center mb-[6px] cursor-pointer`}
                              >
                                <img
                                  alt="stamp img"
                                  className="w-full h-full object-contain bg-white"
                                  draggable="false"
                                  src={
                                    currWidgetsDetails?.type === "initials"
                                      ? myInitial
                                      : defaultSignImg
                                  }
                                />
                              </div>
                            </div>
                            {/* Standalone autoSignAll for "My Signature/Initials" (isDefaultSign) if conditions met */}
                            {setIsAutoSign && uniqueId && (
                              <div className="flex justify-center my-2">
                                {autoSignAll}
                              </div>
                            )}
                          </>
                        )}
                    </>
                  ) : isImageSelect ||
                    currWidgetsDetails?.type === "stamp" ||
                    currWidgetsDetails?.type === "image" ? (
                    !image ? (
                      <div className="flex justify-center">
                        <div
                          className={`${currWidgetsDetails?.type === "initials" ? "intialSignatureCanvas" : "signatureCanvas"} bg-white border-[1.3px] border-gray-300 flex flex-col justify-center items-center mb-[6px] cursor-pointer`}
                          onClick={() => imageRef.current.click()}
                        >
                          <input
                            type="file"
                            onChange={onImageChange}
                            className="filetype"
                            accept="image/png,image/jpeg"
                            ref={imageRef}
                            hidden
                          />
                          <i className="fa-light fa-cloud-upload-alt uploadImgLogo"></i>
                          <div className="text-[10px]">{t("upload")}</div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-center">
                          <div
                            className={`${currWidgetsDetails?.type === "initials" ? "intialSignatureCanvas" : "signatureCanvas"} bg-white border-[1.3px] border-gray-300 mb-[6px] overflow-hidden`}
                          >
                            <img
                              alt="print img"
                              ref={imageRef}
                              src={image.src}
                              draggable="false"
                              className="object-contain h-full w-full"
                            />
                          </div>
                        </div>
                        {/* Shared container for autoSignAll and removeBackground when image is displayed for upload/stamp/image */}
                        {((setIsAutoSign && uniqueId) ||
                          (image &&
                            (isImageSelect ||
                              ["image", "stamp"].includes(
                                currWidgetsDetails?.type
                              )))) && (
                          <div className="flex justify-center items-center gap-x-2 my-2">
                            {setIsAutoSign && uniqueId && autoSignAll}
                            {image &&
                              (isImageSelect ||
                                ["image", "stamp"].includes(
                                  currWidgetsDetails?.type
                                )) && (
                                <label
                                  htmlFor={`removeBgToggleModal-${currWidgetsDetails?.key}`}
                                  className="mb-0 cursor-pointer flex items-center text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    id={`removeBgToggleModal-${currWidgetsDetails?.key}`} // Unique ID
                                    className="mr-2 op-checkbox op-checkbox-xs md:op-checkbox-sm"
                                    checked={removeBgEnabled}
                                    onChange={() =>
                                      setRemoveBgEnabled(!removeBgEnabled)
                                    }
                                  />
                                  {t("remove-background")}
                                </label>
                              )}
                          </div>
                        )}
                        <div className="flex justify-end"></div>
                      </>
                    )
                  ) : isTab === "type" ? (
                    <>
                      <div className="flex justify-between items-center tabWidth">
                        <span className="mr-[5px] text-[12px]">
                          {currWidgetsDetails?.type === "initials"
                            ? t("initial-teb")
                            : t("signature-tab")}
                          :
                        </span>
                        <input
                          maxLength={
                            currWidgetsDetails?.type === "initials" ? 3 : 30
                          }
                          style={{ fontFamily: fontSelect, color: penColor }}
                          type="text"
                          className="ml-1 op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-[20px]"
                          placeholder={
                            currWidgetsDetails?.type === "initials"
                              ? t("initial-type")
                              : t("signature-type")
                          }
                          value={typedSignature}
                          onChange={(e) => {
                            setTypedSignature(e.target.value);
                            convertToImg(fontSelect, e.target.value);
                          }}
                        />
                      </div>
                      <div className="border-[1px] border-[#d6d3d3] mt-[10px] ml-[5px]">
                        {fontOptions.map((font, ind) => {
                          return (
                            <div
                              key={ind}
                              style={{
                                cursor: "pointer",
                                fontFamily: font.value,
                                backgroundColor:
                                  fontSelect === font.value &&
                                  "rgb(206 225 247)"
                              }}
                              onClick={() => {
                                setFontSelect(font.value);
                                convertToImg(font.value, typedSignature);
                              }}
                            >
                              <div
                                className="py-[5px] px-[10px] text-[20px]"
                                style={{ color: penColor }}
                              >
                                {typedSignature
                                  ? typedSignature
                                  : "Your signature"}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-row justify-between mt-[10px]">
                        <PenColorComponent />
                      </div>
                      <div className="flex flex-row ml-1 mt-2 gap-x-3 text-base-content">
                        {/* Standalone autoSignAll for "Type" tab if conditions met */}
                        {setIsAutoSign && uniqueId && (
                          <div className="flex justify-start my-1">
                            {autoSignAll}
                          </div>
                        )}
                        {accesstoken && (
                          <div className="flex justify-start my-1">
                            {saveSignCheckbox?.isVisible && savesigncheckbox}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    // This is the "Draw" tab
                    <>
                      <div className="flex justify-center">
                        <SignatureCanvas
                          ref={canvasRef}
                          penColor={penColor}
                          canvasProps={{
                            className: `${currWidgetsDetails?.type === "initials" ? "intialSignatureCanvas" : "signatureCanvas"} border-[1.3px] border-gray-300 rounded-[4px]`
                          }}
                          onEnd={() =>
                            handleSignatureChange(
                              canvasRef.current?.toDataURL()
                            )
                          }
                          dotSize={1}
                        />
                      </div>

                      <div className="flex flex-row justify-between mt-[10px]">
                        <PenColorComponent />
                      </div>
                      <div className="flex flex-row ml-1 mt-1 gap-x-3 text-base-content">
                        {/* Standalone autoSignAll for "Draw" tab if conditions met */}
                        {setIsAutoSign && uniqueId && (
                          <div className="flex justify-start my-1">
                            {autoSignAll}
                          </div>
                        )}
                        {accesstoken && (
                          <div className="flex justify-start my-1">
                            {saveSignCheckbox?.isVisible && savesigncheckbox}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="mx-3 mb-6 mt-3">
                <p>{t("at-least-one-signature-type")}</p>
              </div>
            )}
          </div>
        );
      case "checkbox":
        const checkBoxLayout =
          currWidgetsDetails?.options?.layout || "vertical";
        const isMultipleCheckbox =
          currWidgetsDetails?.options?.values?.length > 0 ? true : false;
        const checkBoxWrapperClass = `flex items-start ${
          checkBoxLayout === "horizontal"
            ? `flex-row flex-wrap ${isMultipleCheckbox ? "gap-x-2" : ""}`
            : `flex-col ${isMultipleCheckbox ? "gap-y-[5px]" : ""}`
        }`; // Using gap-y-1 for consistency, adjust if needed

        return (
          <div
            className={`border-[1px] border-gray-300 rounded-[2px] pt-1 px-2.5 ${checkBoxWrapperClass}`}
          >
            {currWidgetsDetails?.options?.values?.map((data, ind) => (
              <div key={ind} className="text-base-content select-none-cls">
                <label
                  htmlFor={`checkbox-${currWidgetsDetails?.key + ind}`}
                  className="text-xs flex items-center gap-1"
                >
                  <input
                    id={`checkbox-${currWidgetsDetails?.key + ind}`}
                    className={`${
                      ind === 0 ? "mt-0" : "mt-[5px]"
                    } op-checkbox op-checkbox-xs rounded-[1px] mt-1`}
                    type="checkbox"
                    checked={!!selectCheckbox(ind, selectedCheckbox)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const maxRequired =
                          currWidgetsDetails?.options?.validation
                            ?.maxRequiredCount;
                        const maxCountInt =
                          maxRequired && parseInt(maxRequired);
                        if (maxCountInt > 0) {
                          if (
                            selectedCheckbox &&
                            selectedCheckbox?.length <= maxCountInt - 1
                          ) {
                            handleCheckboxValue(e.target.checked, ind);
                          }
                        } else {
                          handleCheckboxValue(e.target.checked, ind);
                        }
                      } else {
                        handleCheckboxValue(e.target.checked, ind);
                      }
                    }}
                  />
                  {data}
                </label>
              </div>
            ))}
          </div>
        );
      case textInputWidget:
        return (
          <input
            placeholder={hint || t("widgets-name.text")}
            value={widgetValue ?? ""} // ensures it's always a string
            onBlur={handleInputBlur}
            onChange={(e) => handleOnchangeTextBox(e)}
            className={textInputcls}
          />
        );
      case cellsWidget:
        return (
          <CellsWidget
            isEnabled={true}
            count={cellsValue.length}
            height="100%"
            value={cellsValue.join("")}
            editable={true}
            resizable={allowCellResize}
            onChange={handleCellsInput}
            onKeyDown={handleCellsKeyDown}
            onBlur={handleCellsBlur}
            onCellCountChange={allowCellResize ? handleCellResize : undefined}
            inputRefs={cellRefs}
            hint={hint}
          />
        );
      case "dropdown":
        return (
          <select
            className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
            id="myDropdown"
            value={widgetValue}
            onChange={(e) => handleOnchangeTextBox(e)}
          >
            {/* Default/Title option */}
            <option
              // style={{ fontSize: fontSize, color: fontColor }}
              value=""
              disabled
              hidden
            >
              {currWidgetsDetails?.options?.name}
            </option>
            {currWidgetsDetails?.options?.values?.map((data, ind) => (
              <option key={ind} value={data}>
                {data}
              </option>
            ))}
          </select>
        );
      case "name":
        return (
          <input
            type="text"
            placeholder={hint || widgetTypeTranslation}
            value={widgetValue}
            onBlur={handleInputBlur}
            onChange={(e) => handleOnchangeTextBox(e)}
            className={textInputcls}
          />
        );
      case "company":
        return (
          <input
            placeholder={hint || widgetTypeTranslation}
            value={widgetValue}
            type="text"
            onBlur={handleInputBlur}
            onChange={(e) => handleOnchangeTextBox(e)}
            className={textInputcls}
          />
        );
      case "job title":
        return (
          <input
            type="text"
            onBlur={handleInputBlur}
            placeholder={hint || widgetTypeTranslation}
            value={widgetValue}
            onChange={(e) => handleOnchangeTextBox(e)}
            className={textInputcls}
          />
        );
      case "date":
        return (
          <div
            className={`border-[1px] text-base-content data-[theme=opensigndark]:border-base-content data-[theme=opensigncss]:border-gray-300 rounded-[2px] p-1 px-3`}
          >
            <DatePicker
              renderCustomHeader={({ date, changeYear, changeMonth }) => (
                <div className="flex justify-start ml-2 ">
                  <select
                    className="bg-transparent outline-none"
                    value={months[getMonth(date)]}
                    onChange={({ target: { value } }) =>
                      changeMonth(months.indexOf(value))
                    }
                  >
                    {months.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    className="bg-transparent outline-none"
                    value={getYear(date)}
                    onChange={({ target: { value } }) => changeYear(value)}
                  >
                    {years.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              closeOnScroll={true}
              selected={startDate}
              onChange={(date) => handleOnDateChange(date)}
              popperPlacement="top-end"
              customInput={<ExampleCustomInput />}
              dateFormat={
                selectDate
                  ? selectDate?.format
                  : currWidgetsDetails?.options?.validation?.format
                    ? currWidgetsDetails?.options?.validation?.format
                    : "MM/dd/yyyy"
              }
              portalId="root-portal"
            />
          </div>
        );
      case "email":
        return (
          <>
            <input
              type="email"
              onBlur={handleInputBlur}
              placeholder={hint || widgetTypeTranslation}
              value={widgetValue}
              onChange={(e) => handleOnchangeTextBox(e)}
              className={textInputcls}
            />
          </>
        );
      case radioButtonWidget:
        const radioLayout = currWidgetsDetails.options?.layout || "vertical";
        const isOnlyOneBtn =
          currWidgetsDetails.options?.values?.length > 0 ? true : false;
        const radioWrapperClass = `flex items-start ${
          radioLayout === "horizontal"
            ? `flex-row flex-wrap ${isOnlyOneBtn ? "gap-x-2" : ""}`
            : `flex-col ${isOnlyOneBtn ? "gap-y-[5px]" : ""}`
        }`; // Using gap-y-1 for consistency, adjust if needed
        return (
          <div
            className={`border-[1px] border-gray-300 rounded-[2px] pt-1 px-2.5 ${radioWrapperClass}`}
          >
            {currWidgetsDetails?.options?.values.map((data, ind) => (
              <div key={ind} className="text-base-content select-none-cls">
                <label
                  htmlFor={`radio-${currWidgetsDetails?.key + ind}`}
                  className="cursor-pointer flex items-center text-sm gap-1"
                >
                  <input
                    id={`radio-${currWidgetsDetails?.key + ind}`}
                    className={`op-radio op-radio-xs mt-1`}
                    type="radio"
                    value={data}
                    checked={handleRadioCheck(data)}
                    onChange={(e) => {
                      handleCheckRadio(e.target.value);
                    }}
                  />
                  <span>{data}</span>
                </label>
              </div>
            ))}
          </div>
        );
      case textWidget:
        return (
          <input
            type="text"
            placeholder={t("widgets-name.text")}
            value={widgetValue ?? ""} //use an empty string "" as a default
            onChange={(e) => handleOnchangeTextBox(e)}
            className={textInputcls}
          />
        );
      default:
        return (
          <input
            placeholder={t("widgets-name.text")}
            readOnly
            className={textInputcls}
          />
        );
    }
  };

  //function is used to check current widget is required or optional
  const handleCheckOptional = () => {
    let isRequired = false;
    const isCheckBox =
      !currWidgetsDetails.options?.isReadOnly &&
      currWidgetsDetails.type === "checkbox";
    const isRadio =
      !currWidgetsDetails?.options?.isReadOnly &&
      currWidgetsDetails?.type === radioButtonWidget;
    if (isCheckBox) {
      //get minimum required count if  exist
      const minCount =
        currWidgetsDetails?.options?.validation?.minRequiredCount;
      const parseMin = minCount && parseInt(minCount);
      if (parseMin > 0) {
        isRequired = true;
      }
    } else {
      isRequired = currWidgetsDetails.options?.status === "required";
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
        .filter((widget) => !widget.options?.isReadOnly)
        .map((widget) => ({
          widget,
          pageNumber: page.pageNumber
        }))
    );
    let totalWidget = 0;
    let alreadyValue = 0;
    widgetsPosition?.forEach((page) => {
      page.pos.forEach((field) => {
        if (!field?.options?.isReadOnly) {
          const isValueExist =
            field.options?.response || field.options?.defaultValue;
          totalWidget++;
          if (isValueExist) {
            alreadyValue++;
          }
        }
      });
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
      <span className="text-center text-[12px]">
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
  const handleInputBlur = () => {
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
  //function too use on click on next/finish button then update modal UI according to current widgets
  const handleClickOnNext = (isFinishDoc) => {
    if (
      ["signature", "stamp", "image", "initials"].includes(
        currWidgetsDetails?.type
      ) &&
      (signature || image || myInitial || defaultSignImg)
    ) {
      //function to save all type draw or image
      handleSaveBtn();
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
      let nextWidgetDetails = null;
      const editableWidgets = widgetsPosition?.placeHolder.flatMap((page) =>
        page.pos
          .filter((widget) => !widget.options?.isReadOnly)
          .map((widget) => ({
            widget,
            pageNumber: page.pageNumber
          }))
      );
      //get current index of widget
      const currentIndex = editableWidgets.findIndex(
        (item) =>
          item.widget.key === currWidgetsDetails?.key &&
          item.pageNumber === pageNumber
      );
      //get totoal widget length
      const totalItems = editableWidgets?.length;
      //get last widget index ex- arr=[1,2,3] curr=2, then last will be 1
      const lastIndex = (currentIndex + totalItems - 1) % totalItems;
      //set last widget details for iteration ex- arr=[1,2,3] curr=2 last=1 then ite= 2,3,1 on last we will finish document
      if (!lastWidget) {
        const lastWidgetKey = editableWidgets[lastIndex]?.widget?.key;
        dispatch(setLastIndex(lastWidgetKey));
      }

      //get next widgets index number ex-  arr=[1,2,3] curr=3 last=2 then next=1
      let index = (currentIndex + 1) % totalItems;
      const nextItem = editableWidgets[index];
      if (nextItem && !nextItem.widget.options?.isReadOnly) {
        const nextCurrentValue = nextItem.widget;
        const nextPageNumber = nextItem.pageNumber;
        props.setPageNumber(nextPageNumber);
        nextWidgetDetails = nextCurrentValue;
      }

      dispatch(setIsShowModal({ [nextWidgetDetails?.key]: true }));
      props.setCurrWidgetsDetails(nextWidgetDetails);
    }
  };
  //function is used to disable/enable save button
  const handleDisable = () => {
    if (!isShowValidation) {
      if (isOptional && uniqueId) {
        return false;
      } else if (
        ["signature", "stamp", "image", "initials"].includes(
          currWidgetsDetails?.type
        )
      ) {
        if (
          ((currWidgetsDetails?.type === "stamp" ||
            currWidgetsDetails?.type === "image") &&
            image) ||
          (isTab === "draw" && signature) ||
          (isTab === "uploadImage" && (signature || image)) ||
          (isTab === "image" && image) ||
          (isTab === "mysignature" && defaultSignImg) ||
          (isTab === "type" && typedSignature)
        ) {
          return false;
        } else {
          return true;
        }
      } else if (
        currWidgetsDetails?.type === "checkbox" &&
        selectedCheckbox?.length > 0
      ) {
        return false;
      } else if (widgetValue) {
        return false;
      } else {
        return true;
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
    if (currWidgetsDetails?.type === textWidget && uniqueId) {
      setUniqueId(tempSignerId);
    }
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
        .filter((widget) => !widget.options?.isReadOnly)
        .map((widget) => widget)
    );
    const getcurrentwidget = editableWidgets?.find(
      (data) => data?.key === currWidgetsDetails?.key
    );
    if (getcurrentwidget?.options?.response) {
      props?.setCurrWidgetsDetails(getcurrentwidget);
    }
    let isResponse = true;
    //condition to check all required widgets have response or not then show finish buutton
    for (const data of editableWidgets) {
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
        data.options?.status === "required"
      ) {
        isResponse = false;
        break;
      }
    }
    if (isResponse) {
      setIsLastWidget(true);
    }
  };
  return (
    <>
      <ModalUi
        isOpen={true}
        handleClose={() => handleclose()}
        position="bottom"
      >
        <div className="h-[100%] p-[18px]">
          {isFinish ? (
            <>
              <div className="p-1 mt-3">
                <span className="text-base">{t("finish-mssg")}</span>
              </div>
              <div className="flex gap-3 items-center mt-4">
                <button
                  type="button"
                  className="op-btn op-btn-primary op-btn-sm px-4"
                  onClick={() => {
                    handleFinish();
                  }}
                >
                  {t("finish")}
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
                    {currWidgetsDetails?.options?.name || widgetTypeTranslation}
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
                {!["checkbox", "dropdown", "date", "radio"].includes(
                  currWidgetsDetails?.type
                ) ? (
                  <button
                    type="button"
                    className="op-btn op-btn-ghost op-btn-sm text-base-content mr-1"
                    onClick={() => handleClear()}
                  >
                    {t("clear")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="op-btn op-btn-ghost op-btn-sm mr-1 cursor-default"
                  ></button>
                )}
                <div className="flex items-center gap-2">
                  {!isSave && <HandleRequiredField />}
                  {isSave ? (
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm"
                      onClick={() => {
                        handleClickOnNext();
                      }}
                      disabled={handleDisable()}
                    >
                      {t("save")}
                    </button>
                  ) : isLastWidget ? (
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm"
                      disabled={handleDisable()}
                      onClick={() => {
                        const isFinishDoc = true;
                        handleClickOnNext(isFinishDoc);
                      }}
                    >
                      {t("finish")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="op-btn op-btn-primary op-btn-sm text-xs md:text-sm"
                      onClick={() => {
                        handleClickOnNext();
                      }}
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
