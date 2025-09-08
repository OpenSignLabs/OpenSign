import React, { useEffect, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import { radioButtonWidget } from "../../constant/Utils";
import { useTranslation } from "react-i18next";
import { fontColorArr, fontsizeArr } from "../../constant/Utils";

function DropdownWidgetOption(props) {
  const { t } = useTranslation();
  const [dropdownOptionList, setDropdownOptionList] = useState([
    "Option-1",
    "Option-2"
  ]);
  const [minCount, setMinCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [dropdownName, setDropdownName] = useState();
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isHideLabel, setIsHideLabel] = useState(false);
  const [status, setStatus] = useState("required");
  const [defaultValue, setDefaultValue] = useState("");
  const [defaultCheckbox, setDefaultCheckbox] = useState([]);
  const [layout, setLayout] = useState("vertical");
  const statusArr = ["required", "optional"];
  const layoutArr = ["vertical", "horizontal"];
  const isPrefillExist = props?.roleName === "prefill";

  const resetState = () => {
    setDropdownOptionList(["Option-1", "Option-2"]);
    setDropdownName(props.currWidgetsDetails?.options?.name || props.type);
    setIsReadOnly(false);
    setIsHideLabel(false);
    setMinCount(0);
    setMaxCount(0);
    setDefaultCheckbox([]);
    setDefaultValue("");
    setLayout("vertical");
  };
  useEffect(() => {
    if (
      props.currWidgetsDetails?.options?.name &&
      props.currWidgetsDetails?.options?.values?.length > 0
    ) {
      setDropdownName(props.currWidgetsDetails?.options?.name);
      setDropdownOptionList(props.currWidgetsDetails?.options?.values);
      setMinCount(
        props.currWidgetsDetails?.options?.validation?.minRequiredCount
      );
      setMaxCount(
        props.currWidgetsDetails?.options?.validation?.maxRequiredCount
      );
      setIsReadOnly(props.currWidgetsDetails?.options?.isReadOnly);
      setIsHideLabel(props.currWidgetsDetails?.options?.isHideLabel);
      setStatus(props.currWidgetsDetails?.options?.status || "required");
      setDefaultValue(props.currWidgetsDetails?.options?.defaultValue || "");
      setDefaultCheckbox(props.currWidgetsDetails?.options?.defaultValue || []);
      setLayout(props.currWidgetsDetails?.options?.layout || "vertical");
    } else {
      setStatus("required");
      resetState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.currWidgetsDetails]);
  const handleInputChange = (index, value) => {
    setDropdownOptionList((prevInputs) => {
      const newInputs = [...prevInputs];
      newInputs[index] = value;
      return newInputs;
    });
  };

  //function add add checkbox option and add width of checkbox
  const handleAddInput = () => {
    const deleteOption = false;
    const addOption = true;
    setDropdownOptionList((prevInputs) => [...prevInputs, ""]);
    props.handleSaveWidgetsOptions(
      null,
      null,
      null,
      null,
      null,
      addOption,
      deleteOption
    );
  };

  //function add add checkbox option and delete width of checkbox
  const handleDeleteInput = (ind) => {
    const deleteOption = true;
    const addOption = false;
    const getUpdatedOptions = dropdownOptionList.filter(
      (_, index) => index !== ind
    );
    setDropdownOptionList(getUpdatedOptions);
    props.handleSaveWidgetsOptions(
      null,
      null,
      null,
      null,
      null,
      addOption,
      deleteOption
    );
  };

  const handleSaveOption = () => {
    if (["checkbox", radioButtonWidget, "dropdown"].includes(props.type)) {
      const allUnique =
        new Set(dropdownOptionList).size === dropdownOptionList.length;
      if (!allUnique) {
        alert("Please remove duplicate option");
        return;
      }
    }
    const defaultData =
      defaultCheckbox && defaultCheckbox.length > 0
        ? defaultCheckbox
        : defaultValue;

    const isDropdownOrRadio =
      props?.type === "dropdown" || props?.type === radioButtonWidget;
    const readOnlyWithoutValue =
      isReadOnly && !defaultValue && status !== "optional";
    const isCheckbox = props?.type === "checkbox";
    const WidgetLayout = ["checkbox", radioButtonWidget].includes(props.type)
      ? layout
      : null;

    // If it’s a dropdown and it’s read-only without a value (nor marked optional), stop here.
    if (isDropdownOrRadio && readOnlyWithoutValue) {
      alert(t("readonly-error", { widgetName: props?.type }));
      return;
    } else if (
      isCheckbox &&
      isReadOnly &&
      minCount > 0 &&
      defaultCheckbox?.length === 0
    ) {
      alert(t("readonly-error", { widgetName: props?.type }));
      return;
    }

    // Otherwise (either not a dropdown, or a valid dropdown), do the save + reset exactly once.
    props.handleSaveWidgetsOptions(
      dropdownName,
      dropdownOptionList,
      minCount,
      maxCount,
      isReadOnly,
      null,
      null,
      status,
      defaultData,
      isHideLabel,
      WidgetLayout
    );
    resetState();
  };


  const handleDefaultCheck = (index) => {
    const getDefaultCheck = defaultCheckbox.includes(index);
    if (getDefaultCheck) {
      return true;
    } else {
      return false;
    }
  };
  return (
    <ModalUi isOpen={props.showDropdown} title={props.title} showClose={false}>
      <div className="h-full p-[15px] text-base-content">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveOption();
          }}
        >
          <div>
            <label htmlFor="title" className="text-[13px] font-semibold">
              {t("name")}
              <span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              id="title"
              onInvalid={(e) => e.target.setCustomValidity(t("input-required"))}
              onInput={(e) => e.target.setCustomValidity("")}
              value={dropdownName}
              onChange={(e) => setDropdownName(e.target.value)}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              required
            />

            <label className="text-[13px] font-semibold mt-[5px]">
              {t("options")}
            </label>
            <div className="flex flex-col">
              {dropdownOptionList?.map((option, index) => (
                <div
                  key={index}
                  className="flex flex-row mb-[5px] items-center"
                >
                  {props.type === "checkbox" && props.isShowAdvanceFeature && (
                    <input
                      type="checkbox"
                      checked={handleDefaultCheck(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const getDefaultCheck =
                            defaultCheckbox?.includes(index);
                          if (!getDefaultCheck) {
                            setDefaultCheckbox((prev) => [...prev, index]);
                          }
                        } else {
                          const removeOption = defaultCheckbox.filter(
                            (data) => data !== index
                          );
                          setDefaultCheckbox(removeOption);
                        }
                      }}
                      className="op-checkbox focus:outline-none hover:border-base-content mr-[5px]"
                    />
                  )}
                  <input
                    onInvalid={(e) =>
                      e.target.setCustomValidity(t("input-required"))
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    required
                    className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
                    type="text"
                    value={option}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                  />

                  <i
                    className="fa-light fa-rectangle-xmark text-[25px] ml-[10px] text-accent cursor-pointer"
                    onClick={() => handleDeleteInput(index)}
                  ></i>
                </div>
              ))}
              <div>
                <i
                  className="fa-light fa-square-plus text-[25px] ml-[10px] op-text-primary cursor-pointer"
                  aria-label="Add option"
                  onClick={handleAddInput}
                ></i>
              </div>
            </div>
            {["dropdown", radioButtonWidget].includes(props.type) &&
              !isPrefillExist && (
                <>
                  <label className="text-[13px] font-semibold mt-[5px]">
                    {t("default-value")}
                  </label>
                  <select
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
                    name="defaultvalue"
                  >
                    <option value="" disabled hidden className="text-[13px]">
                      {t("select")}...
                    </option>
                    {dropdownOptionList.map((data, ind) => {
                      return (
                        <option className="text-[13px]" key={ind} value={data}>
                          {data}
                        </option>
                      );
                    })}
                  </select>
                </>
              )}
            {props.type !== "checkbox" && !isPrefillExist && (
              <div className="flex flex-row gap-[10px] mt-[0.5rem]">
                {statusArr.map((data, ind) => (
                  <div
                    key={ind}
                    className="flex flex-row gap-[5px] items-center"
                  >
                    <input
                      className="op-radio op-radio-xs my-1"
                      type="radio"
                      name="status"
                      onChange={() => setStatus(data.toLowerCase())}
                      checked={status.toLowerCase() === data.toLowerCase()}
                    />
                    <div className="text-[13px] font-500 capitalize">
                      {data}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center mt-3 mb-3">
              <span>{t("font-size")} :</span>
              <select
                className="ml-[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
                value={
                  props.fontSize ||
                  props.currWidgetsDetails?.options?.fontSize ||
                  12
                }
                onChange={(e) => props.setFontSize(parseInt(e.target.value))}
              >
                {fontsizeArr.map((size, ind) => {
                  return (
                    <option className="text-[13px]" value={size} key={ind}>
                      {size}
                    </option>
                  );
                })}
              </select>
              <div className="flex flex-row gap-1 items-center ml-4">
                <span className="capitalize">{t("color")} : </span>
                <select
                  value={
                    props.fontColor ||
                    props.currWidgetsDetails?.options?.fontColor ||
                    "black"
                  }
                  onChange={(e) => props.setFontColor(e.target.value)}
                  className="ml-[7px] op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-xs"
                >
                  {fontColorArr.map((color, ind) => {
                    return (
                      <option value={color} key={ind}>
                        {t(`color-type.${color}`)}
                      </option>
                    );
                  })}
                </select>
                <span
                  style={{
                    background:
                      props.fontColor ||
                      props.currWidgetsDetails?.options?.fontColor ||
                      "black"
                  }}
                  className="w-5 h-[19px] ml-1"
                ></span>
              </div>
            </div>
            {["checkbox", radioButtonWidget, "dropdown"].includes(
              props.type
            ) && (
              <div className="flex flex-row gap-5 my-2 items-center text-center">
                {props.isShowAdvanceFeature && !isPrefillExist && (
                  <div className="flex items-center">
                    <input
                      id="isreadonly"
                      type="checkbox"
                      checked={isReadOnly}
                      className="op-checkbox op-checkbox-sm"
                      onChange={(e) => setIsReadOnly(e.target.checked)}
                    />
                    <label
                      className="ml-2 mb-0 capitalize"
                      htmlFor="isreadonly"
                    >
                      {t("read-only")}
                    </label>
                  </div>
                )}
                {props.type !== "dropdown" && (
                  <div className="flex items-center">
                    <input
                      id="ishidelabel"
                      type="checkbox"
                      checked={isHideLabel}
                      className="op-checkbox op-checkbox-sm"
                      onChange={(e) => setIsHideLabel(e.target.checked)}
                    />

                    <label
                      className="ml-2 mb-0 capitalize"
                      htmlFor="ishidelabel"
                    >
                      {t("hide-labels")}
                    </label>
                  </div>
                )}
              </div>
            )}
            {["checkbox", radioButtonWidget].includes(props.type) && (
              <>
                <div className="text-[13px] font-semibold mt-[5px] capitalize">
                  {t("layout")}
                </div>
                <div
                  className={`${props.type === "checkbox" ? "mb-[10px]" : ""} flex flex-row gap-[10px] mt-[0.5rem]`}
                >
                  {layoutArr.map((data, ind) => (
                    <div
                      key={ind}
                      className="flex flex-row gap-[5px] items-center"
                    >
                      <input
                        className="op-radio op-radio-xs my-1"
                        type="radio"
                        name="layout"
                        checked={layout.toLowerCase() === data.toLowerCase()}
                        onChange={() => setLayout(data.toLowerCase())}
                      />
                      <label className="text-[13px] font-500 mb-0">
                        {t(data)}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div
            className={`${
              props.type === "checkbox" && props.isShowAdvanceFeature
                ? "mb-[15px]"
                : "my-[15px]"
            } w-full h-[1px] bg-[#9f9f9f]`}
          ></div>

          <button
            disabled={dropdownOptionList.length === 0 && true}
            type="submit"
            className="op-btn op-btn-primary"
          >
            {t("save")}
          </button>
          {props.currWidgetsDetails?.options?.values?.length > 0 && (
            <button
              type="submit"
              className="op-btn op-btn-ghost text-base-content ml-1"
              onClick={() => {
                props.handleClose && props.handleClose();
                resetState();
              }}
            >
              {t("cancel")}
            </button>
          )}
        </form>
      </div>
    </ModalUi>
  );
}

export default DropdownWidgetOption;
