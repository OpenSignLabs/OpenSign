import React, { useEffect, useState } from "react";
import Parse from "parse";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";
import { useLocation } from "react-router-dom";
import ModalUi from "../primitives/ModalUi";
import pad from "../assets/images/pad.svg";
import Tooltip from "../primitives/Tooltip";
import AddUser from "../components/AddUser";
import SubscribeCard from "../primitives/SubscribeCard";
import { isEnableSubscription } from "../constant/const";
import { checkIsSubscribedTeam } from "../constant/Utils";
const heading = [
  "Sr.No",
  "Name",
  "Email",
  "Phone",
  "Role",
  "Department",
  "Is-Active"
];
// const actions = [];
const UserList = () => {
  const [userList, setUserList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const location = useLocation();
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isActiveModal, setIsActiveModal] = useState({});
  const [isActLoader, setIsActLoader] = useState({});
  const [isSubscribe, setIsSubscribe] = useState(false);
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
  useEffect(() => {
    fetchUserList();
  }, []);
  async function fetchUserList() {
    try {
      setIsLoader(true);
      if (isEnableSubscription) {
        const getIsSubscribe = await checkIsSubscribedTeam();
        setIsSubscribe(getIsSubscribe);
      }
      const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      const res = await Parse.Cloud.run("getuserlistbyorg", {
        organizationId: extUser.OrganizationId.objectId
      });
      const _userRes = JSON.parse(JSON.stringify(res));
      setUserList(_userRes);
    } catch (err) {
      console.log("Err in fetch userlist", err);
      setIsAlert({ type: "danger", msg: "Something went wrong." });
    } finally {
      setTimeout(() => {
        setIsAlert({ type: "success", msg: "" });
      }, 1500);
      setIsLoader(false);
    }
  }
  const handleFormModal = () => {
    setIsModal(!isModal);
  };

  // Change page
  const paginateFront = () => setCurrentPage(currentPage + 1);
  const paginateBack = () => setCurrentPage(currentPage - 1);
  // const handleActionBtn = (act, item) => {
  //   if (act.action === "delete") {
  //     setIsDeleteModal({ [item.objectId]: true });
  //   }
  // };
  const handleUserData = (userData) => {
    setUserList((prev) => [userData, ...prev]);
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
  const handleClose = () => {
    setIsActiveModal({});
  };
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
        setIsAlert({
          type: "success",
          msg: "User disabled successfully."
        });
      } catch (err) {
        setIsAlert({ type: "danger", msg: "something went wrong." });
        console.log("err in disable department", err);
      } finally {
        setIsActLoader({});
        setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
      }
    }
  };
  const handleToggleBtn = (user) => {
    setIsActiveModal({ [user.objectId]: true });
  };
  return (
    <div className="relative">
      {isLoader && (
        <div className="absolute w-full h-[300px] md:h-[400px] flex justify-center items-center z-30 rounded-box">
          <Loader />
        </div>
      )}
      {Object.keys(isActLoader)?.length > 0 && (
        <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30 rounded-box">
          <Loader />
        </div>
      )}
      {isSubscribe && isEnableSubscription && !isLoader && (
        <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
          {isAlert.msg && (
            <Alert type={isAlert.type}>
              <div className="ml-3">{isAlert.msg}</div>
            </Alert>
          )}
          <div className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]">
            <div className="font-light">
              User list{" "}
              <span className="text-xs md:text-[13px] font-normal">
                <Tooltip message={"user list from departments"} />
              </span>
            </div>
            <div className="cursor-pointer" onClick={() => handleFormModal()}>
              <i className="fa-light fa-square-plus text-accent text-[40px]"></i>
            </div>
          </div>
          <div className={` overflow-x-auto w-full`}>
            <table className="op-table border-collapse w-full">
              <thead className="text-[14px]">
                <tr className="border-y-[1px]">
                  {heading?.map((item, index) => (
                    <React.Fragment key={index}>
                      <th className="px-4 py-2">{item}</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {userList?.length > 0 && (
                  <>
                    {userList.map((item, index) => (
                      <tr className="border-y-[1px]" key={index}>
                        {heading.includes("Sr.No") && (
                          <th className="px-4 py-2">
                            {startIndex + index + 1}
                          </th>
                        )}
                        <td className="px-4 py-2 font-semibold">
                          {item?.Name}{" "}
                        </td>
                        <td className="px-4 py-2 ">{item?.Email || "-"}</td>
                        <td className="px-4 py-2">{item?.Phone || "-"}</td>
                        <td className="px-4 py-2">
                          {item?.UserRole?.split("_").pop() || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {formatRow(item.DepartmentIds)}
                        </td>
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
                              title={"User status"}
                              handleClose={handleClose}
                            >
                              <div className="m-[20px]">
                                <div className="text-lg font-normal text-black">
                                  Are you sure you want to deactivate this user?
                                </div>
                                <hr className="bg-[#ccc] mt-4 " />
                                <div className="flex items-center mt-3 gap-2 text-white">
                                  <button
                                    onClick={() => handleToggleSubmit(item)}
                                    className="op-btn op-btn-primary"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={handleClose}
                                    className="op-btn op-btn-secondary"
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            </ModalUi>
                          )}
                        </td>
                        {/* <td className="px-3 py-2 text-white grid grid-cols-2">
                        {actions?.length > 0 &&
                          actions.map((act, index) => (
                            <button
                              key={index}
                              onClick={() => handleActionBtn(act, item)}
                              title={act.hoverLabel}
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
                            title={"Delete User"}
                            handleClose={handleClose}
                          >
                            <div className="m-[20px]">
                              <div className="text-lg font-normal text-black">
                                Are you sure you want to delete this user?
                              </div>
                              <hr className="bg-[#ccc] mt-4 " />
                              <div className="flex items-center mt-3 gap-2 text-white">
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="op-btn op-btn-primary"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={handleClose}
                                  className="op-btn op-btn-secondary"
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </ModalUi>
                        )}
                      </td> */}
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="op-join flex flex-wrap items-center p-2">
            {userList.length > recordperPage && (
              <button
                onClick={() => paginateBack()}
                className="op-join-item op-btn op-btn-sm"
              >
                Prev
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
                Next
              </button>
            )}
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
              <div className="text-sm font-semibold">No Data Available</div>
            </div>
          )}
          <ModalUi
            title={"Add User"}
            isOpen={isModal}
            handleClose={handleFormModal}
          >
            <AddUser
              handleUserData={handleUserData}
              closePopup={handleFormModal}
            />
          </ModalUi>
        </div>
      )}
      {!isSubscribe && isEnableSubscription && !isLoader && (
        <div data-tut="apisubscribe">
          <SubscribeCard plan={"TEAM"} />
        </div>
      )}
    </div>
  );
};

export default UserList;
