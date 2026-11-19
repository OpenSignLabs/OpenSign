import axios from "axios";
import { saveAs } from "file-saver";
import printModule from "print-js";
import i18n from "../../i18n";
import { color } from "./coreConstants.js";
import { getBase64FromUrl } from "./coreConstants.js";
import { appName } from "./coreConstants.js";

export const handleToPrint = async (event, setIsDownloading, pdfDetails) => {
  event.preventDefault();
  setIsDownloading("pdf");
  const pdfUrl = pdfDetails?.[0]?.SignedUrl || pdfDetails?.[0]?.URL;
  const docId = pdfDetails?.[0]?.objectId || "";

  try {
    // const url = await Parse.Cloud.run("getsignedurl", { url: pdfUrl });
    //`localStorage.getItem("baseUrl")` is also use in public-profile flow for public-sign
    //if we give this `appInfo.baseUrl` as a base url then in public-profile it will create base url of it's window.location.origin ex- opensign.me which is not base url
    const axiosRes = await axios.post(
      `${localStorage.getItem("baseUrl")}/functions/getsignedurl`,
      {
        url: pdfUrl,
        docId: docId
      },
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
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }, 1000);
      };
      setIsDownloading("");
    }
  } catch (err) {
    setIsDownloading("");
    console.log("err in getsignedurl", err);
    alert(i18n.t("something-went-wrong-mssg"));
  }
};

export const downloadCertificate = async (certificate, isZip, asBlob) => {
  try {
    const appName = "OpenSign™";
    const certificateUrl = certificate;
    if (isZip) {
      return certificateUrl;
    } else {
      if (asBlob) {
        const fetchCertificate = await fetch(certificateUrl);
        // Convert the response into a Blob
        const blob = await fetchCertificate.blob();
        saveAs(blob, `Certificate_signed_by_${appName}.pdf`);
        return;
      }
      saveAs(certificateUrl, `Certificate_signed_by_${appName}.pdf`);
    }
  } catch (err) {
    console.error("download certificate err", err);
  }
};

export const handleDownloadCertificate = async (
  pdfDetails,
  setIsDownloading,
  isZip
) => {
  const baseUrl = `${localStorage.getItem("baseUrl")}functions`;
  const parseAppId = localStorage.getItem("parseAppId");
  const sessionToken = localStorage.getItem("accesstoken");
  const docId = pdfDetails?.[0]?.objectId;
  const initialCertificateUrl = pdfDetails?.[0]?.CertificateUrl;
  const headers = {
    "Content-Type": "application/json",
    "X-Parse-Application-Id": parseAppId
  };

  if (initialCertificateUrl) {
    return await downloadCertificate(initialCertificateUrl, isZip);
  } else {
    setIsDownloading("certificate");
    try {
      const data = { docId: docId };
      const docDetails = await axios.post(`${baseUrl}/getDocument`, data, {
        headers: { ...headers, sessionToken }
      });
      const cert = docDetails?.data?.result?.CertificateUrl;
      if (cert) {
        const certificateUrl = await downloadCertificate(cert, isZip);
        setIsDownloading("");
        return certificateUrl;
      } else {
        const generateRes = await axios.post(
          `${baseUrl}/generatecertificate`,
          data,
          { headers }
        );
        const certificate = generateRes?.data?.result?.CertificateUrl;
        if (certificate) {
          try {
            const certificateUrl = await downloadCertificate(
              certificate,
              isZip,
              true
            );
            setIsDownloading("");
            return certificateUrl;
          } catch (err) {
            console.error("download certificate err", err);
            setIsDownloading("certificate_err");
          }
        } else {
          setIsDownloading("certificate_err");
        }
      }
    } catch (err) {
      setIsDownloading("certificate_err");
      console.error("download certificate err", err);
      alert(i18n.t("something-went-wrong-mssg"));
    }
  }
  return null;
};

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escape special characters
}

export async function findContact(value) {
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
    const axiosRes = await axios.post(url, { search: value }, { headers });
    const contactRes = axiosRes?.data?.result || [];
    if (contactRes) {
      const res = JSON.parse(JSON.stringify(contactRes));
      return res;
    }
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
}

export function compensateRotation(
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
