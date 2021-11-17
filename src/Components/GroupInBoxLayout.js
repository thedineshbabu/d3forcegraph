import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Select from "react-select";
// import sampleData from "./sampleData.json";
import sampleData from "./oldData.json";
import forceInABox from "./forceInABox";
import "./GroupInBoxLayout.css";

const GroupInBoxLayout = (props) => {
  const myContainer = useRef(null);

  // const groupName = nodeColor;

  const { width, height } = props;

  const [graphType, setGraphType] = useState("treemap");

  const [drawTemplate, setDrawTemplate] = useState(false);

  const options = [
    { value: "force", label: "Force" },
    { value: "treemap", label: "Tree Map" },
  ];

  const nodeColors = [
    { value: "subFunction", label: "Sub Function" },
    { value: "level", label: "Level" },
    { value: "subLevel", label: "Sub Level" },
    { value: "grade", label: "Grade" },
  ];

  const [nodeColor, setNodeColor] = useState("subFunction");

  const [selectedNodeColor, setselectedNodeColor] = useState(nodeColors[0]);

  const [selectedOption, setSelectedOption] = useState(options[1]);

  const handleOptionChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    setGraphType(selectedOption.value);
  };

  const handleNodeColorChange = (selectedOption) => {
    setselectedNodeColor(selectedOption);
    setNodeColor(selectedOption.value);
  };

  const style = {
    width,
    height,
    border: "1px solid #323232",
    alignSelf: "center",
  };

  useEffect(() => {
    const { width, height } = props;

    let useGroupInABox = true,
      template = graphType;

    const data = sampleData;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    var force = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance(20)
      )
      .force("collide", d3.forceCollide(5));

    const svg = d3
      .select(myContainer.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    let groupingForce = forceInABox()
      .strength(0.1) // Strength to foci
      .template(template) // Either treemap or force
      .groupBy(nodeColor) // Node attribute to group
      .links(data.links) // The graph links. Must be called after setting the grouping attribute
      .enableGrouping(useGroupInABox)
      .nodeSize(15) // Used to compute the size of the template nodes, think of it as the radius the node uses, including its padding
      .forceCharge(-50 * 15) // Separation between nodes on the force template
      .size([width, height]); // Size of the chart

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
      event.target.attributes.r.value = "12";
    };

    const mouseout = (event, d) => {
      event.target.attributes.r.value = "7";
    };

    let node = svg
      .selectAll(".node")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", 7)
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
      node
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
    });
    let divElement = myContainer.current;
    return () => {
      if (divElement.firstChild) {
        divElement.removeChild(divElement.firstChild);
      }
    };
  }, [props, graphType, drawTemplate, nodeColor]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          <h1>GroupInBoxLayout</h1>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            width: "150px",
            alignSelf: "center",
            flexDirection: "row",
          }}
        >
          <Select
            value={selectedOption}
            onChange={handleOptionChange}
            options={options}
          />
        </div>
        <div
          style={{
            width: "200px",
            alignSelf: "center",
            flexDirection: "row",
          }}
        >
          <Select
            value={selectedNodeColor}
            onChange={handleNodeColorChange}
            options={nodeColors}
          />
        </div>
        <div
          style={{
            width: "150px",
            alignSelf: "center",
            flexDirection: "row",
          }}
        >
          <input
            type="checkbox"
            checked={drawTemplate}
            onChange={(e) => setDrawTemplate(e.target.checked)}
          />
          <label>Draw Template</label>
        </div>
      </div>

      <div ref={myContainer} style={style} />
    </div>
  );
};

export default GroupInBoxLayout;
