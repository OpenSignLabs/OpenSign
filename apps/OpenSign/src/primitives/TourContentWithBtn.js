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
        <div className="flex items-center justify-center my-[10px]">
          <img width={800} height={100} src={image} />
        </div>
      )}
      {video && (
        <div className="flex items-center justify-center">
          <video width="320" height="240" autoPlay loop muted playsInline>
            <source src={video} type="video/mp4" />
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
