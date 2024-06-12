import React, { Suspense } from "react";

const LazyPage = ({ Page }) => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[100vh] text-[45px] text-[#3dd3e0]">
          <div className="loader-37"></div>
        </div>
      }
    >
      <Page />
    </Suspense>
  );
};

export default LazyPage;
