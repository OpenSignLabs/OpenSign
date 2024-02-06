import axios from "axios";
import { rgb } from "pdf-lib";
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
export const addInitialData = (signerPos, setXyPostion, value, signerObjId) => {
  return signerPos.map((item) => {
    if (item.placeHolder && item.placeHolder.length > 0) {
      // If there is a nested array, recursively add the field to the last object
      if (item.signerObjId === signerObjId) {
        return {
          ...item,
          placeHolder: addInitialData(
            item.placeHolder,
            setXyPostion,
            value,
            signerObjId
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
        pos: addInitialData(item.pos, setXyPostion, value, signerObjId)
        // Adjust this line to add the desired field
      };
    } else {
      const widgetData =
        item.type === "name"
          ? value?.Name
          : item.type === "company"
            ? value?.Company
            : item.type === "job title"
              ? value?.JobTitle
              : item.type === "email"
                ? value?.Email
                : "";

      if (
        item.type === "name" ||
        item.type === "company" ||
        item.type === "job title" ||
        item.type === "email"
      ) {
        return {
          ...item,
          widgetValue: widgetData,
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
export const onChangeInput = (
  value,
  signKey,
  xyPostion,
  index,
  setXyPostion,
  signerObjId,
  initial,
  dateFormat
) => {
  const isSigners = xyPostion.some((data) => data.signerPtr);

  if (isSigners) {
    const filterSignerPos = xyPostion.filter(
      (data) => data.signerObjId === signerObjId
    );
    const getPlaceHolder = filterSignerPos[0].placeHolder;

    if (initial) {
      const xyData = addInitialData(
        xyPostion,
        setXyPostion,
        value,
        signerObjId
      );
      setXyPostion(xyData);
    } else {
      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === index
      );

      if (getPageNumer.length > 0) {
        const getXYdata = getPageNumer[0].pos;
        const getPosData = getXYdata;
        const addSignPos = getPosData.map((url, ind) => {
          if (url.key === signKey) {
            if (dateFormat) {
              return {
                ...url,
                widgetValue: value,
                dateFormat: dateFormat
              };
            } else {
              return {
                ...url,
                widgetValue: value
              };
            }
          }
          return url;
        });

        const newUpdateSignPos = getPlaceHolder.map((obj, ind) => {
          if (obj.pageNumber === index) {
            return { ...obj, pos: addSignPos };
          }
          return obj;
        });

        const newUpdateSigner = xyPostion.map((obj, ind) => {
          if (obj.signerObjId === signerObjId) {
            return { ...obj, placeHolder: newUpdateSignPos };
          }
          return obj;
        });

        setXyPostion(newUpdateSigner);
      }
    }
  } else {
    let getXYdata = xyPostion[index].pos;

    const updatePosition = getXYdata.map((positionData, ind) => {
      if (positionData.key === signKey) {
        return {
          ...positionData,
          widgetValue: value
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
    type: "dropdown",
    icon: "fa-solid fa-circle-chevron-down",
    iconSize: "19px"
  },
  {
    type: "checkbox",
    icon: "fa-solid fa-square-check",
    iconSize: "22px"
  },
  {
    type: "text",
    icon: "fa-solid fa-font",
    iconSize: "21px"
  },
  {
    type: "initials",
    icon: "fa-solid fa-signature",
    iconSize: "15px"
  },
  {
    type: "name",
    icon: "fa-solid fa-user",
    iconSize: "21px"
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
  },
  {
    type: "date",
    icon: "fa-solid fa-calendar-days",
    iconSize: "20px"
  },
  {
    type: "image",
    icon: "fa-solid fa-image",
    iconSize: "20px"
  },
  {
    type: "email",
    icon: "fa-solid fa-envelope",
    iconSize: "20px"
  },
  {
    type: "radio",
    icon: "fa-regular fa-circle-dot",
    iconSize: "20px"
  }
];

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
  let obj;
  switch (type) {
    case "signature":
      obj = {
        width: 150,
        height: 60
      };
      return obj;

    case "stamp":
      obj = {
        width: 150,
        height: 60
      };
      return obj;
    case "checkbox":
      obj = {
        width: 15,
        height: 15
      };
      return obj;
    case "text":
      obj = {
        width: 150,
        height: 25
      };
      return obj;
    case "dropdown":
      obj = {
        width: 120,
        height: 22
      };
      return obj;
    case "initials":
      obj = {
        width: 50,
        height: 50
      };
      return obj;
    case "name":
      obj = {
        width: 60,
        height: 25
      };
      return obj;

    case "company":
      obj = {
        width: 60,
        height: 25
      };
      return obj;
    case "job title":
      obj = {
        width: 60,
        height: 25
      };
      return obj;
    case "date":
      obj = {
        width: 100,
        height: 20
      };
      return obj;
    case "image":
      obj = {
        width: 150,
        height: 60
      };
      return obj;
    case "email":
      obj = {
        width: 50,
        height: 20
      };
    case "radio":
      obj = {
        width: 15,
        height: 15
      };
      return obj;
    default:
      obj = {
        width: 150,
        height: 60
      };
      return obj;
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
        ImageType: image.imgType
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
        SignUrl: signatureImg
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

    const addSign = getPosData.map((position, ind) => {
      getIMGWH = calculateImgAspectRatio(imgWH, position);
      if (position.type) {
        if (position?.type === "signature") {
          return {
            ...position,
            SignUrl: defaultSignImg,
            Width: getIMGWH.newWidth,
            Height: getIMGWH.newHeight,
            ImageType: "default"
          };
        }
      } else if (position && !position.isStamp) {
        return {
          ...position,
          SignUrl: defaultSignImg,
          Width: getIMGWH.newWidth,
          Height: getIMGWH.newHeight,
          ImageType: "default"
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
    const newWidth = containerWH.width;
    const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
    const pageNo = item.pageNumber;
    const imgUrlList = item.pos;
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

    imgUrlList.forEach(async (imgData, id) => {
      let img;
      if (
        imgData.type === "signature" ||
        imgData.type === "stamp" ||
        imgData.type === "initials" ||
        imgData.type === "image"
      ) {
        if (
          (imgData.ImageType && imgData.ImageType === "image/png") ||
          imgData.ImageType === "image/jpeg"
        ) {
          img = await pdfDoc.embedJpg(images[id]);
        } else {
          img = await pdfDoc.embedPng(images[id]);
        }
      }
      let scaleWidth, scaleHeight;
      scaleWidth = placeholderWidth(imgData, scale, signyourself);
      scaleHeight = placeholderHeight(imgData, scale, signyourself);

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

      const yPos = (pos) => {
        const resizePos = pos.yPosition;
        if (signyourself) {
          if (isMobile) {
            return page.getHeight() - resizePos * scale - scaleHeight;
          } else {
            return page.getHeight() - resizePos - scaleHeight;
          }
        } else {
          //checking both condition mobile and desktop view
          const y = resizePos / scale;
          if (isMobile) {
            //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
            if (pos.isMobile) {
              const y = resizePos * (pos.scale / scale);
              return page.getHeight() - y * scale - scaleHeight;
            } else {
              if (pos.IsResize) {
                return page.getHeight() - y * scale - scaleHeight;
              } else {
                return page.getHeight() - y * scale - scaleHeight;
              }
            }
          } else {
            //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
            if (pos.isMobile) {
              if (pos.IsResize) {
                const y = resizePos * pos.scale;
                return page.getHeight() - y - scaleHeight;
              } else {
                const y = resizePos * pos.scale;
                return page.getHeight() - y - scaleHeight;
              }
            } else {
              return page.getHeight() - resizePos - scaleHeight;
            }
          }
        }
      };
      const randomboxId = "randombox_" + imgData.key;
      if (imgData.type === "checkbox") {
        const checkBox = form.createCheckBox(randomboxId);

        checkBox.addToPage(page, {
          x: xPos(imgData),
          y: yPos(imgData),
          width: scaleWidth,
          height: scaleHeight
        });
        if (imgData.widgetValue) {
          checkBox.check();
        } else {
          checkBox.uncheck();
        }

        checkBox.enableReadOnly();
      } else if (
        imgData.type === "text" ||
        imgData.type === "name" ||
        imgData.type === "company" ||
        imgData.type === "job title" ||
        imgData.type === "date" ||
        imgData.type === "email"
      ) {
        const font = await pdfDoc.embedFont("Helvetica");
        const fontSize = 12;
        const textContent = imgData.widgetValue;
        page.drawText(textContent, {
          x: xPos(imgData),
          y: yPos(imgData) + 10,
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        });
      } else if (imgData.type === "dropdown") {
        const dropdown = form.createDropdown(randomboxId);
        dropdown.addOptions(imgData.widgetOption);
        dropdown.select(imgData.widgetValue);
        dropdown.addToPage(page, {
          x: xPos(imgData),
          y: yPos(imgData),
          width: scaleWidth,
          height: scaleHeight
        });
        dropdown.enableReadOnly();
      } else if (imgData.type === "radio") {
        const rocketField = form.createRadioGroup(randomboxId);
        rocketField.addOptionToPage(imgData.widgetOption[0], page, {
          x: xPos(imgData),
          y: yPos(imgData),
          width: scaleWidth,
          height: scaleHeight
        });
        rocketField.select(imgData.widgetOption[0]);
        rocketField.enableReadOnly();
      } else {
        page.drawImage(img, {
          x: xPos(imgData),
          y: yPos(imgData),
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
      // const getXYdata = getPageNumer[0].pos.filter(
      //   (data, ind) => data.key === key && data.Width && data.Height
      // );
      // if (getXYdata.length > 0) {
      //   const getXYdata = getPageNumer[0].pos;
      //   const getPosData = getXYdata;
      //   const addSignPos = getPosData.map((url, ind) => {
      //     if (url.key === key) {
      //       return {
      //         ...url,
      //         Width: ref.offsetWidth,
      //         Height: ref.offsetHeight,
      //         IsResize: showResize ? true : false
      //       };
      //     }
      //     return url;
      //   });

      //   const newUpdateSignPos = getPlaceHolder.map((obj, ind) => {
      //     if (obj.pageNumber === pageNumber) {
      //       return { ...obj, pos: addSignPos };
      //     }
      //     return obj;
      //   });

      //   // const newUpdateSigner = signerPos.map((obj, ind) => {
      //   //   if (obj.signerObjId === signerId) {
      //   //     return { ...obj, placeHolder: newUpdateSignPos };
      //   //   }
      //   //   return obj;
      //   // });

      //   const newUpdateSigner = signerPos.map((obj, ind) => {
      //     if (obj.Id === signerId) {
      //       return { ...obj, placeHolder: newUpdateSignPos };
      //     }
      //     return obj;
      //   });
      //   setSignerPos(newUpdateSigner);
      // } else {
      const getXYdata = getPageNumer[0].pos;
      const getPosData = getXYdata;
      const addSignPos = getPosData.map((url, ind) => {
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

      const newUpdateSignPos = getPlaceHolder.map((obj, ind) => {
        if (obj.pageNumber === pageNumber) {
          return { ...obj, pos: addSignPos };
        }
        return obj;
      });

      // const newUpdateSigner = signerPos.map((obj, ind) => {
      //   if (obj.signerObjId === signerId) {
      //     return { ...obj, placeHolder: newUpdateSignPos };
      //   }
      //   return obj;
      // });
      const newUpdateSigner = signerPos.map((obj, ind) => {
        if (obj.Id === signerId) {
          return { ...obj, placeHolder: newUpdateSignPos };
        }
        return obj;
      });

      setSignerPos(newUpdateSigner);
    }
    // }
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

  // const newWidth = containerWH.width;
  // const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
  // if (signerData && signerData.length === 1 && signerData[0].pos.length === 1) {
  //   const height = xyPosData.Height ? xyPosData.Height : 60;

  //   const xPos = (pos) => {
  //     const resizePos = pos.xPosition;
  //     //checking both condition mobile and desktop view
  //     if (isMobile) {
  //       //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
  //       if (pos.isMobile) {
  //         const x = resizePos * (pos.scale / scale);
  //         return x * scale;
  //       } else {
  //         const x = resizePos / scale;
  //         return x * scale;
  //       }
  //     } else {
  //       //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
  //       if (pos.isMobile) {
  //         const x = resizePos * pos.scale;
  //         return x;
  //       } else {
  //         return resizePos;
  //       }
  //     }
  //   };
  //   const yBottom = (pos) => {
  //     const resizePos = pos.yBottom;
  //     let yPosition;
  //     //checking both condition mobile and desktop view

  //     if (isMobile) {
  //       //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
  //       if (pos.isMobile) {
  //         const y = resizePos * (pos.scale / scale);
  //         yPosition = pos.isDrag
  //           ? y * scale - height * scale
  //           : pos.firstYPos
  //             ? y * scale - height * scale + pos.firstYPos
  //             : y * scale - height * scale;
  //         return yPosition;
  //       } else {
  //         const y = resizePos / scale;
  //         if (pos.IsResize) {
  //           yPosition = pos.isDrag
  //             ? y * scale - height * scale
  //             : pos.firstYPos
  //               ? y * scale - height * scale + pos.firstYPos
  //               : y * scale - height * scale;
  //           return yPosition;
  //         } else {
  //           yPosition = pos.isDrag
  //             ? y * scale - height
  //             : pos.firstYPos
  //               ? y * scale - height + pos.firstYPos
  //               : y * scale - height;
  //           return yPosition;
  //         }
  //       }
  //     } else {
  //       //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
  //       if (pos.isMobile) {
  //         const y = resizePos * pos.scale;
  //         if (pos.IsResize) {
  //           yPosition = pos.isDrag
  //             ? y - height
  //             : pos.firstYPos
  //               ? y - height + pos.firstYPos
  //               : y - height;
  //           return yPosition;
  //         } else {
  //           yPosition = pos.isDrag
  //             ? y - height * pos.scale
  //             : pos.firstYPos
  //               ? y - height * pos.scale + pos.firstYPos
  //               : y - height * pos.scale;
  //           return yPosition;
  //         }
  //       } else {
  //         yPosition = pos.isDrag
  //           ? resizePos - height
  //           : pos.firstYPos
  //             ? resizePos - height + pos.firstYPos
  //             : resizePos - height;
  //         return yPosition;
  //       }
  //     }
  //   };

  //   singleSign = {
  //     pdfFile: pdfBase64Url,
  //     docId: documentId,
  //     userId: signerObjectId,
  //     sign: {
  //       Base64: base64Url,
  //       Left: xPos(xyPosData),
  //       Bottom: yBottom(xyPosData),
  //       Width: placeholderWidth(xyPosData, scale),
  //       Height: placeholderHeight(xyPosData, scale),
  //       Page: pageNo
  //     }
  //   };
  // } else if (
  //   signerData &&
  //   signerData.length > 0 &&
  //   signerData[0].pos.length > 0
  // ) {
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
      Signers: signers
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
