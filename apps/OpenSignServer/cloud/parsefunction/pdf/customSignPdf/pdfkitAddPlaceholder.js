import {
  DEFAULT_BYTE_RANGE_PLACEHOLDER,
  DEFAULT_SIGNATURE_LENGTH,
  SUBFILTER_ADOBE_PKCS7_DETACHED,
} from "./const.js";
// eslint-disable-next-line import/no-unresolved
import PDFKitReferenceMock from "./PDFKitReferenceMock.js";
/**
 * Adds the objects that are needed for Adobe.PPKLite to read the signature.
 * Also includes a placeholder for the actual signature.
 * Returns an Object with all the added PDFReferences.
 * @param {PDFDocument} pdf
 * @param {string} reason
 * @returns {object}
 */

// testing

import PNG from "png-js";
import zlib from "zlib";
import fs from "node:fs";

const specialCharacters = [
  "á",
  "Á",
  "é",
  "É",
  "í",
  "Í",
  "ó",
  "Ó",
  "ö",
  "Ö",
  "ő",
  "Ő",
  "ú",
  "Ú",
  "ű",
  "Ű",
];

const MARKERS = [
  0xffc0, 0xffc1, 0xffc2, 0xffc3, 0xffc5, 0xffc6, 0xffc7, 0xffc8, 0xffc9,
  0xffca, 0xffcb, 0xffcc, 0xffcd, 0xffce, 0xffcf,
];

const COLOR_SPACE_MAP = {
  1: "DeviceGray",
  3: "DeviceRGB",
  4: "DeviceCMYK",
};

//  testing
function getImage(imagePath, pdf) {
  let img;
  const data = imagePath; //fs.readFileSync(imagePath);

  if (data[0] === 0xff && data[1] === 0xd8) {
    img = getJpgImage(pdf, data);
  } else if (data[0] === 0x89 && data.toString("ascii", 1, 4) === "PNG") {
    img = getPngImage(pdf, data);
  } else {
    throw new Error("Unknown image format.");
  }

  return img;
}
function getAnnotationApparance(pdf, IMG, APFONT) {
  return pdf.ref(
    {
      CropBox: [0, 0, 197, 70],
      Type: "XObject",
      FormType: 1,
      BBox: [0, 0, 197.0, 70.0], //[-10, 10, 197.0, 70.0],
      Resources: `<</XObject <<\n/Img${IMG.index} ${IMG.index} 0 R\n>>\n/Font <<\n/f1 ${APFONT.index} 0 R\n>>\n>>`,
      MediaBox: [0, 0, 197, 70],
      Subtype: "Form",
    },
    null,
    getStream(IMG.index)
  );
}

const getStream = (imgIndex) => {
  // (Aláírta: ${userInformation.commonName}) Tj
  // (Aláírta: testing name) Tj
  // (${new Date().toISOString().slice(0, 10)}) Tj

  return getConvertedText(`
    1.0 1.0 1.0 rg
    0.0 0.0 0.0 RG
    q
    q
    200 0 0 50 0 10 cm
    /Img${imgIndex} Do
    Q
    0 0 0 rg
    BT
    0 Tr
    /f1 10.0 Tf
    1.4 0 0 1 20 45.97412 Tm
    ET
    BT
    0 Tr
    /f1 10.0 Tf
    1.4 0 0 1 20 33.56006 Tm
    ET
    Q`);
};

const getFont = (pdf, baseFont) => {
  return pdf.ref({
    Type: "Font",
    BaseFont: baseFont,
    Encoding: "WinAnsiEncoding",
    Subtype: "Type1",
  });
};

const getJpgImage = (pdf, data) => {
  if (data.readUInt16BE(0) !== 0xffd8) {
    throw "SOI not found in JPEG";
  }

  let pos = 2;
  let marker;
  while (pos < data.length) {
    marker = data.readUInt16BE(pos);
    pos += 2;
    if (MARKERS.includes(marker)) {
      break;
    }
    pos += data.readUInt16BE(pos);
  }

  if (!MARKERS.includes(marker)) {
    throw "Invalid JPEG.";
  }
  pos += 2;

  const bits = data[pos++];
  const height = data.readUInt16BE(pos);
  pos += 2;

  const width = data.readUInt16BE(pos);
  pos += 2;

  const channels = data[pos++];
  const colorSpace = COLOR_SPACE_MAP[channels];

  const baseJpgData = {
    Type: "XObject",
    Subtype: "Image",
    BitsPerComponent: bits,
    Width: width,
    Height: height,
    ColorSpace: colorSpace,
    Filter: "DCTDecode",
  };

  if (colorSpace === "DeviceCMYK") {
    baseJpgData["Decode"] = [1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0];
  }
  const image = pdf.ref(baseJpgData, null, data);

  return image;
};

const getPngImage = (pdf, data) => {
  const image = new PNG(data);
  const hasAlphaChannel = image.hasAlphaChannel;

  const pngBaseData = {
    Type: "XObject",
    Subtype: "Image",
    BitsPerComponent: hasAlphaChannel ? 8 : image.bits,
    Width: image.width,
    Height: image.height,
    Filter: "FlateDecode",
  };

  if (!hasAlphaChannel) {
    const params = pdf.ref({
      Predictor: 15,
      Colors: image.colors,
      BitsPerComponent: image.bits,
      Columns: image.width,
    });

    pngBaseData["DecodeParms"] = params;
  }

  if (image.palette.length === 0) {
    pngBaseData["ColorSpace"] = image.colorSpace;
  } else {
    const palette = pdf.ref({
      stream: new Buffer(image.palette),
    });
    pngBaseData["ColorSpace"] = [
      "Indexed",
      "DeviceRGB",
      image.palette.length / 3 - 1,
      palette,
    ];
  }

  if (image.transparency.grayscale != null) {
    const val = image.transparency.grayscale;
    pngBaseData["Mask"] = [val, val];
  } else if (image.transparency.rgb) {
    const { rgb } = image.transparency;
    const mask = [];

    for (let x of rgb) {
      mask.push(x, x);
    }
    pngBaseData["Mask"] = mask;
  } else if (image.transparency.indexed) {
    loadIndexedAlphaChannel(image);
  } else if (hasAlphaChannel) {
    splitAlphaChannel(image);
    const sMask = getSmask(pdf, image);
    pngBaseData["Mask"] = sMask;
  }

  const pngImage = pdf.ref(pngBaseData, null, image.imgData);

  return pngImage;
};

const loadIndexedAlphaChannel = (image) => {
  const transparency = image.transparency.indexed;
  return image.decodePixels((pixels) => {
    const alphaChannel = new Buffer(image.width * image.height);

    let i = 0;
    for (let j = 0, end = pixels.length; j < end; j++) {
      alphaChannel[i++] = transparency[pixels[j]];
    }

    image.alphaChannel = zlib.deflateSync(alphaChannel);
  });
};

const splitAlphaChannel = (image) => {
  image.decodePixels((pixels) => {
    let a, p;
    const colorCount = image.colors;
    const pixelCount = image.width * image.height;
    const imgData = new Buffer(pixelCount * colorCount);
    const alphaChannel = new Buffer(pixelCount);

    let i = (p = a = 0);
    const len = pixels.length;
    const skipByteCount = image.bits === 16 ? 1 : 0;
    while (i < len) {
      for (let colorIndex = 0; colorIndex < colorCount; colorIndex++) {
        imgData[p++] = pixels[i++];
        i += skipByteCount;
      }
      alphaChannel[a++] = pixels[i++];
      i += skipByteCount;
    }

    image.imgData = zlib.deflateSync(imgData);
    image.alphaChannel = zlib.deflateSync(alphaChannel);
  });
};

const getSmask = (pdf, image) => {
  let sMask;
  console.log("image.hasAlphaChannel ", image.hasAlphaChannel);
  if (image.hasAlphaChannel) {
    console.log("image.alphaChannel ", image.alphaChannel);

    sMask = pdf.ref({
      Type: "XObject",
      Subtype: "Image",
      Height: image.height,
      Width: image.width,
      BitsPerComponent: 8,
      Filter: "FlateDecode",
      ColorSpace: "DeviceGray",
      Decode: [0, 1],
      stream: image.alphaChannel,
    });
  }

  return sMask;
};

const getConvertedText = (text) => {
  return text
    .split("")
    .map((character) => {
      return specialCharacters.includes(character)
        ? getOctalCodeFromCharacter(character)
        : character;
    })
    .join("");
};

const getOctalCodeFromCharacter = (character) => {
  return "\\" + character.charCodeAt(0).toString(8);
};

//
const pdfkitAddPlaceholder = ({
  pdf,
  pdfBuffer,
  reason,
  contactInfo = "emailfromp1289@gmail.com",
  name = "Name from p12",
  location = "Location from p12",
  signatureLength = DEFAULT_SIGNATURE_LENGTH,
  byteRangePlaceholder = DEFAULT_BYTE_RANGE_PLACEHOLDER,
  subFilter = SUBFILTER_ADOBE_PKCS7_DETACHED,
  sign,
}) => {
  // testing
  const FONT = getFont(pdf, "Helvetica");
  const ZAF = getFont(pdf, "ZapfDingbats");
  const APFONT = getFont(pdf, "Helvetica");
  // const imagePath = "exports/img.jpg";
  const signBase64 = sign.Base64;
  const imagePath = Buffer.from(signBase64, "base64");

  const IMG = getImage(imagePath, pdf);
  const AP = getAnnotationApparance(pdf, IMG, APFONT);

  //

  /* eslint-disable no-underscore-dangle,no-param-reassign */
  // Generate the signature placeholder
  const signature = pdf.ref({
    Type: "Sig",
    Filter: "Adobe.PPKLite",
    SubFilter: subFilter,
    ByteRange: [
      0,
      byteRangePlaceholder,
      byteRangePlaceholder,
      byteRangePlaceholder,
    ],
    Contents: Buffer.from(String.fromCharCode(0).repeat(signatureLength)),
    Reason: new String(reason), // eslint-disable-line no-new-wrappers
    M: new Date(),
    ContactInfo: new String(contactInfo), // eslint-disable-line no-new-wrappers
    Name: new String(name), // eslint-disable-line no-new-wrappers
    Location: new String(location), // eslint-disable-line no-new-wrappers
  });

  // Check if pdf already contains acroform field
  const acroFormPosition = pdfBuffer.lastIndexOf("/Type /AcroForm");
  const isAcroFormExists = acroFormPosition !== -1;
  let fieldIds = [];
  let acroFormId;

  if (isAcroFormExists) {
    let acroFormStart = acroFormPosition;
    // 10 is the distance between "/Type /AcroForm" and AcroFrom ID
    const charsUntilIdEnd = 10;
    const acroFormIdEnd = acroFormPosition - charsUntilIdEnd;
    // Let's find AcroForm ID by trying to find the "\n" before the ID
    // 12 is a enough space to find the "\n"
    // (generally it's 2 or 3, but I'm giving a big space though)
    const maxAcroFormIdLength = 12;
    let foundAcroFormId = "";
    let index = charsUntilIdEnd + 1;
    for (index; index < charsUntilIdEnd + maxAcroFormIdLength; index += 1) {
      const acroFormIdString = pdfBuffer
        .slice(acroFormPosition - index, acroFormIdEnd)
        .toString();

      if (acroFormIdString[0] === "\n") {
        break;
      }

      foundAcroFormId = acroFormIdString;
      acroFormStart = acroFormPosition - index;
    }

    const pdfSlice = pdfBuffer.slice(acroFormStart);
    const acroForm = pdfSlice.slice(0, pdfSlice.indexOf("endobj")).toString();
    acroFormId = parseInt(foundAcroFormId);

    const acroFormFields = acroForm.slice(
      acroForm.indexOf("/Fields [") + 9,
      acroForm.indexOf("]")
    );
    fieldIds = acroFormFields
      .split(" ")
      .filter((element, i) => i % 3 === 0)
      .map((fieldId) => new PDFKitReferenceMock(fieldId));
  }
  const signatureName = "Signature";
  const signatureLeftOffset = fieldIds.length * 125;
  const signatureBottomOffset = 5;
  const left = sign.Left; //461.50001525878906 //477.3333282470703//409.5000305175781; // first block 44.33332824707031;
  const bottom = sign.Bottom; // 730.1979598999023 - 39 + 5.072906494140625 //720.1979598999023 - 30 + 15.072906494140625; // first block 652.1979598999023 - 60 + 19.072906494140625;
  const RightX = left + sign.Width; // 98;
  const RightY = bottom + sign.Height; //39;
  // Generate signature annotation widget
  const widget = pdf.ref({
    Type: "Annot",
    Subtype: "Widget",
    FT: "Sig",
    Rect: [left, bottom, RightX, RightY], // [signatureLeftOffset, 0, signatureLeftOffset + 90, signatureBottomOffset + 60,  ], // [50, 50, 100, 100], //[25, 25, 100, 300], //
    V: signature,
    T: new String(signatureName + (fieldIds.length + 1)), // eslint-disable-line no-new-wrappers
    F: 4,
    P: pdf.page.dictionary, // eslint-disable-line no-underscore-dangle
    AP: `<</N ${AP.index} 0 R>>`, // testing
    DA: new String("/Helvetica 0 Tf 0 g"), // eslint-disable-line no-new-wrappers // testing
  });
  pdf.page.dictionary.data.Annots = [widget];
  // Include the widget in a page
  let form;

  if (!isAcroFormExists) {
    // Create a form (with the widget) and link in the _root
    form = pdf.ref({
      Type: "AcroForm",
      SigFlags: 3,
      Fields: [...fieldIds, widget],
    });
  } else {
    // Use existing acroform and extend the fields with newly created widgets
    form = pdf.ref(
      {
        Type: "AcroForm",
        SigFlags: 3,
        Fields: [...fieldIds, widget],
        DR: `<</Font\n<</Helvetica ${FONT.index} 0 R/ZapfDingbats ${ZAF.index} 0 R>>\n>>`, /// testing
      },
      acroFormId
    );
  }
  pdf._root.data.AcroForm = form;

  return {
    signature,
    form,
    widget,
  };
  /* eslint-enable no-underscore-dangle,no-param-reassign */
};

export default pdfkitAddPlaceholder;
