import axios from "axios";
import { $ } from "select-dom";
import { rgb } from "pdf-lib";

const isMobile = window.innerWidth < 767;

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
  const placeholderHeight = pos && pos.Width ? pos.Height : 60;
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
  const updateXYData = getXYData.map((url) => {
    if (url.key === signKey) {
      getIMGWH = calculateImgAspectRatio(imgWH, url);

      return {
        ...url,
        Width: getIMGWH.newWidth,
        Height: getIMGWH.newHeight,
        SignUrl: image.src,
        ImageType: image.imgType
      };
    }
    return url;
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
  isDefaultSign
) {
  let getIMGWH;
  let getXYdata = xyPostion[index].pos;
  const updateXYData = getXYdata.map((position) => {
    if (position.key === signKey) {
      if (isDefaultSign) {
        getIMGWH = calculateImgAspectRatio(imgWH, position);
      }
      const getSignImgWH = calculateImgAspectRatio(
        { width: 150, height: 60 },
        position
      );
      const posWidth = isDefaultSign
        ? getIMGWH.newWidth
        : position.Width
          ? getSignImgWH.newWidth
          : 150;
      const posHeight = isDefaultSign
        ? getIMGWH.newHeight
        : position.Height
          ? getSignImgWH.newHeight
          : 60;

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

    const addSign = getPosData.map((url, ind) => {
      getIMGWH = calculateImgAspectRatio(imgWH, url);
      if (url) {
        return {
          ...url,
          SignUrl: defaultSignImg,
          Width: getIMGWH.newWidth,
          Height: getIMGWH.newHeight,
          ImageType: "default"
        };
      }
      return url;
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
export function modalAlign() {
  let modalDialog = $(".modal-dialog").getBoundingClientRect();
  let mobileHead = $(".mobileHead").getBoundingClientRect();
  let modal = $(".modal-dialog");
  if (modalDialog.left < mobileHead.left) {
    let leftOffset = mobileHead.left - modalDialog.left;
    modal.style.left = leftOffset + "px";
    modal.style.top = window.innerHeight / 3 + "px";
  }
}

export const placeholderWidth = (pos, scale, signyourself) => {
  let width;
  const defaultWidth = 150;
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
  const defaultHeight = 60;
  if (signyourself) {
    if (isMobile) {
      return posHeight * scale;
    } else {
      return posHeight;
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
    const page = pages[pageNo - 1];
    const images = await Promise.all(
      imgUrlList.map(async (url) => {
        let signUrl = url.SignUrl;
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
      })
    );
    images.forEach(async (imgData, id) => {
      let img;
      if (
        (imgUrlList[id].ImageType &&
          imgUrlList[id].ImageType === "image/png") ||
        imgUrlList[id].ImageType === "image/jpeg"
      ) {
        img = await pdfDoc.embedJpg(imgData);
      } else {
        img = await pdfDoc.embedPng(imgData);
      }

      const scaleWidth = placeholderWidth(imgUrlList[id], scale, signyourself);
      const scaleHeight = placeholderHeight(
        imgUrlList[id],
        scale,
        signyourself
      );

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
        const resizePos = imgUrlList[id].yPosition;
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

      page.drawImage(img, {
        x: xPos(imgUrlList[id]),
        y: yPos(imgUrlList[id]),
        width: scaleWidth,
        height: scaleHeight
      });
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
  signerId,
  position,
  signerPos,
  pageNumber,
  setSignerPos,
  pdfOriginalWidth,
  containerWH,
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
  direction,
  position,
  xyPostion,
  index,
  setXyPostion,
  pdfOriginalWidth,
  containerWH
) => {
  const updateFilter = xyPostion[index].pos.filter(
    (data) => data.key === key && data.Width && data.Height
  );

  if (updateFilter.length > 0) {
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
  } else {
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
  }
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

  const newWidth = containerWH.width;
  const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
  if (signerData && signerData.length === 1 && signerData[0].pos.length === 1) {
    const height = xyPosData.Height ? xyPosData.Height : 60;

    const xPos = (pos) => {
      const resizePos = pos.xPosition;
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
    };
    const yBottom = (pos) => {
      const resizePos = pos.yBottom;
      let yPosition;
      //checking both condition mobile and desktop view

      if (isMobile) {
        //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
        if (pos.isMobile) {
          const y = resizePos * (pos.scale / scale);
          yPosition = pos.isDrag
            ? y * scale - height * scale
            : pos.firstYPos
              ? y * scale - height * scale + pos.firstYPos
              : y * scale - height * scale;
          return yPosition;
        } else {
          const y = resizePos / scale;
          if (pos.IsResize) {
            yPosition = pos.isDrag
              ? y * scale - height * scale
              : pos.firstYPos
                ? y * scale - height * scale + pos.firstYPos
                : y * scale - height * scale;
            return yPosition;
          } else {
            yPosition = pos.isDrag
              ? y * scale - height
              : pos.firstYPos
                ? y * scale - height + pos.firstYPos
                : y * scale - height;
            return yPosition;
          }
        }
      } else {
        //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
        if (pos.isMobile) {
          const y = resizePos * pos.scale;
          if (pos.IsResize) {
            yPosition = pos.isDrag
              ? y - height
              : pos.firstYPos
                ? y - height + pos.firstYPos
                : y - height;
            return yPosition;
          } else {
            yPosition = pos.isDrag
              ? y - height * pos.scale
              : pos.firstYPos
                ? y - height * pos.scale + pos.firstYPos
                : y - height * pos.scale;
            return yPosition;
          }
        } else {
          yPosition = pos.isDrag
            ? resizePos - height
            : pos.firstYPos
              ? resizePos - height + pos.firstYPos
              : resizePos - height;
          return yPosition;
        }
      }
    };

    singleSign = {
      pdfFile: pdfBase64Url,
      docId: documentId,
      userId: signerObjectId,
      sign: {
        Base64: base64Url,
        Left: xPos(xyPosData),
        Bottom: yBottom(xyPosData),
        Width: placeholderWidth(xyPosData, scale),
        Height: placeholderHeight(xyPosData, scale),
        Page: pageNo
      }
    };
  } else if (
    signerData &&
    signerData.length > 0 &&
    signerData[0].pos.length > 0
  ) {
    singleSign = {
      pdfFile: base64Url,
      docId: documentId,
      userId: signerObjectId
    };
  }

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
