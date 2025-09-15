import { useTranslation } from "react-i18next";
import { formatDate } from "../constant/Utils";
import SignerCell from "./SignerCell";

function isValidDateString(str) {
  const date = new Date(str);
  return !isNaN(date.getTime());
}
// `formatRow` is used to show data in poper manner like
// if data is of array type then it will join array items with ","
// if data is of object type then it Name values will be show in row
// if no data available it will show hyphen "-"
const formatRow = (row) => {
  if (Array.isArray(row)) {
    return row.map((x) => x.Name).join(", ");
  } else if (typeof row === "object" && row !== null) {
    return row?.iso ? formatDate(row?.iso) : row?.Name || "-";
  } else if (typeof row === "boolean" && row !== null) {
    return row ? row?.toString() : "false";
  } else if (isValidDateString(row) && row !== null) {
    // handle createdAt and updatedAt
    return formatDate(row) || "-";
  } else {
    return row || "-";
  }
};
// Renders a report cell based on the report's heading position
export const RenderReportCell = ({
  col,
  rowData,
  rowIndex,
  startIndex,
  handleDownload,
  handleRemovePrefill,
  reportName
}) => {
  const { t } = useTranslation();
  const appName =
    "OpenSign™";
  const drivename = appName === "OpenSign™" ? "OpenSign™" : "";
  switch (col) {
    case "Sr.No":
      return (
        <th key={col} className="px-2 py-2">
          {startIndex + rowIndex + 1}
        </th>
      );
    case "Name":
    case "Title":
      return (
        <td key={col} className="p-2 min-w-56 max-w-56">
          <div className="font-semibold break-words">{rowData?.Name}</div>
          {rowData?.ExpiryDate?.iso && (
            <div className="text-gray-500">
              {t("expires")} {formatDate(rowData?.ExpiryDate?.iso)}
            </div>
          )}
        </td>
      );
    case "Reason":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.DeclineReason?.length > 25
            ? rowData?.DeclineReason?.slice(0, 25) + "..."
            : rowData?.DeclineReason || "-"}
        </td>
      );
    case "Note":
      return (
        <td key={col} className="p-2 text-center">
          <p className="truncate w-[100px]">{rowData?.Note || "-"}</p>
        </td>
      );
    case "Folder":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.Folder?.Name ||
            t("sidebar.OpenSign™ Drive", { appName: drivename })}
        </td>
      );
    case "File":
      return (
        <td key={col} className="p-2 text-center">
          <button
            onClick={() => handleDownload(rowData)}
            className="op-link op-link-primary"
            title={t("download")}
          >
            {rowData?.URL ? t("download") : "-"}
          </button>
        </td>
      );
    case "Owner":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.ExtUserPtr?.Name || "-"}
        </td>
      );
    case "Time to complete (Days)":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.TimeToCompleteDays || "-"}
        </td>
      );
    case "Notify on signatures":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.NotifyOnSignatures?.toString() || "-"}
        </td>
      );
    case "Enable Tour":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.IsTourEnabled?.toString() || "-"}
        </td>
      );
    case "Redirect url":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.RedirectUrl?.toString() || "-"}
        </td>
      );
    case "Created Date":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.createdAt ? formatDate(rowData?.createdAt) : "-"}
        </td>
      );
    case "Updated Date":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.updatedAt ? formatDate(rowData?.updatedAt) : "-"}
        </td>
      );
    case "Expiry Date":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.ExpiryDate ? formatDate(rowData?.ExpiryDate?.iso) : "-"}
        </td>
      );
    case "Sent Date":
      return (
        <td key={col} className="p-2 text-center">
          {rowData?.DocSentAt ? formatDate(rowData?.DocSentAt?.iso) : "-"}
        </td>
      );
    case "Signers":
      return (
        <SignerCell
          key={col}
          reportName={reportName}
          item={rowData}
          handleRemovePrefill={handleRemovePrefill}
        />
      );
    default:
      return (
        <td key={col} className="p-2 text-center">
          {Array.isArray(rowData[col]) ? (
            <div className="flex flex-row flex-wrap gap-1 justify-center">
              {rowData[col].map((x, i) => (
                <span key={i}>{formatRow(x)}</span>
              ))}
            </div>
          ) : (
            formatRow(rowData[col])
          )}
        </td>
      );
  }
};
