import React from "react";
import "../../styles/signature.css";
function Signedby({ pdfDetails }) {
  const getFirstLetter = (name) => {
    const firstLetter = name.charAt(0);
    return firstLetter;
  };

  return (
    <div className="hidden md:block w-[180px] h-full bg-base-100">
      <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
        Signed By
      </div>
      <div className="mt-[2px] bg-base-100">
        <div className="bg-[#93a3db] rounded-xl mx-1 flex flex-row items-center py-[10px]">
          <div
            className="  bg-[#abd1d0] w-[15px] h-[15px] 2xl:w-[30px] 2xl:h-[30px] flex rounded-full ring-[1px] ring-offset-1 justify-center items-center
            mr-[0px] mt-[7px] 2xl:mt-[12px]
            "
          >
            <span className="text-[12px] text-center font-bold text-white 2xl:text-[20px] uppercase">
              {getFirstLetter(pdfDetails.ExtUserPtr.Name)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="userName">{pdfDetails.ExtUserPtr.Name}</span>
            <span className="useEmail">{pdfDetails.ExtUserPtr.Email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signedby;
