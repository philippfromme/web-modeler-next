import { createContext, useState } from "react";

export const VIEWS = {
  DESIGN: "design",
  IMPLEMENT: "implement",
  PLAY: "play",
};

export const IMPLEMENT_VIEWS = {
  MODELER: "modeler",
  XML: "xml",
};

const DEFAULT_LAYOUT = {
  view: VIEWS.IMPLEMENT,
  implementView: IMPLEMENT_VIEWS.MODELER,
  sidebar: {
    open: true,
    activeTab: "comments"
  }
};

export const LayoutContext = createContext(null);

export const LayoutProvider = ({ children }) => {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  const value = {
    getLayout: () => layout,
    setLayout: (callback) => {
      setLayout(callback(layout));
    }
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};
