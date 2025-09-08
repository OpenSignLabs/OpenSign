import React, { useState } from "react";
import { formatDateTime } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

const DateFormatSelector = (props) => {
  const { t } = useTranslation();
  const date = new Date();
  const [selectedFormat, setSelectedFormat] = useState(props.dateFormat);
  const [is12Hour, setIs12Hour] = useState(props?.is12HourTime);

  const dateFormats = [
    "MM/DD/YYYY",
    "MMMM DD, YYYY",
    "DD MMMM, YYYY",
    "DD-MM-YYYY",
    "DD MMM, YYYY",
    "YYYY-MM-DD",
    "MM-DD-YYYY",
    "MM.DD.YYYY",
    "MMM DD, YYYY",
    "DD.MM.YYYY",
    "DD/MM/YYYY"
  ];

  // Handle format change
  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
    props.setDateFormat && props.setDateFormat(event.target.value);
  };
  const handleHrInput = () => {
    setIs12Hour(!is12Hour);
    props.setIs12HourTime && props.setIs12HourTime(!is12Hour);
  };
  return (
    <div className="max-w-[400px] pr-[20px]">
      <label className="text-[14px] mb-[0.7rem] font-medium">
        {t("date-format")}
      </label>
      <select
        className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full h-full text-[11px]"
        value={selectedFormat}
        onChange={handleFormatChange}
      >
        {dateFormats.map((format) => (
          <option key={format} value={format}>
            {format}
          </option>
        ))}
      </select>
      <div className="flex flex-row gap-4 mt-[0.75rem] text-[12px]">
        <div className="flex items-center gap-2 ml-2">
          <input
            type="radio"
            value={true}
            className="op-radio op-radio-xs"
            checked={is12Hour}
            onChange={handleHrInput}
          />
          <div className="text-center">12 hr</div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <input
            type="radio"
            value={false}
            className="op-radio op-radio-xs"
            checked={!is12Hour}
            onChange={handleHrInput}
          />
          <div className="text-center">24 hr</div>
        </div>
      </div>
      <p className="mt-[12px] ml-[10px] text-[13px] font-medium">
        <strong>
          {formatDateTime(date, selectedFormat, props?.timezone, is12Hour)}
        </strong>
      </p>
    </div>
  );
};

export default DateFormatSelector;
