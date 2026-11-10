import Parse from "parse";
const KEY = "opensign:document-access";
export function rememberDocumentAccess(docId, guestToken) {
  if (typeof guestToken !== "string" || !/^[A-Za-z0-9]{6,30}\.[a-f0-9]{64}$/.test(guestToken))
    return;
  sessionStorage.setItem(KEY, JSON.stringify({ docId, guestToken }));
}
export function documentAccessParams(docId) {
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY));
    return value && (!docId || value.docId === docId)
      ? { docId: value.docId, guestToken: value.guestToken }
      : {};
  } catch {
    return {};
  }
}
export async function createSigningLink(docId, recipientId, recipientEmail) {
  const issued = await Parse.Cloud.run("createdocumentaccess", {
    docId,
    recipientId,
    recipientEmail,
  });
  return issued.signUrl;
}
