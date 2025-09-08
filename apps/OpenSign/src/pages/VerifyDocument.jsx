import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PDFDocument, PDFName, PDFSignature, PDFRef, PDFDict } from "pdf-lib"; // Updated import
import * as asn1js from "asn1js";
import {
  Certificate,
  ContentInfo,
  SignedData,
  IssuerAndSerialNumber
} from "pkijs";

const VerifyDocument = () => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBuffer, setFileBuffer] = useState(null);
  const [verificationResult, setVerificationResult] = useState("");
  const [detailedResults, setDetailedResults] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({});
  // const [jsrsasignStatus, setJsrsasignStatus] = useState('loading'); // Removed

  // OID to human-readable label mapping
  const oidMapping = {
    "2.5.4.6": "Country",
    "2.5.4.10": "Organization",
    "2.5.4.11": "Organizational Unit",
    "2.5.4.17": "Postal Code",
    "2.5.4.8": "State",
    "2.5.4.7": "Locality", // Alternative for City
    "2.5.4.9": "City",
    "2.5.4.51": "Address",
    "2.5.4.3": "Common Name",
    "2.5.4.4": "Surname",
    "2.5.4.5": "Serial Number",
    "2.5.4.12": "Title",
    "2.5.4.13": "Description",
    "2.5.4.16": "Postal Address",
    "2.5.4.18": "Post Office Box",
    "2.5.4.20": "Telephone Number",
    "1.2.840.113549.1.9.1": "Email Address",
    // Common alternative OIDs
    C: "Country",
    O: "Organization",
    OU: "Organizational Unit",
    CN: "Common Name",
    ST: "State",
    L: "Locality",
    STREET: "Address",
    emailAddress: "Email Address",
    serialNumber: "Serial Number"
  };

  // Function to parse certificate subject/issuer into structured data
  const parseCertificateInfo = (certString) => {
    if (!certString) return {};

    const parsed = {};

    // Find all OID patterns and their positions
    const oidPattern = /(\d+\.\d+\.\d+\.\d+|\w+)=/g;
    const matches = [];
    let match;

    while ((match = oidPattern.exec(certString)) !== null) {
      matches.push({
        oid: match[1],
        startIndex: match.index,
        equalIndex: match.index + match[1].length
      });
    }

    // Extract value for each OID
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];

      const valueStart = currentMatch.equalIndex + 1; // Skip the "=" character
      const valueEnd = nextMatch ? nextMatch.startIndex - 2 : certString.length; // -2 to remove ", " before next OID

      const value = certString.substring(valueStart, valueEnd).trim();
      const label = oidMapping[currentMatch.oid] || currentMatch.oid;

      parsed[label] = value;
    }

    return parsed;
  };

  // Function to determine if status should show success icon
  const isSuccessStatus = (status) => {
    const successTerms = ["valid", "success", "parsed", "verified"];
    const errorTerms = ["error", "invalid", "failed", "expired"];

    const statusLower = status.toLowerCase();

    // Check for explicit error terms first
    if (errorTerms.some((term) => statusLower.includes(term))) {
      return false;
    }

    // Check for success terms
    return successTerms.some((term) => statusLower.includes(term));
  };

  // Function to determine if certificate validity should show success icon
  const isCertificateValid = (validityText) => {
    const validityLower = validityText.toLowerCase();

    // If it contains "valid" and doesn't contain negative terms
    return (
      validityLower.includes("valid") &&
      !validityLower.includes("expired") &&
      !validityLower.includes("not yet valid") &&
      !validityLower.includes("invalid")
    );
  };

  // Toggle collapsible sections
  const toggleSection = (signatureIndex, section) => {
    const key = `${signatureIndex}-${section}`;
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setVerificationResult("");
      setDetailedResults([]);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileBuffer(e.target.result);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setSelectedFile(null);
      setFileBuffer(null);
      setDetailedResults([]);
      setVerificationResult(t("please-select-pdf"));
    }
  };

  const parseSignature = async (pdfDoc) => {
    const signatureFields = pdfDoc
      .getForm()
      .getFields()
      .filter((field) => field instanceof PDFSignature); // Updated filter logic
    if (!signatureFields.length) {
      return { error: t("no-signature-found") };
    }

    const results = [];

    for (const field of signatureFields) {
      try {
        if (!field.acroField || !field.acroField.dict) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-acrofield-dict"),
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }

        // New logic to determine the actual signature dictionary
        const fieldDict = field.acroField.dict;
        const vEntry = fieldDict.get(PDFName.of("V"));
        let actualSignatureDict = null;

        if (vEntry) {
          if (vEntry instanceof PDFRef) {
            const lookedUp = pdfDoc.context.lookup(vEntry);
            if (lookedUp instanceof PDFDict) {
              actualSignatureDict = lookedUp;
            }
          } else if (vEntry instanceof PDFDict) {
            actualSignatureDict = vEntry;
          }
        }

        // Use actualSignatureDict if found, otherwise behavior might be problematic (as per existing logic)
        // If actualSignatureDict is null, subsequent checks for byteRangeObject etc. will fail,
        // leading to an error message for this signature, which is acceptable.
        const signatureDict = actualSignatureDict;

        // Check if signatureDict is null (meaning actualSignatureDict was not resolved)
        // and push an error if it is, before trying to get ByteRange or Contents.
        if (!signatureDict) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("signature-dictionary-not-found-or-invalid"), // New error message
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }

        const byteRangeObject = signatureDict.get(PDFName.of("ByteRange"));
        let byteRange; // Will be assigned after validation

        // Comprehensive validation for byteRangeObject and its contents
        if (
          !byteRangeObject ||
          !byteRangeObject.array ||
          !Array.isArray(byteRangeObject.array) ||
          byteRangeObject.array.length === 0 ||
          byteRangeObject.array.length % 2 !== 0
        ) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-byterange"),
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }

        const byteRangeNumbers = [];
        let byteRangeIsValid = true;
        for (const pdfObject of byteRangeObject.array) {
          if (!pdfObject || typeof pdfObject.asNumber !== "function") {
            byteRangeIsValid = false;
            break;
          }
          const num = pdfObject.asNumber();
          if (!Number.isFinite(num)) {
            // Checks for NaN, Infinity, -Infinity
            byteRangeIsValid = false;
            break;
          }
          byteRangeNumbers.push(num);
        }

        if (!byteRangeIsValid) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-byterange"), // Or a more specific error like "ByteRange contains non-numeric values"
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }
        byteRange = byteRangeNumbers; // Assign the validated numbers to byteRange

        const contentsObject = signatureDict.get(PDFName.of("Contents"));
        if (!contentsObject || typeof contentsObject.asString !== "function") {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-contents"),
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }
        const contents = contentsObject.asString();

        // The old basic check can be removed now as the more specific checks above cover these cases.
        // if (!byteRange || !contents) { ... }

        // Calculate totalSignedLength for accurate buffer initialization
        let totalSignedLength = 0;
        for (let i = 1; i < byteRange.length; i += 2) {
          totalSignedLength += byteRange[i];
        }

        if (totalSignedLength <= 0) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-byterange"), // totalSignedLength being non-positive implies invalid ByteRange
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }
        const pdfSignedDataBytes = new Uint8Array(totalSignedLength);
        let offset = 0;
        let reconstructionFailed = false;

        for (let i = 0; i < byteRange.length; i += 2) {
          const start = byteRange[i];
          const length = byteRange[i + 1];

          if (
            start < 0 ||
            length <= 0 ||
            start + length > fileBuffer.byteLength
          ) {
            reconstructionFailed = true;
            break;
          }
          pdfSignedDataBytes.set(
            new Uint8Array(fileBuffer.slice(start, start + length)),
            offset
          );
          offset += length;
        }

        if (reconstructionFailed) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("error-processing-signature"),
            errorDetails: t("missing-or-invalid-byterange"), // Error during reconstruction due to invalid segment
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked"),
            isCertificateDateValid: false,
            calculatedDocumentHash: t("not-available"),
            messageDigestInSignature: t("not-available"),
            hashComparisonResult: t("not-performed"),
            authenticatedAttributesSignatureResult: t("not-performed")
          });
          continue;
        }

        // Remove leading/trailing null bytes from hex if present from PDF content
        const pkcs7Hex = contents.trim();

        if (!pkcs7Hex) {
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("signature-invalid-basic"),
            errorDetails: t("missing-signature-contents"), // New i18n key
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked")
          });
          continue;
        }

        // Convert hex string to ArrayBuffer
        let cmsContentBuffer;
        try {
          cmsContentBuffer = new Uint8Array(
            pkcs7Hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
          ).buffer;
        } catch (hexError) {
          // console.error('Error converting hex string to ArrayBuffer:', hexError); // Removed
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("signature-invalid-basic"),
            errorDetails: t("invalid-signature-hex-format"), // New i18n key
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked")
          });
          continue;
        }

        // Parse the CMS ContentInfo
        const asn1 = asn1js.fromBER(cmsContentBuffer);
        if (asn1.offset === -1) {
          // console.error('Error parsing ASN.1 from signature data'); // Removed
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("signature-invalid-basic"),
            errorDetails: "ASN.1 parsing error from signature data.",
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked")
          });
          continue;
        }

        const cmsContentInfo = new ContentInfo({ schema: asn1.result });
        if (
          String(cmsContentInfo.contentType).trim() !==
          String(ContentInfo.SIGNED_DATA).trim()
        ) {
          // console.error('Not a SignedData content type. Actual type:', cmsContentInfo.contentType, 'Expected:', ContentInfo.SIGNED_DATA); // Removed
          results.push({
            name: field.getName() || t("unnamed-signature-field"),
            status: t("signature-invalid-basic"),
            errorDetails: t("unsupported-signature-format-not-signeddata"), // New i18n key
            signerInfo: t("signer-info-not-available"),
            certificateSubject: "",
            certificateIssuer: "",
            certificateValidity: t("cert-validity-not-checked")
          });
          continue;
        }

        const signedData = new SignedData({ schema: cmsContentInfo.content });

        let signerInfoText = t("signer-info-not-available");
        let certSubject = "";
        let certIssuer = "";
        let certValidity = t("cert-validity-not-checked");
        let isValid = false;

        if (signedData.signerInfos && signedData.signerInfos.length > 0) {
          const signerInfo = signedData.signerInfos[0];

          if (signedData.certificates && signedData.certificates.length > 0) {
            let signerCertificate = null;
            for (const cert of signedData.certificates) {
              if (cert instanceof Certificate) {
                const issuerAndSerialNumber = signerInfo.sid;
                if (issuerAndSerialNumber instanceof IssuerAndSerialNumber) {
                  let certMatch = true;
                  if (
                    cert.issuer.typesAndValues.length ===
                    issuerAndSerialNumber.issuer.typesAndValues.length
                  ) {
                    for (
                      let i = 0;
                      i < cert.issuer.typesAndValues.length;
                      i++
                    ) {
                      if (
                        cert.issuer.typesAndValues[i].type !==
                          issuerAndSerialNumber.issuer.typesAndValues[i].type ||
                        cert.issuer.typesAndValues[i].value.valueBlock.value !==
                          issuerAndSerialNumber.issuer.typesAndValues[i].value
                            .valueBlock.value
                      ) {
                        certMatch = false;
                        break;
                      }
                    }
                  } else {
                    certMatch = false;
                  }

                  if (
                    certMatch &&
                    cert.serialNumber.valueBlock.valueHexView.join("") ===
                      issuerAndSerialNumber.serialNumber.valueBlock.valueHexView.join(
                        ""
                      )
                  ) {
                    signerCertificate = cert;
                    break;
                  }
                }
              }
            }

            if (signerCertificate) {
              certSubject = signerCertificate.subject.typesAndValues
                .map((tv) => `${tv.type}=${tv.value.valueBlock.value}`)
                .join(", ");
              certIssuer = signerCertificate.issuer.typesAndValues
                .map((tv) => `${tv.type}=${tv.value.valueBlock.value}`)
                .join(", ");
              signerInfoText = `${t("signer")}: ${certSubject}, ${t("issuer")}: ${certIssuer}`;

              const notBefore = signerCertificate.notBefore.value;
              const notAfter = signerCertificate.notAfter.value;
              const currentDate = new Date();
              certValidity = `${t("valid-from")} ${notBefore.toLocaleDateString()} ${t("to")} ${notAfter.toLocaleDateString()}`;
              if (currentDate < notBefore || currentDate > notAfter) {
                certValidity += ` (${t("expired-or-not-yet-valid")})`;
                isValid = false; // Explicitly false if expired
              } else {
                certValidity += ` (${t("valid")})`;
                isValid = true;
              }
            } else {
              signerInfoText = t("signer-certificate-not-found"); // New i18n key
            }
          } else {
            signerInfoText = t("no-certificates-in-signature"); // New i18n key
          }
        } else {
          signerInfoText = t("no-signer-info-in-pkcs7"); // Re-use existing key, or make new one
        }

        results.push({
          name: field.getName() || t("unnamed-signature-field"),
          status: isValid
            ? t("signature-valid-basic")
            : t("signature-invalid-basic"),
          signerInfo: signerInfoText,
          certificateSubject: certSubject,
          certificateIssuer: certIssuer,
          certificateValidity: certValidity,
          errorDetails:
            !isValid && signerInfoText === t("signer-info-not-available")
              ? t("could-not-parse-signer-info")
              : undefined // New i18n key
        });
      } catch (e) {
        console.error(
          "Error processing signature field with pkijs:",
          field.getName(),
          e
        );
        results.push({
          name: field.getName() || t("unnamed-signature-field"),
          status: t("error-processing-signature"),
          errorDetails: e.message,
          signerInfo: t("signer-info-not-available"),
          certificateSubject: "",
          certificateIssuer: "",
          certificateValidity: t("cert-validity-not-checked")
        });
      }
    }
    return { results };
  };

  const handleVerifyDocument = async () => {
    // Removed jsrsasignStatus check

    if (!fileBuffer) {
      setVerificationResult(t("please-select-file-to-verify"));
      setDetailedResults([]);
      return;
    }

    setVerificationResult(t("verification-in-progress"));
    setDetailedResults([]);

    try {
      // Removed window.KJUR and window.X509 check

      const pdfDoc = await PDFDocument.load(fileBuffer, {
        ignoreEncryption: true
      });
      const signatureInfo = await parseSignature(pdfDoc);

      if (signatureInfo.error) {
        setVerificationResult(signatureInfo.error);
      } else if (signatureInfo.results && signatureInfo.results.length > 0) {
        setDetailedResults(signatureInfo.results);
        // Overall status can be determined by checking if all signatures are valid
        const allValid = signatureInfo.results.every(
          (res) => res.status === t("signature-valid-basic")
        );
        setVerificationResult(
          allValid
            ? t("all-signatures-verified-convincing")
            : t("some-signatures-invalid-basic")
        );
      } else {
        setVerificationResult(t("no-signatures-processed")); // Should be caught by no-signature-found earlier
      }
    } catch (e) {
      console.error(
        "Error during PDF processing or signature verification:",
        e
      );
      setVerificationResult(`${t("error-verifying-pdf")}: ${e.message}`);
      setDetailedResults([]);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-base-100 shadow-xl rounded-lg mt-10">
      <style>{`
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #7ac142; /* Green color */
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #fff; /* White check path */
          stroke-miterlimit: 10;
          margin: 10px auto; /* Example margin */
          box-shadow: inset 0px 0px 0px #7ac142;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }

        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 30px #7ac142;
          }
        }
      `}</style>
      <h1 className="text-3xl font-bold mb-6 text-center text-base-content">
        {t("verify-document-signature")}
      </h1>

      <div className="mb-6 p-6 border border-base-300 rounded-lg bg-base-200/30 shadow-sm">
        <label
          htmlFor="document-upload"
          className="block text-lg font-medium text-base-content mb-2"
        >
          {t("select-pdf-document")}
        </label>
        <input
          type="file"
          id="document-upload"
          accept=".pdf"
          onChange={handleFileChange}
          className="file-input file-input-bordered file-input-primary w-full max-w-xs"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-base-content w-full truncate">
            {t("selected-file")}: {selectedFile.name}
          </p>
        )}
      </div>

      <div className="text-center mb-6">
        <button
          onClick={handleVerifyDocument}
          className="op-btn op-btn-primary op-btn-md"
          disabled={
            !selectedFile ||
            verificationResult === t("verification-in-progress")
          }
        >
          {/* Removed jsrsasignStatus === 'loading' condition for spinner */}
          {verificationResult === t("verification-in-progress") ? (
            <span className="loading loading-spinner"></span>
          ) : (
            t("verify-signature")
          )}
        </button>
      </div>

      {verificationResult &&
        verificationResult !== t("verification-in-progress") && (
          <div className="mt-8 p-6 border border-base-300 rounded-lg bg-base-200 shadow-md min-h-[120px] flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold mb-4 text-base-content text-center">
              {t("verification-status")}
            </h2>
            {verificationResult ===
              "Document Verified: All signatures have been successfully validated." && (
              <div className="flex flex-col items-center my-4">
                <svg
                  className="checkmark"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 52 52"
                >
                  <circle
                    className="checkmark__circle"
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className="checkmark__check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  />
                </svg>
              </div>
            )}
            <p className="text-lg text-base-content mb-4 text-center">
              {verificationResult}
            </p>
            {detailedResults.length > 0 && (
              <div className="w-full space-y-6">
                {detailedResults.map((res, index) => {
                  const signerInfo = parseCertificateInfo(
                    res.certificateSubject
                  );
                  const issuerInfo = parseCertificateInfo(
                    res.certificateIssuer
                  );

                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    >
                      {/* Header Section */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🔏</span>
                          <div>
                            <h4 className="text-xl font-bold">
                              Signature Details
                            </h4>
                            <p className="text-blue-100 text-sm">
                              Digital Certificate Information
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Basic Info Section */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Field Name
                            </span>
                            <p className="mt-1 text-lg font-semibold text-gray-900 font-mono">
                              {res.name}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                              Overall Status
                            </span>
                            <div className="mt-1 flex items-center space-x-2">
                              <span
                                className={`text-lg ${isSuccessStatus(res.status) ? "text-green-600" : "text-red-600"}`}
                              >
                                {isSuccessStatus(res.status) ? "✅" : "❌"}
                              </span>
                              <span className="text-lg font-semibold text-gray-900">
                                {res.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Signer Information Section */}
                      {Object.keys(signerInfo).length > 0 && (
                        <div className="border-b border-gray-100">
                          <button
                            onClick={() => toggleSection(index, "signer")}
                            className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">📇</span>
                                <h5 className="text-lg font-semibold text-gray-900">
                                  Signer Information
                                </h5>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                  collapsedSections[`${index}-signer`]
                                    ? "transform rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </button>
                          {!collapsedSections[`${index}-signer`] && (
                            <div className="px-6 pb-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(signerInfo).map(
                                  ([label, value]) => (
                                    <div
                                      key={label}
                                      className="bg-gray-50 rounded-lg p-4"
                                    >
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {label}
                                      </span>
                                      <p className="mt-1 text-sm font-mono text-gray-900 break-all">
                                        {value}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Issuer Information Section */}
                      {Object.keys(issuerInfo).length > 0 && (
                        <div className="border-b border-gray-100">
                          <button
                            onClick={() => toggleSection(index, "issuer")}
                            className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-xl">🏢</span>
                                <h5 className="text-lg font-semibold text-gray-900">
                                  Issuer Details
                                </h5>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                  collapsedSections[`${index}-issuer`]
                                    ? "transform rotate-180"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </button>
                          {!collapsedSections[`${index}-issuer`] && (
                            <div className="px-6 pb-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(issuerInfo).map(
                                  ([label, value]) => (
                                    <div
                                      key={label}
                                      className="bg-gray-50 rounded-lg p-4"
                                    >
                                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {label}
                                      </span>
                                      <p className="mt-1 text-sm font-mono text-gray-900 break-all">
                                        {value}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Certificate Validity Section */}
                      {res.certificateValidity && (
                        <div className="p-6 bg-gray-50">
                          <div className="flex items-center space-x-3 mb-4">
                            <span className="text-xl">🕒</span>
                            <h5 className="text-lg font-semibold text-gray-900">
                              Certificate Validity
                            </h5>
                          </div>
                          <div className="bg-white rounded-lg p-4 border">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-lg ${isCertificateValid(res.certificateValidity) ? "text-green-600" : "text-red-600"}`}
                              >
                                {isCertificateValid(res.certificateValidity)
                                  ? "✅"
                                  : "❌"}
                              </span>
                              <span className="text-sm font-mono text-gray-900">
                                {res.certificateValidity}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Technical Details Section (if any) */}
                      {(res.calculatedDocumentHash ||
                        res.messageDigestInSignature ||
                        res.hashComparisonResult ||
                        res.authenticatedAttributesSignatureResult ||
                        res.errorDetails ||
                        res.certificateSubject ||
                        res.certificateIssuer) && (
                        <div className="p-6 bg-gray-50 border-t">
                          <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                              <span>🔧 Technical Details</span>
                              <svg
                                className="w-4 h-4 transition-transform group-open:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </summary>
                            <div className="mt-4 space-y-3">
                              {/* Raw Certificate Data */}
                              {res.certificateSubject && (
                                <div className="bg-white rounded p-3 border">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                    Raw Certificate Subject
                                  </span>
                                  <code className="text-xs text-gray-800 break-all bg-gray-100 p-2 rounded block">
                                    {res.certificateSubject}
                                  </code>
                                </div>
                              )}
                              {res.certificateIssuer && (
                                <div className="bg-white rounded p-3 border">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                    Raw Certificate Issuer
                                  </span>
                                  <code className="text-xs text-gray-800 break-all bg-gray-100 p-2 rounded block">
                                    {res.certificateIssuer}
                                  </code>
                                </div>
                              )}
                              {res.calculatedDocumentHash &&
                                res.calculatedDocumentHash !==
                                  t("not-available") &&
                                res.calculatedDocumentHash !==
                                  t("not-calculated") && (
                                  <div className="bg-white rounded p-3 border">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                      Calculated Document Hash
                                    </span>
                                    <code className="text-xs text-gray-800 break-all bg-gray-100 p-2 rounded block">
                                      {res.calculatedDocumentHash}
                                    </code>
                                  </div>
                                )}
                              {res.messageDigestInSignature &&
                                res.messageDigestInSignature !==
                                  t("not-available") &&
                                res.messageDigestInSignature !==
                                  t("not-found-in-signature") && (
                                  <div className="bg-white rounded p-3 border">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                      Message Digest in Signature
                                    </span>
                                    <code className="text-xs text-gray-800 break-all bg-gray-100 p-2 rounded block">
                                      {res.messageDigestInSignature}
                                    </code>
                                  </div>
                                )}
                              {res.hashComparisonResult &&
                                res.hashComparisonResult !==
                                  t("not-performed") && (
                                  <div className="bg-white rounded p-3 border">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                      Hash Comparison
                                    </span>
                                    <span className="text-sm text-gray-800">
                                      {res.hashComparisonResult}
                                    </span>
                                  </div>
                                )}
                              {res.authenticatedAttributesSignatureResult &&
                                res.authenticatedAttributesSignatureResult !==
                                  t("not-performed") && (
                                  <div className="bg-white rounded p-3 border">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                                      Attributes Signature Verification
                                    </span>
                                    <span className="text-sm text-gray-800">
                                      {
                                        res.authenticatedAttributesSignatureResult
                                      }
                                    </span>
                                  </div>
                                )}
                              {res.errorDetails && (
                                <div className="bg-red-50 border border-red-200 rounded p-3">
                                  <span className="text-xs font-medium text-red-600 uppercase tracking-wide block mb-1">
                                    Error Details
                                  </span>
                                  <span className="text-sm text-red-800">
                                    {res.errorDetails}
                                  </span>
                                </div>
                              )}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      {verificationResult === t("verification-in-progress") && (
        <div className="mt-8 p-4 border border-base-300 rounded-lg bg-base-200 min-h-[100px] flex justify-center items-center">
          <span className="loading loading-lg loading-dots"></span>
        </div>
      )}

      {!verificationResult && !selectedFile && (
        <div className="mt-8 p-4 border border-base-300 rounded-lg bg-base-200 min-h-[100px] flex justify-center items-center">
          {" "}
          {/* Added flex for centering */}
          <p className="text-base-content/60 italic text-center">
            {t("verification-results-will-appear-here")}
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyDocument;
