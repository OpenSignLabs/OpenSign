import getPagesDictionaryRef from "./getPagesDictionaryRef.js";
import findObject from "./findObject.js";

/**
 * Finds the reference to a page.
 *
 * @param {Buffer} pdfBuffer
 * @param {Object} info As extracted from readRef()
 * @param {Number} Page is pageNo on which we want widget/sign
 */
export default function getPageRef(pdfBuffer, info, Page) {
  const pagesRef = getPagesDictionaryRef(info);
  const pagesDictionary = findObject(pdfBuffer, info.xref, pagesRef);
  const kidsPosition = pagesDictionary.indexOf("/Kids");
  const kidsStart = pagesDictionary.indexOf("[", kidsPosition) + 1;
  const kidsEnd = pagesDictionary.indexOf("]", kidsPosition);
  const pages = pagesDictionary.slice(kidsStart, kidsEnd).toString();
  // console.log("pages ", pages);
  // const split = pages.trim().split(" ", 3);
  //   return `${split[0]} ${split[1]} ${split[2]}`;

  //  below code is used to get pageIndex (10 0 R) from pageNo to add sign widget on it
  let indices = [];
  for (var i = 0; i < pages.length; i++) {
    if (pages[i] === "R") indices.push(i);
  }
  let pageIndex = {};
  let startPosition = 0;
  indices.forEach((x, index) => {
    pageIndex = {
      ...pageIndex,
      [index + 1]: pages.substring(startPosition + 1, x + 1),
    };
    startPosition = x + 1;
  });
  // console.log("pageIndex ", pageIndex);

  const pageStr = Page ? pageIndex[Page] : pageIndex[1];
  // console.log("pageStr ", pageStr);
  return pageStr;
}
