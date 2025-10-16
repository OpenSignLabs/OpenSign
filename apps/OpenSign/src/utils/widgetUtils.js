import { generateTitleFromFilename } from "../constant/Utils";
import { base64StringtoFile, uploadFile } from "./fileUtils";
import { sanitizeFileName } from "./sanitizeFileName";
import Parse from "parse";
// `handlesavesign` is used to save signature, initials, stamp as a default
export const saveToMySign = async (widget) => {
  const base64 = widget?.base64;
  if (base64) {
    try {
      const User = Parse?.User?.current();
      const sanitizename = generateTitleFromFilename(User?.get("name"));
      const replaceSpace = sanitizeFileName(sanitizename);
      const fileName =
        widget?.type === "signature"
          ? `${replaceSpace}__sign`
          : `${replaceSpace}__initials`;
      const file = base64StringtoFile(base64, fileName);
      const fileUrl = await uploadFile(file, User?.id);
      // below code is used to save or update default signature, initials, stamp
      const signCls = new Parse.Object("contracts_Signature");
      if (widget?.defaultSignId) {
        signCls.id = widget.defaultSignId;
      }
      if (widget?.type === "initials") {
        signCls.set("Initials", fileUrl);
      } else if (widget?.type === "signature") {
        signCls.set("ImageURL", fileUrl);
      }
      signCls.set("UserId", Parse.User.createWithoutData(User.id));
      const signRes = await signCls.save();
      return { base64File: base64, id: signRes?.id };
    } catch (err) {
      console.log("Err while saving signature", err);
      return url;
    }
  }
};

// helper: does this signer already have any signature widget?
export const hasSignatureWidget = (s) =>
  (s.placeHolder ?? []).some((ph) =>
    (ph?.pos ?? []).some((p) => p?.type === "signature")
  );

/**
 *
 * @param {Array<object>} pages
 *   Array of page objects. Each page is expected to have:
 *     - pos: Array<Widget> where Widget has shape:
 *         {
 *           key: string,
 *           type: string,
 *           options?: {
 *             response?: number|string,
 *             defaultValue?: number|string,
 *             formula?: string
 *           }
 *         }
 *
 * @returns {Array<object>}
 */
export const applyNumberFormulasToPages = (pages = []) => {
  // Guard: if not an array or empty, just return as-is
  if (!Array.isArray(pages) || pages.length === 0) {
    return pages;
  }

  // Clone pages and each widget.options so we do not mutate caller's data.
  // (Shallow clone is sufficient for our current usage since we only touch `options`.)
  const clonedPages = pages.map((page) => ({
    ...page,
    pos: (page?.pos || []).map((widget) => ({
      ...widget,
      options: { ...widget.options }
    }))
  }));

  // Return the cloned, updated pages
  return clonedPages;
};
