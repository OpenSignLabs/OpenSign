import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

function UploadImage(props) {
  const { t } = useTranslation();
  const imageRefs = useRef({});

  const getImageRef = (key) => {
    if (!imageRefs.current[key]) {
      imageRefs.current[key] = React.createRef();
    }
    return imageRefs.current[key];
  };

  return (
    <div>
      {(props?.isImageSelect || props?.isStampOrImage) && !props?.image ? (
        <div className="flex justify-center">
          <div
            className={`${props?.currWidgetsDetails?.type === "initials" ? "intialSignatureCanvas" : "signatureCanvas"} bg-white border-[1.3px] border-gray-300 flex flex-col justify-center items-center mb-[6px] cursor-pointer`}
            onClick={() =>
              getImageRef(props?.currWidgetsDetails?.key).current.click()
            }
          >
            <input
              type="file"
              onChange={props?.onImageChange}
              className="filetype"
              accept="image/png,image/jpeg"
              ref={getImageRef(props?.currWidgetsDetails?.key)}
              hidden
            />
            <i className="fa-light fa-cloud-upload-alt uploadImgLogo text-base-content"></i>
            <div className="text-[10px] text-base-content">{t("upload")}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-center">
            <div
              className={`${props?.currWidgetsDetails?.type === "initials" ? "intialSignatureCanvas" : "signatureCanvas"} bg-white border-[1.3px] border-gray-300 mb-[6px] overflow-hidden`}
            >
              <img
                alt="print img"
                ref={getImageRef(props?.currWidgetsDetails?.key)}
                src={props?.image?.src}
                draggable="false"
                className="object-contain h-full w-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UploadImage;
