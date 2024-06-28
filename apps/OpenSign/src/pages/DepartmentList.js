import React, { useEffect, useState } from "react";
import Parse from "parse";
import Alert from "../primitives/Alert";
import Loader from "../primitives/Loader";
import { useLocation } from "react-router-dom";
import Tooltip from "../primitives/Tooltip";
import ModalUi from "../primitives/ModalUi";
import pad from "../assets/images/pad.svg";
import AddDepartment from "../components/AddDepartment";

const heading = ["Sr.No", "Name", "Parent Department", "Status"];
// const actions = [
//   {
//     btnId: "1231",
//     hoverLabel: "Edit",
//     btnColor: "op-btn-primary",
//     btnIcon: "fa-light fa-pen",
//     redirectUrl: "draftDocument",
//     action: "redirect"
//   }
// ];

const DepartmentList = () => {
  const recordperPage = 10;
  const [departmentList, setDepartmentList] = useState([]);
  const [isLoader, setIsLoader] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const location = useLocation();
  const isDashboard =
    location?.pathname === "/dashboard/35KBoSgoAK" ? true : false;
  const [currentPage, setCurrentPage] = useState(1);
  const [isActiveModal, setIsActiveModal] = useState(false);
  const [isAlert, setIsAlert] = useState({ type: "success", msg: "" });
  const startIndex = (currentPage - 1) * recordperPage; // user per page

  const getPaginationRange = () => {
    const totalPageNumbers = 7; // Adjust this value to show more/less page numbers
    const pages = [];
    const totalPages = Math.ceil(departmentList.length / recordperPage);
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
    fetchDepartmentList();
  }, []);
  async function fetchDepartmentList() {
    try {
      setIsLoader(true);
      const extUser = JSON.parse(localStorage.getItem("Extand_Class"))?.[0];
      const department = new Parse.Query("contracts_Departments");
      department.equalTo("OrganizationId", {
        __type: "Pointer",
        className: "contracts_Organizations",
        objectId: extUser.OrganizationId.objectId
      });
      const departmentRes = await department.find();
      if (departmentRes.length > 0) {
        const _departmentRes = JSON.parse(JSON.stringify(departmentRes));
        setDepartmentList(_departmentRes);
      }
    } catch (err) {
      console.log("Err in fetch departmentlist", err);
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
  const currentList = departmentList?.slice(indexOfFirstDoc, indexOfLastDoc);

  const handleClose = () => {
    setIsActiveModal({});
  };

  // Change page
  const paginateFront = () => setCurrentPage(currentPage + 1);
  const paginateBack = () => setCurrentPage(currentPage - 1);
  // const handleActionBtn = (act, item) => {
  //   // if (act.action === "delete") {
  //   //   setIsDeleteModal({ [item.objectId]: true });
  //   // }
  // };
  const handleToggleBtn = (department) => {
    setIsActiveModal({ [department.objectId]: true });
  };
  const handleToggleSubmit = (department) => {
    const index = departmentList.findIndex(
      (obj) => obj.objectId === department.objectId
    );
    if (index !== -1) {
      const newArray = [...departmentList];
      newArray[index] = {
        ...newArray[index],
        IsActive: !newArray[index].IsActive
      };
      setDepartmentList(newArray);
      setIsActiveModal({});
    }
  };
  const handleDepartmentInfo = (department) => {
    setDepartmentList((prev) => [department, ...prev]);
  };
  return (
    <div className="relative">
      {isLoader && (
        <div className="absolute w-full h-full flex justify-center items-center bg-black bg-opacity-30 z-30 rounded-box">
          <Loader />
        </div>
      )}
      <div className="p-2 w-full bg-base-100 text-base-content op-card shadow-lg">
        {isAlert && <Alert type={isAlert.type}>{isAlert.message}</Alert>}

        <div className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]">
          <div className="font-light">
            department list{" "}
            <span className="text-xs md:text-[13px] font-normal">
              <Tooltip message={"department list"} />
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
              {departmentList?.length > 0 && (
                <>
                  {currentList.map((item, index) => (
                    <tr className="border-y-[1px]" key={index}>
                      {heading.includes("Sr.No") && (
                        <th className="px-4 py-2">{startIndex + index + 1}</th>
                      )}
                      <td className="px-4 py-2 font-semibold">{item?.Name}</td>
                      <td className="px-4 py-2 font-semibold">
                        {item?.ParentId?.Name || "-"}
                      </td>
                      <td className="px-4 py-2 font-semibold">
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
                            title={"Department status"}
                            handleClose={handleClose}
                          >
                            <div className="m-[20px]">
                              <div className="text-lg font-normal text-black">
                                Are you sure you want to disable this
                                department?
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
                      {/* <td className="px-3 py-2 text-white flex flex-wrap gap-1">
                        {actions?.length > 0 &&
                          actions.map((act, index) => (
                            <button
                              key={index}
                              onClick={() => handleActionBtn(act, item)}
                              title={act.hoverLabel}
                              className={`${
                                act?.btnColor ? act.btnColor : ""
                              } op-btn op-btn-sm w-[50px]`}
                            >
                              <i className={act.btnIcon}></i>
                            </button>
                          ))}
                      </td> */}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="op-join flex flex-wrap items-center p-2">
          {departmentList.length > recordperPage && (
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
          {departmentList.length > recordperPage && (
            <button
              onClick={() => paginateFront()}
              className="op-join-item op-btn op-btn-sm"
            >
              Next
            </button>
          )}
        </div>
        {departmentList?.length <= 0 && (
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
          title={"Add Department"}
          isOpen={isModal}
          handleClose={handleFormModal}
        >
          <AddDepartment
            handleDepartmentInfo={handleDepartmentInfo}
            closePopup={handleFormModal}
          />
        </ModalUi>
      </div>
    </div>
  );
};

export default DepartmentList;
