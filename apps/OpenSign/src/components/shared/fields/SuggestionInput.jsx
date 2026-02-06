import { useState, useLayoutEffect, useEffect, useRef } from "react";
import { findContact } from "../../../constant/Utils";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

function findScrollParent(el) {
  let parent = el?.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return parent;
    parent = parent.parentElement;
  }
  return window; // fallback
}

const SuggestionInput = (props) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(props?.value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    placement: "bottom" // bottom | top
  });

  const updateDropdownPosition = () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    const rect = inputEl.getBoundingClientRect();
    const desiredHeight = 120; // roughly max-h (adjust if you want)
    const gap = 6;

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < desiredHeight + gap;

    const top = openUpwards
      ? Math.max(gap, rect.top - desiredHeight - gap)
      : rect.bottom + gap;

    setDropdownPos({
      top,
      left: rect.left,
      width: rect.width,
      placement: openUpwards ? "top" : "bottom"
    });
  };

  useLayoutEffect(() => {
    if (!showSuggestions) return;
    updateDropdownPosition();
  }, [showSuggestions, inputValue, suggestions.length]);

  useEffect(() => {
    const Clickout = (e) => {
      if (
        inputRef.current?.contains(e.target) ||
        dropdownRef.current?.contains(e.target)
      )
        return;
      setShowSuggestions(false);
    };
    document.addEventListener("mousedown", Clickout);
    return () => document.removeEventListener("mousedown", Clickout);
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;

    const inputEl = inputRef.current;
    if (!inputEl) return;

    const scrollParent = findScrollParent(inputEl);

    const onScroll = () => updateDropdownPosition();
    const onResize = () => updateDropdownPosition();

    // capture scroll on window + scroll parent
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    if (scrollParent !== window)
      scrollParent.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      if (scrollParent !== window)
        scrollParent.removeEventListener("scroll", onScroll);
    };
  }, [showSuggestions]);
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

  const dropdown =
    showSuggestions && suggestions.length > 0
      ? createPortal(
          <ul
            ref={dropdownRef}
            className="fixed z-[1002] max-h-[250px] overflow-y-auto bg-base-200 border border-gray-300 rounded shadow-md text-base-content"
            style={{
              top: dropdownPos?.top,
              left: dropdownPos?.left,
              maxWidth: dropdownPos?.width > 200 ? dropdownPos?.width : 200
            }}
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="block py-2 px-2 w-full text-sm cursor-pointer hover:bg-base-300"
                // use onMouseDown so click registers BEFORE input blur
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(suggestion);
                }}
              >
                {suggestion.Name} {"<" + suggestion.Email + ">"}
              </li>
            ))}
          </ul>,
          document.body
        )
      : null;

  return (
    <div className="flex flex-col items-center relative text-base-content">
      <input
        ref={inputRef}
        type={props?.type || "text"}
        value={inputValue}
        onChange={handleInputChange}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        placeholder={`${t("enter-value", { value: t("Email") })}...`}
        className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs lowercase placeholder:capitalize"
        required={props.required}
        onFocus={() => {
          if (suggestions.length) setShowSuggestions(true);
        }}
      />
      {dropdown}
    </div>
  );
};
export default SuggestionInput;
