// NotFound.js
import React from "react";
import Title from "../components/Title";

const PageNotFound = ({ prefix }) => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-base-100 text-base-content rounded-box">
      <Title title={"Page Not Found"} />
      <div className="text-center">
        <h1 className="text-[60px] lg:text-[120px] font-semibold">404</h1>
        <p className="text-[30px] lg:text-[50px]">
          {prefix ? prefix : "Page"} Not Found
        </p>
      </div>
    </div>
  );
};

export default PageNotFound;
