import React from "react";
import { themeColor } from "../../constant/const";
function DefaultSignature({ defaultSignImg, xyPostion, setDefaultSignAlert }) {
  const confirmToaddDefaultSign = () => {
    if (xyPostion.length > 0) {
      setDefaultSignAlert({
        isShow: true,
        alertMessage:
          "Are you sure you want to auto sign at requested all locations?"
      });
    } else {
      setDefaultSignAlert({
        isShow: true,
        alertMessage: "please select position!"
      });
    }
  };

  return (
    <div data-tut="reactourThird">
      <div
        className="text-white p-[5px] mt-[5px]"
        style={{
          background: themeColor
        }}
      >
        Signature
      </div>
      <div className="flex flex-col items-center mt-[10px] font-semibold">
        <p className="text-base-content">Your Signature</p>
        <div className="op-card shadow-md h-[111px] w-[90%] p-2">
          <img
            alt="signature"
            className="w-full h-full object-contain"
            src={defaultSignImg}
          />
        </div>
        <button
          type="button"
          className="op-btn op-btn-primary op-btn-sm mt-[10px]"
          onClick={() => confirmToaddDefaultSign()}
        >
          Auto Sign All
        </button>
      </div>
    </div>
  );
}

export default DefaultSignature;
