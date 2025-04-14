import React, { useContext } from "react";

import { set } from "lodash";

import { LayoutContext } from "./LayoutContext"

export default function Sidebar({ children }) {
  const { getLayout, setLayout } = useContext(LayoutContext);

  const activeTab = getLayout().sidebar?.activeTab;

  return <div className="sidebar">
    <div className="sidebar-header">
      {
        children.map((child) => {
          const { name, label } = child.props;
          const isActive = activeTab === name;

          return <button
            key={name}
            className={`sidebar-tab ${isActive ? "active" : ""}`}
            onClick={() => {
              setLayout((prevLayout) => {
                const newLayout = { ...prevLayout };
                set(newLayout, "sidebar.activeTab", name);
                return newLayout;
              });
            }}
          >
            {label}
          </button>;
        })
      }
    </div>
    <div className="sidebar-content">{
      children.find((child) => child.props.name === activeTab) || null
    }</div>
  </div>
}