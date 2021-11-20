import * as d3 from "d3";

let dr = 4, // default point radius
  off = 15, // cluster hull offset
  expand = {}, // expanded clusters
  net,
  hullg,
  hull,
  linkg,
  link,
  nodeg,
  node;

const color = d3.scaleOrdinal(d3.schemeCategory10);

var curve = d3.svg.line().interpolate("cardinal-closed").tension(0.85);

const noop = () => {
  return false;
};

const nodeid = (n) => {
  return n.size ? "_g_" + n.group : n.name;
};

const linkid = (l) => {
  var u = nodeid(l.source),
    v = nodeid(l.target);
  return u < v ? u + "|" + v : v + "|" + u;
};

const getGroup = (n) => {
  return n.group;
};

// constructs the network to visualize
const network = (data, prev, index, expand) => {
  expand = expand || {};
  var gm = {}, // group map
    nm = {}, // node map
    lm = {}, // link map
    gn = {}, // previous group nodes
    gc = {}, // previous group centroids
    nodes = [], // output nodes
    links = []; // output links

  // process previous nodes for reuse or centroid calculation
  if (prev) {
    prev.nodes.forEach(function (n) {
      var i = index(n),
        o;
      if (n.size > 0) {
        gn[i] = n;
        n.size = 0;
      } else {
        o = gc[i] || (gc[i] = { x: 0, y: 0, count: 0 });
        o.x += n.x;
        o.y += n.y;
        o.count += 1;
      }
    });
  }

  // determine nodes
  for (var k = 0; k < data.nodes.length; ++k) {
    var n = data.nodes[k],
      i = index(n),
      l =
        gm[i] || (gm[i] = gn[i]) || (gm[i] = { group: i, size: 0, nodes: [] });

    if (expand[i]) {
      // the node should be directly visible
      nm[n.name] = nodes.length;
      nodes.push(n);
      if (gn[i]) {
        // place new nodes at cluster location (plus jitter)
        n.x = gn[i].x + Math.random();
        n.y = gn[i].y + Math.random();
      }
    } else {
      // the node is part of a collapsed cluster
      if (l.size === 0) {
        // if new cluster, add to set and position at centroid of leaf nodes
        nm[i] = nodes.length;
        nodes.push(l);
        if (gc[i]) {
          l.x = gc[i].x / gc[i].count;
          l.y = gc[i].y / gc[i].count;
        }
      }
      l.nodes.push(n);
    }
    // always count group size as we also use it to tweak the force graph strengths/distances
    l.size += 1;
    n.group_data = l;
  }

  for (i in gm) {
    gm[i].link_count = 0;
  }

  // determine links
  for (k = 0; k < data.links.length; ++k) {
    var e = data.links[k],
      u = index(e.source),
      v = index(e.target);
    if (u !== v) {
      gm[u].link_count++;
      gm[v].link_count++;
    }
    u = expand[u] ? nm[e.source.name] : nm[u];
    v = expand[v] ? nm[e.target.name] : nm[v];
    var i = u < v ? u + "|" + v : v + "|" + u,
      l = lm[i] || (lm[i] = { source: u, target: v, size: 0 });
    l.size += 1;
  }
  for (i in lm) {
    links.push(lm[i]);
  }

  return { nodes: nodes, links: links };
};

const convexHulls = (nodes, index, offset) => {
  var hulls = {};

  // create point sets
  for (var k = 0; k < nodes.length; ++k) {
    var n = nodes[k];
    if (n.size) continue;
    var i = index(n),
      l = hulls[i] || (hulls[i] = []);
    l.push([n.x - offset, n.y - offset]);
    l.push([n.x - offset, n.y + offset]);
    l.push([n.x + offset, n.y - offset]);
    l.push([n.x + offset, n.y + offset]);
  }

  // create convex hulls
  var hullset = [];
  for (i in hulls) {
    hullset.push({ group: i, path: d3.geom.hull(hulls[i]) });
  }

  return hullset;
};

const drawCluster = (d) => {
  return curve(d.path); // 0.8
};
