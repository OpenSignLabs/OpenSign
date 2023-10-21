import React, { useState, Suspense, lazy } from "react";
import moment from "moment";
import ErrorBoundary from "../ErrorBoundary";

const DashboardCard = lazy(() => import("./DashboardCard"));

const DashboardReport = lazy(() => import("./DashboardReport"));

const GetDashboard = (props) => {
  const [filter, setfilter] = useState("");
  const [option, setoption] = useState("");

  const onSearchFilter = (e) => {
    let _search = e.target.value;
    localStorage.setItem("DashboardDefaultFilter", _search);
    switch (_search) {
      case "Today":
        let d = new Date();
        let formDate = new Date(
          Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
        ).toISOString();
        let Todate = new Date(
          Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59)
        ).toISOString();
        let Query = `'$gte':'${formDate}','$lte':'${Todate}'`;
        setfilter(Query);
        setoption(_search);
        break;
      case "Yesterday":
        let d1 = new Date();
        d1.setDate(d1.getDate() - 1);
        let yesFrDate = new Date(
          Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0, 0)
        ).toISOString();

        let YesTodate = new Date(
          Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate(), 23, 59, 59)
        ).toISOString();
        let Query1 = `'$gte':'${yesFrDate}','$lte':'${YesTodate}'`;
        setfilter(Query1);
        setoption(_search);
        break;
      case "This week":
        let oneDay = 24 * 60 * 60 * 1000;
        let curr = new Date(); // get current date
        let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week

        let firstday = new Date(
          new Date(
            Date.UTC(
              curr.getFullYear(),
              curr.getMonth(),
              curr.getDate(),
              0,
              0,
              0
            )
          ).setDate(first)
        ).toISOString();
        let diffDays = Math.round(
          Math.abs(
            (new Date(
              Date.UTC(
                curr.getFullYear(),
                curr.getMonth(),
                curr.getDate(),
                23,
                59,
                59
              )
            ) -
              new Date(firstday)) /
              oneDay
          )
        ); //Days since last week
        let last = first + diffDays;
        let lastday = new Date(
          new Date(
            Date.UTC(
              curr.getFullYear(),
              curr.getMonth(),
              curr.getDate(),
              23,
              59,
              59
            )
          ).setDate(last)
        ).toISOString();
        let Query2 = `'$gte':'${firstday}','$lte':'${lastday}'`;
        setfilter(Query2);
        setoption(_search);
        break;
      case "Last 7 days":
        let d7 = new Date();
        let d7l = new Date();
        d7.setDate(d7.getDate() - 7);
        let l7t = new Date(
          Date.UTC(d7l.getFullYear(), d7l.getMonth(), d7l.getDate(), 23, 59, 59)
        ).toISOString();
        let date7 = new Date(
          Date.UTC(d7.getFullYear(), d7.getMonth(), d7.getDate(), 0, 0, 0)
        ).toISOString();
        let Query7 = `'$gte':'${date7}','$lte':'${l7t}'`;
        setfilter(Query7);
        setoption(_search);
        break;
      case "Last 14 days":
        let d14 = new Date();
        let d14l = new Date();
        let l14t = new Date(
          Date.UTC(
            d14l.getFullYear(),
            d14l.getMonth(),
            d14l.getDate(),
            23,
            59,
            59
          )
        ).toISOString();
        d14.setDate(d14.getDate() - 14);
        let date14 = new Date(
          Date.UTC(d14.getFullYear(), d14.getMonth(), d14.getDate(), 0, 0, 0)
        ).toISOString();

        let Query14 = `'$gte':'${date14}','$lte':'${l14t}'`;
        setfilter(Query14);
        setoption(_search);
        break;
      case "Last 30 days":
        let d30 = new Date();
        let d30l = new Date();
        let l30t = new Date(
          Date.UTC(
            d30l.getFullYear(),
            d30l.getMonth(),
            d30l.getDate(),
            23,
            59,
            59
          )
        ).toISOString();
        d30.setDate(d30.getDate() - 30);
        let date30 = new Date(
          Date.UTC(d30.getFullYear(), d30.getMonth(), d30.getDate(), 0, 0, 0)
        ).toISOString();
        let Query30 = `'$gte':'${date30}','$lte':'${l30t}'`;
        setfilter(Query30);
        setoption(_search);
        break;
      case "Last week":
        const from_date = moment().startOf("week").subtract(7, "days");
        const to_date = moment().endOf("week").subtract(7, "days");
        let Queryl = `'$gte':'${from_date.toISOString()}','$lte':'${to_date.toISOString()}'`;
        setfilter(Queryl);
        setoption(_search);
        break;
      case "This month":
        var tdate = new Date();
        var tfirstDay = new Date(
          tdate.getFullYear(),
          tdate.getMonth(),
          1
        ).toISOString();
        var tlastDay = new Date(
          tdate.getFullYear(),
          tdate.getMonth() + 1,
          0
        ).toISOString();
        let Querylt = `'$gte':'${tfirstDay}','$lte':'${tlastDay}'`;
        setfilter(Querylt);
        setoption(_search);
        break;
      case "Last month":
        var ldate = new Date();
        var lfirstDay = new Date(
          ldate.getFullYear(),
          ldate.getMonth() - 1,
          2
        ).toISOString();
        var llastDay = new Date(
          ldate.getFullYear(),
          ldate.getMonth(),
          1
        ).toISOString();
        let Queryltl = `'$gte':'${lfirstDay}','$lte':'${llastDay}'`;
        setfilter(Queryltl);
        setoption(_search);
        break;
      case "All":
        let fall = new Date(
          new Date().getFullYear() - 100,
          0,
          1,
          0,
          0,
          0
        ).toISOString();
        let fall_year = `'$gte':'${fall}'`;
        setfilter(fall_year);
        setoption(_search);
        break;
      case "This year":
        let fcy = new Date(
          new Date().getFullYear(),
          0,
          1,
          0,
          0,
          0
        ).toISOString();
        let lcy = new Date(
          new Date().getFullYear(),
          11,
          31,
          23,
          59,
          59
        ).toISOString();
        let cur_year = `'$gte':'${fcy}','$lte':'${lcy}'`;
        setfilter(cur_year);
        setoption(_search);
        break;
      case "Last year":
        let fly = new Date(
          new Date().getFullYear() - 1,
          0,
          1,
          0,
          0,
          0
        ).toISOString();
        let lly = new Date(
          new Date().getFullYear() - 1,
          11,
          31,
          23,
          59,
          59
        ).toISOString();
        let last_year = `'$gte':'${fly}','$lte':'${lly}'`;
        setfilter(last_year);
        setoption(_search);
        break;
      default:
        setoption(_search);
        break;
    }
  };
  const renderSwitchWithTour = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className={"bg-[#2ed8b6] rounded-md shadow mb-4 md:mb-0"}
            data-tut={col.widget.data.tourSection}
            style={{ background: col.widget.bgColor }}
          >
            <Suspense fallback={<div>please wait</div>}>
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Filter={filter}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
                DefaultQuery={props.DefaultQuery}
              />
            </Suspense>
          </div>
        );
      case "customeHtml":
        return (
          <div data-tut={col.widget.data.tourSection}>
            <select
              id="searchFiltr"
              className="form-control"
              value={
                option ||
                localStorage.getItem("DashboardDefaultFilter") ||
                col.widget.data[0].default
              }
              onChange={onSearchFilter}
            >
              {col.widget.data[0].options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <br />
          </div>
        );

      case "customeTag":
        return (
          <h3
            data-tut={col.widget.data.tourSection}
            style={{
              marginBottom: "4px",
              color: "currentColor",
              marginLeft: "4px"
            }}
          >
            {col.widget.label}
          </h3>
        );
      case "report":
        let _filter = `${col.widget.filterKey}:${filter}`;
        return (
          <div data-tut={col.widget.data.tourSection}>
            <Suspense fallback={<div>please wait</div>}>
              <div className="mb-4 md:mb-0">
                <DashboardReport Filter={_filter} Record={col.widget} />
              </div>
            </Suspense>
          </div>
        );
      default:
        return null;
    }
  };
  const renderSwitch = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className={"bg-[#2ed8b6] rounded-md shadow mb-4 md:mb-0"}
            style={{ background: col.widget.bgColor }}
          >
            <Suspense fallback={<div>please wait</div>}>
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Filter={filter}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
                DefaultQuery={props.DefaultQuery}
              />
            </Suspense>
          </div>
        );
      case "customeHtml":
        return (
          <div>
            <select
              id="searchFiltr"
              className="form-control"
              value={
                option ||
                localStorage.getItem("DashboardDefaultFilter") ||
                col.widget.data[0].default
              }
              onChange={onSearchFilter}
            >
              {col.widget.data[0].options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <br />
          </div>
        );

      case "customeTag":
        return (
          <h3
            style={{
              marginBottom: "4px",
              color: "currentColor",
              marginLeft: "4px"
            }}
          >
            {col.widget.label}
          </h3>
        );
      case "report":
        let _filter = `${col.widget.filterKey}:${filter}`;
        return (
          <Suspense fallback={<div>please wait</div>}>
            <div className="mb-4 md:mb-0">
              <DashboardReport Filter={_filter} Record={col.widget} />
            </div>
          </Suspense>
        );
      default:
        return null;
    }
  };
  return (
    <ErrorBoundary>
      <div>
        {props.dashboard.map((val, key) => (
          <div key={"a" + key} className="row">
            {val.columns.map((col, i) =>
              col.widget.data && col.widget.data.tourSection ? (
                <div key={i} className={props.classnameArray[key][i]}>
                  {renderSwitchWithTour(col)}
                </div>
              ) : (
                <div key={i} className={props.classnameArray[key][i]}>
                  {renderSwitch(col)}
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </ErrorBoundary>
  );
};

export default GetDashboard;
