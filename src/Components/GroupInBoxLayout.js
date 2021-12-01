import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import sampleData from "./sampleData.json";
import forceInABox from "./forceInABox";
import "./GroupInBoxLayout.css";
import { subFunctions, getGraphData } from "./Helper";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const GroupInBoxLayout = (props) => {
  const [subFunctionName, setSubFunctionName] = useState([...subFunctions()]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSubFunctionName(
      // On autofill we get a the stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const myContainer = useRef(null);

  const [graphType, setGraphType] = useState("force");
  const nodeShape = "circle";
  const [drawTemplate, setDrawTemplate] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [nodeColor, setNodeColor] = useState("subFunction");
  const [sliderProbe, setSliderProbe] = useState(0.001);
  const [sliderProbeValue, setSliderProbeValue] = useState(0.001);
  const [slider, setSlider] = useState(5);
  const [sliderValue, setSliderValue] = useState(5);
  const [sliderWidth, setSliderWidth] = useState(1024);
  const [sliderWidthValue, setSliderWidthValue] = useState(1024);
  const [sliderHeight, setSliderHeight] = useState(768);
  const [sliderHeightValue, setSliderHeightValue] = useState(768);

  const [data, setData] = useState(
    getGraphData(subFunctions(), sampleData, sliderProbeValue)
  );

  const handleSliderChange = (event, value) => {
    setSlider(value);
  };

  const handleSliderProbeChange = (event, value) => {
    setSliderProbe(value);
  };

  const handleSliderWidthChange = (event, value) => {
    setSliderWidth(value);
  };

  const handleSliderHeightChange = (event, value) => {
    setSliderHeight(value);
  };

  const style = {
    sliderWidthValue,
    sliderHeightValue,
    // border: "1px solid #323232",
    alignSelf: "center",
  };

  useEffect(() => {
    setData(getGraphData(subFunctionName, sampleData, sliderProbeValue));
  }, [subFunctionName, sliderProbeValue]);

  useEffect(() => {
    const width = sliderWidthValue;
    const height = sliderHeightValue;

    let useGroupInABox = true,
      template = graphType;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    var force = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(50)
      )
      .force("collide", d3.forceCollide(sliderValue));

    const svg = d3
      .select(myContainer.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    let groupingForce = forceInABox(showTitle, nodeShape)
      .strength(0.1) // Strength to foci
      .template(template) // Either treemap or force
      .groupBy(nodeColor) // Node attribute to group
      .links(data.links) // The graph links. Must be called after setting the grouping attribute
      .enableGrouping(useGroupInABox)
      .nodeSize(15) // Used to compute the size of the template nodes, think of it as the radius the node uses, including its padding
      .forceCharge(-50 * 15) // Separation between nodes on the force template
      .size([width, height]);

    force
      .nodes(data.nodes)
      .force(nodeColor, groupingForce)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .distance(50)
          .strength(groupingForce.getLinkStrength)
      );

    const link = svg
      .append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const mouseover = (event, d) => {
      event.target.style.cursor = "pointer";
      if (nodeShape === "circle") {
        event.target.attributes.r.value = "12";
      }
    };

    const mouseout = (event, d) => {
      if (nodeShape === "circle") {
        event.target.attributes.r.value = "7";
      }
    };

    let node = svg.selectAll(".node").data(data.nodes);

    if (nodeShape === "circle") {
      node = node.enter().append("circle").attr("class", "node").attr("r", 7);
    }
    if (nodeShape === "rect") {
      node = node
        .enter()
        .append("rect")
        .attr("class", "node")
        .attr("width", 10)
        .attr("height", 10);
    }

    node
      .style("fill", function (d) {
        if (nodeColor === "subFunction") {
          return color(d.subFunction);
        }
        if (nodeColor === "level") {
          return color(d.level);
        } else if (nodeColor === "subLevel") {
          return color(d.subLevel);
        } else if (nodeColor === "grade") {
          return color(d.grade);
        } else {
          return color(d.subFunction);
        }
      })
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) force.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) force.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

    node.append("title").text(function (d) {
      return d.name;
    });

    force.stop();

    if (drawTemplate) {
      force.force(nodeColor).drawTemplate(svg);
    } else {
      force.force(nodeColor).deleteTemplate(svg);
    }
    force.force(nodeColor).enableGrouping(useGroupInABox);
    force.force(nodeColor).template(template);
    force.restart();

    force.on("tick", function () {
      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });
      if (nodeShape === "circle") {
        node
          .attr("cx", function (d) {
            return d.x;
          })
          .attr("cy", function (d) {
            return d.y;
          });
      }
      if (nodeShape === "rect") {
        node
          .attr("x", function (d) {
            return d.x;
          })
          .attr("y", function (d) {
            return d.y;
          });
      }
    });
    let divElement = myContainer.current;
    return () => {
      if (divElement.firstChild) {
        divElement.removeChild(divElement.firstChild);
      }
    };
  }, [
    props,
    graphType,
    drawTemplate,
    nodeColor,
    data,
    showTitle,
    sliderValue,
    nodeShape,
    sliderWidthValue,
    sliderHeightValue,
  ]);

  const handleUpdate = () => {
    setSliderHeightValue(sliderHeight);
    setSliderWidthValue(sliderWidth);
    setSliderValue(slider);
  };

  const handleReset = () => {
    setSliderHeight(768);
    setSliderHeightValue(768);
    setSliderWidthValue(1024);
    setSliderWidth(1024);
    setSlider(5);
    setSliderValue(5);
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1ab-content"
                  id="panel1ab-header"
                >
                  <Typography>Filters</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <Grid container spacing={3}>
                        <Grid item xs={2}>
                          <Typography variant="h7" component="div">
                            Transition Probability
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Box width="100%">
                            <Slider
                              aria-label="Transition Probability"
                              valueLabelDisplay="auto"
                              value={sliderProbe}
                              defaultValue={0.001}
                              min={0.001}
                              max={0.5}
                              step={0.001}
                              onChange={handleSliderProbeChange}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={1}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSliderProbeValue(sliderProbe);
                            }}
                          >
                            Update
                          </Button>
                        </Grid>
                        <Grid item xs={1}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSliderProbe(0.001);
                              setSliderProbeValue(0.001);
                            }}
                          >
                            Reset
                          </Button>
                        </Grid>
                      </Grid>
                    </Stack>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <Grid container spacing={3} style={{ marginTop: "10px" }}>
                        <Grid item xs={4}>
                          <Box>
                            <FormControl fullWidth>
                              <InputLabel id="graph-select-label">
                                Graph Type
                              </InputLabel>
                              <Select
                                labelId="graph-select-label"
                                id="graph-select"
                                value={graphType}
                                label="Graph Type"
                                onChange={(e) => setGraphType(e.target.value)}
                              >
                                <MenuItem value="force">Force</MenuItem>
                                <MenuItem value="treemap">Tree Map</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box>
                            <FormControl fullWidth>
                              <InputLabel id="group-select-label">
                                Grouping
                              </InputLabel>
                              <Select
                                labelId="group-select-label"
                                id="group-select"
                                value={nodeColor}
                                label="Grouping"
                                onChange={(e) => setNodeColor(e.target.value)}
                              >
                                <MenuItem value="subFunction">
                                  Sub Function
                                </MenuItem>
                                <MenuItem value="level">Level</MenuItem>
                                <MenuItem value="subLevel">Sub Level</MenuItem>
                                <MenuItem value="grade">Grade</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </Grid>
                        <Grid item xs={2}>
                          <Box>
                            <FormGroup>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={drawTemplate}
                                    onChange={(e) =>
                                      setDrawTemplate(e.target.checked)
                                    }
                                  />
                                }
                                label="Draw Template"
                              />
                            </FormGroup>
                          </Box>
                        </Grid>
                        <Grid item xs={2}>
                          <Box>
                            {drawTemplate && (
                              <FormGroup>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={showTitle}
                                      onChange={(e) =>
                                        setShowTitle(e.target.checked)
                                      }
                                    />
                                  }
                                  label="Show Title"
                                />
                              </FormGroup>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Stack>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <Grid container spacing={3} style={{ marginTop: "10px" }}>
                        <Grid item xs={12}>
                          <Box>
                            <FormControl fullWidth>
                              <InputLabel id="demo-multiple-checkbox-label">
                                Sub Functions
                              </InputLabel>
                              <Select
                                labelId="demo-multiple-checkbox-label"
                                id="demo-multiple-checkbox"
                                multiple
                                value={subFunctionName}
                                onChange={handleChange}
                                input={<OutlinedInput label="SubFunctions" />}
                                renderValue={(selected) => selected.join(", ")}
                                MenuProps={MenuProps}
                              >
                                {[...subFunctions()].map((name) => (
                                  <MenuItem key={name} value={name}>
                                    <Checkbox
                                      checked={
                                        subFunctionName.indexOf(name) > -1
                                      }
                                    />
                                    <ListItemText primary={name} />
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <div ref={myContainer} style={style} />
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Config</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <Grid container spacing={3}>
                        <Grid item xs={2}>
                          <Typography variant="h7" component="div">
                            Node Distance
                          </Typography>
                        </Grid>
                        <Grid item xs={10}>
                          <Box width="100%">
                            <Slider
                              aria-label="Distance"
                              valueLabelDisplay="auto"
                              value={slider}
                              defaultValue={5}
                              min={5}
                              max={50}
                              onChange={handleSliderChange}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Stack>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <Grid container spacing={3}>
                        <Grid item xs={2}>
                          <Typography variant="h7" component="div">
                            Width
                          </Typography>
                        </Grid>
                        <Grid item xs={10}>
                          <Box width="100%">
                            <Slider
                              aria-label="Distance"
                              valueLabelDisplay="auto"
                              value={sliderWidth}
                              defaultValue={1024}
                              min={1024}
                              max={1450}
                              onChange={handleSliderWidthChange}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Stack>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <Grid container spacing={3}>
                        <Grid item xs={2}>
                          <Typography variant="h7" component="div">
                            Height
                          </Typography>
                        </Grid>
                        <Grid item xs={10}>
                          <Box width="100%">
                            <Slider
                              aria-label="Distance"
                              valueLabelDisplay="auto"
                              value={sliderHeight}
                              defaultValue={768}
                              min={768}
                              max={950}
                              onChange={handleSliderHeightChange}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Stack>
                    <Stack spacing={2} direction="row" alignItems="center">
                      <Grid container spacing={3}>
                        <Grid item xs={10}></Grid>
                        <Grid item xs={1}>
                          <Button variant="outlined" onClick={handleUpdate}>
                            Update
                          </Button>
                        </Grid>
                        <Grid item xs={1}>
                          <Button variant="outlined" onClick={handleReset}>
                            Reset
                          </Button>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GroupInBoxLayout;
