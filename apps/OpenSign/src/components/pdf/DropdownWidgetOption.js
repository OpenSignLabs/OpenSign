import React, { useEffect, useState } from "react";
import { isEnableSubscription } from "../../constant/const";
import ModalUi from "../../primitives/ModalUi";
import { radioButtonWidget } from "../../constant/Utils";
import Upgrade from "../../primitives/Upgrade";
function DropdownWidgetOption(props) {
  const [dropdownOptionList, setDropdownOptionList] = useState([
    "option-1",
    "option-2"
  ]);
  const [minCount, setMinCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [dropdownName, setDropdownName] = useState(props.type);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isHideLabel, setIsHideLabel] = useState(false);
  const [status, setStatus] = useState("required");
  const [defaultValue, setDefaultValue] = useState("");
  const statusArr = ["required", "optional"];
  const [defaultCheckbox, setDefaultCheckbox] = useState([]);

  const resetState = () => {
    setDropdownOptionList(["option-1", "option-2"]);
    setDropdownName(props.type);
    setIsReadOnly(false);
    setIsHideLabel(false);
    setMinCount(0);
    setMaxCount(0);
    setDefaultCheckbox([]);
    setDefaultValue("");
  };

  useEffect(() => {
    if (
      props.currWidgetsDetails?.options?.name &&
      props.currWidgetsDetails?.options?.values
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
      (data, index) => index !== ind
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
    const defaultData =
      defaultCheckbox && defaultCheckbox.length > 0
        ? defaultCheckbox
        : defaultValue;

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
      isHideLabel
    );
    //  props.setShowDropdown(false);
    setDropdownOptionList(["option-1", "option-2"]);
    setDropdownName(props.type);
    //  props.setCurrWidgetsDetails({});
    setIsReadOnly(false);
    setIsHideLabel(false);
    setMinCount(0);
    setMaxCount(0);
    setDefaultCheckbox([]);
    setDefaultValue("");
  };

  const handleSetMinMax = (e) => {
    const minValue = e.target.value;
    if (minValue > dropdownOptionList.length) {
      return "";
    } else {
      return minValue;
    }
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
            <label className="text-[13px] font-semibold">
              Name<span className="text-[red] text-[13px]"> *</span>
            </label>
            <input
              required
              defaultValue={dropdownName}
              value={dropdownName}
              onChange={(e) => setDropdownName(e.target.value)}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />

            <label className="text-[13px] font-semibold mt-[5px]">
              Options
            </label>
            <div className="flex flex-col">
              {dropdownOptionList.map((option, index) => (
                <div
                  key={index}
                  className="flex flex-row mb-[5px] items-center"
                >
                  {props.type === "checkbox" && !props.isSignYourself && (
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
              <i
                onClick={handleAddInput}
                className="fa-light fa-square-plus text-[25px] ml-[10px] op-text-primary cursor-pointer"
              ></i>
              {isEnableSubscription && (
                <div>
                  {props.type === "checkbox" && !props.isSignYourself && (
                    <>
                      <label
                        className={`${
                          !props.isSubscribe ? "text-[gray]" : ""
                        } text-[13px] font-semibold`}
                      >
                        Minimun check
                      </label>
                      {!props.isSubscribe && isEnableSubscription && (
                        <Upgrade />
                      )}
                      <input
                        required
                        defaultValue={0}
                        value={minCount}
                        disabled={props.isSubscribe ? false : true}
                        onChange={(e) => {
                          const count = handleSetMinMax(e);
                          setMinCount(count);
                        }}
                        className={`${
                          props.isSubscribe ? "" : "pointer-events-none"
                        } op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs`}
                      />
                      <label
                        className={`${
                          !props.isSubscribe ? "text-[gray]" : ""
                        } text-[13px] font-semibold`}
                      >
                        Maximum check
                      </label>
                      <input
                        required
                        defaultValue={0}
                        value={maxCount}
                        disabled={props.isSubscribe ? false : true}
                        onChange={(e) => {
                          const count = handleSetMinMax(e);
                          setMaxCount(count);
                        }}
                        className={`${
                          props.isSubscribe ? "" : "pointer-events-none"
                        } op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs`}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
            {["dropdown", radioButtonWidget].includes(props.type) && (
              <>
                <label className="text-[13px] font-semibold mt-[5px]">
                  Default value
                </label>
                <select
                  onChange={(e) => setDefaultValue(e.target.value)}
                  className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content w-full text-xs"
                  name="defaultvalue"
                  value={defaultValue}
                  placeholder="select default value"
                >
                  <option value="" disabled hidden className="text-[13px]">
                    Select...
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
            {props.type !== "checkbox" && props.type !== radioButtonWidget && (
              <>
                <div className="flex flex-row gap-[10px] mt-[0.5rem]">
                  {statusArr.map((data, ind) => {
                    return (
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
                        <div className="text-[13px] font-500">{data}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {["checkbox", radioButtonWidget].includes(props.type) && (
              <div className="flex flex-row gap-5 my-2 items-center text-center">
                {!props.isSignYourself && (
                  <div className="flex items-center">
                    <input
                      id="isreadonly"
                      type="checkbox"
                      checked={isReadOnly}
                      className="op-checkbox op-checkbox-sm"
                      onChange={(e) => setIsReadOnly(e.target.checked)}
                    />
                    <label className="ml-1 mb-0" htmlFor="isreadonly">
                      Is read only
                    </label>
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    id="ishidelabel"
                    type="checkbox"
                    checked={isHideLabel}
                    className="op-checkbox op-checkbox-sm"
                    onChange={(e) => setIsHideLabel(e.target.checked)}
                  />

                  <label className="ml-1 mb-0" htmlFor="ishidelabel">
                    Hide labels
                  </label>
                </div>
              </div>
            )}
          </div>
          <div
            className={`${
              props.type === "checkbox" && !props.isSignYourself
                ? "mb-[15px]"
                : "my-[15px]"
            } w-full h-[1px] bg-[#9f9f9f]`}
          ></div>

          <button
            disabled={dropdownOptionList.length === 0 && true}
            type="submit"
            className="op-btn op-btn-primary"
          >
            Save
          </button>
          {props.currWidgetsDetails?.options?.values?.length > 0 && (
            <button
              type="submit"
              className="op-btn op-btn-ghost ml-1"
              onClick={() => {
                props.handleClose && props.handleClose();
                resetState();
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </ModalUi>
  );
}

export default DropdownWidgetOption;
