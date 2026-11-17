export const normalizeMailSubject = subject =>
  String(subject || '').replace(/opensign™/gi, 'opensign');

export function replaceMailVaribles(subject, body, variables) {
  let replacedSubject = subject;
  let replacedBody = body;

  for (const variable in variables) {
    const regex = new RegExp(`{{${variable}}}`, 'g');
    if (subject) {
      replacedSubject = replacedSubject.replace(regex, variables[variable]);
    }
    if (body) {
      replacedBody = replacedBody.replace(regex, variables[variable]);
    }
  }
  const result = { subject: normalizeMailSubject(replacedSubject), body: replacedBody };
  return result;
}
