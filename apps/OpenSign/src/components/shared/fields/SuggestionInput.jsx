import React, { useState, useEffect, useRef } from "react";
import { findContact } from "../../../constant/Utils";
const SuggestionInput = (props) => {
  const [inputValue, setInputValue] = useState(props?.value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", Clickout);
    return () => {
      document.removeEventListener("mousedown", Clickout);
    };
  }, []);

  const Clickout = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  };
  // create debounce to avoid unnecessay api calls
  useEffect(() => {
    let timer;
    if (inputValue) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        (async () => {
          const res = await findContact(
            inputValue,
          );
          if (res?.length > 0) {
            setSuggestions(res);
            setShowSuggestions(true);
          } else {
            setSuggestions(res);
            setShowSuggestions(false);
          }
        })();
      }, 1000);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value?.toLowerCase()?.replace(/\s/g, ""));
    if (props.onChange) {
      props.onChange(value?.toLowerCase()?.replace(/\s/g, ""));
    }

    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
  };
  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.Email);
    setSuggestions([]);
    setShowSuggestions(false);
    if (props.onChange) {
      props.onChange(suggestion);
    }
  };
  return (
    <div className="flex flex-col items-center relative text-base-content">
      <input
        type={props?.type || "text"}
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter Email..."
        className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs lowercase"
        required={props.required}
      />
      {showSuggestions && (
        <ul
          ref={ref}
          className="absolute z-50 left-0 top-[2.55rem] w-full max-h-[100px] overflow-y-auto bg-base-200 border border-gray-300 rounded shadow-md"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="py-2 px-2 w-full text-sm cursor-pointer hover:bg-base-300"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.Name} {"<" + suggestion.Email + ">"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default SuggestionInput;
