import React from "react";
import { Helmet } from "react-helmet";

function Title({ title }) {
  return (
    <Helmet>
      <title>{`${title} - OpenSign™`}</title>
      <meta name="description" content={`${title} - OpenSign™`} />
      <link
        rel="icon"
        type="image/png"
        href={localStorage.getItem("fev_Icon")}
        sizes="40x40"
      />
    </Helmet>
  );
}

export default Title;
