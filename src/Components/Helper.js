import sampleData from "./sampleData.json";

const subFunctions = () => {
  return [...new Set(sampleData.graph.nodes.map((node) => node.subFunction))];
};

const nodeSubFunctions = (nodes) => {
  return [...new Set(nodes.map((node) => node.subFunction))];
};

const levels = (nodes) => {
  return [...new Set(nodes.map((node) => node.level))];
};

const subLevels = (nodes) => {
  return [...new Set(nodes.map((node) => node.subLevel))];
};

const grades = (nodes) => {
  return [...new Set(nodes.map((node) => node.grade))];
};

const getNodeName = (nodeId) => {
  const node = sampleData.graph.nodes.filter((nodeItm) => {
    return nodeItm.id === nodeId;
  })[0];
  return node.name;
};

const getRelatedNodes = (nodeId, data) => {
  console.log(data, "data");
  console.log(nodeId);
  const sourceNodes = data.links.filter((link) => {
    return link.source.id === nodeId;
  });
  const targetNodes = data.links.filter((link) => {
    return link.target.id === nodeId;
  });
  const targetNodesIds = sourceNodes.map((node) => {
    return getNodeName(node.target.id);
  });
  const sourceNodesIds = targetNodes.map((node) => {
    return getNodeName(node.source.id);
  });

  return {
    sourceNodesIds: [...sourceNodesIds],
    targetNodesIds: [...targetNodesIds],
  };
};

// const getGraphData = (functions, customData, probe = 0) => {
//   let nodesList = [];
//   let linksList = [];
//   if (functions.length > 0) {
//     functions.forEach((func) => {
//       const nodes = customData.graph.nodes.filter(
//         (nodeItm) => nodeItm.subFunction === func
//       );
//       nodes.forEach((element) => {
//         nodesList.push(element);
//       });
//     });

//     nodesList.forEach((nodeItm) => {
//       let itemsArr = customData.graph.links.filter((edge) => {
//         if (edge.source.id && edge.target.id) {
//           return edge.source.id === nodeItm.id || edge.target.id === nodeItm.id;
//         } else {
//           return edge.source === nodeItm.id || edge.target === nodeItm.id;
//         }
//       });
//       itemsArr.forEach((itm) => {
//         const hasLinkAlready = linksList.filter((item) => {
//           if (item.source.id && item.target.id) {
//             return (
//               itm.source.id === item.source.id &&
//               itm.target.id === item.target.id
//             );
//           } else {
//             return itm.source === item.source && itm.target === item.target;
//           }
//         });
//         if (hasLinkAlready && hasLinkAlready.length > 0) {
//         } else {
//           if (itm.source.subFunction && itm.target.subFunction) {
//             if (
//               functions.includes(itm.source.subFunction) &&
//               functions.includes(itm.target.subFunction)
//             ) {
//               linksList.push(itm);
//             }
//           } else {
//             linksList.push(itm);
//           }
//         }
//       });
//     });
//   } else {
//     nodesList = customData.graph.nodes;
//     linksList = customData.graph.links;
//   }
//   let linkNodes = [];
//   linksList.forEach((linkItm) => {
//     if (linkItm.source.id && linkItm.target.id) {
//       linkNodes.push(linkItm.source.id);
//       linkNodes.push(linkItm.target.id);
//     } else {
//       linkNodes.push(linkItm.source);
//       linkNodes.push(linkItm.target);
//     }
//   });
//   linkNodes = [...new Set(linkNodes)];
//   let nodesTrimmed = [];
//   nodesList.forEach((nodeItm) => {
//     if (linkNodes.includes(nodeItm.id)) {
//       nodesTrimmed.push(nodeItm);
//     }
//   });
//   if (probe > 0.001) {
//     const probeList = linksList.filter((item) => {
//       return item.transition_prob > probe;
//     });
//     return {
//       nodes: nodesTrimmed,
//       links: probeList,
//     };
//   }
//   return { nodes: nodesTrimmed, links: linksList };
// };

const getGraphData = (
  functions,
  customData,
  probe = 0,
  nodeColor = "",
  selectedLegend = ""
) => {
  let nodesList = [];
  let linksList = [];
  if (functions.length > 0) {
    functions.forEach((func) => {
      const nodes = customData.graph.nodes.filter(
        (nodeItm) => nodeItm.subFunction === func
      );
      nodes.forEach((element) => {
        nodesList.push(element);
      });
    });

    nodesList = legendFilteredNode(nodeColor, selectedLegend, nodesList);

    nodesList.forEach((nodeItm) => {
      let itemsArr = customData.graph.edges.filter((edge) => {
        if (edge.source.id && edge.target.id) {
          return edge.source.id === nodeItm.id || edge.target.id === nodeItm.id;
        } else {
          return edge.source === nodeItm.id || edge.target === nodeItm.id;
        }
      });
      // console.log("itemArr", itemsArr);
      itemsArr = legendFilteredLink(nodeColor, selectedLegend, itemsArr);
      if (probe > 0.01) {
        if (itemsArr && itemsArr.Length > 0) {
          itemsArr = itemsArr.filter((item) => {
            return item.transition_prob > probe;
          });
        }
      }
      itemsArr.forEach((itm) => {
        const hasLinkAlready = linksList.filter((item) => {
          if (item.source.id && item.target.id) {
            return (
              itm.source.id === item.source.id &&
              itm.target.id === item.target.id
            );
          } else {
            return itm.source === item.source && itm.target === item.target;
          }
        });

        if (hasLinkAlready && hasLinkAlready.length > 0) {
        } else {
          if (itm.source.subFunction && itm.target.subFunction) {
            if (
              functions.includes(itm.source.subFunction) &&
              functions.includes(itm.target.subFunction)
            ) {
              if (probe > 0.01 ? itm.transition_prob > probe : true)
                linksList.push(itm);
            }
          } else {
            if (probe > 0.01 ? itm.transition_prob > probe : true)
              linksList.push(itm);
          }
        }
      });
    });
  } else {
    nodesList = customData.graph.nodes;
    linksList = customData.graph.edges;
  }

  // console.log("linkedList", linksList);

  let linkNodes = [];
  linksList.forEach((linkItm) => {
    if (linkItm.source.id && linkItm.target.id) {
      linkNodes.push(linkItm.source.id);
      linkNodes.push(linkItm.target.id);
    } else {
      linkNodes.push(linkItm.source);
      linkNodes.push(linkItm.target);
    }
  });
  linkNodes = [...new Set(linkNodes)];
  // console.log(linkNodes);
  let nodesTrimmed = [];
  nodesList.forEach((nodeItm) => {
    if (linkNodes.includes(nodeItm.id)) {
      nodesTrimmed.push(nodeItm);
    }
  });
  return { nodes: nodesTrimmed, links: linksList };
};

const legendFilteredNode = (nodeColor, legend, nodes) => {
  if (nodeColor === "subLevel" && legend !== "") {
    nodes = nodes.filter((node) => {
      return node.subLevel === legend;
    });
  }
  if (nodeColor === "level" && legend !== "") {
    nodes = nodes.filter((node) => {
      return node.level === legend;
    });
  }
  if (nodeColor === "subFunction" && legend !== "") {
    nodes = nodes.filter((node) => {
      return node.subFunction === legend;
    });
  }
  if (nodeColor === "grade" && legend !== "") {
    nodes = nodes.filter((node) => {
      return node.grade === legend;
    });
  }
  return nodes;
};

const legendFilteredLink = (nodeColor, legend, links) => {
  if (nodeColor === "subLevel" && legend !== "") {
    links = links.filter((link) => {
      return link.source.subLevel === legend && link.target.subLevel === legend;
    });
  }
  if (nodeColor === "level" && legend !== "") {
    links = links.filter((link) => {
      return link.source.level === legend && link.target.level === legend;
    });
  }
  if (nodeColor === "subFunction" && legend !== "") {
    links = links.filter((link) => {
      return (
        link.source.subFunction === legend && link.target.subFunction === legend
      );
    });
  }
  if (nodeColor === "grade" && legend !== "") {
    links = links.filter((link) => {
      return link.source.grade === legend && link.target.grade === legend;
    });
  }
  return links;
};

const getRootData = () => {
  const cNodes = sampleData.graph.nodes.map((node) => {
    return {
      id: node.id,
      subFunction: node.subFunction,
    };
  });
  const cLinks = sampleData.graph.links.map((link) => {
    return {
      source: link.source,
      target: link.target,
    };
  });

  let modData = {
    nodes: cNodes,
    links: cLinks,
  };
  let lnkArr = [];
  modData.nodes.forEach((node) => {
    let lnk = cLinks.filter((link) => {
      return link.source === node.id || link.target === node.id;
    });

    lnk.forEach((link) => {
      const aId = link.source === node.id ? link.target : link.source;
      const subFuncName = modData.nodes.filter((nodeItm) => {
        return nodeItm.id === aId;
      })[0].subFunction;
      lnkArr.push(subFuncName);
    });
  });

  return new Set([...lnkArr]);
};

export { getGraphData };

export { subFunctions };

export { getRootData };

export { grades };

export { levels };

export { subLevels };

export { getNodeName };

export { getRelatedNodes };

export { nodeSubFunctions };
