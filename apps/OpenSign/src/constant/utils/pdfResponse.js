import axios from "axios";
import { removeTrailingSegment } from "./UtilsPart01.js";
import { isEmptyValue } from "./UtilsPart10.js";
import { generatePdfName } from "./UtilsPart16.js";

export const getOriginalWH = async (pdf) => {
  let pdfWHObj = [];
  //get total page number
  const totalPages = pdf?.numPages;
  //according to page number get all pdf's pages width and height
  for (let index = 0; index < totalPages; index++) {
    try {
      const getPage = await pdf.getPage(index + 1);
      const scale = 1;
      //getting extra height which is removed from viewPort height (letter type pdf have originial h-799.92 but using getPage.getViewport getting height-792 something diffrence-7.92px)
      //getPage?.view[1] store diffrence of height (Page starts 7.92 from bottom)
      const y0 = getPage?.view[1] || 0;
      let { width, height } = getPage.getViewport({ scale });
      //adding it on viewPort height then get original height ex- 792+7.92 = 799.92 orignial height
      height = height + y0;
      pdfWHObj.push({ pageNumber: index + 1, width, height });
    } catch (e) {
      console.log(`Error getting page ${index + 1} of PDF: ${e.message}`);
    }
  }
  return pdfWHObj;
};

export const handleCheckResponse = (checkUser, setminRequiredCount) => {
  let checkboxExist,
    showAlert = false,
    widgetKey,
    requiredCheckbox,
    tourPageNumber; // `pageNumber` is used to check on which page user did not fill widget's data then change current pageNumber and show tour message on that page
  for (let i = 0; i < checkUser[0].placeHolder.length; i++) {
    for (let j = 0; j < checkUser[0].placeHolder[i].pos.length; j++) {
      //get current page
      const updatePage = checkUser[0].placeHolder[i]?.pageNumber;
      //checking checbox type widget
      checkboxExist = checkUser[0].placeHolder[i].pos[j].type === "checkbox";
      //condition to check checkbox widget exist or not
      if (checkboxExist) {
        //get all required type checkbox
        requiredCheckbox = checkUser[0].placeHolder[i].pos.filter(
          (position) => {
            return (
              !position.options?.isReadOnly && position.type === "checkbox"
            );
          }
        );
        //if required type checkbox data exit then check user checked all checkbox or some checkbox remain to check
        //also validate to minimum and maximum required checkbox
        if (requiredCheckbox && requiredCheckbox.length > 0) {
          for (let i = 0; i < requiredCheckbox.length; i++) {
            //get minimum required count if  exit
            const minCount =
              requiredCheckbox[i].options?.validation?.minRequiredCount;
            const parseMin = minCount && parseInt(minCount);
            //get maximum required count if  exit
            const maxCount =
              requiredCheckbox[i].options?.validation?.maxRequiredCount;
            const parseMax = maxCount && parseInt(maxCount);
            //in `response` variable is used to get how many checkbox checked by user
            const response = requiredCheckbox[i].options?.response?.length;
            //in `defaultValue` variable is used to get how many checkbox checked by default
            const defaultValue =
              requiredCheckbox[i].options?.defaultValue?.length;
            const checkboxValue = response ? response : defaultValue;
            //condition to check  parseMin  and parseMax greater than 0  then consider it as a required check box
            if (
              parseMin > 0 &&
              parseMax > 0 &&
              !response &&
              !defaultValue &&
              !showAlert
            ) {
              showAlert = true;
              widgetKey = requiredCheckbox[i].key;
              tourPageNumber = updatePage;
              setminRequiredCount(parseMin);
            }
            //else condition to validate minimum required checkbox
            else if (
              parseMin > 0 &&
              (parseMin > checkboxValue || !checkboxValue)
            ) {
              if (!showAlert) {
                showAlert = true;
                widgetKey = requiredCheckbox[i].key;
                tourPageNumber = updatePage;
                setminRequiredCount(parseMin);
              }
            }
          }
        }
      }
      //else condition to check all type widget data fill or not except checkbox
      else {
        //get all required type widgets except checkbox and radio
        const requiredWidgets = checkUser[0].placeHolder[i].pos.filter(
          (position) => {
            return (
              position.type === "signature" ||
              (position.options?.status === "required" &&
                position.type !== "checkbox")
            );
          }
        );
        if (requiredWidgets && requiredWidgets?.length > 0) {
          let checkSigned;
          for (let i = 0; i < requiredWidgets?.length; i++) {
            checkSigned = requiredWidgets[i]?.options?.response;
            if (isEmptyValue(checkSigned)) {
              let checkDefaultSigned =
                requiredWidgets[i]?.options?.defaultValue;
              if (isEmptyValue(checkDefaultSigned) && !showAlert) {
                showAlert = true;
                widgetKey = requiredWidgets[i].key;
                tourPageNumber = updatePage;
                setminRequiredCount(null);
              }
            }
          }
        }
      }
    }
    //when showAlert is true then break the loop and show alert to fill required data in widgets
    if (showAlert) {
      break;
    }
  }
  return { tourPageNumber, widgetKey, showAlert };
};

export const decryptPdf = async (file, password) => {
  const name = generatePdfName(16);
  const baseApi = localStorage.getItem("baseUrl") || "";
  const url = removeTrailingSegment(baseApi) + "/decryptpdf?ts=" + Date.now();
  let formData = new FormData();
  formData.append("file", file);
  formData.append("password", password);
  const config = {
    responseType: "blob",
    // The endpoint requires an authenticated caller.
    headers: { sessiontoken: localStorage.getItem("accesstoken") || "" }
  };
  const response = await axios.post(url, formData, config);
  const pdfBlob = new Blob([response.data], { type: "application/pdf" });
  return new File([pdfBlob], name, { type: "application/pdf" });
};

export function base64ToFile(base64String, filename) {
  // Separate out the mime-type and the actual Base64 payload
  const [header, payload] = base64String.includes(",")
    ? base64String.split(",")
    : [null, base64String];
  // Determine the MIME type (fallback to application/octet-stream)
  const mimeMatch = header?.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";

  // Decode Base64 to raw binary data held in a string
  const binaryString = atob(payload);
  // Create an ArrayBuffer and a view (as unsigned 8-bit)
  const len = binaryString.length;
  const u8arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryString.charCodeAt(i);
  }

  // Create a File object (Blob subclass) with the binary data
  return new File([u8arr], filename, { type: mime });
}

export function getFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e.target.error);
    reader.readAsArrayBuffer(file);
  });
}
