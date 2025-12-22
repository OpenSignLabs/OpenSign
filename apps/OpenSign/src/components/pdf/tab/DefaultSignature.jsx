function DefaultSignature(props) {
  return (
    <div className="flex justify-center">
      <div
        className={`${props?.currWidgetsDetails?.type === "initials" ? "intialSignatureCanvas" : "signatureCanvas"} border-[1.3px] border-gray-300 rounded-[4px]`}
      >
        <img
          src={props?.defaultSignImg}
          draggable="false"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

export default DefaultSignature;
