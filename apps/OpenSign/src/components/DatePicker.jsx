import { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import {
  getDefaultDate,
  getMonth,
  getYear,
  months,
  years
} from "../constant/Utils";
import { useTranslation } from "react-i18next";

const DatePicker = ({
  selectDate,
  format,
  minDate,
  maxDate,
  onChange,
  handleClear
}) => {
  const { t } = useTranslation();

  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      className="border-gray-400 rounded-[50px] border-[1px] px-3 text-xs py-2 focus:outline-none hover:border-base-content "
      onClick={onClick}
      ref={ref}
    >
      {value}
      <i className={`${value ? "ml-[5px]" : ""} fa-light fa-calendar `}></i>
    </div>
  ));
  CustomInput.displayName = "CustomInput";

  return (
    <div>
      <span>{t("default-date")}: </span>
      <ReactDatePicker
        renderCustomHeader={({ date, changeYear, changeMonth }) => (
          <div className="flex justify-start md:ml-2">
            <select
              className="bg-transparent outline-none"
              value={months[getMonth(date)]}
              onChange={({ target: { value } }) =>
                changeMonth(months.indexOf(value))
              }
            >
              {months.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              className="bg-transparent outline-none"
              value={getYear(date)}
              onChange={({ target: { value } }) => changeYear(value)}
            >
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        closeOnScroll={true}
        selected={getDefaultDate(selectDate?.date, selectDate?.format)}
        popperPlacement="top-end"
        customInput={<CustomInput />}
        onChange={(date) => onChange(date)}
        dateFormat={
          selectDate ? selectDate?.format : format ? format : "MM/dd/yyyy"
        }
        portalId="root-portal"
      />
      <span
        onClick={() => handleClear()}
        className="underline text-blue-500 cursor-pointer ml-2"
      >
        {t("clear")}
      </span>
    </div>
  );
};

export default DatePicker;
