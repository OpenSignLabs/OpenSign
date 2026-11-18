import { rgb } from "pdf-lib";
import { PDFName } from "pdf-lib";
import { format } from "date-fns-tz";
import { toZonedTime } from "date-fns-tz";
import { renderMailBrandLogo } from "../mailBrand";
import { resolveMailBrandPresentation } from "../mailBrand";
import { applyDuplicateResponsesToPages } from "./coreConstants.js";
import { color } from "./coreConstants.js";
import { selectFormat } from "./widgetCatalog.js";
import { widgetDataValue } from "./widgetInlineEditing.js";
import { formatTimeInTimezone } from "./pdfPageEdit.js";
import { appName } from "./coreConstants.js";

export function _drawOptionList(page, field, rect, font) {
  let selected = [];
  try {
    selected = field.getSelected?.() || [];
  } catch {
    selected = [];
  }

  if (!Array.isArray(selected)) {
    selected = [selected].filter(Boolean);
  }

  if (!selected.length) return;

  const lines = selected.map((v) => String(v));
  const fontSize = Math.max(
    8,
    Math.min(11, rect.height / Math.max(lines.length + 0.5, 2))
  );
  const lineHeight = fontSize + 1.5;

  let y = rect.y + rect.height - fontSize - 2;

  for (const line of lines) {
    if (y < rect.y + 1) break;

    page.drawText(line, {
      x: rect.x + 2,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
      maxWidth: Math.max(1, rect.width - 4)
    });

    y -= lineHeight;
  }
}

export function _removeWidgetAnnotations(pdfDoc) {
  for (const page of pdfDoc.getPages()) {
    try {
      const annotationsRef = page.node.get(PDFName.of("Annots"));
      if (!annotationsRef) continue;

      const annotations = pdfDoc.context.lookup(annotationsRef);
      if (!annotations || !annotations.asArray) continue;

      const filtered = annotations.asArray().filter((annotRef) => {
        try {
          const annot = pdfDoc.context.lookup(annotRef);
          const subtype = annot?.get(PDFName.of("Subtype"));
          return subtype?.toString() !== "/Widget";
        } catch {
          return true;
        }
      });

      if (filtered.length === 0) {
        page.node.delete(PDFName.of("Annots"));
      } else {
        page.node.set(PDFName.of("Annots"), pdfDoc.context.obj(filtered));
      }
    } catch {
      /* best effort */
    }
  }

  try {
    pdfDoc.catalog.delete(PDFName.of("AcroForm"));
  } catch {
    /* best effort */
  }
}

export const mailTemplate = (param) => {
  const { appName, logoUrl, accentColor } = resolveMailBrandPresentation("");
  const logo = renderMailBrandLogo({ appName, logoUrl });

  const subject = `${param.senderName} has requested you to sign "${param.title}"`;
  const body =
    "<html><head><meta http-equiv='Content-Type' content='text/html;charset=UTF-8' /></head><body><div style='background-color:#f5f5f5;padding:20px'><div style='background:white;padding-bottom:20px'>" +
    logo +
    `<div style='padding:2px;font-family:system-ui;background-color:${accentColor}'><p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>Digital Signature Request</p></div><div><p style='padding:20px;font-size:14px;margin-bottom:10px'>` +
    param.senderName +
    " has requested you to review and sign <strong>" +
    param.title +
    "</strong>.</p><div style='padding: 5px 0px 5px 25px;display:flex;flex-direction:row;justify-content:space-around'><table><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Sender</td><td></td><td style='color:#626363;font-weight:bold'>" +
    param.senderMail +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Organization</td><td></td><td style='color:#626363;font-weight:bold'> " +
    param.organization +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Expires on</td><td></td><td style='color:#626363;font-weight:bold'>" +
    param.localExpireDate +
    "</td></tr><tr><td style='font-weight:bold;font-family:sans-serif;font-size:15px'>Note</td><td></td><td style='color:#626363;font-weight:bold'>" +
    param.note +
    "</td></tr><tr><td></td><td></td></tr></table></div> <div style='margin-left:70px'><a target=_blank href=" +
    param.signingUrl +
    "><button style='padding:12px;background-color:#d46b0f;color:white;border:0px;font-weight:bold;margin-top:30px'>Sign here</button></a></div><div style='display:flex;justify-content:center;margin-top:10px'></div></div></div><div><p> This is an automated email from " +
    appName +
    ". For any queries regarding this email, please contact the sender " +
    param.senderMail +
    " directly.</p></div></div></body></html> ";
  return { subject, body };
};

export function formatDateTime(date, dateFormat, timeZone, is12Hour) {
  const zonedDate = toZonedTime(date, timeZone); // Convert date to the given timezone
  const timeFormat = is12Hour ? "hh:mm:ss a" : "HH:mm:ss";
  return dateFormat
    ? format(
        zonedDate,
        `${selectFormat(dateFormat)}, ${timeFormat} 'GMT' XXX`,
        { timeZone }
      )
    : formatTimeInTimezone(date, timeZone);
}

export const updateDateWidgetsRes = (
  documentData,
  signerId,
  journey,
  isRemovePrefill
) => {
  const contactUser = documentData?.Signers?.find(
    (data) => data.objectId === signerId
  );
  const extUser =
    localStorage.getItem("Extand_Class") || JSON.stringify([contactUser]);
  let placeHolders = documentData?.Placeholders;
  if (isRemovePrefill) {
    placeHolders = placeHolders?.filter((x) => x.Role !== "prefill");
  }
  const userDetails = extUser ? JSON.parse(extUser)[0] : contactUser;
  return placeHolders?.map((item) => {
    if (item?.signerObjId === signerId || item?.Id === signerId) {
      // Sort page number placeholders
      const placeHolder = Array.isArray(item.placeHolder)
        ? [...item.placeHolder]
        : [];
      const sortedPlaceHolder = placeHolder
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .map((ph) => {
          const sortedWidgets = [...ph.pos]
            .sort((a, b) => {
              // Sort widgets by Y position (top to bottom) and X position (left to right)
              // Treat widgets within 5px Y difference as belonging to the same row
              const Y_TOLERANCE = 5;
              const yDiff = a.yPosition - b.yPosition;

              if (Math.abs(yDiff) <= Y_TOLERANCE) {
                return a.xPosition - b.xPosition; // Same row → sort by X
              }

              return yDiff; // Different rows → sort by Y
            })
            .map((widget) => {
              // Update widget values if needed
              if (
                ["name", "email", "job title", "company"].includes(
                  widget.type
                ) &&
                !widget.options.defaultValue &&
                !widget.options.response &&
                userDetails
              ) {
                return {
                  ...widget,
                  options: {
                    ...widget.options,
                    response: widgetDataValue(widget.type, userDetails)
                  }
                };
              }
              return widget;
            });
          let widgetsWithResponses = sortedWidgets;
          return { ...ph, pos: widgetsWithResponses };
        });
      return {
        ...item,
        placeHolder: applyDuplicateResponsesToPages(sortedPlaceHolder)
      };
    }

    return item;
  });
};

export const selectCheckbox = (ind, selectedCheckbox) => {
  if (selectedCheckbox && selectedCheckbox?.length > 0) {
    const isCheck = selectedCheckbox?.some((data) => data === ind);
    return isCheck || false;
  }
};

export const checkRegularExpress = (validateType, setValidatePlaceholder) => {
  switch (validateType) {
    case "email":
      setValidatePlaceholder("demo@gmail.com");
      break;
    case "number":
      setValidatePlaceholder("12345");
      break;
    case "text":
      setValidatePlaceholder("please enter text");
      break;
    case "ssn":
      setValidatePlaceholder("123-45-6789");
      break;
    default:
      setValidatePlaceholder("please enter value");
  }
};

export const handleUnlinkSigner = (
  signerPos,
  setSignerPos,
  signersdata,
  setSignersData,
  uniqueId
) => {
  //remove existing signer's details from 'signerPos' array
  const updatePlaceHolder = signerPos.map((x) => {
    if (x.Id === uniqueId) {
      return { ...x, signerPtr: {}, signerObjId: "" };
    }
    return { ...x };
  });
  setSignerPos(updatePlaceHolder);
  //remove existing signer's details from 'signersdata' array and keep role and id
  const updateSigner = signersdata.map((item) => {
    if (item.Id == uniqueId) {
      return { Role: item.Role, Id: item.Id, blockColor: item.blockColor };
    }
    return item;
  });
  setSignersData(updateSigner);
};
