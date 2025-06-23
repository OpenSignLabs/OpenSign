import React from "react";
import "../../styles/signature.css";
import { useTranslation } from "react-i18next";
function Signedby({ pdfDetails }) {
  const { t } = useTranslation();
  const getFirstLetter = (name) => {
    const firstLetter = name.charAt(0);
    return firstLetter;
  };

  return (
    <div className="hidden md:block w-full h-full bg-base-100">
      <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
        {t("signed-by")}
      </div>
      <div className="mt-[2px] bg-base-100">
        <div className="bg-[#93a3db] rounded-xl mx-1 flex flex-row items-center py-[10px]">
          <div className="bg-[#576081] flex w-[30px] h-[30px] rounded-full justify-center items-center mx-1">
            <span className="text-[12px] text-center font-bold text-white uppercase">
              {getFirstLetter(pdfDetails.ExtUserPtr.Name)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#424242] w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
              {pdfDetails.ExtUserPtr.Name}
            </span>
            <span className="text-[10px] font-medium text-[#424242] w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
              {pdfDetails.ExtUserPtr.Email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signedby;
