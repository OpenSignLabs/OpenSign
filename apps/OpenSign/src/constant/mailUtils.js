export function resolveMailFromSender({
  senderName,
  useNameAsSender,
  extUserName,
  senderEmail
}) {
  if (senderName) {
    return senderName;
  }

  if (useNameAsSender) {
    return extUserName || "";
  }

  return senderEmail;
}
