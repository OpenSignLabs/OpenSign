import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  DndProvider,
  TouchTransition,
  MouseTransition,
  Preview
} from "react-dnd-multi-backend";
import DragElement from "./components/pdf/DragElement";
import TagManager from "react-gtm-module";

const HTML5toTouch = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition
    }
  ]
};
const generatePreview = (props) => {
  const { item, style } = props;
  const newStyle = {
    ...style
  };

  return (
    <div style={newStyle}>
      <DragElement {...item} />
    </div>
  );
};

if (process.env.REACT_APP_GTM) {
  const tagManagerArgs = {
    gtmId: process.env.REACT_APP_GTM
  };
  TagManager.initialize(tagManagerArgs);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <DndProvider options={HTML5toTouch}>
      <Preview>{generatePreview}</Preview>
      <App />
    </DndProvider>
  </Provider>
);
