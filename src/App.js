import "./App.css";
import ForceLayout from "./Components/ForceLayout";
import GroupInBoxLayout from "./Components/GroupInBoxLayout";
import React, { useState } from "react";
import ArcLayout from "./Components/ArcLayout";

function App() {
  const [layout, setLayout] = useState("Basic");

  return (
    <div className="App">
      <div className="btnContainer">
        <button onClick={() => setLayout("Basic")}>Basic</button>{" "}
        <button onClick={() => setLayout("GroupInBoxLayout")}>
          GroupInBoxLayout
        </button>{" "}
        <button onClick={() => setLayout("ArcLayout")}>Arc</button>
      </div>
      {layout === "Basic" && <ForceLayout width={960} height={500} />}
      {layout === "GroupInBoxLayout" && (
        <GroupInBoxLayout width={1024} height={768} />
      )}
      {layout === "ArcLayout" && <ArcLayout width={960} height={500} />}
    </div>
  );
}

export default App;
