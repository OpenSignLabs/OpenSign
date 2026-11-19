import { drawWidget } from "../../constant/Utils";

/** Build the handler that uploads prefill drawings and returns the updated positions. */
export function createEmbedPrefill(context) {
  const {
    props,
    handleSavePrefillImg
  } = context;
  const handleEmbedPrefill = async (item) => {
    //checking is there any draw widget response have base64 url then generate that base64 to url and save it
    const prefillWidgets = props.xyPosition?.find((x) => x.Role === "prefill");
    let updatedXyPosition = [];
    if (prefillWidgets) {
      const isDrawWidget = (prefillWidgets.placeHolder ?? []).some((ph) =>
        (ph?.pos ?? []).some((p) => p?.type === drawWidget)
      );
      if (isDrawWidget) {
        const getPrefill = props.xyPosition.find((x) => x?.Role === "prefill");
        const getPlaceholder = getPrefill?.placeHolder ?? [];
        const updatedData = await Promise.all(
          getPlaceholder.map(async (page) => ({
            ...page,
            pos: await Promise.all(
              page.pos.map(async (item) => {
                if (item?.type === drawWidget) {
                  const widgetResponse = item?.options?.response;

                  // Skip if no response
                  if (!widgetResponse) return item;

                  // If already URL, do not re-upload
                  if (
                    typeof widgetResponse === "string" &&
                    widgetResponse.startsWith("http")
                  ) {
                    return item;
                  }

                  // Convert THIS widget's base64 → URL
                  const drawUrl = await handleSavePrefillImg(widgetResponse);
                  return {
                    ...item,
                    options: {
                      ...item.options,
                      response: drawUrl
                    }
                  };
                }

                return item;
              })
            )
          }))
        );

        updatedXyPosition = props.xyPosition.map((obj) => {
          if (obj.Role === "prefill") {
            return {
              ...obj,
              placeHolder: updatedData
            };
          }
          return obj;
        });

        props.setXyPosition(updatedXyPosition);
      }
    }

      await props.handleCreateDocument();
  };
  //`loadOptions` function to use show all list of signer in dropdown
  return handleEmbedPrefill;
}
