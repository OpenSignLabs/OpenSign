import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Pgsignup from "./routes/Pgsignup";
import Login from "./routes/Login";
import Microapp from "./routes/RemoteApp";
import Signup from "./routes/Signup";
import Form from "./routes/Form";
import Report from "./routes/Report";
import Dashboard from "./routes/Dashboard";
import PlanSubscriptions from "./routes/PlanSubscriptions";
import HomeLayout from "./layout/HomeLayout";
import UserProfile from "./routes/UserProfile";
import PageNotFound from "./routes/PageNotFound";
import ForgetPassword from "./routes/ForgetPassword";
import ChangePassword from "./routes/ChangePassword";
import ReportMicroapp from "./components/ReportMicroapp";
import LoadMf from "./routes/LoadMf";
import GenerateToken from "./routes/GenerateToken";

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
            <Route exact path="/" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
            <Route exact path="/loadmf/:remoteApp/*" element={<LoadMf />} />
            <Route exact path="/forgetpassword" element={<ForgetPassword />} />
            {process.env.REACT_APP_ENABLE_SUBSCRIPTION && (
              <>
                <Route exact path="/pgsignup" element={<Pgsignup />} />
                <Route
                  exact
                  path="/subscription"
                  element={<PlanSubscriptions />}
                />
              </>
            )}
            <Route
              exact
              path="/changepassword"
              element={
                <HomeLayout>
                  <ChangePassword />
                </HomeLayout>
              }
            />
            <Route
              path="/mf/:remoteApp/*"
              element={
                <HomeLayout>
                  <Microapp />
                </HomeLayout>
              }
            />
            <Route
              path="/asmf/:remoteApp/*"
              element={
                <HomeLayout>
                  <Microapp />
                </HomeLayout>
              }
            />
            <Route
              path="/rpmf/:remoteApp/*"
              element={
                <HomeLayout>
                  <ReportMicroapp />
                </HomeLayout>
              }
            />
            <Route
              path="/form/:id"
              element={
                <HomeLayout>
                  <Form />
                </HomeLayout>
              }
            />
            <Route
              path="/report/:id"
              element={
                <HomeLayout>
                  <Report />
                </HomeLayout>
              }
            />
            <Route
              path="/dashboard/:id"
              element={
                <HomeLayout>
                  <Dashboard />
                </HomeLayout>
              }
            />

            <Route
              path="/profile"
              element={
                <HomeLayout>
                  <UserProfile />
                </HomeLayout>
              }
            />
            <Route
              path="/generatetoken"
              element={
                <HomeLayout>
                  <GenerateToken />
                </HomeLayout>
              }
            />
            <Route path="*" element={<PageNotFound />} />
            {/* <Route exact path="/ForgotPassword" element={<ForgotPassword />} /> */}
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
