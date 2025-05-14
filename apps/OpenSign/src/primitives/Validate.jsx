import React, { useState, useEffect } from "react";
import Parse from "parse";
import { Outlet, useNavigate, useLocation } from "react-router";
import ModalUi from "./ModalUi";
import { useTranslation } from "react-i18next";
const Validate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const [isUserValid, setIsUserValid] = useState(true);
  useEffect(() => {
    (async () => {
      if (localStorage.getItem("accesstoken")) {
        try {
          const userDetails = JSON.parse(
            localStorage.getItem(
              `Parse/${localStorage.getItem("parseAppId")}/currentUser`
            )
          );
          // Use the session token to validate the user
          const userQuery = new Parse.Query(Parse.User);
          const user = await userQuery.get(userDetails?.objectId, {
            sessionToken: localStorage.getItem("accesstoken")
          });
          if (user) {
            setIsUserValid(true);
          } else {
            setIsUserValid(false);
          }
        } catch (error) {
          // Session token is invalid or there was an error
          setIsUserValid(false);
        }
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginBtn = async () => {
    try {
      await Parse.User.logOut();
    } catch (err) {
      console.log("err ", err);
    } finally {
      localStorage.removeItem("accesstoken");
      navigate("/", { replace: true, state: { from: location } });
    }
  };
  return isUserValid ? (
    <div>
      <Outlet />
    </div>
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

export default Validate;
