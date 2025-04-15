import React, { useState, useEffect } from "react";

import { useCache } from "../../../../Cache";

export const useSelectedElements = () => {
  const { getCacheData, subscribe, unsubscribe } = useCache();

  const [selectedElements, setSelectedElements] = useState(getCacheData("selectedElements") || []);

  useEffect(() => {
    const callback = (key, value) => {
      if (key === "selectedElements") {
        setSelectedElements(value);
      }
    };

    subscribe(callback);

    return () => {
      unsubscribe(callback);
    };
  }, []);

  return selectedElements;
};