import "./App.css";
// import ForceLayout from "./Components/ForceLayout";
import GroupInBoxLayout from "./Components/GroupInBoxLayout";
import React from "react";
import Stack from "@mui/material/Stack";
// import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

function App() {
  // const [layout, setLayout] = useState("GroupInBox");

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
        >
          {/* <Button variant="contained" onClick={() => setLayout("Basic")}>
            Basic
          </Button> */}
          {/* <Button variant="contained" onClick={() => setLayout("GroupInBox")}>
            GroupInBox
          </Button> */}
        </Stack>
        {/* {layout === "Basic" && <ForceLayout width={960} height={500} />} */}
        {/* {layout === "GroupInBox" && (
          <GroupInBoxLayout width={1250} height={900} />
        )} */}
        <GroupInBoxLayout width={1250} height={900} />
      </Stack>
    </div>
  );
}

export default App;
