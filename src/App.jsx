import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { throttle } from "lodash";

import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import TabbedSidebar from './TabbedSidebar';
import CommentsTab from "./features/comments/CommentsTab";

import CommentsExtension from "./features/comments/bpmn-js-extensions/CommentsExtension";

import { 
  VIEWS,
  IMPLEMENT_VIEWS,
  LayoutContext,
  LayoutProvider
} from "./LayoutContext";

import { CacheProvider, useCache } from "./Cache";

import "./App.css";

const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_0lcrqv8" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.33.1" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.6.0">
  <bpmn:process id="Process_1s36he8" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:endEvent id="EndEvent_1">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1s36he8">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="182" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="270" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="422" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="218" y="120" />
        <di:waypoint x="270" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="370" y="120" />
        <di:waypoint x="422" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

export default function App() {
  return (
    <CacheProvider>
      <LayoutProvider>
        <BpmnPage />
      </LayoutProvider>
    </CacheProvider>
  );
}

function BpmnPage() {
  const { getLayout, setLayout } = useContext(LayoutContext);

  const { view, implementView } = getLayout();

  const [xml, setXML] = useState(null);

  useEffect(() => {
    fetchXML().then((xml) => setXML(xml));
  }, []);

  const onXMLChange = (xml) => {
    setXML(xml);
  };

  return (
    <div className="page">
      <header>Web Modeler</header>
      <div className="actions">
        <ul className="left">
          <li>
            <button
              onClick={() => setLayout(prevLayout => ({ ...prevLayout, view: VIEWS.DESIGN }))}
              className={view === VIEWS.DESIGN ? "active" : ""}
            >
              Design
            </button>
          </li>
          <li>
            <button
              onClick={() => setLayout(prevLayout => ({ ...prevLayout, view: VIEWS.IMPLEMENT }))}
              className={
                view === VIEWS.IMPLEMENT || view === VIEWS.XML ? "active" : ""
              }
            >
              Implement
            </button>
          </li>
          <li>
            <button
              onClick={() => setLayout(prevLayout => ({ ...prevLayout, view: VIEWS.PLAY }))}
              className={view === VIEWS.PLAY ? "active" : ""}
            >
              Play
            </button>
          </li>
        </ul>
        <ul className="right">
          {view === VIEWS.IMPLEMENT && (
            <li>
              <button
                onClick={() =>
                  setLayout(prevLayout => ({ ...prevLayout, implementView: implementView === IMPLEMENT_VIEWS.MODELER ? IMPLEMENT_VIEWS.XML : IMPLEMENT_VIEWS.MODELER }))
                }
                className={
                  implementView === IMPLEMENT_VIEWS.XML ? "active" : ""
                }
              >
                XML
              </button>
            </li>
          )}
        </ul>
      </div>
      {!xml && <div>Loading...</div>}
      {xml &&
        (view === VIEWS.DESIGN ||
          (view === VIEWS.IMPLEMENT &&
            implementView === IMPLEMENT_VIEWS.MODELER)) && (
          <BpmnEditor xml={xml} onXMLChange={onXMLChange} view={view} additionalModules={[CommentsExtension]} additionalConfig={{}} />
        )}
      {xml &&
        view === VIEWS.IMPLEMENT &&
        implementView === IMPLEMENT_VIEWS.XML && (
          <XMLEditor xml={xml} onXMLChange={onXMLChange} />
        )}
      {xml && view === VIEWS.PLAY && <Play xml={xml} />}
    </div>
  );
}

function BpmnEditor({ xml, onXMLChange, view, additionalModules = [], additionalConfig = {} }) {
  const modelerRef = useRef();
  const modelerContainerRef = useRef();

  const [lastExportedXML, setLastExportedXML] = useState(null);

  const onModelerChange = useCallback(async () => {
    console.log("elements.changed, exporting XML");

    const start = Date.now();

    const { xml } = await modelerRef.current.saveXML({ format: true });

    console.log("XML exported in", Date.now() - start, "ms");

    setLastExportedXML(xml);

    onXMLChange(xml);
  }, [onXMLChange]);

  const throttledOnModelerChange = useRef(throttle(onModelerChange, 1000));

  const cache = useCache();

  useEffect(() => {
    let modeler = modelerRef.current;

    if (!modeler) {
      modeler = modelerRef.current = new BpmnModeler({
        additionalModules,
        ...additionalConfig,
        cache
      });

      modeler.on("elements.changed", throttledOnModelerChange.current);
    }

    modeler.attachTo(modelerContainerRef.current);
  }, []);

  useEffect(() => {
    if (modelerRef.current && xml) {
      if (xml !== lastExportedXML) {
        console.log("XML changed, importing XML");

        modelerRef.current.importXML(xml);
      } else {
        console.log("XML not changed, not importing XML");
      }
    }
  }, [xml, lastExportedXML]);

  return (
    <div className="bpmn-editor">
      <div
        className={["diagram", view].join(" ")}
        ref={modelerContainerRef}
      ></div>
      <TabbedSidebar>
        <Tab name="properties" label="Properties" />
        <CommentsTab name="comments" label="Comments" />
      </TabbedSidebar>
    </div>
  );
}

function Tab({ name }) {
  return <div>{name} content</div>
}

function XMLEditor({ xml, onXMLChange }) {
  return (
    <textarea
      value={xml}
      onChange={({ target }) => onXMLChange(target.value)}
      rows="20"
    ></textarea>
  );
}

function Play() {
  return <div>Play</div>;
}

function fetchXML() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(DEFAULT_XML);
    }, 2000);
  });
}
