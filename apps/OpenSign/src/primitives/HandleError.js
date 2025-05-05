import React from "react";

function HandleError({ handleError }) {
  return (
    <div className="flex justify-center items-center h-[100vh]">
      <span className="p-[15px] md:p-0 text-[20px] text-[gray]">
        {handleError}
      </span>
    </div>
  );
}

export default HandleError;
