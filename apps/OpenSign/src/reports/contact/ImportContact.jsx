import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import Parse from "parse";
import { emailRegex } from "../../constant/const";

const ImportContact = ({ setLoader, onImport, showAlert }) => {
  const { t } = useTranslation();
  const [currentImportPage, setCurrentImportPage] = useState(1);
  const [importedData, setImportedData] = useState([]);
  const [invalidRecords, setInvalidRecords] = useState(0);
  const recordsPerPage = 5;

  // `capitalize` is used to make word capitalize
  const capitalize = (s) =>
    s && String(s[0]).toUpperCase() + String(s).slice(1);

  // `checkRequiredHeaders` is used to check required headers present or not in csv/excel file
  const checkRequiredHeaders = (headers) => {
    const requiredHeaders = ["Name", "Email"];
    // Normalize headers to lowercase once
    const headersSet = new Set(headers.map((header) => header.toLowerCase()));

    // Check all required headers
    const allPresent = requiredHeaders.every((requiredHeader) =>
      headersSet.has(requiredHeader.toLowerCase())
    );
    return allPresent;
  };
  const processCSVFile = async (file, event) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      // Parse CSV data
      const rows = text.split("\n").map((row) => row.trim());
      const headers = rows[0].split(",").map((header) => header.trim());
      if (checkRequiredHeaders(headers)) {
        const records = rows.slice(1).reduce((acc, row) => {
          const values = row?.split(",").map((value) => value.trim()) || [];
          if (values.length > 1) {
            acc.push(
              headers.reduce(
                (obj, header, index) => ({
                  ...obj,
                  [capitalize(header)]: values[index] || ""
                }),
                {}
              )
            );
          }
          return acc;
        }, []);
        if (records.length <= 100) {
          const validRecords = records.length
            ? records.filter((x) => emailRegex.test(x.Email))
            : [];
          const invalidItems = records?.length - validRecords?.length;
          setInvalidRecords(invalidItems);
          setImportedData(validRecords);
        } else {
          alert(t("100-records-only"));
          event.target.value = "";
          setImportedData([]);
        }
      } else {
        alert(t("invalid-data"));
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const processExcelFile = (file, event) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), {
          type: "array"
        });

        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const sheetData = XLSX.utils.sheet_to_json(sheet);
        if (sheetData.length <= 100) {
          // Get all unique keys from the data to handle missing fields
          const headers = [
            ...new Set(sheetData.flatMap((item) => Object.keys(item)))
          ];

          if (checkRequiredHeaders(headers)) {
            const updateSheetData = sheetData.map((obj) => {
              for (let key in obj) {
                const capitalizedKey = capitalize(key);
                if (capitalizedKey !== key) {
                  obj[capitalizedKey] = obj[key];
                  delete obj[key]; // delete the old key to avoid duplicates
                }
              }
              return obj;
            });
            const validRecords = updateSheetData.length
              ? updateSheetData.filter((x) => emailRegex.test(x.Email))
              : [];
            const invalidItems = updateSheetData?.length - validRecords?.length;
            setInvalidRecords(invalidItems);
            setImportedData(validRecords);
          } else {
            alert(t("invalid-data"));
            event.target.value = "";
          }
        } else {
          alert(t("100-records-only"));
          event.target.value = "";
          setImportedData([]);
        }
      };

      reader.readAsArrayBuffer(file);
    }
  };

  // Get all unique keys from the data to handle missing fields
  const allKeys = importedData?.length
    ? [...new Set(importedData.flatMap((item) => Object.keys(item)))]
    : [];

  // Pagination logic for import data table in modal
  const totalImportPages = Math.ceil(importedData.length / recordsPerPage);
  const currentRecords = importedData.slice(
    (currentImportPage - 1) * recordsPerPage,
    currentImportPage * recordsPerPage
  );

  // `handleFileUpload` is trigger when user upload excel file from contactbook
  const handleFileUpload = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
      const fileName = file.name;
      const fileNameExt = fileName
        .substr(fileName.lastIndexOf(".") + 1)
        .toLowerCase();
      const isValidExt = ["csv", "xlsx", "xls"].includes(fileNameExt);
      if (isValidExt) {
        setCurrentImportPage(1);
        if (fileNameExt !== "csv") {
          processExcelFile(file, event);
        } else {
          processCSVFile(file, event);
        }
      } else {
        event.target.value = "";
        alert(t("csv-excel-support-only"));
      }
    } else {
      setImportedData([]);
      setCurrentImportPage(1);
      setInvalidRecords(0);
    }
  };

  // `handleNextPage` is used to importdata table in modal
  const handleNextPage = (e) => {
    e.preventDefault();
    if (currentImportPage < totalImportPages) {
      setCurrentImportPage(currentImportPage + 1);
    }
  };

  // `handlePreviousPage` is used to importdata table in modal
  const handlePreviousPage = (e) => {
    e.preventDefault();
    if (currentImportPage > 1) {
      setCurrentImportPage(currentImportPage - 1);
    }
  };
  // `handleImportData` is used to create batch in contact
  const handleImportData = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoader(true);
    try {
      const filterdata = importedData.map((x) => ({
        Name: x.Name,
        Email: x.Email,
        Phone: x.Phone,
        Company: x.Company,
        JobTitle: x.JobTitle,
        TenantId: localStorage.getItem("TenantId")
      }));
      const contacts = JSON.stringify(filterdata);
      const res = await Parse.Cloud.run("createbatchcontact", { contacts });
      if (res) {
        showAlert(
          "info",
          t("contact-imported", {
            imported: res?.success || 0,
            failed: res?.failed || 0
          })
        );
        if (res?.success > 0) {
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    } catch (err) {
      console.log("err while creating batch contact", err);
      showAlert("danger", t("something-went-wrong-mssg"));
    } finally {
      onImport && onImport();
      setImportedData([]);
      setInvalidRecords(0);
    }
  };

  return (
    <form onSubmit={handleImportData} className="p-[20px] h-full ">
      <div className="text-xs">
        <label className="block ml-2">
          {t("contacts-file")}
          <span className="text-red-500 text-[13px]"> *</span>
        </label>
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileUpload}
          required
          className="op-file-input op-file-input-bordered op-file-input-sm focus:outline-none hover:border-base-content w-full text-xs"
        />
        <p className="mt-1 ml-2 text-[11px] text-gray-600">
          {t("import-guideline")}{" "}
          <a
            href="/sample_contacts.csv"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline cursor-pointer"
          >
            {t("download-sample")}
          </a>
        </p>
      </div>
      <div className="text-md m-2">
        <div className="flex flex-col md:flex-row gap-1">
          <span>
            {t("total-records-found", {
              count: importedData.length
            })}
          </span>
          <span>
            {t("Invalid-records-found", {
              records: invalidRecords
            })}
          </span>
        </div>
        {importedData?.length > 0 && (
          <div className="overflow-x-auto p-1">
            <table className="op-table op-table-zebra w-full">
              <thead>
                <tr>
                  {allKeys.map((key, index) => (
                    <th key={index}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {allKeys.map((key, colIndex) => (
                      <td key={colIndex}>{row[key] || "-"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
              <button
                className="op-btn op-btn-primary op-btn-sm"
                disabled={currentImportPage === 1}
                onClick={handlePreviousPage}
              >
                {t("previous")}
              </button>
              <span>
                {t("page-n-of-n", {
                  currentPage: currentImportPage,
                  totalPages: totalImportPages
                })}
              </span>
              <button
                className="op-btn op-btn-primary op-btn-sm"
                disabled={currentImportPage === totalImportPages}
                onClick={handleNextPage}
              >
                {t("next")}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="h-[1px] w-full my-[15px] bg-[#9f9f9f]"></div>
      <button type="submit" className="op-btn op-btn-primary">
        {t("import")}
      </button>
    </form>
  );
};

export default ImportContact;
