/** Create image and signature save callbacks for the modal. */
export const createSaveActions = (context) => {
  const {
    dispatch, setIsLoader, currWidgetsDetails, image, setOriginalImage,
    setRemoveBgEnabled, compressedFileSize, generatePdfName, getBase64MimeType,
    setPrefillImg, convertBase64ToFile, xyPosition, uniqueId, setPrefillImgLoad,
    myStamp, convertJpegToPng, setXyPosition, onSaveImage, isAutoSign, isTab,
    setSignatureRes, props, pageNumber, setIsAutoSign, setIsImageSelect,
    setImage, myInitial, defaultSignImg, signature,
    onSaveSign, fontSelect, penColor, updateLinkedInitials
  } = context;
  const onImageChange = async (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setOriginalImage(null); // Reset original image when a new file is selected
      setRemoveBgEnabled(false); // Optionally reset toggle
      // Ensure compressedFileSize calls setImage, which then triggers the useEffect for BG removal.
      compressedFileSize(file, setImage);
    }
  };
  const handleSavePrefillImg = async (drawImg) => {
    setIsLoader(true);

    try {
      dispatch(
        setPrefillImg({
          id: currWidgetsDetails?.key,
          base64: drawImg || image?.src
        })
      );
      const imageName = generatePdfName(16);

      const imgType = image?.imgType || getBase64MimeType(drawImg);
      const imageUrl = await convertBase64ToFile(
        imageName,
        drawImg || image.src,
        imgType
      );
      setIsLoader(false);
      if (imageUrl) {
        return imageUrl;
      }
    } catch (e) {
      console.log("error in handleSavePrefillImg function ", e);
    }
  };
  // Synchronize saved initials only within the pages of the current signer.
  const syncSavedInitials = (pages) => {
    if (currWidgetsDetails?.type !== "initials") return pages;
    const source = pages.flatMap((page) => page.pos || []).find((widget) => widget.key === currWidgetsDetails.key);
    return updateLinkedInitials(pages, { source });
  };

  //function is used to save image,stamp widgets data
  const handleSaveImage = async (signatureType) => {
    const widgetsType = currWidgetsDetails?.type;
    let imgUrl;
    const isPrefill = xyPosition.some(
      (x) => x.Id === uniqueId && x?.Role === "prefill"
    );
    if (isPrefill) {
      dispatch(setPrefillImgLoad({ [currWidgetsDetails?.key]: true }));
      imgUrl = await handleSavePrefillImg();
    }
    const defaultStampImg =
      myStamp && (await convertJpegToPng(myStamp, "mystamp")); // default signature set through my signature tab
    const defaultStampType = myStamp && getBase64MimeType(myStamp);
    //check condition signyour-self or other flow
    if (uniqueId) {
      setXyPosition((prev) =>
        prev.map((signer) => {
          if (signer.Id !== uniqueId) return signer;

          // Find the placeholder index for the page containing the current widget
          const index = signer.placeHolder.findIndex((x) =>
            x.pos?.some((p) => p.key === currWidgetsDetails?.key)
          );
          // Get updated placeholder list
          const updatedPlaceholders = onSaveImage(
            signatureType,
            signer.placeHolder,
            index,
            currWidgetsDetails?.key,
            image,
            isAutoSign,
            widgetsType,
            isPrefill && imgUrl,
            defaultStampImg,
            defaultStampType
          );

          return {
            ...signer,
            placeHolder: syncSavedInitials(updatedPlaceholders)
          };
        })
      );
      dispatch(setPrefillImgLoad({}));

      if (
        ["image", "myStamp", "uploadStamp"].includes(isTab) &&
        ["signature", "initials", "stamp"].includes(currWidgetsDetails?.type)
      ) {
        if (defaultStampImg || image?.src) {
          dispatch(
            setSignatureRes({
              tab: isTab,
              value: isTab === "myStamp" ? defaultStampImg : image?.src,
              imageType:
                isTab === "myStamp" ? defaultStampType : image?.imgType,
              type: currWidgetsDetails?.type
            })
          );
        }
      }
    } else {
      const index = props?.xyPosition?.findIndex(
        (p) => p.pageNumber === (currWidgetsDetails?.pageNumber || pageNumber)
      );
      const getImage = onSaveImage(
        signatureType,
        props?.xyPosition,
        index,
        currWidgetsDetails?.key,
        image,
        false,
        widgetsType,
        null,
        defaultStampImg,
        defaultStampType
      );
      setXyPosition(syncSavedInitials(getImage));
    }
    setIsAutoSign(false);
  };

  //function is used to save draw type or initial type signature
  const handleSaveSignature = async (
    signType,
    isDefaultSign,
    width,
    height,
    typedSignature
  ) => {
    // get current click widget type
    const widgetsType = currWidgetsDetails?.type;
    // if there are any width and height then it will typed signature
    const isTypeText = width && height ? true : false;
    // final getting signature url via default select sign/default initial sign/self draw sign
    const signUrl = isDefaultSign
      ? isDefaultSign === "myinitials" && myInitial
        ? await convertJpegToPng(myInitial, "myinitials")
        : await convertJpegToPng(defaultSignImg, "mysign")
      : signature;
    isDefaultSign
      ? isDefaultSign === "initials"
        ? myInitial && (await convertJpegToPng(myInitial, "myinitials")) // default initials set through my signature tab
        : await convertJpegToPng(defaultSignImg, "mysign") // default signature set through my signature tab
      : signature; // signature done by user thorugh draw, upload, typed
    let signatureImg = signUrl;
    let imgWH = { width: width ? width : "", height: height ? height : "" };
    setIsImageSelect(false);
    setImage();
    if (uniqueId) {
      const isPrefill = xyPosition.some(
        (x) => x.Id === uniqueId && x?.Role === "prefill"
      );
      if (isPrefill) {
        dispatch(setPrefillImgLoad({ [currWidgetsDetails?.key]: true }));
        signatureImg = await handleSavePrefillImg(signatureImg);
      }
      setXyPosition((prevState) =>
        prevState.map((signer) => {
          if (signer.Id !== uniqueId) return signer;

          const placeholderIndex = signer.placeHolder.findIndex((x) =>
            x.pos?.some((p) => p.key === currWidgetsDetails?.key)
          );
          const updatedPlaceholders = onSaveSign(
            signType,
            signer.placeHolder,
            placeholderIndex,
            currWidgetsDetails?.key,
            signatureImg,
            imgWH,
            isTypeText,
            typedSignature,
            isAutoSign,
            widgetsType,
            fontSelect,
            penColor
          );
          return {
            ...signer,
            placeHolder: syncSavedInitials(updatedPlaceholders)
          };
        })
      );
      dispatch(setPrefillImgLoad({}));
      if (
        ["signature", "initials"].includes(currWidgetsDetails?.type) &&
        (typedSignature || signatureImg)
      ) {
        dispatch(
          setSignatureRes({
            tab: isTab,
            value: isTab === "type" ? typedSignature : signatureImg,
            type: currWidgetsDetails?.type,
            ...(isTab === "type" && fontSelect && { font: fontSelect })
          })
        );
      }
    } else {
      const index = props?.xyPosition?.findIndex(
        (p) => p.pageNumber === (currWidgetsDetails?.pageNumber || pageNumber)
      );
      const getUpdatePosition = onSaveSign(
        signType,
        props?.xyPosition,
        index,
        currWidgetsDetails?.key,
        signatureImg,
        imgWH,
        isTypeText,
        typedSignature,
        false,
        widgetsType,
        fontSelect,
        penColor
      );
      setXyPosition(syncSavedInitials(getUpdatePosition));
    }
    setIsAutoSign(false);
  };

  return { onImageChange, handleSavePrefillImg, syncSavedInitials, handleSaveImage, handleSaveSignature };
};
