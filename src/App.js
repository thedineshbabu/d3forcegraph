import "./App.css";
import GroupInBoxLayout from "./Components/GroupInBoxLayout";
import React from "react";
import Typography from "@mui/material/Typography";
import { Container } from "@mui/material";
import Grid from "@mui/material/Grid";

function App() {
  return (
    <Container
      maxWidth="100%"
      style={{
        textAlign: "center",
        marginTop: "30px",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4">
            <b>KF Intelligence Force Graph</b>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <GroupInBoxLayout width={1024} height={900} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
