import React from "react";
import pad from "../assets/images/pad.svg";
import { useNavigate } from "react-router-dom";

const ReportTable = ({ ReportName, List, actions }) => {
  const navigate = useNavigate();
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
  const handlemicroapp = (item, url) => {
    localStorage.removeItem("rowlevel");
    // const params = new URLSearchParams(url);
    // let arr = [];
    // for (let [key, value] of params.entries()) {
    //   if (key === "remoteUrl") {
    //     arr.push(
    //       `${key}=${window.btoa(
    //         window.location.origin + "/mfbuild/remoteEntry.js"
    //       )}`
    //     );
    //   } else {
    //     arr.push(`${key}=${value}`);
    //   }
    // }
    // const remoteUrl = arr.join("&");
    // console.log("arr", remoteUrl);

    navigate("/rpmf/" + url);
    localStorage.setItem("rowlevel", JSON.stringify(item));
    // localStorage.setItem("rowlevelMicro");
  };
  const handlebtn = () => {
    console.log("clicked");
  };
  return (
    <div className="p-2 overflow-x-scroll w-full bg-white rounded-md">
      <h2 className="text-[23px] font-light my-2">{ReportName}</h2>
      <table className="table-auto w-full border-collapse">
        <thead className="text-[14px]">
          <tr className="border-y-[1px]">
            <th className="px-4 py-2 font-thin">Sr.No</th>
            <th className="px-4 py-2 font-thin">Name</th>
            <th className="px-4 py-2 font-thin">Note</th>
            <th className="px-4 py-2 font-thin">Folder</th>
            <th className="px-4 py-2 font-thin">File</th>
            <th className="px-4 py-2 font-thin">Owner</th>
            <th className="px-4 py-2 font-thin">Signers</th>
            {actions?.length > 0 && (
              <th className="px-4 py-2 font-thin">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="text-[12px]">
          {List?.length > 0 ? (
            <>
              {List.map((item, index) => (
                <tr className="border-t-[1px]" key={index}>
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
                            {act?.btnIcon && <i className={act.btnIcon}></i>}
                          </span>
                          <span className="uppercase">
                            {act?.btnLabel ? act.btnLabel : "view"}
                          </span>
                        </button>
                        // )
                      ))}
                  </td>
                </tr>
              ))}
            </>
          ) : (
            <></>
          )}
        </tbody>
      </table>
      {List?.length <= 0 && (
        <div className="flex flex-col items-center justify-center w-full bg-white roundedm py-4">
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
