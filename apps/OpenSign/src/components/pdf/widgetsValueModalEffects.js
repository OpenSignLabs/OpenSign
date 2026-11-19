import { useEffect } from "react";
import { removeBackground } from "@imgly/background-removal";
import { getBase64FromUrl, convertTextToImg, drawWidget } from "../../constant/Utils";
import { setTypedSignFont } from "../../redux/reducers/widgetSlice";
import { getInitials, isValidBase64 } from "../../utils";

/** Manage signature previews, font loading, and uploaded image effects. */
export function useSignatureEffects(context) {
  const {
    typedSignFont, fontSelect, setFontSelect, fontOptions, handleWidgetsResponse: _unused,
    currWidgetsDetails, signatureResponse, canvasRef, isSignOrInitials, isTab,
    setSignature, setImage, isImageOrStamp, xyPosition, uniqueId, prefillImg,
    previousWidgetRes: _unusedPrevious, currentUserName, kiosk_signer, props,
    typedSignature, setTypedSignature, setTextWidth, setTextHeight, dispatch,
    image, originalImage, isImageSelect, removeBgEnabled, setOriginalImage,
    setIsLoader, setRemoveBgEnabled, penColor
  } = context;
  useEffect(() => {
    const loadFont = async () => {
      try {
        const selectedFont = typedSignFont || fontSelect;
        await document.fonts.load(`20px ${selectedFont}`);
        const selectFontStyle = fontOptions.find(
          (font) => font.value === selectedFont
        );
        setFontSelect(selectFontStyle?.value || fontOptions[0].value);
      } catch (error) {
        console.error("Error loading font:", error);
      }
    };

    loadFont();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSelect]);
  useEffect(() => {
    handleWidgetsResponse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTab]);

  const handleWidgetsResponse = async () => {
    //'signatureResponse' is save signature/initials widget response to show on response in signature pad
    const previousWidgetRes = signatureResponse.find(
      (item) => item.type === currWidgetsDetails?.type
    );
    let url = currWidgetsDetails?.options?.response;
    if (currWidgetsDetails?.options?.response || previousWidgetRes) {
      //draw widget
      if (currWidgetsDetails?.type === drawWidget) {
        if (canvasRef.current) {
          const iBase64 = isValidBase64(url);
          if (iBase64) {
            canvasRef.current.fromDataURL(url);
          } else {
            const isAddSuffix = true;
            const base64Url = await getBase64FromUrl(url, isAddSuffix);
            canvasRef.current.fromDataURL(base64Url);
          }
        }
      }
      //signature and initial widgets
      if (isSignOrInitials) {
        if (isTab === "draw" || isTab === "image") {
          if (
            (previousWidgetRes?.tab === "draw" &&
              currWidgetsDetails?.signatureType !== "draw" &&
              previousWidgetRes?.type === currWidgetsDetails?.type) ||
            currWidgetsDetails?.signatureType === "draw"
          ) {
            url = url || previousWidgetRes?.value;
            setSignature(url);
            canvasRef.current && canvasRef.current.fromDataURL(url);
            return;
          } else if (
            previousWidgetRes?.tab === "image" &&
            previousWidgetRes?.type === currWidgetsDetails?.type
          ) {
            setImage({
              src: previousWidgetRes?.value,
              imgType: previousWidgetRes?.imageType
            });
          }
        }
        if (isTab === "image" && currWidgetsDetails?.ImageType) {
          setImage({ imgType: currWidgetsDetails?.ImageType, src: url });
        }
      }
      //image and stamp widget
      if (isImageOrStamp) {
        const isPrefill = xyPosition.some(
          (x) => x.Id === uniqueId && x?.Role === "prefill"
        );
        if (isPrefill) {
          const getPrefillImg = prefillImg?.find(
            (x) => x.id === currWidgetsDetails?.key
          );
          url = getPrefillImg?.base64;
        }
        if (
          ["myStamp", "uploadStamp"].includes(previousWidgetRes?.tab) &&
          previousWidgetRes?.type === currWidgetsDetails?.type
        ) {
          setImage({
            imgType: previousWidgetRes?.ImageType,
            src: previousWidgetRes?.value
          });
        } else if (isTab === "myStamp") {
          setImage(null);
        } else if (
          currWidgetsDetails?.options?.response &&
          currWidgetsDetails?.type === "image"
        ) {
          setImage({ imgType: currWidgetsDetails?.ImageType, src: url });
        }
      }
    }
    if (isTab === "type") {
      const signerName = localStorage.getItem("signer")
        ? JSON.parse(localStorage.getItem("signer"))?.Name
        : currentUserName;
      //trim user name or typed name value to show in initial signature
      const trimmedName = typedSignature
        ? typedSignature?.trim()
        : props?.journey === "kiosk-signing" && kiosk_signer
          ? kiosk_signer[0]?.Name?.trim()
          : signerName?.trim();
      //get full name of user
      const fullUserName =
        typedSignature ||
        (props?.journey === "kiosk-signing" && kiosk_signer
          ? kiosk_signer[0]?.Name
          : signerName);
      const firstCharacter = getInitials(trimmedName);
      const userName =
        currWidgetsDetails?.type === "initials" ? firstCharacter : fullUserName;
      const signatureValue = currWidgetsDetails?.typeSignature;
      setTypedSignature(signatureValue || userName || "");
      convertToImg(fontSelect, signatureValue || userName || "");
    }
  };
  // function for convert input text value in image
  const convertToImg = async (fontStyle, text, color) => {
    const maxWidth = currWidgetsDetails?.Width;
    const maxHeight = currWidgetsDetails?.Height;
    const widgetDims = { Width: maxWidth, Height: maxHeight };
    const fontFamily = fontStyle || typedSignFont || fontSelect || "Fasthand";
    const fillColor = color || penColor;
    const dataUrl = convertTextToImg(fontFamily, text, fillColor, widgetDims);
    // setSignature(dataUrl);
    setTextWidth(maxWidth);
    setTextHeight(maxHeight);
    dispatch(setTypedSignFont(fontFamily));
  };

  // Effect to store original image and apply initial BG removal if enabled
  useEffect(() => {
    if (image?.src && !originalImage && (isImageSelect || isImageOrStamp)) {
      // If there's an image, and we haven't stored an original for it yet,
      // and we are in a relevant tab/widget type for uploads
      setOriginalImage(image); // Store the current image as original

      if (removeBgEnabled) {
        setIsLoader(true);
        removeBackground(image.src)
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // setImage({ src: reader.result, imgType: blob.type });
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
    if (!originalImage?.src || !(isImageSelect || isImageOrStamp)) {
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
        if (isTab === "myStamp") {
          setImage(null);
        } else {
          setImage(originalImage);
        }
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


  return { convertToImg, handleWidgetsResponse };
}
