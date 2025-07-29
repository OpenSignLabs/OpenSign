import React from "react";
import { darkenColor, getFirstLetter } from "../../constant/Utils";

function SignerListComponent(props) {
  const checkSignerBackColor = (obj) => {
    if (obj) {
      let data = "";
      if (obj?.Id) {
        data = props.signerPos.filter((data) => data.Id === obj.Id);
      } else {
        data = props.signerPos.filter(
          (data) => data.signerObjId === obj.objectId
        );
      }
      return data && data.length > 0 && data[0].blockColor;
    }
  };
  const checkUserNameColor = (obj) => {
    const getBackColor = checkSignerBackColor(obj);
    if (getBackColor) {
      const color = darkenColor(getBackColor, 0.4);
      return color;
    } else {
      return "#abd1d0";
    }
  };

  return (
    <div
      className="rounded-xl mx-1 flex flex-row flex-grow-0 items-center py-[10px] mt-1"
      style={{ background: checkSignerBackColor(props.obj) }}
    >
      <div
        style={{ background: checkUserNameColor(props.obj) }}
        className="flex flex-shrink-0 w-[30px] h-[30px] rounded-full justify-center items-center mx-1"
      >
        <span className="text-[12px] text-center font-bold text-black uppercase">
          {getFirstLetter(
            props.obj?.Name || props.obj?.email || props.obj?.Role
          )}
        </span>
      </div>
      <div className="flex flex-grow-0 flex-col overflow-hidden pr-2">
        <span className="text-[12px] font-bold truncate whitespace-nowrap">
          {props.obj?.Name || props?.obj?.Role}
        </span>
        <span className="text-[10px] font-medium truncate whitespace-nowrap">
          {props.obj?.Email || props.obj?.email}
        </span>
      </div>
    </div>
  );
}

export default SignerListComponent;
