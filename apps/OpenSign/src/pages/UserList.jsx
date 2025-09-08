import React, { useEffect, useState } from "react";
import Parse from "parse";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";
import { useLocation } from "react-router";
import ModalUi from "../primitives/ModalUi";
import pad from "../assets/images/pad.svg";
import Tooltip from "../primitives/Tooltip";
import AddUser from "../components/AddUser";
import {
  useTranslation
} from "react-i18next";
import DeleteUserModal from "../primitives/DeleteUserModal";
import axios from "axios";

const actions = [
  {
    btnId: "4741",
    hoverLabel: "Delete",
    btnColor: "op-btn-secondary",
    btnIcon: "fa-light fa-trash",
    redirectUrl: "",
    action: "delete",
    restrictAdmin: true
  },
];
const heading = ["Sr.No", "Name", "Email", "Phone", "Role", "Team", "Active"];
const UserList = () => {
  const { t } = useTranslation();
  const [userList, setUserList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [isModal, setIsModal] = useState({
    form: false,
    addseats: false,
    options: false
  });
  const location = useLocation();
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isActiveModal, setIsActiveModal] = useState({});
  const [isActLoader, setIsActLoader] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [formHeader, setFormHeader] = useState(t("add-user"));
  const [deleteUserRes, setDeleteUserRes] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isActModal, setIsActModal] = useState({});
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const recordperPage = 10;
  const startIndex = (currentPage - 1) * recordperPage; // user per page

  const getPaginationRange = () => {
    const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
    const pages = [];
    const totalPages = Math.ceil(userList.length / recordperPage);
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
  const pageNumbers = getPaginationRange();
  // to slice out 10 objects from array for current page
  const indexOfLastDoc = currentPage * recordperPage;
  const indexOfFirstDoc = indexOfLastDoc - recordperPage;
  const currentList = userList?.slice(indexOfFirstDoc, indexOfLastDoc);
  useEffect(() => {
    fetchUserList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function fetchUserList() {
    try {
      setIsLoader(true);
      const extUser =
        localStorage.getItem("Extand_Class") &&
        JSON.parse(localStorage.getItem("Extand_Class"))?.[0];

      if (extUser) {
        const admin =
          extUser?.UserRole &&
          (extUser?.UserRole === "contracts_Admin" ||
            extUser?.UserRole === "contracts_OrgAdmin")
            ? true
            : false;
        setIsAdmin(admin);
      }
      const res = await Parse.Cloud.run("getuserlistbyorg", {
        organizationId: extUser.OrganizationId.objectId
      });
      const _userRes = JSON.parse(JSON.stringify(res));
      setUserList(_userRes);
    } catch (err) {
      console.log("Err in fetch userlist", err);
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
      setIsLoader(false);
    }
  }
  const handleModal = (modalName) => {
    setIsModal((obj) => ({ ...obj, [modalName]: !obj[modalName] }));
  };

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

  const handleUserData = (userData) => {
    if (userData) {
      setUserList((prev) => [userData, ...prev]);
    }
  };
  // `formatRow` is used to show data in poper manner like
  // if data is of array type then it will join array items with ","
  // if data is of object type then it Name values will be show in row
  // if no data available it will show hyphen "-"
  const formatRow = (row) => {
    if (Array.isArray(row)) {
      let updateArr = row.map((x) => x.Name);
      return updateArr.join(", ");
    } else if (typeof row === "object" && row !== null) {
      return row?.Name || "-";
    } else {
      return "-";
    }
  };
  const handleClose = () => setIsActiveModal({});

  const handleToggleSubmit = async (user) => {
    const index = userList.findIndex((obj) => obj.objectId === user.objectId);
    if (index !== -1) {
      setIsActiveModal({});
      setIsActLoader({ [user.objectId]: true });
      const newArray = [...userList];
      const IsDisabled = newArray[index]?.IsDisabled;
      newArray[index] = { ...newArray[index], IsDisabled: !IsDisabled };
      setUserList(newArray);
      try {
        const extUser = new Parse.Object("contracts_Users");
        extUser.id = user.objectId;
        extUser.set("IsDisabled", !IsDisabled);
        await extUser.save();
        showAlert(
          !IsDisabled === true ? "danger" : "success",
          !IsDisabled === true ? t("user-deactivated") : t("user-activated")
        );
      } catch (err) {
        showAlert("danger", t("something-went-wrong-mssg"));
        console.log("err in disable team", err);
      } finally {
        setIsActLoader({});
      }
    }
  };
  const handleToggleBtn = (user) => {
    setIsActiveModal({ [user.objectId]: true });
  };

  // `showAlert` handle show/hide alert
  const showAlert = (type, msg) => {
    setIsAlert({ type, msg });
    setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
  };

  const handleDeleteAccount = async (item) => {
    setDeleting(true);
    if (item?.UserId?.objectId) {
      const url = localStorage.getItem("baseUrl")?.replace(/\/app\/?$/, "/");
      const deleteUrl = `${url}deleteuser/${item.UserId.objectId}`;
      try {
        await axios.post(deleteUrl, null, {
          headers: { sessiontoken: localStorage.getItem("accesstoken") }
        });
        setUserList((prev) =>
          prev.filter((user) => user.objectId !== item.objectId)
        );
        showAlert("success", t("user-deleted-successfully"));
      } catch (err) {
        const message = err?.response?.data?.message || err?.message;
        setDeleteUserRes(message);
        showAlert("danger", message);
        console.log("Err in deleteuser acc", err);
      } finally {
        setDeleting(false);
      }
    } else {
      showAlert("danger", t("something-went-wrong-mssg"));
      setDeleteUserRes(t("something-went-wrong-mssg"));
      setDeleting(false);
    }
  };
  const handleCloseModal = () => {
    setIsActModal({});
    setDeleteUserRes("");
    setDeleting(false);
  };

  const handleActionBtn = async (act, item) => {
    if (act.action === "delete") {
      setIsActModal({ [`delete_${item.objectId}`]: true });
    }
  };
  const handleBtnVisibility = (act, item) => {
    if (act.restrictAdmin) {
      return item?.objectId !== extClass?.[0]?.objectId;
    } else if (
      act.restrictBtn === true &&
      item?.objectId === extClass?.[0]?.objectId
    ) {
      return true;
    } else {
      return true;
    }
  };
  return (
    <div className="relative">
      {isLoader && (
        <div className="absolute w-full h-[300px] md:h-[400px] flex justify-center items-center z-30 rounded-box">
          <Loader />
        </div>
      )}
      {Object.keys(isActLoader)?.length > 0 && (
        <div className="absolute w-full h-full flex justify-center items-center bg-black/30 z-30 rounded-box">
          <Loader />
        </div>
      )}

      {
          !isLoader && (
            <>
              {isAdmin ? (
                <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
                  {isAlert.msg && (
                    <Alert type={isAlert.type}>{isAlert.msg}</Alert>
                  )}
                  <div className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]">
                    <div className="font-light">
                      {t("report-name.Users")}{" "}
                      <span className="text-xs md:text-[13px] font-normal">
                        <Tooltip message={t("users-from-teams")} />
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleModal("form")}
                      >
                        <i className="fa-light fa-square-plus text-accent text-[30px] md:text-[40px]"></i>
                      </div>
                    </div>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <table className="op-table border-collapse w-full mb-[50px]">
                      <thead className="text-[14px]">
                        <tr className="border-y-[1px]">
                          {heading?.map((item, index) => (
                            <th key={index} className="px-4 py-2">
                              {t(`report-heading.${item}`)}
                            </th>
                          ))}
                          {actions?.length > 0 && (
                            <th className="p-2 text-transparent pointer-events-none">
                              {t("action")}
                            </th>
                          )}
                        </tr>
                      </thead>
                      {userList?.length > 0 && (
                        <tbody className="text-[12px]">
                          {currentList.map((item, index) => (
                            <tr className="border-y-[1px]" key={index}>
                              {heading.includes("Sr.No") && (
                                <th className="px-4 py-2">
                                  {startIndex + index + 1}
                                </th>
                              )}
                              <td className="px-4 py-2 font-semibold">
                                {item?.Name}{" "}
                              </td>
                              <td className="px-4 py-2 ">
                                {item?.Email || "-"}
                              </td>
                              <td className="px-4 py-2">
                                {item?.Phone || "-"}
                              </td>
                              <td className="px-4 py-2">
                                {item?.UserRole?.split("_").pop() || "-"}
                              </td>
                              <td className="px-4 py-2">
                                {formatRow(item.TeamIds)}
                              </td>
                              {item.UserRole !== "contracts_Admin" ? (
                                <td className="px-4 py-2 font-semibold">
                                  <label className="cursor-pointer relative block items-center mb-0">
                                    <input
                                      type="checkbox"
                                      className="op-toggle transition-all op-toggle-secondary"
                                      checked={item?.IsDisabled !== true}
                                      onChange={() => handleToggleBtn(item)}
                                    />
                                  </label>
                                  {isActiveModal[item.objectId] && (
                                    <ModalUi
                                      isOpen
                                      title={t("user-status")}
                                      handleClose={handleClose}
                                    >
                                      <div className="m-[20px]">
                                        <div className="text-lg font-normal text-base-content">
                                          {t("are-you-sure")}{" "}
                                          {item?.IsDisabled
                                            ? t("activate")
                                            : t("deactivate")}{" "}
                                          {t("this-user")}?
                                        </div>
                                        <hr className="bg-[#ccc] mt-4 " />
                                        <div className="flex items-center mt-3 gap-2 text-white">
                                          <button
                                            onClick={() =>
                                              handleToggleSubmit(item)
                                            }
                                            className="op-btn op-btn-primary"
                                          >
                                            {t("yes")}
                                          </button>
                                          <button
                                            onClick={handleClose}
                                            className="op-btn op-btn-secondary"
                                          >
                                            {t("no")}
                                          </button>
                                        </div>
                                      </div>
                                    </ModalUi>
                                  )}
                                </td>
                              ) : (
                                <td className="px-4 py-2 font-semibold"></td>
                              )}

                              {isAdmin && (
                                <td className="px-3 py-2">
                                  <div className="text-base-content min-w-max flex flex-row gap-x-2 gap-y-1 justify-start items-center">
                                    {actions?.length > 0 &&
                                      actions.map((act, index) => (
                                        <React.Fragment key={index}>
                                          {handleBtnVisibility(act, item) && (
                                            <div
                                              role="button"
                                              data-tut={act?.selector}
                                              onClick={() =>
                                                handleActionBtn(act, item)
                                              }
                                              title={t(
                                                `btnLabel.${act.hoverLabel}`
                                              )}
                                              className={
                                                act.action !== "option"
                                                  ? `${act?.btnColor || ""} op-btn op-btn-sm mr-1 `
                                                  : "text-base-content focus:outline-none text-lg mr-2 relative"
                                              }
                                            >
                                              <i className={act.btnIcon}></i>
                                              {act.btnLabel && (
                                                <span className="uppercase font-medium">
                                                  {t(
                                                    `btnLabel.${act.btnLabel}`
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          <DeleteUserModal
                                            title={t("delete-account")}
                                            deleting={deleting}
                                            userEmail={item?.Email}
                                            isOpen={
                                              isActModal[
                                                "delete_" + item.objectId
                                              ]
                                            }
                                            onConfirm={() =>
                                              handleDeleteAccount(item)
                                            }
                                            deleteRes={deleteUserRes}
                                            handleClose={handleCloseModal}
                                          />
                                        </React.Fragment>
                                      ))}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      )}
                    </table>
                  </div>
                  <div className="flex flex-row justify-between items-center text-xs font-medium">
                    <div className="op-join flex flex-wrap items-center p-2">
                      {userList.length > recordperPage && (
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
                      {userList.length > recordperPage && (
                        <button
                          onClick={() => paginateFront()}
                          className="op-join-item op-btn op-btn-sm"
                        >
                          {t("next")}
                        </button>
                      )}
                    </div>
                  </div>
                  {userList?.length <= 0 && (
                    <div
                      className={`${
                        isDashboard ? "h-[317px]" : ""
                      } flex flex-col items-center justify-center w-ful bg-base-100 text-base-content rounded-xl py-4`}
                    >
                      <div className="w-[60px] h-[60px] overflow-hidden">
                        <img
                          className="w-full h-full object-contain"
                          src={pad}
                          alt="img"
                        />
                      </div>
                      <div className="text-sm font-semibold">
                        {t("no-data-avaliable")}
                      </div>
                    </div>
                  )}
                  <ModalUi
                    isOpen={isModal.form}
                    title={formHeader}
                    handleClose={() => handleModal("form")}
                  >
                    <AddUser
                      showAlert={showAlert}
                      handleUserData={handleUserData}
                      closePopup={() => handleModal("form")}
                      setFormHeader={setFormHeader}
                    />
                  </ModalUi>
                </div>
              ) : (
                <div className="flex items-center justify-center h-screen w-full bg-base-100 text-base-content rounded-box">
                  <div className="text-center">
                    <h1 className="text-[60px] lg:text-[120px] font-semibold">
                      404
                    </h1>
                    <p className="text-[30px] lg:text-[50px]">
                      {t("page-not-found")}
                    </p>
                  </div>
                </div>
              )}
            </>
          )
      }
    </div>
  );
};

export default UserList;
