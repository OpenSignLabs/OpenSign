import React from "react";
import Loader from "./Loader";

function LoaderWithMsg({ isLoading }) {
  return (
    <div className="flex flex-col justify-center items-center h-[100vh]">
      <Loader />
      <span className="text-[13px] text-base-content">{isLoading.message}</span>
    </div>
  );
}

export default LoaderWithMsg;
