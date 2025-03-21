import React, { useState } from "react";

const DateFormatSelector = (props) => {
  const [selectedFormat, setSelectedFormat] = useState(props.dateFormat);

  const defaultDate = new Date();
  const numDate = { year: "numeric", month: "2-digit", day: "2-digit" };
  const shortMonthDate = { year: "numeric", month: "short", day: "2-digit" };
  const longMonthDate = { year: "numeric", month: "long", day: "2-digit" };
  const dateFormats = {
    "MM/DD/YYYY": (date) =>
      new Intl.DateTimeFormat("en-US", numDate).format(date),
    "MMMM DD, YYYY": (date) =>
      new Intl.DateTimeFormat("en-US", longMonthDate).format(date),
    "DD MMMM, YYYY": (date) =>
      new Intl.DateTimeFormat("en-GB", longMonthDate).format(date),
    "DD-MM-YYYY": (date) =>
      new Intl.DateTimeFormat("fr-FR", numDate)
        .format(date)
        .replace(/\//g, "-"),
    "DD MMM, YYYY": (date) =>
      new Intl.DateTimeFormat("en-GB", shortMonthDate).format(date),
    "YYYY-MM-DD": (date) =>
      new Intl.DateTimeFormat("sv-SE", numDate).format(date),
    "MM-DD-YYYY": (date) =>
      new Intl.DateTimeFormat("en-US", numDate)
        .format(date)
        .replace(/\//g, "-"),
    "MM.DD.YYYY": (date) =>
      new Intl.DateTimeFormat("de-DE", numDate)
        .format(date)
        .replace(/^(\d{2})\.(\d{2})\.(\d{4})$/, "$2.$1.$3"), // Swap day and month to MM.DD.YYYY
    "MMM DD, YYYY": (date) =>
      new Intl.DateTimeFormat("en-US", shortMonthDate).format(date)
  };

  // Handle format change
  const handleFormatChange = (event) => {
    setSelectedFormat(event.target.value);
    props.setDateFormat && props.setDateFormat(event.target.value);
  };
  return (
    <div className="max-w-[400px] pr-[20px]">
      <label className="text-[14px] mb-[0.7rem] font-medium">
        Select default date format for date widget
      </label>
      <select
        className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full h-full text-[11px]"
        value={selectedFormat}
        onChange={handleFormatChange}
      >
        {Object.keys(dateFormats).map((format) => (
          <option key={format} value={format}>
            {format}
          </option>
        ))}
      </select>
      <p className="mt-[12px] ml-[10px] text-[13px] font-medium">
        <strong>
          Formatted Date:{" "}
          {selectedFormat && dateFormats?.[selectedFormat]?.(defaultDate)}
        </strong>
      </p>
    </div>
  );
};

export default DateFormatSelector;
