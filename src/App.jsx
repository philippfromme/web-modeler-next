import { useCallback, useEffect, useRef, useState } from "react";

import { throttle } from "lodash";

import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";

import "./App.css";

const VIEWS = {
  DESIGN: "design",
  IMPLEMENT: "implement",
  PLAY: "play",
};

const IMPLEMENT_VIEWS = {
  MODELER: "modeler",
  XML: "xml",
};

const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_0lcrqv8" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.33.1" modeler:executionPlatform="Camunda Cloud" modeler:executionPlatformVersion="8.6.0">
  <bpmn:process id="Process_1s36he8" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1">
      <bpmn:outgoing>Flow_1cn5wlp</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_0nu5ww2">
      <bpmn:incoming>Flow_1cn5wlp</bpmn:incoming>
      <bpmn:outgoing>Flow_0623hcu</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1cn5wlp" sourceRef="StartEvent_1" targetRef="Activity_0nu5ww2" />
    <bpmn:endEvent id="Event_0c0loa8">
      <bpmn:incoming>Flow_0623hcu</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_0623hcu" sourceRef="Activity_0nu5ww2" targetRef="Event_0c0loa8" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1s36he8">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="182" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0nu5ww2_di" bpmnElement="Activity_0nu5ww2">
        <dc:Bounds x="270" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0c0loa8_di" bpmnElement="Event_0c0loa8">
        <dc:Bounds x="422" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1cn5wlp_di" bpmnElement="Flow_1cn5wlp">
        <di:waypoint x="218" y="120" />
        <di:waypoint x="270" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0623hcu_di" bpmnElement="Flow_0623hcu">
        <di:waypoint x="370" y="120" />
        <di:waypoint x="422" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

export default function BpmnPage() {
  const [view, setView] = useState(VIEWS.IMPLEMENT);
  const [implementView, setImplementView] = useState(IMPLEMENT_VIEWS.MODELER);

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
              onClick={() => setView(VIEWS.DESIGN)}
              className={view === VIEWS.DESIGN ? "active" : ""}
            >
              Design
            </button>
          </li>
          <li>
            <button
              onClick={() => setView(VIEWS.IMPLEMENT)}
              className={
                view === VIEWS.IMPLEMENT || view === VIEWS.XML ? "active" : ""
              }
            >
              Implement
            </button>
          </li>
          <li>
            <button
              onClick={() => setView(VIEWS.PLAY)}
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
                  setImplementView(
                    implementView === IMPLEMENT_VIEWS.MODELER
                      ? IMPLEMENT_VIEWS.XML
                      : IMPLEMENT_VIEWS.MODELER
                  )
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
          <BpmnEditor xml={xml} onXMLChange={onXMLChange} view={view} />
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

function BpmnEditor({ xml, onXMLChange, view }) {
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

  useEffect(() => {
    let modeler = modelerRef.current;

    if (!modeler) {
      modeler = modelerRef.current = new BpmnModeler({});

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
    <div
      className={["diagram", view].join(" ")}
      ref={modelerContainerRef}
    ></div>
  );
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
