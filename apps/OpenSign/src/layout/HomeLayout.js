import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/sidebar/Sidebar";
import { useWindowSize } from "../hook/useWindowSize";
import Tour from "reactour";
import axios from "axios";
import { useSelector } from "react-redux";
import Parse from "parse";
import ModalUi from "../primitives/ModalUi";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { isEnableSubscription } from "../constant/const";
import { useCookies } from "react-cookie";
import { fetchSubscription } from "../constant/Utils";

const HomeLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { width } = useWindowSize();
  const [isOpen, setIsOpen] = useState(true);
  const arr = useSelector((state) => state.TourSteps);
  const [isUserValid, setIsUserValid] = useState(true);
  const [isLoader, setIsLoader] = useState(true);
  // reactour state
  const [isCloseBtn, setIsCloseBtn] = useState(true);
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [tourConfigs, setTourConfigs] = useState([]);
  const [, setCookie] = useCookies(["accesstoken", "main_Domain"]);

  useEffect(() => {
    (async () => {
      try {
        // Use the session token to validate the user
        const userQuery = new Parse.Query(Parse.User);
        const user = await userQuery.get(Parse.User.current().id, {
          sessionToken: localStorage.getItem("accesstoken")
        });
        if (user) {
          localStorage.setItem("profileImg", user.get("ProfilePic") || "");
          checkIsSubscribed();
        } else {
          setIsUserValid(false);
        }
      } catch (error) {
        // Session token is invalid or there was an error
        setIsUserValid(false);
      }
    })();
    saveCookies();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //function to use save data in cookies storage
  const saveCookies = () => {
    const main_Domain = window.location.origin;
    const domainName = window.location.hostname; //app.opensignlabs.com
    // Find the index of the first dot in the string
    const indexOfFirstDot = domainName.indexOf(".");
    // Remove the first dot and get the substring starting from the next character
    const updateDomain = domainName.substring(indexOfFirstDot); //.opensignlabs.com
    setCookie("accesstoken", localStorage.getItem("accesstoken"), {
      secure: true,
      domain: updateDomain
    });
    setCookie("main_Domain", main_Domain, {
      secure: true,
      domain: updateDomain
    });
  };

  async function checkIsSubscribed() {
    if (isEnableSubscription) {
      const res = await fetchSubscription();
      if (res.plan === "freeplan") {
        setIsUserValid(true);
        setIsLoader(false);
      } else if (res.billingDate) {
        if (new Date(res.billingDate) > new Date()) {
          setIsUserValid(true);
          setIsLoader(false);
        } else {
          navigate(`/subscription`);
        }
      } else {
        navigate(`/subscription`);
      }
    } else {
      setIsUserValid(true);
      setIsLoader(false);
    }
  }
  const showSidebar = () => {
    setIsOpen((value) => !value);
  };
  useEffect(() => {
    if (width && width <= 768) {
      setIsOpen(false);
    }
  }, [width]);

  useEffect(() => {
    if (
      localStorage.getItem("domain") === "contracts" &&
      arr &&
      arr.length > 0
    ) {
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
          return {
            ...obj
            // actions: () => {
            //   setIsCloseBtn(true);
            // },
          };
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
          selector: '[data-tut="reactourFirst"]',
          content: `You have logged in successfully! Let's take a look.`,
          position: "top"
          // style: { backgroundColor: "#abd4d2" },
        },
        {
          selector: '[data-tut="tourbutton"]',
          content: `To upload documents for self-signing or to request others’ signatures, simply select the respective buttons.`,
          position: "top"
          // style: { backgroundColor: "#abd4d2" },
        },
        ...resArr,
        {
          selector: '[data-tut="reactourLast"]',
          content: `You are ready to start using OpenSign! If you need support feel free to contact us.`,
          position: "top"
          // style: { backgroundColor: "#abd4d2" },
        }
      ]);
      checkTourStatus();
      // console.log("resArr ", resArr);
    }
  };
  const closeTour = async () => {
    // console.log("closeTour");
    setIsTour(false);
    const serverUrl = localStorage.getItem("baseUrl");
    const appId = localStorage.getItem("parseAppId");
    const extUserClass = localStorage.getItem("extended_class");
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
      serverUrl + "classes/" + extUserClass + "/" + extUserId,
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
    const currentUser = Parse.User.current();
    const cloudRes = await Parse.Cloud.run("getUserDetails", {
      email: currentUser.get("email")
    });
    const res = { data: cloudRes.toJSON() };
    if (res.data && res.data.TourStatus && res.data.TourStatus.length > 0) {
      const tourStatus = res.data.TourStatus;
      // console.log("res ", res.data.TourStatus);
      setTourStatusArr(tourStatus);
      const filteredtourStatus = tourStatus.filter((obj) => obj["loginTour"]);
      if (filteredtourStatus.length > 0) {
        const loginTour = filteredtourStatus[0]["loginTour"];
        // console.log("loginTour", loginTour);
        if (loginTour) {
          setIsTour(false);
        } else {
          setIsTour(true);
        }
      } else {
        setIsTour(true);
      }
    } else {
      setIsTour(true);
    }
  }

  const closeSidebar = () => {
    if (width <= 768) {
      setIsOpen(false);
    }
  };

  const handleLoginBtn = () => {
    try {
      Parse.User.logOut();
    } catch (err) {
      console.log("err ", err);
    } finally {
      localStorage.removeItem("accesstoken");
      navigate("/", { replace: true, state: { from: location } });
    }
  };
  return (
    <div>
      <div className="sticky top-0 z-50">
        {!isLoader && <Header showSidebar={showSidebar} />}
      </div>
      {isUserValid ? (
        <>
          {isLoader ? (
            <div
              style={{
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <div
                style={{
                  fontSize: "45px",
                  color: "#3dd3e0"
                }}
                className="loader-37"
              ></div>
            </div>
          ) : (
            <>
              <div className="flex md:flex-row flex-col z-50">
                <Sidebar isOpen={isOpen} closeSidebar={closeSidebar} />
                <div
                  id="renderList"
                  className="relative h-screen flex flex-col justify-between w-full overflow-y-auto"
                >
                  <div className="bg-[#eef1f5] p-3">{<Outlet />}</div>
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
        <ModalUi title={"Session Expired"} isOpen={true} showClose={false}>
          <div className="flex flex-col justify-center items-center py-4 md:py-5 gap-5">
            {/* <p className="text-xl font-normal">Your session has expired.</p> */}
            <button
              onClick={handleLoginBtn}
              className="text-base px-3 py-1.5 rounded shadow-md text-white bg-[#1ab6ce]"
            >
              Login
            </button>
          </div>
        </ModalUi>
      )}
    </div>
  );
};

export default HomeLayout;
