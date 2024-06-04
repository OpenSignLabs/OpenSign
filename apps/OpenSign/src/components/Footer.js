import React, { useEffect, useState } from "react";
import Package from "../../package.json";
import axios from "axios";
import { openInNewTab } from "../constant/Utils";
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
  const openUrl = () => {
    openInNewTab(
      "https://github.com/OpenSignLabs/OpenSign/releases/tag/" + version
    );
  };
  return (
    <>
      <footer className="opfooter opfooter-center py-3 bg-base-300 text-base-content text-center text-[13px]">
        <aside>
          <p>
            All Rights Reserved &copy; {new Date().getFullYear()} &nbsp;
            <span onClick={openUrl} className="hover:underline cursor-pointer">
              {appName} ( version: {version ? version : `${Package.version} `})
            </span>
          </p>
        </aside>
      </footer>
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
