import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Select from "react-select";
import sampleData from "./sampleData.json";
// import sampleData from "./oldData.json";
import forceInABox from "./forceInABox";
import "./GroupInBoxLayout.css";
import { subFunctions, getGraphData } from "./Helper";
import MultiSelect from "./MultiSelect";

const GroupInBoxLayout = (props) => {
  const myContainer = useRef(null);

  const defaultProps = {
    allOption: {
      label: "Select all",
      value: "*",
    },
  };

  const handleMultiSelectChange = (selected) => {
    if (
      selected !== null &&
      selected.length > 0 &&
      selected[selected.length - 1].value === defaultProps.allOption.value
    ) {
      setSelectedSubFunction(subFunctions());
      return subFunctions();
    }
    setSelectedSubFunction(selected);
    return selected;
  };

  const { width, height } = props;

  const [graphType, setGraphType] = useState("treemap");

  const [drawTemplate, setDrawTemplate] = useState(false);

  const [showTitle, setShowTitle] = useState(false);

  const subFunctionOptions = subFunctions().map((subFunction) => {
    return { value: subFunction, label: subFunction };
  });

  const [selectedSubFunction, setSelectedSubFunction] =
    useState(subFunctionOptions);

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

  const [selectedNodeColor, setSelectedNodeColor] = useState(nodeColors[0]);

  const [selectedOption, setSelectedOption] = useState(options[1]);

  const [data, setData] = useState(getGraphData(subFunctions(), sampleData));

  const handleOptionChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    setGraphType(selectedOption.value);
  };

  const handleNodeColorChange = (selectedOption) => {
    setSelectedNodeColor(selectedOption);
    setNodeColor(selectedOption.value);
  };

  const style = {
    width,
    height,
    border: "1px solid #323232",
    alignSelf: "center",
  };

  useEffect(() => {
    // setData(getGraphData(selectedSubFunction, sampleData));

    const funcs = [
      ...selectedSubFunction.map((subFunction) => {
        return subFunction.value;
      }),
    ];

    // console.log("selectedSubFunction", funcs);
    setData(getGraphData(funcs, sampleData));
  }, [selectedSubFunction]);

  useEffect(() => {
    const { width, height } = props;

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
          .distance(20)
      )
      .force("collide", d3.forceCollide(5));

    const svg = d3
      .select(myContainer.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    let groupingForce = forceInABox(showTitle)
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
  }, [
    props,
    graphType,
    drawTemplate,
    nodeColor,
    data,
    selectedSubFunction,
    showTitle,
  ]);

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
          <h1>Group In Box Layout</h1>
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
            width: "250px",
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
            width: "250px",
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
            width: "250px",
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
        <div
          style={{
            width: "250px",
            alignSelf: "center",
            flexDirection: "row",
          }}
        >
          <input
            type="checkbox"
            checked={showTitle}
            onChange={(e) => setShowTitle(e.target.checked)}
          />
          <label>Show Title</label>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          maxWidth: "80%",
          alignSelf: "center",
        }}
      >
        <div>
          <MultiSelect
            handleMultiSelectChange={handleMultiSelectChange}
            optionSelected={selectedSubFunction}
            colourOptions={subFunctionOptions}
            defaultProps={defaultProps}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "20px",
        }}
      >
        <div ref={myContainer} style={style} />
      </div>
    </div>
  );
};

export default GroupInBoxLayout;
