import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { isBase64 } from "../../constant/Utils";

export const widgetTitle = "font-medium";
export const widgetLabelCss = (isRequired = false) => {
  return `${isRequired ? "after:content-['_*'] after:text-red-500" : ""} block text-xs font-semibold`;
};
export const ShowTextWidget = ({ position, handleWidgetDetails }) => {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState(position.options.response || "");

  return (
    <input
      ref={inputRef}
      rows={1}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        handleWidgetDetails(position, e.target.value);
      }}
      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
    />
  );
};
export const ImageComponent = (props) => {
  const { t } = useTranslation();
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  const imageRefs = useRef({});

  let imgUrl = "";
  const isBase64Url = isBase64(props?.position?.SignUrl);
  if (isBase64Url) {
    imgUrl = props?.position?.SignUrl;
  } else {
    const getPrefillImg = prefillImg?.find(
      (x) => x.id === props?.position?.key
    );
    imgUrl = getPrefillImg?.base64;
  }

  return (
    <>
      <span
        className={`${widgetLabelCss(props?.position?.options?.status === "required")} ${widgetTitle}`}
      >
        {props?.position.options?.name}
      </span>
      {imgUrl ? (
        <>
          <div className="cursor-pointer op-card border-[1px] border-gray-400 flex flex-col w-full h-full justify-center items-center ">
            <img
              alt="print img"
              ref={(el) => (imageRefs.current[props?.id] = el)} // Assign ref dynamicallys
              src={imgUrl}
              draggable="false"
              className="object-contain h-full w-full aspect-[5/2]"
              onLoad={() => props?.handleImageLoaded?.(props?.position.key)}
              onError={() => props?.handleImageLoaded?.(props?.position.key)}
            />
          </div>
          <span
            onClick={() => props?.handleClearImage(props?.position)}
            className="flex justify-start text-blue-500 underline cursor-pointer"
          >
            {t("clear")}
          </span>
        </>
      ) : (
        <div
          className="cursor-pointer op-card border-[1px] op-border-hover flex flex-col overflow-hidden w-full h-full aspect-[5/2] justify-center items-center"
          onClick={() => imageRefs.current[props?.id]?.click()}
        >
          <input
            type="file"
            onChange={(e) => props?.onImageChange?.(e, props?.position)}
            className="filetype"
            accept="image/png,image/jpeg"
            ref={(el) => (imageRefs.current[props?.id] = el)} // Assign ref dynamically
            hidden
          />
          <i className="fa-light text-base-content fa-cloud-upload-alt text-[25px]"></i>
          <div className="text-[10px] text-base-content">{t("upload")}</div>
        </div>
      )}
    </>
  );
};
