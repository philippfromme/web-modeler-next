import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import { CacheProvider } from "./Cache";

import { LayoutProvider } from "./LayoutContext";

import BpmnPage from "./pages/bpmn/BpmnPage";

import "./App.css";

export default function App() {
  return (
    <CacheProvider>
      <LayoutProvider>
        <BpmnPage />
      </LayoutProvider>
    </CacheProvider>
  );
}