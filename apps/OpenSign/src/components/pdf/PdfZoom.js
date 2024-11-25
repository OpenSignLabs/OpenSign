import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { deletePdfPage, handleRemoveWidgets } from "../../constant/Utils";
import ModalUi from "../../primitives/ModalUi";

function PdfZoom(props) {
  const { t } = useTranslation();
  const [isDeletePage, setIsDeletePage] = useState(false);
  const handleDetelePage = async () => {
    props.setIsUploadPdf(true);
    try {
      const pdfupdatedData = await deletePdfPage(
        props.pdfArrayBuffer,
        props.pageNumber
      );
      if (pdfupdatedData?.totalPages === 1) {
        alert(t("delete-alert"));
      } else {
        props.setPdfBase64Url(pdfupdatedData.base64);
        props.setPdfArrayBuffer(pdfupdatedData.arrayBuffer);
        setIsDeletePage(false);
        handleRemoveWidgets(
          props.setSignerPos,
          props.signerPos,
          props.pageNumber,
          props.userId
        );
      }
    } catch (e) {
      console.log("error in delete pdf page", e);
    }
  };

  return (
    <>
      <span className="hidden md:flex flex-col gap-1 text-center md:w-[5%] mt-[43px] 2xl:mt-[63px]">
        <span
          className="bg-gray-50 px-[4px] 2xl:px-[15px] 2xl:py-[10px] cursor-pointer"
          onClick={() => props.clickOnZoomIn()}
          title={t("zoom-in")}
        >
          <i className="fa-light fa-magnifying-glass-plus text-gray-500 2xl:text-[30px]"></i>
        </span>
        {!props.isDisableDelete && (
          <span
            className="bg-gray-50 px-[4px] 2xl:px-[15px] 2xl:py-[10px] cursor-pointer"
            onClick={() => setIsDeletePage(true)}
            title={t("delete-page")}
          >
            <i className="fa-light fa-trash text-gray-500 2xl:text-[30px]"></i>
          </span>
        )}

        {!props?.isDisableRotate && (
          <>
            <span
              className="bg-gray-50 px-[4px] 2xl:px-[15px] 2xl:py-[10px] cursor-pointer"
              onClick={() => props.handleRotationFun(90)}
              title={t("rotate-right")}
            >
              <i className="fa-light fa-rotate-right text-gray-500 2xl:text-[30px]"></i>
            </span>
            <span
              className="bg-gray-50 px-[4px] 2xl:px-[15px] 2xl:py-[10px] cursor-pointer"
              title={t("rotate-left")}
              onClick={() => props.handleRotationFun(-90)}
            >
              <i className="fa-light fa-rotate-left text-gray-500 2xl:text-[30px]"></i>
            </span>
          </>
        )}
        <span
          className="bg-gray-50 px-[4px] 2xl:px-[15px] 2xl:py-[10px]"
          onClick={() => props.clickOnZoomOut()}
          style={{
            cursor: props.zoomPercent > 0 ? "pointer" : "default"
          }}
          title={t("zoom-out")}
        >
          <i className="fa-light fa-magnifying-glass-minus text-gray-500 2xl:text-[30px]"></i>
        </span>
      </span>

      <ModalUi
        isOpen={isDeletePage}
        title={t("validation-alert")}
        handleClose={() => setIsDeletePage(false)}
      >
        <div className="h-[100%] p-[20px]">
          <p>Are you sure want to delete this page ?</p>
          <p className="pt-3 font-medium">
            Note - once delete this page you can not undo
          </p>
          {/* <p>{t("deletepage-alert")}</p> */}
          <div className="h-[1px] bg-[#9f9f9f] w-full my-[15px]"></div>
          <button
            onClick={() => handleDetelePage()}
            type="button"
            className="op-btn op-btn-primary"
          >
            {t("yes")}
          </button>
          <button
            onClick={() => setIsDeletePage(false)}
            type="button"
            className="op-btn op-btn-ghost"
          >
            {t("no")}
          </button>
        </div>
      </ModalUi>
    </>
  );
}

export default PdfZoom;
