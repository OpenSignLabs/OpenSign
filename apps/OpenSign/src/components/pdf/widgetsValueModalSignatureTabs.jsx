import Draw from "./tab/Draw";
import DefaultSignature from "./tab/DefaultSignature";
import UploadImage from "./tab/UploadImage";
import TypeSignature from "./tab/TypeSignature";
import PenColorComponent from "./tab/PenColorComponent";

/** Create the signature, initials, image, and stamp tab configuration. */
export function createSignatureTabs(context) {
  const {
    t, setIsTab, currWidgetsDetails, defaultSignImg, isTabEnabled, myInitial,
    uniqueId, autoSignAll, penColor, canvasRef, handleSignatureChange, penColors,
    convertToImg, fontSelect, typedSignature, setPenColor, accesstoken, mysign,
    image, onImageChange, isImageSelect, isImageOrStamp, removeBgEnabled,
    setRemoveBgEnabled, previousWidgetRes, setTypedSignature, fontOptions,
    setFontSelect, myStamp, savesigncheckbox, isStampOrImage, myStampImg,
    setIsImageSelect, isSignOrInitials
  } = context;
  const Tabs = [
      //My signature tab
      {
        id: "mysignature",
        label: t("my-signature"),
        onClick: () => setIsTab("mysignature"),
        show:
          currWidgetsDetails?.type === "signature" &&
          defaultSignImg &&
          isTabEnabled("default"),
        render: () => (
          <>
            <DefaultSignature
              defaultSignImg={defaultSignImg}
              currWidgetsDetails={currWidgetsDetails}
            />
            {uniqueId && (
              <div className="flex justify-center my-2">{autoSignAll}</div>
            )}
          </>
        )
      },
      //My initials tab
      {
        id: "myinitials",
        label: t("my-initials"),
        onClick: () => setIsTab("myinitials"),
        show:
          currWidgetsDetails?.type === "initials" &&
          myInitial &&
          isTabEnabled("default"),
        render: () => (
          <>
            <DefaultSignature
              defaultSignImg={myInitial}
              currWidgetsDetails={currWidgetsDetails}
            />
            {uniqueId && (
              <div className="flex justify-center my-2">{autoSignAll}</div>
            )}
          </>
        )
      },
      //Draw tab
      {
        id: "draw",
        label: t("draw"),
        show: isTabEnabled("draw") && !isStampOrImage,
        onClick: () => setIsTab("draw"),
        render: () => (
          <>
            <Draw
              penColor={penColor}
              canvasRef={canvasRef}
              currWidgetsDetails={currWidgetsDetails}
              handleSignatureChange={handleSignatureChange}
            />
            <div className="flex flex-row justify-between mt-[10px]">
              <PenColorComponent
                providedColors={penColors}
                penColor={penColor}
                convertToImg={convertToImg}
                fontSelect={fontSelect}
                typedSignature={typedSignature}
                setPenColor={setPenColor}
              />
            </div>
            <div className="flex flex-row ml-1 mt-1 gap-x-3 text-base-content">
              {/* Standalone autoSignAll for "Draw" tab if conditions met */}
              {/* 'uniqueId' represents the current user */}
              {uniqueId && (
                <div className="flex justify-start my-1">{autoSignAll}</div>
              )}
              {accesstoken && (
                <div className="flex justify-start my-1">
                  {mysign?.isVisible && savesigncheckbox}
                </div>
              )}
            </div>
          </>
        )
      },
      //Upload Image tab
      {
        id: "image",
        label: t("upload-image"),
        onClick: () => {
          setIsTab("image");
          setIsImageSelect(true);
        },
        show:
          (isTabEnabled("upload") && currWidgetsDetails?.type !== "stamp") ||
          currWidgetsDetails?.type === "image",
        render: () => (
          <>
            <UploadImage
              currWidgetsDetails={currWidgetsDetails}
              image={image}
              onImageChange={onImageChange}
              isImageSelect={isImageSelect}
              isStampOrImage={isStampOrImage}
            />
            {/* 'uniqueId' represents the current user */}
            {/* 'image' checks whether an image is available */}
            {/* 'isImageSelect' indicates if the user selected the upload-image option for the signature pad */}
            {/* 'isImageOrStamp' determines whether the item is an image or a stamp */}
            {(uniqueId || (image && (isImageSelect || isImageOrStamp))) && (
              <div className="flex flex-wrap flex-row sm:justify-center items-center gap-x-3 my-2 text-base-content">
                {uniqueId && autoSignAll}
                {image && (isImageSelect || isImageOrStamp) && (
                  <label
                    htmlFor={`removeBgToggleModal-${currWidgetsDetails?.key}`}
                    className="mb-0 cursor-pointer flex items-center text-sm"
                  >
                    <input
                      type="checkbox"
                      id={`removeBgToggleModal-${currWidgetsDetails?.key}`} // Unique ID
                      className="mr-2 op-checkbox op-checkbox-xs md:op-checkbox-sm"
                      checked={removeBgEnabled}
                      onChange={() => setRemoveBgEnabled(!removeBgEnabled)}
                    />
                    {t("remove-background")}
                  </label>
                )}
                {accesstoken && isSignOrInitials && (
                  <div className="flex justify-start my-1">
                    {mysign?.isVisible && savesigncheckbox}
                  </div>
                )}
              </div>
            )}
          </>
        )
      },
      //Typed signature tab
      {
        id: "type",
        label: t("type"),
        onClick: () => {
          setIsTab("type");
          if (previousWidgetRes?.tab !== "type") {
            setTypedSignature("");
          }
        },
        show: isTabEnabled("typed") && !isStampOrImage,
        render: () => (
          <>
            <TypeSignature
              currWidgetsDetails={currWidgetsDetails}
              fontSelect={fontSelect}
              penColor={penColor}
              typedSignature={typedSignature}
              setTypedSignature={setTypedSignature}
              convertToImg={convertToImg}
              fontOptions={fontOptions}
              setFontSelect={setFontSelect}
            />
            <div className="flex flex-row justify-between mt-[10px]">
              <PenColorComponent
                providedColors={penColors}
                penColor={penColor}
                convertToImg={convertToImg}
                fontSelect={fontSelect}
                typedSignature={typedSignature}
                setPenColor={setPenColor}
              />
            </div>
            <div className="flex flex-row ml-1 mt-2 gap-x-3 text-base-content">
              {/* Standalone autoSignAll for "Type" tab if conditions met */}
              {uniqueId && (
                <div className="flex justify-start my-1">{autoSignAll}</div>
              )}
              {accesstoken && (
                <div className="flex justify-start my-1">
                  {mysign?.isVisible && savesigncheckbox}
                </div>
              )}
            </div>
          </>
        )
      },
      //Mystamp tab
      {
        id: "myStamp",
        label: "My stamp",
        onClick: () => setIsTab("myStamp"),
        show: currWidgetsDetails?.type === "stamp" && myStamp,
        render: () => (
          <UploadImage
            currWidgetsDetails={currWidgetsDetails}
            image={myStampImg}
            onImageChange={onImageChange}
            isImageSelect={isImageSelect}
            isStampOrImage={isStampOrImage}
          />
        )
      },
      // Upload Stamp Tab
      {
        id: "uploadStamp",
        label: "Upload stamp",
        onClick: () => setIsTab("uploadStamp"),
        show: currWidgetsDetails?.type === "stamp",
        render: () => (
          <>
            <UploadImage
              currWidgetsDetails={currWidgetsDetails}
              image={image}
              onImageChange={onImageChange}
              isImageSelect={isImageSelect}
              isStampOrImage={isStampOrImage}
            />
            {/* 'uniqueId' represents the current user */}
            {(uniqueId || image) && (
              <div className="flex flex-wrap flex-row sm:justify-center items-center gap-x-3 my-2 text-base-content">
                {uniqueId && autoSignAll}
                {image && (
                  <label
                    htmlFor={`removeBgToggleModal-${currWidgetsDetails?.key}`}
                    className="mb-0 cursor-pointer flex items-center text-sm"
                  >
                    <input
                      type="checkbox"
                      id={`removeBgToggleModal-${currWidgetsDetails?.key}`} // Unique ID
                      className="mr-2 op-checkbox op-checkbox-xs md:op-checkbox-sm"
                      checked={removeBgEnabled}
                      onChange={() => setRemoveBgEnabled(!removeBgEnabled)}
                    />
                    {t("remove-background")}
                  </label>
                )}
                {accesstoken && (
                  <div className="flex justify-start my-1">
                    {mysign?.isVisible && savesigncheckbox}
                  </div>
                )}
              </div>
            )}
          </>
        )
      }
    ]
  return Tabs;
}