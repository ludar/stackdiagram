// StackDoc -> positions via ELK layered layout.
// stdin: StackDoc JSON  ->  stdout: {nodes:{id:{x,y,w,h}}, groups:{id:{x,y,w,h}}}
import ELK from 'elkjs/lib/elk.bundled.js';

const read = async () => {
  let buf = '';
  for await (const chunk of process.stdin) buf += chunk;
  return JSON.parse(buf);
};

// Node box sizing mirrors the viewer's CSS so layout gaps are honest.
const size = (node) => {
  const label = node.label ?? '';
  const lines = 1 + (node.tech ? 1 : 0) + (node.schedule ? 1 : 0);
  const w = Math.max(150, Math.min(280, 24 + label.length * 9));
  let h = 34 + lines * 18;
  if (node.type === 'table' && node.columns?.length) h += Math.min(node.columns.length, 12) * 17 + 8;
  return { width: w, height: h };
};

const doc = await read();
const grouped = new Map(); // nodeId -> groupId
for (const g of doc.groups ?? []) for (const c of g.children) grouped.set(c, g.id);

const topChildren = [];
const groupNodes = new Map();
for (const g of doc.groups ?? []) {
  const el = {
    id: g.id, children: [], layoutOptions: { 'elk.padding': '[top=44,left=18,bottom=18,right=18]' },
  };
  groupNodes.set(g.id, el);
  topChildren.push(el);
}
for (const n of doc.nodes) {
  const el = { id: n.id, ...size(n) };
  const gid = grouped.get(n.id);
  (gid ? groupNodes.get(gid).children : topChildren).push(el);
}

const isDataflow = doc.view === 'dataflow';
const graph = {
  id: 'root',
  layoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': isDataflow ? 'RIGHT' : 'DOWN',
    'elk.layered.spacing.nodeNodeBetweenLayers': '70',
    'elk.spacing.nodeNode': '40',
    'elk.spacing.componentComponent': '60',
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
  },
  children: topChildren,
  edges: (doc.edges ?? []).map((e, i) => ({ id: `e${i}`, sources: [e.from], targets: [e.to] })),
};

const elk = new ELK();
const res = await elk.layout(graph);

const out = { nodes: {}, groups: {} };
const walk = (el, ox, oy) => {
  for (const c of el.children ?? []) {
    const abs = { x: ox + c.x, y: oy + c.y, w: c.width, h: c.height };
    (groupNodes.has(c.id) ? out.groups : out.nodes)[c.id] = abs;
    walk(c, abs.x, abs.y);
  }
};
walk(res, 0, 0);
process.stdout.write(JSON.stringify(out));
