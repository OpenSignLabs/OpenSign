import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { copytoData } from "../../constant/Utils";
import { useTranslation } from "react-i18next";

function EmbedTab(props) {
  const { t } = useTranslation();
  const tabName = [
    { title: "React/Next.js", icon: "fa-brands fa-react", color: "#61dafb" },
    { title: "Angular", icon: "fa-brands fa-angular", color: "#ff5733" }
  ];
  const [activeTab, setActiveTab] = useState(0);
  // State to track if the code has been copied
  const [isCopied, setIsCopied] = useState(false);
  const codeData = [
    {
      id: 0,
      title: "Installation",
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
                  <p className="font-medium text-[18px]">
                    {t(`${data.title}`)}
                  </p>
                  {ind === 0 && (
                    <p className="text-[13px] mt-2">
                      {t("public-template-mssg-1")}
                    </p>
                  )}
                  <div className="relative p-1">
                    <div
                      onClick={() => handleCopy(data.codeString, ind)}
                      className="absolute top-[20px] right-[20px] cursor-pointer"
                    >
                      <i className="fa-light fa-copy text-white mr-[2px]" />
                      <span className=" text-white">
                        {isCopied[ind] ? t("copied-code") : t("copy-code")}
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
                  {ind === 0 && (
                    <p className="text-[13px] mb-3">
                      {t("public-template-mssg-2")}
                    </p>
                  )}
                </div>
              );
            })}

            <p className="font-medium text-[15px]">
              {t("public-template-mssg-3")}
            </p>
            <p className="my-[6px]">
              {" "}
              {t("public-template-mssg-4")}
              <a
                href="https://www.npmjs.com/package/opensign-react"
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer text-blue-700  "
              >
                {" "}
                OpenSign React package{" "}
              </a>
              {t("public-template-mssg-5")}
            </p>
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
