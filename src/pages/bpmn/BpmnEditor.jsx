import { useCallback, useEffect, useRef } from "react";

import { throttle } from "lodash";

import BpmnModeler from "bpmn-js/lib/Modeler";

import { useCache } from "../../Cache";

import TabbedSidebar from "../shared/TabbedSidebar";
import CommentsTab from "./features/comments/CommentsTab";

export default function BpmnEditor({ xml, onXMLChange, view, additionalModules = [], additionalConfig = {}, dispatch }) {
  const { getCacheData, setCacheData } = useCache();

  const modelerRef = useRef(getCacheData("modeler"));
  const modelerContainerRef = useRef();

  const isExporting = useRef(false);

  const onModelerChange = useCallback(async () => {
    if (isExporting.current) {
      return;
    }

    isExporting.current = true;

    const start = Date.now();

    const { xml } = await modelerRef.current.saveXML({ format: true });

    setCacheData("lastXML", xml);

    onXMLChange(xml);

    dispatch({ type: "EXPORT", time: Date.now() - start });

    isExporting.current = false;
  }, [onXMLChange, setCacheData]);

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

      setCacheData("modeler", modeler);
    }

    modeler.attachTo(modelerContainerRef.current);
  }, []);

  useEffect(() => {
    if (modelerRef.current && xml) {
      const lastXML = getCacheData("lastXML");

      if (!lastXML || xml !== lastXML) {
        try {
          setCacheData("lastXML", xml);

          const start = Date.now();

          modelerRef.current.importXML(xml).then(() => {
            dispatch({ type: "IMPORT", time: Date.now() - start });
          });
        } catch (err) {
          console.error("Error importing XML", err);

          setCacheData("lastXML", null);
        }

      }
    }
  }, [xml]);

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
  return <div>{name}</div>
}