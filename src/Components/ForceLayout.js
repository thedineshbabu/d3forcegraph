import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import data from "./jobview.json";

const ForceLayout = (props) => {
  const myContainer = useRef(null);
  const { width, height } = props;
  const style = {
    width,
    height,
    border: "1px solid #323232",
    alignSelf: "center",
  };

  useEffect(() => {
    const { width, height } = props;

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    let simulation = d3
      .forceSimulation(data.nodes)
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d) => d.id)
          .distance((d) => {
            return d.transitionprob * 1000 * 1000;
          })
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

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
      .attr("stroke", "gray")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.sqrt(d.value));

    const node = svg
      .selectAll("circle")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("r", 7)
      .style("stroke", "white")
      .style("stroke-width", 1.5)
      .style("fill", function (d) {
        return color(d.group);
      })
      .on("click", (event, d) => {
        console.log(d);
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
  }, [props]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div>
        <h1>Client Function Graph</h1>
      </div>
      <div ref={myContainer} style={style} />
    </div>
  );
};

export default ForceLayout;
