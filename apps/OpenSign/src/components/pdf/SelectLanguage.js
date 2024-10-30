import i18next from "i18next";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function SelectLanguage(props) {
  const { i18n } = useTranslation();
  const languages = [
    { value: "en", text: "English" },
    { value: "es", text: "Española" },
    { value: "fr", text: "Français" }
  ];
  const [lang, setLang] = useState(i18next?.language || "en");
  // This function put query that helps to change the language
  const handleChangeLang = (e) => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
    props?.updateExtUser &&
      props.updateExtUser({
        language: e.target.value
      });
  };
  return (
    <div
      className={`${
        !props.isProfile && " mt-[9px] pb-2 md:pb-0 "
      } flex justify-center items-center `}
    >
      <select
        value={lang}
        onChange={handleChangeLang}
        className={`${
          !props.isProfile ? " md:w-[15%] w-[50%]" : "w-[180px]"
        } op-select op-select-bordered  bg-white op-select-sm `}
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
