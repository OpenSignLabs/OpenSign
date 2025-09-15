import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import {
  getMonth,
  getYear,
  radioButtonWidget,
  compressedFileSize,
  textWidget,
  months,
  changeDateToMomentFormat,
  convertBase64ToFile,
  generatePdfName,
  isBase64
} from "../../constant/Utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { range } from "pdf-lib";
import { useTranslation } from "react-i18next";
import moment from "moment";
import AsyncSelect from "react-select/async";
import axios from "axios";
import AddContact from "../../primitives/AddContact";
import Loader from "../../primitives/Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  resetWidgetState,
  setPrefillImg
} from "../../redux/reducers/widgetSlice";
import * as utils from "../../utils";

const ShowTextWidget = ({ position, handleWidgetDetails }) => {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState(position.options.response || "");

  return (
    <input
      ref={inputRef}
      rows={1}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        handleWidgetDetails(position, e.target.value);
      }}
      className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
    />
  );
};

function PrefillWidgetModal(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  // Track already loaded image keys so they don't increment multiple times
  const loadedSet = useRef(new Set());
  const initializedRef = useRef(false); // prevent rerun on state updates
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  const [uniqueWidget, setUniqueWidget] = useState([]);
  const [image, setImage] = useState(null);
  const [imageLoaders, setImageLoaders] = useState({});
  const [currentWidget, setCurrentWidget] = useState("");
  const [userList, setUserList] = useState([]);
  const [totalImages, setTotalImages] = useState(0);
  const [loadedImages, setLoadedImages] = useState(0);
  const [loading, setLoading] = useState(false);
  const years = range(1950, getYear(new Date()) + 16, 1);
  const widgetTitle = "font-medium";
  const isAnyLoaderActive = Object.values(imageLoaders).some(
    (val) => val === true
  );

  // useMemo to memoize the calculation of unique widgets
  const memoizedUniqueWidget = useMemo(() => {
    //functions to used remove duplicate name values across all pages
    if (!props.prefillData) return [];
    //This will help us track which name values have already been encountered across all pages.
    const uniqueNames = new Set();
    //Filter and flatten placeholder widgets while keeping unique names
    const filteredArray = props.prefillData?.placeHolder?.map((item) => ({
      ...item,
      pos: item.pos.filter((curr) => {
        if (uniqueNames.has(curr?.options?.name)) return false; //Duplicate name found, remove it
        uniqueNames.add(curr?.options?.name); //First time seen, add to set
        return true;
      })
    }));
    //latten the filtered array and exclude read-only widgets
    const flatArray = filteredArray?.flatMap((page) =>
      page.pos
        .filter((widget) => !widget.options?.isReadOnly)
        .map((widget) => ({
          widget,
          pageNumber: page.pageNumber
        }))
    );

    return flatArray || [];
  }, [props.prefillData]);
  useEffect(() => {
    dispatch(resetWidgetState([]));
  }, []);
  // Reset loader state when modal closes
  useEffect(() => {
    if (!props?.isPrefillModal) {
      initializedRef.current = false;
      setTotalImages(0);
      setLoadedImages(0);
      setLoading(false);
    }
  }, [props?.isPrefillModal]);

  useEffect(() => {
    //function is used to save all image base64 in redux state to display prefill images
    const savePrefillImg = async () => {
      const prefillImg = await utils?.savePrefillImg(props.xyPosition);
      if (Array.isArray(prefillImg)) {
        prefillImg.forEach((img) => dispatch(setPrefillImg(img)));
      }
      setImageLoaders({});
    };
    savePrefillImg();
  }, [props.xyPosition]);

  useEffect(() => {
    setUniqueWidget(memoizedUniqueWidget);
  }, [memoizedUniqueWidget]);

  useEffect(() => {
    if (totalImages > 0 && loadedImages === totalImages) {
      setLoading(false);
    }
  }, [loadedImages, totalImages]);
  useEffect(() => {
    if (image?.src) {
      handleWidgetDetails(currentWidget);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  // Run only once per modal open
  useEffect(() => {
    if (props?.isPrefillModal && !initializedRef.current) {
      const getImgWidgets = uniqueWidget?.filter(
        (w) => w.widget?.type === "image" && w.widget?.options?.response
      );
      if (getImgWidgets?.length > 0) {
        const imgCount = getImgWidgets.length;
        setTotalImages(imgCount);
        setLoadedImages(0);
        setLoading(true);
        initializedRef.current = true; // mark as initialized
      }
    }
  }, [props?.isPrefillModal, uniqueWidget]);

  // The getDatePickerDate function retrieves the date in the correct format supported by the DatePicker.
  const getDatePickerDate = (selectedDate, format = "dd-MM-yyyy") => {
    let date;
    if (format && format === "dd-MM-yyyy") {
      const [day, month, year] = selectedDate?.split("-");
      date = new Date(`${year}-${month}-${day}`);
    } else if (format && format === "dd.MM.yyyy") {
      const [day, month, year] = selectedDate?.split(".");
      date = new Date(`${year}.${month}.${day}`);
    } else if (format && format === "dd/MM/yyyy") {
      const [day, month, year] = selectedDate?.split("/");
      date = new Date(`${year}/${month}/${day}`);
    } else {
      date = new Date(selectedDate);
    }
    return date;
  };
  const ImageComponent = (props) => {
    const imageRefs = useRef([]);
    let imgUrl = "";
    const isBase64Url = isBase64(props?.position?.SignUrl);
    if (isBase64Url) {
      imgUrl = props?.position?.SignUrl;
    } else {
      const getPrefillImg = prefillImg?.find(
        (x) => x.id === props?.position?.key
      );
      imgUrl = getPrefillImg?.base64;
    }

    return (
      <>
        <span className={widgetTitle}>{props?.position.options?.name}</span>
        {imgUrl ? (
          <>
            <div className="cursor-pointer op-card border-[1px] border-gray-400 flex flex-col w-full h-full justify-center items-center ">
              <img
                alt="print img"
                ref={(el) => (imageRefs.current[props?.position.key] = el)} // Assign ref dynamicallys
                src={imgUrl}
                draggable="false"
                className="object-contain h-full w-full aspect-[5/2]"
                onLoad={() => handleImageLoaded?.(props?.position.key)}
                onError={() => handleImageLoaded?.(props?.position.key)}
              />
            </div>
            <span
              onClick={() => handleClearImage(props?.position)}
              className="flex justify-start text-blue-500 underline cursor-pointer"
            >
              {t("clear")}
            </span>
          </>
        ) : (
          <div
            className="cursor-pointer op-card border-[1px] op-border-hover flex flex-col overflow-hidden w-full h-full aspect-[5/2] justify-center items-center"
            onClick={() => imageRefs.current[props?.position.key]?.click()}
          >
            {imageLoaders[props?.position?.key] && (
              <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-white/30 z-50">
                <Loader />
              </div>
            )}
            <input
              type="file"
              onChange={(e) => onImageChange(e, props?.position)}
              className="filetype"
              accept="image/png,image/jpeg"
              ref={(el) => (imageRefs.current[props?.position.key] = el)} // Assign ref dynamically
              hidden
            />
            <i className="fa-light text-base-content fa-cloud-upload-alt text-[25px]"></i>
            <div className="text-[10px] text-base-content">{t("upload")}</div>
          </div>
        )}
      </>
    );
  };
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      style={{ fontFamily: "Arial, sans-serif" }}
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
    const getDate = getDatePickerDate(
      position?.options.response || new Date(),
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

  const handleSavePrefillImg = async (widgetDetails) => {
    setImageLoaders((prev) => ({ ...prev, [widgetDetails?.key]: true }));
    try {
      const imageName = generatePdfName(16);
      const imageUrl = await convertBase64ToFile(
        imageName,
        image.src,
        image.imgType
      );
      setImageLoaders({});
      if (imageUrl) {
        return imageUrl;
      }
    } catch (e) {
      console.log("error in handleSavePrefillImg function ", e);
    }
  };
  //function is used to handle prefill widgets details and check if there are any duplicate widget name field exist then update all duplicate value
  const handleWidgetDetails = async (widgetDetails, response) => {
    const widgetName = widgetDetails?.options?.name;
    const getPrefill = props.xyPosition.find((x) => x?.Role === "prefill");
    const getPlaceholder = getPrefill?.placeHolder;
    let imgUrl;
    if (widgetDetails?.type === "image") {
      imgUrl = await handleSavePrefillImg(widgetDetails);
    }
    const updatedData = getPlaceholder.map((page) => ({
      ...page,
      pos: page.pos.map((item) => {
        if (item.options.name === widgetName) {
          if (widgetDetails?.type === "image") {
            return {
              ...item,
              SignUrl: imgUrl,
              ImageType: image.imgType,
              options: { ...item.options, response: imgUrl }
            };
          } else {
            return {
              ...item,
              options: { ...item.options, response: response }
            };
          }
        } else {
          return item;
        }
      })
    }));
    const newUpdateSigner = props.xyPosition.map((obj) => {
      if (obj.Role === "prefill") {
        return { ...obj, placeHolder: updatedData };
      }
      return obj;
    });
    props.setXyPosition(newUpdateSigner);
  };

  //function for set checked and unchecked value of checkbox
  const handleCheckboxValue = (isChecked, ind, position) => {
    let updateSelectedCheckbox = [];
    updateSelectedCheckbox =
      position.options?.defaultValue || position.options?.response || [];
    if (isChecked) {
      updateSelectedCheckbox.push(ind);
    } else {
      updateSelectedCheckbox = updateSelectedCheckbox.filter(
        (data) => data !== ind
      );
    }
    handleWidgetDetails(position, updateSelectedCheckbox);
  };

  //function for image upload or update
  const onImageChange = (event, position) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      compressedFileSize(file, setImage);
      setCurrentWidget(position);
    }
  };
  const handleRadioCheck = (data, position) => {
    const res = position?.options?.response;
    const defaultCheck = position?.options?.defaultValue;
    if (res === data || defaultCheck === data) {
      return true;
    } else {
      return false;
    }
  };

  //function for show checked checkbox
  const selectCheckbox = (ind, position) => {
    const res = position?.options?.response;
    const defaultCheck = position?.options?.defaultValue;
    if (res && res?.length > 0) {
      const isSelectIndex = res.indexOf(ind);
      if (isSelectIndex > -1) {
        return true;
      } else {
        return false;
      }
    } else if (defaultCheck) {
      const isSelectIndex = defaultCheck.indexOf(ind);
      if (isSelectIndex > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };
  const handleClearImage = (position) => {
    let prefillPlaceholder = props?.xyPosition.filter(
      (data) => data?.Role === "prefill"
    );
    const updatedArray = prefillPlaceholder[0]?.placeHolder?.map((page) => ({
      ...page,
      pos: page.pos.map((item) => {
        if (item.options.name === position.options.name) {
          return {
            ...item,
            SignUrl: "",
            options: {
              ...position.options,
              response: ""
            }
          };
        }
        return item;
      })
    }));
    const newUpdateSigner = props.xyPosition.map((obj) => {
      if (obj.Role === "prefill") {
        return { ...obj, placeHolder: updatedArray };
      }
      return obj;
    });
    props.setXyPosition(newUpdateSigner);
  };
  const handleImageLoaded = (key) => {
    // Prevent counting the same image multiple times.
    // If this image (key) has not already been marked as loaded...
    if (!loadedSet.current.has(key)) {
      // Mark this image as loaded by adding its key to the Set
      loadedSet.current.add(key);
      // Increment the loadedImages state by 1
      // (tracks how many images have finished loading)
      setLoadedImages((prev) => prev + 1);
    }
  };
  const handleWidgetType = (position) => {
    switch (position?.type) {
      case "checkbox":
        return (
          <>
            <span className={widgetTitle}>{position.options?.name}</span>
            <div className="flex flex-col gap-y-1">
              {position.options?.values?.map((data, ind) => (
                <div
                  key={ind}
                  className="select-none-cls flex items-center text-center gap-0.5"
                >
                  <input
                    id={`checkbox-${position.key + ind}`}
                    className="mt-[2px] op-checkbox op-checkbox-xs"
                    type="checkbox"
                    checked={selectCheckbox(ind, position)}
                    onChange={(e) => {
                      handleCheckboxValue(e.target.checked, ind, position);
                    }}
                  />
                  <label
                    htmlFor={`checkbox-${position.key + ind}`}
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
            <span className={widgetTitle}>{position.options?.name}</span>
            <ShowTextWidget
              position={position}
              handleWidgetDetails={handleWidgetDetails}
            />
          </>
        );
      case "dropdown":
        return (
          <>
            <span className={widgetTitle}>{position.options?.name}</span>
            <select
              className="op-select op-select-bordered op-select-sm focus:outline-none hover:border-base-content text-base-content w-full"
              id="myDropdown"
              value={
                position?.options?.response || position?.options?.defaultValue
              }
              onChange={(e) => {
                handleWidgetDetails(position, e.target.value);
              }}
            >
              {/* Default/Title option */}
              <option value="" disabled hidden>
                {t("choose-one")}
              </option>
              {position?.options?.values?.map((data, ind) => (
                <option key={ind} value={data}>
                  {data}
                </option>
              ))}
            </select>
          </>
        );
      case "date":
        return (
          <>
            <span className={widgetTitle}>{position.options?.name}</span>
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
              onChange={(date) => {
                handleOnDateChange(date, position);
              }}
              customInput={<ExampleCustomInput />}
              dateFormat={position?.options?.validation?.format || "MM/dd/yyyy"}
            />
          </>
        );
      case "image":
        return (
          <ImageComponent
            position={position}
            docId={props?.docId}
          />
        );
      case radioButtonWidget:
        return (
          <>
            <span className={widgetTitle}>{position.options?.name}</span>
            <div className="flex flex-col gap-y-1">
              {position.options?.values.map((data, ind) => (
                <div
                  key={ind}
                  className="select-none-cls flex items-center text-center gap-0.5"
                >
                  <input
                    id={`radio-${position.key + ind}`}
                    className="mt-[2px] op-radio op-radio-xs"
                    type="radio"
                    checked={handleRadioCheck(data, position)}
                    onChange={() => {
                      handleWidgetDetails(position, data);
                    }}
                  />
                  <label
                    htmlFor={`radio-${position.key + ind}`}
                    className="text-xs mb-0 ml-[2px] cursor-pointer"
                  >
                    {data}
                  </label>
                </div>
              ))}
            </div>
          </>
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

  const handleEmbedPrefill = async (item) => {
      await props.handleCreateDocument();
  };
  //`loadOptions` function to use show all list of signer in dropdown
  const loadOptions = async (inputValue) => {
    try {
      const baseURL = localStorage.getItem("baseUrl");
      const url = `${baseURL}functions/getsigners`;
      const token = {
        "X-Parse-Session-Token": localStorage.getItem("accesstoken")
      };
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        ...token
      };
      const search = inputValue;
      const axiosRes = await axios.post(url, { search }, { headers });
      const contactRes = axiosRes?.data?.result || [];
      if (contactRes) {
        const res = JSON.parse(JSON.stringify(contactRes));
        const result = res;
        setUserList(result);
        return await result.map((item) => ({
          label: `${item.Name}<${item.Email}>`,
          value: item.objectId
        }));
      }
    } catch (error) {
      console.log("err", error);
    }
  };
  //`handleInputChange` function to get signers list from dropdown
  const handleInputChange = (item, id) => {
    const signerExist = props.forms.some((x) => x.label === item.label);
    if (signerExist) {
      alert(t("already-exist-signer"));
    } else {
      let newForm = [...props.forms];
      let signerId = newForm[id].value;
      newForm[id].label = item?.label;
      // newForm[id].value = item?.value;
      props.setForms(newForm);
      const getSigner = userList.find((x) => x.objectId === item.value);
      props.handleAddUser(getSigner, signerId);
    }
  };
  //show modal to create new contact
  const handleCreateNew = (e, id) => {
    e.preventDefault();
    props.setIsNewContact({ status: true, id: id });
  };
  const closePopup = () => {
    props.setIsNewContact({ status: false, id: "" });
  };
  return (
    <>
      <ModalUi
        title={uniqueWidget?.length > 0 ? t("prefill-widget") : "Recipients"}
        isOpen={true}
        handleClose={props.handleClosePrefillModal}
      >
        <div className="relative">
          {(props?.isSubmit || loading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-[9999]">
              <Loader />
            </div>
          )}
          {uniqueWidget?.length > 0 && (
            <div className="py-3 px-[10px] op-card border-[1px] border-gray-400 m-3 md:m-6 text-base-content flex flex-col relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 w-full">
                {uniqueWidget.map((x, id) => (
                  <div key={id} className="flex flex-col gap-2 w-full">
                    {handleWidgetType(x.widget)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            {props.forms.length > 0 && (
              <div className="overflow-y-auto m-3">
                {uniqueWidget?.length > 0 && (
                  <h1 className="font-medium text-[15px] mb-2">
                    {t("recipients")}
                  </h1>
                )}
                <div className="py-3 px-[10px] op-card border-[1px] border-gray-400 md:mx-3 text-base-content flex flex-col relative">
                  {props.forms?.map((field, id) => {
                    return (
                      <div className="flex flex-col" key={field?.value}>
                        <label>{field?.role}</label>
                        <div className="flex justify-between items-center gap-1">
                          <div className="flex-1">
                            <AsyncSelect
                              cacheOptions
                              defaultOptions
                              value={field}
                              loadingMessage={() => t("loading")}
                              noOptionsMessage={() => t("contact-not-found")}
                              loadOptions={loadOptions}
                              onChange={(item) => handleInputChange(item, id)}
                              unstyled
                              onFocus={() => loadOptions()}
                              classNames={{
                                control: () =>
                                  "op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full h-full text-[11px]",
                                valueContainer: () =>
                                  "flex flex-row gap-x-[2px] gap-y-[2px] md:gap-y-0 w-full my-[2px]",
                                multiValue: () =>
                                  "op-badge op-badge-primary h-full text-[11px]",
                                multiValueLabel: () => "mb-[2px]",
                                menu: () =>
                                  "mt-1 shadow-md rounded-lg bg-base-200 text-base-content absolute z-9999",
                                menuList: () => "shadow-md rounded-lg  ",
                                option: () =>
                                  "bg-base-200 text-base-content rounded-lg m-1 hover:bg-base-300 p-2 ",
                                noOptionsMessage: () =>
                                  "p-2 bg-base-200 rounded-lg m-1 p-2"
                              }}
                              menuPortalTarget={document.getElementById(
                                "selectSignerModal"
                              )}
                            />
                          </div>
                          <button
                            onClick={(e) => handleCreateNew(e, field.value)}
                            className="op-btn op-btn-accent  op-btn-outline op-btn-sm  "
                          >
                            <i className="fa-light fa-plus"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2 mx-4 mb-3">
            <button
              disabled={isAnyLoaderActive || props?.isSubmit}
              className="op-btn op-btn-primary op-btn-sm w-[80px]"
              onClick={() => handleEmbedPrefill(props?.item)}
            >
              <span>{t("next")}</span>
            </button>
                <button
                  className="op-btn op-btn-ghost op-btn-sm"
                  onClick={() => props.navigatePageToDoc()}
                >
                  <span>{t("edit-draft")}</span>
                </button>
          </div>
        </div>
      </ModalUi>
      <ModalUi
        title={t("add-contact")}
        isOpen={props.isNewContact.status}
        handleClose={closePopup}
      >
        <AddContact
          isDisableTitle
          isAddYourSelfCheckbox
          details={props.handleAddUser}
          closePopup={closePopup}
          newContactId={props.isNewContact.id}
        />
      </ModalUi>
    </>
  );
}

export default PrefillWidgetModal;
