import { useState, useEffect } from "react";
import { runtimeUrls } from "../constant/const";
import {
  nonPresentMaskCss
} from "../constant/Utils";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/sidebar/Sidebar";
import PageScrollContainer from "../components/PageScrollContainer";
import Tour from "../primitives/Tour";
import { saveTourStatus } from "../utils/tourStatus";
import { useDispatch, useSelector } from "react-redux";
import Parse from "parse";
import {
  useLocation,
  Link,
  Outlet
} from "react-router";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";
import { sessionStatus } from "../redux/reducers/userReducer";
import SessionExpiredModal from "../primitives/SessionExpiredModal";
import {
  exitLocalQaIdentity,
  isLocalQaIdentityEnabled
} from "../qa/localQaIdentity";

const HomeLayout = () => {
  const appName =
    "OpenSign™";
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isEditorRoute = [
    "/draftDocument",
    "/kiosk",
    "/load/recipientSignPdf/",
    "/placeHolderSign/",
    "/recipientSignPdf/",
    "/signaturePdf/",
    "/template/"
  ].some((route) => location.pathname.startsWith(route));
  const dispatch = useDispatch();
  const tourArr = useSelector((state) => state.TourSteps);
  const isValidSession = useSelector((state) => state.user.isValidSession);
  const [isLoader, setIsLoader] = useState(true);
  const [isCloseBtn, setIsCloseBtn] = useState(true);
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [tourConfigs, setTourConfigs] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const tenantId = localStorage.getItem("TenantId");
  const localQaIdentity = isLocalQaIdentityEnabled();

  useEffect(() => {
    const language = localStorage.getItem("i18nextLng");
    i18n.changeLanguage(language);
    localStorage.setItem("isGuestSigner", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (localQaIdentity) {
      dispatch(sessionStatus(true));
      setIsLoader(false);
      return;
    }
    if (localStorage.getItem("accesstoken")) {
      if (!tenantId) {
        dispatch(sessionStatus(false));
      } else {
        (async () => {
          try {
            // Use the session token to validate the user
            const userQuery = new Parse.Query(Parse.User);
            const user = await userQuery.get(Parse?.User?.current()?.id, {
              sessionToken: localStorage.getItem("accesstoken")
            });
            if (user) {
              localStorage.setItem("profileImg", user.get("ProfilePic") || "");
                dispatch(sessionStatus(true));
                setIsLoader(false);
            } else {
              dispatch(sessionStatus(true));
            }
          } catch (error) {
            console.error("error in authentication:", error?.message);
            // Session token is invalid or there was an error
            dispatch(sessionStatus(false));
          }
        })();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);


  useEffect(() => {
    if (tourArr && tourArr.length > 0) {
      handleDynamicSteps();
    } else {
      setIsTour(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourArr]);

  const handleDynamicSteps = () => {
    if (localQaIdentity) {
      setIsTour(false);
      return;
    }
    const github = runtimeUrls.github;
    if (tourArr && tourArr.length > 0) {
      const resArr = tourArr.map((obj, index) => {
        if (tourArr.length - 1 === index) {
          return obj;
        } else {
          return { ...obj, actions: () => setIsCloseBtn(false) };
        }
      });
      setTourConfigs([
        {
          selector: '[data-tut="nonpresentmask"]',
          content: t("tour-mssg.home-layout-1"),
          position: "center",
          styles: { fontSize: "13px", maskArea: nonPresentMaskCss }
        },
        {
          selector: '[data-tut="tourbutton"]',
          content: t("tour-mssg.home-layout-2"),
          position: "top",
          styles: { fontSize: "13px" }
        },
        ...resArr,
        {
          selector: '[data-tut="nonpresentmask"]',
          content: () => (
            <div>
              {t("tour-mssg.home-layout-3", { appName })}
              {github && (
                <p className="mt-[3px]">
                  ⭐ Star us on
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium pl-1 cursor-pointer"
                  >
                    GitHub
                  </a>
                </p>
              )}
            </div>
          ),
          position: "center",
          styles: { fontSize: "13px", maskArea: nonPresentMaskCss }
        }
      ]);
      checkTourStatus();
    }
  };
  const closeTour = async () => {
    setIsTour(false);
    const serverUrl = localStorage.getItem("baseUrl");
    const appId = localStorage.getItem("parseAppId");
    const json = JSON.parse(localStorage.getItem("Extand_Class"));
    const extUserId = json && json.length > 0 && json[0].objectId;

    try {
      await saveTourStatus({
        tourStatus: tourStatusArr,
        key: "loginTour",
        serverUrl,
        appId,
        sessionToken: localStorage.getItem("accesstoken"),
        userId: extUserId
      });
    } catch (err) {
      console.error("update login tour status error", err);
    }
  };

  async function checkTourStatus() {
    const cloudRes = await Parse.Cloud.run("getUserDetails");
    if (cloudRes) {
      const extUser = JSON.parse(JSON.stringify(cloudRes));
      localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
      const tourStatus = extUser?.TourStatus || [];
      setTourStatusArr(tourStatus);
      const loginTour = tourStatus.find((obj) => obj.loginTour)?.loginTour;
      setIsTour(!loginTour);
    } else {
      setIsTour(true);
    }
  }

  const leaveLocalQaIdentity = () => {
    exitLocalQaIdentity();
    window.location.replace("/");
  };

  return localQaIdentity ||
    (isValidSession && localStorage.getItem("accesstoken")) ? (
    <div
      className={`os-app-shell os-scroll-shell${isEditorRoute ? " os-has-editor" : ""} flex flex-col h-screen overflow-hidden`}
    >
      {localQaIdentity && (
        <div
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 bg-amber-100 px-3 py-2 text-xs font-medium text-amber-950"
          role="status"
        >
          <span>
            Local QA visual identity is active. Backend writes and hosted
            sign-in are disabled.
          </span>
          <div className="flex items-center gap-3">
            <Link to="/local-qa/translations" className="underline">
              Translation preview
            </Link>
            <button
              type="button"
              className="underline"
              onClick={leaveLocalQaIdentity}
            >
              Exit local QA
            </button>
          </div>
        </div>
      )}
      {/* HEADER */}
      <header className="os-shell-header">
        {!isLoader && <Header setIsLoggingOut={setIsLoggingOut} />}
      </header>
      {isLoader ? (
        <div className="flex h-[100vh] justify-center items-center">
          <Loader />
        </div>
      ) : (
        <>
          {isLoggingOut && (
            <div
              role="status"
              aria-live="polite"
              aria-label={t("logging-out-to-apply-settings")}
              className="inset-0 bg-black/30 z-[1000] fixed flex justify-center items-center"
            >
              <Loader />
            </div>
          )}
          {/* BODY */}
          <div className="os-shell-body relative flex flex-1 min-h-0 overflow-hidden">
            {/* SIDEBAR with width animation */}
            <Sidebar />
            {/* MAIN (includes both content + footer in one scrollable column) */}
            <PageScrollContainer>
              <div className="flex flex-col min-h-full">
                {/* your page content */}
                <div className="p-3">{<Outlet />}</div>
                {/* sticky-but-scrollable footer */}
                <div className="os-app-footer mt-auto z-30">
                  <Footer />
                </div>
              </div>
            </PageScrollContainer>
          </div>
          {isTour && (
            <Tour
              onRequestClose={closeTour}
              steps={tourConfigs}
              isOpen={isTour}
              // scrollOffset={-100}
              showCloseButton={isCloseBtn}
            />
          )}
        </>
      )}
    </div>
  ) : (
    <SessionExpiredModal />
  );
};

export default HomeLayout;
