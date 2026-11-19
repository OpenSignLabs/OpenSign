import { onChangeInput, cellsWidget, drawWidget } from "../../constant/Utils";
import { saveToMySign } from "../../utils";
import {
  setSaveSignCheckbox, setDefaultSignImg, setMyInitial, setMyStamp
} from "../../redux/reducers/widgetSlice";

/** Create signature pad, reset, and save-to-account callbacks. */
export function createSignatureActions(context) {
  const {
    currWidgetsDetails, signatureTypes, defaultSignImg, signatureResponse,
    setIsSignTypes, setIsTab, setIsImageSelect, myInitial, myStamp, canvasRef,
    setImage, setOriginalImage, setRemoveBgEnabled, setSignature, isTab,
    setTypedSignature, setWidgetValue, xyPosition, props, setXyPosition,
    uniqueId, setSelectedCheckbox, setStartDate, signature, image, setIsLoader,
    mysign, dispatch, t, accesstoken, isSavedSign, handlePenColor,
    handleSaveImage, handleSaveSignature, textWidth, textHeight, typedSignature,
    setIsAutoSign, isAutoSign
  } = context;
  //function to handle allowed tab in signature pad
  function handleTab() {
    if (["signature", "initials"].includes(currWidgetsDetails.type)) {
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
        const previousWidgetRes = signatureResponse.find(
          (item) => item.type === currWidgetsDetails?.type
        );
        if (
          previousWidgetRes?.tab &&
          previousWidgetRes?.type === currWidgetsDetails?.type
        ) {
          setIsTab(previousWidgetRes?.tab || "draw");
        } else if (currWidgetsDetails?.signatureType) {
          setIsTab(currWidgetsDetails?.signatureType);
        } else if (tab === "draw") {
          setIsTab("draw");
        } else if (tab === "upload") {
          setIsImageSelect(true);
          setIsTab("image");
        } else if (tab === "typed") {
          setIsTab("type");
        } else if (tab === "default") {
          if (currWidgetsDetails?.type !== "initials" && defaultSignImg) {
            setIsTab("mysignature");
          } else if (currWidgetsDetails?.type === "initials" && myInitial) {
            setIsTab("myinitials");
          } else {
            setIsTab("draw");
          }
        }
      } else {
        setIsSignTypes(false);
      }
    } else if (currWidgetsDetails?.type === "image") {
      setIsTab("image");
    } else if (currWidgetsDetails?.type === "stamp") {
      const previousWidgetRes = signatureResponse.find(
        (item) => item.type === currWidgetsDetails?.type
      );
      if (previousWidgetRes?.tab === "uploadStamp") {
        setIsTab("uploadStamp");
      } else if (myStamp) {
        setIsTab("myStamp");
      } else {
        setIsTab("uploadStamp");
      }
    }
  }
  function isTabEnabled(tabName) {
    const isEnabled = signatureTypes?.find((x) => x.name === tabName)?.enabled;
    return isEnabled;
  }

  //function for clear signature image
  const handleClear = () => {
    if (
      ["signature", "initials", "stamp", "image", drawWidget].includes(
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
        setWidgetValue("");
        onChangeInput(
          "",
          currWidgetsDetails,
          xyPosition,
          props.index,
          setXyPosition,
          uniqueId
        );
      } else {
        setSelectedCheckbox([]);
        setWidgetValue("");
        setStartDate("");
        onChangeInput(
          "",
          currWidgetsDetails,
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
  // `handleSaveToMySign` is used to save signature, initials, stamp as a default
  const handleSaveToMySign = async () => {
    if (signature || image?.src) {
      setIsLoader(true);
      try {
        const mySignRes = await saveToMySign({
          type: currWidgetsDetails?.type,
          base64: signature || image?.src,
          defaultSignId: mysign?.signId
        });
        if (mysign?.signId) {
          dispatch(setSaveSignCheckbox({ ...mysign, signId: mySignRes?.id }));
        }
        if (currWidgetsDetails?.type === "signature") {
          dispatch(setDefaultSignImg(mySignRes.base64File));
        } else if (currWidgetsDetails?.type === "initials") {
          dispatch(setMyInitial(mySignRes.base64File));
        } else if (currWidgetsDetails?.type === "stamp") {
          dispatch(setMyStamp(mySignRes.base64File));
        }
        alert(t("saved-successfully"));
      } catch (error) {
        console.log("error while save to my sign", error?.message);
        alert(`${error.message}`);
      } finally {
        setIsLoader(false);
      }
    }
  };

  const handleSaveBtn = async () => {
    // if User checked save signature or save initials checkbox
    if (accesstoken && isSavedSign) {
      await handleSaveToMySign();
    }
    resetToDefault();
  };
  const resetToDefault = () => {
    props?.setCurrWidgetsDetails({});
    if (
      isTab !== "image" &&
      !["stamp", "image"].includes(currWidgetsDetails?.type)
    ) {
      if (isTab === "myStamp" && myStamp) {
        handleSaveImage();
      } else if (isTab === "mysignature") {
        setSignature("");
        handleSaveSignature(null, "default");
      } else if (currWidgetsDetails?.type === "initials") {
        if (myInitial && isTab === "myinitials") {
          handleSaveSignature(isTab, "myinitials");
        } else if (isTab === "type") {
          handleSaveSignature(
            "type",
            false,
            textWidth,
            textHeight,
            typedSignature
          );
        } else {
          handleSaveSignature(isTab);
        }
      } else if (isTab === "type") {
        setSignature("");
        handleSaveSignature(
          "type",
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
        const tab = isTab;
        handleSaveSignature(tab);
      }
      handlePenColor();
    } else {
      setSignature("");
      handleSaveImage("image");
    }
    setIsImageSelect(false);
    setImage();
    handleTab();
  };
  const autoSignAll = (
    <label className="mb-0 cursor-pointer flex items-center text-sm text-base-content">
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

  return {
    handleTab, isTabEnabled, handleClear, handleSignatureChange, handleSaveToMySign,
    handleSaveBtn, resetToDefault, autoSignAll
  };
}
