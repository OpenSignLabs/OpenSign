import { forwardRef, memo, useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import SignatureCanvas from "react-signature-canvas";
import { useTranslation } from "react-i18next";
import moment from "moment";
import {
  changeDateToMomentFormat,
  compressedFileSize,
  generateId,
  getMonth,
  getYear,
  months,
  radioButtonWidget,
  textInputWidget,
  textWidget,
  years
} from "../../../constant/Utils";
import PenColorComponent from "../../pdf/tab/PenColorComponent";
import { getDatePickerDate, toHtmlPattern } from "../../../utils";
import CellsInput from "../../shared/fields/CellsInput";
import { emailRegex } from "../../../constant/const";

const inputOpt = new Set(["text", "email", "number"]);
const PREFILL_PREFIX = "prefill::";

const inputTypes = {
  email: emailRegex,
  number: /^[0-9\s]*$/,
  ssn: /^(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/
};
const inputValidation = (pattern, type) => {
  if (pattern) return pattern;
  return inputTypes[type] || "";
};
const canavasTheme = `opensigncss:bg-white opensigndark:bg-[#121212] opensigndark:border-[#f6f3f4]/20 opensigncss:border-gray-300 opensigndark:hover:border-white opensigncss:hover:border-black border-[1px]`;

const widgetLabelCss = (isRequired = false) => {
  return `${isRequired ? "after:content-['_*'] after:text-red-500" : ""} block text-xs font-semibold`;
};

const DateWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const format = widget?.options?.validation?.format || "MM/dd/yyyy";

  const PrefillDateInput = forwardRef(({ value, onClick }, ref) => (
    <div
      style={{ fontFamily: "Arial, sans-serif" }}
      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full"
      onClick={onClick}
      ref={ref}
    >
      {value ? value : format}
      <i className="fa-light fa-calendar ml-[5px]"></i>
    </div>
  ));
  PrefillDateInput.displayName = "PrefillDateInput";

  const handleDate = (widget) => {
    // The getDatePickerDate function retrieves the date in the correct format supported by the DatePicker.
    try {
      return getDatePickerDate(widget?.response, format);
    } catch (err) {
      console.error("handleDate error ", err);
      return;
    }
  };

  //function to set date with required date format onchange date
  const handleOnDateChange = (date) => {
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
    onChange(newDate);
  };

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className={`${widgetLabelCss(isRequired)} mb-[0.5rem]`}>
          {widget?.options?.name}
        </div>
      )}
      <div className="min-w-max">
        <DatePicker
          portalId="datepicker-portal-root"
          id={`widget-${widget?.options?.name}-${widget.key}`}
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
          wrapperClassName="w-full"
          closeOnScroll={true}
          selected={handleDate(widget)}
          onChange={(date) => handleOnDateChange(date, widget)}
          customInput={<PrefillDateInput />}
          dateFormat={widget?.options?.validation?.format || "MM/dd/yyyy"}
          required={isRequired}
        />
      </div>
    </div>
  );
};
const TextWidget = ({
  widget,
  isRequired,
  onChange,
  showLabel,
}) => {
  const { t } = useTranslation();
  const inputType = widget?.options?.validation?.type || "";
  const serverRegex = widget?.options?.validation?.pattern;
  const isPredfineType = inputType ? inputOpt?.has(inputType) : "";
  const regExpression = inputValidation(serverRegex, inputType);
  const pattern = useMemo(() => toHtmlPattern(regExpression), [regExpression]);
  const [value, setValue] = useState(() => {
    const response =
      widget?.options?.response ?? widget?.options?.defaultValue ?? "";
    return inputType === "number" && response ? Number(response) : response;
  });

  const handleInputChange = (e) => {
    const text = e.target.value || "";
    setValue(text);
    onChange(text);
  };
  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className={`${widgetLabelCss(isRequired)} mb-[0.5rem]`}>
          {widget?.options?.name}
        </div>
      )}
      <div className="min-w-max">
        <input
          type={isPredfineType ? inputType : "text"}
          id={`widget-${widget?.options?.name}-${widget.key}`}
          value={value}
          placeholder={
            widget?.options?.hint ||
            t("enter-value", { value: widget?.options?.name })
          }
          className={[
            "op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs",
          ].join(" ")}
          onChange={(e) => handleInputChange(e)}
          pattern={pattern || undefined} // if no pattern, browser won't do pattern validation
          onInvalid={(e) => {
            const el = e.currentTarget;
            // ✅ Only override message if pattern exists AND the error is patternMismatch
            if (pattern && el.validity.patternMismatch) {
              el.setCustomValidity(t("validation-alert-1"));
            } else {
              el.setCustomValidity("");
            }
          }}
          onInput={(e) => {
            e.currentTarget.setCustomValidity("");
          }}
          required={isRequired}
        />
      </div>
    </div>
  );
};
const CheckboxWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const { t } = useTranslation();
  const [selectedCheckbox, setSelectedCheckbox] = useState(
    () => widget?.options?.response || widget?.options?.defaultValue || []
  );
  const groupName = `checkbox-group-${widget.key}`;
  const noneSelected = (selectedCheckbox?.length ?? 0) === 0;

  const handleCheckboxValue = (isChecked, ind) => {
    // ✅ clear hidden input error immediately
    const hidden = document.querySelector(`input[name="${groupName}"]`);
    hidden?.setCustomValidity("");

    const prevArr = Array.isArray(selectedCheckbox) ? selectedCheckbox : [];

    const updateResponse = isChecked
      ? prevArr.includes(ind)
        ? prevArr
        : [...prevArr, ind] // add once
      : prevArr.filter((v) => v !== ind); // remove

    setSelectedCheckbox(updateResponse);
    onChange(updateResponse);
  };

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className={`${widgetLabelCss(isRequired)} mb-[0.5rem]`}>
          {widget?.options?.name}
        </div>
      )}
      <div className="flex flex-col gap-y-1 min-w-max relative">
        {widget.options?.values?.map((value, ind) => (
          <div
            key={ind}
            className="select-none-cls flex items-center text-center gap-0.5"
          >
            <input
              id={`checkbox-${widget.key + ind}`}
              className="mt-[2px] op-checkbox op-checkbox-xs"
              type="checkbox"
              checked={selectedCheckbox.includes(ind)}
              onChange={(e) => handleCheckboxValue(e.target.checked, ind)}
            />
            <label
              htmlFor={`checkbox-${widget.key + ind}`}
              className="text-xs mb-0 text-center ml-[3px] cursor-pointer"
            >
              {value}
            </label>
          </div>
        ))}
        {/* ✅ the validator */}
        {isRequired && (
          <input
            tabIndex={-1}
            aria-hidden="true"
            className="absolute opacity-0 pointer-events-none w-0.5 h-0.5 left-[0.46rem] top-4"
            name={groupName}
            value={noneSelected ? "" : "selected"} // empty => invalid, non-empty => valid
            required
            onInvalid={(e) =>
              e.target.setCustomValidity(t("select-at-least-option"))
            }
            onChange={(e) => e.target.setCustomValidity("")}
          />
        )}
      </div>
    </div>
  );
};
const DropdownWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(
    () =>
      widget?.options?.response?.trim() ||
      widget?.options?.defaultValue?.trim() ||
      ""
  );

  const handleDropdownChange = (value) => {
    const select = value?.trim();
    setSelected(select);
    onChange(select);
  };

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className={`${widgetLabelCss(isRequired)} mb-[0.5rem]`}>
          {widget?.options?.name}
        </div>
      )}
      <div className="min-w-max">
        <select
          className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-base-content w-full"
          id={`widget-${widget?.options?.name}-${widget?.key}`}
          value={selected}
          onChange={(e) => handleDropdownChange(e.target.value)}
          required={isRequired}
        >
          {/* Default/Title option */}
          <option value="" disabled hidden>
            {t("choose-one")}
          </option>
          {widget?.options?.values?.map((option, ind) => (
            <option key={ind} value={option?.trim()}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
const RadioButtonWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const [selected, setSelected] = useState(
    () =>
      widget?.options?.response?.trim() ||
      widget?.options?.defaultValue?.trim() ||
      ""
  );
  const id = generateId(4);

  const handleRadioChange = (value) => {
    const select = value?.trim();
    setSelected(select);
    onChange(select);
  };

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className={`${widgetLabelCss(isRequired)} mb-[0.5rem]`}>
          {widget?.options?.name}
        </div>
      )}
      <div className="flex flex-col gap-y-1 min-w-max">
        {widget.options?.values?.map((data, ind) => (
          <div
            key={ind}
            className="select-none-cls flex items-center text-center gap-0.5"
          >
            <input
              id={`radio-${widget.key + ind}`}
              className="mt-[2px] op-radio op-radio-xs"
              name={`radio-group-${widget.key}-${id}`} // ✅ same name => browser treats all radios as ONE group
              type="radio"
              required={isRequired && ind === 0} // ✅ set required ONCE (on first radio) to make the whole group mandatory
              checked={selected === data?.trim()}
              onChange={() => handleRadioChange(data)}
            />
            <label
              htmlFor={`radio-${widget.key + ind}`}
              className="text-xs mb-0 ml-[2px] cursor-pointer"
            >
              {data}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
const ImageWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const { t } = useTranslation();
  const imageRef = useRef(null);
  const [img, setImg] = useState({ src: "", imgType: "" });
  const [defaultImg, setDefaultImg] = useState({ src: "", imgType: "" });

  useEffect(() => {
    if (widget?.response) {
      setDefaultImg({ src: widget?.response, imgType: "" });
    }
  }, []);

  const onImageChange = (e) => {
    if (e.target.files && e.target.files?.[0]) {
      const file = e.target.files?.[0];
      compressedFileSize(file, ({ src, imgType }) => {
        onChange(src);
        setImg({ src, imgType });
      });
    }
  };
  const handleClearImage = () => {
    setDefaultImg({ src: "", imgType: "" });
    setImg({ src: "", imgType: "" });
    onChange("");
  };

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className={`${widgetLabelCss(isRequired)} mb-[0.5rem]`}>
          {widget?.options?.name}
        </div>
      )}
      <div className="flex flex-col prefillCanvas">
        {defaultImg?.src || img?.src ? (
          <div
            className={`cursor-pointer rounded-box ${canavasTheme} flex flex-col w-full h-full justify-center items-center`}
          >
            <img
              alt={`image_${widget?.options?.name}`}
              src={img.src || defaultImg?.src}
              draggable="false"
              className="object-contain h-full w-full aspect-[5/2]"
            />
          </div>
        ) : (
          <div
            className={`cursor-pointer rounded-box ${canavasTheme} overflow-hidden w-full h-full aspect-[5/2] flex flex-col justify-center items-center`}
            onClick={() => imageRef.current?.click()}
          >
            <i className="fa-light text-base-content fa-cloud-upload-alt text-[25px]"></i>
            <div className="text-[10px] text-base-content">{t("upload")}</div>
            <input
              type="file"
              onChange={(e) => onImageChange?.(e, widget)}
              className="filetype w-[1px] h-[1px] opacity-0"
              accept="image/png,image/jpeg"
              ref={imageRef} // Assign ref dynamically
              required={isRequired}
            />
          </div>
        )}
      </div>
      {(defaultImg?.src || img?.src) && (
        <span
          onClick={handleClearImage}
          className="flex justify-start text-blue-500 underline cursor-pointer ml-1"
        >
          {t("clear")}
        </span>
      )}
    </div>
  );
};
const DrawWidget = ({ widget, isRequired, onChange, showLabel }) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const sigRequiredRef = useRef(null);
  const [hasDraw, setHasDraw] = useState("");
  const [penColor, setPenColor] = useState("blue");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (widget?.response) {
      setImage(widget?.response);
      setHasDraw("signed");
    }
  }, []);

  const handleSignatureChange = () => {
    const draw = canvasRef.current?.isEmpty?.() ? "" : "signed";
    setHasDraw(draw);
    onChange(canvasRef.current.toDataURL());

    // clear custom error once user signs
    sigRequiredRef.current?.setCustomValidity("");
  };

  const handleClear = () => {
    setImage("");
    if (canvasRef?.current) {
      canvasRef.current.clear();
      onChange("");
      setHasDraw("");
      // clear custom error once user signs
      sigRequiredRef.current?.setCustomValidity("");
    }
  };

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className={`${widgetLabelCss(isRequired)} mb-[0.5rem]`}>
          {widget?.options?.name}
        </div>
      )}
      <div className="relative w-fit">
        {image ? (
          <div className={`prefillCanvas ${canavasTheme} rounded-[10px]`}>
            <img
              alt={`draw_${widget?.options?.name}`}
              src={image}
              className="prefillCanvas object-contain"
            />
          </div>
        ) : (
          <SignatureCanvas
            ref={canvasRef}
            penColor={penColor}
            canvasProps={{
              className: `prefillCanvas ${canavasTheme} rounded-[10px]`
            }}
            onEnd={() => handleSignatureChange()}
            dotSize={1}
          />
        )}
        {/* ✅ Native form validation hook */}
        <input
          ref={sigRequiredRef}
          type="text"
          value={hasDraw}
          required={isRequired}
          tabIndex={-1}
          onInvalid={(e) => e.target.setCustomValidity(t("draw-required"))}
          onChange={() => {}}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 w-[1px] h-[1px] pointer-events-none"
        />
      </div>
      <div className="flex flex-row justify-between mt-[8px] w-[200px]">
        <PenColorComponent
          penColor={penColor}
          setPenColor={setPenColor}
          hideLabel
          penSize="sm"
        />
        <span
          onClick={handleClear}
          className="flex justify-start text-blue-500 underline cursor-pointer"
        >
          {t("clear")}
        </span>
      </div>
    </div>
  );
};

const CellsWidget = ({
  widget,
  isRequired,
  onChange,
  showLabel,
}) => {
  const { t } = useTranslation();
  const count = widget?.options?.cellCount || 1;
  const [word, setWord] = useState("");
  const inputType = widget?.options?.validation?.type || "";
  const serverRegex = widget?.options?.validation?.pattern;
  const regExpression = inputValidation(serverRegex, inputType);
  const pattern = useMemo(() => toHtmlPattern(regExpression), [regExpression]);

  useEffect(() => {
    const response =
      widget?.options?.response ?? widget?.options?.defaultValue ?? "";
    const isNumber = inputType === "number" && response;
    setWord(isNumber ? Number(response) : response);
  }, []);

  const handleChange = (words) => {
    const value = words;
    setWord(value);
    onChange(value);
  };

  return (
    <div className="flex flex-col">
      {showLabel && (
        <div className={`${widgetLabelCss(isRequired)} mb-[0.5rem]`}>
          {widget?.options?.name}
        </div>
      )}
      <div className="relative">
        <CellsInput
          hint={
            widget?.options?.hint ||
            t("enter-value", { value: widget?.options?.name })
          }
          count={count}
          value={word}
          onChange={handleChange}
          only="all"
          autoFocus
        />
        <input
          id={`widget-${widget?.options?.name}-${widget.key}`}
          value={word}
          required={isRequired}
          tabIndex={-1}
          onChange={() => {}}
          pattern={pattern || undefined} // if no pattern, browser won't do pattern validation
          onInvalid={(e) => {
            const el = e.currentTarget;
            // ✅ Only override message if pattern exists AND the error is patternMismatch
            if (pattern && el.validity.patternMismatch) {
              el.setCustomValidity(t("validation-alert-1"));
            } else {
              el.setCustomValidity("");
            }
          }}
          onInput={(e) => {
            e.currentTarget.setCustomValidity("");
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 w-[1px] h-[1px] pointer-events-none"
        />
      </div>
    </div>
  );
};

const RenderWidgets = ({
  widget,
  handleWidgetDetails,
  showLabel = false,
}) => {
  const label = widget?.label?.toLowerCase() ?? "";
  const isPrefill = label.includes(PREFILL_PREFIX);
  const commonProps = {
    widget,
    isRequired: widget.options?.status === "required" && isPrefill,
    showLabel: showLabel,
    onChange: handleWidgetDetails,
  };

  switch (widget.type) {
    case "date":
      return <DateWidget {...commonProps} />;
    case textWidget:
    case textInputWidget:
    case "name":
    case "email":
    case "company":
    case "job title":
    case "number":
      return <TextWidget {...commonProps} />;
    case "checkbox":
      return <CheckboxWidget {...commonProps} />;
    case radioButtonWidget:
      return <RadioButtonWidget {...commonProps} />;
    case "dropdown":
      return <DropdownWidget {...commonProps} />;
    case "image":
    case "stamp":
      return <ImageWidget {...commonProps} />;
    case "initials":
    case "draw":
      return <DrawWidget {...commonProps} />;
    case "cells":
      return <CellsWidget {...commonProps} />;
    default:
      return null;
  }
};

export default memo(RenderWidgets);
