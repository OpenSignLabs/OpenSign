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
      } w-full px-3 py-2 flex text-white rounded-md shadow overflow-hidden`}
    >
      <div className="flex items-center justify-start gap-5">
        <span className="rounded-full bg-black bg-opacity-20 w-[60px] h-[60px]  self-start flex justify-center items-center">
          <i
            className={`${
              props.Icon ? props.Icon : "fa fa-solid fa-info"
            } text-[25px] lg:text-[30px]`}
          ></i>
        </span>
        <div className="">
          <div className="text-base lg:text-lg text-black"> {props.Label}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardButton;
