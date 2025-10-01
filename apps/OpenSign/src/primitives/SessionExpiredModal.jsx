import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { sessionStatus } from "../redux/reducers/userReducer";
import Parse from "parse";
import ModalUi from "./ModalUi";

const SessionExpiredModal = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginBtn = async () => {
    try {
      await Parse?.User?.logOut();
    } catch (err) {
      console.log(`err: ${err}`);
    } finally {
      localStorage.removeItem("accesstoken");
      dispatch(sessionStatus(true));
      navigate("/", { replace: true, state: { from: location } });
    }
  };

  return (
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

export default SessionExpiredModal;
