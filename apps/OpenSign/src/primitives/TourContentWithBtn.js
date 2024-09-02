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
        <>
          <a
            className="cursor-pointer underline text-blue-700"
            target="_blank"
            rel="noreferrer"
            href="https://www.youtube.com/embed/aGjaMfm7Gqo?si=2Ul0nUlFovlVoZ1U"
          >
            Open in new tab
          </a>
          <div className="flex items-center justify-center my-[10px] border-[1px] border-gray-400 rounded-sm">
            <iframe
              src="https://www.youtube.com/embed/aGjaMfm7Gqo?si=2Ul0nUlFovlVoZ1U"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
        </>
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
