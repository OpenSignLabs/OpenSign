import { useGuidelinesContext } from "../../context/GuidelinesContext";

const Guidelines = ({ pageNumber }) => {
  const { guideRefs } = useGuidelinesContext();

  return (
    <>
      {/* Horizontal guidelines */}
      {/* top guide */}
      <div
        ref={(el) => {
          if (!guideRefs.current[pageNumber])
            guideRefs.current[pageNumber] = {};
          guideRefs.current[pageNumber].top = el;
        }}
        className="absolute pointer-events-none z-[1000] left-0 w-full border-t-[1px] border-dashed border-[#3b82f6]"
        style={{ top: 0, display: "none" }}
      />
      {/* bottom guide */}
      <div
        ref={(el) => {
          if (!guideRefs.current[pageNumber])
            guideRefs.current[pageNumber] = {};
          guideRefs.current[pageNumber].bottom = el;
        }}
        className="absolute pointer-events-none z-[1000] left-0 w-full border-t-[1px] border-dashed border-[#3b82f6]"
        style={{ top: 0, display: "none" }}
      />
      {/* Vertical guidelines */}
      {/* left guide */}
      <div
        ref={(el) => {
          if (!guideRefs.current[pageNumber])
            guideRefs.current[pageNumber] = {};
          guideRefs.current[pageNumber].left = el;
        }}
        className="absolute pointer-events-none z-[1000] top-0 h-full border-l-[1px] border-dashed border-[#3b82f6]"
        style={{ left: 0, display: "none" }}
      />
      {/* right guide */}
      <div
        ref={(el) => {
          if (!guideRefs.current[pageNumber])
            guideRefs.current[pageNumber] = {};
          guideRefs.current[pageNumber].right = el;
        }}
        className="absolute pointer-events-none z-[1000] top-0 h-full border-l-[1px] border-dashed border-[#3b82f6]"
        style={{ left: 0, display: "none" }}
      />
    </>
  );
};

export default Guidelines;
