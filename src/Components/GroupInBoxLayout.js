import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import sampleData from "./sampleData.json";
import forceInABox from "./forceInABox";
import "./GroupInBoxLayout.css";
import {
  nodeSubFunctions,
  subFunctions,
  getGraphData,
  levels,
  subLevels,
  grades,
  getRelatedNodes,
} from "./Helper";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";

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
  const [showTitle, setShowTitle] = useState(false);
  const [nodeColor, setNodeColor] = useState("subFunction");
  const [sliderProbe, setSliderProbe] = useState(0.001);
  const [sliderProbeValue, setSliderProbeValue] = useState(0.001);
  const [slider, setSlider] = useState(10);
  const [sliderValue, setSliderValue] = useState(10);
  const [selectedLegend, setSelectedLegend] = useState("");
  const sliderHeightValue = 900;
  const [selectedNode, setSelectedNode] = useState(null);
  // const [open, setOpen] = useState(false);
  const [relatedNodes, setRelatedNodes] = useState(null);

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
    const width = myContainer.current.clientWidth;
    const height = 800;
    const dLinks = data.links;

    let useGroupInABox = true,
      template = graphType;

    const getNodeData = () => {
      if (nodeColor === "subFunction") {
        return [...nodeSubFunctions(data.nodes)];
      } else if (nodeColor === "level") {
        return [...levels(data.nodes)];
      } else if (nodeColor === "subLevel") {
        return [...subLevels(data.nodes)];
      } else if (nodeColor === "grade") {
        return [...grades(data.nodes)];
      } else {
        return [...subFunctionName];
      }
    };

    const keys =
      selectedLegend === "" ? [...getNodeData()].sort() : [selectedLegend];

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
      .attr("width", myLegendContainer.current.clientWidth)
      .attr("height", selectedLegend.length ? 50 : 300);

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
      // .attr("fill", "black")
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
      let hoveredNodes = [];
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

        linkText.style("opacity", (o) => {
          return o.source.id === d.path[0].__data__.id ||
            o.target.id === d.path[0].__data__.id
            ? 1
            : opacity;
        });

        texts.style("display", (o) => {
          const thisOpacity = isConnected(d, o) ? 1 : opacity;
          if (thisOpacity === 1 && opacity !== 1) {
            hoveredNodes.push(getNodeName(o));
          }
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
        });

        if (opacity === 1) {
          texts.style("display", "none");
          linkText.style("opacity", "0");
          d3.selectAll("marker").style("opacity", "0");
          keys.forEach((d) => {
            legendHover(d, "1");
          });
        } else {
          d3.selectAll("marker").style("opacity", "1");
          keys.forEach((d) => {
            if (!hoveredNodes.includes(d)) {
              legendHover(d, "0.1");
            }
          });
          hoveredNodes = [];
        }
      };
    }

    const legendHover = (d, opacity) => {
      let dotId = "#dot_" + d;
      let txtId = "#txt_" + d;
      if (typeof d === "string") {
        dotId = dotId.replace(/ /g, "");
        txtId = txtId.replace(/ /g, "");
      }
      d3.select(dotId).style("opacity", opacity);
      d3.select(txtId).style("opacity", opacity);
    };

    legendSvg
      .selectAll(".dot")
      .data(keys)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("id", (d) => {
        if (typeof d === "string") {
          return "dot_" + d.replace(/ /g, "");
        } else {
          return "dot_" + d;
        }
      })
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
        setSelectedNode(null);
        setSelectedLegend(d);
      });

    legendSvg
      .selectAll("text.label")
      .data(keys)
      .enter()
      .append("text")
      .attr("class", "label5")
      .attr("id", (d) => {
        if (typeof d === "string") {
          return "txt_" + d.replace(/ /g, "");
        } else {
          return "txt_" + d;
        }
      })
      .style("font-size", "12px")
      .style("display", "inline")
      .attr("fill", "black")
      .attr("transform", function (d, i) {
        return "translate(" + 55 + "," + (35 + i * 25) + ")";
      })
      .text(function (d) {
        return d;
      });

    let groupingForce = forceInABox(showTitle, nodeShape)
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

    var linkText = svg.append("g").selectAll("text").data(dLinks).enter()
    .append("text")
    .attr("class", "link-label")
    .style("opacity", "0")
    .text(function(d) { return Math.round(d.transition_prob * 10000) / 100 + "%"; });


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
        setSelectedNode(d);
        setRelatedNodes(getRelatedNodes(d.id, data));
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

        linkText.attr("x", function(d) {
          if (d.target.x > d.source.x) {
              return (d.source.x + (d.target.x - d.source.x)/2); }
          else {
              return (d.target.x + (d.source.x - d.target.x)/2); }
      })
      .attr("y", function(d) {
          if (d.target.y > d.source.y) {
              return (d.source.y + (d.target.y - d.source.y)/2); }
          else {
              return (d.target.y + (d.source.y - d.target.y)/2); }
      })

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
    sliderHeightValue,
    subFunctionName,
    selectedLegend,
    showTitle,
  ]);

  return (
    <div>
      <Container
        maxWidth="100%"
        style={{
          textAlign: "center",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={1}></Grid>
          <Grid item xs={3}>
            <Typography variant="h7">Transition</Typography>
          </Grid>
          <Grid item xs={6}>
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
                setSelectedNode(null);
              }}
            />
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={3}>
            <Typography variant="h7">Distance</Typography>
          </Grid>
          <Grid item xs={6}>
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
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={2}>
            <FormControl fullWidth>
              <InputLabel id="graph-select-label">Node Shape</InputLabel>
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
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth>
              <InputLabel id="graph-select-label">Graph Type</InputLabel>
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
          </Grid>
          <Grid item xs={2}>
            <FormControl fullWidth>
              <InputLabel id="group-select-label">Grouping</InputLabel>
              <Select
                labelId="group-select-label"
                id="group-select"
                value={nodeColor}
                label="Grouping"
                onChange={(e) => setNodeColor(e.target.value)}
              >
                <MenuItem value="subFunction">Sub Function</MenuItem>
                <MenuItem value="level">Level</MenuItem>
                <MenuItem value="subLevel">Sub Level</MenuItem>
                <MenuItem value="grade">Grade</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={drawTemplate}
                    onChange={(e) => setDrawTemplate(e.target.checked)}
                  />
                }
                label="Bounding Box"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={2}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showTitle}
                    onChange={(e) => setShowTitle(e.target.checked)}
                  />
                }
                label="Titles"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={2}></Grid>
          <Grid item xs={9}>
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
                    <Checkbox checked={subFunctionName.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={1}></Grid>
              <Grid item xs={8}>
                <div ref={myContainer} />
              </Grid>
              <Grid item xs={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <div ref={myLegendContainer} />
                  </Grid>
                  <Grid item xs={12}>
                    {selectedLegend !== "" && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setSelectedLegend("");
                          setSelectedNode(null);
                        }}
                      >
                        Back
                      </Button>
                    )}
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{
                      maxHeight: "50%",
                    }}
                  >
                    {selectedNode && (
                      <Paper
                        elevation={3}
                        style={{
                          fontSize: "12px",
                          paddingTop: "10px",
                          paddingBottom: "10px",
                          maxHeight: "450px",
                          overflowX: "auto",
                          maxWidth: "300px",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "14px",
                            }}
                          >
                            <b>Selected Node</b>
                          </p>
                          <div
                            style={{
                              textAlign: "left",
                              marginLeft: "25px",
                            }}
                          >
                            <p>
                              <b>Job Id: </b>
                              {selectedNode.id}
                            </p>
                            <p>
                              <b>Title: </b>
                              {selectedNode.title}
                            </p>
                            <p>
                              <b>Level: </b>
                              {selectedNode.level}
                            </p>
                            <p>
                              <b>Sub Level: </b>
                              {selectedNode.subLevel}
                            </p>
                            <p>
                              <b>Grade: </b>
                              {selectedNode.grade}
                            </p>
                          </div>
                          <Button variant="contained" onClick={() => {
                            window.open("http://20.88.163.156:8080/careerpaths?role=Software%20Engineer%20III", "_blank");
                          }}>Explore</Button>
                          {relatedNodes && (
                            <div>
                              <p
                                style={{
                                  fontSize: "14px",
                                }}
                              >
                                <b>
                                  Source Nodes -{" "}
                                  {relatedNodes.sourceNodesIds.length}
                                </b>
                              </p>
                              {(!relatedNodes.sourceNodesIds ||
                                relatedNodes.sourceNodesIds.length === 0) && (
                                <p>No Source Nodes</p>
                              )}
                              <div
                                style={{
                                  textAlign: "left",
                                  marginLeft: "10px",
                                }}
                              >
                                {relatedNodes.sourceNodesIds.map(
                                  (node, index) => (
                                    <p key={"p1-" + index}>
                                      {index + 1}. {node}
                                    </p>
                                  )
                                )}
                              </div>
                              <p
                                style={{
                                  fontSize: "14px",
                                }}
                              >
                                <b>
                                  Target Nodes -{" "}
                                  {relatedNodes.targetNodesIds.length}
                                </b>
                              </p>

                              {(!relatedNodes.targetNodesIds ||
                                relatedNodes.targetNodesIds.length === 0) && (
                                <p>No Target Nodes</p>
                              )}
                              <div
                                style={{
                                  textAlign: "left",
                                  marginLeft: "10px",
                                }}
                              >
                                {relatedNodes.targetNodesIds.map(
                                  (node, index) => (
                                    <p key={"p2-" + index}>
                                      {index + 1}. {node}
                                    </p>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Paper>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default GroupInBoxLayout;
