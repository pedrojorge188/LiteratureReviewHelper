import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  Node,
  ReactFlow,
} from "@xyflow/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { EditableNode } from "./EditableNode";
import { mapApiToFlow } from "./mapApiToFlow";

import "@xyflow/react/dist/style.css";
import { SearchResponseDto } from "../../pages/types";

export const PrismaEditor = (apiData: SearchResponseDto) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => mapApiToFlow(apiData),
    [apiData]
  );

  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const handleNodeDelete = useCallback((id: string) => {
    setNodes((nds: any[]) => nds.filter((n: { id: string; }) => n.id !== id));
    setEdges((eds: any[]) => eds.filter((e: { source: string; target: string; }) => e.source !== id && e.target !== id));
  }, []);

  const handleNodeLabelChange = useCallback((id: string, value: string) => {
    setNodes((nds: any[]) =>
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

    const handleNodeTitleChange = useCallback((id: string, value: string) => {
    setNodes((nds: any[]) =>
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
    setNodes((nds: any) => {
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

  const onNodesChange = useCallback((changes: any) => setNodes((ns: Node[]) => applyNodeChanges(changes, ns)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((es: Edge[]) => applyEdgeChanges(changes, es)), [] );
  const onConnect = useCallback((params: any) => setEdges((es: any[]) => addEdge(params, es)), [] );

  const nodesWithHandlers = useMemo(() => {
    return nodes.map((n: { data: any; }) => ({
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