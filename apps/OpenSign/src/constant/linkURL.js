export default function linkURL(url) {
  let newURL = (url && decodeURIComponent(url)) || "";
  return newURL.substring(newURL.indexOf(".com/") + 5, newURL.indexOf("_"));
}
