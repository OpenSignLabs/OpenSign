/**
 * Widgets the owner fills in the prefill modal, de-duplicated by name and
 * ordered by page and vertical position.
 * @param {object|undefined} prefillData The placeholder entry with Role "prefill".
 * @returns {Array<{widget: object, pageNumber: number, yPosition: number}>} Editable widgets.
 */
export const getPrefillWidgets = (prefillData) => {
    //functions to used remove duplicate name values across all pages
    if (!prefillData) return [];
    //This will help us track which name values have already been encountered across all pages.
    const uniqueNames = new Set();
    //Filter and flatten placeholder widgets while keeping unique names
    const filteredArray = prefillData?.placeHolder?.map((item) => ({
      ...item,
      pos: item.pos.filter((curr) => {
        if (uniqueNames.has(curr?.options?.name)) return false; //Duplicate name found, remove it
        uniqueNames.add(curr?.options?.name); //First time seen, add to set
        return true;
      })
    }));
    // Flatten the filtered array, exclude read-only widgets,
    // carry yPosition for sorting, then sort by pageNumber asc → yPosition asc
    // (mirrors the newSignPos.sort in PdfRequestFiles so widgets appear in
    // the same top-to-bottom, page-1-first order as they do in the document)
    const flatArray = filteredArray
      ?.flatMap((page) =>
        page.pos
          // Every editable widget is shown, answered or not: this list renders
          // the prefill form, it is not a "next field" walker (#83).
          .filter((widget) => !widget.options?.isReadOnly)
          .map((widget) => ({
            widget,
            pageNumber: page.pageNumber,
            yPosition: widget.yPosition ?? 0
          }))
      )
      ?.sort((a, b) =>
        a.pageNumber !== b.pageNumber
          ? a.pageNumber - b.pageNumber  // primary: page order (page 1 first)
          : a.yPosition - b.yPosition    // secondary: top-to-bottom within page
      );

  return flatArray || [];
};
