import React, { useEffect, useState, useRef } from "react";
import "../styles/opensigndrive.css";
import { iconColor } from "../constant/const";
import { getDrive } from "../constant/Utils";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import Parse from "parse";
import ModalUi from "../primitives/ModalUi";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import Tour from "reactour";
import axios from "axios";
import Loader from "../primitives/Loader";

const DriveBody = React.lazy(
  () => import("../components/opensigndrive/DriveBody")
);
const AppLoader = () => {
  return (
    <div className="h-[100vh] flex justify-center items-center">
      <Loader />
    </div>
  );
};
function Opensigndrive() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
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
    message: "This might take some time"
  });
  const [docId, setDocId] = useState();
  const [handleError, setHandleError] = useState("");
  const [folderName, setFolderName] = useState([]);
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [isNewFol, setIsNewFol] = useState(false);
  const [skip, setSkip] = useState(0);
  const limit = 100;
  const [loading, setLoading] = useState(false);
  const sortOrder = ["Ascending", "Descending"];
  const sortingValue = ["Name", "Date"];
  const [isDontShow, setIsDontShow] = useState(false);
  const [tourData, setTourData] = useState();
  const [showTourFirstTIme, setShowTourFirstTime] = useState(true);
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
    getPdfDocumentList();

    // eslint-disable-next-line
  }, [docId]);

  const tourConfigs = [
    {
      selector: '[data-tut="reactourFirst"]',
      content: () => (
        <TourContentWithBtn
          message={`Click on the breadcrumb links to easily navigate through the folder hierarchy and view the documents within each folder.`}
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
          message={`Click the add button to create a new folder or document.`}
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
          message={`Sort your documents by Date or Name using this menu.`}
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
          message={`Click on this menu to display the documents in list view.`}
          isChecked={handleDontShow}
        />
      ),
      position: "top",
      style: { fontSize: "13px" }
    }
  ];
  //function for get all pdf document list
  const getPdfDocumentList = async (disbaleLoading) => {
    setLoading(true);
    if (showTourFirstTIme) {
      checkTourStatus();
    }
    if (!disbaleLoading) {
      setIsLoading({ isLoad: true, message: "This might take some time" });
    }
    try {
      const driveDetails = await getDrive(docId, skip, limit);
      if (driveDetails && driveDetails === "Error: Something went wrong!") {
        setHandleError("Error: Something went wrong!");
      } else if (driveDetails && driveDetails.length > 0) {
        const addMoreTour = [
          {
            selector: '[data-tut="reactourFifth"]',
            content: () => (
              <TourContentWithBtn
                message={`The document list is displayed according to the selected sorting option. Icons next to each document indicate its current status.`}
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
                message={`Right-click on a document to see options such as Download, Rename, Move, and Delete. Click on the document to open it.`}
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
                message={`Right-click on any folder to see options. Choose ‘Rename’ to change the folder’s name or click on the folder to navigate through its contents.`}
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
        setFolderName([{ name: "OpenSign™ Drive", objectId: "" }]);
      }
    } catch (e) {
      setIsAlert({
        isShow: true,
        alertMessage: "something went wrong"
      });
    } finally {
      setLoading(false);
      setIsLoading({
        isLoad: false
      });
    }
  };

  //function to fetch drive details list on scroll bottom
  const handleScroll = () => {
    //get document of render openSign-drive component using id
    const documentList = document.getElementById("renderList");
    //documentList.clientHeight property returns the height of an element's content area, including padding but not including borders, margins, or scrollbars.
    //documentList.scrollHeight property returns the entire height of an element,including the parts that are not visible due to overflow..
    // documentList.scrollTop property show height of element, how much the content has been scrolled from the top.
    // When the sum of scrollTop and clientHeight is equal to scrollHeight, it means that the user has scrolled to the bottom of the div.
    if (
      documentList &&
      documentList.scrollTop + documentList.clientHeight >=
        documentList.scrollHeight
    ) {
      //disableLoading is used disable initial loader
      const disableLoading = true;
      // If the fetched data length is less than the limit, it means there's no more data to fetch

      if (!loading && pdfData.length % 100 === 0) {
        getPdfDocumentList(disableLoading);
      }
    }
  };
  //useEffect is used to call handleScroll function on scrolling event
  useEffect(() => {
    const documentList = document.getElementById("renderList");
    if (documentList) {
      documentList.addEventListener("scroll", handleScroll);
      return () => {
        documentList.removeEventListener("scroll", handleScroll);
      };
    }
    // eslint-disable-next-line
  }, [loading, sortingOrder, selectedSort]); // Add/remove scroll event listener when loading changes

  //function for handle folder name path
  const handleRoute = (index, folderData) => {
    setSkip(0);
    // after onclick on route filter route from that index
    const updateFolderName = folderName.filter((x, i) => {
      if (i <= index) {
        return x;
      }
    });
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
          alertMessage: "something went wrong!"
        });
      }
    } else {
      setError("Please fill out this field");
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
      } else if (isNewFol && !e.target.closest("#folder-menu")) {
        setIsNewFol(!isNewFol);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
    // eslint-disable-next-line
  }, [isShowSort, isNewFol]);

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
    const res = { data: cloudRes.toJSON() };
    if (res.data && res.data.TourStatus && res.data.TourStatus.length > 0) {
      const tourStatus = res.data.TourStatus;
      setTourStatusArr(tourStatus);
      const filteredtourStatus = tourStatus.filter((obj) => obj["driveTour"]);
      if (filteredtourStatus.length > 0) {
        const driveTour = filteredtourStatus[0]["driveTour"];
        // console.log("loginTour", loginTour);
        if (driveTour) {
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
  return (
    <div className="bg-base-100 text-base-content rounded-box w-full shadow-md">
      <Title title={"OpenSign™ Drive"} drive={true} />
      <ModalUi
        isOpen={isAlert.isShow}
        title={"Alert"}
        handleClose={() => {
          setIsAlert({
            isShow: false,
            alertMessage: ""
          });
        }}
      >
        <div className="h-full p-[20px] pb-[15px]">
          <p>{isAlert.alertMessage}</p>
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <button
            onClick={() =>
              setIsAlert({
                isShow: false,
                alertMessage: ""
              })
            }
            type="button"
            className="op-btn op-btn-neutral op-btn-sm"
          >
            Close
          </button>
        </div>
      </ModalUi>
      <ModalUi
        isOpen={isFolder}
        title={"Add New Folder"}
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
                Name
                <span className="text-[red]">*</span>
              </label>
              <input
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
                  Add
                </button>
                <button
                  type="button"
                  className="op-btn op-btn-ghost ml-1"
                  onClick={oncloseFolder}
                >
                  Close
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
          <div className="flex flex-row justify-between items-center px-[25px] pt-[20px]">
            {tourData && (
              <Tour
                onRequestClose={closeTour}
                steps={tourData}
                isOpen={isTour}
                closeWithMask={false}
                scrollOffset={-100}
                rounded={5}
              />
            )}
            <div
              data-tut="reactourFirst"
              onMouseEnter={(e) => handleMouseEnter(e)}
              ref={scrollRef}
              className="w-full whitespace-nowrap cursor-pointer select-none overflow-x-auto"
            >
              {handleFolderTab(folderName)}
            </div>
            <div className="flex flex-row items-center">
              <div
                id="folder-menu"
                className={
                  isNewFol ? "dropdown show dropDownStyle" : "dropdown"
                }
                onClick={() => setIsNewFol(!isNewFol)}
              >
                <div className="sort" data-tut="reactourSecond">
                  <i
                    className="fa-light fa-plus-square"
                    aria-hidden="true"
                    style={{ fontSize: "25px", color: `${iconColor}` }}
                  ></i>
                </div>
                <div
                  className={isNewFol ? "dropdown-menu show" : "dropdown-menu"}
                  aria-labelledby="dropdownMenuButton"
                  aria-expanded={isNewFol ? "true" : "false"}
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
                      Create folder
                    </span>
                    <span
                      className="dropdown-item text-[10px] md:text-[13px]"
                      onClick={() => navigate("/form/sHAnZphf69")}
                    >
                      <i className="fa-light fa-pen-nib mr-[5px]"></i>
                      Sign Yourself
                    </span>
                    <span
                      className="dropdown-item text-[10px] md:text-[13px]"
                      onClick={() => navigate("/form/8mZzFxbG1z")}
                    >
                      <i className="fa-light fa-file-signature mr-[5px]"></i>
                      Request Signatures
                    </span>
                  </div>
                </div>
              </div>
              <div
                id="menu-container"
                className={isShowSort ? "dropdown show" : "dropdown"}
                onClick={() => setIsShowSort(!isShowSort)}
              >
                <div
                  data-tut="reactourThird"
                  className="sort "
                  data-toggle="dropdown"
                >
                  <i
                    className="fa-light fa-sort-amount-asc mr-[5px] text-[14px]"
                    aria-hidden="true"
                    style={{ color: `${iconColor}` }}
                  ></i>
                  <span style={{ fontSize: "15px", color: `${iconColor}` }}>
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
                  {sortingValue.map((value, ind) => {
                    return (
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
                          <i
                            className="fa-light fa-check"
                            aria-hidden="true"
                          ></i>
                        )}
                        <span className="ml-[5px]">{value}</span>
                      </span>
                    );
                  })}

                  <hr className="hrStyle" />
                  {sortOrder.map((order, ind) => {
                    return (
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
                          <i
                            className="fa-light fa-check"
                            aria-hidden="true"
                          ></i>
                        )}
                        <span className="ml-[5px]">{order}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                {isList ? (
                  <div className="sort" onClick={() => setIsList(!isList)}>
                    <i
                      onClick={() => setIsList(!isList)}
                      className="fa-light fa-th-large"
                      style={{ fontSize: "24px", color: `${iconColor}` }}
                      aria-hidden="true"
                    ></i>
                  </div>
                ) : (
                  <div
                    data-tut="reactourForth"
                    className="sort"
                    onClick={() => setIsList(!isList)}
                  >
                    <i
                      className="fa-light fa-list"
                      aria-hidden="true"
                      style={{ fontSize: "23px", color: `${iconColor}` }}
                    ></i>
                  </div>
                )}
              </div>
            </div>
          </div>

          {pdfData && pdfData.length === 0 ? (
            <div className="flex justify-center items-center w-full h-[50vh]">
              <span className="text-base-content font-bold">
                No Data Found!
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
                {loading && (
                  <div className="text-center pb-[20px]">Loading...</div>
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
