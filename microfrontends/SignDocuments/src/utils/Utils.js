import axios from "axios";

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

export function getHostUrl() {
  const hostUrl = window.location.href;
  /// const hostUrl = "https://contracts-defaultssty.qik.ai/#/mf/remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/legadrive";
  // const hostUrl = "https://contracts-defaultssty.qik.ai/#/"
  // const hostUrl = "https://lionfish-app-75ly7.ondigitalocean.app/mf/remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/legadrive"
  //const hostUrl = "https://app.opensignlabs.com/rpmf/remoteUrl=aHR0cHM6Ly9xaWstYWktb3JnLmdpdGh1Yi5pby9TaWduLU1pY3JvYXBwVjIvcmVtb3RlRW50cnkuanM=&moduleToLoad=AppRoutes&remoteName=signmicroapp/draftDocument";

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
    let newWidth, nweHeight;
    const aspectRatio = imgWH.width / imgWH.height;
    const getXYdata = xyPostion[index].pos;
    if (aspectRatio === 1) {
      newWidth = aspectRatio * 100;
      nweHeight = aspectRatio * 100;
    } else if (aspectRatio < 2) {
      newWidth = aspectRatio * 100;
      nweHeight = 100;
    } else if (aspectRatio > 2 && aspectRatio < 4) {
      newWidth = aspectRatio * 70;
      nweHeight = 70;
    } else if (aspectRatio > 4) {
      newWidth = aspectRatio * 40;
      nweHeight = 40;
    } else if (aspectRatio > 5) {
      newWidth = aspectRatio * 10;
      nweHeight = 10;
    }
    const getPosData = getXYdata;
    const addSign = getPosData.map((url, ind) => {
      if (url.key === signKey) {
        return {
          ...url,
          Width: newWidth,
          Height: nweHeight,
          SignUrl: image.src,
          ImageType: image.imgType,
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

    const getPosData = getXYdata;

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

    const addSign = getPosData.map((url, ind) => {
      if (url.key === signKey) {
        return {
          ...url,
          Width: newWidth,
          Height: newHeight,
          SignUrl: image.src,
          ImageType: image.imgType,
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
  }
}

//function for save button to save signature or image url
export function onSaveSign(xyPostion, index, signKey, signatureImg) {
  const updateFilter = xyPostion[index].pos.filter(
    (data) => data.key === signKey && data.SignUrl
  );

  if (updateFilter.length > 0) {
    const getXYdata = xyPostion[index].pos;
    // updateFilter[0].SignUrl = signatureImg;

    const getPosData = getXYdata;
    const addSign = getPosData.map((url, ind) => {
      if (url.key === signKey) {
        return {
          ...url,
          Width: 150,
          Height: 60,
          SignUrl: signatureImg,
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
  } else {
    const getXYdata = xyPostion[index].pos;

    const getPosData = getXYdata;

    const addSign = getPosData.map((url, ind) => {
      if (url.key === signKey) {
        return { ...url, SignUrl: signatureImg, Width: 150, Height: 60 };
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

//function for getting contract_User details
export const contractUsers = async (objectId) => {
  const result = await axios
    .get(
      `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
        "_appName"
      )}_Users?where={"UserId": {"__type": "Pointer","className": "_User", "objectId":"${objectId}"}}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken"),
        },
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

//function for getting contrscts_contactbook details
export const contactBook = async (objectId) => {
  const result = await axios
    .get(
      `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
        "_appName"
      )}_Contactbook?where={"UserId": {"__type": "Pointer","className": "_User", "objectId":"${objectId}"}}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken"),
        },
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

export const contactBookName = async (userPhone, className) => {
  const result = await axios
    .get(
      `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
        "_appName"
      )}${className}?where={"Phone":"${userPhone}"}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken"),
        },
      }
    )
    .then((Listdata) => {
      const json = Listdata.data;
      return json;
    })
    .catch((err) => {
      return "Error: Something went wrong!";
    });
  return result;
};
