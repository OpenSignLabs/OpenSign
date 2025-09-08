const Guidelines = ({ x1, x2, y1, y2 }) => {
  return (
    <>
      {/* Horizontal guidelines */}
      {/* top guide */}{" "}
      <div
        className="absolute pointer-events-none z-[1000] left-0 w-full border-t-[1px] border-dashed border-[#3b82f6]"
        style={{ top: y1 }}
      />
      {/* bottom guide */}
      <div
        className="absolute pointer-events-none z-[1000] left-0 w-full border-t-[1px] border-dashed border-[#3b82f6]"
        style={{ top: y2 }}
      />
      {/* Vertical guidelines */}
      {/* left guide */}
      <div
        className="absolute pointer-events-none z-[1000] top-0 h-full border-l-[1px] border-dashed border-[#3b82f6]"
        style={{ left: x1 }}
      />
      {/* right guide */}
      <div
        className="absolute pointer-events-none z-[1000] top-0 h-full border-l-[1px] border-dashed border-[#3b82f6]"
        style={{ left: x2 }}
      />
    </>
  );
};

export default Guidelines;
