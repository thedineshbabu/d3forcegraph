import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./GroupBundleGraph.css";
import sampleData from "./groupData.json";

const GroupBundleGraph = (props) => {
  const { width, height } = props;

  const style = {
    width,
    height,
    border: "1px solid #323232",
    alignSelf: "center",
  };

  const myContainer = useRef(null);

  // let force = d3
  //   .forceSimulation(data.nodes)
  //   .force(
  //     "link",
  //     d3
  //       .forceLink(data.links)
  //       .id((d) => d.id)
  //       .distance((l, i) => {
  //         let n1 = l.source,
  //           n2 = l.target;
  //         return (
  //           30 +
  //           Math.min(
  //             20 *
  //               Math.min(
  //                 n1.size || (n1.group !== n2.group ? n1.group_data.size : 0),
  //                 n2.size || (n1.group !== n2.group ? n2.group_data.size : 0)
  //               ),
  //             -30 +
  //               30 *
  //                 Math.min(
  //                   n1.link_count ||
  //                     (n1.group !== n2.group ? n1.group_data.link_count : 0),
  //                   n2.link_count ||
  //                     (n1.group !== n2.group ? n2.group_data.link_count : 0)
  //                 ),
  //             100
  //           )
  //         );
  //       })
  //       .strength((l, i) => {
  //         return 1;
  //       })
  //   )
  //   .force("charge", d3.forceManyBody().strength(-600))
  //   .force("friction", d3.forceManyBody().strength(0.5))
  //   .force("gravity", d3.forceManyBody().strength(0.05))
  //   .force("collide", d3.forceCollide(5));

  // useEffect(() => {

  //   const init = () => {
  //     if (force) force.stop();
  //     net = network(data, net, getGroup, expand);

  //     let force = d3
  //     .forceSimulation(data.nodes)
  //     .force(
  //       "link",
  //       d3
  //         .forceLink(data.links)
  //         .id((d) => d.id)
  //         .distance((l, i) => {
  //           let n1 = l.source,
  //             n2 = l.target;
  //           return (
  //             30 +
  //             Math.min(
  //               20 *
  //                 Math.min(
  //                   n1.size || (n1.group !== n2.group ? n1.group_data.size : 0),
  //                   n2.size || (n1.group !== n2.group ? n2.group_data.size : 0)
  //                 ),
  //               -30 +
  //                 30 *
  //                   Math.min(
  //                     n1.link_count ||
  //                       (n1.group !== n2.group ? n1.group_data.link_count : 0),
  //                     n2.link_count ||
  //                       (n1.group !== n2.group ? n2.group_data.link_count : 0)
  //                   ),
  //               100
  //             )
  //           );
  //         })
  //         .strength((l, i) => {
  //           return 1;
  //         })
  //     )
  //     .force("charge", d3.forceManyBody().strength(-600))
  //     .force("friction", d3.forceManyBody().strength(0.5))
  //     .force("gravity", d3.forceManyBody().strength(0.05))
  //     .force("collide", d3.forceCollide(5));

  //     hullg.selectAll("path.hull").remove();
  //     hull = hullg.selectAll("path.hull")
  //     .data(convexHulls(net.nodes, getGroup, off))
  //   .enter().append("path")
  //     .attr("class", "hull")
  //     .attr("d", drawCluster)
  //     .style("fill", function(d) { return fill(d.group); })
  //     .on("click", function(d) {
  //     console.log("hull click", d, arguments, this, expand[d.group]);
  //     expand[d.group] = false; init();
  //   });

  // link = linkg.selectAll("line.link").data(net.links, linkid);
  // link.exit().remove();
  // link.enter().append("line")
  //     .attr("class", "link")
  //     .attr("x1", function(d) { return d.source.x; })
  //     .attr("y1", function(d) { return d.source.y; })
  //     .attr("x2", function(d) { return d.target.x; })
  //     .attr("y2", function(d) { return d.target.y; })
  //     .style("stroke-width", function(d) { return d.size || 1; });

  //   const svg = d3
  //     .select(myContainer.current)
  //     .append("svg")
  //     .attr("width", width)
  //     .attr("height", height);

  //   // const curve = svg.enter().append("line").attr("tension", 0.85);

  //   const data = sampleData;

  //   for (var i = 0; i < data.links.length; ++i) {
  //     let o = data.links[i];
  //     o.source = data.nodes[o.source];
  //     o.target = data.nodes[o.target];
  //   }

  //   hullg = svg.append("g");
  //   linkg = svg.append("g");
  //   nodeg = svg.append("g");

  //   svg.attr("opacity", 1e-6).transition().duration(1000).attr("opacity", 1);
  // }, []);

  return (
    <div>
      <h1>GroupBundleGraph</h1>

      <div ref={myContainer} style={style} />
    </div>
  );
};

export default GroupBundleGraph;
