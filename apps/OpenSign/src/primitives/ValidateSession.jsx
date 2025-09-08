import React from "react";
import { useTranslation } from "react-i18next";
import ModalUi from "./ModalUi";
import { useNavigate } from "react-router";
import Parse from "parse";

const ValidateSession = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLoginBtn = async () => {
    try {
      await Parse?.User?.logOut();
    } catch (err) {
      console.log("err ", err);
    } finally {
      localStorage.removeItem("accesstoken");
      navigate("/", { replace: true });
    }
  };
  return localStorage.getItem("accesstoken") ? (
    children
  ) : (
    <ModalUi showHeader={false} isOpen={true} showClose={false}>
      <div className="flex flex-col justify-center items-center py-4 md:py-5 gap-5">
        <p className="text-xl font-medium">{t("session-expired")}</p>
        <button onClick={handleLoginBtn} className="op-btn op-btn-neutral">
          {t("login")}
        </button>
      </div>
    </ModalUi>
  );
};

export default ValidateSession;
