import { useGuidelinesContext } from "../../context/GuidelinesContext";

/**
 * Canvas-level guidelines that live inside the main scroll container (not
 * inside any individual page div). This allows the guideline lines to span
 * across page boundaries seamlessly when dragging a widget from the side
 * panel onto the document.
 */
const CanvasGuidelines = () => {
  const { canvasGuideRefs } = useGuidelinesContext();

  return (
    <>
      {/* Horizontal guidelines */}
      {/* top guide */}
      <div
        ref={(el) => {
          canvasGuideRefs.current.top = el;
        }}
        className="absolute pointer-events-none z-[1000] left-0 w-full border-t-[1px] border-dashed border-[#3b82f6]"
        style={{ top: 0, display: "none" }}
      />
      {/* bottom guide */}
      <div
        ref={(el) => {
          canvasGuideRefs.current.bottom = el;
        }}
        className="absolute pointer-events-none z-[1000] left-0 w-full border-t-[1px] border-dashed border-[#3b82f6]"
        style={{ top: 0, display: "none" }}
      />
      {/* Vertical guidelines */}
      {/* left guide */}
      <div
        ref={(el) => {
          canvasGuideRefs.current.left = el;
        }}
        className="absolute pointer-events-none z-[1000] top-0 h-full border-l-[1px] border-dashed border-[#3b82f6]"
        style={{ left: 0, display: "none" }}
      />
      {/* right guide */}
      <div
        ref={(el) => {
          canvasGuideRefs.current.right = el;
        }}
        className="absolute pointer-events-none z-[1000] top-0 h-full border-l-[1px] border-dashed border-[#3b82f6]"
        style={{ left: 0, display: "none" }}
      />
    </>
  );
};

export default CanvasGuidelines;
