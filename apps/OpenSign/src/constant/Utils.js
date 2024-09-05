import axios from "axios";
import moment from "moment";
import React from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import Parse from "parse";
import { appInfo } from "./appinfo";
import { saveAs } from "file-saver";
import printModule from "print-js";
import { validplan } from "../json/plansArr";
import fontkit from "@pdf-lib/fontkit";

export const fontsizeArr = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
export const fontColorArr = ["red", "black", "blue", "yellow"];
export const isMobile = window.innerWidth < 767;
export const isTabAndMobile = window.innerWidth < 1023;
export const textInputWidget = "text input";
export const textWidget = "text";
export const radioButtonWidget = "radio button";
export const fileasbytes = async (filepath) => {
  const response = await fetch(filepath); // Adjust the path accordingly
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

export const openInNewTab = (url, target) => {
  if (target) {
    window.open(url, target, "noopener,noreferrer");
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

export async function fetchSubscription(
  extUserId,
  contactObjId,
  isGuestSign = false
) {
  try {
    const Extand_Class = localStorage.getItem("Extand_Class");
    const extClass = Extand_Class && JSON.parse(Extand_Class);
    // console.log("extClass ", extClass);
    let extUser;
    if (extClass && extClass.length > 0) {
      extUser = extClass[0].objectId;
    } else {
      extUser = extUserId;
    }
    const baseURL = localStorage.getItem("baseUrl");
    const url = `${baseURL}functions/getsubscriptions`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      sessionToken: localStorage.getItem("accesstoken")
    };
    const params = isGuestSign
      ? { contactId: contactObjId }
      : { extUserId: extUser };
    const tenatRes = await axios.post(url, params, { headers: headers });
    let plan, status, billingDate, adminId;
    if (isGuestSign) {
      plan = tenatRes.data?.result?.result?.plan;
      status = tenatRes.data?.result?.result?.isSubscribed;
    } else {
      plan = tenatRes.data?.result?.result?.PlanCode;
      billingDate = tenatRes.data?.result?.result?.Next_billing_date?.iso;
      const allowedUsers = tenatRes.data?.result?.result?.AllowedUsers || 0;
      adminId = tenatRes?.data?.result?.result?.ExtUserPtr?.objectId;
      localStorage.setItem("allowedUsers", allowedUsers);
    }
    return { plan, billingDate, status, adminId };
  } catch (err) {
    console.log("Err in fetch subscription", err);
    return { plan: "", billingDate: "", status: "", adminId: "" };
  }
}

export async function fetchSubscriptionInfo() {
  try {
    const Extand_Class = localStorage.getItem("Extand_Class");
    const extClass = Extand_Class && JSON.parse(Extand_Class);
    // console.log("extClass ", extClass);
    if (extClass && extClass.length > 0) {
      const extUser = extClass[0].objectId;
      const baseURL = localStorage.getItem("baseUrl");
      const url = `${baseURL}functions/getsubscriptions`;
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        sessionToken: localStorage.getItem("accesstoken")
      };
      const params = { extUserId: extUser };
      const tenatRes = await axios.post(url, params, { headers: headers });

      const price =
        tenatRes.data?.result?.result?.SubscriptionDetails?.data?.subscription
          ?.plan?.price;
      const totalPrice =
        tenatRes.data?.result?.result?.SubscriptionDetails?.data?.subscription
          ?.amount;
      const planId =
        tenatRes.data?.result?.result?.SubscriptionDetails?.data?.subscription
          ?.subscription_id;
      const plan_code =
        tenatRes.data?.result?.result?.SubscriptionDetails?.data?.subscription
          ?.plan?.plan_code;
      const totalAllowedUser = tenatRes.data?.result?.result?.AllowedUsers || 0;
      return {
        status: "success",
        price: price,
        totalPrice: totalPrice,
        planId: planId,
        plan_code: plan_code,
        totalAllowedUser: totalAllowedUser
      };
    }
  } catch (err) {
    console.log("Err in fetch subscription", err);
    return { status: "error", error: err };
  }
}
//function to get subcripition details from subscription class
export async function checkIsSubscribed() {
  try {
    const res = await fetchSubscription();
    if (res.plan === "freeplan") {
      return { plan: res.plan, isValid: false, adminId: res?.adminId };
    } else if (res.billingDate) {
      const plan = validplan[res.plan] || false;
      if (plan && new Date(res.billingDate) > new Date()) {
        return { plan: res.plan, isValid: true, adminId: res?.adminId };
      } else if (new Date(res.billingDate) > new Date()) {
        return { plan: res.plan, isValid: true, adminId: res?.adminId };
      } else {
        return { plan: res.plan, isValid: false, adminId: res?.adminId };
      }
    } else {
      return { plan: res.plan, isValid: false, adminId: res?.adminId };
    }
  } catch (err) {
    console.log("Err in fetch subscription", err);
    return { plan: "no-plan", isValid: false, adminId: "" };
  }
}

export const color = [
  "#93a3db",
  "#e6c3db",
  "#c0e3bc",
  "#bce3db",
  "#b8ccdb",
  "#ceb8db",
  "#ffccff",
  "#99ffcc",
  "#cc99ff",
  "#ffcc99",
  "#66ccff",
  "#ffffcc"
];

export const nameColor = [
  "#304fbf",
  "#7d5270",
  "#5f825b",
  "#578077",
  "#576e80",
  "#6d527d",
  "#cc00cc",
  "#006666",
  "#cc00ff",
  "#ff9900",
  "#336699",
  "#cc9900"
];
export const toDataUrl = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      resolve(e.target.result);
    };
  });
};

//function for getting document details for getDrive cloud function
export const getDrive = async (documentId, skip = 0, limit = 100) => {
  const data = {
    docId: documentId && documentId,
    limit: limit,
    skip: skip
  };
  const driveDeatils = await axios
    .post(`${localStorage.getItem("baseUrl")}functions/getDrive`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        sessiontoken: localStorage.getItem("accesstoken")
      }
    })
    .then((Listdata) => {
      const json = Listdata.data;

      if (json && json.result.error) {
        return json;
      } else if (json && json.result) {
        const data = json.result;
        return data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      console.log("Err in getDrive cloud function", err);
      return "Error: Something went wrong!";
    });

  return driveDeatils;
};

// `pdfNewWidthFun` function is used to calculate pdf width to render in middle container
export const pdfNewWidthFun = (divRef) => {
  const pdfWidth = divRef.current.offsetWidth;
  return pdfWidth;
};

//`contractUsers` function is used to get contract_User details
export const contractUsers = async () => {
  try {
    const userDetails = await Parse.Cloud.run("getUserDetails");
    let data = [];
    if (userDetails) {
      const json = JSON.parse(JSON.stringify(userDetails));
      data.push(json);
    }
    return data;
  } catch (err) {
    console.log("Err in getUserDetails cloud function", err);
    return "Error: Something went wrong!";
  }
};

//function for resize image and update width and height for mulitisigners
export const handleImageResize = (
  ref,
  key,
  signerPos,
  setSignerPos,
  pageNumber,
  containerScale,
  scale,
  signerId,
  showResize
) => {
  const filterSignerPos = signerPos.filter((data) => data.Id === signerId);
  if (filterSignerPos.length > 0) {
    const getPlaceHolder = filterSignerPos[0].placeHolder;
    const getPageNumer = getPlaceHolder.filter(
      (data) => data.pageNumber === pageNumber
    );
    if (getPageNumer.length > 0) {
      const getXYdata = getPageNumer[0].pos;
      const getPosData = getXYdata;
      const addSignPos = getPosData.map((url) => {
        if (url.key === key) {
          return {
            ...url,
            Width: ref.offsetWidth / (containerScale * scale),
            Height: ref.offsetHeight / (containerScale * scale),
            IsResize: showResize ? true : false
          };
        }
        return url;
      });

      const newUpdateSignPos = getPlaceHolder.map((obj) => {
        if (obj.pageNumber === pageNumber) {
          return { ...obj, pos: addSignPos };
        }
        return obj;
      });

      const newUpdateSigner = signerPos.map((obj) => {
        if (obj.Id === signerId) {
          return { ...obj, placeHolder: newUpdateSignPos };
        }
        return obj;
      });

      setSignerPos(newUpdateSigner);
    }
  }
};
export const widgets = [
  {
    type: "signature",
    icon: "fa-light fa-pen-nib",
    iconSize: "20px"
  },
  {
    type: "stamp",
    icon: "fa-light fa-stamp",
    iconSize: "19px"
  },
  {
    type: "initials",
    icon: "fa-light fa-signature",
    iconSize: "15px"
  },
  {
    type: "name",
    icon: "fa-light fa-user",
    iconSize: "21px"
  },
  {
    type: "job title",
    icon: "fa-light fa-address-card",
    iconSize: "17px"
  },
  {
    type: "company",
    icon: "fa-light fa-building",
    iconSize: "25px"
  },
  {
    type: "date",
    icon: "fa-light fa-calendar-days",
    iconSize: "20px"
  },
  {
    type: textWidget,
    icon: "fa-light fa-text-width",
    iconSize: "20px"
  },
  {
    type: textInputWidget,
    icon: "fa-light fa-font",
    iconSize: "21px"
  },
  {
    type: "checkbox",
    icon: "fa-light fa-square-check",
    iconSize: "22px"
  },
  {
    type: "dropdown",
    icon: "fa-light fa-circle-chevron-down",
    iconSize: "19px"
  },
  {
    type: radioButtonWidget,
    icon: "fa-light fa-circle-dot",
    iconSize: "20px"
  },
  {
    type: "image",
    icon: "fa-light fa-image",
    iconSize: "20px"
  },
  {
    type: "email",
    icon: "fa-light fa-envelope",
    iconSize: "20px"
  }
];

export const getDate = () => {
  const date = new Date();
  const milliseconds = date.getTime();
  const newDate = moment(milliseconds).format("MM/DD/YYYY");
  return newDate;
};
export const addWidgetOptions = (type) => {
  const defaultOpt = {
    name: type,
    status: "required"
  };
  switch (type) {
    case "signature":
      return defaultOpt;
    case "stamp":
      return defaultOpt;
    case "checkbox":
      return {
        ...defaultOpt,
        options: { isReadOnly: false, isHideLabel: false }
      };
    case textInputWidget:
      return { ...defaultOpt };
    case "initials":
      return defaultOpt;
    case "name":
      return { ...defaultOpt };
    case "company":
      return { ...defaultOpt };
    case "job title":
      return { ...defaultOpt };
    case "date":
      return {
        ...defaultOpt,
        response: getDate(),
        validation: { format: "MM/dd/yyyy", type: "date-format" }
      };
    case "image":
      return defaultOpt;
    case "email":
      return { ...defaultOpt, validation: { type: "email", pattern: "" } };
    case "dropdown":
      return defaultOpt;
    case radioButtonWidget:
      return {
        ...defaultOpt,
        values: [],
        isReadOnly: false,
        isHideLabel: false
      };
    case textWidget:
      return defaultOpt;
    default:
      return {};
  }
};
export const getWidgetType = (item, widgetName) => {
  return (
    <div className="op-btn w-fit md:w-[100%] op-btn-primary op-btn-outline op-btn-sm focus:outline-none outline outline-[1.5px] ml-[6px] md:ml-0 p-0 overflow-hidden">
      <div className="w-full h-full flex md:justify-between items-center">
        <div className="flex justify-start items-center text-[13px] ml-1">
          {!isMobile && <i className="fa-light fa-grip-vertical ml-[3px]"></i>}
          <span className="md:inline-block text-center text-[15px] ml-[5px] font-semibold pr-1 md:pr-0">
            {widgetName}
          </span>
        </div>
        <div className="text-[20px] op-btn op-btn-primary rounded-none w-[40px] h-full flex justify-center items-center">
          <i className={item.icon}></i>
        </div>
      </div>
    </div>
  );
};

export const defaultWidthHeight = (type) => {
  switch (type) {
    case "signature":
      return { width: 150, height: 60 };
    case "stamp":
      return { width: 150, height: 60 };
    case "checkbox":
      return { width: 15, height: 15 };
    case textInputWidget:
      return { width: 150, height: 25 };
    case "dropdown":
      return { width: 120, height: 22 };
    case "initials":
      return { width: 50, height: 50 };
    case "name":
      return { width: 150, height: 25 };
    case "company":
      return { width: 150, height: 25 };
    case "job title":
      return { width: 150, height: 25 };
    case "date":
      return { width: 100, height: 20 };
    case "image":
      return { width: 70, height: 70 };
    case "email":
      return { width: 150, height: 20 };
    case radioButtonWidget:
      return { width: 5, height: 10 };
    case textWidget:
      return { width: 150, height: 25 };
    default:
      return { width: 150, height: 60 };
  }
};

export const resizeBorderExtraWidth = () => {
  return 20;
};

export async function getBase64FromUrl(url, autosign) {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const pdfBase = this.result;
      if (autosign) {
        resolve(pdfBase);
      } else {
        const suffixbase64 = pdfBase.split(",").pop();
        resolve(suffixbase64);
      }
    };
  });
}

export async function getBase64FromIMG(url) {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const pdfBase = this.result;

      resolve(pdfBase);
    };
  });
}
//function for convert signature png base64 url to jpeg base64
export const convertPNGtoJPEG = (base64Data) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = base64Data;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff"; // white color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      // Convert to JPEG by using the canvas.toDataURL() method
      const jpegBase64Data = canvas.toDataURL("image/jpeg");

      resolve(jpegBase64Data);
    };

    img.onerror = (error) => {
      reject(error);
    };
  });
};

//function for resize image and update width and height for sign-yourself
export const handleSignYourselfImageResize = (
  ref,
  key,
  xyPostion,
  setXyPostion,
  index,
  containerScale,
  scale
) => {
  const getXYdata = xyPostion[index].pos;
  const getPosData = getXYdata;
  const addSign = getPosData.map((url) => {
    if (url.key === key) {
      return {
        ...url,
        Width: ref.offsetWidth / (scale * containerScale),
        Height: ref.offsetHeight / (scale * containerScale),
        IsResize: true
      };
    }
    return url;
  });

  const newUpdateUrl = xyPostion.map((obj, ind) => {
    if (ind === index) {
      return { ...obj, pos: addSign };
    }
    return obj;
  });
  setXyPostion(newUpdateUrl);
};

//function for call cloud function signPdf and generate digital signature
export const signPdfFun = async (
  base64Url,
  documentId,
  signerObjectId,
  objectId,
  isSubscribed,
  activeMailAdapter,
  widgets
) => {
  let isCustomCompletionMail = false;
  try {
    //get tenant details
    const tenantDetails = await getTenantDetails(objectId);
    if (tenantDetails && tenantDetails === "user does not exist!") {
      return { status: "error", message: "User does not exist." };
    } else {
      if (
        tenantDetails?.CompletionBody &&
        tenantDetails?.CompletionSubject &&
        isSubscribed
      ) {
        isCustomCompletionMail = true;
      }
    }

    // below for loop is used to get first signature of user to send if to signpdf
    // for adding it in completion certificate
    let getSignature;
    for (let item of widgets) {
      if (!getSignature) {
        const typeExist = item.pos.some((data) => data?.type);
        if (typeExist) {
          getSignature = item.pos.find((data) => data?.type === "signature");
        } else {
          getSignature = item.pos.find((data) => !data.isStamp);
        }
      }
    }

    let base64Sign = getSignature.SignUrl;
    //check https type signature (default signature exist) then convert in base64
    const isUrl = base64Sign.includes("https");
    if (isUrl) {
      try {
        base64Sign = await fetchImageBase64(base64Sign);
      } catch (e) {
        console.log("error", e);
        return { status: "error", message: "something went wrong." };
      }
    }
    //change image width and height to 100/40 in png base64
    const getNewse64 = await changeImageWH(base64Sign);
    //remove suffiix of base64
    const suffixbase64 = getNewse64 && getNewse64.split(",").pop();

    const params = {
      mailProvider: activeMailAdapter,
      pdfFile: base64Url,
      docId: documentId,
      userId: signerObjectId,
      isCustomCompletionMail: isCustomCompletionMail,
      signature: suffixbase64
    };
    const resSignPdf = await Parse.Cloud.run("signPdf", params);
    if (resSignPdf) {
      const signedPdf = JSON.parse(JSON.stringify(resSignPdf));
      return signedPdf;
    }
  } catch (e) {
    console.log("Err in signPdf cloud function ", e.message);
    if (e && e?.message?.includes("is encrypted.")) {
      return {
        status: "error",
        message: "Currently encrypted pdf files are not supported."
      };
    } else if (
      e.message === "PKCS#12 MAC could not be verified. Invalid password?"
    ) {
      return { status: "error", message: "PFX file password is invalid." };
    } else {
      return { status: "error", message: "something went wrong." };
    }
  }
};

export const randomId = () => {
  const randomBytes = crypto.getRandomValues(new Uint16Array(1));
  const randomValue = randomBytes[0];
  const randomDigit = 1000 + (randomValue % 9000);
  return randomDigit;
};

export const createDocument = async (
  template,
  placeholders,
  signerData,
  pdfUrl
) => {
  if (template && template.length > 0) {
    const Doc = template[0];

    let placeholdersArr = [];
    if (placeholders?.length > 0) {
      placeholdersArr = placeholders;
    }
    let signers = [];
    if (signerData?.length > 0) {
      signerData.forEach((x) => {
        if (x.objectId) {
          const obj = {
            __type: "Pointer",
            className: "contracts_Contactbook",
            objectId: x.objectId
          };
          signers.push(obj);
        }
      });
    }
    const data = {
      Name: Doc.Name,
      URL: pdfUrl,
      SignedUrl: Doc.SignedUrl,
      SentToOthers: Doc.SentToOthers,
      Description: Doc.Description,
      Note: Doc.Note,
      Placeholders: placeholdersArr,
      ExtUserPtr: {
        __type: "Pointer",
        className: "contracts_Users",
        objectId: Doc.ExtUserPtr.objectId
      },
      CreatedBy: {
        __type: "Pointer",
        className: "_User",
        objectId: Doc.CreatedBy.objectId
      },
      Signers: signers,
      SendinOrder: Doc?.SendinOrder || false,
      AutomaticReminders: Doc?.AutomaticReminders || false,
      RemindOnceInEvery: parseInt(Doc?.RemindOnceInEvery || 5)
    };

    try {
      const res = await axios.post(
        `${localStorage.getItem("baseUrl")}classes/contracts_Document`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        }
      );
      if (res) {
        return { status: "success", id: res.data.objectId };
      }
    } catch (err) {
      console.log("axois err ", err);
      return { status: "error", id: "Something Went Wrong!" };
    }
  }
};

export const getFirstLetter = (name) => {
  const firstLetter = name?.charAt(0);
  return firstLetter;
};

export const darkenColor = (color, factor) => {
  // Remove '#' from the color code and parse it to get RGB values
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken the color by reducing each RGB component
  const darkerR = Math.floor(r * (1 - factor));
  const darkerG = Math.floor(g * (1 - factor));
  const darkerB = Math.floor(b * (1 - factor));

  // Convert the darkened RGB components back to hex
  return `#${((darkerR << 16) | (darkerG << 8) | darkerB)
    .toString(16)
    .padStart(6, "0")}`;
};

export const addZIndex = (signerPos, key, setZIndex) => {
  return signerPos.map((item) => {
    if (item.placeHolder && item.placeHolder.length > 0) {
      // If there is a nested array, recursively add the field to the last object
      return {
        ...item,
        placeHolder: addZIndex(item.placeHolder, key, setZIndex)
      };
    } else if (item.pos && item.pos.length > 0) {
      // If there is no nested array, add the new field
      return {
        ...item,
        pos: addZIndex(item.pos, key, setZIndex)
        // Adjust this line to add the desired field
      };
    } else {
      if (item.key === key) {
        setZIndex(item.zIndex);
        return {
          ...item,
          zIndex: item.zIndex ? item.zIndex + 1 : 1
        };
      } else {
        return {
          ...item
        };
      }
    }
  });
};

//function for save widgets value on onchange function
export const onChangeInput = (
  value,
  signKey,
  xyPostion,
  index,
  setXyPostion,
  userId,
  initial,
  dateFormat,
  isDefaultEmpty,
  isRadio,
  fontSize,
  fontColor
) => {
  const isSigners = xyPostion.some((data) => data.signerPtr);
  let filterSignerPos;
  if (isSigners) {
    if (userId) {
      filterSignerPos = xyPostion.filter((data) => data.Id === userId);
    }
    const getPlaceHolder = filterSignerPos[0]?.placeHolder;
    if (initial) {
      const xyData = addInitialData(xyPostion, setXyPostion, value, userId);
      setXyPostion(xyData);
    } else {
      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === index
      );
      if (getPageNumer.length > 0) {
        const getXYdata = getPageNumer[0].pos;
        const getPosData = getXYdata;
        const addSignPos = getPosData.map((position) => {
          if (position.key === signKey) {
            if (dateFormat) {
              return {
                ...position,
                options: {
                  ...position.options,
                  response: value,
                  fontSize: fontSize,
                  fontColor: fontColor,
                  validation: {
                    type: "date-format",
                    format: dateFormat // This indicates the required date format explicitly.
                  }
                }
              };
            } else if (isDefaultEmpty) {
              return {
                ...position,
                options: {
                  ...position.options,
                  response: value,
                  defaultValue: isRadio ? "" : []
                }
              };
            } else {
              return {
                ...position,
                options: {
                  ...position.options,
                  response: value
                }
              };
            }
          }
          return position;
        });
        const newUpdateSignPos = getPlaceHolder.map((obj) => {
          if (obj.pageNumber === index) {
            return { ...obj, pos: addSignPos };
          }
          return obj;
        });

        const newUpdateSigner = xyPostion.map((obj) => {
          if (obj.Id === userId) {
            return { ...obj, placeHolder: newUpdateSignPos };
          }
          return obj;
        });

        setXyPostion(newUpdateSigner);
      }
    }
  } else {
    let getXYdata = xyPostion[index].pos;
    const updatePosition = getXYdata.map((positionData) => {
      if (positionData.key === signKey) {
        if (dateFormat) {
          return {
            ...positionData,
            options: {
              ...positionData.options,
              response: value,
              fontSize: fontSize,
              fontColor: fontColor,
              validation: {
                type: "date-format",
                format: dateFormat // This indicates the required date format explicitly.
              }
            }
          };
        } else {
          return {
            ...positionData,
            options: {
              ...positionData.options,
              response: value
            }
          };
        }
      }
      return positionData;
    });

    const updatePlaceholder = xyPostion.map((obj, ind) => {
      if (ind === index) {
        return { ...obj, pos: updatePosition };
      }
      return obj;
    });
    setXyPostion(updatePlaceholder);
  }
};

//function to increase height of text area on press enter
export const onChangeHeightOfTextArea = (
  height,
  widgetType,
  signKey,
  xyPostion,
  index,
  setXyPostion,
  userId
) => {
  const isSigners = xyPostion.some((data) => data.signerPtr);
  let filterSignerPos;
  if (isSigners) {
    if (userId) {
      filterSignerPos = xyPostion.filter((data) => data.Id === userId);
    }
    const getPlaceHolder = filterSignerPos[0]?.placeHolder;

    const getPageNumer = getPlaceHolder.filter(
      (data) => data.pageNumber === index
    );
    if (getPageNumer.length > 0) {
      const getXYdata = getPageNumer[0].pos;
      const getPosData = getXYdata;
      const addSignPos = getPosData.map((position) => {
        if (position.key === signKey) {
          return {
            ...position,
            Height: position.Height
              ? position.Height + height
              : defaultWidthHeight(widgetType).height + height
          };
        }
        return position;
      });
      const newUpdateSignPos = getPlaceHolder.map((obj) => {
        if (obj.pageNumber === index) {
          return { ...obj, pos: addSignPos };
        }
        return obj;
      });

      const newUpdateSigner = xyPostion.map((obj) => {
        if (obj.Id === userId) {
          return { ...obj, placeHolder: newUpdateSignPos };
        }
        return obj;
      });

      setXyPostion(newUpdateSigner);
    }
  } else {
    let getXYdata = xyPostion[index].pos;

    const updatePosition = getXYdata.map((position) => {
      if (position.key === signKey) {
        return {
          ...position,
          Height: position.Height
            ? position.Height + height
            : defaultWidthHeight(widgetType).height + height
        };
      }
      return position;
    });

    const updatePlaceholder = xyPostion.map((obj, ind) => {
      if (ind === index) {
        return { ...obj, pos: updatePosition };
      }
      return obj;
    });
    setXyPostion(updatePlaceholder);
  }
};
//calculate width and height
export const calculateInitialWidthHeight = (widgetData) => {
  const intialText = widgetData;
  const span = document.createElement("span");
  span.textContent = intialText;
  span.style.font = `14px`; // here put your text size and font family
  span.style.display = "hidden";
  document.body.appendChild(span);
  const width = span.offsetWidth;
  const height = span.offsetHeight;

  document.body.removeChild(span);
  return {
    getWidth: width,
    getHeight: height
  };
};
export const addInitialData = (signerPos, setXyPostion, value, userId) => {
  function widgetDataValue(type) {
    switch (type) {
      case "name":
        return value?.Name;
      case "company":
        return value?.Company;
      case "job title":
        return value?.JobTitle;
      case "email":
        return value?.Email;
      default:
        return "";
    }
  }
  return signerPos.map((item) => {
    if (item.placeHolder && item.placeHolder.length > 0) {
      // If there is a nested array, recursively add the field to the last object
      if (item.Id === userId) {
        return {
          ...item,
          placeHolder: addInitialData(
            item.placeHolder,
            setXyPostion,
            value,
            userId
          )
        };
      } else {
        return {
          ...item
        };
      }
    } else if (item.pos && item.pos.length > 0) {
      // If there is no nested array, add the new field
      return {
        ...item,
        pos: addInitialData(item.pos, setXyPostion, value, userId)
        // Adjust this line to add the desired field
      };
    } else {
      const widgetData = widgetDataValue(item.type);
      if (["name", "company", "job title", "email"].includes(item.type)) {
        return {
          ...item,
          options: {
            ...item.options,
            defaultValue: widgetData
          }
          // Width:
          //   calculateInitialWidthHeight(item.type, widgetData).getWidth ||
          //   item?.Width,
          // Height:
          //   calculateInitialWidthHeight(item.type, widgetData).getHeight ||
          //   item?.Height
        };
      } else {
        return {
          ...item
        };
      }
    }
  });
};

//function for embed document id
export const embedDocId = async (pdfDoc, documentId, allPages) => {
  // `fontBytes` is used to embed custom font in pdf
  const fontBytes = await fileasbytes(
    "https://cdn.opensignlabs.com/webfonts/times.ttf"
  );
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  for (let i = 0; i < allPages; i++) {
    const fontSize = 10;
    const textContent = documentId && `OpenSign™ DocumentId: ${documentId} `;
    const pages = pdfDoc.getPages();
    const page = pages[i];
    const getObj = compensateRotation(
      page.getRotation().angle,
      10,
      5,
      1,
      page.getSize(),
      fontSize,
      rgb(0.5, 0.5, 0.5),
      font,
      page
    );
    page.drawText(textContent, getObj);
  }
};

//function for save button to save signature or image url
export function onSaveSign(
  type,
  xyPostion,
  index,
  signKey,
  signatureImg,
  imgWH,
  isDefaultSign,
  isTypeText
) {
  let getIMGWH;
  let getXYdata = xyPostion[index].pos;
  const updateXYData = getXYdata.map((position) => {
    if (position.key === signKey) {
      if (isDefaultSign === "initials") {
        let imgWH = { width: position.Width, height: position.Height };
        getIMGWH = calculateImgAspectRatio(imgWH, position);
      } else if (isDefaultSign === "default") {
        getIMGWH = calculateImgAspectRatio(imgWH, position);
      } else if (isTypeText) {
        getIMGWH = { newWidth: imgWH.width, newHeight: imgWH.height };
      } else {
        const defaultWidth = defaultWidthHeight(position?.type).width;
        const defaultHeight = defaultWidthHeight(position?.type).height;

        getIMGWH = calculateImgAspectRatio(
          {
            width: defaultWidth ? defaultWidth : 150,
            height: defaultHeight ? defaultHeight : 60
          },
          position
        );
      }

      const posWidth = getIMGWH ? getIMGWH.newWidth : 150;
      const posHeight = getIMGWH ? getIMGWH.newHeight : 60;

      return {
        ...position,
        Width: posWidth,
        Height: posHeight,
        SignUrl: signatureImg,
        signatureType: type && type,
        options: {
          ...position.options,
          response: signatureImg
        }
      };
    }
    return position;
  });

  const updateXYposition = xyPostion.map((obj, ind) => {
    if (ind === index) {
      return { ...obj, pos: updateXYData };
    }
    return obj;
  });
  return updateXYposition;
}

export const calculateImgAspectRatio = (imgWH, pos) => {
  let newWidth, newHeight;

  const placeholderHeight = pos && pos.Height ? pos.Height : 60;
  const aspectRatio = imgWH.width / imgWH.height;
  newWidth = aspectRatio * placeholderHeight;
  newHeight = placeholderHeight;

  return { newHeight, newWidth };
};

//function for upload stamp or image
export function onSaveImage(xyPostion, index, signKey, imgWH, image) {
  let getIMGWH;

  //get current page position
  const getXYData = xyPostion[index].pos;
  const updateXYData = getXYData.map((position) => {
    if (position.key === signKey) {
      getIMGWH = calculateImgAspectRatio(imgWH, position);

      return {
        ...position,
        Width: getIMGWH.newWidth,
        Height: getIMGWH.newHeight,
        SignUrl: image.src,
        ImageType: image.imgType,
        options: {
          ...position.options,
          response: image.src
        }
      };
    }
    return position;
  });

  const updateXYposition = xyPostion.map((obj, ind) => {
    if (ind === index) {
      return { ...obj, pos: updateXYData };
    }
    return obj;
  });
  return updateXYposition;
}

//function for select image and upload image
export const onImageSelect = (event, setImgWH, setImage) => {
  const imageType = event.target.files[0].type;
  const reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);
  reader.onloadend = function (e) {
    let width, height;
    const image = new Image();

    image.src = e.target.result;
    image.onload = function () {
      width = image.width;
      height = image.height;
      const aspectRatio = 460 / 184;
      const imgR = width / height;

      if (imgR > aspectRatio) {
        width = 460;
        height = 460 / imgR;
      } else {
        width = 184 * imgR;
        height = 184;
      }
      setImgWH({ width: width, height: height });
    };

    image.src = reader.result;

    setImage({ src: image.src, imgType: imageType });
  };
};
//convert https url to base64
export const fetchImageBase64 = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  } catch (error) {
    throw new Error("Error converting URL to base64:", error);
  }
};
//function for select image and upload image
export const changeImageWH = async (base64Image) => {
  const newWidth = 300;
  const newHeight = 120;
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      const resizedBase64 = canvas.toDataURL("image/png", 1.0);
      resolve(resizedBase64);
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
};

//function to calculate font size of text area widgets
const calculateFontSize = (position, containerScale, signyourself) => {
  const font = position?.options?.fontSize || 12;
  if (!signyourself && position?.isMobile && position?.scale) {
    return font / position?.scale / containerScale;
  } else {
    return font / containerScale;
  }
};

const getWidgetsFontColor = (type) => {
  switch (type) {
    case "red":
      return rgb(1, 0, 0);
    case "black":
      return rgb(0, 0, 0);
    case "blue":
      return rgb(0, 0, 1);
    case "yellow":
      return rgb(0.9, 1, 0);
    default:
      return rgb(0, 0, 0);
  }
};
//function for embed multiple signature using pdf-lib
export const multiSignEmbed = async (
  widgets,
  pdfDoc,
  signyourself,
  scale,
  pdfOriginalWH,
  containerWH
) => {
  // `fontBytes` is used to embed custom font in pdf
  const fontBytes = await fileasbytes(
    "https://cdn.opensignlabs.com/webfonts/times.ttf"
  );
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes, { subset: true });
  for (let item of widgets) {
    const containerScale = getContainerScale(
      pdfOriginalWH,
      item?.pageNumber,
      containerWH
    );
    const typeExist = item.pos.some((data) => data?.type);
    let updateItem;

    if (typeExist) {
      if (signyourself) {
        updateItem = item.pos;
      } else {
        updateItem = item.pos.filter(
          (data) => data?.options?.status === "required"
        );
      }
    } else {
      updateItem = item.pos;
    }
    const pageNo = item.pageNumber;
    const widgetsPositionArr = updateItem;
    const pages = pdfDoc.getPages();
    const form = pdfDoc.getForm();
    const page = pages[pageNo - 1];
    const images = await Promise.all(
      widgetsPositionArr.map(async (url) => {
        let signUrl = url.SignUrl && url.SignUrl;
        if (signUrl) {
          if (url.ImageType === "image/png") {
            //function for convert signature png base64 url to jpeg base64
            const newUrl = await convertPNGtoJPEG(signUrl);
            signUrl = newUrl;
          }
          const res = await fetch(signUrl);
          return res.arrayBuffer();
        }
      })
    );

    widgetsPositionArr.forEach(async (position, id) => {
      let img;
      if (["signature", "stamp", "initials", "image"].includes(position.type)) {
        if (
          (position.ImageType && position.ImageType === "image/png") ||
          position.ImageType === "image/jpeg"
        ) {
          img = await pdfDoc.embedJpg(images[id]);
        } else {
          img = await pdfDoc.embedPng(images[id]);
        }
      } else if (!position.type) {
        if (
          (position.ImageType && position.ImageType === "image/png") ||
          position.ImageType === "image/jpeg"
        ) {
          img = await pdfDoc.embedJpg(images[id]);
        } else {
          img = await pdfDoc.embedPng(images[id]);
        }
      }
      let widgetWidth, widgetHeight;
      widgetWidth = placeholderWidth(position);
      widgetHeight = placeholderHeight(position);
      const xPos = (position) => {
        const resizePos = position.xPosition;
        //first two condition handle to old data already saved from mobile view which scale point diffrent
        if (isMobile && position.isMobile) {
          //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
          const x = resizePos * (position.scale / scale);
          return x * scale;
        } else if (position.isMobile && position.scale) {
          const x = resizePos * position.scale;
          return x;
        } else {
          return resizePos;
        }
      };
      const yPos = (position) => {
        const resizePos = position.yPosition;

        if (position.isMobile && position.scale) {
          if (position.IsResize) {
            const y = resizePos * position.scale;
            return y;
          } else {
            const y = resizePos * position.scale;
            return y;
          }
        } else {
          return resizePos;
        }
      };
      const color = position?.options?.fontColor;
      const updateColorInRgb = getWidgetsFontColor(color);
      const fontSize = parseInt(position?.options?.fontSize || 13);
      const widgetTypeExist = [
        textWidget,
        textInputWidget,
        "name",
        "company",
        "job title",
        "date",
        "email"
      ].includes(position.type);
      if (position.type === "checkbox") {
        let checkboxGapFromTop, isCheck;
        let y = yPos(position);
        const optionsFontSize = fontSize || 13;
        const checkboxSize = fontSize;
        const checkboxTextGapFromLeft = fontSize + 5 || 22;
        if (position?.options?.values.length > 0) {
          position?.options?.values.forEach((item, ind) => {
            const checkboxRandomId = "checkbox" + randomId();

            if (
              position?.options?.response &&
              position?.options?.response?.length > 0
            ) {
              isCheck = position?.options?.response?.includes(ind);
            } else if (position?.options?.defaultValue) {
              isCheck = position?.options?.defaultValue?.includes(ind);
            }

            const checkbox = form.createCheckBox(checkboxRandomId);

            if (ind > 0) {
              y = y + checkboxGapFromTop;
            } else {
              checkboxGapFromTop = fontSize + 5 || 26;
            }

            if (!position?.options?.isHideLabel) {
              // below line of code is used to embed label with radio button in pdf
              const optionsPosition = compensateRotation(
                page.getRotation().angle,
                xPos(position) + checkboxTextGapFromLeft,
                y,
                1,
                page.getSize(),
                optionsFontSize,
                updateColorInRgb,
                font,
                page
              );
              page.drawText(item, optionsPosition);
            }
            let checkboxObj = {
              x: xPos(position),
              y: y,
              width: checkboxSize,
              height: checkboxSize
            };
            checkboxObj = getWidgetPosition(page, checkboxObj, 1);
            checkbox.addToPage(page, checkboxObj);

            //applied which checkbox should be checked
            if (isCheck) {
              checkbox.check();
            } else {
              checkbox.uncheck();
            }
            checkbox.enableReadOnly();
          });
        }
      } else if (widgetTypeExist) {
        const fontSize = calculateFontSize(
          position,
          containerScale,
          signyourself
        );
        parseInt(fontSize);
        let textContent;
        if (position?.options?.response) {
          textContent = position.options?.response;
        } else if (position?.options?.defaultValue) {
          textContent = position?.options?.defaultValue;
        }
        const fixedWidth = widgetWidth; // Set your fixed width
        const isNewOnEnterLineExist = textContent.includes("\n");

        // Function to break text into lines based on the fixed width
        const NewbreakTextIntoLines = (textContent, width) => {
          const lines = [];
          let currentLine = "";

          for (const word of textContent.split(" ")) {
            //get text line width
            const lineWidth = font.widthOfTextAtSize(
              `${currentLine} ${word}`,
              fontSize
            );
            //check text content line width is less or equal to container width
            if (lineWidth <= width) {
              currentLine += ` ${word}`;
            } else {
              lines.push(currentLine.trim());
              currentLine = `${word}`;
            }
          }
          lines.push(currentLine.trim());
          return lines;
        };

        // Function to break text into lines based on when user go next line on press enter button
        const breakTextIntoLines = (textContent, width) => {
          const lines = [];

          for (const word of textContent.split("\n")) {
            const lineWidth = font.widthOfTextAtSize(`${word}`, fontSize);
            //checking string length to container width
            //if string length is less then container width it means user press enter button
            if (lineWidth <= width) {
              lines.push(word);
            }
            //else adjust text content according to width and send it in new line
            else {
              const newLine = NewbreakTextIntoLines(word, width);
              lines.push(...newLine);
            }
          }

          return lines;
        };

        //check if text content have `\n` string it means user press enter to go next line and handle condition
        //else auto adjust text content according to container width
        const lines = isNewOnEnterLineExist
          ? breakTextIntoLines(textContent, fixedWidth)
          : NewbreakTextIntoLines(textContent, fixedWidth);
        // Set initial y-coordinate for the first line
        let x = xPos(position);
        let y = yPos(position);
        // Embed each line on the page
        for (const line of lines) {
          const textPosition = compensateRotation(
            page.getRotation().angle,
            x,
            y,
            1,
            page.getSize(),
            fontSize,
            updateColorInRgb,
            font,
            page
          );
          page.drawText(line, textPosition);
          y += 18; // Adjust the line height as needed
        }
      } else if (position.type === "dropdown") {
        const fontsize = parseInt(position?.options?.fontSize) || 12;

        const dropdownRandomId = "dropdown" + randomId();
        const dropdown = form.createDropdown(dropdownRandomId);
        dropdown.addOptions(position?.options?.values);
        if (position?.options?.response) {
          dropdown.select(position.options?.response);
        } else if (position?.options?.defaultValue) {
          dropdown.select(position?.options?.defaultValue);
        }
        // Define the default appearance string
        // Example format: `/FontName FontSize Tf 0 g` where:
        // - `/FontName` is the name of the font (e.g., `/Helv` for Helvetica)
        // - `FontSize` is the size you want to set (e.g., 12)
        // - `Tf` specifies the font and size
        // - `0 g` sets the text color to black
        const defaultAppearance = `/Helv ${fontsize} Tf 0 g`;
        // Set the default appearance for the dropdown field
        dropdown.acroField.setDefaultAppearance(defaultAppearance);
        dropdown.setFontSize(fontsize);
        const dropdownObj = {
          x: xPos(position),
          y: yPos(position),
          width: widgetWidth,
          height: widgetHeight
        };
        const dropdownOption = getWidgetPosition(page, dropdownObj, 1);
        const dropdownSelected = { ...dropdownOption, font: font };
        dropdown.defaultUpdateAppearances(font);
        dropdown.addToPage(page, dropdownSelected);
        dropdown.enableReadOnly();
      } else if (position.type === radioButtonWidget) {
        const radioRandomId = "radio" + randomId();
        const radioGroup = form.createRadioGroup(radioRandomId);
        let radioOptionGapFromTop;
        const optionsFontSize = fontSize || 13;
        const radioTextGapFromLeft = fontSize + 5 || 20;
        const radioSize = fontSize;
        let y = yPos(position);
        if (position?.options?.values.length > 0) {
          position?.options?.values.forEach((item, ind) => {
            if (ind > 0) {
              y = y + radioOptionGapFromTop;
            } else {
              radioOptionGapFromTop = fontSize + 10 || 25;
            }
            if (!position?.options?.isHideLabel) {
              // below line of code is used to embed label with radio button in pdf

              const optionsPosition = compensateRotation(
                page.getRotation().angle,
                xPos(position) + radioTextGapFromLeft,
                y,
                1,
                page.getSize(),
                optionsFontSize,
                updateColorInRgb,
                font,
                page
              );

              page.drawText(item, optionsPosition);
            }
            let radioObj = {
              x: xPos(position),
              y: y,
              width: radioSize,
              height: radioSize
            };

            radioObj = getWidgetPosition(page, radioObj, 1);
            radioGroup.addOptionToPage(item, page, radioObj);
          });
        }
        if (position?.options?.response) {
          radioGroup.select(position.options?.response);
        } else if (position?.options?.defaultValue) {
          radioGroup.select(position?.options?.defaultValue);
        }
        radioGroup.enableReadOnly();
      } else {
        const signature = {
          x: xPos(position),
          y: yPos(position),
          width: widgetWidth,
          height: widgetHeight
        };

        const imageOptions = getWidgetPosition(page, signature, 1);
        page.drawImage(img, imageOptions);
      }
    });
  }
  const pdfBytes = await pdfDoc.saveAsBase64({ useObjectStreams: false });
  //console.log("pdf", pdfBytes);
  return pdfBytes;
};

// function for validating URLs
export function urlValidator(url) {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === "http:" || newUrl.protocol === "https:";
  } catch (err) {
    return false;
  }
}
//calculate placeholder width to embed in pdf
export const placeholderWidth = (pos) => {
  const defaultWidth = defaultWidthHeight(pos.type).width;
  const posWidth = pos.Width || defaultWidth;

  //condition to handle old data saved from mobile view to get widthh
  if (pos.isMobile && pos.scale) {
    if (pos.IsResize) {
      return posWidth;
    } else {
      return posWidth * pos.scale;
    }
  } else {
    return posWidth;
  }
};

//calculate placeholder height to embed in pdf
export const placeholderHeight = (pos) => {
  const posHeight = pos.Height;
  const defaultHeight = defaultWidthHeight(pos.type).height;
  const posUpdateHeight = posHeight || defaultHeight;

  //condition to handle old data saved from mobile view to get height
  if (pos.isMobile && pos.scale) {
    if (pos.IsResize) {
      return posUpdateHeight;
    } else {
      return posUpdateHeight * pos.scale;
    }
  } else {
    return posUpdateHeight;
  }
};

//function for getting contracts_contactbook details
export const contactBook = async (objectId) => {
  const result = await axios
    .get(
      `${localStorage.getItem(
        "baseUrl"
      )}classes/contracts_Contactbook?where={"objectId":"${objectId}"}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      }
    )
    .then((Listdata) => {
      const json = Listdata.data;
      const res = json.results;
      return res;
    })

    .catch((err) => {
      console.log("Err in contracts_Contactbook class ", err);
      return "Error: Something went wrong!";
    });
  return result;
};

//function for getting document details from contract_Documents class
export const contractDocument = async (documentId) => {
  const data = {
    docId: documentId
  };
  const documentDeatils = await axios
    .post(`${localStorage.getItem("baseUrl")}functions/getDocument`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        sessionToken: localStorage.getItem("accesstoken")
      }
    })
    .then((Listdata) => {
      const json = Listdata.data;
      let data = [];
      if (json && json.result.error) {
        return json;
      } else if (json && json.result) {
        data.push(json.result);
        return data;
      } else {
        return [];
      }
    })
    .catch((err) => {
      console.log("Err in getDocument cloud function ", err);
      return "Error: Something went wrong!";
    });

  return documentDeatils;
};

//function for add default signature or image for all requested location
export const addDefaultSignatureImg = (xyPostion, defaultSignImg) => {
  let imgWH = { width: "", height: "" };
  const img = new Image();
  img.src = defaultSignImg;
  if (img.complete) {
    imgWH = {
      width: img.width,
      height: img.height
    };
  }

  let xyDefaultPos = [];
  for (let i = 0; i < xyPostion.length; i++) {
    let getIMGWH;
    const getXYdata = xyPostion[i].pos;
    const getPageNo = xyPostion[i].pageNumber;
    const getPosData = getXYdata;

    const addSign = getPosData.map((position) => {
      getIMGWH = calculateImgAspectRatio(imgWH, position);
      if (position.type) {
        if (position?.type === "signature") {
          return {
            ...position,
            SignUrl: defaultSignImg,
            Width: getIMGWH.newWidth,
            Height: getIMGWH.newHeight,
            ImageType: "default",
            options: {
              ...position.options,
              response: defaultSignImg
            }
          };
        }
      } else if (position && !position.isStamp) {
        return {
          ...position,
          SignUrl: defaultSignImg,
          Width: getIMGWH.newWidth,
          Height: getIMGWH.newHeight,
          ImageType: "default",
          options: {
            ...position.options,
            response: defaultSignImg
          }
        };
      }
      return position;
    });

    const newXypos = {
      pageNumber: getPageNo,
      pos: addSign
    };
    xyDefaultPos.push(newXypos);
  }
  return xyDefaultPos;
};

//function for create list of year for date widget
export const range = (start, end, step) => {
  const range = [];
  for (let i = start; i <= end; i += step) {
    range.push(i);
  }
  return range;
};
//function for get month
export const getMonth = (date) => {
  const newMonth = new Date(date).getMonth();
  return newMonth;
};

//function for get year
export const getYear = (date) => {
  const newYear = new Date(date).getFullYear();
  return newYear;
};

//function to create/copy widget next to already dropped widget
export const handleCopyNextToWidget = (
  position,
  widgetType,
  xyPostion,
  index,
  setXyPostion,
  userId
) => {
  let filterSignerPos;
  //get position of previous widget and create new widget next to that widget on same data except
  // xPosition and key
  let newposition = position;
  const calculateXPosition =
    parseInt(position.xPosition) +
    defaultWidthHeight(widgetType).width +
    resizeBorderExtraWidth();
  const newId = randomId();
  newposition = { ...newposition, xPosition: calculateXPosition, key: newId };
  //if condition to create widget in request-sign flow
  if (userId) {
    filterSignerPos = xyPostion.filter((data) => data.Id === userId);
    const getPlaceHolder = filterSignerPos && filterSignerPos[0]?.placeHolder;
    const getPageNumer = getPlaceHolder?.filter(
      (data) => data.pageNumber === index
    );
    const getXYdata = getPageNumer && getPageNumer[0]?.pos;
    getXYdata.push(newposition);
    if (getPageNumer && getPageNumer.length > 0) {
      const newUpdateSignPos = getPlaceHolder.map((obj) => {
        if (obj.pageNumber === index) {
          return { ...obj, pos: getXYdata };
        }
        return obj;
      });

      const newUpdateSigner = xyPostion.map((obj) => {
        if (obj.Id === userId) {
          return { ...obj, placeHolder: newUpdateSignPos };
        }
        return obj;
      });

      setXyPostion(newUpdateSigner);
    }
  } else {
    let getXYdata = xyPostion[index]?.pos || [];
    getXYdata.push(newposition);
    const updatePlaceholder = xyPostion.map((obj, ind) => {
      if (ind === index) {
        return { ...obj, pos: getXYdata };
      }
      return obj;
    });

    setXyPostion(updatePlaceholder);
  }
};

export const getFileName = (fileUrl) => {
  if (fileUrl) {
    const url = new URL(fileUrl);
    const filename = url.pathname.substring(url.pathname.indexOf("_") + 1);
    return filename || "";
  } else {
    return "";
  }
};

//fetch tenant app logo from `partners_Tenant` class by domain name
export const getAppLogo = async () => {
  if (window.location.host === "app.opensignlabs.com") {
    return { logo: appInfo.applogo, user: "exist" };
  } else {
    const domain = window.location.host;
    try {
      const tenant = await Parse.Cloud.run("getlogobydomain", {
        domain: domain
      });
      if (tenant) {
        return { logo: tenant?.logo, user: tenant?.user };
      }
    } catch (err) {
      console.log("err in getlogo ", err);
      return { logo: appInfo.applogo, user: "exist" };
    }
  }
};

export const getTenantDetails = async (objectId) => {
  try {
    const tenantCreditsQuery = new Parse.Query("partners_Tenant");
    tenantCreditsQuery.equalTo("UserId", {
      __type: "Pointer",
      className: "_User",
      objectId: objectId
    });
    const res = await tenantCreditsQuery.first();
    if (res) {
      const updateRes = JSON.parse(JSON.stringify(res));
      return updateRes;
    }
  } catch (e) {
    return "user does not exist!";
  }
};

//function to convert variable string name to variable value of email body and subject
export function replaceMailVaribles(subject, body, variables) {
  let replacedSubject = subject;
  let replacedBody = body;

  for (const variable in variables) {
    const regex = new RegExp(`{{${variable}}}`, "g");
    if (subject) {
      replacedSubject = replacedSubject.replace(regex, variables[variable]);
    }
    if (body) {
      replacedBody = replacedBody.replace(regex, variables[variable]);
    }
  }

  const result = {
    subject: replacedSubject,
    body: replacedBody
  };
  return result;
}

export const copytoData = (url) => {
  // navigator.clipboard.writeText(text);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
  } else {
    // Fallback for browsers that don't support navigator.clipboard
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};

export const convertPdfArrayBuffer = async (url) => {
  try {
    const response = await fetch(url);
    // Check if the response was successful (status 200)
    if (!response.ok) {
      return "Error";
    }
    // Convert the response to ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error("Error fetching data:", error);
    return "Error";
  }
};
//`handleSendOTP` function is used to send otp on user's email using `SendOTPMailV1` cloud function
export const handleSendOTP = async (email) => {
  try {
    let url = `${localStorage.getItem("baseUrl")}functions/SendOTPMailV1`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId")
    };
    const body = { email: email };
    await axios.post(url, body, { headers: headers });
  } catch (error) {
    alert(error.message);
  }
};
export const fetchUrl = async (url, pdfName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      alert("something went wrong, please try again later.");
      throw new Error("Network response was not ok");
    }
    const blob = await response.blob();
    saveAs(blob, `${sanitizeFileName(pdfName)}_signed_by_OpenSign™.pdf`);
  } catch (error) {
    alert("something went wrong, please try again later.");
    console.error("Error downloading the file:", error);
  }
};
//handle download signed pdf
export const handleDownloadPdf = async (
  pdfDetails,
  pdfUrl,
  setIsDownloading
) => {
  const pdfName = pdfDetails[0] && pdfDetails[0].Name;
  setIsDownloading("pdf");
  try {
    // const url = await Parse.Cloud.run("getsignedurl", { url: pdfUrl });
    const axiosRes = await axios.post(
      `${localStorage.getItem("baseUrl")}/functions/getsignedurl`,
      { url: pdfUrl },
      {
        headers: {
          "content-type": "Application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      }
    );
    const url = axiosRes.data.result;
    await fetchUrl(url, pdfName);
    setIsDownloading("");
  } catch (err) {
    console.log("err in getsignedurl", err);
    setIsDownloading("");
    alert("something went wrong, please try again later.");
  }
};

export const sanitizeFileName = (pdfName) => {
  // Replace spaces with underscore
  return pdfName.replace(/ /g, "_");
};
//function for print digital sign pdf
export const handleToPrint = async (event, pdfUrl, setIsDownloading) => {
  event.preventDefault();
  setIsDownloading("pdf");
  try {
    // const url = await Parse.Cloud.run("getsignedurl", { url: pdfUrl });
    //`localStorage.getItem("baseUrl")` is also use in public-profile flow for public-sign
    //if we give this `appInfo.baseUrl` as a base url then in public-profile it will create base url of it's window.location.origin ex- opensign.me which is not base url
    const axiosRes = await axios.post(
      `${localStorage.getItem("baseUrl")}/functions/getsignedurl`,
      { url: pdfUrl },
      {
        headers: {
          "content-type": "Application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      }
    );
    const url = axiosRes.data.result;
    const pdf = await getBase64FromUrl(url);
    const isAndroidDevice = navigator.userAgent.match(/Android/i);
    const isAppleDevice =
      (/iPad|iPhone|iPod/.test(navigator.platform) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
      !window.MSStream;
    if (isAndroidDevice || isAppleDevice) {
      const byteArray = Uint8Array.from(
        atob(pdf)
          .split("")
          .map((char) => char.charCodeAt(0))
      );
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setIsDownloading("");
    } else {
      printModule({ printable: pdf, type: "pdf", base64: true });
      setIsDownloading("");
    }
  } catch (err) {
    setIsDownloading("");
    console.log("err in getsignedurl", err);
    alert("something went wrong, please try again later.");
  }
};

//handle download signed pdf
export const handleDownloadCertificate = async (
  pdfDetails,
  setIsDownloading
) => {
  if (pdfDetails?.length > 0 && pdfDetails[0]?.CertificateUrl) {
    try {
      await fetch(pdfDetails[0] && pdfDetails[0]?.CertificateUrl);
      const certificateUrl = pdfDetails[0] && pdfDetails[0]?.CertificateUrl;
      saveAs(certificateUrl, `Certificate_signed_by_OpenSign™.pdf`);
    } catch (err) {
      console.log("err in download in certificate", err);
    }
  } else {
    setIsDownloading("certificate");
    try {
      const data = {
        docId: pdfDetails[0]?.objectId
      };
      const docDetails = await axios.post(
        `${localStorage.getItem("baseUrl")}functions/getDocument`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
            sessionToken: localStorage.getItem("accesstoken")
          }
        }
      );
      if (docDetails.data && docDetails.data.result) {
        const doc = docDetails.data.result;
        if (doc?.CertificateUrl) {
          await fetch(doc?.CertificateUrl);
          const certificateUrl = doc?.CertificateUrl;
          saveAs(certificateUrl, `Certificate_signed_by_OpenSign™.pdf`);
          setIsDownloading("");
        } else {
          setIsDownloading("certificate");
        }
      }
    } catch (err) {
      console.log("err in download in certificate", err);
      alert("something went wrong, please try again later.");
    }
  }
};
export async function findContact(value) {
  try {
    const currentUser = Parse.User.current();
    const contactbook = new Parse.Query("contracts_Contactbook");
    contactbook.equalTo(
      "CreatedBy",
      Parse.User.createWithoutData(currentUser.id)
    );
    contactbook.notEqualTo("IsDeleted", true);
    contactbook.matches("Email", new RegExp(value, "i"));

    const contactRes = await contactbook.find();
    if (contactRes) {
      const res = JSON.parse(JSON.stringify(contactRes));
      return res;
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}
// `compensateRotation` is used to calculate x and y position of widget on portait, landscape pdf for pdf-lib
function compensateRotation(
  pageRotation,
  x,
  y,
  scale,
  dimensions,
  fontSize,
  updateColorInRgb,
  font,
  page
) {
  // Ensure pageRotation is between 0 and 360 degrees
  pageRotation = ((pageRotation % 360) + 360) % 360;
  let rotationRads = (pageRotation * Math.PI) / 180;

  // Coordinates are from bottom-left
  let coordsFromBottomLeft = { x: x / scale };
  if (pageRotation === 90 || pageRotation === 270) {
    coordsFromBottomLeft.y = dimensions.width - (y + fontSize) / scale;
  } else {
    coordsFromBottomLeft.y = dimensions.height - (y + fontSize) / scale;
  }

  let drawX = null;
  let drawY = null;

  if (pageRotation === 90) {
    drawX =
      coordsFromBottomLeft.x * Math.cos(rotationRads) -
      coordsFromBottomLeft.y * Math.sin(rotationRads) +
      dimensions.width;
    drawY =
      coordsFromBottomLeft.x * Math.sin(rotationRads) +
      coordsFromBottomLeft.y * Math.cos(rotationRads);
  } else if (pageRotation === 180) {
    drawX =
      coordsFromBottomLeft.x * Math.cos(rotationRads) -
      coordsFromBottomLeft.y * Math.sin(rotationRads) +
      dimensions.width;
    drawY =
      coordsFromBottomLeft.x * Math.sin(rotationRads) +
      coordsFromBottomLeft.y * Math.cos(rotationRads) +
      dimensions.height;
  } else if (pageRotation === 270) {
    drawX =
      coordsFromBottomLeft.x * Math.cos(rotationRads) -
      coordsFromBottomLeft.y * Math.sin(rotationRads);
    drawY =
      coordsFromBottomLeft.x * Math.sin(rotationRads) +
      coordsFromBottomLeft.y * Math.cos(rotationRads) +
      dimensions.height;
  } else if (pageRotation === 0 || pageRotation === 360) {
    // No rotation or full rotation
    drawX = coordsFromBottomLeft.x;
    drawY = coordsFromBottomLeft.y;
  }
  if (font) {
    return {
      x: drawX,
      y: drawY,
      font,
      color: updateColorInRgb,
      size: fontSize,
      rotate: page.getRotation()
    };
  } else {
    return { x: drawX, y: drawY };
  }
}

// `getWidgetPosition` is used to calulcate position of image type widget like x, y, width, height for pdf-lib
function getWidgetPosition(page, image, sizeRatio) {
  let pageWidth;
  // pageHeight;
  if ([90, 270].includes(page.getRotation().angle)) {
    pageWidth = page.getHeight();
  } else {
    pageWidth = page.getWidth();
  }
  // eslint-disable-next-line
  if (!image?.hasOwnProperty("vpWidth")) {
    image["vpWidth"] = pageWidth;
  }

  const pageRatio = pageWidth / (image.vpWidth * sizeRatio);
  const imageWidth = image.width * sizeRatio * pageRatio;
  const imageHeight = image.height * sizeRatio * pageRatio;
  const imageX = image.x * sizeRatio * pageRatio;
  const imageYFromTop = image.y * sizeRatio * pageRatio;

  const correction = compensateRotation(
    page.getRotation().angle,
    imageX,
    imageYFromTop,
    1,
    page.getSize(),
    imageHeight
  );

  return {
    width: imageWidth,
    height: imageHeight,
    x: correction.x,
    y: correction.y,
    rotate: page.getRotation()
  };
}
//function to use calculate pdf rendering scale in the container
export const getContainerScale = (pdfOriginalWH, pageNumber, containerWH) => {
  const getPdfPageWidth = pdfOriginalWH.find(
    (data) => data.pageNumber === pageNumber
  );
  const containerScale = containerWH?.width / getPdfPageWidth?.width || 1;
  return containerScale;
};

//function to get current laguage and set it in local
export const saveLanguageInLocal = (i18n) => {
  const detectedLanguage = i18n.language || "en";
  localStorage.setItem("i18nextLng", detectedLanguage);
};
//function to get default signatur eof current user from `contracts_Signature` class
export const getDefaultSignature = async (objectId) => {
  try {
    const query = new Parse.Query("contracts_Signature");
    query.equalTo("UserId", {
      __type: "Pointer",
      className: "_User",
      objectId: objectId
    });

    const result = await query.first();
    if (result) {
      const res = JSON.parse(JSON.stringify(result));
      const defaultSignature = res?.ImageURL
        ? await getBase64FromUrl(res?.ImageURL, true)
        : "";
      const defaultInitial = res?.Initials
        ? await getBase64FromUrl(res?.Initials, true)
        : "";

      return {
        status: "success",
        res: {
          defaultSignature: defaultSignature,
          defaultInitial: defaultInitial
        }
      };
    }
  } catch (err) {
    console.log("Error: error in fetch data in contracts_Signature", err);
    return {
      status: "error"
    };
  }
};

//function to rotate pdf page
export async function rotatePdfPage(
  url,
  rotateDegree,
  pageNumber,
  pdfRotateBase64
) {
  let file;

  //condition to handle pdf base64 in arrayBuffer format
  if (pdfRotateBase64) {
    file = base64ToArrayBuffer(pdfRotateBase64);
  } else {
    //condition to handle pdf url in arrayBuffer format
    file = await convertPdfArrayBuffer(url);
  }
  // Load the existing PDF
  const pdfDoc = await PDFDocument.load(file);
  // Get the page according to page number
  const page = pdfDoc.getPage(pageNumber);
  //get current page rotation angle
  const currentRotation = page.getRotation().angle;
  // Apply the rotation in the counterclockwise direction
  let newRotation = (currentRotation + rotateDegree) % 360;
  // Adjust for negative angles to keep within 0-359 range
  if (newRotation < 0) {
    newRotation += 360;
  }
  page.setRotation(degrees(newRotation));
  const pdfbase64 = await pdfDoc.saveAsBase64({ useObjectStreams: false });
  //convert base64 to arraybuffer is used in pdf-lib
  //pdfbase64 is used to show pdf rotated format
  const arrayBuffer = base64ToArrayBuffer(pdfbase64);
  //`base64` is used to show pdf
  return { arrayBuffer: arrayBuffer, base64: pdfbase64 };
}
function base64ToArrayBuffer(base64) {
  // Decode the base64 string to a binary string
  const binaryString = atob(base64);
  // Create a new ArrayBuffer with the same length as the binary string
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  // Convert the binary string to a byte array
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  // Return the ArrayBuffer
  return bytes.buffer;
}

export const convertBase64ToFile = async (pdfName, pdfBase64) => {
  const fileName = sanitizeFileName(pdfName) + ".pdf";
  const pdfFile = new Parse.File(fileName, { base64: pdfBase64 });
  // Save the Parse File if needed
  const pdfData = await pdfFile.save();
  const pdfUrl = pdfData.url();
  return pdfUrl;
};
export const onClickZoomIn = (scale, zoomPercent, setScale, setZoomPercent) => {
  setScale(scale + 0.1 * scale);
  setZoomPercent(zoomPercent + 10);
};
export const onClickZoomOut = (
  zoomPercent,
  scale,
  setZoomPercent,
  setScale
) => {
  if (zoomPercent > 0) {
    if (zoomPercent === 10) {
      setScale(1);
    } else {
      setScale(scale - 0.1 * scale);
    }
    setZoomPercent(zoomPercent - 10);
  }
};

//function to use remove widgets from current page when user want to rotate page
export const handleRemoveWidgets = (
  setSignerPos,
  signerPos,
  pageNumber,
  setIsRotate
) => {
  const updatedSignerPos = signerPos.map((placeholderObj) => {
    return {
      ...placeholderObj,
      placeHolder: placeholderObj?.placeHolder?.filter(
        (data) => data?.pageNumber !== pageNumber
      )
    };
  });
  setSignerPos(updatedSignerPos);
  setIsRotate({
    status: false,
    degree: 0
  });
};
//function to show warning when user rotate page and there are some already widgets on that page
export const handleRotateWarning = (signerPos, pageNumber) => {
  const placeholderExist = signerPos?.some((placeholderObj) =>
    placeholderObj?.placeHolder?.some((data) => data?.pageNumber === pageNumber)
  );
  if (placeholderExist) {
    return true;
  } else {
    return false;
  }
};
