import React, { useEffect, useState } from "react";
import Package from "../../package.json";
import axios from "axios";
const Footer = () => {
  const [showButton, setShowButton] = useState(false);
  const [version, setVersion] = useState("");
  useEffect(() => {
    axios
      .get("/version.txt")
      .then((response) => {
        setVersion(response.data); // Set the retrieved data to the state variable
      })
      .catch((error) => {
        console.error("Error reading the file:", error);
      });
  }, []);

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

  const appName = "OpenSign™";

  return (
    <>
      <div className="bg-[#222c3c] text-[#98a6ba] text-center text-[13px] py-3">
        All Rights Reserved &copy; {new Date().getFullYear()} &nbsp;
        {appName} ( version: {version ? version : `${Package.version} `})
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
