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
  const handleServerUrl = () => {
    localStorage.setItem("accesstoken", session);
    const returnUrl = queryParams.get("returnUrl");
    localStorage.setItem("returnUrl", returnUrl);

    setTimeout(() => {
      const goto = queryParams.get("goto");
      navigate(goto || "/");
    }, 400);

    setIsLoading(false);
  };

  useEffect(() => {
    handleServerUrl();
  }, [handleServerUrl]);

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
