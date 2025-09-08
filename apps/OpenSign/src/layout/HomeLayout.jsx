import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/sidebar/Sidebar";
import Tour from "../primitives/Tour";
import axios from "axios";
import { useSelector } from "react-redux";
import Parse from "parse";
import ModalUi from "../primitives/ModalUi";
import { useNavigate, useLocation, Outlet } from "react-router";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";

const HomeLayout = () => {
  const appName =
    "OpenSign™";
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const arr = useSelector((state) => state.TourSteps);
  const [isUserValid, setIsUserValid] = useState(true);
  const [isLoader, setIsLoader] = useState(true);
  const [isCloseBtn, setIsCloseBtn] = useState(true);
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [tourConfigs, setTourConfigs] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const tenantId = localStorage.getItem("TenantId");

  useEffect(() => {
    const language = localStorage.getItem("i18nextLng");
    i18n.changeLanguage(language);
    localStorage.setItem("isGuestSigner", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tenantId) {
      setIsUserValid(false);
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
              setIsUserValid(true);
              setIsLoader(false);
          } else {
            setIsUserValid(false);
          }
        } catch (error) {
          // Session token is invalid or there was an error
          setIsUserValid(false);
        }
      })();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);


  useEffect(() => {
    if (arr && arr.length > 0) {
      handleDynamicSteps();
    } else {
      setIsTour(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arr]);

  const handleDynamicSteps = () => {
    const github = "https://github.com/OpenSignLabs/OpenSign";
    if (arr && arr.length > 0) {
      // const resArr = arr;
      const resArr = arr.map((obj, index) => {
        if (arr.length - 1 === index) {
          return { ...obj };
        } else {
          return {
            ...obj,
            actions: () => {
              setIsCloseBtn(false);
            }
          };
        }
      });
      setTourConfigs([
        {
          selector: '[data-tut="nonpresentmask"]',
          content: t("tour-mssg.home-layout-1"),
          position: "center"
        },
        {
          selector: '[data-tut="tourbutton"]',
          content: t("tour-mssg.home-layout-2"),
          position: "top"
        },
        ...resArr,
        {
          selector: '[data-tut="nonpresentmask"]',
          content: () => (
            <div>
              {t("tour-mssg.home-layout-3", { appName })}
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
            </div>
          ),
          position: "center"
        }
      ]);
      checkTourStatus();
    }
  };
  const closeTour = async () => {
    // console.log("closeTour");
    setIsTour(false);
    const serverUrl = localStorage.getItem("baseUrl");
    const appId = localStorage.getItem("parseAppId");
    const json = JSON.parse(localStorage.getItem("Extand_Class"));
    const extUserId = json && json.length > 0 && json[0].objectId;
    // console.log("extUserId ", extUserId)

    let updatedTourStatus = [];
    if (tourStatusArr.length > 0) {
      updatedTourStatus = [...tourStatusArr];
      const loginTourIndex = tourStatusArr.findIndex(
        (obj) => obj["loginTour"] === false || obj["loginTour"] === true
      );
      if (loginTourIndex !== -1) {
        updatedTourStatus[loginTourIndex] = { loginTour: true };
      } else {
        updatedTourStatus.push({ loginTour: true });
      }
    } else {
      updatedTourStatus = [{ loginTour: true }];
    }

    await axios.put(
      serverUrl + "classes/contracts_Users/" + extUserId,
      { TourStatus: updatedTourStatus },
      { headers: { "X-Parse-Application-Id": appId } }
    );
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

  const handleLoginBtn = async () => {
    try {
      await Parse?.User?.logOut();
    } catch (err) {
      console.log("err ", err);
    } finally {
      localStorage.removeItem("accesstoken");
      navigate("/", { replace: true, state: { from: location } });
    }
  };
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* HEADER */}
      <header className="z-[501]">
        {!isLoader && <Header setIsLoggingOut={setIsLoggingOut} />}
      </header>
      {isUserValid ? (
        <>
          {isLoader ? (
            <div className="flex h-[100vh] justify-center items-center">
              <Loader />
            </div>
          ) : (
            <>
              {isLoggingOut && (
                <div className="inset-0 bg-black/30 z-[1000] fixed flex justify-center items-center">
                  <Loader />
                </div>
              )}
              {/* BODY */}
              <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR with width animation */}
                <Sidebar />
                {/* MAIN (includes both content + footer in one scrollable column) */}
                <main
                  id="renderList"
                  className="flex-1 overflow-auto transition-all duration-300 ease-in-out"
                >
                  <div className="flex flex-col min-h-full">
                    {/* your page content */}
                    <div className="p-3">{<Outlet />}</div>
                    {/* sticky-but-scrollable footer */}
                    <div className="mt-auto z-30">
                      <Footer />
                    </div>
                  </div>
                </main>
              </div>
              <Tour
                onRequestClose={closeTour}
                steps={tourConfigs}
                isOpen={isTour}
                disableKeyboardNavigation={["esc"]}
                // disableInteraction={true}
                scrollOffset={-100}
                showCloseButton={isCloseBtn}
              />
            </>
          )}
        </>
      ) : (
        <ModalUi showHeader={false} isOpen={true} showClose={false}>
          <div className="flex flex-col justify-center items-center py-4 md:py-5 gap-5">
            <p className="text-xl font-medium">{t("session-expired")}</p>
            <button onClick={handleLoginBtn} className="op-btn op-btn-neutral">
              {t("login")}
            </button>
          </div>
        </ModalUi>
      )}
    </div>
  );
};

export default HomeLayout;
