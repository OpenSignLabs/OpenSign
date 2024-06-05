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
    <>
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
    </>
  );
  const renderSwitchWithTour = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className="opcard bg-[#2ed8b6] w-full h-[140px] px-3 pt-4 mb-3 shadow-md"
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
        return <></>;
    }
  };
  const renderSwitch = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className="opcard bg-[#2ed8b6] w-full h-[140px] px-3 pt-4 mb-3 shadow-md"
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
        return <></>;
    }
  };
  return (
    <div>
      <div className="mb-3">
        <div
          data-tut={"tourbutton"}
          className="flex flex-col md:flex-row gap-4"
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
      <div className="grid grid-cols-12 w-full gap-x-4">
        {props?.dashboard?.columns?.map((col, i) =>
          col.widget.data && col.widget.data.tourSection ? (
            <div
              key={i}
              className={`${
                props?.classnameArray?.[i]
                  ? props?.classnameArray[i]
                  : "col-span-12"
              }`}
            >
              {renderSwitchWithTour(col)}
            </div>
          ) : (
            <div
              key={i}
              className={`${
                props?.classnameArray?.[i]
                  ? props?.classnameArray[i]
                  : "col-span-12"
              }`}
            >
              {renderSwitch(col)}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GetDashboard;
