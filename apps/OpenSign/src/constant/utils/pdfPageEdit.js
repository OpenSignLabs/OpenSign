import { PDFDocument } from "pdf-lib";
import { PDFName } from "pdf-lib";
import { format } from "date-fns-tz";
import { toZonedTime } from "date-fns-tz";
import { base64ToArrayBuffer } from "./pdfPageView.js";

export function generateTitleFromFilename(filename) {
  try {
    // Step 1: Trim whitespace
    let title = filename.trim();

    // Step 2: Remove the file extension (everything after the last '.')
    const lastDotIndex = title.lastIndexOf(".");
    if (lastDotIndex > 0) {
      title = title.substring(0, lastDotIndex);
    }

    // Step 3: Replace special characters (except Unicode letters, digits, spaces, and hyphens)
    title = title.replace(/[^\p{L}\p{N}\s-]/gu, " ");

    // Step 4: Replace multiple spaces with a single space
    title = title.replace(/\s+/g, " ");

    // Step 5: Capitalize first letter of each word (Title Case), handling Unicode characters
    title = title.replace(
      /\p{L}\S*/gu,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );

    // Step 6: Restrict length of title (optional, let's say 100 characters)
    if (title.length > 100) {
      title = title.substring(0, 100).trim();
    }

    // Step 7: Handle empty or invalid title by falling back to "Untitled Document"
    if (!title || title.length === 0) {
      return "Untitled Document";
    }

    return title;
  } catch (error) {
    // Handle unexpected errors gracefully by returning a default title
    console.error("Error generating title from filename:", error);
    return "Untitled Document";
  }
}

export const signatureTypes = [
  { name: "draw", enabled: true },
  { name: "typed", enabled: true },
  { name: "upload", enabled: true },
  { name: "default", enabled: true }
];

export async function handleSignatureType(tenantSignTypes, signatureType) {
  const docSignTypes = signatureType || signatureTypes;
  let updatedSignatureType = signatureType || signatureTypes;
  if (tenantSignTypes?.length > 0) {
    updatedSignatureType = tenantSignTypes?.map((item) => {
      const match = docSignTypes.find((data) => data.name === item.name);
      return match ? { ...item, enabled: match.enabled } : item;
    });
  }
  return updatedSignatureType;
}

export const formatDateToDdMmmYyyy = (date) => {
  // Create a Date object
  const newDate = new Date(date);
  // Format the date
  const formattedDate = newDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const format = formattedDate.replaceAll(/ /g, "-");
  return format;
};

export const deletePdfPage = async (pdfArrayBuffer, pageNumber) => {
  try {
    // Load the existing PDF
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer, {
      ignoreEncryption: true
    });
    // Get the total number of pages
    const totalPages = pdfDoc.getPageCount();
    // Ensure the page index is valid
    if (totalPages > 1) {
      //Remove the specified page
      pdfDoc.removePage(pageNumber - 1);
      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.saveAsBase64({
        useObjectStreams: false
      });
      const arrayBuffer = base64ToArrayBuffer(modifiedPdfBytes);
      return {
        arrayBuffer: arrayBuffer,
        base64: modifiedPdfBytes,
        remainingPages: totalPages - 1
      };
    } else {
      return { totalPages: 1 };
    }
  } catch (err) {
    console.log("Err while deleting page", err);
  }
};

export const reorderPdfPages = async (pdfArrayBuffer, orderArr) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer, {
      ignoreEncryption: true
    });
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(
      pdfDoc,
      orderArr.map((n) => n - 1)
    );
    pages.forEach((p) => newPdf.addPage(p));
    const pdfBase64 = await newPdf.saveAsBase64({ useObjectStreams: false });
    const arrayBuffer = base64ToArrayBuffer(pdfBase64);
    return { arrayBuffer, base64: pdfBase64, totalPages: orderArr.length };
  } catch (err) {
    console.log("Err while reordering pages", err);
  }
};

export function generatePdfName(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const formatTimeInTimezone = (date, timezone) => {
  const nyDate = timezone && toZonedTime(date, timezone);
  const generatedDate = timezone
    ? format(nyDate, "EEE, dd MMM yyyy HH:mm:ss zzz", { timeZone: timezone })
    : new Date(date).toUTCString();
  return generatedDate;
};



export const handleHeighlightWidget = (
  getCurrentSignerPos,
  key,
  pageNumber
) => {
  const placeholder = getCurrentSignerPos.placeHolder;
  // Find the highest zIndex value
  const highestZIndex = placeholder
    .flatMap((item) => item.pos.map((position) => position.zIndex))
    .reduce((max, zIndex) => (zIndex > max ? zIndex : max), -Infinity); //-Infinity represents the smallest possible number
  // Update the zIndex of the current signer
  const updateZindex = placeholder.map((data) => {
    if (data.pageNumber === pageNumber) {
      return {
        ...data,
        pos: data.pos.map((position) => {
          if (position.key === key) {
            return { ...position, zIndex: highestZIndex + 1 };
          }
          return position;
        })
      };
    }
    return data;
  });
  return updateZindex;
};

export const toPdfBytes = (input) => {
  if (typeof input === "string") {
    const binary = atob(input.replace(/^data:application\/pdf;base64,/, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  return input;
};

export const hasSignatureField = (context, node, visited = new Set()) => {
  if (!node) return false;
  if (visited.has(node)) return false;
  visited.add(node);
  const ft = node.get?.(PDFName.of("FT"));
  if (ft && ft.toString() === "/Sig") return true;
  const kidsRef = node.get?.(PDFName.of("Kids"));
  const kids = kidsRef ? context.lookup(kidsRef) : null;
  if (kids && typeof kids.asArray === "function") {
    for (const kidRef of kids.asArray()) {
      const kid = context.lookup(kidRef);
      if (hasSignatureField(context, kid, visited)) return true;
    }
  }
  return false;
};
