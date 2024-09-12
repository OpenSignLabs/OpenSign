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
import { fetchSubscriptionInfo } from "../constant/Utils";
import Title from "../components/Title";
import { validplan } from "../json/plansArr";
import { useTranslation } from "react-i18next";
const heading = ["Sr.No", "Name", "Email", "Phone", "Role", "Team", "Active"];
// const actions = [];
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
  const [isSubscribe, setIsSubscribe] = useState({
    plan: "",
    isValid: false,
    priceperUser: 0
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [formHeader, setFormHeader] = useState(t("add-user"));
  const [usersCount, setUserCounts] = useState({ allowed: 0, totalAllowed: 0 });
  const [amount, setAmount] = useState({ quantity: 1, price: 0 });
  const [isBuyLoader, setIsBuyLoader] = useState(false);
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
      if (isEnableSubscription) {
        const subscribe = await fetchSubscriptionInfo();
        if (subscribe?.plan_code?.includes("team")) {
          const isSupAdmin =
            subscribe?.adminId && extUser?.objectId === subscribe?.adminId;
          setIsSubscribe({
            plan: subscribe.plan_code,
            isValid: true,
            adminId: subscribe.adminId,
            priceperUser: subscribe.price,
            isSuperAdmin: isSupAdmin
          });
          setAmount((prev) => ({ ...prev, price: subscribe.price }));
          try {
            const res = await Parse.Cloud.run("allowedusers");
            setUserCounts((obj) => ({
              ...obj,
              allowed: parseInt(res),
              totalAllowed: parseInt(subscribe?.totalAllowedUser) || 0
            }));
          } catch (err) {
            console.log("err while get users", err);
          }
        } else {
          setIsSubscribe({
            plan: subscribe.plan_code,
            isValid: false,
            adminId: subscribe.adminId
          });
        }
      } else {
        setIsSubscribe({ plan: "teams-yearly", isValid: true });
      }

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
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
    } finally {
      setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
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
      setUserCounts((obj) => ({
        ...obj,
        allowed: obj?.allowed > 0 ? obj.allowed - 1 : 1
      }));
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
        setIsAlert({
          type: !IsDisabled === true ? "danger" : "success",
          msg:
            !IsDisabled === true ? t("user-deactivated") : t("user-activated")
        });
      } catch (err) {
        setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
        console.log("err in disable team", err);
      } finally {
        setIsActLoader({});
        setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
      }
    }
  };
  const handleToggleBtn = (user) => {
    setIsActiveModal({ [user.objectId]: true });
  };

  const handleAddOnSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBuyLoader(true);
    try {
      const resAddon = await Parse.Cloud.run("buyaddonusers", {
        users: parseInt(amount.quantity)
      });
      if (resAddon) {
        const _resAddon = JSON.parse(JSON.stringify(resAddon));
        if (_resAddon.status === "success") {
          setUserCounts((obj) => ({
            ...obj,
            allowed: parseInt(obj.allowed) + parseInt(amount.quantity),
            totalAllowed: parseInt(_resAddon.addon)
          }));
          setAmount((obj) => ({ ...obj, quantity: 1 }));
        }
      }
    } catch (err) {
      console.log("Err in buy addon", err);
      setIsAlert({ type: "danger", msg: t("something-went-wrong-mssg") });
    } finally {
      setTimeout(() => setIsAlert({ type: "success", msg: "" }), 2000);
      setIsBuyLoader(false);
      handleModal("addseats");
    }
  };
  const handlePricePerUser = (e) => {
    const quantity = e.target.value;
    const price = e.target?.value > 0 ? isSubscribe.priceperUser * quantity : 0;
    setAmount((prev) => ({ ...prev, quantity: quantity, price: price }));
  };
  const handleBuyUsers = (allowed, totalAllowed) => {
    if (allowed && totalAllowed) {
      setUserCounts((obj) => ({
        ...obj,
        allowed: parseInt(obj.allowed) + parseInt(allowed),
        totalAllowed: parseInt(totalAllowed)
      }));
    }
  };
  return (
    <div className="relative">
      <Title title={isAdmin ? "Users" : "Page not found"} />
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
      {validplan[isSubscribe.plan] && !isLoader && (
        <>
          {isAdmin ? (
            <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
              {isAlert.msg && <Alert type={isAlert.type}>{isAlert.msg}</Alert>}
              <div className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]">
                <div className="font-light">
                  {t("report-name.Users")}{" "}
                  <span className="text-xs md:text-[13px] font-normal">
                    <Tooltip message={t("users-from-teams")} />
                  </span>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  {isEnableSubscription && isSubscribe?.isSuperAdmin && (
                    <div
                      className="hidden md:flex op-btn op-btn-sm h-[35px] op-btn-primary op-btn-outline text-xs mb-0.5"
                      onClick={() => handleModal("addseats")}
                    >
                      {t("buy-users")}
                    </div>
                  )}
                  <div
                    className="cursor-pointer"
                    onClick={() => handleModal("form")}
                  >
                    <i className="fa-light fa-square-plus text-accent text-[30px] md:text-[40px]"></i>
                  </div>
                  {isEnableSubscription && isSubscribe?.isSuperAdmin && (
                    <div
                      className="cursor-pointer relative md:hidden mb-0.5"
                      onClick={() => handleModal("options")}
                    >
                      <i className="fa-light fa-ellipsis-vertical fa-xl"></i>
                      {isModal?.options && (
                        <ul className="absolute -right-3 top-auto z-[70] w-max op-menu op-menu-xs shadow bg-base-100 text-base-content rounded-box border">
                          <li onClick={() => handleModal("addseats")}>
                            <span className="text-[13px] capitalize font-medium">
                              {t("buy-users")}
                            </span>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="op-table border-collapse w-full">
                  <thead className="text-[14px]">
                    <tr className="border-y-[1px]">
                      {heading?.map((item, index) => (
                        <th key={index} className="px-4 py-2">
                          {t(`report-heading.${item}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-[12px]">
                    {userList?.length > 0 && (
                      <>
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
                            <td className="px-4 py-2 ">{item?.Email || "-"}</td>
                            <td className="px-4 py-2">{item?.Phone || "-"}</td>
                            <td className="px-4 py-2">
                              {item?.UserRole?.split("_").pop() || "-"}
                            </td>
                            <td className="px-4 py-2">
                              {formatRow(item.TeamIds)}
                            </td>
                            {item.UserRole !== "contracts_Admin" && (
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
                                      <div className="text-lg font-normal text-black">
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
                            )}
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-row  justify-between items-center text-xs font-medium">
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
                {isEnableSubscription && isSubscribe?.isSuperAdmin && (
                  <div>
                    {t("available-seats")}: {usersCount.allowed}/
                    {usersCount.totalAllowed}
                  </div>
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
                  setIsAlert={setIsAlert}
                  handleUserData={handleUserData}
                  handleBuyUsers={handleBuyUsers}
                  closePopup={() => handleModal("form")}
                  setFormHeader={setFormHeader}
                />
              </ModalUi>
              <ModalUi
                isOpen={isModal.addseats}
                title="Add Seats"
                handleClose={() => handleModal("addseats")}
              >
                {isBuyLoader && (
                  <div className="absolute w-full h-full inset-0 flex justify-center items-center bg-base-content/30 z-50">
                    <Loader />
                  </div>
                )}
                <form onSubmit={handleAddOnSubmit} className=" px-3 pb-6 pt-6">
                  <div className="mb-3 flex justify-between">
                    <label
                      htmlFor="quantity"
                      className="block text-xs text-gray-700 font-semibold"
                    >
                      {t("Quantity-of-users")}
                      <span className="text-[red] text-[13px]"> *</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={amount.quantity}
                      onChange={(e) => handlePricePerUser(e)}
                      className="w-1/4 op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-xs"
                      required
                    />
                  </div>
                  <div className="mb-3 flex justify-between">
                    <label className="block text-xs text-gray-700 font-semibold">
                      {t("Price")} (1 * {isSubscribe.priceperUser})
                    </label>
                    <div className="w-1/4 flex justify-center items-center text-sm">
                      USD {amount.price}
                    </div>
                  </div>
                  <hr className="text-base-content mb-3" />
                  <button className="op-btn op-btn-primary w-full">
                    {t("Proceed")}
                  </button>
                </form>
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
      )}
      {isEnableSubscription && !validplan[isSubscribe.plan] && !isLoader && (
        <div data-tut="apisubscribe">
          <SubscribeCard plan="TEAMS" />
        </div>
      )}
    </div>
  );
};

export default UserList;
