import React from "react";
import * as Select from "@radix-ui/react-select";
import classnames from "classnames";

function FieldsComponent({
  pdfUrl,
  sign,
  stamp,
  dragSignature,
  signRef,
  handleDivClick,
  handleMouseLeave,
  isDragSign,
  themeColor,
  dragStamp,
  dragRef,
  isDragStamp,
  dragSignatureSS,
  dragStampSS,
  isDragSignatureSS,
  isSignYourself,
  addPositionOfSignature,

  signersdata,
  isSelectListId,
  setSignerObjId,
  setIsSelectId,
  setContractName,
  isSigners,
  dataTut,
  dataTut2,
  setIsShowEmail,
  isMailSend,
  selectedEmail,
  setSelectedEmail
}) {
  const signStyle = pdfUrl ? "disableSign" : "signatureBtn";

  const isMobile = window.innerWidth < 767;

  const SelectItem = React.forwardRef(
    ({ children, className, ...props }, forwardedRef) => {
      return (
        <Select.Item
          className={classnames("SelectItem", className)}
          {...props}
          ref={forwardedRef}
        >
          <Select.ItemText>{children}</Select.ItemText>
          <Select.ItemIndicator className="SelectItemIndicator"></Select.ItemIndicator>
        </Select.Item>
      );
    }
  );

  const color = [
    "#93a3db",
    "#e6c3db",
    "#c0e3bc",
    "#bce3db",
    "#b8ccdb",
    "#ceb8db",
    "#ffccff",
    "#99ffcc",
    "#cc99ff",
    "#ffcc99",
    "#66ccff",
    "#ffffcc"
  ];

  return (
    <>
      {isMobile && isSignYourself ? (
        !isMailSend && (
          <div
            data-tut={dataTut}
            id="navbar"
            className="stickyfooter"
            style={{ width: window.innerWidth + "px" }}
          >
            {isSigners && (
              <div
                data-tut={dataTut}
                style={{
                  background: isSelectListId
                    ? color[isSelectListId % color.length]
                    : color[0],
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span style={{ fontSize: "18px", fontWeight: "500" }}>
                  Signer :
                </span>

                <Select.Root
                  onValueChange={(obj) => {
                    const [selectedKey, selectedData] = obj.split("|");
                    const parseData = JSON.parse(selectedData);

                    setSignerObjId(parseData.objectId);
                    setIsSelectId(selectedKey);
                    setContractName(parseData.className);
                    setSelectedEmail(true);
                  }}
                >
                  <Select.Trigger
                    className={selectedEmail ? "selectEmail" : "SelectTrigger"}
                    style={{
                      background: isSelectListId
                        ? color[isSelectListId % color.length]
                        : color[0]
                    }}
                    aria-label="Food"
                  >
                    <Select.Value placeholder="Select signer.." />
                    {!selectedEmail && (
                      <Select.Icon className="SelectIcon">
                        <i
                          style={{
                            marginTop: "5px",
                            marginLeft: "5px",
                            color: "#3b15d1",
                            fontSize: "20px"
                          }}
                          className="fa fa-angle-down"
                          aria-hidden="true"
                        ></i>
                      </Select.Icon>
                    )}
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content
                      className="SelectContent"
                      style={{ zIndex: "5000" }}
                    >
                      <Select.ScrollUpButton className="SelectScrollButton">
                        <i
                          style={{
                            marginTop: "5px",
                            marginLeft: "5px",
                            color: "#3b15d1",
                            fontSize: "20px"
                          }}
                          className="fa fa-angle-down"
                          aria-hidden="true"
                        ></i>
                      </Select.ScrollUpButton>
                      <Select.Viewport className="SelectViewport">
                        <Select.Group>
                          {signersdata.map((obj, ind) => {
                            return (
                              <SelectItem
                                selected
                                key={ind}
                                value={`${ind}|${JSON.stringify(obj)}`}
                                // value={(obj)}
                              >
                                {" "}
                                {obj.Email}
                              </SelectItem>
                            );
                          })}
                          {/* <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="grape"></SelectItem> */}
                        </Select.Group>
                      </Select.Viewport>
                      <Select.ScrollDownButton className="SelectScrollButton">
                        <i
                          style={{
                            marginTop: "5px",
                            marginLeft: "5px",
                            color: "#3b15d1",
                            fontSize: "20px"
                          }}
                          className="fa fa-angle-down"
                          aria-hidden="true"
                        ></i>
                      </Select.ScrollDownButton>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
              </div>
            )}
            <div
              data-tut={dataTut2}
              className="signLayoutContainer2"
              style={{ backgroundColor: themeColor() }}
            >
              <div
                onClick={() => {
                  if (isSigners) {
                    if (selectedEmail) {
                      addPositionOfSignature("onclick", false);
                    } else {
                      setIsShowEmail(true);
                    }
                  } else {
                    addPositionOfSignature("onclick", false);
                  }
                }}
                ref={(element) => {
                  dragSignatureSS(element);
                  if (element) {
                    signRef.current = element;
                    // const height = signRef && signRef.current.offsetHeight;
                    // const width = signRef && signRef.current.offsetWidth;
                  }
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  userSelect: "none",
                  opacity: isDragSignatureSS ? 0.5 : 1,
                  backgroundImage: `url(${sign})`,
                  backgroundSize: "70% 70%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center center",
                  paddingBottom: "2.2rem"
                }}
              >
                {/* <img
                alt="sign img"
                style={{
                  width: "30px",
                  height: "30px",
                  background: themeColor(),
                }}
                src={sign}
              /> */}
                <span
                  style={{
                    color: "white",
                    fontSize: "12px",
                    position: "relative",
                    top: "2.6rem"
                  }}
                >
                  Signature
                </span>
              </div>
              <div
                onClick={() => addPositionOfSignature("onclick", true)}
                ref={(element) => {
                  dragStampSS(element);
                  dragRef.current = element;
                }}
                onMouseMove={handleDivClick}
                onMouseDown={handleMouseLeave}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  userSelect: "none",
                  backgroundImage: `url(${stamp})`,
                  backgroundSize: "32px 33px",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center center",
                  paddingBottom: "2.2rem"
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontSize: "12px",
                    position: "relative",
                    top: "2.6rem"
                  }}
                >
                  Stamp
                </span>
              </div>
            </div>
          </div>
        )
      ) : (
        <div data-tut={dataTut} className="signerComponent">
          <div
            style={{
              background: themeColor(),
              padding: "5px"
            }}
          >
            <span className="signedStyle">Fields</span>
          </div>

          <div className="signLayoutContainer1">
            {pdfUrl ? (
              <>
                <button className={signStyle} disabled={true}>
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "15px",
                      padding: "3px 20px 0px 20px",
                      color: "#bfbfbf"
                    }}
                  >
                    Signature
                  </span>

                  <img
                    alt="sign img"
                    style={{
                      width: "30px",
                      height: "28px",
                      background: "#d3edeb"
                    }}
                    src={sign}
                  />
                </button>
                <button className={signStyle} disabled={true}>
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "15px",
                      padding: "3px 0px 0px 35px",
                      color: "#bfbfbf"
                    }}
                  >
                    Stamp
                  </span>

                  <img
                    alt="stamp img"
                    style={{
                      width: "25px",
                      height: "28px",
                      background: "#d3edeb"
                    }}
                    src={stamp}
                  />
                </button>
              </>
            ) : (
              <>
                <div
                  ref={(element) => {
                    dragSignature(element);
                    if (element) {
                      signRef.current = element;
                      // const height = signRef && signRef.current.offsetHeight;
                      // const width = signRef && signRef.current.offsetWidth;
                    }
                  }}
                  className={signStyle}
                  onMouseMove={handleDivClick}
                  onMouseDown={handleMouseLeave}
                  style={{
                    opacity: isDragSign ? 0.5 : 1,
                    boxShadow:
                      "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.18)"
                  }}
                >
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "15px",
                      padding: "3px 20px 0px 20px",
                      color: "black"
                    }}
                  >
                    Signature
                  </span>
                  <img
                    alt="sign img"
                    style={{
                      width: "30px",
                      height: "28px",
                      background: themeColor()
                    }}
                    src={sign}
                  />
                </div>
                <div
                  ref={(element) => {
                    dragStamp(element);
                    dragRef.current = element;
                    if (isDragStamp) {
                      // setIsStamp(true);
                    }
                  }}
                  className={!pdfUrl ? signStyle : "disableSign"}
                  disabled={pdfUrl && true}
                  onMouseMove={handleDivClick}
                  onMouseDown={handleMouseLeave}
                  style={{
                    opacity: isDragStamp ? 0.5 : 1,
                    boxShadow:
                      "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.18)"
                  }}
                >
                  <span
                    style={{
                      fontWeight: "400",
                      fontSize: "15px",
                      padding: "3px 0px 0px 35px",
                      color: !pdfUrl ? "black" : "#bfbfbf"
                    }}
                  >
                    Stamp
                  </span>

                  <img
                    alt="stamp img"
                    style={{
                      width: "25px",
                      height: "28px",
                      background: themeColor()
                    }}
                    src={stamp}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FieldsComponent;
