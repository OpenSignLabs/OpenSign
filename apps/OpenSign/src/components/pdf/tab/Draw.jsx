import SignatureCanvas from "react-signature-canvas";

function Draw(props) {
  return (
    <div className="flex justify-center">
      <SignatureCanvas
        ref={props?.canvasRef}
        penColor={props?.penColor}
        canvasProps={{
          className: `${props?.currWidgetsDetails?.type === "initials" ? "intialSignatureCanvas" : "signatureCanvas"} border-[1.3px] border-gray-300 rounded-[4px]`
        }}
        onEnd={() =>
          props?.handleSignatureChange(props?.canvasRef.current?.toDataURL())
        }
        dotSize={1}
      />
    </div>
  );
}

export default Draw;
