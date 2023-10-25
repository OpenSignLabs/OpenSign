import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/sidebar/Sidebar";
import { useWindowSize } from "../hook/useWindowSize";
import Tour from "reactour";
import axios from "axios";
import { useSelector } from "react-redux";

const HomeLayout = ({ children }) => {
  const { width } = useWindowSize();
  const [isOpen, setIsOpen] = useState(false);
  const arr = useSelector((state) => state.TourSteps);

  // reactour state
  const [isCloseBtn, setIsCloseBtn] = useState(true);
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [tourConfigs, setTourConfigs] = useState([]);

  const showSidebar = () => {
    setIsOpen(!isOpen);
  };
  useEffect(() => {
    if (width && width <= 768) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [width]);

  useEffect(() => {
    if (localStorage.getItem("domain") === "sign" && arr && arr.length > 0) {
      handleDynamicSteps();
    } else if (
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
        ...resArr,
        {
          selector: '[data-tut="reactourLast"]',
          content: `You are good to go`,
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
    const appId = localStorage.getItem("AppID12");
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
    const serverUrl = localStorage.getItem("baseUrl");
    const appId = localStorage.getItem("AppID12");
    const extUserClass = localStorage.getItem("extended_class");
    const json = JSON.parse(localStorage.getItem("Extand_Class"));
    const extUserId = json && json.length > 0 && json[0].objectId;
    // console.log("extUserId ", extUserId);
    const res = await axios.get(
      serverUrl + "classes/" + extUserClass + "/" + extUserId,
      {
        headers: {
          "X-Parse-Application-Id": appId
        }
      }
    );
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
  return (
    <div>
      <div className="sticky top-0 z-30">
        <Header showSidebar={showSidebar} />
      </div>
      <div className="flex md:flex-row flex-col">
        <Sidebar isOpen={isOpen} closeSidebar={closeSidebar} />

        <div className="relative h-screen flex flex-col justify-between w-full overflow-y-auto">
          <div className="bg-[#eef1f5] p-3">{children}</div>
          <div>
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
    </div>
  );
};

export default HomeLayout;
