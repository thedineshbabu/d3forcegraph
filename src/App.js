import "./App.css";
import GroupInBoxLayout from "./Components/GroupInBoxLayout";
import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function App() {
  return (
    <div className="App">
      <Stack direction="column" spacing={2} alignItems="center">
        <Typography variant="h4">
          <b>KF Intelligence Force Graph</b>
        </Typography>
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="center"
        ></Stack>
        <GroupInBoxLayout width={1250} height={900} />
      </Stack>
    </div>
  );
}

export default App;
