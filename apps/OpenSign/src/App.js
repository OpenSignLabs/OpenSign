import React, { useState, useEffect, lazy } from "react";
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
import TemplatePlaceholder from "./pages/TemplatePlaceholder";
import SignYourSelf from "./pages/SignyourselfPdf";
import DraftDocument from "./components/pdf/DraftDocument";
import PlaceHolderSign from "./pages/PlaceHolderSign";
import PdfRequestFiles from "./pages/PdfRequestFiles";
import LazyPage from "./primitives/LazyPage";
import { isEnableSubscription } from "./constant/const";
import SSOVerify from "./pages/SSOVerify";
import Loader from "./primitives/Loader";
const DebugPdf = lazy(() => import("./pages/DebugPdf"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword"));
const GuestLogin = lazy(() => import("./pages/GuestLogin"));
const Pgsignup = lazy(() => import("./pages/Pgsignup"));
const Subscriptions = lazy(() => import("./pages/PlanSubscriptions"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Signup = lazy(() => import("./pages/Signup"));
const Opensigndrive = lazy(() => import("./pages/Opensigndrive"));
const ManageSign = lazy(() => import("./pages/Managesign"));
const GenerateToken = lazy(() => import("./pages/GenerateToken"));
const Webhook = lazy(() => import("./pages/Webhook"));

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
const AppLoader = () => {
  return (
    <div className="flex justify-center items-center h-[100vh]">
      <Loader />
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
    <div className="bg-base-200">
      {isloading ? (
        <AppLoader />
      ) : (
        <BrowserRouter>
          <Routes>
            <Route element={<ValidateRoute />}>
              <Route exact path="/" element={<Login />} />
              <Route path="/signup" element={<LazyPage Page={Signup} />} />
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
              element={<LazyPage Page={GuestLogin} />}
            />
            <Route
              path="/login/:id/:userMail/:contactBookId/:serverUrl"
              element={<LazyPage Page={GuestLogin} />}
            />
            <Route
              path="/login/:base64url"
              element={<LazyPage Page={GuestLogin} />}
            />
            <Route path="/debugpdf" element={<LazyPage Page={DebugPdf} />} />
            <Route
              path="/forgetpassword"
              element={<LazyPage Page={ForgetPassword} />}
            />
            {isEnableSubscription && (
              <>
                <Route
                  path="/pgsignup"
                  element={<LazyPage Page={Pgsignup} />}
                />
                <Route
                  path="/subscription"
                  element={<LazyPage Page={Subscriptions} />}
                />
              </>
            )}
            <Route element={<HomeLayout />}>
              <Route
                path="/changepassword"
                element={<LazyPage Page={ChangePassword} />}
              />
              <Route path="/form/:id" element={<Form />} />
              <Route path="/report/:id" element={<Report />} />
              <Route path="/dashboard/:id" element={<Dashboard />} />
              <Route
                path="/profile"
                element={<LazyPage Page={UserProfile} />}
              />
              <Route
                path="/opensigndrive"
                element={<LazyPage Page={Opensigndrive} />}
              />
              <Route
                path="/managesign"
                element={<LazyPage Page={ManageSign} />}
              />
              <Route
                path="/generatetoken"
                element={<LazyPage Page={GenerateToken} />}
              />
              <Route path="/webhook" element={<LazyPage Page={Webhook} />} />
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
            <Route path="/sso" element={<SSOVerify />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
