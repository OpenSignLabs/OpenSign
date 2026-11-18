import axios from "axios";
import { generateId } from "./coreConstants.js";
import { defaultWidthHeight } from "./widgetSizing.js";

export function urlValidator(url) {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === "http:" || newUrl.protocol === "https:";
  } catch (err) {
    return false;
  }
}

export const placeholderWidth = (pos) => {
  const defaultWidth = defaultWidthHeight(pos.type).width;
  const posWidth = pos.Width || defaultWidth;
  //condition to handle old data saved from mobile view to get widthh
  if (pos.isMobile && pos.scale) {
    return pos.IsResize ? posWidth : posWidth * pos.scale;
  } else {
    return posWidth;
  }
};

export const placeholderHeight = (pos) => {
  const posHeight = pos.Height;
  const defaultHeight = defaultWidthHeight(pos.type).height;
  const posUpdateHeight = posHeight || defaultHeight;

  //condition to handle old data saved from mobile view to get height
  if (pos.isMobile && pos.scale) {
    return pos.IsResize ? posUpdateHeight : posUpdateHeight * pos.scale;
  } else {
    return posUpdateHeight;
  }
};

export const contactBook = async (objectId) => {
  try {
    const url = `${localStorage.getItem("baseUrl")}classes/contracts_Contactbook?where={"objectId":"${objectId}"}`;
    const headers = {
      "Content-Type": "application/json",
      "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
      "X-Parse-Session-Token": localStorage.getItem("accesstoken")
    };
    const axiosRes = await axios.get(url, { headers });
    const result = axiosRes?.data?.results;
    return result;
  } catch (error) {
    console.error("contracts_Contactbook error", err);
    return "Error: Something went wrong!";
  }
};

export const contractDocument = async (documentId, include) => {
  const data = { docId: documentId, include: include };
  const token = { sessionToken: localStorage.getItem("accesstoken") };
  const documentDeatils = await axios
    .post(`${localStorage.getItem("baseUrl")}functions/getDocument`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        ...token
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

export const addDefaultSignatureImg = (xyPosition, defaultSignImg, type) => {
  let xyDefaultPos = [];
  for (let i = 0; i < xyPosition.length; i++) {
    const getXYdata = xyPosition[i].pos;
    const getPageNo = xyPosition[i].pageNumber;
    const getPosData = getXYdata;

    const addSign = getPosData.map((position) => {
      if (position.type) {
        if (position?.type === type) {
          return {
            ...position,
            SignUrl: defaultSignImg,
            ImageType: "default",
            options: { ...position.options, response: defaultSignImg }
          };
        }
      } else if (position && !position.isStamp) {
        return {
          ...position,
          SignUrl: defaultSignImg,
          ImageType: "default",
          options: { ...position.options, response: defaultSignImg }
        };
      }
      return position;
    });

    const newXypos = { pageNumber: getPageNo, pos: addSign };
    xyDefaultPos.push(newXypos);
  }
  return xyDefaultPos;
};

export const getMonth = (date) => {
  const newMonth = new Date(date).getMonth();
  return newMonth;
};

export const handleCopyNextToWidget = (
  newId,
  position,
  xyPosition,
  index,
  setXyPosition,
  pdfOriginalWH,
  userId
) => {
  let filterSignerPos;

  //Get page dimensions
  const page = pdfOriginalWH?.find((x) => x?.pageNumber === index);

  const pageWidth = page?.width;
  const pageHeight = page?.height;

  // Widget dimensions (fallback safe values)
  const widgetWidth = position?.width || 150;

  const widgetHeight = position?.height || 60;

  const gap = 10;

  //Default copy (slightly right + down)
  let newX = parseInt(position.xPosition) + gap;
  let newY = parseInt(position.yPosition) + gap;

  // Prevent RIGHT overflow
  if (pageWidth && newX + widgetWidth > pageWidth) {
    newX = parseInt(position.xPosition) - gap;
  }
  if (newX < 0) newX = 0;

  //  Prevent BOTTOM overflow
  if (pageHeight && newY + widgetHeight > pageHeight) {
    newY = pageHeight - widgetHeight - gap;
  }

  if (newY < 0) newY = 0;

  // Get signer position data early for widget name generation
  if (userId) {
    filterSignerPos = xyPosition.find((data) => data.Id === userId);
  }

  // Count same-type widgets to generate a name matching drag-and-drop convention
  const countSameWidget =
    filterSignerPos?.placeHolder?.reduce((count, page) => {
      return (
        count + page.pos.filter((item) => item.type === position?.type).length
      );
    }, 0) || 0;
  const widgetName = `${position?.type}-${generateId(6)}-${countSameWidget + 1}`;

  const newposition = {
    ...position,
    xPosition: newX,
    yPosition: newY,
    key: newId,
    options: { ...position?.options, name: widgetName }
  };

  //Your existing update logic

  if (userId) {
    filterSignerPos = xyPosition.find((data) => data.Id === userId);
    const getPlaceHolder = filterSignerPos?.placeHolder;
    const getPageNumer = getPlaceHolder?.filter(
      (data) => data.pageNumber === index
    );
    const getXYdata = [...(getPageNumer?.[0]?.pos || []), newposition];
    if (getPageNumer && getPageNumer.length > 0) {
      const newUpdateSignPos = getPlaceHolder.map((obj) => {
        if (obj.pageNumber === index) {
          return { ...obj, pos: getXYdata };
        }
        return obj;
      });

      const newUpdateSigner = xyPosition.map((obj) => {
        if (obj.Id === userId) {
          return { ...obj, placeHolder: newUpdateSignPos };
        }
        return obj;
      });

      setXyPosition(newUpdateSigner);
    }
  } else {
    const getPageNumer = xyPosition?.find((data) => data.pageNumber === index);
    const getXYdata = [...getPageNumer.pos, newposition];
    const updatePlaceholder = xyPosition.map((obj, ind) => {
      if (obj?.pageNumber === index) {
        return { ...obj, pos: getXYdata };
      }
      return obj;
    });
    setXyPosition(updatePlaceholder);
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
