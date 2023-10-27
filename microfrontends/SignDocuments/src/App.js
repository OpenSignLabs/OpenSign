import React from "react";
import { HashRouter } from "react-router-dom";
import AppRoutes from "./Routes";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  DndProvider,
  TouchTransition,
  MouseTransition,
  Preview
} from "react-dnd-multi-backend";
import DragElement from "./Component/component/DragElement";
export default function App() {
  const HTML5toTouch = {
    backends: [
      {
        id: "html5",
        backend: HTML5Backend,
        transition: MouseTransition,
      },
      {
        id: "touch",
        backend: TouchBackend,
        options: { enableMouseEvents: true },
        preview: true,
        transition: TouchTransition,
      },
    ],
  };
  const generatePreview = (props) => {
    const { item, style } = props;
    const newStyle = {
      ...style,
    };

    return (
      <div style={newStyle}>
        <DragElement {...item} />
      </div>
    );
  };

  return (
    <DndProvider options={HTML5toTouch}>
      <Preview>{generatePreview}</Preview>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </DndProvider>
  );
}
