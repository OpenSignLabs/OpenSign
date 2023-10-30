import React, { useEffect, useState } from "react";
import Package from "../../package.json";

const Footer = () => {
  const [showButton, setShowButton] = useState(false);
  const handleScroll = () => {
    if (window.pageYOffset >= 50) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
    setShowButton(false);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const appName = "OpenSign";
  
  return (
    <>
      <div className="bg-[#222c3c] text-[#98a6ba] text-center text-[13px] py-3">
        All Rights Reserved &copy; {new Date().getFullYear()} &nbsp;
        {appName}{" "}
        (version:{" "}
        {localStorage.getItem("appVersion") &&
          `${Package.version}.${localStorage.getItem("appVersion")}`}
        )
      </div>
      <button
        className={`${
          showButton ? "block" : "hidden"
        } fixed bottom-4 right-4 px-3 p-2 text-xl bg-blue-500 text-white rounded focus:outline-none`}
        onClick={scrollToTop}
      >
        <i className="fa-solid fa-angle-up"></i>
      </button>
    </>
  );
};

export default Footer;
