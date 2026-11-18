import { format } from "date-fns-tz";
import { applyNumberFormulasToPages } from "../../utils/widgetUtils";
import { textInputWidget } from "./UtilsPart01.js";
import { getDuplicateAutoApplyName } from "./UtilsPart01.js";
import { reuseUnchangedWidgets } from "./widgetState.js";
import { addInitialData } from "./widgetInlineEditing.js";

export const onChangeInput = (
  value,
  currentPosition,
  xyPosition,
  index,
  setXyPosition,
  userId,
  initial,
  dateFormat,
  fontSize,
  fontColor,
  dateDetails,
  textWidgetHeight
) => {
  const isDuplicateValueUpdate = !dateFormat && !textWidgetHeight;
  const shouldAutoApplyDuplicateWidget = (position) => {
    const currentName = getDuplicateAutoApplyName(currentPosition);
    const positionName = getDuplicateAutoApplyName(position);
    return currentName && positionName && currentName === positionName;
  };
  const applyDuplicateWidgetValue = (position) => {
    if (
      position?.options?.response === value &&
      position?.options?.defaultValue === ""
    ) {
      return position;
    }
    return {
      ...position,
      options: {
        ...position.options,
        response: value,
        defaultValue: ""
      }
    };
  };
  const isSigners = xyPosition.some(
    (data) => data.signerPtr || data.Role === "prefill"
  );
  let filterSignerPos;
  if (isSigners) {
    if (userId) {
      filterSignerPos = xyPosition.filter((data) => data.Id === userId);
    }
    const getPlaceHolder = filterSignerPos[0]?.placeHolder;
    if (initial) {
      const xyData = addInitialData(xyPosition, setXyPosition, value, userId);
      setXyPosition(xyData);
    } else {
      const getPageNumer = getPlaceHolder.filter(
        (data) => data.pageNumber === index
      );
      if (getPageNumer.length > 0) {
        const updatePositionValue = (position) => {
          if (position.key === currentPosition.key) {
            if (dateFormat) {
              return {
                ...position,
                options: {
                  ...position.options,
                  response: value,
                  fontSize: fontSize ? fontSize : position.options?.fontSize,
                  fontColor: fontColor
                    ? fontColor
                    : position.options?.fontColor,
                  isReadOnly:
                    dateDetails && dateDetails?.isReadOnly !== "undefined"
                      ? dateDetails?.isReadOnly
                      : position.options?.isReadOnly,
                  status:
                    dateDetails && dateDetails?.status !== "undefined"
                      ? dateDetails?.status
                      : position.options?.status,
                  name:
                    dateDetails && dateDetails?.name !== "undefined"
                      ? dateDetails?.name
                      : position.options?.name,
                  validation: {
                    type: "date-format",
                    format: dateFormat // This indicates the required date format explicitly.
                  },
                  hint: dateDetails?.hint || position.options?.hint || ""
                }
              };
            } else if (
              (currentPosition?.type === "text" ||
                currentPosition?.type === textInputWidget) &&
              textWidgetHeight &&
              !value
            ) {
              const dimension = [90, 270].includes(position.options?.rotation)
                ? "Width"
                : "Height";
              return { ...position, [dimension]: textWidgetHeight };
            } else {
              return applyDuplicateWidgetValue(position);
            }
          }
          if (
            isDuplicateValueUpdate &&
            shouldAutoApplyDuplicateWidget(position)
          ) {
            return applyDuplicateWidgetValue(position);
          }
          return position;
        };
        setXyPosition((prevPosition) => {
          const sourcePosition = Array.isArray(prevPosition)
            ? prevPosition
            : xyPosition;
          return sourcePosition.map((obj) => {
            if (obj.Id !== userId) {
              return obj;
            }
            const updatedPlaceHolder = (obj.placeHolder || []).map((page) => ({
              ...page,
              pos: page.pos.map(updatePositionValue)
            }));
            return {
              ...obj,
              placeHolder: reuseUnchangedWidgets(
                obj.placeHolder || [],
                applyNumberFormulasToPages(updatedPlaceHolder)
              )
            };
          });
        });
      }
    }
  } else {
    const updatePositionValue = (positionData) => {
      if (positionData.key === currentPosition.key) {
        if (dateFormat) {
          return {
            ...positionData,
            options: {
              ...positionData.options,
              response: value,
              fontSize: fontSize,
              fontColor: fontColor,
              validation: {
                type: "date-format",
                format: dateFormat // This indicates the required date format explicitly.
              }
            }
          };
        } else if (
          (currentPosition?.type === "text" ||
            currentPosition?.type === textInputWidget) &&
          textWidgetHeight &&
          !value
        ) {
          const dimension = [90, 270].includes(positionData.options?.rotation)
            ? "Width"
            : "Height";
          return { ...positionData, [dimension]: textWidgetHeight };
        } else {
          return applyDuplicateWidgetValue(positionData);
        }
      }
      if (
        isDuplicateValueUpdate &&
        shouldAutoApplyDuplicateWidget(positionData)
      ) {
        return applyDuplicateWidgetValue(positionData);
      }
      return positionData;
    };

    setXyPosition((prevPosition) => {
      const sourcePosition = Array.isArray(prevPosition)
        ? prevPosition
        : xyPosition;
      const updatePlaceholder = sourcePosition.map((obj) => ({
        ...obj,
        pos: obj.pos.map(updatePositionValue)
      }));
      return reuseUnchangedWidgets(
        sourcePosition,
        applyNumberFormulasToPages(updatePlaceholder)
      );
    });
  }
};
