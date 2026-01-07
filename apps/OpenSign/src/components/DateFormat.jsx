import { useTranslation } from "react-i18next";

const DateFormat = ({ selectDate, dateFormatList, handleChangeFormat }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:items-center md:flex-row gap-y-3 my-2">
      <span className="capitalize">{t("format")}: </span>
      <select
        className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs md:ml-2"
        defaultValue={""}
        onChange={(e) => handleChangeFormat(e)}
      >
        <option value="" disabled>
          {t("select-date-format")}
        </option>
        {dateFormatList.map((data, ind) => {
          return (
            <option className="text-[13px]" value={ind} key={ind}>
              {data?.date ? data?.date : "nodata"}
            </option>
          );
        })}
      </select>
      <span className="text-xs text-gray-400 ml-1 uppercase">{selectDate.format}</span>
    </div>
  );
};

export default DateFormat;
