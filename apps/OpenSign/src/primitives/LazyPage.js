import React, { Suspense } from "react";
import Loader from "./Loader";

const LazyPage = ({ Page }) => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[100vh]">
          <Loader />
        </div>
      }
    >
      <Page />
    </Suspense>
  );
};

export default LazyPage;
