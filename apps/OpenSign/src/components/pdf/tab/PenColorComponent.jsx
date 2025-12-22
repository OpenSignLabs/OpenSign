import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const ALLOWED_COLORS = ["blue", "red", "black"];

const COLOR_CLASS = {
  blue: "text-blue-600",
  red: "text-red-600",
  black: "text-black",
  white: "text-white"
};

function PenColorComponent({
  providedColors,
  penColor,
  convertToImg,
  fontSelect,
  typedSignature,
  setPenColor
}) {
  const { t } = useTranslation();

  const pensList = useMemo(() => {
    const allowed = new Set(ALLOWED_COLORS);
    const filtered = Array.isArray(providedColors)
      ? providedColors
          .map((c) => String(c).toLowerCase())
          .filter((c) => allowed.has(c))
      : [];

    // remove duplicates while preserving order
    return filtered.length ? [...new Set(filtered)] : ALLOWED_COLORS;
  }, [providedColors]);

  return (
    <div className="flex flex-row items-center m-[5px] gap-3">
      <span className="text-base-content">{t("options")}</span>
      {pensList.map((color) => {
        const selected = penColor === color;
        return (
          <i
            key={color}
            role="button"
            tabIndex={0}
            aria-label={`Select ${color} pen`}
            onClick={() => {
              setPenColor?.(color);
              convertToImg?.(fontSelect, typedSignature, color);
            }}
            className={`${COLOR_CLASS[color] || "text-base-content"} ${selected ? "border-current" : "border-white"} border-b-[2px] pb-0.5 cursor-pointer text-[16px] fa-light fa-pen-nib`}
          ></i>
        );
      })}
    </div>
  );
}
export default PenColorComponent;
