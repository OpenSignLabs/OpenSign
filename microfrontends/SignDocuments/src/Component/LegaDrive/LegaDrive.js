import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./LegaDrive.css";
import loader from "../../assests/loader2.gif";
import PdfFileComponent from "./FolderDrive/legaDriveComponent";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import { themeColor, iconColor } from "../../utils/ThemeColor/backColor";
import { getDrive } from "../../utils/Utils";
import AlertComponent from "../component/alertComponent";
import { useNavigate } from "react-router-dom";

function PdfFile() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [isList, setIsList] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Date");
  const [sortingOrder, setSortingOrder] = useState("Decending");
  const [pdfData, setPdfData] = useState([]);
  const [isFolder, setIsFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState();
  const [error, setError] = useState();
  const [folderLoader, setIsFolderLoader] = useState(false);
  const [isShowSort, setIsShowSort] = useState(false);
  const [isLoading, setIsLoading] = useState({
    isLoad: true,
    message: "This might take some time"
  });
  const [docId, setDocId] = useState();
  const [handleError, setHandleError] = useState();
  const [folderName, setFolderName] = useState([]);
  const [isAlert, setIsAlert] = useState({ isShow: false, alertMessage: "" });
  const [isNewFol, setIsNewFol] = useState(false);
  const currentUser =
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    ) &&
    localStorage.getItem(
      `Parse/${localStorage.getItem("parseAppId")}/currentUser`
    );
  const jsonCurrentUser = JSON.parse(currentUser);

  useEffect(() => {
    if (docId) {
      getPdfFolderDocumentList();
    } else {
      getPdfDocumentList();
    }
  }, [docId]);

  //function for get all pdf document list
  const getPdfDocumentList = async () => {
    const load = {
      isLoad: true,
      message: "This might take some time"
    };
    setIsLoading(load);
    const driveDetails = await getDrive();
    if (driveDetails) {
      if (driveDetails.length > 0) {
        setPdfData(driveDetails);
      }
      const data = [
        {
          name: "OpenSignDrive™",
          objectId: ""
        }
      ];
      setFolderName(data);
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    } else if (driveDetails === "Error: Something went wrong!") {
      const loadObj = {
        isLoad: false
      };
      setHandleError("Error: Something went wrong!");
      setIsLoading(loadObj);
    }
  };
  //function for get parent folder document list
  const getPdfFolderDocumentList = async () => {
    const load = {
      isLoad: true,
      message: "This might take some time"
    };
    setIsLoading(load);
    const driveDetails = await getDrive(docId);
    if (driveDetails) {
      if (driveDetails.length > 0) {
        setPdfData(driveDetails);
      } else {
        setPdfData([]);
      }
      const loadObj = {
        isLoad: false
      };
      setIsLoading(loadObj);
    } else if (driveDetails === "Error: Something went wrong!") {
      const loadObj = {
        isLoad: false
      };
      setHandleError("Error: Something went wrong!");
      setIsLoading(loadObj);
    }
  };

  //function for get all pdf document list
  const getParentFolder = async () => {
    setIsFolder(true);
  };
  //function for handle folder name path
  const handleRoute = (data) => {
    let loadObj = {
      isLoad: true,
      message: "This might take some time"
    };
    if (data.name === "LegaDrive™") {
      setIsLoading(loadObj);
      if (docId) {
        setDocId();
      } else {
        setTimeout(() => {
          const loadObj = {
            isLoad: false
          };
          setIsLoading(loadObj);
        }, 1000);
      }
    } else if (data.name === folderName[folderName.length - 1].name) {
      setIsLoading(loadObj);
      setTimeout(() => {
        const loadObj = {
          isLoad: false
        };
        setIsLoading(loadObj);
      }, 1000);
    } else {
      const findIndex = folderName.findIndex(
        (fold) => fold.objectId === data.objectId
      );
      const newFolder = folderName.slice(0, findIndex + 1);

      setFolderName(newFolder);
      const getLastId = newFolder[newFolder.length - 1];

      setDocId(getLastId.objectId);
      setIsLoading(loadObj);
    }
  };

  //function for add new folder name
  const handleFolderName = (e) => {
    setError();
    const value = e.target.value;
    setNewFolderName(value);
  };
  //function for add folder
  const handleAddFolder = async () => {
    if (newFolderName) {
      setIsFolderLoader(true);

      const getParentObjId = folderName[folderName.length - 1];
      const parentId = getParentObjId && getParentObjId.objectId;
      let data;
      if (parentId) {
        data = {
          Name: newFolderName,
          Type: "Folder",
          Folder: {
            __type: "Pointer",
            className: `${localStorage.getItem("_appName")}_Document`,
            objectId: parentId
          },
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: jsonCurrentUser.objectId
          }
        };
      } else {
        data = {
          Name: newFolderName,
          Type: "Folder",
          CreatedBy: {
            __type: "Pointer",
            className: "_User",
            objectId: jsonCurrentUser.objectId
          }
        };
      }

      await axios
        .post(
          `${localStorage.getItem("baseUrl")}classes/${localStorage.getItem(
            "_appName"
          )}_Document`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
              "X-Parse-Session-Token": localStorage.getItem("accesstoken")
            }
          }
        )

        .then((Listdata) => {
          // console.log("Listdata ", Listdata);
          const json = Listdata.data;
          // console.log("json ", json);
          if (json) {
            setNewFolderName();

            setIsFolderLoader(false);
            setIsFolder(false);
            if (docId) {
              getPdfFolderDocumentList();
            } else {
              getPdfDocumentList();
            }
          }
        })
        .catch((err) => {
          setIsAlert({
            isShow: true,
            alertMessage: "something went wrong"
          });
        });
    } else {
      setError("Please fill out this field");
    }
  };

  const sortingApp = (appInfo, type, order) => {
    if (type === "Name") {
      if (order === "Accending") {
        return appInfo.sort((a, b) => (a.Name > b.Name ? 1 : -1));
      } else if (order === "Decending") {
        return appInfo.sort((a, b) => (a.Name > b.Name ? -1 : 1));
      }
    } else if (type === "Date") {
      if (order === "Accending") {
        return appInfo.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
      } else if (order === "Decending") {
        return appInfo.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
      }
    }
  };

  const sortApps = () => {
    const selectedSortType = selectedSort;
    const sortOrder = sortingOrder;

    let sortingData = pdfData;
    if (selectedSortType === "Name") {
      sortingApp(sortingData, "Name", sortOrder);
    } else if (selectedSortType === "Date") {
      sortingApp(sortingData, "Date", sortOrder);
    }

    setPdfData(sortingData);
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
        setIsShowSort(false);
      } else if (isNewFol && !e.target.closest("#folder-menu")) {
        setIsNewFol(false);
      }
    };

    document.addEventListener("click", closeMenuOnOutsideClick);

    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener("click", closeMenuOnOutsideClick);
    };
  }, [isShowSort]);

  return (
    <div className="folderComponent ">
      <div>
        <AlertComponent
          isShow={isAlert.isShow}
          alertMessage={isAlert.alertMessage}
          setIsAlert={setIsAlert}
        />
        <Modal show={isFolder}>
          <ModalHeader style={{ background: themeColor() }}>
            <span style={{ color: "white" }}>Add New Folder</span>
            {!folderLoader && (
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setNewFolderName("");
                  setIsFolder(false);
                }}
              >
                X
              </span>
            )}
          </ModalHeader>

          <Modal.Body>
            {folderLoader ? (
              <div
                style={{
                  height: "200px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <img
                  alt="loader img"
                  src={loader}
                  style={{ width: "50px", height: "50px" }}
                />
                <span style={{ fontSize: "13px", color: "gray" }}>
                  Loading...
                </span>
              </div>
            ) : (
              <form style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    margin: "10px 0px 10px 0px",
                    fontSize: "15px",
                    fontWeight: "400"
                  }}
                >
                  Name*
                </label>

                <input
                  required
                  className="form-control"
                  type="text"
                  value={newFolderName}
                  onChange={(e) => handleFolderName(e)}
                  // className="addFolderInput"
                />
                <span style={{ color: "red", fontSize: "12px" }}>{error}</span>

                <div
                  style={{
                    margin: "20px 10px 10px 10px ",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                    alignContent: "flex-end"
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      borderRadius: "0px",
                      border: "1.5px solid #e3e2e1",
                      fontWeight: "600",
                      color: "black"
                    }}
                    className="finishBtn"
                    onClick={() => setIsFolder(false)}
                  >
                    Close
                  </button>

                  <button
                    onClick={() => handleAddFolder()}
                    style={{
                      background: themeColor()
                    }}
                    type="button"
                    className="finishBtn"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}
          </Modal.Body>
        </Modal>

        {isLoading.isLoad ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              width: "100%",
              flexDirection: "column"
            }}
          >
            <img
              alt="loader img"
              src={loader}
              style={{ width: "80px", height: "80px" }}
            />
            <span style={{ fontSize: "13px", color: "gray" }}>
              {isLoading.message}
            </span>
          </div>
        ) : handleError ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              width: "100%"
            }}
          >
            <span style={{ fontSize: "20px", color: "gray" }}>
              {handleError}
            </span>
          </div>
        ) : (
          <>
            <div className="folderContainer">
              <div
                onMouseEnter={(e) => handleMouseEnter(e)}
                ref={scrollRef}
                style={{
                  width: "100%"
                }}
                className="folderPath"
              >
                {folderName.map((data, id) => {
                  return (
                    <span
                      key={id}
                      onClick={() => handleRoute(data)}
                      style={{
                        color: "#a64b4e",
                        fontWeight: "400",
                        cursor: "pointer"
                      }}
                    >
                      {data.name}
                      <span
                        style={{
                          color: "#a64b4e",
                          fontWeight: "200",
                          cursor: "pointer",
                          margin: "0 4px"
                        }}
                      >
                        &gt;
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className="dropMenuBD">
                <div
                  id="folder-menu"
                  className={isNewFol ? "dropdown show" : "dropdown"}
                  onClick={() => setIsNewFol(!isNewFol)}
                >
                  <div className="sort">
                    <i
                      className="fa fa-plus-square"
                      aria-hidden="true"
                      style={{ fontSize: "25px", color: `${iconColor()}` }}
                    ></i>
                  </div>
                  <div
                    className={
                      isNewFol ? "dropdown-menu show" : "dropdown-menu"
                    }
                    aria-labelledby="dropdownMenuButton"
                    aria-expanded={isNewFol ? "true" : "false"}
                  >
                    {" "}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column"
                      }}
                    >
                      <span
                        className="dropdown-item itemColor"
                        onClick={() => getParentFolder()}
                      >
                        <i
                          style={{ marginRight: "5px" }}
                          className="fa fa-plus"
                          aria-hidden="true"
                        ></i>
                        Create folder
                      </span>
                      <span
                        className="dropdown-item itemColor"
                        onClick={() => navigate("/form/sHAnZphf69")}
                      >
                        <i
                          style={{ marginRight: "5px" }}
                          className="fas fa-pen-nib"
                        ></i>
                        Sign Yourself
                      </span>
                      <span
                        className="dropdown-item itemColor"
                        onClick={() => navigate("/form/8mZzFxbG1z")}
                      >
                        {" "}
                        <i
                          style={{ marginRight: "5px" }}
                          className="fa fa-file-signature"
                        ></i>
                        Request Signatures{" "}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  id="menu-container"
                  className={isShowSort ? "dropdown show" : "dropdown"}
                  onClick={() => setIsShowSort(!isShowSort)}
                >
                  <div className=" sort  " data-toggle="dropdown">
                    <i
                      className="fa fa-sort-amount-asc"
                      aria-hidden="true"
                      style={{
                        marginRight: "5px",
                        fontSize: "14px",
                        color: `${iconColor()}`
                      }}
                    ></i>
                    <span
                      style={{
                        fontSize: "15px",
                        color: `${iconColor()}`
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
                    <span
                      onClick={() => {
                        setSelectedSort("Name");
                        sortApps();
                      }}
                      className="dropdown-item itemColor"
                    >
                      {selectedSort !== "Name" ? (
                        <i
                          className="fa fa-arrow-up"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></i>
                      ) : (
                        <i
                          className="fa fa-check"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></i>
                      )}
                      Name
                    </span>
                    <span
                      onClick={() => {
                        setSelectedSort("Date");
                        sortApps();
                      }}
                      className="dropdown-item itemColor"
                    >
                      {selectedSort !== "Date" ? (
                        <i
                          className="fa fa-arrow-up"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></i>
                      ) : (
                        <i
                          className="fa fa-check"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></i>
                      )}
                      Date
                    </span>
                    <hr className="hrStyle" />
                    <span
                      onClick={() => {
                        setSortingOrder("Accending");
                        sortApps();
                      }}
                      className="dropdown-item itemColor"
                    >
                      {sortingOrder !== "Accending" ? (
                        <i
                          className="fa fa-arrow-up"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></i>
                      ) : (
                        <i
                          className="fa fa-check"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></i>
                      )}
                      Accending
                    </span>
                    <span
                      onClick={() => {
                        setSortingOrder("Decending");
                        sortApps();
                      }}
                      className="dropdown-item itemColor"
                    >
                      {sortingOrder !== "Decending" ? (
                        <i
                          className="fa fa-arrow-up"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></i>
                      ) : (
                        <i
                          className="fa fa-check"
                          aria-hidden="true"
                          style={{ marginRight: "5px" }}
                        ></i>
                      )}
                      Decending
                    </span>
                  </div>
                </div>

                <div>
                  {isList ? (
                    <div className="sort" onClick={() => setIsList(!isList)}>
                      <i
                        onClick={() => setIsList(!isList)}
                        className="fa fa-th-large"
                        style={{ fontSize: "24px", color: `${iconColor()}` }}
                        aria-hidden="true"
                      ></i>
                    </div>
                  ) : (
                    <div className="sort" onClick={() => setIsList(!isList)}>
                      <i
                        className="fa fa-list"
                        aria-hidden="true"
                        style={{ fontSize: "23px", color: `${iconColor()}` }}
                      ></i>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {pdfData && pdfData.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50vh",
                  width: "100%"
                }}
              >
                <span style={{ fontWeight: "bold" }}>No Data Found!</span>
              </div>
            ) : (
              <PdfFileComponent
                pdfData={pdfData}
                setFolderName={setFolderName}
                setIsLoading={setIsLoading}
                setDocId={setDocId}
                getPdfFolderDocumentList={getPdfFolderDocumentList}
                getPdfDocumentList={getPdfDocumentList}
                isDocId={docId}
                setPdfData={setPdfData}
                isList={isList}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PdfFile;
