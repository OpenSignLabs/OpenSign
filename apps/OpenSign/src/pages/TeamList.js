import React, { useEffect, useState } from "react";
import Parse from "parse";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";
import { useLocation } from "react-router-dom";
import Tooltip from "../primitives/Tooltip";
import ModalUi from "../primitives/ModalUi";
import pad from "../assets/images/pad.svg";
import AddTeam from "../components/AddTeam";
import { isEnableSubscription } from "../constant/const";
import { checkIsSubscribedTeam } from "../constant/Utils";
import SubscribeCard from "../primitives/SubscribeCard";
import Title from "../components/Title";

const heading = ["Sr.No", "Name", "Parent Team", "Active"];
const actions = [
  {
    btnId: "1231",
    hoverLabel: "Edit",
    btnColor: "op-btn-primary",
    btnIcon: "fa-light fa-pen",
    redirectUrl: "",
    action: "edit"
  }
];

const TeamList = () => {
  const recordperPage = 10;
  const [teamList, setTeamList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const location = useLocation();
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [isActiveModal, setIsActiveModal] = useState({});
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const [isActLoader, setIsActLoader] = useState({});
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [isEditModal, setIsEditModal] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const startIndex = (currentPage - 1) * recordperPage; // user per page

  const getPaginationRange = () => {
    const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
    const pages = [];
    const totalPages = Math.ceil(teamList.length / recordperPage);
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
    fetchTeamList();
  }, []);
  async function fetchTeamList() {
    try {
      setIsLoader(true);
      if (isEnableSubscription) {
        const getIsSubscribe = await checkIsSubscribedTeam();
        setIsSubscribe(getIsSubscribe);
      }
      const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      if (extUser) {
        const admin =
          extUser?.UserRole &&
          (extUser?.UserRole === "contracts_Admin" ||
            extUser?.UserRole === "contracts_OrgAdmin")
            ? true
            : false;
        setIsAdmin(admin);
      }
      const teamCls = new Parse.Query("contracts_Teams");
      teamCls.equalTo("OrganizationId", {
        __type: "Pointer",
        className: "contracts_Organizations",
        objectId: extUser.OrganizationId.objectId
      });
      teamCls.descending("createdAt");
      const teamRes = await teamCls.find();
      if (teamRes.length > 0) {
        const _teamRes = JSON.parse(JSON.stringify(teamRes));
        setTeamList(_teamRes);
      }
    } catch (err) {
      console.log("Err in fetch teamlist", err);
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
  // Get current list
  const indexOfLastDoc = currentPage * recordperPage;
  const indexOfFirstDoc = indexOfLastDoc - recordperPage;
  const currentList = teamList?.slice(indexOfFirstDoc, indexOfLastDoc);

  const handleClose = () => {
    setIsActiveModal({});
    setIsEditModal({});
  };

  // Change page
  const paginateFront = () => setCurrentPage(currentPage + 1);
  const paginateBack = () => setCurrentPage(currentPage - 1);
  const handleActionBtn = (act, item) => {
    if (act.action === "edit") {
      setIsEditModal({ [item.objectId]: true });
    }
  };
  const handleToggleBtn = (team) => {
    setIsActiveModal({ [team.objectId]: true });
  };
  const handleToggleSubmit = async (team) => {
    const index = teamList.findIndex((obj) => obj.objectId === team.objectId);
    if (index !== -1) {
      setIsActiveModal({});
      setIsActLoader({ [team.objectId]: true });
      const newArray = [...teamList];
      const IsActive = newArray[index].IsActive;
      newArray[index] = { ...newArray[index], IsActive: !IsActive };
      setTeamList(newArray);
      try {
        const teamCls = new Parse.Object("contracts_Teams");
        teamCls.id = team.objectId;
        teamCls.set("IsActive", !IsActive);
        await teamCls.save();
        setIsAlert({
          type: !IsActive === false ? "danger" : "success",
          msg: !IsActive === false ? "Team disabled." : "Team enabled."
        });
      } catch (err) {
        setIsAlert({ type: "danger", msg: "something went wrong." });
        console.log("err in disable team", err);
      } finally {
        setIsActLoader({});
        setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
      }
    }
  };
  const handleTeamInfo = (team) => {
    setTeamList((prev) => [team, ...prev]);
  };
  const handleEditChange = (e, team) => {
    const index = teamList.findIndex((obj) => obj.objectId === team.objectId);
    if (index !== -1) {
      const newArray = [...teamList];
      newArray[index] = { ...newArray[index], Name: e.target.value };
      setTeamList(newArray);
    }
  };
  const updateTeamName = async (e, team) => {
    e.preventDefault();
    e.stopPropagation();
    setIsActLoader({ [team.objectId]: true });
    setIsEditModal({});
    try {
      const teamCls = new Parse.Object("contracts_Teams");
      teamCls.id = team?.objectId;
      teamCls.set("Name", team.Name);
      await teamCls.save();
      setIsAlert({ type: "success", msg: "Team Update successfully." });
    } catch (Err) {
      console.log("Err in update team name"), Err;
      setIsAlert({ type: "danger", msg: "Something went wrong." });
    } finally {
      setIsActLoader({});
      setTimeout(() => setIsAlert({ type: "success", msg: "" }), 1500);
    }
  };
  return (
    <div className="relative">
      <Title title={"Teams"} />
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
        <>
          {isAdmin ? (
            <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
              {isAlert.msg && (
                <Alert type={isAlert.type}>
                  <div className="ml-3">{isAlert.msg}</div>
                </Alert>
              )}
              <div className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]">
                <div className="font-light">
                  Teams{" "}
                  <span className="text-xs md:text-[13px] font-normal">
                    <Tooltip message={"Teams"} />
                  </span>
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => handleFormModal()}
                >
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
                    {teamList?.length > 0 && (
                      <>
                        {currentList.map((item, index) => (
                          <tr className="border-y-[1px]" key={index}>
                            {heading.includes("Sr.No") && (
                              <th className="px-4 py-2">
                                {startIndex + index + 1}
                              </th>
                            )}
                            <td className="px-4 py-2 font-semibold">
                              {item?.Name}
                            </td>
                            <td className="px-4 py-2 font-semibold">
                              {item?.ParentId?.Name || "-"}
                            </td>
                            <td className="px-4 py-2 font-semibold">
                              {item?.Name !== "All Users" && (
                                <>
                                  <label className="cursor-pointer relative block items-center mb-0">
                                    <input
                                      type="checkbox"
                                      className="op-toggle transition-all op-toggle-secondary"
                                      checked={item?.IsActive}
                                      onChange={() => handleToggleBtn(item)}
                                    />
                                  </label>
                                  {isActiveModal[item.objectId] && (
                                    <ModalUi
                                      isOpen
                                      title={"Team status"}
                                      handleClose={handleClose}
                                    >
                                      <div className="m-[20px]">
                                        <div className="text-lg font-normal text-black">
                                          Are you sure you want to{" "}
                                          {item?.IsActive
                                            ? "disable"
                                            : "enable"}{" "}
                                          this team?
                                        </div>
                                        <hr className="bg-[#ccc] mt-4 " />
                                        <div className="flex items-center mt-3 gap-2 text-white">
                                          <button
                                            onClick={() =>
                                              handleToggleSubmit(item)
                                            }
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
                                </>
                              )}
                            </td>
                            <td className="px-3 py-2 text-white flex flex-wrap gap-1">
                              {item?.Name !== "All Users" && (
                                <>
                                  {actions?.length > 0 &&
                                    actions.map((act, index) => (
                                      <button
                                        key={index}
                                        onClick={() =>
                                          handleActionBtn(act, item)
                                        }
                                        title={act.hoverLabel}
                                        className={`${
                                          act?.btnColor ? act.btnColor : ""
                                        } op-btn op-btn-sm w-[50px]`}
                                      >
                                        <i className={act.btnIcon}></i>
                                      </button>
                                    ))}
                                  {isEditModal[item.objectId] && (
                                    <ModalUi
                                      isOpen
                                      title={"Edit Team"}
                                      handleClose={handleClose}
                                    >
                                      <form
                                        className="m-[20px]"
                                        onSubmit={(e) =>
                                          updateTeamName(e, item)
                                        }
                                      >
                                        <label className="text-xs font-semibold text-base-content ml-1">
                                          Name of Team{" "}
                                          <span className="text-[red] text-[13px]">
                                            *
                                          </span>
                                        </label>
                                        <input
                                          className="op-input op-input-bordered op-input-sm focus:outline-none hover:border-base-content text-base-content w-full text-xs"
                                          value={item.Name}
                                          onChange={(e) =>
                                            handleEditChange(e, item)
                                          }
                                          required
                                        />
                                        <button
                                          type="submit"
                                          className="op-btn op-btn-primary mt-3"
                                        >
                                          Save
                                        </button>
                                      </form>
                                    </ModalUi>
                                  )}
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="op-join flex flex-wrap items-center p-2">
                {teamList.length > recordperPage && (
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
                {teamList.length > recordperPage && (
                  <button
                    onClick={() => paginateFront()}
                    className="op-join-item op-btn op-btn-sm"
                  >
                    Next
                  </button>
                )}
              </div>
              {teamList?.length <= 0 && (
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
                title={"Add Team"}
                isOpen={isModal}
                handleClose={handleFormModal}
              >
                <AddTeam
                  setIsAlert={setIsAlert}
                  handleTeamInfo={handleTeamInfo}
                  closePopup={handleFormModal}
                />
              </ModalUi>
            </div>
          ) : (
            <div className="flex items-center justify-center h-screen w-full bg-base-100 text-base-content rounded-box">
              <div className="text-center">
                <h1 className="text-[60px] lg:text-[120px] font-semibold">
                  404
                </h1>
                <p className="text-[30px] lg:text-[50px]">Page Not Found</p>
              </div>
            </div>
          )}
        </>
      )}
      {!isSubscribe && isEnableSubscription && !isLoader && (
        <div data-tut="apisubscribe">
          <SubscribeCard plan={"TEAMS"} price={"20"} />
        </div>
      )}
    </div>
  );
};

export default TeamList;
