import React from "react";
import "../../styles/loader.css";
import { useNavigate } from "react-router-dom";
import { openInNewTab } from "../../constant/Utils";

const DashboardButton = (props) => {
  const navigate = useNavigate();

  function openReport() {
    if (props.Data && props.Data.Redirect_type) {
      const Redirect_type = props.Data.Redirect_type;
      const id = props.Data.Redirect_id;
      if (Redirect_type === "Form") {
        navigate(`/form/${id}`);
      } else if (Redirect_type === "Report") {
        navigate(`/report/${id}`);
      } else if (Redirect_type === "Url") {
        openInNewTab(id);
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
      } w-full shadow-md px-3 py-2 opcard bg-base-100`}
    >
      <div className="flex flex-row items-center">
        <span className="rounded-full bg-base-content bg-opacity-20 w-[60px] h-[60px] self-start flex justify-center items-center">
          <i
            className={`${
              props.Icon ? props.Icon : "fa fa-solid fa-info"
            } text-[25px] lg:text-[30px]`}
          ></i>
        </span>
        <div className="opcard-title text-lg ml-3 text-base-content">
          {props.Label}
        </div>
      </div>
    </div>
  );
};

export default DashboardButton;
