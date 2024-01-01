import React, { useRef, useState } from "react";
import "../css/signerListPlace.css";
import { darkenColor, getFirstLetter } from "../utils/Utils";

const RecipientList = (props) => {
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

  const nameColor = [
    "#304fbf",
    "#7d5270",
    "#5f825b",
    "#578077",
    "#576e80",
    "#6d527d",
    "#cc00cc",
    "#006666",
    "#cc00ff",
    "#ff9900",
    "#336699",
    "#cc9900"
  ];
  const [isHover, setIsHover] = useState();
  const [isEdit, setIsEdit] = useState(false);
  //function for onhover signer name change background color
  const inputRef = useRef(null);
  const onHoverStyle = (ind, blockColor) => {
    const style = {
      background: blockColor ? blockColor : color[ind % color.length],
      padding: "10px",
      marginTop: "2px",
      display: "flex",
      flexDirection: "row",
      borderBottom: "1px solid #e3e1e1",
      alignItems: "center"
    };
    return style;
  };
  //function for onhover signer name remove background color
  const nonHoverStyle = (ind) => {
    const style = {
      padding: "10px",
      marginTop: "2px",
      display: "flex",
      flexDirection: "row",
      borderBottom: "1px solid #e3e1e1",
      alignItems: "center"
    };
    return style;
  };
  const isWidgetExist = (Id) => {
    return props.signerPos.some((x) => x.Id === Id);
  };

  return (
    <>
      {props.signersdata.length > 0 &&
        props.signersdata.map((obj, ind) => {
          return (
            <div
              data-tut="reactourFirst"
              onMouseEnter={() => setIsHover(ind)}
              onMouseLeave={() => setIsHover(null)}
              key={ind}
              style={
                isHover === ind || props.isSelectListId === ind
                  ? onHoverStyle(ind, obj.blockColor)
                  : nonHoverStyle(ind)
              }
              onClick={() => {
                props.setSignerObjId(obj?.objectId);
                props.setIsSelectId(ind);
                props.setContractName(obj?.className);
                props.setUniqueId(obj.Id);
                props.setRoleName(obj.Role);
                if(props.handleModal){
                  props.handleModal()
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%"
                }}
              >
                <div
                  className="signerStyle"
                  style={{
                    background: obj.blockColor
                      ? darkenColor(obj.blockColor, 0.4)
                      : nameColor[ind % nameColor.length],
                    width: 30,
                    height: 30,
                    display: "flex",
                    borderRadius: 30 / 2,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: "12px"
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "white",
                      textTransform: "uppercase"
                    }}
                  >
                    {isWidgetExist(obj.Id) ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      <>
                        {obj.Name
                          ? getFirstLetter(obj.Name)
                          : getFirstLetter(obj.Role)}
                      </>
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: obj.Name ? "column" : "row",
                    alignItems: "center"
                  }}
                >
                  {obj.Name ? (
                    <span className="userName" style={{ cursor: "default" }}>
                      {obj.Name}
                    </span>
                  ) : (
                    <>
                      <span
                        className="userName"
                        onClick={() => {
                          setIsEdit({ [obj.Id]: true });
                          props.setRoleName(obj.Role);
                        }}
                      >
                        {isEdit?.[obj.Id] && props.handleRoleChange ? (
                          <input
                            ref={inputRef}
                            style={{
                              backgroundColor: "transparent",
                              width: "inherit"
                            }}
                            value={obj.Role}
                            onChange={(e) => props.handleRoleChange(e, obj.Id)}
                            onBlur={() => {
                              setIsEdit({});
                              props.handleOnBlur(obj.Role, obj.Id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                inputRef.current.blur();
                              }
                            }}
                          />
                        ) : (
                          obj.Role
                        )}
                      </span>
                    </>
                  )}
                  {obj.Name && (
                    <span className="useEmail" style={{ cursor: "default" }}>
                      {obj.Role}
                    </span>
                  )}
                </div>
              </div>
              {props.handleDeleteUser && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    props.handleDeleteUser(obj.Id);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <i className="fa-regular fa-trash-can"></i>
                </div>
              )}
              <hr />
            </div>
          );
        })}
    </>
  );
};

export default RecipientList;
