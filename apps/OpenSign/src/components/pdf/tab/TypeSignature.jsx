import { useTranslation } from "react-i18next";

function TypeSignature(props) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex justify-between items-center tabWidth rounded-[4px]">
        <span className="ml-[5px] text-[12px] text-base-content">
          {props?.currWidgetsDetails?.type === "initials"
            ? t("initial-teb")
            : t("signature-tab")}
          :
        </span>
        <input
          maxLength={props?.currWidgetsDetails?.type === "initials" ? 3 : 30}
          style={{ fontFamily: props?.fontSelect, color: props?.penColor }}
          type="text"
          className="bg-transparent ml-1 op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-[20px]"
          placeholder={
            props?.currWidgetsDetails?.type === "initials"
              ? t("initial-type")
              : t("signature-type")
          }
          value={props?.typedSignature}
          onChange={(e) => {
            props?.setTypedSignature(e.target.value);
            if (e.target.value?.trim()?.length > 0) {
              props?.convertToImg(props?.fontSelect, e.target.value);
            }
          }}
        />
      </div>
      <div className="border-[1px] border-[#d6d3d3] mt-[10px] rounded-[4px] tabWidth">
        {props?.fontOptions.map((font, ind) => {
          return (
            <div
              key={ind}
              style={{
                cursor: "pointer",
                fontFamily: font.value,
                backgroundColor:
                  props?.fontSelect === font.value && "rgb(206 225 247)"
              }}
              onClick={() => {
                props?.setFontSelect(font.value);
                props?.convertToImg(font.value, props?.typedSignature);
              }}
            >
              <div
                className="py-[5px] px-[10px] text-[20px]"
                style={{ color: props?.penColor }}
              >
                {props?.typedSignature
                  ? props?.typedSignature
                  : t("Your-Signature")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TypeSignature;
