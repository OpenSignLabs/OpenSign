import React, { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Pgsignup from "./routes/Pgsignup";
import Login from "./routes/Login";
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
import GenerateToken from "./routes/GenerateToken";
import ValidateRoute from "./primitives/ValidateRoute";
import Webhook from "./routes/Webhook";
import Validate from "./primitives/Validate";
import DebugPdf from "./routes/DebugPdf";
import ManageSign from "./routes/Managesign";
import Opensigndrive from "./routes/Opensigndrive";
import TemplatePlaceholder from "./routes/TemplatePlaceholder";
import { pdfjs } from "react-pdf";
import SignYourSelf from "./routes/SignyourselfPdf";
import DraftDocument from "./components/pdf/DraftDocument";
import PlaceHolderSign from "./routes/PlaceHolderSign";
import PdfRequestFiles from "./routes/PdfRequestFiles";
import GuestLogin from "./routes/GuestLogin";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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
              <Route
                exact
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
            <Route path="/loadmf/signmicroapp/login" element={<GuestLogin />} />
            {/* login page route */}
            <Route
              path="/login/:id/:userMail/:contactBookId/:serverUrl"
              element={<GuestLogin />}
            />

            <Route path="/debugpdf" element={<DebugPdf />} />
            <Route exact path="/forgetpassword" element={<ForgetPassword />} />
            {process.env.REACT_APP_ENABLE_SUBSCRIPTION && (
              <>
                <Route exact path="/pgsignup" element={<Pgsignup />} />
                <Route exact path="/subscription" element={<Subscriptions />} />
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
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
