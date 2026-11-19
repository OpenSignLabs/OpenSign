// @vitest-environment node
// Characterization + spec tests for #69 (residual renames):
// - lock the facade export names (constant/Utils.js): exactly the 141 names
//   captured on origin/develop before the rename, byte-identical set.
// - specify the responsibility module paths replacing the nine legacy
//   numbered part modules.
// - lock that no numbered legacy part files remain in constant/utils/.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

// 141 export names captured from origin/develop:apps/OpenSign/src/constant/Utils.js
// before the residual rename. The facade must keep exporting every one of them.
const EXPECTED_FACADE_NAMES = ["addDefaultSignatureImg","addInitialData","addWidgetOptions","addWidgetSelfsignOptions","addZIndex","arrayBufferToBase64","base64ToArrayBuffer","base64ToFile","calculateImgAspectRatio","calculateInitialWidthHeight","cellsWidget","changeDateToMomentFormat","changeImageWH","checkRegularExpress","clearResponse","color","compressedFileSize","contactBook","contractDocument","contractUsers","convertBase64ToFile","convertBase64ToImg","convertJpegToPng","convertPNGtoJPEG","convertPdfArrayBuffer","convertTextToImg","copytoData","createDocument","darkenColor","decryptPdf","defaultMailBody","defaultMailSubject","defaultWidthHeight","deletePdfPage","drawWidget","embedDocId","embedWidgetsToDoc","escapeRegExp","fetchBase64","fetchImageBase64","fetchUrl","fileNameWithUnderscore","fileasbytes","findContact","flattenPdf","fontColorArr","fontsizeArr","formatDateTime","formatDateToDdMmmYyyy","formatTimeInTimezone","generateId","generatePdfName","generateTitleFromFilename","getAppLogo","getBase64FromIMG","getBase64FromUrl","getBase64MimeType","getContainerScale","getDate","getDefaultDate","getDefaultFormat","getDefaultSignature","getDrive","getEnv","getFileAsArrayBuffer","getFileName","getFirstLetter","getFontSizeForHeight","getMonth","getOriginalWH","getSecureUrl","getSignedUrl","getSignerEmail","getSignerPages","getTenantDetails","getUserCountry","getYear","handleBackground","handleCheckResponse","handleCopyNextToWidget","handleCopySignUrl","handleDeleteWidget","handleDownloadCertificate","handleDownloadPdf","handleHeighlightWidget","handleRemoveWidgets","handleRotateWarning","handleSendOTP","handleSignYourselfWidgetResize","handleSignatureType","handleToPrint","handleUnlinkSigner","handleWidgetResize","isBase64","isCustomFileAdapter","isEmptyValue","isHighResolution","isMobile","isRadioSelected","isTab","isTabAndMobile","mailTemplate","months","nameColor","nextPendingWidget","nonPresentMaskCss","onChangeHeightOfTextArea","onChangeInput","onClickZoomIn","onClickZoomOut","onImageSelect","onSaveImage","onSaveSign","openInNewTab","pdfNewWidthFun","pendingButtonZoomScrollRef","placeholderHeight","placeholderWidth","radioButtonWidget","randomId","range","removeBase64Prefix","removeTrailingSegment","reorderPdfPages","replaceMailVaribles","rotatePdfPage","saveLanguageInLocal","selectCheckbox","selectFormat","sendEmailToSigners","signPdfFun","signatureTypes","textInputWidget","textWidget","toDataUrl","updateDateWidgetsRes","urlValidator","usertimezone","widgetDataValue","widgets","years"];

const facadeNames = () => {
  const src = fs.readFileSync(path.join(here, "..", "Utils.js"), "utf8");
  const names = [];
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const n of m[1].split(",")) {
      const name = n.trim();
      if (name) names.push(name);
    }
  }
  return names.sort();
};

describe("#69 facade exports stay byte-identical (141/141)", () => {
  it("exports exactly the captured name set, no more and no less", () => {
    expect(facadeNames()).toEqual(EXPECTED_FACADE_NAMES);
  });
});

describe("#69 responsibility modules replace legacy numbered part files", () => {
  it("the nine responsibility modules exist", () => {
    for (const name of [
      "coreConstants.js",
      "widgetCatalog.js",
      "widgetOptions.js",
      "imageHandling.js",
      "widgetEmbedding.js",
      "tenantDownloads.js",
      "printCertificates.js",
      "pdfPageView.js",
      "pdfPageEdit.js",
      "widgetSizing.js",
      "widgetState.js",
      "widgetInput.js",
      "widgetInlineEditing.js",
      "signatureSave.js",
      "placeholderTools.js",
      "pdfFlatten.js",
      "pdfFieldDrawing.js",
      "widgetResponses.js",
      "pdfResponse.js",
      "signerMail.js",
      "widgetLifecycle.js",
      "widgetPrimitives.js"
    ]) {
      expect(
        fs.existsSync(path.join(here, name)),
        `${name} exists`
      ).toBe(true);
    }
  });

  // UtilsPart05 keeps its name on purpose: the #68 function-split slice
  // works inside that file, so the facade and prefillUtils still import it.
  it("no legacy numbered part files remain (except UtilsPart05)", () => {
    const leftovers = fs
      .readdirSync(here)
      .filter((n) => /^UtilsPart(?!05)\d+\.js$/.test(n));
    expect(leftovers).toEqual([]);
  });

  it("no importer still references a legacy numbered part path (except UtilsPart05)", () => {
    const offenders = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (/\.(js|jsx)$/.test(entry.name)) {
          const src = fs.readFileSync(full, "utf8");
          if (/UtilsPart(?!05)\d+/.test(src)) offenders.push(full);
        }
      }
    };
    walk(path.join(here, "..", ".."));
    expect(offenders).toEqual([]);
  });
});
