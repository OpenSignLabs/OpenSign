import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { copytoData } from "../../constant/Utils";

function EmbedTab(props) {
  const tabName = [
    { title: "React/Next", icon: "fa-brands fa-react", color: "#61dafb" },
    { title: "Angular", icon: "fa-brands fa-angular", color: "#ff5733" }
  ];
  const [activeTab, setActiveTab] = useState(0);
  // State to track if the code has been copied
  const [isCopied, setIsCopied] = useState(false);
  const codeData = [
    {
      id: 0,
      title: "Installation command",
      codeString: `
npm install opensign-react`
    },
    {
      id: 1,
      title: "Usage",
      codeString: `
import React from "react";
import Opensign from "opensign-react";

export function App() {
  return (
    <div className="app">
      <Opensign
        onLoad={() => console.log("success")}
        onLoadError={(error) => console.log(error)}
        templateId= {"${props.templateId}"}
      />
    </div>
  );
}


`
    }
  ];

  const handleCopy = (code, ind) => {
    copytoData(code);
    setIsCopied({ ...isCopied, [ind]: true });
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="mt-4 border-t-[1px]">
      <div className="flex justify-center items-center mt-2">
        <div role="tablist" className="op-tabs op-tabs-bordered">
          {tabName.map((tabData, ind) => (
            <div
              onClick={() => setActiveTab(ind)}
              key={ind}
              role="tab"
              className={`${
                activeTab === ind ? "op-tab-active" : ""
              } op-tab flex items-center`}
            >
              <i
                className={`${tabData.icon}`}
                style={{ color: tabData.color }}
              ></i>
              <span className="ml-1">{tabData.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        {activeTab === 0 ? (
          <div className="mt-4">
            {codeData.map((data, ind) => {
              return (
                <div key={ind}>
                  <p className="font-medium text-[15px]">{data.title}</p>
                  <div className="relative p-1">
                    <div
                      onClick={() => handleCopy(data.codeString, ind)}
                      className="absolute top-[20px] right-[20px] cursor-pointer"
                    >
                      <i className="fa-light fa-link text-white"></i>{" "}
                      <span className=" text-white">
                        {isCopied[ind] ? "COPIED" : "COPY"}
                      </span>
                    </div>
                    <SyntaxHighlighter
                      customStyle={{
                        borderRadius: "15px"
                      }}
                      language="javascript"
                      style={tomorrow}
                    >
                      {data.codeString}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          activeTab === 1 && (
            <div className="mt-3">
              <p>Feature comming soon</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default EmbedTab;
