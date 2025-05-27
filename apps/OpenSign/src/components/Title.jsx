import { Helmet } from "react-helmet";

function Title({ title, drive }) {
  const appName =
    "OpenSign™";
  return (
    <Helmet>
      <title>{drive ? title : `${title} - ${appName}`}</title>
      <meta name="description" content={`${title} - ${appName}`} />
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
