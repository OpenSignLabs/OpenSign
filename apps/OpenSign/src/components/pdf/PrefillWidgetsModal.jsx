import React, { useEffect, useMemo, useRef, useState } from "react";
import ModalUi from "../../primitives/ModalUi";
import {
  getYear,
  compressedFileSize,
  convertBase64ToFile,
  generatePdfName,
  getBase64MimeType,
} from "../../constant/Utils";
import { range } from "pdf-lib";
import { useTranslation } from "react-i18next";
import AsyncSelect from "react-select/async";
import axios from "axios";
import AddContact from "../../primitives/AddContact";
import Loader from "../../primitives/Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  setPrefillImg,
} from "../../redux/reducers/widgetSlice";
import * as utils from "../../utils";
import { createPrefillWidgetRenderer } from "./prefillWidgetRenderer";
import { createEmbedPrefill } from "./prefillWidgetActions";
import { getPrefillWidgets } from "./prefillWidgetList";

function PrefillWidgetModal(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const canvasRefs = useRef({});
  const [penColor, setPenColor] = useState("blue");
  const prefillImg = useSelector((state) => state.widget.prefillImg);
  // Track already loaded image keys so they don't increment multiple times
  const loadedSet = useRef(new Set());
  const initializedRef = useRef(false); // prevent rerun on state updates
  const [image, setImage] = useState(null);
  const [currentWidget, setCurrentWidget] = useState("");
  const [userList, setUserList] = useState([]);
  const [totalImages, setTotalImages] = useState(0);
  const [loadedImages, setLoadedImages] = useState(0);
  const [loading, setLoading] = useState(false);
  const years = range(1950, getYear(new Date()) + 16, 1);

  // useMemo to memoize the calculation of unique widgets
  const uniqueWidget = useMemo(
    () => getPrefillWidgets(props.prefillData),
    [props.prefillData]
  );

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
      const prefillImage = await utils?.savePrefillImg(props.xyPosition);
      if (Array.isArray(prefillImage)) {
        setLoading(true);
        prefillImage.forEach((img) => dispatch(setPrefillImg(img)));
      }
      setLoading(false);
    };
    savePrefillImg();
  }, [props.xyPosition]);

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
  const handleSavePrefillImg = async (base64) => {
    setLoading(true);
    try {
      const imageName = generatePdfName(16);
      const imgType = image?.imgType || getBase64MimeType(base64);
      const imageUrl = await convertBase64ToFile(
        imageName,
        base64 || image.src,
        imgType
      );
      if (imageUrl) {
        return imageUrl;
      }
    } catch (e) {
      console.log("error in handleSavePrefillImg function ", e);
    }
  };
  //'buildUpdatedItem' function to update response
  const buildUpdatedItem = (item, widgetDetails, response, imgUrl) => {
    const isImage = widgetDetails?.type === "image";
    const finalResponse = isImage ? imgUrl : response;

    return {
      ...item,
      ...(isImage && {
        SignUrl: imgUrl,
        ImageType: image.imgType
      }),
      options: {
        ...item.options,
        response: finalResponse
      }
    };
  };

  //function is used to handle prefill widgets details and check if there are any duplicate widget name field exist then update all duplicate value
  const handleWidgetDetails = async (widgetDetails, response) => {
    const widgetName = widgetDetails?.options?.name;
    const getPrefill = props.xyPosition.find((x) => x?.Role === "prefill");
    const getPlaceholder = getPrefill?.placeHolder;
    let imgUrl;
    if (widgetDetails?.type === "image") {
      imgUrl = await handleSavePrefillImg(response);
    }
    const updatedData = getPlaceholder.map((page) => ({
      ...page,
      pos: page.pos.map((item) => {
        const isSameKey = item.key === widgetDetails.key;
        const isSameName =
          item.options?.name === widgetName && item.key !== widgetDetails.key;

        // Always update the active widget
        if (isSameKey) {
          return buildUpdatedItem(item, widgetDetails, response, imgUrl);
        }

        // Sync same-name widgets ONLY if response is valid for them
        if (isSameName) {
          const isValidForTarget = utils.isWidgetResponseCompatible({
            ...item,
            options: {
              ...item.options,
              response: widgetDetails?.type === "image" ? imgUrl : response
            }
          });

          if (!isValidForTarget) {
            return item; // skip invalid sync
          }

          return buildUpdatedItem(item, widgetDetails, response, imgUrl);
        }

        return item;
      })
    }));
    const newUpdateSigner = props.xyPosition.map((obj) =>
      obj.Role === "prefill" ? { ...obj, placeHolder: updatedData } : obj
    );

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
            ...(item.SignUrl !== undefined && { SignUrl: "" }),
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
    setLoading(false);
  };
  //function for set signature url
  const handleSignatureChange = (drawImage, position) => {
    handleWidgetDetails(position, drawImage);
  };
  const getCanvasRef = (widgetId) => {
    if (!canvasRefs.current[widgetId]) {
      canvasRefs.current[widgetId] = React.createRef();
    }
    return canvasRefs.current[widgetId];
  };
  const clearCanvasById = (widgetId) => {
    const canvasRef = canvasRefs.current?.[widgetId];

    if (canvasRef?.current) {
      canvasRef.current.clear();
    }
  };
  const handleWidgetType = createPrefillWidgetRenderer({
    t, penColor, setPenColor, years, prefillImg, selectCheckbox,
    handleCheckboxValue, handleRadioCheck, handleWidgetDetails, handleClearImage,
    handleImageLoaded, onImageChange, handleSignatureChange, getCanvasRef,
    clearCanvasById
  });
  const handleEmbedPrefill = createEmbedPrefill({ props, handleSavePrefillImg });

  const loadOptions = async (inputValue) => {
    try {
      const baseURL = localStorage.getItem("baseUrl");
      const url = `${baseURL}functions/getsigners`;

      const token =
            { "X-Parse-Session-Token": localStorage.getItem("accesstoken") };
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
                    {handleWidgetType(x.widget, id)}
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
                <div className="py-3 px-[10px] op-card border-[1px] border-gray-400 text-base-content flex flex-col relative">
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
                                menuList: () => "shadow-md rounded-lg",
                                option: () =>
                                  "bg-base-200 text-base-content rounded-lg m-1 hover:bg-base-300 p-2",
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
                            className="op-btn op-btn-accent op-btn-outline op-btn-sm"
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
              disabled={props?.isSubmit}
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