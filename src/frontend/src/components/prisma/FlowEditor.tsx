import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
} from "@xyflow/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { EditableNode } from "./EditableNode";
import { mapApiToFlow } from "./mapApiToFlow";

import "@xyflow/react/dist/style.css";

export const FlowEditor = ({ apiData }) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => mapApiToFlow(apiData),
    [apiData]
  );

  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const handleNodeDelete = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const handleNodeLabelChange = useCallback((id, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                label: value,
                onChange: handleNodeLabelChange,
                onDelete: handleNodeDelete,
              },
            }
          : n
      )
    );
  }, []);

    const handleNodeTitleChange = useCallback((id, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                title: value,
                onChange: handleNodeTitleChange,
                onDelete: handleNodeDelete,
              },
            }
          : n
      )
    );
  }, []);

  const handleAddNode = useCallback(() => {
    setNodes((nds) => {
      const newId = (nds.length + 1).toString();
      const newNode = {
        id: newId,
        type: "editableNode",
        position: {
          x: Math.random() * 250,
          y: Math.random() * 250,
        },
        data: {
          label: "New node",
          onChange: handleNodeLabelChange,
          onDelete: handleNodeDelete,
        },
      };
      return [...nds, newNode];
    });
  }, [handleNodeDelete, handleNodeLabelChange]);

  const onNodesChange = useCallback((changes) => setNodes((ns) => applyNodeChanges(changes, ns)), []);
  const onEdgesChange = useCallback((changes) => setEdges((es) => applyEdgeChanges(changes, es)), [] );
  const onConnect = useCallback((params) => setEdges((es) => addEdge(params, es)), [] );

  const nodesWithHandlers = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onChange: handleNodeLabelChange,
        onDelete: handleNodeDelete,
      },
    }));
  }, [nodes, handleNodeLabelChange, handleNodeDelete]);

  return (
    <div className="flow-wrapper">
      <div ref={reactFlowWrapper} className="react-flow-wrapper">
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={{ editableNode: EditableNode }}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
        </ReactFlow>
      </div>

      <button className="add-node-btn" onClick={handleAddNode}>
        Add Step
      </button>
    </div>
  );
};