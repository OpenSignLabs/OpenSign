import { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { UI_FONT } from "../../constant/fonts";
import {
  changeDateToMomentFormat,
  drawWidget,
  getMonth,
  getYear,
  months,
  radioButtonWidget,
  textWidget
} from "../../constant/Utils";
import * as utils from "../../utils";
import Draw from "./tab/Draw";
import PenColorComponent from "./tab/PenColorComponent";
import {
  ImageComponent,
  ShowTextWidget,
  widgetLabelCss,
  widgetTitle
} from "./prefillWidgetParts";

/** Build the renderer of one prefill widget for the prefill modal. */
export function createPrefillWidgetRenderer(context) {
  const {
    t,
    penColor,
    setPenColor,
    years,
    prefillImg,
    selectCheckbox,
    handleCheckboxValue,
    handleRadioCheck,
    handleWidgetDetails,
    handleClearImage,
    handleImageLoaded,
    onImageChange,
    handleSignatureChange,
    getCanvasRef,
    clearCanvasById
  } = context;
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      style={{ fontFamily: UI_FONT }}
      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full"
      onClick={onClick}
      ref={ref}
    >
      {value}
      <i className="fa-light fa-calendar ml-[5px]"></i>
    </div>
  ));
  ExampleCustomInput.displayName = "ExampleCustomInput";

  const handleDate = (position) => {
    // The getDatePickerDate function retrieves the date in the correct format supported by the DatePicker.
    const getDate = utils.getDatePickerDate(
      position?.options.response,
      position?.options?.validation?.format
    );
    return getDate;
  };
  //function to set date with required date format onchange date
  const handleOnDateChange = (date, position) => {
    const format = position?.options?.validation?.format || "MM/dd/yyyy";
    let updateDate = date;
    let newDate;
    const isSpecialDateFormat =
      format && ["dd-MM-yyyy", "dd.MM.yyyy", "dd/MM/yyyy"].includes(format);
    if (isSpecialDateFormat) {
      newDate = moment(updateDate).format(changeDateToMomentFormat(format));
    } else {
      //using moment package is used to change date as per the format provided in selectDate obj e.g. - MM/dd/yyyy -> 03/12/2024
      newDate = new Date(updateDate);
      newDate = moment(newDate.getTime()).format(
        changeDateToMomentFormat(format)
      );
    }
    handleWidgetDetails(position, newDate);
  };

  const handleWidgetType = (position, id) => {
    switch (position?.type) {
      case "checkbox":
        return (
          <>
            <span
              className={`${widgetLabelCss(position?.options?.status === "required")} ${widgetTitle}`}
            >
              {position.options?.name}
            </span>
            <div className="flex flex-col gap-y-1">
              {position.options?.values?.map((data, ind) => (
                <div
                  key={ind}
                  className="select-none-cls flex items-center text-center gap-0.5"
                >
                  <input
                    id={`modal-checkbox-${position.key + ind}`}
                    className="mt-[2px] op-checkbox op-checkbox-xs"
                    type="checkbox"
                    checked={selectCheckbox(ind, position)}
                    onChange={(e) =>
                      handleCheckboxValue(e.target.checked, ind, position)
                    }
                  />
                  <label
                    htmlFor={`modal-checkbox-${position.key + ind}`}
                    className="text-xs mb-0 text-center ml-[3px] cursor-pointer"
                  >
                    {data}
                  </label>
                </div>
              ))}
            </div>
          </>
        );
      case textWidget:
        return (
          <>
            <span
              className={`${widgetLabelCss(position?.options?.status === "required")} ${widgetTitle}`}
            >
              {position.options?.name}
            </span>
            <ShowTextWidget
              position={position}
              handleWidgetDetails={handleWidgetDetails}
            />
          </>
        );
      case "dropdown": {
        if (position?.options?.isMultiSelect) {
          const optionLabel = (value) =>
            value == null
              ? ""
              : typeof value === "object"
                ? String(value.name ?? value.value ?? "")
                : String(value);
          const optionsList = (position?.options?.values || [])
            .map(optionLabel)
            .filter((value) => value !== "");
          const currentValues = Array.isArray(position?.options?.response)
            ? position.options.response.map(optionLabel)
            : position?.options?.response
              ? [optionLabel(position.options.response)]
              : [];
          const persist = (next) => handleWidgetDetails(position, next);
          return (
            <div className="flex flex-col gap-1 max-h-40 overflow-auto border border-base-300 rounded p-2">
              {optionsList.length === 0 ? (
                <div className="text-xs text-base-content/60">{t("no-options")}</div>
              ) : (
                optionsList.map((data, ind) => (
                  <label key={ind} className="flex items-center gap-2 text-xs text-base-content cursor-pointer">
                    <input
                      type="checkbox"
                      className="op-checkbox op-checkbox-xs rounded-[1px]"
                      checked={currentValues.includes(data)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...currentValues, data]
                          : currentValues.filter((v) => v !== data);
                        persist(next);
                      }}
                    />
                    <span>{data}</span>
                  </label>
                ))
              )}
            </div>
          );
        }
        return (
          <select
            className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-base-content w-full text-xs"
            id="myDropdown"
            value={position?.options?.response || ""}
            onChange={(e) => handleWidgetDetails(position, e.target.value)}
          >
            <option value="" disabled hidden>
              {t("choose-one")}
            </option>
            {position?.options?.values?.map((data, ind) => (
              <option key={ind} value={data?.trim()}>
                {data?.trim()}
              </option>
            ))}
          </select>
        );
      }

      case "date":
        return (
          <>
            <span
              className={`${widgetLabelCss(position?.options?.status === "required")} ${widgetTitle}`}
            >
              {position.options?.name}
            </span>
            <DatePicker
              portalId="datepicker-portal-root"
              renderCustomHeader={({ date, changeYear, changeMonth }) => (
                <div className="flex justify-start ml-2">
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
              selected={handleDate(position)}
              onChange={(date) => handleOnDateChange(date, position)}
              customInput={<ExampleCustomInput />}
              dateFormat={position?.options?.validation?.format || "MM/dd/yyyy"}
            />
          </>
        );
      case "image":
        return (
          <ImageComponent
            position={position}
            onImageChange={onImageChange}
            handleImageLoaded={handleImageLoaded}
            handleClearImage={handleClearImage}
            id={id}
          />
        );
      case radioButtonWidget:
        return (
          <>
            <span
              className={`${widgetLabelCss(position?.options?.status === "required")} ${widgetTitle}`}
            >
              {position.options?.name}
            </span>
            <div className="flex flex-col gap-y-1">
              {position.options?.values.map((data, ind) => (
                <div
                  key={ind}
                  className="select-none-cls flex items-center text-center gap-0.5"
                >
                  <input
                    id={`modal-radio-${position.key + ind}`}
                    className="mt-[2px] op-radio op-radio-xs"
                    type="radio"
                    checked={handleRadioCheck(data, position)}
                    onChange={() => handleWidgetDetails(position, data)}
                  />
                  <label
                    htmlFor={`modal-radio-${position.key + ind}`}
                    className="text-xs mb-0 ml-[2px] cursor-pointer"
                  >
                    {data}
                  </label>
                </div>
              ))}
            </div>
          </>
        );
      case drawWidget:
        return (
          <div>
            <span
              className={`${widgetLabelCss(position?.options?.status === "required")} ${widgetTitle}`}
            >
              {position.options?.name}
            </span>
            <Draw
              key={position.key + "_" + (prefillImg?.length || 0)}
              penColor={penColor}
              canvasRef={getCanvasRef(position.key)}
              currWidgetsDetails={position}
              handleSignatureChange={handleSignatureChange}
              prefillCls={"prefillCanvas"}
            />
            <div className="flex flex-row justify-between mt-[10px]">
              <PenColorComponent
                penColor={penColor}
                setPenColor={setPenColor}
              />
              <span
                onClick={() => {
                  clearCanvasById(position?.key);
                  handleClearImage(position);
                }}
                className="flex justify-start text-blue-500 underline cursor-pointer"
              >
                {t("clear")}
              </span>
            </div>
          </div>
        );
      default:
        return position?.SignUrl ? (
          <div className="pointer-events-none">
            <img
              alt="image"
              draggable="false"
              src={position?.SignUrl}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full">
            No widget
          </div>
        );
    }
  };
  return handleWidgetType;
}
