import React from "react";

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
          style={{
            padding: "3px 20px ",
            fontSize: "10px",
            background: "#d3edeb",
            fontWeight: "600",

            border: "0px",
            marginRight: "5px",
          }}
          disabled={pageNumber <= 1}
          onClick={previousPage}
        >
          Prev
        </button>
        <span
          style={{
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          {pageNumber || (allPages ? 1 : "--")} of {allPages || "--"}
        </span>
        <button
          style={{
            padding: "3px 20px ",
            fontSize: "10px",
            background: "#d3edeb",
            fontWeight: "600",
            marginLeft: "5px",
            border: "0px",
          }}
          disabled={pageNumber >= allPages}
          onClick={nextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PrevNext;
