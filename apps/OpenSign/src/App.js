import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Pgsignup from "./routes/Pgsignup";
import Login from "./routes/Login";
import Microapp from "./routes/RemoteApp";
import Signup from "./routes/Signup";
import Form from "./routes/Form";
import Report from "./routes/Report";
import Dashboard from "./routes/Dashboard";
import Subscriptions from "./routes/PlanSubscriptions";
import HomeLayout from "./layout/HomeLayout";
import UserProfile from "./routes/UserProfile";
import PageNotFound from "./routes/PageNotFound";
import ForgetPassword from "./routes/ForgetPassword";
import ChangePassword from "./routes/ChangePassword";
import ReportMicroapp from "./components/ReportMicroapp";
import LoadMf from "./routes/LoadMf";
import GenerateToken from "./routes/GenerateToken";
import ValidateRoute from "./primitives/ValidateRoute";
import Webhook from "./routes/Webhook";
import Validate from "./primitives/Validate";

function App() {
  const [isloading, setIsLoading] = useState(true);
  useEffect(() => {
    handleCredentials();
  }, []);

  const handleCredentials = () => {
    const appId = process.env.REACT_APP_APPID;
    const baseurl = process.env.REACT_APP_SERVERURL;
    const appName = "contracts";
    try {
      localStorage.setItem("BaseUrl12", `${baseurl}/`);
      localStorage.setItem("AppID12", appId);
      localStorage.setItem("domain", appName);
      setIsLoading(false);
    } catch (error) {
      console.log("err ", error);
    }
  };

  return (
    <div className="bg-[#eef1f5]">
      {isloading ? (
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              fontSize: "45px",
              color: "#3dd3e0"
            }}
            className="loader-37"
          ></div>
        </div>
      ) : (
        <BrowserRouter>
          <Routes>
            <Route element={<ValidateRoute />}>
              <Route exact path="/" element={<Login />} />
              <Route exact path="/signup" element={<Signup />} />
            </Route>
            <Route element={<Validate />}>
              <Route exact path="/load/:remoteApp/*" element={<LoadMf />} />
            </Route>
            <Route exact path="/loadmf/:remoteApp/*" element={<LoadMf />} />
            <Route exact path="/forgetpassword" element={<ForgetPassword />} />
            {process.env.REACT_APP_ENABLE_SUBSCRIPTION && (
              <>
                <Route exact path="/pgsignup" element={<Pgsignup />} />
                <Route exact path="/subscription" element={<Subscriptions />} />
              </>
            )}
            <Route element={<HomeLayout />}>
              <Route path="/changepassword" element={<ChangePassword />} />
              <Route path="/mf/:remoteApp/*" element={<Microapp />} />
              <Route path="/asmf/:remoteApp/*" element={<Microapp />} />
              <Route path="/rpmf/:remoteApp/*" element={<ReportMicroapp />} />
              <Route path="/form/:id" element={<Form />} />
              <Route path="/report/:id" element={<Report />} />
              <Route path="/dashboard/:id" element={<Dashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/generatetoken" element={<GenerateToken />} />
              <Route path="/webhook" element={<Webhook />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
