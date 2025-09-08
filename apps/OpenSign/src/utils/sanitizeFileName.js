export function sanitizeFileName(fileName) {
  // Remove spaces and invalid characters
  const file = fileName?.replace(/[^a-zA-Z0-9._-]/g, "");
  const removedot = file?.replace(/\.(?=.*\.)/g, "");
  return removedot?.replace(/[^a-zA-Z0-9._-]/g, "");
}
