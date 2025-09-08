import { useTranslation } from "react-i18next";

const PageNotFound = ({ prefix }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-screen w-full bg-base-100 text-base-content rounded-box">
      <div className="text-center">
        <h1 className="text-[60px] lg:text-[120px] font-semibold">404</h1>
        <p className="text-[30px] lg:text-[50px]">
          {prefix ? `${prefix} Not Found` : t("page-not-found")}
        </p>
      </div>
    </div>
  );
};

export default PageNotFound;
