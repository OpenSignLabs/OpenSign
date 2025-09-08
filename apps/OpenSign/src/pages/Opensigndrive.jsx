import React, { useEffect, useState, useRef, useCallback } from "react";
import { lazyWithRetry } from "../utils";
import "../styles/opensigndrive.css";
import {
  getThemeIconColor,
} from "../constant/const";
import {
  getDrive
} from "../constant/Utils";
import { useNavigate } from "react-router";
import Parse from "parse";
import ModalUi from "../primitives/ModalUi";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import Tour from "../primitives/Tour";
import axios from "axios";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";

const DriveBody = lazyWithRetry(
  () => import("../components/opensigndrive/DriveBody")
);
const dropdowncss =
  "absolute right-0 py-2 text-[1rem] text-left bg-white border-[1px] border-gray-300 min-w-1 hover:bg-gray-300  rounded-[0.25rem] z-[800]";
const AppLoader = () => {
  return (
    <div className="h-[100vh] flex justify-center items-center">
      <Loader />
    </div>
  );
};
function Opensigndrive() {
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  // Create a ref for the "sentinel" element at the bottom of the list
  const bottomRef = useRef(null);
  const [isList, setIsList] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Date");
  const [sortingOrder, setSortingOrder] = useState("Descending");
  const [pdfData, setPdfData] = useState([]);
  const [isFolder, setIsFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState();
  const [error, setError] = useState();
  const [folderLoader, setIsFolderLoader] = useState(false);
  const [isShowSort, setIsShowSort] = useState(false);
  const [isTour, setIsTour] = useState(false);
  const [tourStatusArr, setTourStatusArr] = useState([]);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: t("loading-mssg")
  });
  const [docId, setDocId] = useState();
  const [handleError, setHandleError] = useState("");
  const [folderName, setFolderName] = useState([]);
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [isOptions, setIsOptions] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 50;
  const [loading, setLoading] = useState(false);
  const sortOrder = ["Ascending", "Descending"];
  const sortingValue = ["Name", "Date"];
  const [isDontShow, setIsDontShow] = useState(true);
  const [tourData, setTourData] = useState();
  const [showTourFirstTIme, setShowTourFirstTime] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const debounceTimer = useRef(null);
  const orderName = {
    Ascending: "Ascending",
    Descending: "Descending",
    Name: "Name",
    Date: "Date"
  };
  const currentUser =
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    ) &&
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
  const jsonCurrentUser = JSON.parse(currentUser);

  useEffect(() => {
    getDetails();
    // eslint-disable-next-line
  }, [docId]);

  const tourConfigs = [
    {
      selector: '[data-tut="reactourFirst"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.opensign-drive-1")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourSecond"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.opensign-drive-2")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourThird"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.opensign-drive-3")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    },
    {
      selector: '[data-tut="reactourForth"]',
      content: () => (
        <TourContentWithBtn
          message={t("tour-mssg.opensign-drive-4")}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];
  const getDetails = async () => {
      getPdfDocumentList();
  };
  //function for get all pdf document list
  const getPdfDocumentList = async (disbaleLoading) => {
    setLoading(true);
    if (showTourFirstTIme) {
      checkTourStatus();
    }
    if (!disbaleLoading) {
      setIsLoading({ isLoad: true, message: t("loading-mssg") });
    }
    try {
      const driveDetails = await getDrive(docId, skip, limit);
      if (driveDetails && driveDetails === "Error: Something went wrong!") {
        setHandleError(t("something-went-wrong-mssg"));
      } else if (driveDetails && driveDetails.length > 0) {
        const addMoreTour = [
          {
            selector: '[data-tut="reactourFifth"]',
            content: () => (
              <TourContentWithBtn
                message={t("tour-mssg.opensign-drive-5")}
                isChecked={handleDontShow}
              />
            ),
            position: "bottom",
            style: { fontSize: "13px" }
          },
          {
            selector: '[data-tut="reactourSixth"]',
            content: () => (
              <TourContentWithBtn
                message={t("tour-mssg.opensign-drive-6")}
                isChecked={handleDontShow}
              />
            ),
            position: "bottom",
            style: { fontSize: "13px" }
          },
          {
            selector: '[data-tut="reactourSeventh"]',
            content: () => (
              <TourContentWithBtn
                message={t("tour-mssg.opensign-drive-7")}
                isChecked={handleDontShow}
              />
            ),
            position: "bottom",
            style: { fontSize: "13px" }
          }
        ];
        let newTour = [...tourConfigs, ...addMoreTour];
        const isFolderExist = driveDetails.some(
          (data) => data.Type === "Folder"
        );
        if (!isFolderExist) {
          newTour = newTour.filter(
            (data) => data.selector !== '[data-tut="reactourSeventh"]'
          );
        }
        const isDocumentExist = driveDetails.some((data) => data.URL);
        if (!isDocumentExist) {
          newTour = newTour.filter(
            (data) => data.selector !== '[data-tut="reactourSixth"]'
          );
        }
        setTourData(newTour);
        setSkip((prevSkip) => prevSkip + limit);
        sortingData(null, null, driveDetails, true);
      } else {
        setTourData(tourConfigs);
      }
      if (!docId) {
        setFolderName([
          { name: t("OpenSign-drive", { appName: drivename }), objectId: "" }
        ]);
      }
    } catch (e) {
      setIsAlert({
        isShow: true,
        alertMessage: t("something-went-wrong-mssg")
      });
    } finally {
      setLoading(false);
      setIsLoading({ isLoad: false });
    }
  };

  // Memoize the loader function so it only changes when deps change
  const loadMore = useCallback(() => {
    // Only fetch if we're not already loading and we've got a full "page" (50 items)
    if (!loading && pdfData.length % 50 === 0) {
      // Pass `true` to disable the initial loader UI
      getPdfDocumentList(true);
    }
  }, [loading, pdfData.length, getPdfDocumentList]);

  useEffect(() => {
    const container = document.getElementById("renderList") || null;
    if (!container) return;
    // Set up the IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 5. When the sentinel comes fully into view, trigger loadMore()
        if (entry.isIntersecting) loadMore();
      },
      {
        root: container, // Determine the scroll container (null = viewport)
        rootMargin: "0px", // no extra margin
        threshold: 1.0 // fire when 100% of sentinel is visible
      }
    );
    // Start observing the sentinel DOM node
    if (bottomRef.current) observer.observe(bottomRef.current);
    // Clean up on unmount or if loadMore changes
    return () => {
      if (bottomRef.current) observer.unobserve(bottomRef.current);
      observer.disconnect();
    };
  }, [loadMore]);

  //function for handle folder name path
  const handleRoute = (index, folderData) => {
    setSkip(0);
    // after onclick on route filter route from that index
    const updateFolderName = folderName.filter((_, i) => i <= index);
    setFolderName(updateFolderName);
    //get route details after onclick path of folder name
    const getCurrentId = folderData[index];
    const getLastId = updateFolderName[updateFolderName.length - 1];
    //below condition is used to check if user click on same route which already open then don't change any thing
    if (docId !== getCurrentId.objectId) {
      setPdfData([]);
      setDocId(getLastId.objectId);
    }
  };

  //function for add new folder name
  const handleFolderName = (e) => {
    setError();
    const value = e.target.value;
    setNewFolderName(value);
  };
  //function for create folder
  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (newFolderName) {
      setIsFolderLoader(true);
      const getParentObjId = folderName[folderName.length - 1];
      const parentId = getParentObjId && getParentObjId.objectId;
      const foldercls = "contracts_Document";
      const folderPtr = {
        __type: "Pointer",
        className: foldercls,
        objectId: parentId
      };
      const CreatedBy = {
        __type: "Pointer",
        className: "_User",
        objectId: jsonCurrentUser.objectId
      };

      try {
        const exsitQuery = new Parse.Query(foldercls);
        exsitQuery.equalTo("Name", newFolderName);
        exsitQuery.equalTo("Type", "Folder");
        exsitQuery.notEqualTo("IsArchive", true);
        if (parentId) {
          exsitQuery.equalTo("Folder", folderPtr);
        }
        const templExist = await exsitQuery.first();
        if (templExist) {
          setError("Folder already exist!");
          setIsFolderLoader(false);
        } else {
          const template = new Parse.Object(foldercls);
          template.set("Name", newFolderName);
          template.set("Type", "Folder");

          if (parentId) {
            template.set("Folder", folderPtr);
          }
          template.set("CreatedBy", CreatedBy);
          const res = await template.save();
          if (res) {
            const result = JSON.parse(JSON.stringify(res));

            setPdfData((prev) => [...prev, result]);
            sortingData(null, null, [result], true);
            setNewFolderName();
            setIsFolderLoader(false);
            setIsFolder(false);
          }
        }
      } catch (e) {
        setIsAlert({
          isShow: true,
          alertMessage: t("something-went-wrong-mssg")
        });
      }
    } else {
      setError(t("fill-field"));
    }
  };

  //function to use sorting document list according to type and order
  const sortedBy = (appInfo, type, order) => {
    if (type === orderName.Name) {
      if (order === orderName.Ascending) {
        return appInfo.sort((a, b) =>
          a.Name.toLowerCase() < b.Name.toLowerCase() ? -1 : 1
        );
      } else if (order === orderName.Descending) {
        return appInfo.sort((a, b) =>
          a.Name.toLowerCase() < b.Name.toLowerCase() ? 1 : -1
        );
      }
    } else if (type === orderName.Date) {
      if (order === orderName.Ascending) {
        return appInfo.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
      } else if (order === orderName.Descending) {
        return appInfo.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      }
    }
  };

  //function to use get sorting type, order and document list to sort
  const sortingData = (type, order, driveDetails, isInitial) => {
    const selectedSortType = type ? type : selectedSort;
    const sortOrder = order ? order : sortingOrder;

    //check isInitial true it means sort previous 20 and get on scrolling 20 = 40 document list
    const allPdfData = isInitial ? [...pdfData, ...driveDetails] : driveDetails;
    //call sortedBy function according to selected Type and order
    if (selectedSortType === orderName.Name) {
      sortedBy(allPdfData, orderName.Name, sortOrder);
    } else if (selectedSortType === orderName.Date) {
      sortedBy(allPdfData, orderName.Date, sortOrder);
    }

    setPdfData(allPdfData);
  };

  //function for handle auto scroll on folder path
  const handleMouseEnter = (e) => {
    let side = "";
    const container = scrollRef.current;
    const containerRect = container.getBoundingClientRect();
    const cursorX = e.clientX;
    const containerX = containerRect.left;
    const containerWidth = containerRect.width;

    // Define a threshold (e.g., 10 pixels) for the start and end points
    const threshold = 10;

    if (cursorX - containerX <= threshold) {
      side = "start";
    } else if (containerX + containerWidth - cursorX <= threshold) {
      side = "end";
    } else {
      side = "";
    }

    const scrollSpeed = 10;
    let scrollAmount = 0;

    const scroll = () => {
      if (side === "start" && container.scrollLeft > 0) {
        container.scrollLeft -= scrollAmount;
        requestAnimationFrame(scroll);
      } else if (
        side === "end" &&
        container.scrollLeft < container.scrollWidth - container.clientWidth
      ) {
        container.scrollLeft += scrollAmount;
        requestAnimationFrame(scroll);
      }
    };

    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const containerWidth = rect.width;

      // Calculate the scroll amount based on the cursor's position
      scrollAmount = (x / containerWidth) * scrollSpeed;
    });

    scroll();
  };

  //handle to close drop down menu onclick screen
  useEffect(() => {
    const closeMenuOnOutsideClick = (e) => {
      if (isShowSort && !e.target.closest("#menu-container")) {
        setIsShowSort(!isShowSort);
      } else if (isOptions && !e.target.closest("#folder-menu")) {
        setIsOptions(!isOptions);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
    // eslint-disable-next-line
  }, [isShowSort, isOptions]);

  const handleFolderTab = (folderData) => {
    return folderData.map((data, id) => {
      return (
        <React.Fragment key={id}>
          <span
            onClick={() => handleRoute(id, folderData)}
            className="text-[#a64b4e] font-normal cursor-pointer"
          >
            {data.name}
            <span className="text-[#a64b4e] font-extralight cursor-pointer mx-[4px]">
              &gt;
            </span>
          </span>
        </React.Fragment>
      );
    });
  };
  const oncloseFolder = () => {
    setIsFolder(false);
    setNewFolderName("");
    setError("");
  };

  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };

  const closeTour = async () => {
    setIsTour(false);
    setShowTourFirstTime(false);
    if (isDontShow) {
      const serverUrl = localStorage.getItem("baseUrl");
      const appId = localStorage.getItem("parseAppId");
      const json = JSON.parse(localStorage.getItem("Extand_Class"));
      const extUserId = json && json.length > 0 && json[0].objectId;
      let updatedTourStatus = [];
      if (tourStatusArr.length > 0) {
        updatedTourStatus = [...tourStatusArr];
        const driveTourIndex = tourStatusArr.findIndex(
          (obj) => obj["driveTour"] === false || obj["driveTour"] === true
        );
        if (driveTourIndex !== -1) {
          updatedTourStatus[driveTourIndex] = { driveTour: true };
        } else {
          updatedTourStatus.push({ driveTour: true });
        }
      } else {
        updatedTourStatus = [{ driveTour: true }];
      }
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
    }
  };
  //function to use check tour status of open sign drive
  async function checkTourStatus() {
    const cloudRes = await Parse.Cloud.run("getUserDetails");
    if (cloudRes) {
      const extUser = JSON.parse(JSON.stringify(cloudRes));
      localStorage.setItem("Extand_Class", JSON.stringify([extUser]));
      const tourStatus = extUser?.TourStatus || [];
      setTourStatusArr(tourStatus);
      const driveTour = tourStatus.find((obj) => obj.driveTour)?.driveTour;
      setIsTour(!driveTour);
    } else {
      setIsTour(true);
    }
  }

  const handleSearchChange = async (e) => {
    const name = e.target.value.toLowerCase();
    setSearchTerm(name);
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    // Start new debounce timer
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await Parse.Cloud.run("filterdocs", { searchTerm: name });
        setPdfData(JSON.parse(JSON.stringify(res)));
      } catch (err) {
        console.error("Search error:", err);
        alert(`Error: ${err.message}`);
      }
    }, 300);
  };

  const handleSearchPaste = (e) => {
    setTimeout(() => {
      handleSearchChange({ target: { value: e.target.value } });
    }, 0);
  };
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleHighlightClick = () => {
    setIsTour(false);
    setShowTourFirstTime(false);
  };

  const handleFolderOptions = () => {
    setIsOptions(!isOptions);
    handleHighlightClick();
  };

  const handleSortOptions = () => {
    setIsShowSort(!isShowSort);
    handleHighlightClick();
  };

  const handleViewOption = () => {
    setIsList(!isList);
    handleHighlightClick();
  };
  return (
    <div className="bg-base-100 text-base-content rounded-box w-full shadow-md">
      <ModalUi
        isOpen={isAlert.isShow}
        title={t("alert")}
        handleClose={() => {
          setIsAlert({ isShow: false, alertMessage: "" });
        }}
      >
        <div className="h-full p-[20px] pb-[15px]">
          <p>{isAlert.alertMessage}</p>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <button
            onClick={() => setIsAlert({ isShow: false, alertMessage: "" })}
            type="button"
            className="op-btn op-btn-neutral op-btn-sm"
          >
            {t("close")}
          </button>
        </div>
      </ModalUi>
      <ModalUi
        isOpen={isFolder}
        title={t("add-new-folder")}
        handleClose={oncloseFolder}
      >
        <div className="h-full p-[20px] pt-[10px] pb-[15px]">
          {folderLoader ? (
            <div className="h-[200px] flex justify-center items-center">
              <Loader />
            </div>
          ) : (
            <form
              onSubmit={handleAddFolder}
              className="flex flex-col text-base-content"
            >
              <label className="py-[8px] text-[15px] font-[400] mb-0">
                {t("name")}
                <span className="text-[red]">*</span>
              </label>
              <input
                onInvalid={(e) =>
                  e.target.setCustomValidity(t("input-required"))
                }
                onInput={(e) => e.target.setCustomValidity("")}
                required
                className="op-input op-input-bordered op-input-sm"
                type="text"
                value={newFolderName}
                onChange={(e) => handleFolderName(e)}
              />
              <span className="text-[red] text-[12px] mt-[6px]">{error}</span>
              <div className="w-full h-[1px] bg-[#9f9f9f] my-[15px]"></div>
              <div className="flex flex-row">
                <button type="submit" className="op-btn op-btn-primary">
                  {t("add")}
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-ghost text-base-content ml-1"
                  onClick={oncloseFolder}
                >
                  {t("close")}
                </button>
              </div>
            </form>
          )}
        </div>
      </ModalUi>
      {isLoading.isLoad ? (
        <div className="flex flex-col justify-center items-center h-[100vh] w-full">
          <Loader />
          <span className="text-[13px] text-base-content">
            {isLoading.message}
          </span>
        </div>
      ) : handleError ? (
        <div className="flex justify-center items-center h-[100vh] w-full">
          <span className="text-[20px] text-base-content">{handleError}</span>
        </div>
      ) : (
        <>
          <div className="flex flex-row justify-between items-center px-[15px] md:px-[25px] pt-2 md:pt-[20px]">
            {tourData && (
              <Tour
                onRequestClose={closeTour}
                steps={tourData}
                isOpen={isTour}
                scrollOffset={-100}
              />
            )}
            <div
              data-tut="reactourFirst"
              onMouseEnter={(e) => handleMouseEnter(e)}
              onClick={handleHighlightClick}
              ref={scrollRef}
              className="w-full whitespace-nowrap cursor-pointer select-none overflow-x-auto"
            >
              {handleFolderTab(folderName)}
            </div>
            <div className="flex flex-row items-center justify-center md:gap-1">
              {/* Desktop search input */}
              <div className="hidden md:block p-2">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={t("search-documents")}
                  onPaste={handleSearchPaste}
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-64 text-xs"
                />
              </div>
              {/* Mobile search toggle */}
              <button
                className="md:hidden p-2 flex justify-center items-center focus:outline-none rounded-md hover:bg-gray-200 text-[18px]"
                aria-label="Search"
                onClick={() => setMobileSearchOpen((open) => !open)}
              >
                <i
                  style={{ color: `${getThemeIconColor()}` }}
                  className="fa-solid fa-magnifying-glass"
                ></i>
              </button>
              <div
                id="folder-menu"
                className={`${isOptions ? "dropdown show dropDownStyle" : "dropdown"} hidden md:block cursor-pointer hover:bg-gray-200 p-2 rounded-md`}
                onClick={handleFolderOptions}
              >
                <div data-tut="reactourSecond">
                  <i
                    className="fa-light fa-plus-square text-[24px]"
                    aria-hidden="true"
                    style={{ color: `${getThemeIconColor()}` }}
                  ></i>
                </div>
                <div
                  className={`${isOptions ? "block" : "hidden"} ${dropdowncss}`}
                  aria-labelledby="dropdownMenuButton"
                  aria-expanded={isOptions ? "true" : "false"}
                >
                  <div className="flex flex-col">
                    <span
                      className="dropdown-item text-[10px] md:text-[13px]"
                      onClick={() => setIsFolder(true)}
                    >
                      <i
                        className="fa-light fa-plus mr-[5px]"
                        aria-hidden="true"
                      ></i>
                      {t("create-folder")}
                    </span>
                    <span
                      className="dropdown-item text-[10px] md:text-[13px]"
                      onClick={() => navigate("/form/sHAnZphf69")}
                    >
                      <i className="fa-light fa-pen-nib mr-[5px]"></i>
                      {t("Sign Yourself")}
                    </span>
                    <span
                      className="dropdown-item text-[10px] md:text-[13px]"
                      onClick={() => navigate("/form/8mZzFxbG1z")}
                    >
                      <i className="fa-light fa-file-signature mr-[5px]"></i>
                      {t("Request Signatures")}
                    </span>
                  </div>
                </div>
              </div>
              <div
                id="menu-container"
                className={isShowSort ? "dropdown show" : "dropdown"}
                onClick={handleSortOptions}
              >
                <div
                  data-tut="reactourThird"
                  className="cursor-pointer flex flex-row items-center justify-center p-2 hover:bg-gray-200 rounded-md"
                  data-toggle="dropdown"
                >
                  <i
                    className="fa-light fa-sort-amount-asc mr-[5px] text-[19px]"
                    aria-hidden="true"
                    style={{ color: `${getThemeIconColor()}` }}
                  ></i>
                  <span
                    style={{
                      fontSize: "15px",
                      color: `${getThemeIconColor()}`
                    }}
                  >
                    {selectedSort}
                  </span>
                </div>
                <div
                  className={
                    isShowSort ? "dropdown-menu show" : "dropdown-menu"
                  }
                  aria-labelledby="dropdownMenuButton"
                  aria-expanded={isShowSort ? "true" : "false"}
                >
                  {sortingValue.map((value, ind) => (
                    <span
                      key={ind}
                      onClick={() => {
                        setSelectedSort(value);
                        sortingData(value, null, pdfData);
                      }}
                      className="dropdown-item text-[10px] md:text-[13px]"
                      style={{
                        paddingLeft: selectedSort !== value && "31px"
                      }}
                    >
                      {selectedSort === value && (
                        <i className="fa-light fa-check" aria-hidden="true"></i>
                      )}
                      <span className="ml-[5px]">
                        {t(`sort-order.${value}`)}
                      </span>
                    </span>
                  ))}
                  <hr className="hrStyle" />
                  {sortOrder.map((order, ind) => (
                    <span
                      key={ind}
                      onClick={() => {
                        setSortingOrder(order);
                        sortingData(null, order, pdfData);
                      }}
                      className="dropdown-item text-[10px] md:text-[13px]"
                      style={{
                        paddingLeft: sortingOrder !== order && "31px"
                      }}
                    >
                      {sortingOrder === order && (
                        <i className="fa-light fa-check" aria-hidden="true"></i>
                      )}
                      <span className="ml-[5px]">
                        {t(`sort-order.${order}`)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="cursor-pointer p-2 hover:bg-gray-200 rounded-md flex justify-center items-center"
                data-tut="reactourForth"
                onClick={handleViewOption}
              >
                <i
                  className={`${isList ? "fa-light fa-th-large" : "fa-light fa-list"} text-[20px]`}
                  style={{ color: `${getThemeIconColor()}` }}
                  aria-hidden="true"
                ></i>
              </div>
              <div
                id="folder-menu"
                className={`${isOptions ? "dropdown show dropDownStyle" : "dropdown"} md:hidden`}
                onClick={() => setIsOptions(!isOptions)}
              >
                <div
                  className="p-3 flex items-center justify-center cursor-pointer rounded-md hover:bg-gray-200"
                  data-tut="reactourSecond"
                >
                  <i
                    className="fa-light fa-ellipsis-vertical fa-lg"
                    aria-hidden="true"
                    style={{ color: `${getThemeIconColor()}` }}
                  ></i>
                </div>
                <div
                  className={`${isOptions ? "block" : "hidden"} ${dropdowncss}`}
                  aria-labelledby="dropdownMenuButton"
                  aria-expanded={isOptions ? "true" : "false"}
                >
                  <div className="flex flex-col">
                    <span
                      className="dropdown-item text-[10px] md:text-[13px]"
                      onClick={() => setIsFolder(true)}
                    >
                      <i
                        className="fa-light fa-plus mr-[5px]"
                        aria-hidden="true"
                      ></i>
                      {t("create-folder")}
                    </span>
                    <span
                      className="dropdown-item text-[10px] md:text-[13px]"
                      onClick={() => navigate("/form/sHAnZphf69")}
                    >
                      <i className="fa-light fa-pen-nib mr-[5px]"></i>
                      {t("Sign Yourself")}
                    </span>
                    <span
                      className="dropdown-item text-[10px] md:text-[13px]"
                      onClick={() => navigate("/form/8mZzFxbG1z")}
                    >
                      <i className="fa-light fa-file-signature mr-[5px]"></i>
                      {t("Request Signatures")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Mobile search overlay */}
          {mobileSearchOpen && (
            <div className="top-full left-0 w-full bg-white px-4 py-2 shadow-md md:hidden">
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={t("search-documents")}
                onPaste={handleSearchPaste}
                className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
              />
            </div>
          )}
          {pdfData && pdfData.length === 0 ? (
            <div className="flex justify-center items-center w-full h-[50vh]">
              <span className="text-base-content font-bold">
                {t("no-data")}
              </span>
            </div>
          ) : (
            <div data-tut="reactourFifth">
              <React.Suspense fallback={<AppLoader />}>
                <DriveBody
                  dataTutSixth="reactourSixth"
                  dataTutSeventh="reactourSeventh"
                  pdfData={pdfData}
                  setFolderName={setFolderName}
                  setIsLoading={setIsLoading}
                  setDocId={setDocId}
                  getPdfDocumentList={getPdfDocumentList}
                  isDocId={docId}
                  setPdfData={setPdfData}
                  isList={isList}
                  setIsAlert={setIsAlert}
                  setSkip={setSkip}
                  sortingData={sortingData}
                />
                {/* sentinel */}
                <div ref={bottomRef} className="h-1" />
                {loading && (
                  <div className="text-center pb-[20px]">{t("loading")}</div>
                )}
              </React.Suspense>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Opensigndrive;
