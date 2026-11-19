import { forwardRef } from "react";
import { onChangeInput } from "../../constant/Utils";

/** Create controlled field callbacks used by the modal renderer. */
export function createFieldActions(context) {
  const {
    isSavedSign, setIsSavedSign, t, currWidgetsDetails, selectedCheckbox,
    setSelectedCheckbox, xyPosition, props, setXyPosition, uniqueId, widgetValue,
    setWidgetValue, setStartDate, setIsShowValidation
  } = context;
  const savesigncheckbox = (
    <label className="cursor-pointer flex items-center mb-0 text-center text-sm">
      <input
        className="mr-2 md:mr-3 op-checkbox op-checkbox-xs md:op-checkbox-sm"
        type="checkbox"
        checked={isSavedSign}
        onChange={(e) => setIsSavedSign(e.target.checked)}
      />
      {t("save")} {t(`widgets-name.${currWidgetsDetails?.type}`)}
    </label>
  );
  //function for set checked and unchecked value of checkbox
  const handleCheckboxValue = (isChecked, ind) => {
    let updateSelectedCheckbox = [],
      checkedList;
    updateSelectedCheckbox = selectedCheckbox ? [...selectedCheckbox] : [];

    //if user select any option then add selected option
    if (isChecked) {
      updateSelectedCheckbox.push(ind);
      setSelectedCheckbox(updateSelectedCheckbox);
    } else {
      //else user unselect any option then remove that option
      checkedList = selectedCheckbox?.filter((data) => data !== ind);
      setSelectedCheckbox([...checkedList]);
    }
    onChangeInput(
      checkedList ? checkedList : updateSelectedCheckbox,
      currWidgetsDetails,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId,
      false
    );
  };

  const handleRadioCheck = (data) => {
    return widgetValue === data;
  };

  //function to handle select radio widget and set value seletced by user
  const handleCheckRadio = (data) => {
    setWidgetValue(data);
    onChangeInput(
      data,
      currWidgetsDetails,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId,
      false
    );
  };
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      style={{
        fontFamily: "Arial, sans-serif"
      }}
      // className={`${selectWidgetCls} overflow-hidden`}
      onClick={onClick}
      ref={ref}
    >
      {value ? value : "Select date"}
      <i className="fa-light fa-calendar ml-[5px]"></i>
    </div>
  ));
  ExampleCustomInput.displayName = "ExampleCustomInput";
  //function to set onchange date
  const handleOnDateChange = (date) => {
    setWidgetValue(date);
    setStartDate(date);
  };

  const getDropdownText = (value) => {
    if (Array.isArray(value)) return value.map(getDropdownText).join(", ");
    if (value && typeof value === "object" && value.name != null) {
      return String(value.name);
    }
    return value == null ? "" : String(value);
  };

  const handleOnchangeTextBox = (e) => {
    // hide any prior validation error while typing
    setIsShowValidation(false);
    let value =
      currWidgetsDetails?.type === "dropdown"
        ? e.target?.value?.trim()
        : e.target.value;
    setWidgetValue(value);
    props.setCurrWidgetsDetails?.((prev) =>
      prev && prev.key === currWidgetsDetails?.key
        ? { ...prev, options: { ...prev.options, response: value } }
        : prev
    );
    onChangeInput(
      value,
      currWidgetsDetails,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId
    );
  };

  const updateCells = (updated) => {
    setWidgetValue(updated);
    props.setCurrWidgetsDetails?.((prev) =>
      prev && prev.key === currWidgetsDetails?.key
        ? { ...prev, options: { ...prev.options, response: updated } }
        : prev
    );
    onChangeInput(
      updated,
      currWidgetsDetails,
      xyPosition,
      props.index,
      setXyPosition,
      uniqueId
    );
  };
  const handleCellsInput = (e) => {
    const value = e.target.value;
    setIsShowValidation(false);
    updateCells(value);
  };

  return {
    savesigncheckbox, handleCheckboxValue, handleRadioCheck, handleCheckRadio,
    ExampleCustomInput, handleOnDateChange, getDropdownText,
    handleOnchangeTextBox, updateCells, handleCellsInput
  };
}
