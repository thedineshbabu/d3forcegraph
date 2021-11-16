import "./App.css";
import ForceLayout from "./Components/ForceLayout";
import GroupInBoxLayout from "./Components/GroupInBoxLayout";
import React, { useState } from "react";

function App() {
  const [layout, setLayout] = useState("GroupInBoxLayout");

  return (
    <div className="App">
      <div className="btnContainer">
        <button onClick={() => setLayout("Basic")}>Basic</button>{" "}
        <button onClick={() => setLayout("GroupInBoxLayout")}>
          GroupInBoxLayout
        </button>
      </div>
      {layout === "Basic" && <ForceLayout width={960} height={500} />}
      {layout === "GroupInBoxLayout" && <GroupInBoxLayout />}
    </div>
  );
}

export default App;
