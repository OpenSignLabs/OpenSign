import React, { Suspense, lazy } from "react";
import ErrorBoundary from "../ErrorBoundary";

const DashboardCard = lazy(() => import("./DashboardCard"));

const DashboardReport = lazy(() => import("./DashboardReport"));

const GetDashboard = (props) => {
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
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
                DefaultQuery={props.DefaultQuery}
              />
            </Suspense>
          </div>
        );
      case "report": {
        return (
          <div data-tut={col.widget.data.tourSection}>
            <Suspense fallback={<div>please wait</div>}>
              <div className="mb-4 md:mb-0">
                <DashboardReport Record={col.widget} />
              </div>
            </Suspense>
          </div>
        );
      }
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
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
                DefaultQuery={props.DefaultQuery}
              />
            </Suspense>
          </div>
        );
      case "report": {
        return (
          <Suspense fallback={<div>please wait</div>}>
            <div className="mb-4 md:mb-0">
              <DashboardReport Record={col.widget} />
            </div>
          </Suspense>
        );
      }
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
