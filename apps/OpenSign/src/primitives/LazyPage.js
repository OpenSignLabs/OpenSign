import React, { Suspense } from "react";

const LazyPage = ({ Page }) => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              fontSize: "45px",
              color: "#3dd3e0"
            }}
            className="loader-37"
          ></div>
        </div>
      }
    >
      <Page />
    </Suspense>
  );
};

export default LazyPage;
