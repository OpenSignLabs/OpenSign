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
  useEffect(() => {
    setReportName("");
    getReportData();
    // eslint-disable-next-line
  }, [id]);

  const getReportData = async () => {
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
        const url = `${serverURL}?where=${strParams}&keys=${strKeys}&order=${orderBy}`;
        const res = await axios.get(url, { headers: headers });
        // console.log("res ", res.data?.results);
        setList(res.data?.results);
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
              actions={actions}
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
