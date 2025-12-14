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
  ReactFlowInstance,
  getNodesBounds,
  getViewportForBounds
} from "@xyflow/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { EditableNode } from "./EditableNode";
import { mapApiToFlow } from "./mapApiToFlow";
import { useTranslation } from "react-i18next";

import "@xyflow/react/dist/style.css";

import { SearchResponseDto } from "../../pages/types";

export const PrismaEditor = (apiData: SearchResponseDto) => {
  const { t } = useTranslation();

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const data = mapApiToFlow(apiData, t);

    const fixedEdges = data.edges.map((edge: Edge) => ({
      ...edge,
      style: {
        stroke: "#b1b1b7",
        strokeWidth: 1,
        ...edge.style,
      },
    }));

    return { nodes: data.nodes, edges: fixedEdges };
  }, [apiData]);

  const reactFlowWrapper = useRef(null);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const defaultEdgeOptions = useMemo(() => ({
    style: {
      stroke: '#b1b1b7',
      strokeWidth: 1
    },
  }), []);

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
          label: t("prisma:new_node_label"),
          onChange: handleNodeLabelChange,
          onDelete: handleNodeDelete,
        },
      };
      return [...nds, newNode];
    });
  }, [handleNodeDelete, handleNodeLabelChange]);

  const onNodesChange = useCallback((changes: any) => setNodes((ns: Node[]) => applyNodeChanges(changes, ns)), []);
  const onEdgesChange = useCallback((changes: any) => setEdges((es: Edge[]) => applyEdgeChanges(changes, es)), []);
  const onConnect = useCallback((params: any) => setEdges((es: any[]) => addEdge(params, es)), []);

  const nodesWithHandlers = useMemo(() => {
    return nodes.map((n: Node) => ({
      ...n,
      data: {
        ...n.data,
        onChange: handleNodeLabelChange,
        onDelete: handleNodeDelete,
      },
    }));
  }, [nodes, handleNodeLabelChange, handleNodeDelete]);

  const handleExportPng = useCallback(() => {
    if (!rfInstance) return;

    const imageWidth = 1024;
    const imageHeight = 768;
    const nodesBounds = getNodesBounds(rfInstance.getNodes());

    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5, 2, 0.1
    );

    const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;

    if (viewportElement) {
      toPng(viewportElement, {
        backgroundColor: '#ffffff',
        width: imageWidth,
        height: imageHeight,
        style: {
          width: String(imageWidth),
          height: String(imageHeight),
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
        filter: (node: HTMLElement) => {
          const exclusionClasses = ['react-flow__minimap', 'react-flow__controls'];
          return !exclusionClasses.some((classname) => node.classList?.contains(classname));
        }
      }).then((dataUrl: string) => {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-").substring(0, 19);
        const queryName = apiData.query?.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_") || t("prisma:export_default_query_name");
        const prefix = t("prisma:export_filename_prefix");

        link.download = `${prefix}_${queryName}_${timestamp}.png`;
        link.href = dataUrl;
        link.click();
      });
    }
  }, [rfInstance, apiData]);

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
          onInit={setRfInstance}
          defaultEdgeOptions={defaultEdgeOptions}
        >
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
        </ReactFlow>
      </div>

      <div className="flow-actions">
        <button className="add-node-btn" onClick={handleAddNode}>
          {t("prisma:button_add_step")}
        </button>
        <button className="export-flow-btn" onClick={handleExportPng}>
          {t("prisma:button_export_flowchart")}
        </button>
      </div>
    </div>
  );
};