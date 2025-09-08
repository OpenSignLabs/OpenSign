import { generateTitleFromFilename, getBase64FromUrl } from "../constant/Utils";
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
