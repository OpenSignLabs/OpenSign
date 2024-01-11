import React, { useEffect, useState } from "react";
import ReportTable from "../primitives/GetReportDisplay";
import Parse from "parse";
import axios from "axios";
import reportJson from "../json/ReportJson";
import { useParams } from "react-router-dom";
import Title from "../components/Title";

const Report = () => {
  const { id } = useParams();
  const [List, setList] = useState([]);
  const [isLoader, setIsLoader] = useState(true);
  const [reportName, setReportName] = useState("");
  const [actions, setActions] = useState([]);
  const [heading, setHeading] = useState([]);
  const [isNextRecord, setIsNextRecord] = useState(false);
  const [isMoreDocs, setIsMoreDocs] = useState(true);
  const [form, setForm]= useState("")
  const abortController = new AbortController();
  const docPerPage = 10;

  // below useEffect is call when id param change
  useEffect(() => {
    setReportName("");
    setList([]);
    getReportData();

    // Function returned from useEffect is called on unmount
    return () => {
      setIsLoader(true);
      setList([]);
      setIsNextRecord(false);
      // Here it'll abort the fetch
      abortController.abort();
    };
    // eslint-disable-next-line
  }, [id]);

  // below useEffect call when isNextRecord state is true and fetch next record
  useEffect(() => {
    if (isNextRecord) {
      getReportData(List.length, 200);
    }
    // eslint-disable-next-line
  }, [isNextRecord]);

  const getReportData = async (skipUserRecord = 0, limit = 200) => {
    // setIsLoader(true);
    const json = reportJson(id);
    if (json) {
      setActions(json.actions);
      setHeading(json.heading);
      setReportName(json.reportName);
      setForm(json.form)
      Parse.serverURL = localStorage.getItem("BaseUrl12");
      Parse.initialize(localStorage.getItem("AppID12"));
      const currentUser = Parse.User.current().id;

      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("AppID12"),
        sessiontoken: localStorage.getItem("accesstoken")
      };
      try {
        const params = { reportId: id, skip: skipUserRecord, limit: limit };
        const url = `${localStorage.getItem("BaseUrl12")}/functions/getReport`;
        const res = await axios.post(url, params, {
          headers: headers,
          signal: abortController.signal // is used to cancel fetch query
        });
        if (id === "4Hhwbp482K") {
          const listData = res.data?.result.filter((x) => x.Signers.length > 0);
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
          if (arr.length === docPerPage) {
            setIsMoreDocs(true);
          } else {
            setIsMoreDocs(false);
          }
          setList((prevRecord) =>
            prevRecord.length > 0 ? [...prevRecord, ...arr] : arr
          );
        } else {
          if (res.data.result.length === docPerPage) {
            setIsMoreDocs(true);
          } else {
            setIsMoreDocs(false);
          }
          setIsNextRecord(false);
          setList((prevRecord) =>
            prevRecord.length > 0
              ? [...prevRecord, ...res.data.result]
              : res.data.result
          );
        }
        setIsLoader(false);
      } catch (err) {
        const isCancel = axios.isCancel(err);
        if (!isCancel) {
          console.log("err ", err);
          setIsLoader(false);
        }
      }
    } else {
      setIsLoader(false);
    }
  };
  return (
    <>
      <Title title={reportName} />
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
              setList={setList}
              actions={actions}
              heading={heading}
              setIsNextRecord={setIsNextRecord}
              isMoreDocs={isMoreDocs}
              docPerPage={docPerPage}
              form={form}
            />
          ) : (
            <div className="flex items-center justify-center h-screen w-full bg-white rounded">
              <div className="text-center">
                <p className="text-[30px] lg:text-[50px] text-black">
                  Report Not Found
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Report;
