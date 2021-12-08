import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import sampleData from "./sampleData.json";
import forceInABox from "./forceInABox";
import "./GroupInBoxLayout.css";
import {
  subFunctions,
  getGraphData,
  levels,
  subLevels,
  grades,
  // getRelatedNodes,
} from "./Helper";
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
// import Accordion from "@mui/material/Accordion";
// import AccordionSummary from "@mui/material/AccordionSummary";
// import AccordionDetails from "@mui/material/AccordionDetails";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
// import DialogTitle from "@mui/material/DialogTitle";
// import Dialog from "@mui/material/Dialog";
// import DialogContent from "@mui/material/DialogContent";
// import DialogActions from "@mui/material/DialogActions";
// import Paper from "@mui/material/Paper";

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
    setSubFunctionName(typeof value === "string" ? value.split(",") : value);
  };

  const myContainer = useRef(null);
  const myLegendContainer = useRef(null);
  const [graphType, setGraphType] = useState("treemap");
  const [nodeShape, setNodeShape] = useState("circle");
  const [drawTemplate, setDrawTemplate] = useState(true);
  // const [showDirections, setShowDirections] = useState(false);
  const [nodeColor, setNodeColor] = useState("subFunction");
  const [sliderProbe, setSliderProbe] = useState(0.001);
  const [sliderProbeValue, setSliderProbeValue] = useState(0.001);
  const [slider, setSlider] = useState(10);
  const [sliderValue, setSliderValue] = useState(10);
  const [selectedLegend, setSelectedLegend] = useState("");
  const sliderWidthValue = 1024;
  const sliderHeightValue = 768;
  // const [selectedNode, setSelectedNode] = useState(null);
  // const [open, setOpen] = useState(false);
  // const [relatedNodes, setRelatedNodes] = useState([]);

  const [data, setData] = useState(
    getGraphData(
      subFunctions(),
      sampleData,
      sliderProbeValue,
      nodeColor,
      selectedLegend
    )
  );

  const handleSliderChange = (event, value) => {
    setSlider(value);
  };

  const handleSliderProbeChange = (event, value) => {
    setSliderProbe(value);
  };

  const style = {
    sliderWidthValue,
    sliderHeightValue,
    // border: "1px solid #323232",
    alignSelf: "center",
  };

  useEffect(() => {
    setData(
      getGraphData(
        subFunctionName,
        sampleData,
        sliderProbeValue,
        nodeColor,
        selectedLegend
      )
    );
  }, [subFunctionName, sliderProbeValue, nodeColor, selectedLegend]);

  useEffect(() => {
    const width = sliderWidthValue;
    const height = sliderHeightValue;
    const dLinks = data.links;

    let useGroupInABox = true,
      template = graphType;

    const getNodeData = () => {
      if (nodeColor === "subFunction") {
        return [...subFunctionName];
      } else if (nodeColor === "level") {
        return [...levels()];
      } else if (nodeColor === "subLevel") {
        return [...subLevels()];
      } else if (nodeColor === "grade") {
        return [...grades()];
      } else {
        return [...subFunctionName];
      }
    };

    const keys = selectedLegend === "" ? [...getNodeData()] : [selectedLegend];

    const color = d3.scaleOrdinal(d3.schemeSet3);

    keys.forEach((d) => {
      color(d);
    });

    var force = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(dLinks)
          .id((d) => d.id)
          .distance(10)
      )
      .force("collide", d3.forceCollide(sliderValue));

    const svg = d3
      .select(myContainer.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const legendSvg = d3
      .select(myLegendContainer.current)
      .append("svg")
      .attr("width", 500)
      .attr("height", 500);

    const getNodeName = (d) => {
      if (nodeColor === "subFunction") {
        return d.subFunction;
      } else if (nodeColor === "level") {
        return d.level;
      } else if (nodeColor === "subLevel") {
        return d.subLevel;
      } else if (nodeColor === "grade") {
        return d.grade;
      } else {
        return d.subFunction;
      }
    };

    var marker = svg
      .append("defs")
      .selectAll("marker")
      .data(getNodeData())
      .enter()
      .append("marker")
      .attr("id", (d) => {
        if (typeof d === "string") {
          return d.replace(/ /g, "");
        } else {
          return d;
        }
      })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("id", (d) => {
        if (typeof d === "string") {
          return d.replace(/ /g, "");
        } else {
          return d;
        }
      })
      .attr("fill", (d) => color(d))
      .attr("d", "M0,-5L10,0L0,5");

    var texts = svg
      .selectAll("text.label")
      .data(data.nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .style("font-size", "12px")
      .style("display", "none")
      .attr("fill", "black")
      .text(function (d) {
        return d.name;
      });

    const linkedByIndex = {};
    dLinks.forEach((d) => {
      linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
    });

    function isConnected(a, b) {
      return (
        linkedByIndex[`${a.path[0].__data__.index},${b.index}`] ||
        linkedByIndex[`${b.index},${a.path[0].__data__.index}`] ||
        a.path[0].__data__.index === b.index
      );
    }

    marker.style("opacity", "1");

    function fade(opacity) {
      return (d) => {
        node.style("stroke-opacity", function (o) {
          const thisOpacity = isConnected(d, o) ? 1 : opacity;
          this.setAttribute("fill-opacity", thisOpacity);
          return thisOpacity;
        });

        link.style("stroke-opacity", (o) => {
          return o.source.id === d.path[0].__data__.id ||
            o.target.id === d.path[0].__data__.id
            ? 1
            : opacity;
        });

        texts.style("display", (o) => {
          const thisOpacity = isConnected(d, o) ? 1 : opacity;
          return thisOpacity === 1 ? "inline" : "none";
        });

        link.attr("marker-end", function (o) {
          if (
            o.source.id === d.path[0].__data__.id ||
            o.target.id === d.path[0].__data__.id
          ) {
            const source = getNodeName(o.source);
            if (typeof source === "string") {
              return "url(#" + source.replace(/ /g, "") + ")";
            } else {
              return "url(#" + source + ")";
            }
          }
          // console.log("o1", o.source.id);
          // console.log("o2", o.target.id);
          // console.log("d", d.path[0].__data__.id);
          // return "url(#end)";
          // const source = getNodeName(o.source);
          // if (typeof source === "string") {
          //   return "url(#" + source.replace(/ /g, "") + ")";
          // } else {
          //   return "url(#" + source + ")";
          // }
        });

        if (opacity === 1) {
          texts.style("display", "none");
          d3.selectAll("marker").style("opacity", "0");
        } else {
          d3.selectAll("marker").style("opacity", "1");
        }
      };
    }

    let legend = legendSvg
      .selectAll(".dot")
      .data(keys)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 8)
      .attr("cx", 40)
      .attr("cy", function (d, i) {
        return 30 + i * 25;
      })
      .style("fill", function (d) {
        return color(d);
      })
      .text((d) => {
        return d;
      })
      .on("click", (event, d) => {
        // setOpen(true);
        // setSelectedNode(d);
        // setRelatedNodes(getRelatedNodes(d.id, data));
        // alert(nodeColor);
        // alert(d);
        setSelectedLegend(d);
      });

    legendSvg
      .selectAll("text.label")
      .data(keys)
      .enter()
      .append("text")
      .attr("class", "label3")
      .style("font-size", "12px")
      .style("display", "inline")
      .attr("fill", "black")
      .attr("transform", function (d, i) {
        return "translate(" + 55 + "," + (35 + i * 25) + ")";
      })
      .text(function (d) {
        return d;
      });

    legend.append("text").text(function (d) {
      return d;
    });

    let groupingForce = forceInABox(true, nodeShape)
      .strength(0.1)
      .template(template)
      .groupBy(nodeColor)
      .links(dLinks)
      .enableGrouping(useGroupInABox)
      .nodeSize(15)
      .forceCharge(-50 * 15)
      .size([width, height]);

    force
      .nodes(data.nodes)
      .force(nodeColor, groupingForce)
      .force(
        "link",
        d3
          .forceLink(dLinks)
          .distance(10)
          .strength(groupingForce.getLinkStrength)
      );

    const link = svg
      .append("g")
      .selectAll("line")
      .data(dLinks)
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("stroke-width", (d) => {
        return 1;
      });

    let node = svg.selectAll(".node").data(data.nodes);

    if (nodeShape === "circle") {
      node = node.enter().append("circle").attr("class", "node").attr("r", 7);
    } else if (nodeShape === "rect") {
      node = node
        .enter()
        .append("rect")
        .attr("class", "node")
        .attr("width", 10)
        .attr("height", 10);
    }

    node
      .text(function (d) {
        return d.id;
      })
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
      .on("mouseover.fade", fade(0.1))
      .on("mouseout.fade", fade(1))
      .on("click", (event, d) => {
        // setOpen(true);
        // setSelectedNode(d);
        // setRelatedNodes(getRelatedNodes(d.id, data));
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

      texts.attr("transform", function (d) {
        return "translate(" + (d.x + 10) + "," + (d.y + 5) + ")";
      });
    });
    let divElement = myContainer.current;
    let legendElement = myLegendContainer.current;
    return () => {
      if (divElement.firstChild) {
        divElement.removeChild(divElement.firstChild);
      }
      if (legendElement.firstChild) {
        legendElement.removeChild(legendElement.firstChild);
      }
    };
  }, [
    props,
    graphType,
    drawTemplate,
    nodeColor,
    data,
    sliderValue,
    nodeShape,
    sliderWidthValue,
    sliderHeightValue,
    subFunctionName,
    selectedLegend,
  ]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box>
                <Stack spacing={2} direction="row" alignItems="center">
                  <Grid container spacing={3}>
                    <Grid item xs={2}>
                      <Typography variant="h7" component="div">
                        Transition Probability
                      </Typography>
                    </Grid>
                    <Grid item xs={10}>
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
                          onChangeCommitted={(e) => {
                            setSliderProbeValue(sliderProbe);
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
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
                          defaultValue={10}
                          min={10}
                          max={50}
                          onChange={handleSliderChange}
                          onChangeCommitted={(e) => {
                            setSliderValue(slider);
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
                <Stack spacing={2} direction="row" alignItems="center">
                  <Grid container spacing={3} style={{ marginTop: "10px" }}>
                    <Grid item xs={3}>
                      <Box>
                        <FormControl fullWidth>
                          <InputLabel id="graph-select-label">
                            Node Shape
                          </InputLabel>
                          <Select
                            labelId="shape-select-label"
                            id="shape-select"
                            value={nodeShape}
                            label="Node Shape"
                            onChange={(e) => setNodeShape(e.target.value)}
                          >
                            <MenuItem value="circle">Circle</MenuItem>
                            <MenuItem value="rect">Square</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
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
                            <MenuItem value="treemap">Tree Map</MenuItem>
                            <MenuItem value="force">Force</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>
                    <Grid item xs={3}>
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
                    <Grid item xs={3} alignContent="center">
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
                            label="Bounding Box"
                          />
                        </FormGroup>
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
                                  checked={subFunctionName.indexOf(name) > -1}
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
            </Grid>
            <Grid item xs={12}>
              {/* <Dialog onClose={() => setOpen(false)} open={open} fullWidth>
            <DialogTitle>Node Details</DialogTitle>
            {selectedNode && (
              <div>
                <DialogContent dividers>
                  <Typography gutterBottom>
                    <b>Title: </b>
                    {selectedNode.title}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Sub Function: </b>
                    {selectedNode.subFunction}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Level: </b>
                    {selectedNode.level}
                  </Typography>
                  <Typography gutterBottom>
                    <b>Sub Level: </b>
                    {selectedNode.subLevel}
                  </Typography>
                </DialogContent>
              </div>
            )}
            {relatedNodes &&
              relatedNodes.sourceNodesIds &&
              relatedNodes.targetNodesIds && (
                <div>
                  <DialogTitle>Related Nodes</DialogTitle>
                  <DialogTitle>From</DialogTitle>
                  {relatedNodes.sourceNodesIds.map((node) => (
                    <DialogContent>
                      <Typography gutterBottom>{node}</Typography>
                    </DialogContent>
                  ))}
                  <DialogTitle>To</DialogTitle>
                  {relatedNodes.targetNodesIds.map((node) => (
                    <DialogContent>
                      <Typography gutterBottom>{node}</Typography>
                    </DialogContent>
                  ))}
                </div>
              )}
            <DialogActions>
              <Button autoFocus>Explore Path</Button>
            </DialogActions>
          </Dialog> */}
              <Grid container spacing={3}>
                <Box>
                  <Stack spacing={2} direction="column" alignItems="center">
                    <Grid container spacing={3} style={{ marginTop: "10px" }}>
                      <Grid item xs={10}>
                        <Box>
                          <div ref={myContainer} style={style} />
                        </Box>
                      </Grid>
                      <Grid item xs={2}>
                        <Box>
                          <div ref={myLegendContainer} />
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container justifyContent="flex-end">
                <Grid item xs={9}></Grid>
                <Grid item xs={2}>
                  {selectedLegend !== "" && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedLegend("");
                      }}
                    >
                      Back
                    </Button>
                  )}
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GroupInBoxLayout;
