import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Select from "react-select";
import sampleData from "./sampleData.json";

const ForceLayout = (props) => {
  const myContainer = useRef(null);

  const [nodeColor, setNodeColor] = useState("subFunction");
  const [nodeId, setNodeId] = useState("");
  const [nodeName, setNodeName] = useState("");
  const [nodeSubFunction, setNodeSubFunction] = useState("");
  const [nodeLevel, setNodeLevel] = useState("");
  const [nodeSubLevel, setNodeSubLevel] = useState("");
  const [nodeGrade, setNodeGrade] = useState("");

  const { width, height } = props;
  const style = {
    width,
    height,
    border: "1px solid #323232",
    alignSelf: "center",
  };

  const options = [
    { value: "subFunction", label: "Sub Function" },
    { value: "level", label: "Level" },
    { value: "subLevel", label: "Sub Level" },
    { value: "grade", label: "Grade" },
  ];

  useEffect(() => {
    const { width, height } = props;

    const data = sampleData.graph;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    let simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(20)
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));
    simulation.stop();

    const svg = d3
      .select(myContainer.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const link = svg
      .append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", "pink")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const mouseover = (event, d) => {
      event.target.style.cursor = "pointer";
      // event.target.style.transition = "all 0.5s";
      event.target.attributes.r.value = "12";
    };

    const mouseout = (event, d) => {
      // event.target.style.cursor = "pointer";
      // event.target.style.transition = "all 0.5s";
      event.target.attributes.r.value = "7";
    };

    const node = svg
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 7)
      .style("stroke", "white")
      .style("stroke-width", 1.5)
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
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("click", (event, d) => {
        setNodeId(d.id);
        setNodeName(d.name);
        setNodeSubFunction(d.subFunction);
        setNodeLevel(d.level);
        setNodeSubLevel(d.subLevel);
        setNodeGrade(d.grade);
      });

    simulation.on("tick", () => {
      node
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });

      link
        .attr("x1", function (d) {
          return d.source.x;
        })
        .attr("y1", function (d) {
          return d.source.y;
        })
        .attr("x2", function (d) {
          return d.target.x;
        })
        .attr("y2", function (d) {
          return d.target.y;
        });
    });
    simulation.restart();
    let divElement = myContainer.current;
    return () => {
      if (divElement.firstChild) {
        divElement.removeChild(divElement.firstChild);
      }
    };
  }, [props, nodeColor]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "500px",
            alignSelf: "center",
            marginTop: "25px",
            flexDirection: "row",
          }}
        >
          <Select
            id="nodeColor"
            options={options}
            defaultValue={options[0]}
            onChange={(e) => setNodeColor(e.value)}
          />
        </div>
      </div>
      <div>
        <h1>Force Layout</h1>
      </div>
      <div ref={myContainer} style={style} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "500px", alignSelf: "center" }}>
          <h3>Node Details</h3>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div></div>
              <div style={{ textAlign: "start" }}>
                <h4>Id: {nodeId}</h4>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Name: {nodeName}</h4>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Sub Function: {nodeSubFunction}</h4>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Level: {nodeLevel}</h4>
              </div>
              <div></div>
              <div style={{ textAlign: "start" }}>
                <h4>Sub Level: {nodeSubLevel}</h4>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Grade: {nodeGrade}</h4>
              </div>
            </div>
          </div>
        </div>
        <div style={{ width: "500px", alignSelf: "center" }}>
          <h3>Related Nodes</h3>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div>
                <h5>Source</h5>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Id: {nodeId}</h4>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Name: {nodeName}</h4>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Sub Function: {nodeSubFunction}</h4>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Level: {nodeLevel}</h4>
              </div>
              <div>
                <h5>Target</h5>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Sub Level: {nodeSubLevel}</h4>
              </div>
              <div style={{ textAlign: "start" }}>
                <h4>Grade: {nodeGrade}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForceLayout;
