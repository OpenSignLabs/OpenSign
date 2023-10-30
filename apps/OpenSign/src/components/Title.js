import React from "react";
import { Helmet } from "react-helmet";

function Title(props) {
  return (
    <Helmet>
      <title>{`${props.title} - OpenSign™`}</title>
      {/* <title>
        {`${localStorage.getItem("appTitle") ? localStorage.getItem("appTitle") : ""} - ${props.title}`}
      </title> */}
      <meta
        name="description"
        content={`${props.title} - OpenSign™`}
      />
      {/* <meta
        name="description"
        content={`${localStorage.getItem("appTitle")} - ${props.title}`}
      /> */}
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
