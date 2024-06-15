import React from "react";
import { themeColor } from "../../constant/const";

function PrevNext({ pageNumber, allPages, changePage }) {
  //for go to previous page
  function previousPage() {
    changePage(-1);
  }
  //for go to next page
  function nextPage() {
    changePage(1);
  }

  return (
    <div>
      <div className="preBtn1">
        <button
          className="py-[3px] px-[10px] text-xs bg-[#d3edeb] font-[600] mr-[5px]"
          disabled={pageNumber <= 1}
          onClick={previousPage}
        >
          <span className="block lg:hidden">
            <i
              className="fa fa-backward"
              aria-hidden="true"
              style={{ color: themeColor, cursor: "pointer" }}
            ></i>
          </span>
          <span className="lg:block hidden">Prev</span>
        </button>
        <span className="text-xs font-[500]">
          {pageNumber || (allPages ? 1 : "--")} of {allPages || "--"}
        </span>
        <button
          className="py-[3px] px-[10px] text-xs bg-[#d3edeb] font-[600] ml-[5px]"
          disabled={pageNumber >= allPages}
          onClick={nextPage}
        >
          <span className="block lg:hidden">
            <i
              className="fa fa-forward"
              aria-hidden="true"
              style={{ color: themeColor, cursor: "pointer" }}
            ></i>
          </span>
          <span className="lg:block hidden">Next</span>
        </button>
      </div>
    </div>
  );
}

export default PrevNext;
