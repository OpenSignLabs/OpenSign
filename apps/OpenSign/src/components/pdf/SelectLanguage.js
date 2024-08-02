import i18next from "i18next";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function SelectLanguage() {
  const { i18n } = useTranslation();
  const languages = [
    { value: "en", text: "English" },
    { value: "fr", text: "Français" }
  ];
  const [lang, setLang] = useState(i18next.language || "en");
  // This function put query that helps to
  // change the language
  const handleChangeLang = (e) => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };
  return (
    <div className={`flex justify-center items-center mt-3 pb-2 md:pb-0 `}>
      <select
        value={lang}
        onChange={handleChangeLang}
        className="op-select op-select-bordered md:w-[15%] w-[50%] bg-white op-select-sm "
      >
        <option disabled selected>
          select
        </option>
        {languages.map((item) => {
          return (
            <option key={item.value} value={item.value}>
              {item.text}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default SelectLanguage;
