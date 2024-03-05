import axios from "axios";
import { rgb } from "pdf-lib";
import moment from "moment";
import { themeColor } from "./ThemeColor/backColor";

export const isMobile = window.innerWidth < 767;

//calculate width and height
export const calculateInitialWidthHeight = (type, widgetData) => {
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
      const widgetData = widgetDataValue(item.type);
      if (["name", "company", "job title", "email"].includes(item.type)) {
        return {
          ...item,
          options: {
            ...item.options,
            response: widgetData
          },
          Width: calculateInitialWidthHeight(item.type, widgetData).getWidth,
          Height: calculateInitialWidthHeight(item.type, widgetData).getHeight
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
  isRadio
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
        const addSignPos = getPosData.map((position, ind) => {
          if (position.key === signKey) {
            if (dateFormat) {
              return {
                ...position,
                options: {
                  ...position.options,
                  response: value,
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
        return {
          ...positionData,
          options: {
            ...positionData.options,
            response: value
          }
        };
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

export const widgets = [
  {
    type: "signature",
    icon: "fa-solid fa-pen-nib",
    iconSize: "20px"
  },
  {
    type: "stamp",
    icon: "fa-solid fa-stamp",
    iconSize: "19px"
  },
  {
    type: "initials",
    icon: "fa-solid fa-signature",
    iconSize: "15px"
  },
  {
    type: "label",
    icon: "fa-solid fa-text-width",
    iconSize: "20px"
  },
  {
    type: "text",
    icon: "fa-solid fa-font",
    iconSize: "21px"
  },
  {
    type: "checkbox",
    icon: "fa-solid fa-square-check",
    iconSize: "22px"
  },
  {
    type: "dropdown",
    icon: "fa-solid fa-circle-chevron-down",
    iconSize: "19px"
  },
  {
    type: "radio",
    icon: "fa-regular fa-circle-dot",
    iconSize: "20px"
  },
  {
    type: "image",
    icon: "fa-solid fa-image",
    iconSize: "20px"
  },
  {
    type: "date",
    icon: "fa-solid fa-calendar-days",
    iconSize: "20px"
  },
  {
    type: "name",
    icon: "fa-solid fa-user",
    iconSize: "21px"
  },
  {
    type: "email",
    icon: "fa-solid fa-envelope",
    iconSize: "20px"
  },
  {
    type: "company",
    icon: "fa-solid fa-building",
    iconSize: "25px"
  },
  {
    type: "job title",
    icon: "fa-solid fa-address-card",
    iconSize: "17px"
  }
];

const getDate = () => {
  const date = new Date();
  const milliseconds = date.getTime();
  const newDate = moment(milliseconds).format("MM/DD/YYYY");
  return newDate;
};

export const addWidgetOptions = (type) => {
  const defaultOpt = {
    name: "",
    status: "required"
  };
  switch (type) {
    case "signature":
      return defaultOpt;
    case "stamp":
      return defaultOpt;
    case "checkbox":
      return defaultOpt;
    case "text":
      return { ...defaultOpt, validation: { type: "text", pattern: "" } };
    case "initials":
      return defaultOpt;
    case "name":
      return { ...defaultOpt, validation: { type: "text", pattern: "" } };
    case "company":
      return { ...defaultOpt, validation: { type: "text", pattern: "" } };
    case "job title":
      return { ...defaultOpt, validation: { type: "text", pattern: "" } };
    case "date":
      return { ...defaultOpt, response: getDate() };
    case "image":
      return defaultOpt;
    case "email":
      return { ...defaultOpt, validation: { type: "email", pattern: "" } };
    case "dropdown":
      return defaultOpt;
    case "radio":
      return { ...defaultOpt, values: [] };
    case "label":
      return defaultOpt;
    default:
      return {};
  }
};
export const getWidgetType = (item, marginLeft) => {
  return (
    <>
      <div
        className="signatureBtn widgets"
        style={{
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.18)",
          marginLeft: marginLeft && `${marginLeft}px`
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: "5px"
          }}
        >
          <i
            className="fa-sharp fa-solid fa-grip-vertical"
            style={{ color: "#908d8d", fontSize: "13px" }}
          ></i>
          <span
            style={{
              fontWeight: "400",
              fontSize: "15px",
              // padding: "3px 20px 0px 20px",
              color: "black",
              marginLeft: "5px"
            }}
          >
            {item.type}
          </span>
        </div>
        <div
          style={{
            backgroundColor: themeColor(),
            padding: "0 5px",
            display: "flex",
            alignItems: "center"
          }}
        >
          <i
            style={{ color: "white", fontSize: item.iconSize }}
            className={item.icon}
          ></i>
        </div>
      </div>
    </>
  );
};

export const defaultWidthHeight = (type) => {
  switch (type) {
    case "signature":
      return { width: 150, height: 60 };
    case "stamp":
      return { width: 150, height: 60 };
    case "checkbox":
      return { width: 15, height: 30 };
    case "text":
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
    case "radio":
      return { width: 15, height: 30 };
    case "label":
      return { width: 150, height: 17 };
    default:
      return { width: 150, height: 60 };
  }
};

export const resizeBorderExtraWidth = () => {
  return 20;
};

export async function getBase64FromUrl(url) {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const pdfBase = this.result;
      const removeBase64Prefix = "data:application/octet-stream;base64,";
      const suffixbase64 = pdfBase.replace(removeBase64Prefix, "");
      resolve(suffixbase64);
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

export function getHostUrl() {
  const hostUrl = window.location.href;

  if (hostUrl) {
    const urlSplit = hostUrl.split("/");
    const concatUrl = urlSplit[3] + "/" + urlSplit[4];

    if (urlSplit) {
      const desireUrl = "/" + concatUrl;
      if (desireUrl) {
        return desireUrl + "/";
      }
    }
  } else {
    return "/";
  }
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

//function for save button to save signature or image url
export function onSaveSign(
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
      return "Error: Something went wrong!";
    });

  return documentDeatils;
};

//function for getting document details for getDrive
export const getDrive = async (documentId) => {
  const data = {
    docId: documentId && documentId
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
      return "Error: Something went wrong!";
    });

  return driveDeatils;
};
//function for getting contract_User details
export const contractUsers = async (email) => {
  const data = {
    email: email
  };
  const userDetails = await axios
    .post(`${localStorage.getItem("baseUrl")}functions/getUserDetails`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        sessionToken: localStorage.getItem("accesstoken")
      }
    })
    .then((Listdata) => {
      const json = Listdata.data;
      let data = [];

      if (json && json.result) {
        data.push(json.result);
        return data;
      }
    })
    .catch((err) => {
      return "Error: Something went wrong!";
    });

  return userDetails;
};

//function for getting contracts_contactbook details
export const contactBook = async (objectId) => {
  const result = await axios
    .get(
      `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
        "_appName"
      )}_Contactbook?where={"objectId":"${objectId}"}`,
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
      return "Error: Something went wrong!";
    });
  return result;
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

export const placeholderWidth = (pos, scale, signyourself) => {
  let width;
  const defaultWidth = defaultWidthHeight(pos.type).width;
  const posWidth = pos.Width ? pos.Width : defaultWidth;

  if (signyourself) {
    if (isMobile) {
      return posWidth * scale;
    } else {
      return posWidth;
    }
  } else {
    if (isMobile) {
      if (pos.isMobile) {
        width = posWidth ? posWidth * scale : defaultWidth * scale;
        return width;
      } else {
        if (pos.IsResize) {
          width = posWidth ? posWidth * scale : defaultWidth * scale;
          return width;
        } else {
          width = posWidth ? posWidth : defaultWidth;
          return width;
        }
      }
    } else {
      if (pos.isMobile) {
        if (pos.IsResize) {
          width = posWidth ? posWidth : defaultWidth;
          return width;
        } else {
          width = posWidth ? posWidth * pos.scale : defaultWidth * pos.scale;

          return width;
        }
      } else {
        width = posWidth ? posWidth : defaultWidth;
        return width;
      }
    }
  }
};
export const placeholderHeight = (pos, scale, signyourself) => {
  let height;
  const posHeight = pos.Height;
  const defaultHeight = defaultWidthHeight(pos.type).height;
  if (signyourself) {
    if (isMobile) {
      return posHeight ? posHeight * scale : defaultHeight * scale;
    } else {
      return posHeight ? posHeight : defaultHeight;
    }
  } else {
    if (isMobile) {
      if (pos.isMobile) {
        height = posHeight ? posHeight * scale : defaultHeight * scale;
        return height;
      } else {
        if (pos.IsResize) {
          height = posHeight ? posHeight * scale : defaultHeight * scale;
          return height;
        } else {
          height = posHeight ? posHeight : defaultHeight;

          return height;
        }
      }
    } else {
      if (pos.isMobile) {
        if (pos.IsResize) {
          height = posHeight ? posHeight : defaultHeight;
          return height;
        } else {
          height = posHeight
            ? posHeight * pos.scale
            : defaultHeight * pos.scale;
          return height;
        }
      } else {
        height = posHeight ? posHeight : defaultHeight;
        return height;
      }
    }
  }
};
//function for embed multiple signature using pdf-lib
export const multiSignEmbed = async (
  pngUrl,
  pdfDoc,
  pdfOriginalWidth,
  signyourself,
  containerWH
) => {
  for (let item of pngUrl) {
    let updateItem = item.pos;
    if (signyourself) {
      updateItem = item;
    } else {
      updateItem = item.pos.filter(
        (data) => data?.options?.status === "required"
      );
    }
    const newWidth = containerWH.width;
    const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
    const pageNo = item.pageNumber;
    const imgUrlList = signyourself ? updateItem.pos : updateItem;
    const pages = pdfDoc.getPages();
    const form = pdfDoc.getForm();
    const page = pages[pageNo - 1];
    const images = await Promise.all(
      imgUrlList.map(async (url) => {
        let signUrl = url.SignUrl && url.SignUrl;
        if (signUrl) {
          if (url.ImageType === "image/png") {
            //function for convert signature png base64 url to jpeg base64
            const newUrl = await convertPNGtoJPEG(signUrl);
            signUrl = newUrl;
          }
          const checkUrl = urlValidator(signUrl);
          if (checkUrl) {
            signUrl = signUrl + "?get";
          }
          const res = await fetch(signUrl);
          return res.arrayBuffer();
        }
      })
    );

    imgUrlList.forEach(async (position, id) => {
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
      let scaleWidth, scaleHeight;
      scaleWidth = placeholderWidth(position, scale, signyourself);
      scaleHeight = placeholderHeight(position, scale, signyourself);

      const xPos = (pos) => {
        const resizePos = pos.xPosition;

        if (signyourself) {
          if (isMobile) {
            return resizePos * scale;
          } else {
            return resizePos;
          }
        } else {
          //checking both condition mobile and desktop view
          if (isMobile) {
            //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
            if (pos.isMobile) {
              const x = resizePos * (pos.scale / scale);
              return x * scale;
            } else {
              const x = resizePos / scale;
              return x * scale;
            }
          } else {
            //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
            if (pos.isMobile) {
              const x = resizePos * pos.scale;
              return x;
            } else {
              return resizePos;
            }
          }
        }
      };

      const yPos = (pos, ind, labelDefaultHeight) => {
        const resizePos = pos.yPosition;
        let newUpdateHeight = labelDefaultHeight
          ? labelDefaultHeight
          : scaleHeight;
        const widgetHeight =
          position.type === "radio"
            ? 10
            : position.type === "checkbox"
              ? 10
              : newUpdateHeight;
        const newHeight = ind ? (ind > 0 ? widgetHeight : 0) : widgetHeight;

        if (signyourself) {
          if (isMobile) {
            if (ind && ind > 0 && position.type === "checkbox") {
              return page.getHeight() - resizePos * scale - newHeight;
            } else if (!ind && position.type === "checkbox") {
              return page.getHeight() - resizePos * scale - 10;
            } else {
              return page.getHeight() - resizePos * scale - newHeight;
            }
            // return page.getHeight() - resizePos * scale - scaleHeight;
          } else {
            if (ind && ind > 0 && position.type === "checkbox") {
              return page.getHeight() - resizePos - newHeight;
            } else if (!ind && position.type === "checkbox") {
              return page.getHeight() - resizePos - 10;
            } else {
              return page.getHeight() - resizePos - newHeight;
            }
            // return page.getHeight() - resizePos - scaleHeight;
          }
        } else {
          //checking both condition mobile and desktop view
          const y = resizePos / scale;
          if (isMobile) {
            //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
            if (pos.isMobile) {
              const y = resizePos * (pos.scale / scale);
              return page.getHeight() - y * scale - newUpdateHeight;
            } else {
              if (pos.IsResize) {
                return page.getHeight() - y * scale - newUpdateHeight;
              } else {
                return page.getHeight() - y * scale - newUpdateHeight;
              }
            }
          } else {
            //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
            if (pos.isMobile) {
              if (pos.IsResize) {
                const y = resizePos * pos.scale;
                return page.getHeight() - y - newUpdateHeight;
              } else {
                const y = resizePos * pos.scale;
                return page.getHeight() - y - newUpdateHeight;
              }
            } else {
              if (ind && ind > 0 && position.type === "checkbox") {
                return page.getHeight() - resizePos - newHeight;
              } else if (position.type === "checkbox") {
                return page.getHeight() - resizePos - 10;
              } else {
                return page.getHeight() - resizePos - newHeight;
              }
            }
          }
        }
      };
      const randomboxId = "randombox_" + position.key;
      const widgetTypeExist = [
        "text",
        "name",
        "company",
        "job title",
        "date",
        "email"
      ].includes(position.type);
      if (position.type === "checkbox") {
        let addYPosition, isCheck;

        if (position?.options?.values.length > 0) {
          position?.options?.values.forEach((item, ind) => {
            const checkboxRandomId = "checkbox" + randomId();
            let yPosition;
            const height = 10;
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
              yPosition = yPos(position, ind) - addYPosition;
              addYPosition = addYPosition + height + 8;
            } else {
              yPosition = yPos(position, ind);
              addYPosition = height + 8;
            }
            checkbox.addToPage(page, {
              x: xPos(position),
              y: yPosition,
              width: height,
              height: height
            });
            if (isCheck) {
              checkbox.check();
            } else {
              checkbox.uncheck();
            }
            checkbox.enableReadOnly();
          });
        }
      } else if (position.type === "label") {
        const font = await pdfDoc.embedFont("Helvetica");
        const fontSize = 12;
        let textContent;
        if (position?.options?.response) {
          textContent = position.options?.response;
        } else if (position?.options?.defaultValue) {
          textContent = position?.options?.defaultValue;
        }

        const fixedWidth = scaleWidth; // Set your fixed width
        // Function to break text into lines based on the fixed width
        function breakTextIntoLines(textContent, width) {
          const lines = [];
          let currentLine = "";

          for (const word of textContent.split(" ")) {
            const lineWidth = font.widthOfTextAtSize(
              `${currentLine} ${word}`,
              fontSize
            );

            if (lineWidth <= width) {
              currentLine += ` ${word}`;
            } else {
              lines.push(currentLine.trim());
              currentLine = `${word}`;
            }
          }
          lines.push(currentLine.trim());
          return lines;
        }
        const lines = breakTextIntoLines(textContent, fixedWidth);
        // Set initial y-coordinate for the first line
        const labelDefaultHeight = defaultWidthHeight(position.type).height;

        let y = yPos(position, null, labelDefaultHeight) + 10;
        let x = xPos(position);
        //xPos(position)
        // Embed each line on the page
        for (const line of lines) {
          page.drawText(line, {
            x: x,
            y,
            font,
            color: rgb(0, 0, 0),
            size: fontSize
          });
          y -= 15; // Adjust the line height as needed
        }
      } else if (widgetTypeExist) {
        const font = await pdfDoc.embedFont("Helvetica");
        const fontSize = 12;

        let textContent;
        if (position?.options?.response) {
          textContent = position.options?.response;
        } else if (position?.options?.defaultValue) {
          textContent = position?.options?.defaultValue;
        }
        page.drawText(textContent, {
          x: xPos(position),
          y: yPos(position) + 10,
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        });
      } else if (position.type === "dropdown") {
        const dropdown = form.createDropdown(randomboxId);
        dropdown.addOptions(position?.options?.values);
        if (position?.options?.response) {
          dropdown.select(position.options?.response);
        } else if (position?.options?.defaultValue) {
          dropdown.select(position?.options?.defaultValue);
        }

        dropdown.addToPage(page, {
          x: xPos(position),
          y: yPos(position),
          width: scaleWidth,
          height: scaleHeight
        });
        dropdown.enableReadOnly();
      } else if (position.type === "radio") {
        const radioGroup = form.createRadioGroup(randomboxId);
        let addYPosition = 18;

        for (let i = 1; i <= position?.options?.values.length; i++) {
          const data = position?.options?.values[i - 1];
          let yPosition;
          if (i > 1) {
            yPosition = yPos(position) - addYPosition;
          } else {
            yPosition = yPos(position);
          }

          radioGroup.addOptionToPage(data, page, {
            x: xPos(position),
            y: yPosition,
            width: 11,
            height: 11
          });
          if (i > 1) {
            addYPosition = addYPosition + 18;
          }
        }
        if (position?.options?.response) {
          radioGroup.select(position.options?.response);
        } else if (position?.options?.defaultValue) {
          radioGroup.select(position?.options?.defaultValue);
        }

        radioGroup.enableReadOnly();
      } else {
        page.drawImage(img, {
          x: xPos(position),
          y: yPos(position),
          width: scaleWidth,
          height: scaleHeight
        });
      }
    });
  }

  const pdfBytes = await pdfDoc.saveAsBase64({ useObjectStreams: false });

  return pdfBytes;
};
//function for embed document id
export const embedDocId = async (pdfDoc, documentId, allPages) => {
  for (let i = 0; i < allPages; i++) {
    const font = await pdfDoc.embedFont("Helvetica");
    const fontSize = 10;
    const textContent = documentId && `OpenSign™ DocumentId: ${documentId} `;
    const pages = pdfDoc.getPages();
    const page = pages[i];
    page.drawText(textContent, {
      x: 10,
      y: page.getHeight() - 10,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5)
    });
  }
};
export const pdfNewWidthFun = (divRef) => {
  const clientWidth = divRef.current.offsetWidth;
  const pdfWidth = clientWidth - 160 - 200;
  //160 is width of left side, 200 is width of right side component
  return pdfWidth;
};

//function for resize image and update width and height for mulitisigners
export const handleImageResize = (
  ref,
  key,
  signerPos,
  setSignerPos,
  pageNumber,
  signerId,
  showResize
) => {
  // const filterSignerPos = signerPos.filter(
  //   (data) => data.signerObjId === signerId
  // );

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
            Width: ref.offsetWidth,
            Height: ref.offsetHeight,
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

      const newUpdateSigner = signerPos.map((obj, ind) => {
        if (obj.Id === signerId) {
          return { ...obj, placeHolder: newUpdateSignPos };
        }
        return obj;
      });

      setSignerPos(newUpdateSigner);
    }
  }
};

//function for resize image and update width and height for sign-yourself
export const handleSignYourselfImageResize = (
  ref,
  key,
  xyPostion,
  setXyPostion,
  index
) => {
  const getXYdata = xyPostion[index].pos;
  const getPosData = getXYdata;
  const addSign = getPosData.map((url, ind) => {
    if (url.key === key) {
      return {
        ...url,
        Width: ref.offsetWidth,
        Height: ref.offsetHeight,
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
  pdfOriginalWidth,
  signerData,
  containerWH,
  setIsAlert,
  xyPosData,
  pdfBase64Url,
  pageNo
) => {
  let singleSign;

  singleSign = {
    pdfFile: base64Url,
    docId: documentId,
    userId: signerObjectId
    // };
  };

  const response = await axios
    .post(`${localStorage.getItem("baseUrl")}functions/signPdf`, singleSign, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        sessionToken: localStorage.getItem("accesstoken")
      }
    })
    .then((Listdata) => {
      const json = Listdata.data;
      const res = json.result;
      return res;
    })
    .catch((err) => {
      setIsAlert({
        isShow: true,
        alertMessage: "something went wrong"
      });
    });

  return response;
};

export const randomId = () => Math.floor(1000 + Math.random() * 9000);

export const createDocument = async (template, placeholders, signerData) => {
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
      URL: Doc.URL,
      SignedUrl: Doc.SignedUrl,
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
      SendinOrder: Doc?.SendinOrder || false
    };

    try {
      const res = await axios.post(
        `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
          "_appName"
        )}_Document`,
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
