import React, { useEffect, useState } from "react";
import Package from "../../package.json";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { getRuntimeConfig } from "../constant/runtimeConfig";
const Footer = () => {
  const { brandKey, productName: appName } = getRuntimeConfig();
  const isOpenSign = brandKey === "opensign";
  const { t } = useTranslation();
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
    const scrollContainer = document.getElementById("renderList");
    const scrollTop = scrollContainer
      ? scrollContainer.scrollTop
      : window.scrollY;
    if (scrollTop >= 50) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  const scrollToTop = () => {
    const scrollContainer = document.getElementById("renderList");
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
    setShowButton(false);
  };

  useEffect(() => {
    const scrollContainer = document.getElementById("renderList");
    const scrollTarget = scrollContainer || window;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const normalizedVersion = typeof version === "string" ? version.trim() : "";
  const displayVersion = normalizedVersion || Package.version;
  const releaseTag = displayVersion.startsWith("v")
    ? displayVersion
    : `v${displayVersion}`;
  const releaseUrl = `https://github.com/OpenSignLabs/OpenSign/releases/tag/${releaseTag}`;
  const versionLabel = (
    <>
      {appName} ( {t("version")}: {displayVersion})
    </>
  );
  return (
    <>
      <footer className="op-footer op-footer-center py-3 bg-base-300 text-base-content text-center text-[13px]">
        <aside>
          <p>
            {t("all-right")} &copy; {new Date().getFullYear()} &nbsp;
            {isOpenSign ? (
              <a
                href={releaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline cursor-pointer"
              >
                {versionLabel}
              </a>
            ) : (
              <span>{versionLabel}</span>
            )}
          </p>
        </aside>
      </footer>
      <button
        type="button"
        aria-label={t("scroll-to-top")}
        className={`${
          showButton ? "block" : "hidden"
        } fixed bottom-4 right-4 min-h-[44px] min-w-[44px] px-3 p-2 text-xl op-bg-secondary text-white rounded`}
        onClick={scrollToTop}
      >
        <i className="fa-light fa-angle-up"></i>
      </button>
    </>
  );
};

export default Footer;
