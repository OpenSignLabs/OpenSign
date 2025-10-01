import { useState, useEffect } from "react";
import { lazyWithRetry, hideUpgradeProgress } from "./utils";
import { Routes, Route, BrowserRouter } from "react-router";
import { pdfjs } from "react-pdf";
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
import Lazy from "./primitives/LazyPage";
import Loader from "./primitives/Loader";
import UserList from "./pages/UserList";
import { serverUrl_fn } from "./constant/appinfo";
import DocSuccessPage from "./pages/DocSuccessPage";
import DragProvider from "./components/DragProivder";
import Title from "./components/Title";
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
        <BrowserRouter>
          <Title />
          <Routes>
            <Route element={<ValidateRoute />}>
              <Route exact path="/" element={<Lazy Page={Login} />} />
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
                element={<DragProvider Page={PdfRequestFiles} />}
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
                  <Route path="/users" element={<UserList />} />
                  <Route
                    path="/changepassword"
                    element={<Lazy Page={ChangePassword} />}
                  />
              <Route path="/form/:id" element={<Form />} />
              <Route path="/report/:id" element={<Report />} />
              <Route path="/dashboard/:id" element={<Dashboard />} />
              <Route path="/profile" element={<Lazy Page={UserProfile} />} />
              <Route path="/drive" element={<Lazy Page={Opensigndrive} />} />
              <Route path="/managesign" element={<Lazy Page={ManageSign} />} />
              <Route
                path="/template/:templateId"
                element={<DragProvider Page={TemplatePlaceholder} />}
              />
              {/* signyouself route with no rowlevel data using docId from url */}
              <Route
                path="/signaturePdf/:docId"
                element={<DragProvider Page={SignYourSelf} />}
              />
              {/* draft document route to handle and navigate route page according to document status */}
              <Route
                path="/draftDocument"
                element={<DragProvider Page={DraftDocument} />}
              />
              {/* recipient placeholder set route with no rowlevel data using docId from url*/}
              <Route
                path="/placeHolderSign/:docId"
                element={<DragProvider Page={PlaceHolderSign} />}
              />
              {/* recipient signature route with no rowlevel data using docId from url */}
              <Route
                path="/recipientSignPdf/:docId/:contactBookId"
                element={<DragProvider Page={PdfRequestFiles} />}
              />
              <Route
                path="/recipientSignPdf/:docId"
                element={<DragProvider Page={PdfRequestFiles} />}
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
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
