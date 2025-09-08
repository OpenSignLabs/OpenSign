import React, { useState, useEffect, useRef } from "react";
import pad from "../../assets/images/pad.svg";
import axios from "axios";
import { useTranslation } from "react-i18next";
import EditContactForm from "./EditContactForm";
import ModalUi from "../../primitives/ModalUi";
import Alert from "../../primitives/Alert";
import Tooltip from "../../primitives/Tooltip";
import Loader from "../../primitives/Loader";
import { serverUrl_fn } from "../../constant/appinfo";
import { useElSize } from "../../hook/useElSize";
import ImportContact from "./ImportContact";
import AddContact from "../../primitives/AddContact";

const Contactbook = (props) => {
  const titleRef = useRef(null);
  const titleElement = useElSize(titleRef);
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isContactform, setIsContactform] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState({});
  const [isOption, setIsOption] = useState({});
  const [alertMsg, setAlertMsg] = useState({ type: "success", message: "" });
  const [isModal, setIsModal] = useState({});
  const [contact, setContact] = useState({
    Name: "",
    Email: "",
    Phone: "",
    JobTitle: "",
    Company: ""
  });
  const [sortOrder, setSortOrder] = useState("asc");
  const startIndex = (currentPage - 1) * props.docPerPage;
  const { isMoreDocs, setIsNextRecord } = props;

  useEffect(() => {
    if (props.isSearchResult) {
      setCurrentPage(1);
    }
  }, [props.isSearchResult]);

  const getPaginationRange = () => {
    const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
    const pages = [];
    const totalPages = Math.ceil(props.List.length / props.docPerPage);
    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

      const showLeftDots = leftSiblingIndex > 2;
      const showRightDots = rightSiblingIndex < totalPages - 2;

      const firstPageIndex = 1;
      const lastPageIndex = totalPages;

      if (!showLeftDots && showRightDots) {
        let leftItemCount = 3;
        let leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);

        pages.push(...leftRange);
        pages.push("...");
        pages.push(totalPages);
      } else if (showLeftDots && !showRightDots) {
        let rightItemCount = 3;
        let rightRange = Array.from(
          { length: rightItemCount },
          (_, i) => totalPages - rightItemCount + i + 1
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...rightRange);
      } else if (showLeftDots && showRightDots) {
        let middleRange = Array.from(
          { length: 3 },
          (_, i) => leftSiblingIndex + i
        );

        pages.push(firstPageIndex);
        pages.push("...");
        pages.push(...middleRange);
        pages.push("...");
        pages.push(lastPageIndex);
      }
    }

    return pages;
  };
  const showAlert = (type, message, time = 1500) => {
    setAlertMsg({ type: type, message: message });
    setTimeout(() => setAlertMsg({ type: "", message: "" }), time);
  };
  const pageNumbers = getPaginationRange();
  //  below useEffect reset currenpage to 1 if user change route
  useEffect(() => {
    return () => setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // below useEffect is used to render next record if IsMoreDoc is true
  // second last value of pageNumber array is same as currentPage
  useEffect(() => {
    if (isMoreDocs && pageNumbers[pageNumbers.length - 1] === currentPage) {
      setIsNextRecord(true);
    }
  }, [isMoreDocs, pageNumbers, currentPage, setIsNextRecord]);

  const handleActionBtn = async (act, item) => {
    if (act.action === "delete") {
      setIsDeleteModal({ [item.objectId]: true });
    } else if (act.action === "option") {
      setIsOption({ [item.objectId]: !isOption[item.objectId] });
    } else if (act.action === "edit") {
      setContact(item);
      setIsModal({ [`edit_${item.objectId}`]: true });
    }
  };
  // Get current list
  const indexOfLastDoc = currentPage * props.docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - props.docPerPage;
  const sortedList = React.useMemo(() => {
    const contacts = [...props.List];
    contacts.sort((a, b) => {
      const nameA = a?.Name?.toLowerCase() || "";
      const nameB = b?.Name?.toLowerCase() || "";
      if (nameA < nameB) return sortOrder === "asc" ? -1 : 1;
      if (nameA > nameB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return contacts;
  }, [props.List, sortOrder]);

  const currentList = sortedList?.slice(indexOfFirstDoc, indexOfLastDoc);

  // Change page
  const paginateFront = () => {
    const lastValue = pageNumbers?.[pageNumbers?.length - 1];
    if (currentPage < lastValue) {
      setCurrentPage(currentPage + 1);
    }
  };

  const paginateBack = () => {
    if (startIndex > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleContactFormModal = () => {
    setIsContactform(!isContactform);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleUserData = (data) => {
    props.setList((prevData) => [data, ...prevData]);
  };

  const handleDelete = async (item) => {
    setIsDeleteModal({});
    setActLoader({ [`${item.objectId}`]: true });
    try {
      const serverUrl = serverUrl_fn();
      const cls = "contracts_Contactbook";
      const url = serverUrl + `/classes/${cls}/`;
      const body = { IsDeleted: true };
      const res = await axios.put(url + item.objectId, body, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      });
      if (res.data && res.data.updatedAt) {
        setActLoader({});
        showAlert("success", t("record-delete-alert"));
        const upldatedList = props.List.filter(
          (x) => x.objectId !== item.objectId
        );
        props.setList(upldatedList);
      }
    } catch (err) {
      console.log("err", err);
      showAlert("danger", t("something-went-wrong-mssg"));
      setActLoader({});
    }
  };
  const handleClose = () => {
    setIsDeleteModal({});
  };

  // `handleImportBtn` is trigger when user click on upload icon from contactbook
  const handleImportBtn = () => {
    setIsModal({ export: true });
  };

  // `handleEditContact` is used to update contactas per old contact Id
  const handleEditContact = async (updateContact) => {
    const updateList = props.List.map((x) =>
      x.objectId === contact.objectId ? { ...x, ...updateContact } : x
    );
    props.setList(updateList);
  };
  const handleCloseModal = () => {
    setActLoader({});
    setIsModal({});
  };
  return (
    <div className="relative">
      {Object.keys(actLoader)?.length > 0 && (
        <div className="absolute w-full h-full flex justify-center items-center bg-black/30 rounded-box z-30">
          <Loader />
        </div>
      )}
      <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
        {alertMsg.message && (
          <Alert type={alertMsg.type}>{alertMsg.message}</Alert>
        )}
        <div
          ref={titleRef}
          className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]"
        >
          <div className="font-light">
            {t(`report-name.Contactbook`)}{" "}
            {props.report_help && (
              <span className="text-xs md:text-[13px] font-normal">
                <Tooltip
                  id="report_help"
                  message="t(`report-help.Contactbook`)"
                />
              </span>
            )}
          </div>
          <div className="flex flex-row justify-center items-center gap-3 mb-2">
            {/* Search input for report bigger in width */}
            {titleElement?.width > 500 && (
              <div className="flex">
                <input
                  type="search"
                  value={props.searchTerm}
                  onChange={props.handleSearchChange}
                  placeholder={t("search-contacts")}
                  onPaste={props.handleSearchPaste}
                  className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-64 text-xs"
                />
              </div>
            )}
            {/* import contact icon */}
            <div
              className="cursor-pointer flex"
              onClick={() => handleImportBtn()}
            >
              <i className="fa-light fa-upload text-[23px] md:text-[25px]"></i>
            </div>
            {/* add contact icon*/}
            <div
              className="cursor-pointer flex"
              onClick={() => handleContactFormModal()}
            >
              <i className="fa-light fa-square-plus text-accent text-[30px] md:text-[32px]"></i>
            </div>
            {/* search icon/magnifer icon */}
            {titleElement?.width < 500 && (
              <button
                className="flex justify-center items-center focus:outline-none rounded-md text-[18px]"
                aria-label="Search"
                onClick={() =>
                  props.setMobileSearchOpen(!props.mobileSearchOpen)
                }
              >
                <i className="fa-light fa-magnifying-glass"></i>
              </button>
            )}
          </div>
        </div>
        {/* Search input for report smalle in width */}
        {titleElement?.width < 500 && props.mobileSearchOpen && (
          <div className="top-full left-0 w-full px-3 pt-1 pb-3">
            <input
              type="search"
              value={props.searchTerm}
              onChange={props.handleSearchChange}
              placeholder={t("search-documents")}
              onPaste={props.handleSearchPaste}
              className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content w-full text-xs"
            />
          </div>
        )}
        <div
          className={`overflow-auto w-full border-b ${
            props.List?.length > 0
              ? "min-h-[317px]"
              : currentList?.length === props.docPerPage
                ? "h-fit"
                : "h-screen"
          }`}
        >
          <table className="op-table border-collapse w-full mb-4">
            <thead className="text-[14px] text-center">
              <tr className="border-y-[1px]">
                {props.heading?.map((item, index) => (
                  <React.Fragment key={index}>
                    <th className="text-left p-2">
                      {t(`report-heading.${item}`)}
                      {item === "Name" && (
                        <button
                          type="button"
                          onClick={toggleSortOrder}
                          className="ml-1"
                        >
                          <i
                            className={
                              sortOrder === "asc"
                                ? "fa-light fa-arrow-down-a-z"
                                : "fa-light fa-arrow-up-a-z"
                            }
                          ></i>
                        </button>
                      )}
                    </th>
                  </React.Fragment>
                ))}
                {props.actions?.length > 0 && (
                  <th className="p-2 text-transparent pointer-events-none">
                    {t("action")}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {props.List?.length > 0 &&
                currentList.map((item, index) => (
                  <tr className="last:border-none border-y-[1px]" key={index}>
                    {props.heading.includes("Sr.No") && (
                      <td className="p-2 text-left font-semibold">
                        {startIndex + index + 1}
                      </td>
                    )}
                    {props.heading.includes("Name") && (
                      <td className="p-2 text-left font-semibold">
                        {item?.Name}
                      </td>
                    )}
                    {props.heading.includes("Email") && (
                      <td className="p-2 text-left">{item?.Email ?? "-"}</td>
                    )}
                    {props.heading.includes("Phone") && (
                      <td className="p-2 text-left">{item?.Phone ?? "-"}</td>
                    )}
                    {props.heading.includes("Company") && (
                      <td className="p-2 text-left">{item?.Company ?? "-"}</td>
                    )}
                    {props.heading.includes("JobTitle") && (
                      <td className="p-2 text-left">{item?.JobTitle ?? "-"}</td>
                    )}
                    <td className="px-3 py-2">
                      <div className="text-base-content min-w-max flex flex-row gap-x-2 gap-y-1 justify-start items-center">
                        {props.actions?.length > 0 &&
                          props.actions.map((act, index) => (
                            <button
                              key={index}
                              onClick={() => handleActionBtn(act, item)}
                              title={t(`btnLabel.${act.hoverLabel}`)}
                              className={`${
                                act?.btnColor ? act.btnColor : ""
                              } op-btn op-btn-sm`}
                            >
                              <i className={act.btnIcon}></i>
                            </button>
                          ))}
                        {isDeleteModal[item.objectId] && (
                          <ModalUi
                            isOpen
                            title={t("delete-contact")}
                            handleClose={handleClose}
                          >
                            <div className="m-[20px]">
                              <div className="text-lg font-normal text-base-content">
                                {t("contact-delete-alert")}
                              </div>
                              <hr className="bg-[#ccc] mt-3" />
                              <div className="flex items-center mt-3 gap-2 text-white">
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="w-[100px] op-btn op-btn-primary"
                                >
                                  {t("yes")}
                                </button>
                                <button
                                  onClick={handleClose}
                                  className="w-[100px] op-btn op-btn-secondary"
                                >
                                  {t("no")}
                                </button>
                              </div>
                            </div>
                          </ModalUi>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {props.List?.length <= 0 && (
            <div className="flex flex-col items-center justify-center w-ful bg-base-100 text-base-content rounded-xl py-4">
              <div className="w-[60px] h-[60px] overflow-hidden">
                <img
                  className="w-full h-full object-contain"
                  src={pad}
                  alt={t("no-data-avaliable")}
                />
              </div>
              <div className="text-sm font-semibold">
                {t("no-data-avaliable")}
              </div>
            </div>
          )}
        </div>
        <div className="op-join flex flex-wrap items-center p-2">
          {props.List.length > props.docPerPage && (
            <button
              onClick={() => paginateBack()}
              className="op-join-item op-btn op-btn-sm"
            >
              {t("prev")}
            </button>
          )}
          {pageNumbers.map((x, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(x)}
              disabled={x === "..."}
              className={`${
                x === currentPage ? "op-btn-active" : ""
              } op-join-item op-btn op-btn-sm`}
            >
              {x}
            </button>
          ))}
          {props.List.length > props.docPerPage && (
            <button
              onClick={() => paginateFront()}
              className="op-join-item op-btn op-btn-sm"
            >
              {t("next")}
            </button>
          )}
        </div>
        <ModalUi
          title={t("add-contact")}
          isOpen={isContactform}
          handleClose={handleContactFormModal}
        >
          <AddContact
            isDisableTitle
            isAddYourSelfCheckbox
            details={handleUserData}
            closePopup={handleContactFormModal}
          />
        </ModalUi>
        {isModal?.["edit_" + contact.objectId] && (
          <ModalUi
            isOpen
            title={t("edit-contact")}
            handleClose={handleCloseModal}
          >
            <EditContactForm
              contact={contact}
              handleClose={handleCloseModal}
              handleEditContact={handleEditContact}
            />
          </ModalUi>
        )}
        <ModalUi
          isOpen={isModal?.export}
          title={t("bulk-import")}
          handleClose={handleCloseModal}
        >
          <div className="relative">
            {Object.keys(actLoader)?.length > 0 && (
              <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30">
                <Loader />
              </div>
            )}
            <ImportContact
              setLoader={setActLoader}
              onImport={handleCloseModal}
              showAlert={showAlert}
            />
          </div>
        </ModalUi>
      </div>
    </div>
  );
};

export default Contactbook;
