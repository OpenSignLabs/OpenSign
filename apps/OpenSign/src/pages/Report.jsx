import React, { useEffect, useState, useRef } from "react";
import ReportTable from "../primitives/GetReportDisplay";
import Parse from "parse";
import axios from "axios";
import reportJson from "../json/ReportJson";
import { useParams } from "react-router";
import Title from "../components/Title";
import PageNotFound from "./PageNotFound";
import TourContentWithBtn from "../primitives/TourContentWithBtn";
import Loader from "../primitives/Loader";
import { useTranslation } from "react-i18next";

const Report = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [List, setList] = useState([]);
  const [isLoader, setIsLoader] = useState(true);
  const [reportName, setReportName] = useState("");
  const [reporthelp, setReportHelp] = useState("");
  const [actions, setActions] = useState([]);
  const [heading, setHeading] = useState([]);
  const [isNextRecord, setIsNextRecord] = useState(false);
  const [isMoreDocs, setIsMoreDocs] = useState(true);
  const [form, setForm] = useState("");
  const [tourData, setTourData] = useState([]);
  const [isDontShow, setIsDontShow] = useState(false);
  const [isImport, setIsImport] = useState(false);
  const abortController = new AbortController();
  const docPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isSearchResult, setIsSearchResult] = useState(false);
  const debounceTimer = useRef(null);

  // below useEffect is call when id param change
  useEffect(() => {
    setReportName("");
    setList([]);
    setSearchTerm("");
    setMobileSearchOpen(false);
    getReportData(0, docPerPage, "");

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
      getReportData(List.length, 20, searchTerm);
    }
    // eslint-disable-next-line
  }, [isNextRecord]);

  const handleDontShow = (isChecked) => {
    setIsDontShow(isChecked);
  };

  const handleSearchChange = async (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(async () => {
      try {
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
          sessiontoken: localStorage.getItem("accesstoken")
        };
        const url = `${localStorage.getItem("baseUrl")}functions/getReport`;
        const res = await axios.post(
          url,
          { reportId: id, searchTerm: term, skip: 0, limit: docPerPage },
          { headers }
        );
        const data = res.data?.result || [];
        if (!data.error) {
          setList(data);
          setIsMoreDocs(data.length >= docPerPage);
          setIsNextRecord(false);
          setIsSearchResult(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);
    setIsSearchResult(false);
  };

  const handleSearchPaste = (e) => {
    setTimeout(() => {
      handleSearchChange({ target: { value: e.target.value } });
    }, 0);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);
  const getReportData = async (
    skipUserRecord = 0,
    limit = 20,
    term = searchTerm
  ) => {
    // setIsLoader(true);
    const json = reportJson(id);
    if (json) {
      setActions(json.actions);
      setHeading(json.heading);
      setReportName(json.reportName);
      setForm(json.form);
      setReportHelp(json?.helpMsg);
      setIsImport(json?.import || false);
      const currentUser = Parse.User.current().id;

      const headers = {
        "Content-Type": "application/json",
        "X-Parse-Application-Id": localStorage.getItem("parseAppId"),
        sessiontoken: localStorage.getItem("accesstoken")
      };
      try {
        const skipRecord = id === "4Hhwbp482K" ? 0 : skipUserRecord;
        const limitRecord = id === "4Hhwbp482K" ? 200 : limit;
        const params = { reportId: id, skip: skipRecord, limit: limitRecord };
        if (term) {
          params.searchTerm = term;
        }
        const url = `${localStorage.getItem("baseUrl")}functions/getReport`;
        const res = await axios.post(url, params, {
          headers: headers,
          signal: abortController.signal // is used to cancel fetch query
        });
        if (id === "6TeaPr321t") {
          const tourConfig = [
            {
              selector: "[data-tut=reactourFirst]",
              content: () => (
                <TourContentWithBtn
                  message={t("tour-mssg.report-1")}
                  isChecked={handleDontShow}
                />
              ),
              position: "top",
              style: { fontSize: "13px" }
            }
          ];

          if (res.data.result && res.data.result?.length > 0) {
            json.actions.map((data) => {
              const newConfig = {
                selector: `[data-tut="${data?.selector}"]`,
                content: () => (
                  <TourContentWithBtn
                    message={t(`tour-mssg.${data?.action}`)}
                    isChecked={handleDontShow}
                  />
                ),
                position: "top",
                style: { fontSize: "13px" }
              };
              tourConfig.push(newConfig);
            });
          }

          setTourData(tourConfig);
        }
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
          if (res.data.result.length >= docPerPage) {
            setIsMoreDocs(true);
          } else {
            setIsMoreDocs(false);
          }
          if (!res.data.result.error) {
            setIsNextRecord(false);
            setList((prevRecord) =>
              prevRecord.length > 0
                ? [...prevRecord, ...res.data.result]
                : res.data.result
            );
          }
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
        <div className="h-[100vh] flex justify-center items-center">
          <Loader />
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
              report_help={reporthelp}
              tourData={tourData}
              isDontShow={isDontShow}
              mobileSearchOpen={mobileSearchOpen}
              setMobileSearchOpen={setMobileSearchOpen}
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange}
              handleSearchPaste={handleSearchPaste}
              isSearchResult={isSearchResult}
              isImport={isImport}
            />
          ) : (
            <PageNotFound prefix={"Report"} />
          )}
        </>
      )}
    </>
  );
};

export default Report;
