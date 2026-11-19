import Loader from "../../primitives/Loader";
import { drawWidget } from "../../constant/Utils";

/** Render the signature widget types, or return undefined when unmatched. */
export function renderSignature(type, context) {
  const {
    props,
    widgetCls,
    formatWidgetName,
    prefillImgLoad,
    imgUrl,
    widgetValue
  } = context;
  switch (type) {
    case "signature": {
      const sigRotation = props.pos.options?.rotation;
      const sigIsSwapped = [90, 270].includes(sigRotation);
      const sigImgStyle = sigRotation
        ? sigIsSwapped &&
          props.pos.signatureType === "type" &&
          props.pos.Width &&
          props.pos.Height
          ? {
              transform: `rotate(${sigRotation}deg) scaleX(${props.pos.Width / props.pos.Height}) scaleY(${props.pos.Height / props.pos.Width})`
            }
          : { transform: `rotate(${sigRotation}deg)` }
        : undefined;
      return props.pos.SignUrl ? (
        <img
          alt="signature"
          draggable="false"
          src={props.pos.SignUrl}
          style={sigImgStyle}
          className={`${props.pos.signatureType !== "type" ? "object-contain" : ""} w-full h-full select-none-cls`}
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px",
                ...(sigRotation
                  ? { transform: `rotate(${sigRotation}deg)` }
                  : {})
              }}
              className={`${sigIsSwapped ? "whitespace-nowrap" : ""} font-medium`}
            >
              {formatWidgetName()}
            </div>
          )}
        </div>
      );
    }
    case "stamp":
      return props.pos.SignUrl ? (
        <img
          alt="stamp"
          draggable="false"
          src={props.pos.SignUrl}
          className="w-full h-full select-none-cls object-contain"
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px"
              }}
              className="font-medium"
            >
              {formatWidgetName()}
            </div>
          )}
        </div>
      );
    case "initials": {
      const iniRotation = props.pos.options?.rotation;
      const iniIsSwapped = [90, 270].includes(iniRotation);
      const iniImgStyle = iniRotation
        ? iniIsSwapped &&
          props.pos.signatureType === "type" &&
          props.pos.Width &&
          props.pos.Height
          ? {
              transform: `rotate(${iniRotation}deg) scaleX(${props.pos.Width / props.pos.Height}) scaleY(${props.pos.Height / props.pos.Width})`
            }
          : { transform: `rotate(${iniRotation}deg)` }
        : undefined;
      return props.pos.SignUrl ? (
        <img
          alt="initials"
          draggable="false"
          src={props.pos.SignUrl}
          style={iniImgStyle}
          className={`${props.pos.signatureType !== "type" ? "object-contain" : ""} w-full h-full select-none-cls`}
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px",
                ...(iniRotation
                  ? { transform: `rotate(${iniRotation}deg)` }
                  : {}),
                ...(iniIsSwapped ? { whiteSpace: "nowrap" } : {})
              }}
              className="font-medium text-center"
            >
              {formatWidgetName()}
            </div>
          )}
        </div>
      );
    }
    case "initials": {
      const iniRotation = props.pos.options?.rotation;
      const iniIsSwapped = [90, 270].includes(iniRotation);
      const iniImgStyle = iniRotation
        ? iniIsSwapped &&
          props.pos.signatureType === "type" &&
          props.pos.Width &&
          props.pos.Height
          ? {
              transform: `rotate(${iniRotation}deg) scaleX(${props.pos.Width / props.pos.Height}) scaleY(${props.pos.Height / props.pos.Width})`
            }
          : { transform: `rotate(${iniRotation}deg)` }
        : undefined;
      return props.pos.SignUrl ? (
        <img
          alt="initials"
          draggable="false"
          src={props.pos.SignUrl}
          style={iniImgStyle}
          className={`${props.pos.signatureType !== "type" ? "object-contain" : ""} w-full h-full select-none-cls`}
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px",
                ...(iniRotation
                  ? { transform: `rotate(${iniRotation}deg)` }
                  : {}),
                ...(iniIsSwapped ? { whiteSpace: "nowrap" } : {})
              }}
              className="font-medium text-center"
            >
              {formatWidgetName()}
            </div>
          )}
        </div>
      );
    }
    case "image":
      return prefillImgLoad[props.pos?.key] ? (
        <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-white/30 z-50">
          <Loader />
        </div>
      ) : imgUrl ? (
        <img
          alt="image"
          draggable="false"
          src={imgUrl}
          className="w-full h-full select-none-cls object-contain"
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px"
              }}
              className="font-medium text-center"
            >
              {formatWidgetName()}
            </div>
          )}
        </div>
      );
    case drawWidget:
      return prefillImgLoad[props.pos?.key] ? (
        <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-white/30 z-50">
          <Loader />
        </div>
      ) : widgetValue ? (
        <img
          alt="signature"
          draggable="false"
          src={widgetValue}
          className={`${props.pos.signatureType !== "type" ? "object-contain" : ""} w-full h-full select-none-cls`}
        />
      ) : (
        <div className={widgetCls}>
          {props.pos.type && (
            <div
              style={{
                fontSize: props.pos
                  ? props.calculateFontsize(props.pos)
                  : "11px"
              }}
              className="font-medium"
            >
              {formatWidgetName()}
            </div>
          )}
        </div>
      );
  }
}

/** Render the fallback placeholder for unknown widget types. */
export function renderFallback(context) {
  const { props, widgetCls, formatWidgetName } = context;
  return props.pos.SignUrl ? (
    <div className="pointer-events-none">
      <img
        alt="image"
        draggable="false"
        src={props.pos.SignUrl}
        className="w-full h-full "
      />
    </div>
  ) : (
    <div className={widgetCls}>
      {props.pos.isStamp ? <div>stamp</div> : <div>signature</div>}
      {props.pos.type && (
        <div
          style={{
            fontSize: props.pos ? props.calculateFontsize(props.pos) : "11px"
          }}
          className="font-medium"
        >
          {formatWidgetName()}
        </div>
      )}
    </div>
  );
}
