import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/sidebar/Sidebar";
import { useWindowSize } from "../hook/useWindowSize";
import Tour from "../primitives/Tour";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Parse from "parse";
import ModalUi from "../primitives/ModalUi";
import { useNavigate, useLocation, Outlet } from "react-router";
import Loader from "../primitives/Loader";
import { showHeader } from "../redux/reducers/showHeader";
import { useTranslation } from "react-i18next";

const HomeLayout = () => {
  const appName =
    "OpenSign™";
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { width } = useWindowSize();
  const [isOpen, setIsOpen] = useState(true);
  const arr = useSelector((state) => state.TourSteps);
  const [isUserValid, setIsUserValid] = useState(true);
  const [isLoader, setIsLoader] = useState(true);
  const [isCloseBtn, setIsCloseBtn] = useState(true);
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [tourConfigs, setTourConfigs] = useState([]);

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

  const showSidebar = () => {
    setIsOpen((value) => !value);
    dispatch(showHeader(!isOpen));
  };
  useEffect(() => {
    if (width && width <= 768) {
      setIsOpen(false);
    }
  }, [width]);

  useEffect(() => {
    if (arr && arr.length > 0) {
      handleDynamicSteps();
    } else {
      setIsTour(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arr]);

  const handleDynamicSteps = () => {
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
          position: "center",
        },
        {
          selector: '[data-tut="tourbutton"]',
          content: t("tour-mssg.home-layout-2"),
          position: "top"
        },
        ...resArr,
        {
          selector: '[data-tut="nonpresentmask"]',
          content: t("tour-mssg.home-layout-3", { appName }),
          position: "center",
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

    // console.log("updatedTourStatus ", updatedTourStatus);
    await axios.put(
      serverUrl + "classes/contracts_Users/" + extUserId,
      {
        TourStatus: updatedTourStatus
      },
      {
        headers: {
          "X-Parse-Application-Id": appId
        }
      }
    );
    // console.log("updatedRes ", updatedRes);
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

  const closeSidebar = () => {
    if (width <= 1023) {
      setIsOpen(false);
    }
  };

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
    <div>
      <div className="sticky top-0 z-[501]">
        {!isLoader && (
          <Header showSidebar={showSidebar} setIsMenu={setIsOpen} />
        )}
      </div>
      {isUserValid ? (
        <>
          {isLoader ? (
            <div className="flex h-[100vh] justify-center items-center">
              <Loader />
            </div>
          ) : (
            <>
              <div className="flex md:flex-row flex-col z-50">
                <Sidebar isOpen={isOpen} closeSidebar={closeSidebar} />
                <div
                  id="renderList"
                  className="relative h-screen flex flex-col justify-between w-full overflow-y-auto"
                >
                  <div className="bg-base-200 p-3">{<Outlet />}</div>
                  <div className="z-30">
                    <Footer />
                  </div>
                </div>
              </div>
              <Tour
                onRequestClose={closeTour}
                steps={tourConfigs}
                isOpen={isTour}
                closeWithMask={false}
                disableKeyboardNavigation={["esc"]}
                // disableInteraction={true}
                scrollOffset={-100}
                rounded={5}
                showCloseButton={isCloseBtn}
              />
            </>
          )}
        </>
      ) : (
        <ModalUi showHeader={false} isOpen={true} showClose={false}>
          <div className="flex flex-col justify-center items-center py-4 md:py-5 gap-5">
            <p className="text-xl font-medium">Your session has expired.</p>
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
