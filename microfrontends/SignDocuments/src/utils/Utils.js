import axios from "axios";
import { $ } from "select-dom";
import { rgb } from "pdf-lib";
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

//function for upload stamp or image
export function onSaveImage(xyPostion, index, signKey, imgWH, image) {
  const updateFilter = xyPostion[index].pos.filter(
    (data, ind) =>
      data.key === signKey && data.Width && data.Height && data.SignUrl
  );

  if (updateFilter.length > 0) {
    let newWidth, newHeight;
    const aspectRatio = imgWH.width / imgWH.height;

    const getXYdata = xyPostion[index].pos;

    if (aspectRatio === 1) {
      newWidth = aspectRatio * 100;
      newHeight = aspectRatio * 100;
    } else if (aspectRatio < 2) {
      newWidth = aspectRatio * 100;
      newHeight = 100;
    } else if (aspectRatio > 2 && aspectRatio < 4) {
      newWidth = aspectRatio * 70;
      newHeight = 70;
    } else if (aspectRatio > 4) {
      newWidth = aspectRatio * 40;
      newHeight = 40;
    } else if (aspectRatio > 5) {
      newWidth = aspectRatio * 10;
      newHeight = 10;
    }

    let getPosData = xyPostion[index].pos.filter(
      (data) => data.key === signKey
    );

    const addSign = getXYdata.map((url, ind) => {
      if (url.key === signKey) {
        return {
          ...url,
          Width: getPosData[0].Width ? getPosData[0].Width : newWidth,
          Height: getPosData[0].Height ? getPosData[0].Height : newHeight,
          SignUrl: image.src,
          ImageType: image.imgType
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
    return newUpdateUrl;
    // setXyPostion(newUpdateUrl);
  } else {
    const getXYdata = xyPostion[index].pos;

    let getPosData = xyPostion[index].pos.filter(
      (data) => data.key === signKey
    );
    const aspectRatio = imgWH.width / imgWH.height;

    let newWidth, newHeight;
    if (aspectRatio === 1) {
      newWidth = aspectRatio * 100;
      newHeight = aspectRatio * 100;
    } else if (aspectRatio < 2) {
      newWidth = aspectRatio * 100;
      newHeight = 100;
    } else if (aspectRatio > 2 && aspectRatio < 4) {
      newWidth = aspectRatio * 70;
      newHeight = 70;
    } else if (aspectRatio > 4) {
      newWidth = aspectRatio * 40;
      newHeight = 40;
    } else if (aspectRatio > 5) {
      newWidth = aspectRatio * 10;
      newHeight = 10;
    }

    const addSign = getXYdata.map((url, ind) => {
      if (url.key === signKey) {
        return {
          ...url,
          Width: getPosData[0].Width ? getPosData[0].Width : newWidth,
          Height: getPosData[0].Height ? getPosData[0].Height : newHeight,
          SignUrl: image.src,
          ImageType: image.imgType
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
    return newUpdateUrl;
  }
}

//function for save button to save signature or image url
export function onSaveSign(xyPostion, index, signKey, signatureImg) {
  let getXYdata = xyPostion[index].pos;
  let getPosData = xyPostion[index].pos.filter((data) => data.key === signKey);

  const addSign = getXYdata.map((url, ind) => {
    if (url.key === signKey) {
      return {
        ...url,
        Width: getPosData[0].Width ? getPosData[0].Width : 150,
        Height: getPosData[0].Height ? getPosData[0].Height : 60,
        SignUrl: signatureImg
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
  return newUpdateUrl;
}

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

//function for embed multiple signature using pdf-lib
export const multiSignEmbed = async (
  pngUrl,
  pdfDoc,
  pdfOriginalWidth,
  signyourself
) => {
  for (let i = 0; i < pngUrl.length; i++) {
    const pageNo = pngUrl[i].pageNumber;
    const imgUrlList = pngUrl[i].pos;
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
      const imgHeight = imgUrlList[id].Height ? imgUrlList[id].Height : 60;
      const imgWidth = imgUrlList[id].Width ? imgUrlList[id].Width : 150;
      const isMobile = window.innerWidth < 767;
      const newWidth = window.innerWidth - 32;
      const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
      const xPos = (pos) => {
        if (signyourself) {
          if (isMobile) {
            return imgUrlList[id].xPosition * scale + 43;
          } else {
            return imgUrlList[id].xPosition;
          }
        } else {
          //checking both condition mobile and desktop view
          if (isMobile) {
            //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
            if (pos.isMobile) {
              const x = pos.xPosition * (pos.scale / scale);
              return x * scale + 50;
            } else {
              const x = pos.xPosition / scale;
              return x * scale;
            }
          } else {
            //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
            if (pos.isMobile) {
              const x = pos.xPosition * pos.scale + 50;
              return x;
            } else {
              return pos.xPosition;
            }
          }
        }
      };

      const yPos = (pos) => {
        if (signyourself) {
          if (isMobile) {
            return (
              page.getHeight() -
              imgUrlList[id].yPosition * scale -
              imgHeight * scale
            );
          } else {
            return page.getHeight() - imgUrlList[id].yPosition - imgHeight;
          }
        } else {
          //checking both condition mobile and desktop view
          const y = pos.yPosition / scale;
          if (isMobile) {
            //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
            if (pos.isMobile) {
              const y = pos.yPosition * (pos.scale / scale);
              return page.getHeight() - y * scale - imgHeight;
            } else {
              return page.getHeight() - y * scale - imgHeight;
            }
          } else {
            //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
            if (pos.isMobile) {
              const y = pos.yPosition * pos.scale;
              return page.getHeight() - y - imgHeight;
            } else {
              return page.getHeight() - pos.yPosition - imgHeight;
            }
          }
        }
      };

      page.drawImage(img, {
        x: xPos(imgUrlList[id]),
        y: yPos(imgUrlList[id]),
        width: signyourself ? imgWidth * scale : imgWidth,
        height: signyourself ? imgHeight * scale : imgHeight
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
