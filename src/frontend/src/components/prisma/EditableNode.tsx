import { useState, useEffect, useRef } from "react";
import { NodeResizer, Handle, Position } from "@xyflow/react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export const EditableNode = ({ id, data, selected }: any) => {
  const { t } = useTranslation();

  const [label, setLabel] = useState(data.label);
  const [title, setTitle] = useState(data.title);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleChange = (e: { target: { value: any; }; }) => {
    setLabel(e.target.value);
    data.onChange(id, e.target.value);
  };

  const titleChange = (e: { target: { value: any; }; }) => {
    setTitle(e.target.value);
    data.onChange(id, e.target.value);
  };

  useEffect(() => {
    if (spanRef.current) {
      spanRef.current.offsetWidth;
    }
  }, [label]);

  return (
    <>
      <div className={`node-container ${selected ? 'selected' : ''}`}>
        <input className="node-title" value={title} onChange={titleChange} />
        <textarea className="node-label" value={label} onChange={handleChange} placeholder={t("prisma:node_label_placeholder")} />
        <span className="node-delete" onClick={() => data?.onDelete?.(id)}>
          <X size={10} strokeWidth={2} />
        </span>
      </div>
      <NodeResizer
        isVisible={selected}
        minWidth={150}
        minHeight={120}
        color="#555"
        handleStyle={{
          borderRadius: '50%',
          width: 8,
          height: 8,
          background: '#777',
        }}
      />
      <Handle type="target" position={Position.Top} className="react-flow-handle" />
      <Handle type="source" position={Position.Bottom} className="react-flow-handle" />
    </>
  );
};
