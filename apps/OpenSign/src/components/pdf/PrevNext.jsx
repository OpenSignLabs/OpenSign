import React from "react";
import { useTranslation } from "react-i18next";

function PrevNext({ pageNumber, allPages, changePage }) {
  const { t } = useTranslation();
  //for go to previous page
  function previousPage() {
    changePage(-1);
  }
  //for go to next page
  function nextPage() {
    changePage(1);
  }

  return (
    <div className="flex items-center">
      <button
        className="op-btn op-btn-neutral op-btn-xs md:op-btn-sm font-semibold text-xs"
        disabled={pageNumber <= 1}
        onClick={previousPage}
      >
        <span className="block">
          <i className="fa-light fa-chevron-up" aria-hidden="true"></i>
        </span>
      </button>
      <span className="text-xs text-base-content font-medium mx-2 2xl:text-[20px]">
        {pageNumber || (allPages ? 1 : "--")} {t("of")} {allPages || "--"}
      </span>
      <button
        className="op-btn op-btn-neutral op-btn-xs md:op-btn-sm font-semibold text-xs"
        disabled={pageNumber >= allPages}
        onClick={nextPage}
      >
        <span className="block">
          <i className="fa-light fa-chevron-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
  );
}

export default PrevNext;
