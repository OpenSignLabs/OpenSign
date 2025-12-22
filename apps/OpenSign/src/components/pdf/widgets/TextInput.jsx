import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "react-tooltip";

//This file is for both Text and textInput widgets
export default function TextInput(props) {
  const [isMultiline, setIsMultiline] = useState();
  const { t } = useTranslation();

  const handleKeyDown = (e) => {
    if (!isMultiline && e.key === "Enter") {
      e.preventDefault(); // disable new line in single-line mode
    }
  };
  useEffect(() => {
    if (props?.widgetValue) {
      const isNextLine = props?.widgetValue.includes("\n");
      if (isNextLine) {
        setIsMultiline(true);
      }
    }
  }, [props?.widgetValue]);
  return (
    <div style={{ position: "relative", width: "100%" }}>
      {isMultiline ? (
        <textarea
          onBlur={props?.handleInputBlur}
          ref={props?.widgetRef}
          value={props?.widgetValue ?? ""} //use an empty string "" as a default
          onChange={(e) => props?.handleOnchangeTextBox(e)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder={t("widgets-name.text")}
          // className={`${textInputcls} resize-none outline-none max-h-[100px] `}
          style={{
            width: "100%",
            padding: "12px 40px 12px 12px",
            borderRadius: "20px",
            border: "1px solid #dcdcdc",
            fontSize: "16px",
            resize: "none",
            outline: "none"
          }}
        />
      ) : (
        <input
          name="text"
          ref={props?.widgetRef}
          type="text"
          placeholder={t("widgets-name.text")}
          value={props?.widgetValue ?? ""} //use an empty string "" as a default
          onChange={(e) => props?.handleOnchangeTextBox(e)}
          className={`${props?.textInputcls} pr-4`}
          onBlur={props?.handleInputBlur}
        />
      )}

      {!isMultiline && (
        <>
          <i
            data-tooltip-id="toggle-multiline"
            className="fa-light fa-file-lines"
            size={20}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#444",
              cursor: "pointer"
            }}
            onClick={() => setIsMultiline((prev) => !prev)}
          ></i>

          <Tooltip id={"toggle-multiline"}>
            <span>Toggle Multiline Text</span>
          </Tooltip>
        </>
      )}
    </div>
  );
}
