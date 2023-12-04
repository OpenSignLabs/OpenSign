import React, { useState, useEffect, useMemo } from "react";
import pad from "../assets/images/pad.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/report.css";
const ReportTable = ({
  ReportName,
  List,
  setList,
  actions,
  heading,
  setIsNextRecord,
  isMoreDocs,
  docPerPage
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isAlert, setIsAlert] = useState(false);
  const [isErr, setIsErr] = useState(false);
  // For loop is used to calculate page numbers visible below table
  // Initialize pageNumbers using useMemo to avoid unnecessary re-creation
  const pageNumbers = useMemo(() => {
    const calculatedPageNumbers = [];
    for (let i = 1; i <= Math.ceil(List.length / docPerPage); i++) {
      calculatedPageNumbers.push(i);
    }
    return calculatedPageNumbers;
  }, [List, docPerPage]);
  //  below useEffect reset currenpage to 1 if user change route
  useEffect(() => {
    return () => setCurrentPage(1);
  }, []);

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
  // below useEffect is used to render next record if IsMoreDoc is true
  // second last value of pageNumber array is same as currentPage
  useEffect(() => {
    if (isMoreDocs && pageNumbers[pageNumbers.length - 1] === currentPage) {
      setIsNextRecord(true);
    }
  }, [isMoreDocs, pageNumbers, currentPage, setIsNextRecord]);

  // `handlemicroapp` is used to open microapp
  const handlemicroapp = (item, url) => {
    localStorage.removeItem("rowlevel");
    navigate("/rpmf/" + url);
    localStorage.setItem("rowlevel", JSON.stringify(item));
    // localStorage.setItem("rowlevelMicro");
  };
  const handlebtn = async (item) => {
    if (ReportName === "Contactbook") {
      setActLoader({ [item.objectId]: true });
      try {
        const url =
          process.env.REACT_APP_SERVERURL + "/classes/contracts_Contactbook/";
        const body = { IsDeleted: true };
        const res = await axios.put(url + item.objectId, body, {
          headers: {
            "Content-Type": "application/json",
            "X-Parse-Application-Id": localStorage.getItem("AppID12"),
            "X-Parse-Session-Token": localStorage.getItem("accesstoken")
          }
        });
        // console.log("Res ", res.data);
        if (res.data && res.data.updatedAt) {
          setActLoader({});
          setIsAlert(true);
          const upldatedList = List.filter((x) => x.objectId !== item.objectId);
          setList(upldatedList);
        }
      } catch (err) {
        console.log("err", err);
        setIsAlert(true);
        setIsErr(true);
        setActLoader({});
      }
    }
  };

  // Get current list
  const indexOfLastDoc = currentPage * docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - docPerPage;
  // `currentLists` is total record render on current page
  const currentLists = List.slice(indexOfFirstDoc, indexOfLastDoc);

  // Change page
  const paginateFront = () => setCurrentPage(currentPage + 1);
  const paginateBack = () => setCurrentPage(currentPage - 1);

  return (
    <div className="p-2 overflow-x-scroll w-full bg-white rounded-md">
      {isAlert && (
        <div
          className={`alert alert-${isErr ? "danger" : "success"} alertBox`}
          role="alert"
          onAnimationEnd={() => setIsAlert(false)}
        >
          {isErr
            ? "Something went wrong, Please try again later!"
            : "Record deleted successfully!"}
        </div>
      )}

      <h2 className="text-[23px] font-light my-2">{ReportName}</h2>
      <table className="table-auto w-full border-collapse">
        <thead className="text-[14px]">
          <tr className="border-y-[1px]">
            {heading?.map((item, index) => (
              <React.Fragment key={index}>
                <th className="px-4 py-2 font-thin">{item}</th>
              </React.Fragment>
            ))}
            {actions?.length > 0 && (
              <th className="px-4 py-2 font-thin">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="text-[12px]">
          {List?.length > 0 ? (
            <>
              {currentLists.map((item, index) =>
                ReportName === "Contactbook" ? (
                  <tr className="border-y-[1px]" key={index}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-semibold">{item?.Name} </td>
                    <td className="px-4 py-2">{item?.Email || "-"}</td>
                    <td className="px-4 py-2">{item?.Phone || "-"}</td>
                    <td className="px-4 py-2 flex flex-col justify-center items-center gap-2 text-white">
                      {actions?.length > 0 &&
                        actions.map((act, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              act?.redirectUrl
                                ? handlemicroapp(item, act.redirectUrl)
                                : handlebtn(item)
                            }
                            className={`flex justify-center items-center gap-1 px-2 py-1 rounded shadow`}
                            style={{
                              backgroundColor: act.btnColor
                                ? act.btnColor
                                : "#3ac9d6",
                              color: act?.textColor ? act?.textColor : "white"
                            }}
                          >
                            <span>
                              {act?.btnIcon && (
                                <i
                                  className={
                                    actLoader[item.objectId]
                                      ? "fa-solid fa-spinner fa-spin-pulse"
                                      : act.btnIcon
                                  }
                                ></i>
                              )}
                            </span>
                            {act?.btnLabel && (
                              <span className="uppercase">
                                {act?.btnLabel ? act.btnLabel : "View"}
                              </span>
                            )}
                          </button>
                        ))}
                    </td>
                  </tr>
                ) : (
                  <tr className="border-y-[1px]" key={index}>
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2 font-semibold">{item?.Name} </td>
                    <td className="px-4 py-2">{item?.Note || "-"}</td>
                    <td className="px-4 py-2">
                      {item?.Folder?.Name || "OpenSignDrive"}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        title={item?.URL}
                        href={item?.URL}
                        download={item?.URL}
                        className="text-[blue] hover:text-[blue] hover:underline"
                      >
                        {item?.URL ? "Download" : "-"}
                      </a>
                    </td>

                    <td className="px-4 py-2">{formatRow(item?.ExtUserPtr)}</td>
                    <td className="px-4 py-2">
                      {item?.Signers ? formatRow(item?.Signers) : "-"}
                    </td>
                    <td className="px-4 py-2 flex flex-col justify-center items-center gap-2 text-white">
                      {actions?.length > 0 &&
                        actions.map((act, index) => (
                          <button
                            key={index}
                            onClick={() =>
                              act?.redirectUrl
                                ? handlemicroapp(item, act.redirectUrl)
                                : handlebtn(item)
                            }
                            className={`flex justify-center items-center w-full gap-1 px-2 py-1 rounded shadow`}
                            style={{
                              backgroundColor: act.btnColor
                                ? act.btnColor
                                : "#3ac9d6",
                              color: act?.textColor ? act?.textColor : "white"
                            }}
                          >
                            <span>
                              {act?.btnIcon && (
                                <i
                                  className={
                                    actLoader[item.objectId]
                                      ? "fa-solid fa-spinner fa-spin-pulse"
                                      : act.btnIcon
                                  }
                                ></i>
                              )}
                            </span>
                            <span className="uppercase">
                              {act?.btnLabel ? act.btnLabel : "view"}
                            </span>
                          </button>
                          // )
                        ))}
                    </td>
                  </tr>
                )
              )}
            </>
          ) : (
            <></>
          )}
        </tbody>
      </table>
      <div className="flex flex-wrap items-center gap-2 p-2 ">
        {List.length > docPerPage && (
          <>
            {currentPage > 1 && (
              <button
                onClick={() => paginateBack()}
                className="bg-blue-400 text-white rounded px-3 py-2 focus:outline-none"
              >
                Prev
              </button>
            )}
          </>
        )}
        {pageNumbers.map((x) => (
          <button
            key={x}
            onClick={() => setCurrentPage(x)}
            className=" bg-sky-400 text-white rounded px-3 py-2 focus:outline-none"
          >
            {x}
          </button>
        ))}
        {isMoreDocs && (
          <button className="text-black rounded px-1 py-2">...</button>
        )}
        {List.length > docPerPage && (
          <>
            {pageNumbers.includes(currentPage + 1) && (
              <button
                onClick={() => paginateFront()}
                className="bg-blue-400 text-white rounded px-3 py-2 focus:outline-none"
              >
                Next
              </button>
            )}
          </>
        )}
      </div>
      {List?.length <= 0 && (
        <div className="flex flex-col items-center justify-center w-full bg-white rounded py-4">
          <div className="w-[60px] h-[60px] overflow-hidden">
            <img className="w-full h-full object-contain" src={pad} alt="img" />
          </div>
          <div className="text-sm font-semibold">No Data Available</div>
        </div>
      )}
    </div>
  );
};

export default ReportTable;
