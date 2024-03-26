import React, { Suspense, lazy } from "react";
const DashboardButton = lazy(() => import("./DashboardButton"));
const DashboardCard = lazy(() => import("./DashboardCard"));
const DashboardReport = lazy(() => import("./DashboardReport"));
const buttonList = [
  {
    label: "Sign yourself",
    redirectId: "sHAnZphf69",
    redirectType: "Form",
    icon: "fas fa-pen-nib"
  },
  {
    label: "Request signature",
    redirectId: "8mZzFxbG1z",
    redirectType: "Form",
    icon: "fa-solid fa-paper-plane"
  }
];
const GetDashboard = (props) => {
  const Button = ({ label, redirectId, redirectType, icon }) => (
    <div className={"bg-white rounded-md shadow  w-full"}>
      <Suspense
        fallback={
          <div style={{ height: "300px" }}>
            <div
              style={{
                marginLeft: "45%",
                marginTop: "150px",
                fontSize: "45px",
                color: "#3dd3e0"
              }}
              className="loader-37"
            ></div>
          </div>
        }
      >
        <DashboardButton
          Icon={icon}
          Label={label}
          Data={{ Redirect_type: redirectType, Redirect_id: redirectId }}
        />
      </Suspense>
    </div>
  );
  const renderSwitchWithTour = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className={"bg-[#2ed8b6] rounded-md shadow mb-3 md:mb-0"}
            data-tut={col.widget.data.tourSection}
            style={{ background: col.widget.bgColor }}
          >
            <Suspense
              fallback={
                <div style={{ height: "300px" }}>
                  <div
                    style={{
                      marginLeft: "45%",
                      marginTop: "150px",
                      fontSize: "45px",
                      color: "#3dd3e0"
                    }}
                    className="loader-37"
                  ></div>
                </div>
              }
            >
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
              <div className="mb-3 md:mb-0">
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
            className={"bg-[#2ed8b6] rounded-md shadow mb-3 md:mb-0"}
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
            <div className="mb-3 md:mb-0">
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
    <div>
      <div className="mb-3">
        <div
          data-tut={"tourbutton"}
          className="flex flex-col md:flex-row gap-6 md:gap-8"
        >
          {buttonList.map((btn) => (
            <Button
              key={btn.label}
              label={btn.label}
              redirectType={btn.redirectType}
              redirectId={btn.redirectId}
              icon={btn.icon}
            />
          ))}
        </div>
      </div>
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
  );
};

export default GetDashboard;
