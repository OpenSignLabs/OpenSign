import React, { useEffect, useState } from "react";
import Parse from "parse";
import ReportTable from "../../primitives/GetReportDisplay";
import reportJson from "../../json/ReportJson";
import axios from "axios";
function DashboardReport(props) {
  // console.log("props ", props)
  const [List, setList] = useState([]);
  const [isLoader, setIsLoader] = useState(true);
  const [reportName, setReportName] = useState("");
  const [actions, setActions] = useState([]);
  useEffect(() => {
    setReportName("");
    getReportData(props.Record.reportId);
  }, [props.Record.reportId]);

  const getReportData = async (id) => {
    setIsLoader(true);
    const json = reportJson(id);
    if (json) {
      setActions(json.actions);
      setReportName(json.reportName);
      const { className, params, keys, orderBy } = json;
      Parse.serverURL = localStorage.getItem("BaseUrl12");
      Parse.initialize(localStorage.getItem("AppID12"));
      const serverURL =
        localStorage.getItem("BaseUrl12") + "classes/" + className;

      const strParams = JSON.stringify(params);
      const strKeys = keys.join();
      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("AppID12"),
        "X-Parse-Session-Token": localStorage.getItem("accesstoken")
      };
      try {
        const url = `${serverURL}?where=${strParams}&keys=${strKeys}&order=${orderBy}&include=AuditTrail.UserPtr`;
        const res = await axios.get(url, { headers: headers });
        // console.log("res ", res.data?.results);
        if (id === "5Go51Q7T8r") {
          const currentUser = Parse.User.current().id;
          const listData = res.data?.results.filter(
            (x) => x.Signers.length > 0
          );
          let arr = [];
          for (const obj of listData) {
            const isSigner = obj.Signers.some(
              (item) => item.UserId.objectId === currentUser
            );
            if (isSigner) {
              let isRecord;
              if (obj?.AuditTrail && obj?.AuditTrail.length > 0) {
                isRecord = obj?.AuditTrail.some(
                  (item) =>
                    item?.UserPtr?.UserId?.objectId === currentUser &&
                    item.Activity === "Signed"
                );
              } else {
                isRecord = false;
              }
              if (isRecord === false) {
                arr.push(obj);
              }
            }
          }
          setList(arr);
        } else {
          setList(res.data?.results);
        }
        setIsLoader(false);
      } catch (err) {
        console.log("err ", err);
        setIsLoader(false);
      }
    } else {
      setIsLoader(false);
    }
  };
  return (
    <>
      {isLoader ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              fontSize: "45px",
              color: "#3dd3e0"
            }}
            className="loader-37"
          ></div>
        </div>
      ) : (
        <>
          {reportName ? (
            <ReportTable
              ReportName={reportName}
              List={List}
              act={"Sign"}
              actions={actions}
            />
          ) : (
            <div className="flex items-center justify-center h-[100px] w-full bg-white rounded">
              <div className="text-center">
                <p className="text-xl text-black">Report Not Found</p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default DashboardReport;
