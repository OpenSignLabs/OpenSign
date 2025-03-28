import { t } from "i18next";
import React, { useState } from "react";
import TimezoneSelect from "react-timezone-select";

const TimezoneSelector = (props) => {
  const [selectedTimezone, setSelectedTimezone] = useState(props?.timezone);
  // Intl.DateTimeFormat().resolvedOptions().timeZone // Default to the user's local timezone

  const onChangeTimezone = (timezone) => {
    setSelectedTimezone(timezone?.value);
    props.setTimezone && props.setTimezone(timezone?.value);
  };

  return (
    <>
      <div className="max-w-[400px] pr-[20px]">
        <h1 className="text-[14px] mb-[0.7rem] font-medium">
          {t("select-timezone")}
        </h1>
        <TimezoneSelect
          value={selectedTimezone}
          onChange={(timezone) => onChangeTimezone(timezone)}
          unstyled
          classNames={{
            control: () =>
              "op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full h-full text-[11px]",
            valueContainer: () =>
              "flex flex-row gap-x-[2px] gap-y-[2px] md:gap-y-0 w-full my-[2px]",
            multiValue: () => "op-badge op-badge-primary h-full text-[11px]",
            multiValueLabel: () => "mb-[2px]",
            menu: () =>
              "mt-1 shadow-md rounded-lg bg-base-200 text-base-content",
            menuList: () => "shadow-md rounded-lg overflow-hidden",
            option: () =>
              "bg-base-200 text-base-content rounded-lg m-1 hover:bg-base-300 p-2",
            noOptionsMessage: () => "p-2 bg-base-200 rounded-lg m-1 p-2"
          }}
        />
      </div>
    </>
  );
};

export default TimezoneSelector;
