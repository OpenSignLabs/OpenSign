import { useState, useEffect } from "react";
import { lazyWithRetry } from "./utils/lazyWithRetry";
import { hideUpgradeProgress } from "./utils/upgradeProgress";
import { Routes, Route, BrowserRouter, Navigate } from "react-router";
import { getEnv } from "./constant/utils/UtilsPart01.js";
import HomeLayout from "./layout/HomeLayout";
import PageNotFound from "./pages/PageNotFound";
import ValidateRoute from "./primitives/ValidateRoute";
import Validate from "./primitives/Validate";
import Lazy from "./primitives/LazyPage";
import Loader from "./primitives/Loader";
import UserList from "./pages/UserList";
import { serverUrl_fn } from "./constant/appinfo";
import DocSuccessPage from "./pages/DocSuccessPage";
import DragProvider from "./components/DragProivder";
import Title from "./components/Title";
import LocalQaTranslations from "./qa/LocalQaTranslations";
import {
  isLocalQaIdentityEnabled,
  LOCAL_QA_DASHBOARD_ID
} from "./qa/localQaIdentity";
const DebugPdf = lazyWithRetry(() => import("./pages/DebugPdf"));
const ForgetPassword = lazyWithRetry(() => import("./pages/ForgetPassword"));
const GuestLogin = lazyWithRetry(() => import("./pages/GuestLogin"));
const ChangePassword = lazyWithRetry(() => import("./pages/ChangePassword"));
const UserProfile = lazyWithRetry(() => import("./pages/UserProfile"));
const Opensigndrive = lazyWithRetry(() => import("./pages/Opensigndrive"));
const ManageSign = lazyWithRetry(() => import("./pages/Managesign"));
const AddAdmin = lazyWithRetry(() => import("./pages/AddAdmin"));
const UpdateExistUserAdmin = lazyWithRetry(
  () => import("./pages/UpdateExistUserAdmin")
);
const Preferences = lazyWithRetry(() => import("./pages/Preferences"));
const Login = lazyWithRetry(() => import("./pages/Login"));
const VerifyDocument = lazyWithRetry(() => import("./pages/VerifyDocument"));
const EmailBuilder = lazyWithRetry(() => import("./pages/EmailBuilder"));
// The PDF editor pages stay out of the login chunk: react-pdf, pdf-lib and
// react-datepicker only load when one of these routes renders (#55).
const Form = lazyWithRetry(() => import("./pages/Form"));
const Report = lazyWithRetry(() => import("./pages/Report"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const TemplatePlaceholder = lazyWithRetry(
  () => import("./pages/TemplatePlaceholder")
);
const SignYourSelf = lazyWithRetry(() => import("./pages/SignyourselfPdf"));
const DraftDocument = lazyWithRetry(
  () => import("./components/pdf/DraftDocument")
);
const PlaceHolderSign = lazyWithRetry(() => import("./pages/PlaceHolderSign"));
const PdfRequestFiles = lazyWithRetry(() => import("./pages/PdfRequestFiles"));
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
    // initialize creds
    const id = process.env.REACT_APP_APPID ?? "opensign";
    localStorage.setItem("parseAppId", id);
    localStorage.setItem("baseUrl", `${serverUrl_fn()}/`);
    hideUpgradeProgress();
    localStorage.removeItem("showUpgradeProgress");
    setIsLoading(false);
  }, []);

  return (
    <div className="bg-base-200">
      {isloading ? (
        <AppLoader />
      ) : (
        <BrowserRouter basename={(() => {
          try {
            // import.meta.env.BASE_URL always reflects the Vite base, so a
            // build-time PUBLIC_URL reaches the router too.
            const raw =
              getEnv()?.PUBLIC_URL ||
              process.env.PUBLIC_URL ||
              import.meta.env.BASE_URL;
            if (raw) {
              const u = new URL(raw, window.location.origin);
              return u.pathname.replace(/\/$/, "") || "/";
            }
          } catch (e) { /* ignore */ }
          return "/";
        })()}>
          <Title />
          <Routes>
            <Route element={<ValidateRoute />}>
              <Route
                exact
                path="/"
                element={
                  isLocalQaIdentityEnabled() ? (
                    <Navigate
                      to={`/dashboard/${LOCAL_QA_DASHBOARD_ID}`}
                      replace
                    />
                  ) : (
                    <Lazy Page={Login} />
                  )
                }
              />
                  <Route path="/addadmin" element={<Lazy Page={AddAdmin} />} />
                  <Route
                    path="/upgrade-2.1"
                    element={<Lazy Page={UpdateExistUserAdmin} />}
                  />
            </Route>
            <Route element={<Validate />}>
              <Route
                exact
                path="/load/recipientSignPdf/:docId/:contactBookId"
                element={<DragProvider Page={PdfRequestFiles} lazy />}
              />
            </Route>
            <Route
              path="/login/:base64url"
              element={<Lazy Page={GuestLogin} />}
            />
            <Route path="/debugpdf" element={<Lazy Page={DebugPdf} />} />
              <Route
                path="/forgetpassword"
                element={<Lazy Page={ForgetPassword} />}
              />
            <Route element={<HomeLayout />}>
              {isLocalQaIdentityEnabled() && (
                <Route
                  path="/local-qa/translations"
                  element={<LocalQaTranslations />}
                />
              )}
                  <Route path="/users" element={<UserList />} />
                  <Route
                    path="/changepassword"
                    element={<Lazy Page={ChangePassword} />}
                  />
              <Route path="/form/:id" element={<Lazy Page={Form} />} />
              <Route path="/report/:id" element={<Lazy Page={Report} />} />
              <Route path="/dashboard/:id" element={<Lazy Page={Dashboard} />} />
              <Route path="/profile" element={<Lazy Page={UserProfile} />} />
              <Route path="/drive" element={<Lazy Page={Opensigndrive} />} />
              <Route path="/managesign" element={<Lazy Page={ManageSign} />} />
              <Route
                path="/template/:templateId"
                element={<DragProvider Page={TemplatePlaceholder} lazy />}
              />
              {/* signyouself route with no rowlevel data using docId from url */}
              <Route
                path="/signaturePdf/:docId"
                element={<DragProvider Page={SignYourSelf} lazy />}
              />
              {/* draft document route to handle and navigate route page according to document status */}
              <Route
                path="/draftDocument"
                element={<DragProvider Page={DraftDocument} lazy />}
              />
              {/* recipient placeholder set route with no rowlevel data using docId from url*/}
              <Route
                path="/placeHolderSign/:docId"
                element={<DragProvider Page={PlaceHolderSign} lazy />}
              />
              {/* recipient signature route with no rowlevel data using docId from url */}
              <Route
                path="/recipientSignPdf/:docId/:contactBookId"
                element={<DragProvider Page={PdfRequestFiles} lazy />}
              />
              <Route
                path="/recipientSignPdf/:docId"
                element={<DragProvider Page={PdfRequestFiles} lazy />}
              />
              <Route
                path="/verify-document"
                element={<Lazy Page={VerifyDocument} />}
              />
              <Route
                path="/preferences"
                element={<Lazy Page={Preferences} />}
              />
            </Route>
            <Route path="/success" element={<DocSuccessPage />} />
            <Route path="/emailbuilder" element={<Lazy Page={EmailBuilder} />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
