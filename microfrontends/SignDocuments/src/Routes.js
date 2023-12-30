import React from "react";
import { Routes, Route } from "react-router-dom";
import SignYourselfPdf from "./Component/SignYourselfPdf";
import RecipientSignPdf from "./Component/recipientSignPdf";
import PlaceHolderSign from "./Component/placeHolderSign";
import ManageSign from "./Component/ManageSign";
import Login from "./Component/login";
import DraftDocument from "./Component/DraftDocument";
import PdfRequestFiles from "./Component/PdfRequestFiles";
import LegaDrive from "./Component/LegaDrive/LegaDrive";
import PageNotFound from "./Component/PageNotFound";
import TemplatePlaceHolder from "./Component/TemplatePlaceholder";

// `AppRoutes` is used to define route path of app and
// it expose to host app, check moduleFederation.config.js for more
function AppRoutes() {
  return (
    <div>
      <Routes>
        {/* TODO: Check with images and other assets */}
        <Route index element={<div>Microapp Home page route </div>} />
        {/* signyouself route with rowlevel data */}
        <Route path="/signaturePdf" element={<SignYourselfPdf />} />
        {/* signyouself route with no rowlevel data using docId from url */}
        <Route path="/signaturePdf/:docId" element={<SignYourselfPdf />} />
        {/* recipient signature route with no rowlevel data using docId from url */}
        <Route
          path="/recipientSignPdf/:id/:contactBookId"
          element={<RecipientSignPdf />}
        />
        {/* recipient placeholder set route with  rowlevel data */}
        <Route path="/placeHolderSign" element={<PlaceHolderSign />} />{" "}
        {/* recipient placeholder set route with no rowlevel data using docId from url*/}
        <Route path="/placeHolderSign/:docId" element={<PlaceHolderSign />} />
        {/*Add default signature of user route */}
        <Route path="/managesign" element={<ManageSign />} />
        {/* login page route */}
        <Route
          path="/login/:id/:userMail/:contactBookId/:serverUrl"
          element={<Login />}
        />
        {/* draft document route to handle and navigate route page accordiing to document status */}
        <Route path="/draftDocument" element={<DraftDocument />} />
        {/* for user signature (need your sign route) with row level data */}
        <Route path="/pdfRequestFiles" element={<PdfRequestFiles />} />
        {/* for user signature (need your sign route) with no row level data */}
        <Route path="/pdfRequestFiles/:docId" element={<PdfRequestFiles />} />
        {/* lega drive route */}
        <Route path="/legadrive" element={<LegaDrive />} />
        {/* Page Not Found */}
        <Route path="/template/:templateId" element={<TemplatePlaceHolder />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
}
export default AppRoutes;
