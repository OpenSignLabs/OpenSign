import React from "react";
import Loader from "./Loader";

function LoaderWithMsg({ isLoading }) {
  return (
    <div className="flex flex-col justify-center items-center h-[100vh]">
      {/* <img alt="loader" src={loader} className="w-[80px] h-[80px]" /> */}
      <Loader />
      <span className="text-[13px] text-base-cotent">{isLoading.message}</span>
    </div>
  );
}

export default LoaderWithMsg;
