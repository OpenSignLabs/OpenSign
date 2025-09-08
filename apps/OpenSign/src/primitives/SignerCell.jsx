import { useTranslation } from "react-i18next";
import { formatDateTime, getSignerEmail } from "../constant/Utils";
import { useState } from "react";
import ModalUi from "./ModalUi";

// Signer is used in report to show signer list conditionally
const SignerCell = ({ reportName, item, handleRemovePrefill }) => {
  const { t } = useTranslation();
  const Extand_Class = localStorage.getItem("Extand_Class");
  const extClass = Extand_Class && JSON.parse(Extand_Class);
  const isTemplateReport = reportName === "Templates";
  const isCompletedReport = reportName === "Completed Documents";
  const [isShowAllSigners, setIsShowAllSigners] = useState({});
  const [isModal, setIsModal] = useState(false);
  const shouldShowSigner = [
    "In-progress documents",
    "Need your sign",
    "Completed Documents"
  ].includes(reportName);
  const shouldRender =
    !item?.IsSignyourself && handleRemovePrefill(item?.Placeholders);

  const handleCloseModal = () => {
    setIsModal({});
  };
  const handleViewSigners = (item) => {
    setIsModal({ ["view_" + item.objectId]: true });
  };
  // `formatStatusRow` is used to format status row
  const formatStatusRow = (item) => {
    const timezone = extClass?.[0]?.Timezone || "";
    const DateFormat = extClass?.[0]?.DateFormat || "MM/DD/YYYY";
    const Is12Hr = extClass?.[0]?.Is12HourTime || false;
    const removePrefill = item?.Placeholders.filter(
      (data) => data?.Role !== "prefill"
    );
    const signers = removePrefill?.map((x, i) => {
      const audit = item?.AuditTrail?.find(
        (audit) => audit?.UserPtr?.objectId === x.signerObjId
      );
      const format = (date) =>
        date
          ? formatDateTime(new Date(date), DateFormat, timezone, Is12Hr)
          : "-";
      return {
        id: i,
        Email: getSignerEmail(x, item?.Signers) || x?.email || "-",
        Activity: audit?.Activity?.toUpperCase() || "SENT",
        SignedOn: format(audit?.SignedOn),
        ViewedOn: format(audit?.ViewedOn)
      };
    });
    // Decide how many signers to display based on `showAllSignes` state
    const displaySigners = isShowAllSigners[item.objectId]
      ? signers
      : signers.slice(0, 3);
    return (
      <>
        {displaySigners?.map((x, i) => (
          <div
            key={i}
            className={`text-sm flex flex-row gap-2 items-center ${
              i !== displaySigners.length - 1 ? "mb-2" : ""
            }`}
          >
            {!isCompletedReport && (
              <button
                onClick={() => setIsModal({ [`${item.objectId}_${i}`]: true })}
                className={`${
                  x.Activity === "SIGNED"
                    ? "op-border-primary op-text-primary"
                    : x.Activity === "VIEWED"
                      ? "border-green-400 text-green-400"
                      : "border-base-content text-base-content"
                } focus:outline-none border-2 w-[60px] h-[30px] text-[11px] rounded-full`}
              >
                {x?.Activity?.toUpperCase() || "-"}
              </button>
            )}
            <div className="text-[12px]">{x?.Email || "-"}</div>
            {!isCompletedReport && isModal[`${item.objectId}_${i}`] && (
              <ModalUi
                isOpen
                title={t("document-logs")}
                handleClose={handleCloseModal}
              >
                <div className="pl-3 first:mt-2 border-t-[1px] border-gray-600 text-[12px] py-2">
                  <p className="font-bold"> {x?.Email}</p>
                  <p>{t("viewed-on", { ViewedOn: x?.ViewedOn })}</p>
                  <p>{t("signed-on", { SignedOn: x?.SignedOn })}</p>
                </div>
              </ModalUi>
            )}
          </div>
        ))}
        {/* Show More / Hide button */}
        {signers?.length > 3 && (
          <button
            onClick={() =>
              setIsShowAllSigners({
                [item.objectId]: !isShowAllSigners[item.objectId]
              })
            }
            className="ml-2 mt-1 text-xs font-medium text-blue-500 underline focus:outline-none"
          >
            {isShowAllSigners[item.objectId] ? t("hide") : t("show-more")}
          </button>
        )}
      </>
    );
  };

  if (shouldShowSigner) {
    return (
      <td className="px-1 py-2">
        {shouldRender ? <>{formatStatusRow(item)}</> : <>-</>}
      </td>
    );
  }

  return (
    <td className="p-2 text-center">
      {shouldRender ? (
        <button
          onClick={() => handleViewSigners(item)}
          className="op-link op-link-primary"
        >
          {t("view")}
        </button>
      ) : (
        "-"
      )}
      {isModal["view_" + item.objectId] && (
        <ModalUi
          isOpen
          showHeader={isTemplateReport}
          title={t("signers")}
          reduceWidth={"md:max-w-[450px]"}
          handleClose={() => handleCloseModal()}
        >
          {!isTemplateReport && (
            <div
              className="op-btn op-btn-sm op-btn-circle op-btn-ghost text-base-content absolute right-2 top-1 z-40"
              onClick={() => handleCloseModal()}
            >
              ✕
            </div>
          )}
          <table className="op-table w-full overflow-auto">
            <thead className="h-[38px] sticky top-0 text-base-content text-sm pt-[15px] px-[20px]">
              <tr>
                {isTemplateReport && (
                  <th className="p-2 pl-3 w-[30%]">{t("roles")}</th>
                )}
                <th className="pl-3 py-2">
                  {isTemplateReport ? t("email") : t("signers")}
                </th>
              </tr>
            </thead>
            <tbody>
              {item.Placeholders.map(
                (x, i) =>
                  x.Role !== "prefill" && (
                    <tr key={i} className="text-sm font-medium">
                      {isTemplateReport && (
                        <td className="text-[12px] p-2 pl-3 w-[30%]">
                          {x.Role && x.Role}
                        </td>
                      )}
                      <td className="pl-3 text-[12px] py-2 break-all">
                        {x?.email || getSignerEmail(x, item?.Signers) || "-"}
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </ModalUi>
      )}
    </td>
  );
};

export default SignerCell;
