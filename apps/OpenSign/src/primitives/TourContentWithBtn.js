import React, { useState } from "react";
import { useTranslation } from "react-i18next";
export default function TourContentWithBtn({
  message,
  isChecked,
  image,
  video
}) {
  const { t } = useTranslation();
  const [isCheck, setIsCheck] = useState(false);

  const handleCheck = () => {
    setIsCheck(!isCheck);
    if (isChecked) {
      isChecked(!isCheck);
    }
  };
  return (
    <div>
      <p>{message}</p>
      {image && (
        <div className="flex items-center justify-center my-[10px] border-[1px] border-gray-400 rounded-sm">
          <img src={image} />
        </div>
      )}
      {video && (
        <div className="flex items-center justify-center my-[10px] border-[1px] border-gray-400 rounded-sm">
          <video autoPlay loop muted playsInline>
            <source className="w-[100%]" src={video} type="video/mp4" />
          </video>
        </div>
      )}

      <label className="flex items-center justify-center mb-0">
        <input
          type="checkbox"
          className="op-checkbox op-checkbox-xs mr-1"
          checked={isCheck}
          onChange={handleCheck}
        />
        <span className="#787878 text-[12px]">{t("tour-content")}</span>
      </label>
    </div>
  );
}
