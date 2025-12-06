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
import { FlowchartExportConfig, SearchResponseDto } from "../../pages/types";

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

  const handleExportFlowchart = useCallback(() => {
    const exportConfig: FlowchartExportConfig = {
      exportDate: new Date().toISOString(),
      searchData: {
        query: apiData.query,
        totalArticles: apiData.totalArticles,
        articlesByEngine: apiData.articlesByEngine,
        duplicatedResultsRemoved: apiData.duplicatedResultsRemoved,
        filterImpactByEngine: apiData.filterImpactByEngine,
      },
      flowVisualization: {
        nodes: nodes,
        edges: edges,
      },
      articles: apiData.articles,
    };

    // blob
    const jsonString = JSON.stringify(exportConfig, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
    const queryName = apiData.query?.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_") || "search";
    link.download = `flowchart_${queryName}_${timestamp}.json`;

    // Download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges, apiData]);

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

      <div className="flow-actions">
        <button className="add-node-btn" onClick={handleAddNode}>
          Add Step
        </button>
        <button className="export-flow-btn" onClick={handleExportFlowchart}>
          Export Flowchart
        </button>
      </div>
    </div>
  );
};