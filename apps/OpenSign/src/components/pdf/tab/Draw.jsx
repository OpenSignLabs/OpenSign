import { useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { drawWidget } from "../../../constant/Utils";
import { useSelector } from "react-redux";

//this component is used for signature widget "Draw tab" and prefill user Draw widget
function Draw(props) {
  const { prefillImg } = useSelector((state) => state.widget);
  useEffect(() => {
    handleDrawResponse();
  }, [prefillImg]);

  //function is used to show draw widget response
  const handleDrawResponse = async () => {
    if (
      props?.currWidgetsDetails?.type === drawWidget &&
      props?.canvasRef.current
    ) {
      const getPrefillImg = prefillImg?.find(
        (x) => x.id === props?.currWidgetsDetails?.key
      );
      const base64 = getPrefillImg?.base64;
      props?.canvasRef.current.fromDataURL(base64);
    }
  };
  return (
    <div className="flex justify-center">
      <SignatureCanvas
        ref={props?.canvasRef}
        penColor={props?.penColor}
        canvasProps={{
          className: `${
            props?.prefillCls
              ? "prefillCanvas"
              : props?.currWidgetsDetails?.type === "initials"
                ? "intialSignatureCanvas"
                : "signatureCanvas"
          } border-[1.3px] border-gray-300 rounded-[10px]`
        }}
        onEnd={() =>
          props?.handleSignatureChange(
            props?.canvasRef.current?.toDataURL(),
            props?.currWidgetsDetails
          )
        }
        dotSize={1}
      />
    </div>
  );
}

export default Draw;
