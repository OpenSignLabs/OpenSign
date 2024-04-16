import React, { useState, useEffect, useMemo } from "react";
import pad from "../assets/images/pad.svg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ModalUi from "./ModalUi";
import AddSigner from "../components/AddSigner";
import { modalSubmitBtnColor, modalCancelBtnColor } from "../constant/const";
import Alert from "./Alert";
import Tooltip from "./Tooltip";
import { RWebShare } from "react-web-share";

const ReportTable = ({
  ReportName,
  List,
  setList,
  actions,
  heading,
  setIsNextRecord,
  isMoreDocs,
  docPerPage,
  form,
  report_help
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [actLoader, setActLoader] = useState({});
  const [isAlert, setIsAlert] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const [isDocErr, setIsDocErr] = useState(false);
  const [isContactform, setIsContactform] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState({});
  const [isShare, setIsShare] = useState({});
  const [shareUrls, setShareUrls] = useState([]);
  const [copied, setCopied] = useState(false);
  const startIndex = (currentPage - 1) * docPerPage;

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

  // `handleURL` is used to open microapp
  const handleURL = async (item, act) => {
    if (ReportName === "Templates") {
      if (act.btnLabel === "Edit") {
        navigate(`/${act.redirectUrl}/${item.objectId}`);
      } else {
        setActLoader({ [`${item.objectId}_${act.btnId}`]: true });
        try {
          const params = {
            templateId: item.objectId
          };
          const templateDeatils = await axios.post(
            `${localStorage.getItem("baseUrl")}functions/getTemplate`,
            params,
            {
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
                sessionToken: localStorage.getItem("accesstoken")
              }
            }
          );

          // console.log("templateDeatils.data ", templateDeatils.data);
          const templateData =
            templateDeatils.data && templateDeatils.data.result;
          if (!templateData.error) {
            const Doc = templateData;

            let signers = [];
            if (Doc.Signers?.length > 0) {
              Doc.Signers?.forEach((x) => {
                if (x.objectId) {
                  const obj = {
                    __type: "Pointer",
                    className: "contracts_Contactbook",
                    objectId: x.objectId
                  };
                  signers.push(obj);
                }
              });
            }

            let placeholdersArr = [];
            if (Doc.Placeholders?.length > 0) {
              placeholdersArr = Doc.Placeholders;
              const data = {
                Name: Doc.Name,
                URL: Doc.URL,
                SignedUrl: Doc.SignedUrl,
                Description: Doc.Description,
                Note: Doc.Note,
                Placeholders: placeholdersArr,
                ExtUserPtr: {
                  __type: "Pointer",
                  className: "contracts_Users",
                  objectId: Doc.ExtUserPtr.objectId
                },
                CreatedBy: {
                  __type: "Pointer",
                  className: "_User",
                  objectId: Doc.CreatedBy.objectId
                },
                Signers: signers
              };
              try {
                const res = await axios.post(
                  `${localStorage.getItem(
                    "baseUrl"
                  )}classes/${localStorage.getItem("_appName")}_Document`,
                  data,
                  {
                    headers: {
                      "Content-Type": "application/json",
                      "X-Parse-Application-Id":
                        localStorage.getItem("parseAppId"),
                      "X-Parse-Session-Token":
                        localStorage.getItem("accesstoken")
                    }
                  }
                );

                // console.log("Res ", res.data);
                if (res.data && res.data.objectId) {
                  setActLoader({});
                  setIsAlert(true);
                  setTimeout(() => setIsAlert(false), 1500);
                  navigate(`/${act.redirectUrl}/${res.data.objectId}`, {
                    state: { title: "Use Template" }
                  });
                }
              } catch (err) {
                console.log("Err", err);
                setIsAlert(true);
                setIsErr(true);
                setTimeout(() => setIsAlert(false), 1500);
                setActLoader({});
              }
            } else {
              setIsDocErr(true);
              setActLoader({});
            }
          } else {
            setIsAlert(true);
            setIsErr(true);
            setTimeout(() => setIsAlert(false), 1500);
            setActLoader({});
          }
        } catch (err) {
          console.log("err", err);
          setIsAlert(true);
          setIsErr(true);
          setTimeout(() => setIsAlert(false), 1500);
          setActLoader({});
        }
      }
    } else {
      localStorage.removeItem("rowlevel");
      navigate(`/${act.redirectUrl}`);
      localStorage.setItem("rowlevel", JSON.stringify(item));
    }
  };

  const handleActionBtn = (act, item) => {
    if (act.action === "redirect") {
      handleURL(item, act);
    } else if (act.action === "delete") {
      setIsDeleteModal({ [item.objectId]: true });
    } else if (act.action === "share") {
      handleShare(item);
    }
  };
  // Get current list
  const indexOfLastDoc = currentPage * docPerPage;
  const indexOfFirstDoc = indexOfLastDoc - docPerPage;
  // `currentLists` is total record render on current page
  const currentLists = List?.slice(indexOfFirstDoc, indexOfLastDoc);

  // Change page
  const paginateFront = () => setCurrentPage(currentPage + 1);
  const paginateBack = () => setCurrentPage(currentPage - 1);

  const handleContactFormModal = () => {
    setIsContactform(!isContactform);
  };

  const handleUserData = (data) => {
    setList((prevData) => [data, ...prevData]);
  };

  const handleDelete = async (item) => {
    setIsDeleteModal({});
    setActLoader({ [`${item.objectId}`]: true });
    const clsObj = {
      Contactbook: "contracts_Contactbook",
      Templates: "contracts_Template"
    };
    try {
      const serverUrl = process.env.REACT_APP_SERVERURL
        ? process.env.REACT_APP_SERVERURL
        : window.location.origin + "/api/app";
      const cls = clsObj[ReportName] || "contracts_Document";
      const url = serverUrl + `/classes/${cls}/`;
      const body =
        ReportName === "Contactbook"
          ? { IsDeleted: true }
          : { IsArchive: true };
      const res = await axios.put(url + item.objectId, body, {
        headers: {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        }
      });
      // console.log("Res ", res.data);
      if (res.data && res.data.updatedAt) {
        setActLoader({});
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 1500);
        const upldatedList = List.filter((x) => x.objectId !== item.objectId);
        setList(upldatedList);
      }
    } catch (err) {
      console.log("err", err);
      setIsAlert(true);
      setIsErr(true);
      setTimeout(() => setIsAlert(false), 1500);
      setActLoader({});
    }
  };
  const handleCloseDeleteModal = () => setIsDeleteModal({});

  const handleShare = (item) => {
    setActLoader({ [item.objectId]: true });
    const host = window.location.origin;
    const serverUrl = process.env.REACT_APP_SERVERURL
      ? process.env.REACT_APP_SERVERURL
      : window.location.origin + "/api/app";
    const baseURL = serverUrl.replace(/\//g, "%2F");
    const urls = item.Signers.map((x) => ({
      email: x.Email,
      url: `${host}/login/${item.objectId}/${x.Email}/${x.objectId}/${baseURL}%2F&opensign&contracts`
    }));
    setShareUrls(urls);
    setIsShare({ [item.objectId]: true });
  };

  const copytoclipboard = (share) => {
    navigator.clipboard.writeText(share.url);
    setCopied({ ...copied, [share.email]: true });
  };
  return (
    <div className="relative">
      {Object.keys(actLoader)?.length > 0 && (
        <div className="absolute w-full h-full rounded-md flex justify-center items-center bg-black bg-opacity-30 ">
          <div
            style={{ fontSize: "45px", color: "#3dd3e0" }}
            className="loader-37"
          ></div>
        </div>
      )}
      <div className="p-2 overflow-x-scroll w-full bg-white rounded-md">
        {isAlert && (
          <Alert type={isErr ? "danger" : "success"}>
            {isErr
              ? "Something went wrong, Please try again later!"
              : "Record deleted successfully!"}
          </Alert>
        )}
        <div className="flex flex-row items-center justify-between my-2 mx-3 text-[20px] md:text-[23px]">
          <div className="font-light">
            {ReportName}{" "}
            {report_help && (
              <span className="text-xs md:text-[13px] font-normal">
                <Tooltip message={report_help} />
              </span>
            )}
          </div>
          {ReportName === "Templates" && (
            <i
              onClick={() => navigate("/form/template")}
              className="fa-solid fa-square-plus text-sky-400 text-[25px]"
            ></i>
          )}
          {form && (
            <div
              className="cursor-pointer"
              onClick={() => handleContactFormModal()}
            >
              <i className="fa-solid fa-square-plus text-sky-400 text-[25px]"></i>
            </div>
          )}
        </div>
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
            {List?.length > 0 && (
              <>
                {currentLists.map((item, index) =>
                  ReportName === "Contactbook" ? (
                    <tr className="border-y-[1px]" key={index}>
                      {heading.includes("Sr.No") && (
                        <td className="px-4 py-2">{startIndex + index + 1}</td>
                      )}
                      <td className="px-4 py-2 font-semibold">{item?.Name} </td>
                      <td className="px-4 py-2">{item?.Email || "-"}</td>
                      <td className="px-4 py-2">{item?.Phone || "-"}</td>
                      <td className="px-3 py-2 text-white grid grid-cols-2">
                        {actions?.length > 0 &&
                          actions.map((act, index) => (
                            <button
                              key={index}
                              onClick={() => handleActionBtn(act, item)}
                              className={`mb-1 flex justify-center items-center gap-1 px-2 py-1 rounded shadow`}
                              title={act.btnLabel}
                              style={{
                                backgroundColor: act.btnColor
                                  ? act.btnColor
                                  : "#3ac9d6",
                                color: act?.textColor ? act?.textColor : "white"
                              }}
                            >
                              <i className={act.btnIcon}></i>
                            </button>
                          ))}
                        {isDeleteModal[item.objectId] && (
                          <ModalUi
                            isOpen
                            title={"Delete Contact"}
                            handleClose={handleCloseDeleteModal}
                          >
                            <div className="m-[20px]">
                              <div className="text-lg font-normal text-black">
                                Are you sure you want to delete this contact?
                              </div>
                              <hr className="bg-[#ccc] mt-4 " />
                              <div className="flex items-center mt-3 gap-2 text-white">
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="px-4 py-1.5 text-white rounded shadow-md text-center focus:outline-none "
                                  style={{
                                    backgroundColor: modalSubmitBtnColor
                                  }}
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={handleCloseDeleteModal}
                                  className="px-4 py-1.5 text-black border-[1px] border-[#ccc] shadow-md rounded focus:outline-none"
                                  style={{
                                    backgroundColor: modalCancelBtnColor
                                  }}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </ModalUi>
                        )}
                      </td>
                    </tr>
                  ) : (
                    <tr className="border-y-[1px]" key={index}>
                      {heading.includes("Sr.No") && (
                        <td className="px-4 py-2">{startIndex + index + 1}</td>
                      )}
                      <td className="px-4 py-2 font-semibold w-56">
                        {item?.Name}{" "}
                      </td>
                      {heading.includes("Note") && (
                        <td className="px-4 py-2">{item?.Note || "-"}</td>
                      )}
                      {heading.includes("Folder") && (
                        <td className="px-4 py-2">
                          {item?.Folder?.Name || "OpenSign™ Drive"}
                        </td>
                      )}
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

                      <td className="px-4 py-2">
                        {formatRow(item?.ExtUserPtr)}
                      </td>
                      <td className="px-4 py-2">
                        {item?.Signers ? formatRow(item?.Signers) : "-"}
                      </td>
                      <td className="px-3 py-2 text-white grid grid-cols-2 gap-1">
                        {actions?.length > 0 &&
                          actions.map((act, index) => (
                            <button
                              key={index}
                              onClick={() => handleActionBtn(act, item)}
                              className={`w-[25px] h-[25px] flex justify-center items-center rounded shadow`}
                              title={act.btnLabel}
                              style={{
                                backgroundColor: act.btnColor
                                  ? act.btnColor
                                  : "#3ac9d6",
                                color: act?.textColor ? act?.textColor : "white"
                              }}
                            >
                              <i className={act.btnIcon}></i>
                            </button>
                          ))}
                        {isDeleteModal[item.objectId] && (
                          <ModalUi
                            isOpen
                            title={"Delete Document"}
                            handleClose={handleCloseDeleteModal}
                          >
                            <div className="m-[20px]">
                              <div className="text-lg font-normal text-black">
                                Are you sure you want to delete this document?
                              </div>
                              <hr className="bg-[#ccc] mt-4" />
                              <div className="flex items-center mt-3 gap-2 text-white">
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="px-4 py-1.5 text-white rounded shadow-md text-center focus:outline-none "
                                  style={{
                                    backgroundColor: modalSubmitBtnColor
                                  }}
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={handleCloseDeleteModal}
                                  className="px-4 py-1.5 text-black border-[1px] border-[#ccc] shadow-md rounded focus:outline-none"
                                  style={{
                                    backgroundColor: modalCancelBtnColor
                                  }}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </ModalUi>
                        )}
                        {isShare[item.objectId] && (
                          <ModalUi
                            isOpen
                            title={"Copy link"}
                            handleClose={() => {
                              setIsShare({});
                              setActLoader({});
                            }}
                          >
                            <div className="m-[20px]">
                              {shareUrls.map((share, i) => (
                                <div
                                  key={i}
                                  className="text-sm font-normal text-black flex my-2 justify-between items-center"
                                >
                                  <span className="text-sm font-semibold">
                                    {share.email}
                                  </span>
                                  <div>
                                    <RWebShare
                                      data={{
                                        url: share.url,
                                        title: "Sign url"
                                      }}
                                    >
                                      <button className="bg-[#002864] text-white rounded w-[32px] h-[30px] focus:outline-none">
                                        <i className="fa-solid fa-share-from-square"></i>{" "}
                                      </button>
                                    </RWebShare>
                                    <button
                                      className="ml-2 bg-[#002864] text-white rounded w-[100px] h-[30px] focus:outline-none"
                                      onClick={() => copytoclipboard(share)}
                                    >
                                      <i className="fa-solid fa-link"></i>{" "}
                                      {copied[share.email] ? "Copied" : "Copy"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ModalUi>
                        )}
                      </td>
                    </tr>
                  )
                )}
              </>
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
          title={"Add Contact"}
          isOpen={isContactform}
          handleClose={handleContactFormModal}
        >
          <AddSigner
            handleUserData={handleUserData}
            closePopup={handleContactFormModal}
          />
        </ModalUi>
        <ModalUi
          headColor={"#dc3545"}
          isOpen={isDocErr}
          title={"Receipent required"}
          handleClose={() => setIsDocErr(false)}
        >
          <div style={{ height: "100%", padding: 20 }}>
            <p>Please add receipent in template!</p>
          </div>
        </ModalUi>
      </div>
    </div>
  );
};

export default ReportTable;
