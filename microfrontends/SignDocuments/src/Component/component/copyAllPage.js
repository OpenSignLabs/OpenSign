import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/esm/ModalHeader";
import { themeColor } from "../../utils/ThemeColor/backColor";

function CopyAllPage(props) {
  const allpage = ["All pages", "All pages but last", "All pages but first"];
  const [selectData, setSelectData] = useState("");

  const randomKey = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    return randomId;
  };

  const allPagesCondition = (
    isAlreadyPage,
    type,
    rest,
    newPageNumber,
    getAlreadyPos
  ) => {
    let obj;

    if (isAlreadyPage === 1 && type === "first") {
      const filterPos =
        getAlreadyPos &&
        getAlreadyPos.filter((data) => data.xPosition !== rest.xPosition);
      if (filterPos && filterPos.length > 0) {
        return (obj = {
          pageNumber: newPageNumber,
          pos: [...filterPos]
        });
      }
    } else if (newPageNumber === props.allPages && type === "last") {
      const filterPos =
        getAlreadyPos &&
        getAlreadyPos.filter((data) => data.xPosition !== rest.xPosition);

      if (getAlreadyPos) {
        return (obj = {
          pageNumber: newPageNumber,
          pos: [...filterPos]
        });
      }
    } else if (getAlreadyPos) {
      const filterPos =
        getAlreadyPos &&
        getAlreadyPos.filter((data) => data.xPosition !== rest.xPosition);

      return (obj = {
        pageNumber: newPageNumber,
        pos: [...filterPos, rest]
      });
    } else {
      return (obj = {
        pageNumber: newPageNumber,
        pos: [rest]
      });
    }
  };
  const addPos = (type) => {
    let newXyPos = [];
    let newPageNumber = 1;
    const signerPos = props.xyPostion;

    if (props.signerObjId) {
      const filterSignerPos = signerPos.filter(
        (data) => data.signerObjId === props.signerObjId
      );
      const xyData = filterSignerPos[0].placeHolder.filter(
        (data) => data.pageNumber === props.pageNumber
      );

      const posData = xyData[0].pos.filter((pos) => pos.key === props.signKey);
      for (let i = 0; i < props.allPages; i++) {
        const { key, ...rest } = posData[0];
        const newId = randomKey();
        rest.key = newId;
        const getAlreadyPos =
          filterSignerPos[0].placeHolder[i] &&
          filterSignerPos[0].placeHolder[i].pos;

        const isAlreadyPage =
          filterSignerPos[0].placeHolder[i] &&
          filterSignerPos[0].placeHolder[i].pageNumber;

        const getObj = allPagesCondition(
          isAlreadyPage,
          type,
          rest,
          newPageNumber,
          getAlreadyPos
        );
        if (getObj) {
          newXyPos.push(getObj);
        }
        newPageNumber++;
      }

      const addSign = signerPos.map((url, ind) => {
        if (url.signerObjId === props.signerObjId) {
          return {
            ...url,
            placeHolder: newXyPos
          };
        }
        return url;
      });

      const newSignerData = signerPos;
      newSignerData.splice(0, signerPos.length, ...addSign);
      props.setXyPostion(newSignerData);
    } else {
      const xyPostion = props.xyPostion;

      const xyData = xyPostion.filter(
        (data) => data.pageNumber === props.pageNumber
      );
      const posData = xyData[0].pos.filter((pos) => pos.key === props.signKey);

      for (let i = 0; i < props.allPages; i++) {
        const isAlreadyPage = xyPostion[i] && xyPostion[i].pageNumber;
        const getAlreadyPos = xyPostion[i] && xyPostion[i].pos;
        const { key, ...rest } = posData[0];
        const newId = randomKey();
        rest.key = newId;
        const getObj = allPagesCondition(
          isAlreadyPage,
          type,
          rest,
          newPageNumber,
          getAlreadyPos
        );
        if (getObj) {
          newXyPos.push(getObj);
        }

        newPageNumber++;
      }
      props.setXyPostion(newXyPos);
    }
  };

  const applyAllPage = () => {
    if (selectData === "All pages") {
      addPos("all");
    } else if (selectData === "All pages but last") {
      addPos("last");
    } else if (selectData === "All pages but first") {
      addPos("first");
    }
  };

  return (
    <Modal show={props.isPageCopy}>
      <ModalHeader style={{ background: themeColor() }}>
        <span style={{ color: "white" }}>Place All pages</span>
      </ModalHeader>

      <Modal.Body>
        {allpage.map((data, key) => {
          return (
            <div key={key} style={{ display: "flex", flexDirection: "column" }}>
              <label key={key} style={{ fontSize: "16px", fontWeight: "500" }}>
                <input
                  style={{ accentColor: "red", marginRight: "10px" }}
                  type="radio"
                  value={data}
                  onChange={() => setSelectData(data)}
                  checked={selectData === data}
                />

                {data}
              </label>
            </div>
          );
        })}
      </Modal.Body>

      <Modal.Footer>
        <button
          style={{
            color: "black"
          }}
          type="button"
          className="finishBtn"
          onClick={() => props.setIsPageCopy(false)}
        >
          Cancel
        </button>

        <button
          onClick={() => {
            applyAllPage();
            props.setIsPageCopy(false);
          }}
          style={{
            background: themeColor()
          }}
          type="button"
          disabled={!selectData}
          className="finishBtn"
        >
          Apply
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default CopyAllPage;
