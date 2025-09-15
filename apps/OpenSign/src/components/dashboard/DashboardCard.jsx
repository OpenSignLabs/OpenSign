import { useState, useEffect } from "react";
import axios from "axios";
import Parse from "parse";
import getReplacedHashQuery from "../../constant/getReplacedHashQuery";
import { useNavigate } from "react-router";
import Tooltip from "../../primitives/Tooltip";
import { useTranslation } from "react-i18next";

const DashboardCard = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [parseBaseUrl] = useState(localStorage.getItem("baseUrl"));
  const [parseAppId] = useState(localStorage.getItem("parseAppId"));
  const [response, setresponse] = useState("");
  const [loading, setLoading] = useState(false);

  const renderData = async () => {
    if (props.Data.queryType === "function") {
      setLoading(true);
      try {
        let url = `${parseBaseUrl}${props.Data.class}`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          sessionToken: localStorage.getItem("accesstoken")
        };
        let body = {};
        let res;
        if (localStorage.getItem("Extand_Class")) {
          let data = JSON.parse(localStorage.getItem("Extand_Class"));
          res = data[0];
        } else {
          res = await Parse.Cloud.run("getUserDetails");
          if (res) res = res.toJSON();
        }
        if (res) {
          let json = res;
          var reg = /(\#.*?\#)/gi; // eslint-disable-line
          var str = props.Data.query;
          var test = "";

          if (props.Data.extendkey) {
            let a = props.Data.extendkey.split(".");
            if (a.length > 0) {
              test = str.replace(reg, json[a[0]][a[1]]);
            } else {
              test = str.replace(reg, json[a[0]]);
            }
          } else {
            test = str.replace(reg, json.objectId);
          }
          if (str.replace(reg, json.objectId)) {
            body = test;
          } else {
            body = props.Data.query;
          }
        } else {
          body = props.Data.query;
        }
        await axios.post(url, body, { headers: headers }).then((res) => {
          if (res) {
            if (res.data.result.length > 0) {
              setresponse(res.data.result[0][props.Data.key]);
            } else {
              setresponse(0);
            }
            setLoading(false);
          } else {
            setLoading(false);
          }
        });
      } catch (e) {
        console.error("Problem", e.message);
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const currentUser = Parse.User.current();
        let reg1 = /(\#.*?\#)/gi; // eslint-disable-line
        let _query = props.Data.query;
        let str = _query;
        var test1;
        str = str.split("#$").join("$");
        str = str.split("#*").join("$");
        str = str.split("_DOT_").join(".");

        if (str.includes("#")) {
          let resr;
          if (localStorage.getItem("Extand_Class")) {
            let data = JSON.parse(localStorage.getItem("Extand_Class"));
            resr = data[0];
          } else {
            resr = await Parse.Cloud.run("getUserDetails");
            if (resr) resr = resr.toJSON();
          }

          let json = resr;
          let output = str.match(reg1);
          const HashCount = str.match(reg1);
          if (HashCount.length > 1) {
            // `getReplacedHashQuery` is used to replace multiple hash keyword with actual values from query
            test1 = getReplacedHashQuery(str, json);
          } else {
            output = output.join();
            output = output.substring(1, output.length - 1);
            output = output.split(".");
            if (output.length > 1) {
              test1 = str.replace(reg1, json[output[0]][output[1]]);
            } else if (json[output[0]]) {
              if (typeof json[output[0]] === "object") {
                test1 = str.replace(reg1, JSON.stringify(json[output[0]]));
              } else {
                test1 = str.replace(reg1, json[output[0]]);
              }
            } else {
              test1 = str.replace(reg1, currentUser.id);
            }
          }
        } else {
          test1 = str.replace(reg1, currentUser.id);
        }
        let url = `${parseBaseUrl}classes/${props.Data.class}?${test1}`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          "X-Parse-Session-Token": localStorage.getItem("accesstoken")
        };
        // handle need your sign report count
        if (props.Data.Redirect_id === "4Hhwbp482K") {
          const params = {
            reportId: props.Data.Redirect_id,
            skip: 0,
            limit: 200
          };
          const url = `${parseBaseUrl}functions/getReport`;
          await axios
            .post(url, params, {
              headers: {
                "Content-Type": "application/json",
                "X-Parse-Application-Id": parseAppId,
                sessiontoken: localStorage.getItem("accesstoken")
              }
            })
            .then((res) => {
              const listData = res.data?.result?.filter(
                (x) => x.Signers.length > 0
              );
              let arr = [];
              for (const obj of listData) {
                const isSigner = obj.Signers?.some(
                  (item) => item.UserId.objectId === currentUser.id
                );
                if (isSigner) {
                  let isRecord;
                  if (obj?.AuditTrail && obj?.AuditTrail.length > 0) {
                    isRecord = obj?.AuditTrail.some(
                      (item) =>
                        item?.UserPtr?.UserId?.objectId === currentUser.id &&
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
              setresponse(arr.length);
            });
        } else {
          await axios.get(url, { headers: headers }).then((res) => {
            if (res?.data?.[props.Data.key]) {
              setresponse(parseInt(res.data[props.Data.key]));
            } else if (res?.data?.results?.length > 0) {
              setresponse(res.data.results.length);
            } else {
              setresponse(0);
            }
          });
        }
      } catch (e) {
        console.error("Problem", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const filterRender = async () => {
    if (props.FilterData && props.FilterData.queryType === "function") {
      setLoading(true);
      try {
        let url = `${parseBaseUrl}${props.FilterData.class}`;
        const headers = {
          "Content-Type": "application/json",
          "X-Parse-Application-Id": parseAppId,
          sessionToken: localStorage.getItem("accesstoken")
        };

        let body = {};
        var str = props.FilterData.query;
        let restr = JSON.stringify(props.FilterData.query);
        var reg = /(\#.*?\#)/gi; // eslint-disable-line
        restr = restr.split("#$").join("$");
        restr = restr.split("#*").join("$");
        restr = restr.split("_DOT_").join(".");

        if (restr.includes("#")) {
          try {
            let res;
            if (localStorage.getItem("Extand_Class")) {
              let data = JSON.parse(localStorage.getItem("Extand_Class"));
              res = data[0];
            } else {
              let resr = await Parse.Cloud.run("getUserDetails");
              if (res) res = resr.toJSON();
            }

            let json = res;
            let output = restr.match(reg);
            if (output.length === 1) {
              output = output.filter((x) => x === "#filterCondition#");
              if (output.length === 1) {
                str = str.replace("#filterCondition#", props.Filter);
              } else {
                output = output.join();
                output = output.substring(1, output.length - 1);
                output = output.split(".");
                if (output.length > 0) {
                  str = str.replace(reg, json[output[0]][output[1]]);
                } else {
                  str = str.replace(reg, json[output[0]]);
                }
              }
            } else if (output.length === 2) {
              output = output.filter((x) => x !== "#filterCondition#");
              if (output.length === 1) {
                str = str.replace("#filterCondition#", props.Filter);
                output = output.join();
                output = output.substring(1, output.length - 1);
                output = output.split(".");
                if (output.length > 1) {
                  str = str.replace(reg, json[output[0]][output[1]]);
                } else {
                  str = str.replace(reg, json[output[0]]);
                }
              }
            }
            body = str;
            const response = await axios.post(url, body, { headers: headers });
            if (response.data.result.length > 0) {
              setresponse(response.data.result[0][props.FilterData.key]);
              setLoading(false);
            } else {
              setresponse("0");
              setLoading(false);
            }
          } catch (error) {
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("Problem", e);
        setLoading(false);
      }
    }
  };

  const setFormat = (val) => {
    switch (props.Format) {
      case "INR":
        if (val)
          return Number(val)
            .toFixed(2)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return 0;
      default:
        return val;
    }
  };

  useEffect(() => {
    renderData();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (props.Filter) {
      filterRender();
    }
    //eslint-disable-next-line
  }, [props.Filter]);

  function openReport() {
    if (props.Data && props.Data.Redirect_type) {
      const Redirect_type = props.Data.Redirect_type;
      const id = props.Data.Redirect_id;
      if (Redirect_type === "Form") {
        navigate(`/form/${id}`);
      } else if (Redirect_type === "Report") {
        navigate(`/report/${id}`);
      } else if (Redirect_type === "Url") {
        window.location = id;
      } else if (Redirect_type === "Microapp") {
        navigate(`/microapp/${id}`);
      }
    }
  }

  return (
    <div
      onClick={() => openReport()}
      className={`${
        props.Data && props.Data.Redirect_type
          ? "cursor-pointer"
          : "cursor-default"
      }`}
    >
      <div className="flex items-center justify-start gap-5 text-white">
        <span className="rounded-full bg-base-300 bg-opacity-20 w-[60px] h-[60px] self-start flex justify-center items-center">
          <i
            className={`${
              props.Icon ? props.Icon : "fa-light fa-info"
            } text-[25px] lg:text-[30px]`}
          ></i>
        </span>

        <div className="font-medium">
          <div className="text-base lg:text-lg">
            {t(`dashboard-card.${props.Label}`)}
          </div>
          <div className="text-2xl font-light">
            {loading ? <div className="loader-01"></div> : setFormat(response)}
          </div>
        </div>
      </div>
      <div className="text-xs absolute top-3 right-2">
        <Tooltip
          id={props.Label}
          iconColor={"white"}
          message={t(`tour-mssg.${props.Label}`)}
        />
      </div>
    </div>
  );
};

export default DashboardCard;
