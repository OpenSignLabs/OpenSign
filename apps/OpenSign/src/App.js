import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { pdfjs } from "react-pdf";
import Login from "./pages/Login";
import Form from "./pages/Form";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import HomeLayout from "./layout/HomeLayout";
import PageNotFound from "./pages/PageNotFound";
import ValidateRoute from "./primitives/ValidateRoute";
import Validate from "./primitives/Validate";
import ManageSign from "./pages/Managesign";
import TemplatePlaceholder from "./pages/TemplatePlaceholder";
import SignYourSelf from "./pages/SignyourselfPdf";
import DraftDocument from "./components/pdf/DraftDocument";
import PlaceHolderSign from "./pages/PlaceHolderSign";
import PdfRequestFiles from "./pages/PdfRequestFiles";
const DebugPdf = lazy(() => import("./pages/DebugPdf"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword"));
const GuestLogin = lazy(() => import("./pages/GuestLogin"));
const Pgsignup = lazy(() => import("./pages/Pgsignup"));
const Subscriptions = lazy(() => import("./pages/PlanSubscriptions"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Signup = lazy(() => import("./pages/Signup"));
const GenerateToken = lazy(() => import("./pages/GenerateToken"));
const Webhook = lazy(() => import("./pages/Webhook"));
const Opensigndrive = lazy(() => import("./pages/Opensigndrive"));
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Loader = () => {
  return (
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
  );
};
function App() {
  const [isloading, setIsLoading] = useState(true);
  useEffect(() => {
    handleCredentials();
  }, []);

  const handleCredentials = () => {
    const appId = process.env.REACT_APP_APPID
      ? process.env.REACT_APP_APPID
      : "opensign";
    const baseurl = process.env.REACT_APP_SERVERURL
      ? process.env.REACT_APP_SERVERURL
      : window.location.origin + "/api/app";
    const appName = "contracts";
    try {
      localStorage.setItem("baseUrl", `${baseurl}/`);
      localStorage.setItem("parseAppId", appId);
      localStorage.setItem("domain", appName);
      setIsLoading(false);
    } catch (error) {
      console.log("err ", error);
    }
  };

  return (
    <div className="bg-[#eef1f5]">
      {isloading ? (
        <Loader />
      ) : (
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route element={<ValidateRoute />}>
                <Route exact path="/" element={<Login />} />
                <Route exact path="/signup" element={<Signup />} />
              </Route>
              <Route element={<Validate />}>
                <Route
                  path="/load/template/:templateId"
                  element={<TemplatePlaceholder />}
                />
                <Route
                  exact
                  path="/load/placeholdersign/:docId"
                  element={<PlaceHolderSign />}
                />
                <Route
                  exact
                  path="/load/recipientSignPdf/:docId/:contactBookId"
                  element={<PdfRequestFiles />}
                />
              </Route>
              <Route
                path="/loadmf/signmicroapp/login/:id/:userMail/:contactBookId/:serverUrl"
                element={<GuestLogin />}
              />
              <Route
                path="/login/:id/:userMail/:contactBookId/:serverUrl"
                element={<GuestLogin />}
              />
              <Route path="/debugpdf" element={<DebugPdf />} />
              <Route path="/forgetpassword" element={<ForgetPassword />} />
              {process.env.REACT_APP_ENABLE_SUBSCRIPTION && (
                <>
                  <Route exact path="/pgsignup" element={<Pgsignup />} />
                  <Route path="/subscription" element={<Subscriptions />} />
                </>
              )}
              <Route element={<HomeLayout />}>
                <Route path="/changepassword" element={<ChangePassword />} />
                <Route path="/form/:id" element={<Form />} />
                <Route path="/report/:id" element={<Report />} />
                <Route path="/dashboard/:id" element={<Dashboard />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/generatetoken" element={<GenerateToken />} />
                <Route path="/webhook" element={<Webhook />} />
                <Route path="/managesign" element={<ManageSign />} />
                <Route path="/opensigndrive" element={<Opensigndrive />} />
                <Route
                  path="/template/:templateId"
                  element={<TemplatePlaceholder />}
                />
                {/* signyouself route with no rowlevel data using docId from url */}
                <Route path="/signaturePdf/:docId" element={<SignYourSelf />} />
                {/* draft document route to handle and navigate route page accordiing to document status */}
                <Route path="/draftDocument" element={<DraftDocument />} />
                {/* recipient placeholder set route with no rowlevel data using docId from url*/}
                <Route
                  path="/placeHolderSign/:docId"
                  element={<PlaceHolderSign />}
                />
                {/* for user signature (need your sign route) with row level data */}
                <Route path="/pdfRequestFiles" element={<PdfRequestFiles />} />
                {/* for user signature (need your sign route) with no row level data */}
                <Route
                  path="/pdfRequestFiles/:docId"
                  element={<PdfRequestFiles />}
                />
                {/* recipient signature route with no rowlevel data using docId from url */}
                <Route
                  path="/recipientSignPdf/:docId/:contactBookId"
                  element={<PdfRequestFiles />}
                />
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
