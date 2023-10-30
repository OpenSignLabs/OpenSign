function sanitizeFileName(fileName) {
  // Remove spaces and invalid characters
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "");
}
export default sanitizeFileName;
