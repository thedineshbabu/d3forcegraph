import sampleData from "./sampleData.json";

const subFunctions = () => {
  return [...new Set(sampleData.graph.nodes.map((node) => node.subFunction))];
};

const getGraphData = (functions, customData, probe = 0) => {
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

    nodesList.forEach((nodeItm) => {
      let itemsArr = customData.graph.links.filter((edge) => {
        if (edge.source.id && edge.target.id) {
          return edge.source.id === nodeItm.id || edge.target.id === nodeItm.id;
        } else {
          return edge.source === nodeItm.id || edge.target === nodeItm.id;
        }
      });
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
              linksList.push(itm);
            }
          } else {
            linksList.push(itm);
          }
        }
      });
    });
  } else {
    nodesList = customData.graph.nodes;
    linksList = customData.graph.links;
  }
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
  let nodesTrimmed = [];
  nodesList.forEach((nodeItm) => {
    if (linkNodes.includes(nodeItm.id)) {
      nodesTrimmed.push(nodeItm);
    }
  });
  if (probe > 0.01) {
    const probeList = linksList.filter((item) => {
      return item.transition_prob > probe;
    });
    return {
      nodes: nodesTrimmed,
      links: probeList,
    };
  }
  return { nodes: nodesTrimmed, links: linksList };
};

export { getGraphData };

export { subFunctions };
