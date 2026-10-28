import React, { useEffect, useMemo, useState } from "react";
import { ReactFlow, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";
import "./SkillMap.css";

const elk = new ELK();
const W = 180, H = 56;

const LockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
);

const StatusIcon = ({ status, progress }) => {
    if (status === "in-progress") {
        return <span className="skill-icon ring" style={{ "--p": progress }}><span>{progress}%</span></span>;
    }
    return <span className="skill-icon">{status === "mastered" ? "✓" : status === "available" ? "▶" : <LockIcon />}</span>;
};

// lessons: [{ id, name, prereqs?: [lessonId], progress?: 0-100 }]; statusOf(lesson) -> "mastered" | "in-progress" | "available" | "locked"
export default function SkillMap({ lessons, statusOf, history }) {
    const [positions, setPositions] = useState(null);
    const [selected, setSelected] = useState(null);
    const [height, setHeight] = useState(0);

    // key on graph structure, not array identity, so parent re-renders don't trigger a re-layout
    const graphKey = JSON.stringify(lessons.map(l => [l.id, l.prereqs || []]));
    const [ids, baseEdges] = useMemo(() => {
        const graph = JSON.parse(graphKey);
        const idSet = new Set(graph.map(([id]) => id));
        return [graph.map(([id]) => id), graph.flatMap(([id, prereqs]) => prereqs
            .filter(p => idSet.has(p))
            .map(p => ({ id: `${p}->${id}`, source: p, target: id })))];
    }, [graphKey]);

    // ELK only computes node positions; React Flow draws the edges
    useEffect(() => {
        elk.layout({
            id: "root",
            layoutOptions: {
                "elk.algorithm": "layered",
                "elk.direction": "DOWN",
                "elk.spacing.nodeNode": "40",
                "elk.layered.spacing.nodeNodeBetweenLayers": "60",
                "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
            },
            children: ids.map(id => ({ id, width: W, height: H })),
            edges: baseEdges.map(e => ({ id: e.id, sources: [e.source], targets: [e.target] })),
        }).then(g => {
            setHeight(g.height);
            setPositions(Object.fromEntries(g.children.map(c => [c.id, { x: c.x, y: c.y }])));
        });
    }, [ids, baseEdges]);

    const nodes = useMemo(() => positions ? lessons.map(l => ({
        id: l.id,
        position: positions[l.id],
        data: { label: <><StatusIcon status={statusOf(l)} progress={l.progress ?? 0} />{l.name.replace(/##/g, "")}</> },
        className: `skill-node ${statusOf(l)}${l.id === selected ? " selected" : ""}`,
        // explicit size: otherwise React Flow hides each new node object until it re-measures it
        width: W,
        height: H,
    })) : [], [positions, lessons, selected, statusOf]);

    const edges = useMemo(() => baseEdges.map(e => {
        const into = e.target === selected, out = e.source === selected;
        const color = into || out ? "#1f3a5f" : "#b8c2cc";
        return {
            ...e,
            type: "smoothstep",
            style: { stroke: color, strokeWidth: into || out ? 2.5 : 1.5, strokeDasharray: out ? "6 4" : undefined },
            markerEnd: { type: MarkerType.ArrowClosed, color },
        };
    }), [baseEdges, selected]);

    const onNodeClick = (_, node) =>
        node.id === selected ? history.push(`/lessons/${node.id}`) : setSelected(node.id);

    if (!positions) return null;
    return (
        // grow the container to the graph's height so fitView only scales to the width
        <div className="skill-map" style={{ height: height + 80 }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={onNodeClick}
                onPaneClick={() => setSelected(null)}
                fitView
                fitViewOptions={{ maxZoom: 1 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                proOptions={{ hideAttribution: true }}
            />
        </div>
    );
}
