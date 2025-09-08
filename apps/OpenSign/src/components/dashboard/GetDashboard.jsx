import React, { Suspense } from "react";
import { lazyWithRetry } from "../../utils";
import { useTranslation } from "react-i18next";
const DashboardButton = lazyWithRetry(() => import("./DashboardButton"));
const DashboardCard = lazyWithRetry(() => import("./DashboardCard"));
const DashboardReport = lazyWithRetry(() => import("./DashboardReport"));
const buttonList = [
  {
    label: "Sign yourself",
    redirectId: "sHAnZphf69",
    redirectType: "Form",
    icon: "fa-light fa-pen-nib"
  },
  {
    label: "Request signatures",
    redirectId: "8mZzFxbG1z",
    redirectType: "Form",
    icon: "fa-light fa-paper-plane"
  }
];
const GetDashboard = (props) => {
  const { t } = useTranslation();
  const Button = ({ label, redirectId, redirectType, icon }) => (
    <DashboardButton
      Icon={icon}
      Label={label}
      Data={{ Redirect_type: redirectType, Redirect_id: redirectId }}
    />
  );
  const renderSwitchWithTour = (col) => {
    switch (col.widget.type) {
      case "Card":
        return (
          <div
            className={`${
              col?.widget?.bgColor ? col.widget.bgColor : "bg-[#2ed8b6]"
            } op-card w-full h-[140px] px-3 pt-4 mb-3 shadow-md`}
            data-tut={col.widget.data.tourSection}
          >
            <Suspense
              fallback={
                <div className="h-[150px] w-full flex justify-center items-center">
                  {t("loading")}
                </div>
              }
            >
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
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
            className={`${
              col?.widget?.bgColor ? col.widget.bgColor : "bg-[#2ed8b6]"
            } op-card w-full h-[140px] px-3 pt-4 mb-3 shadow-md"`}
          >
            <Suspense fallback={<div>please wait</div>}>
              <DashboardCard
                Icon={col.widget.icon}
                Label={col.widget.label}
                Format={col.widget.format && col.widget.format}
                Data={col.widget.data}
                FilterData={col.widget.filter}
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
            <div key={i} className={col?.colsize}>
              {renderSwitchWithTour(col)}
            </div>
          ) : (
            <div key={i} className={col?.colsize}>
              {renderSwitch(col)}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GetDashboard;
