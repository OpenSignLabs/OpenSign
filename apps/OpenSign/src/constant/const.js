export const contactCls = "contracts_Contactbook";
export const templateCls = "contracts_Template";
export const documentCls = "contracts_Document";
export const themeColor = "#47a3ad";
export const iconColor = "#686968";
export const SCALE_STEPS = [
  0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0
];
// Dynamic icon color function for better dark mode visibility
export const getThemeIconColor = () => {
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "opensigndark" ? "#CCCCCC" : "#686968";
};
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const maxTitleLength = 250; // 250 characters
export const maxNoteLength = 200; // 200 characters
export const maxDescriptionLength = 500; // 500 characters
export const maxFileSize = 80; // for cloud 10MB / 80MB for self-hosted
