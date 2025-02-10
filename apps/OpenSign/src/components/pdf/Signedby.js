import React from "react";
import "../../styles/signature.css";
import { useTranslation } from "react-i18next";
function Signedby(props) {
  const { t } = useTranslation();
  const getFirstLetter = (pdfData) => {
    const name = props.isSelfSign
      ? (pdfData?.Signers && pdfData?.Signers[0]?.Name) || "User"
      : pdfData.ExtUserPtr?.Name;
    const firstLetter = name.charAt(0);
    return firstLetter;
  };
  return (
    <div className="hidden md:block w-full h-full bg-base-100">
      <div className="mx-2 pr-2 pt-2 pb-1 text-[15px] text-base-content font-semibold border-b-[1px] border-base-300">
        {props.isSelfSign ? t("user") : t("signed-by")}
      </div>
      <div className="mt-[2px] bg-base-100">
        <div className="bg-[#93a3db] rounded-xl mx-1 flex flex-row items-center py-[10px]">
          <div className="bg-[#576081] flex w-[30px] h-[30px] rounded-full justify-center items-center mx-1">
            <span className="text-[12px] text-center font-bold text-white uppercase">
              {getFirstLetter(props.pdfDetails)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#424242] w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
              {props.isSelfSign
                ? (props.pdfDetails?.Signers &&
                    props.pdfDetails?.Signers[0]?.Name) ||
                  "User"
                : props.pdfDetails.ExtUserPtr.Name || "User"}
            </span>
            <span className="text-[10px] font-medium text-[#424242] w-[100px] whitespace-nowrap overflow-hidden text-ellipsis">
              {props.isSelfSign
                ? (props.pdfDetails?.Signers &&
                    props.pdfDetails?.Signers[0]?.Email) ||
                  ""
                : props.pdfDetails.ExtUserPtr.Email || ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signedby;
