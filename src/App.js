import "./App.css";
import ForceLayout from "./Components/ForceLayout";
import GroupInBoxLayout from "./Components/GroupInBoxLayout";
import React, { useState } from "react";
import ArcLayout from "./Components/ArcLayout";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function App() {
  const [layout, setLayout] = useState("Basic");

  return (
    <div className="App">
      <Stack direction="column" spacing={2} alignItems="center">
        <Typography variant="h4">
          <b>{layout}</b>
        </Typography>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
        >
          <Button variant="contained" onClick={() => setLayout("Basic")}>
            Basic
          </Button>
          <Button variant="contained" onClick={() => setLayout("GroupInBox")}>
            GroupInBox
          </Button>
          <Button variant="contained" onClick={() => setLayout("Arc")}>
            Arc
          </Button>
        </Stack>
        {layout === "Basic" && <ForceLayout width={960} height={500} />}
        {layout === "GroupInBox" && (
          <GroupInBoxLayout width={1024} height={768} />
        )}
        {layout === "Arc" && <ArcLayout width={960} height={500} />}
      </Stack>
    </div>
  );
}

export default App;
