import React, { useEffect, useState } from "react";
import "./certificate.css";

import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

function Certificate({ pdfData }) {
  const [isMultiSigners, setIsMultiSigners] = useState();
  const [multiSigner, setMultiSigners] = useState([]);
  const [isLoad, setIsLoad] = useState(false);

  useEffect(() => {
    handleSignerData();
  }, []);

  const handleSignerData = () => {
    const checkSigners = pdfData.filter((data) => data.Signers);
    if (checkSigners && checkSigners.length > 0) {
      setIsMultiSigners(true);

      const checkSignSigners =
        pdfData[0].AuditTrail &&
        pdfData[0].AuditTrail.length > 0 &&
        pdfData[0].AuditTrail.filter((data) => data.Activity === "Signed");

      setMultiSigners(checkSignSigners);
    } else {
      setIsMultiSigners(false);
    }
    setIsLoad(true);
  };

  const styles = StyleSheet.create({
    page: {
      borderRadius: "5px",
      padding: "10px",
      backgroundColor: "white",
    },
    section1: {
      border: "1px solid rgb(177, 174, 174)",
      padding: "20px",
    },
    textStyle: {
      fontWeight: "bold",
      fontSize: "11px",
      marginBottom: "10px",
    },
    textStyle2: {
      fontWeight: "600",
      fontSize: "11px",
      marginBottom: "10px",
      color: "gray",
    },
  });

  const generatedDate = () => {
    const newDate = new Date();
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    var currentOffset = newDate.getTimezoneOffset();

    var ISTOffset = 330; // IST offset UTC +5:30

    var ISTTime = new Date(
      newDate.getTime() + (ISTOffset + currentOffset) * 60000
    );

    // ISTTime now represents the time in IST coordinates

    var hoursIST = ISTTime.getHours();
    var minutesIST = ISTTime.getMinutes();

    return (
      <Text
        style={{
          textAlign: "right",
          color: "gray",
          fontSize: "10px",
          marginBottom: "30px",
        }}
      >
        Generated On {localExpireDate} {hoursIST}:{minutesIST} IST
      </Text>
    );
  };
  const changeCompletedDate = () => {
    const completedOn = pdfData[0].updatedAt;
    const newDate = new Date(completedOn);
    const localExpireDate = newDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    var currentOffset = newDate.getTimezoneOffset();

    var ISTOffset = 330; // IST offset UTC +5:30

    var ISTTime = new Date(
      newDate.getTime() + (ISTOffset + currentOffset) * 60000
    );

    // ISTTime now represents the time in IST coordinates

    var hoursIST = ISTTime.getHours();
    var minutesIST = ISTTime.getMinutes();

    return (
      <Text style={styles.textStyle2}>
        {localExpireDate} {hoursIST}:{minutesIST} IST
      </Text>
    );
  };

  const signerName = (data) => {
    const getSignerName = pdfData[0].Signers.filter(
      (sign) => sign.objectId === data.UserPtr.objectId
    );

    return (
      getSignerName[0] &&
      getSignerName.length > 0 && (
        <>
          <Text style={styles.textStyle}>
            Name : &nbsp;
            <Text style={styles.textStyle2}>{getSignerName[0].Name}</Text>
          </Text>
          <Text style={styles.textStyle}>
            Email : &nbsp;
            <Text style={styles.textStyle2}>{getSignerName[0].Email}</Text>
          </Text>
        </>
      )
    );
  };
 
  return (
    isLoad && (
      <Document>
        {/** Page defines a single page of content. */}
        <Page size="A4" style={styles.page}>
          <View style={styles.section1}>
            {generatedDate()}
            <View style={{ justifyContent: "center" }}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#31bceb",
                  marginBottom: "10px",
                }}
              >
                {" "}
                Certificate of Completion
              </Text>
              <View style={{ border: "1px solid #bdbbbb" }}></View>
              <View>
                <View>
                  <Text
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#31bceb",
                      margin: "10px 0px 10px 0px",
                    }}
                  >
                    Summary
                  </Text>
                </View>
                <View style={{ display: "flex", flexDirection: "column" }}>
                  <Text style={styles.textStyle}>
                    Document ID : &nbsp;
                    <Text style={styles.textStyle2}>{pdfData[0].objectId}</Text>
                  </Text>
                  <Text style={styles.textStyle}>
                    Document Name : &nbsp;
                    <Text style={styles.textStyle2}>{pdfData[0].Name}</Text>
                  </Text>
                  <Text style={styles.textStyle}>
                    Organization : &nbsp;
                    <Text style={styles.textStyle2}>__</Text>
                  </Text>
                  <Text style={styles.textStyle}>
                    Completed on : &nbsp;{changeCompletedDate()}
                  </Text>
                  {multiSigner && multiSigner.length > 0 && (
                    <Text style={styles.textStyle}>
                      Signers : &nbsp;
                      <Text style={styles.textStyle2}>
                        {multiSigner.length}
                      </Text>
                    </Text>
                  )}
                </View>
                {isMultiSigners ? (
                  <View style={{ display: "flex", flexDirection: "column" }}>
                    <Text
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#31bceb",
                        margin: "10px 0px 10px 0px",
                      }}
                    >
                      Recipients
                    </Text>

                    <View>
                      {multiSigner && multiSigner.map((data, ind) => {
                        return (
                          <View
                            key={ind}
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <View
                              style={{
                                border: "0.4px solid #bdbbbb",
                                marginBottom: "10px",
                              }}
                            ></View>
                            {signerName(data)}

                            <Text style={styles.textStyle}>
                              Accessed from : &nbsp;
                              <Text style={styles.textStyle2}>
                                {data.ipAddress}
                              </Text>
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ) : (
                  <View style={{ display: "flex", flexDirection: "column" }}>
                    <Text
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#31bceb",
                        margin: "10px 0px 10px 0px",
                      }}
                    >
                      Recipients
                    </Text>
                    <Text style={styles.textStyle}>
                      Signers : &nbsp;<Text style={styles.textStyle2}>1</Text>
                    </Text>
                    <Text style={styles.textStyle}>
                      Name : &nbsp;
                      <Text style={styles.textStyle2}>
                        {pdfData[0].ExtUserPtr.Name}
                      </Text>
                    </Text>
                    <Text style={styles.textStyle}>
                      Accessed from : &nbsp;
                      <Text style={styles.textStyle2}>
                        {pdfData[0].AuditTrail && pdfData[0].AuditTrail[0].ipAddress}
                      </Text>
                    </Text>

                    <Text style={styles.textStyle}>
                      Signed on : &nbsp;{changeCompletedDate()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </Page>
      </Document>
    )
  );
}

export default Certificate;
