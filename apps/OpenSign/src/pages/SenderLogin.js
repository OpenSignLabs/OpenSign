import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Loader from "../primitives/Loader";
import SelectLanguage from "../components/pdf/SelectLanguage";

function SenderLogin() {
  const { session } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    handleServerUrl();
  }, []);

  //function generate serverUrl and parseAppId from url and save it in local storage
  const handleServerUrl = async () => {
    localStorage.setItem("accesstoken", session);

    setTimeout(() => {
      const goto = queryParams.get("goto");
      navigate(goto || "/");
    }, 400);

    setIsLoading(false);
  };

  return (
    <div className="p-14">
      <div>
        <div className="flex flex-col justify-center items-center h-[100vh]">
          <Loader />
          <span className="text-[13px] text-[gray]">{isLoading.message}</span>
        </div>
      </div>
      <SelectLanguage />
    </div>
  );
}

export default SenderLogin;
