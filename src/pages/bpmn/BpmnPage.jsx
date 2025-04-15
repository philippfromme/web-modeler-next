import { useContext, useEffect, useReducer, useState } from "react";

import BpmnEditor from "./BpmnEditor";

import EventsExtension from "./features/shared/bpmn-js-extensions/EventsExtension";
import CommentsExtension from "./features/comments/bpmn-js-extensions/CommentsExtension";

import {
  VIEWS,
  IMPLEMENT_VIEWS,
  LayoutContext
} from "../../LayoutContext";

import { fetchXML } from "../../Backend";

export default function BpmnPage() {
  const { getLayout, setLayout } = useContext(LayoutContext);

  const { view, implementView } = getLayout();

  const [xml, setXML] = useState(null);

  useEffect(() => {
    fetchXML().then((xml) => setXML(xml));
  }, []);

  const onXMLChange = (xml) => {
    setXML(xml);
  };

  const [{ importsCount, averageImportTime, exportsCount, averageExportTime }, dispatch] = useReducer((state, action) => {
    if (action.type === "IMPORT") {
      return {
        ...state,
        importsCount: state.importsCount + 1,
        averageImportTime: (state.averageImportTime * state.importsCount + action.time) / (state.importsCount + 1)
      };
    } else if (action.type === "EXPORT") {
      return {
        ...state,
        exportsCount: state.exportsCount + 1,
        averageExportTime: (state.averageExportTime * state.exportsCount + action.time) / (state.exportsCount + 1)
      };
    }

    return state;
  }, {
    importsCount: 0,
    averageImportTime: 0,
    exportsCount: 0,
    averageExportTime: 0
  })

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
              <BpmnEditor
                xml={xml}
                onXMLChange={onXMLChange}
                view={view}
                additionalModules={[CommentsExtension, EventsExtension]}
                additionalConfig={{}}
                dispatch={dispatch}
              />
            )
      }
      {xml &&
        view === VIEWS.IMPLEMENT &&
        implementView === IMPLEMENT_VIEWS.XML && (
          <XMLEditor xml={xml} onXMLChange={onXMLChange} />
        )}
      {xml && view === VIEWS.PLAY && <Play xml={xml} />}
      <div>Imports: { importsCount }(Ø { averageImportTime }ms),  Exports: { exportsCount } (Ø { averageExportTime }ms)</div>
    </div>
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