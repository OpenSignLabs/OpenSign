import { HTML5Backend } from "react-dnd-html5-backend";
import {
  DndProvider,
  MouseTransition
} from "react-dnd-multi-backend";
import LazyPage from "../primitives/LazyPage";
import { GuidelinesProvider } from "../context/GuidelinesContext";

const HTML5toTouch = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition
    }
  ]
};

export default function DragProvider({ Page, lazy = false }) {
  return (
    <DndProvider options={HTML5toTouch}>
      <GuidelinesProvider>
        {lazy ? <LazyPage Page={Page} /> : <Page />}
      </GuidelinesProvider>
    </DndProvider>
  );
}
