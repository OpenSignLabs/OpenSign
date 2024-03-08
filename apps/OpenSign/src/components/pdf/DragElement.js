import React from "react";
import { getWidgetType, widgets } from "../../constant/Utils";

function DragElement(item) {
  const getWidgets = widgets;
  const filterWidgetPreview = getWidgets.filter(
    (data) => data.type === item?.text
  );

  return <div>{getWidgetType(filterWidgetPreview[0])}</div>;
}

export default DragElement;
