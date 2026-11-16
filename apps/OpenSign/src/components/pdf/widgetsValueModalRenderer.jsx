import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../../primitives/Loader";
import Draw from "./tab/Draw";
import PenColorComponent from "./tab/PenColorComponent";
import TextInput from "./widgets/TextInput";
import CellsInput from "./widgets/CellsInput";
import { selectCheckbox } from "../../constant/Utils";
import { createSignatureTabs } from "./widgetsValueModalSignatureTabs";

/** Class names of the active signature tab. */
const isTabCls = "bg-[#002864] text-white rounded-[15px] px-[10px] py-[4px]";

/** Build the modal's widget-specific input renderer. */
export function createWidgetTypeRenderer(context) {
  const {
    currWidgetsDetails, myStamp, t, setIsTab, isTabEnabled, defaultSignImg,
    uniqueId, autoSignAll, myInitial, penColor, canvasRef, handleSignatureChange,
    penColors, convertToImg, fontSelect, typedSignature, setPenColor, mysign,
    accesstoken, image, onImageChange, isImageSelect, isImageOrStamp,
    removeBgEnabled, setRemoveBgEnabled, previousWidgetRes, setTypedSignature,
    fontOptions, setFontSelect, isSignTypes, isLoader, isTab, widgetRef,
    selectedCheckbox, handleCheckboxValue, textInputWidget, widgetValue,
    handleOnchangeTextBox, textInputcls, handleValidation, cellsWidget,
    handleCellsInput, hint, getDropdownText, startDate, months, getMonth, years,
    getYear, handleOnDateChange, selectDate, setSelectDate, handleSaveDate,
    widgetTypeTranslation, radioButtonWidget, handleRadioCheck, handleCheckRadio,
    textWidget, drawWidget, props
  } = context;
  const getWidgetType = (type) => {
    const isStampOrImage =
      currWidgetsDetails?.type === "stamp" ||
      currWidgetsDetails?.type === "image";

    const myStampImg = {
      src: myStamp
    };
    const Tabs = createSignatureTabs({ ...context, isStampOrImage, myStampImg });

    switch (type) {
      case "image":
      case "initials":
      case "stamp":
      case "signature":
        return (
          <div className="flex flex-col">
            {isLoader && (
              <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-base-content/30 z-50">
                <Loader />
              </div>
            )}
            {isSignTypes ? (
              <>
                <div className="text-base-content rounded-[4px] tabWidth">
                  {/* Render All Tabs  */}
                  <div className="ml-3 flex justify-start gap-4 text-[11px] md:text-base my-[3px]">
                    {Tabs.filter((tab) => tab.show).map((tab) => (
                      <div key={tab.id}>
                        <span
                          className={`${isTab === tab.id && isTabCls} ml-[2px] cursor-pointer`}
                          onClick={tab.onClick}
                        >
                          {tab.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-full mt-3">
                  {Tabs.find((t) => t.id === isTab)?.render()}
                </div>
              </>
            ) : (
              <div className="mx-3 mb-6 mt-3">
                <p>{t("at-least-one-signature-type")}</p>
              </div>
            )}
          </div>
        );
      case "checkbox":
        const checkBoxLayout =
          currWidgetsDetails?.options?.layout || "vertical";
        const isMultipleCheckbox =
          currWidgetsDetails?.options?.values?.length > 0 ? true : false;
        const checkBoxWrapperClass = `flex items-start ${
          checkBoxLayout === "horizontal"
            ? `flex-row flex-wrap ${isMultipleCheckbox ? "gap-x-2" : ""}`
            : `flex-col ${isMultipleCheckbox ? "gap-y-[5px]" : ""}`
        }`; // Using gap-y-1 for consistency, adjust if needed

        return (
          <div
            className={`border-[1px] border-gray-300 rounded-[2px] pt-1 px-2.5 ${checkBoxWrapperClass}`}
          >
            {currWidgetsDetails?.options?.values?.map((data, ind) => (
              <div key={ind} className="text-base-content select-none-cls">
                <label
                  // htmlFor={`checkbox-${currWidgetsDetails?.key + ind}`}
                  className="text-xs flex items-center gap-1 cursor-pointer"
                >
                  <input
                    id={`checkbox-${currWidgetsDetails?.key + ind}`}
                    className={`${
                      ind === 0 ? "mt-0" : "mt-[5px]"
                    } op-checkbox op-checkbox-xs rounded-[1px] mt-1`}
                    type="checkbox"
                    checked={!!selectCheckbox(ind, selectedCheckbox)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const maxRequired =
                          currWidgetsDetails?.options?.validation
                            ?.maxRequiredCount;
                        const maxCountInt =
                          maxRequired && parseInt(maxRequired);
                        if (maxCountInt > 0) {
                          if (
                            selectedCheckbox &&
                            selectedCheckbox?.length <= maxCountInt - 1
                          ) {
                            handleCheckboxValue(e.target.checked, ind);
                          }
                        } else {
                          handleCheckboxValue(e.target.checked, ind);
                        }
                      } else {
                        handleCheckboxValue(e.target.checked, ind);
                      }
                    }}
                  />
                  {data}
                </label>
              </div>
            ))}
          </div>
        );
      case textInputWidget:
        return (
          <TextInput
            widgetRef={widgetRef}
            widgetValue={widgetValue}
            handleOnchangeTextBox={handleOnchangeTextBox}
            textInputcls={textInputcls}
            currWidgetsDetails={currWidgetsDetails}
            handleInputBlur={handleValidation}
          />
        );
      case cellsWidget:
        return (
          <CellsInput
            ref={widgetRef}
            cellsValue={widgetValue}
            handleCellsInput={handleCellsInput}
            textInputcls={textInputcls}
            handleValidation={handleValidation}
            hint={hint}
            count={currWidgetsDetails?.options?.cellCount || 0}
          />
        );
      case "dropdown":
        return (
          <select
            className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-base-content w-full text-xs"
            id="myDropdown"
            value={getDropdownText(widgetValue).trim()}
            onChange={(e) => handleOnchangeTextBox(e)}
          >
            {/* Default/Title option */}
            <option value="" disabled hidden>
              {/* {currWidgetsDetails?.options?.name} */}
              {t("choose-one")}
            </option>
            {currWidgetsDetails?.options?.values?.map((data, ind) => (
              <option key={ind} value={getDropdownText(data).trim()}>
                {getDropdownText(data).trim()}
              </option>
            ))}
          </select>
        );
      case "name":
        return (
          <input
            ref={widgetRef}
            type="text"
            placeholder={hint || widgetTypeTranslation}
            value={widgetValue}
            onBlur={handleValidation}
            onChange={(e) => handleOnchangeTextBox(e)}
            className={textInputcls}
          />
        );
      case "company":
        return (
          <input
            ref={widgetRef}
            placeholder={hint || widgetTypeTranslation}
            value={widgetValue}
            type="text"
            onBlur={handleValidation}
            onChange={(e) => handleOnchangeTextBox(e)}
            className={textInputcls}
          />
        );
      case "job title":
        return (
          <input
            ref={widgetRef}
            type="text"
            onBlur={handleValidation}
            placeholder={hint || widgetTypeTranslation}
            value={widgetValue}
            onChange={(e) => handleOnchangeTextBox(e)}
            className={textInputcls}
          />
        );
      case "date":
        return (
          <div className="inline-flex flex-col items-center w-full">
            {/* Input + format group */}
            <div className="inline-flex flex-col items-center">
              {/* Date input */}
              <div className="border-[1px] opensigncss:border-gray-300 opensigndark:border-base-content text-base-content rounded-[2px] px-3 py-1 inline-flex">
                <DatePicker
                  renderCustomHeader={({ date, changeYear, changeMonth }) => (
                    <div className="flex items-center gap-2 ml-2">
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
                  closeOnScroll
                  selected={startDate}
                  onChange={handleOnDateChange}
                  popperPlacement="top-end"
                  popperModifiers={[
                    { name: "offset", options: { offset: [0, 6] } },
                    {
                  name: "preventOverflow",
                  options: {
                    boundary: "viewport",
                    rootBoundary: "document",
                    padding: 12,
                    altAxis: true
                  }
                    },
                    { name: "flip", options: { padding: 12 } }
              ]}
                  customInput={<ExampleCustomInput />}
                  dateFormat={
                    selectDate?.format ||
                    currWidgetsDetails?.options?.validation?.format ||
                    "MM/dd/yyyy"
                  }
                />
              </div>
              {/* Format */}
              <span className="mt-1 text-gray-300 uppercase">
                {currWidgetsDetails?.options?.validation?.format}
              </span>
            </div>
            {/* hint */}
            {hint && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span>{hint}</span>
              </div>
            )}
          </div>
        );
      case "email":
        return (
          <input
            ref={widgetRef}
            type="email"
            onBlur={handleValidation}
            placeholder={hint || widgetTypeTranslation}
            value={widgetValue}
            onChange={(e) => handleOnchangeTextBox(e)}
            className={textInputcls}
          />
        );
      case radioButtonWidget:
        const radioLayout = currWidgetsDetails.options?.layout || "vertical";
        const isOnlyOneBtn =
          currWidgetsDetails.options?.values?.length > 0 ? true : false;
        const radioWrapperClass = `flex items-start ${
          radioLayout === "horizontal"
            ? `flex-row flex-wrap ${isOnlyOneBtn ? "gap-x-2" : ""}`
            : `flex-col ${isOnlyOneBtn ? "gap-y-[5px]" : ""}`
        }`; // Using gap-y-1 for consistency, adjust if needed
        return (
          <div
            className={`border-[1px] border-gray-300 rounded-[2px] pt-1 px-2.5 ${radioWrapperClass}`}
          >
            {currWidgetsDetails?.options?.values.map((data, ind) => {
              const label =
                typeof data === "string"
                  ? data
                  : data && typeof data === "object" && data.name != null
                    ? String(data.name)
                    : "";
              return (
                <div key={ind} className="text-base-content select-none-cls">
                  <label
                    // htmlFor={`radio-${currWidgetsDetails?.key + ind}`}
                    className="cursor-pointer flex items-center text-sm gap-1"
                  >
                    <input
                      id={`radio-${currWidgetsDetails?.key + ind}`}
                      className={`op-radio op-radio-xs mt-1`}
                      type="radio"
                      value={label}
                      checked={handleRadioCheck(label?.trim())}
                      onChange={(e) => {
                        handleCheckRadio(e.target.value?.trim());
                      }}
                    />
                    <span>{label}</span>
                  </label>
                </div>
              );
            })}
          </div>
        );
      case textWidget:
        return (
          <TextInput
            widgetRef={widgetRef}
            widgetValue={widgetValue}
            handleOnchangeTextBox={handleOnchangeTextBox}
            textInputcls={textInputcls}
            currWidgetsDetails={currWidgetsDetails}
          />
        );
      case drawWidget:
        return (
          <div>
            <Draw
              penColor={penColor}
              canvasRef={canvasRef}
              currWidgetsDetails={props?.currWidgetsDetails}
              handleSignatureChange={handleSignatureChange}
            />
            <div className="flex flex-row justify-between mt-[10px]">
              <PenColorComponent
                penColor={penColor}
                setPenColor={setPenColor}
              />
            </div>
          </div>
        );
      default:
        return (
          <input
            placeholder={t("widgets-name.text")}
            readOnly
            className={textInputcls}
          />
        );
    }
  };
  return getWidgetType;
}
