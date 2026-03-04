import EMPTY_EMAIL_MESSAGE from "./sample/empty-email-message";
import getRequestEmail from "./sample/request-email";
import getCompletionEmail from "./sample/completion-email";

export default function getConfiguration(
  template: string,
) {

  if (template.startsWith("#sample/")) {
    const sampleName = template.replace("#sample/", "");
    switch (sampleName) {
      case "requestemail":
        return getRequestEmail(
        );
      case "completionemail":
        return getCompletionEmail(
        );
      default:
        return "requestemail";
    }
  }

  if (template.startsWith("#code/")) {
    const encodedString = template.replace("#code/", "");
    const configurationString = decodeURIComponent(atob(encodedString));
    try {
      return JSON.parse(configurationString);
    } catch {
      console.error(`Couldn't load configuration from hash.`);
    }
  }

  return EMPTY_EMAIL_MESSAGE;
}
