import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import {
  DndProvider,
  TouchTransition,
  MouseTransition,
  Preview
} from "react-dnd-multi-backend";
import DragElement from "./pdf/DragElement";
import LazyPage from "../primitives/LazyPage";
import { GuidelinesProvider } from "../context/GuidelinesContext";

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

/* This handling in only for devices which support touch */
const generatePreview = (props) => {
  const { item, style } = props;
  const newStyle = { ...style };

  return (
    <div style={newStyle}>
      <DragElement {...item} />
    </div>
  );
};

export default function DragProvider({ Page, lazy = false }) {
  return (
    <DndProvider options={HTML5toTouch}>
      <Preview>{generatePreview}</Preview>
      <GuidelinesProvider>
        {lazy ? <LazyPage Page={Page} /> : <Page />}
      </GuidelinesProvider>
    </DndProvider>
  );
}
