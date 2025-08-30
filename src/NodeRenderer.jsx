import React, { memo, useState, useEffect, useRef } from 'react';

export const NodeRenderer = memo(({
  node,
  isSelected,
  isEditing,
  isMultiSelected = false,
  showChevron,
  theme,
  onSelectNode = () => { },
  onToggleCollapse = () => { },
  onBeginEdit = () => { },
  onCommitEdit = () => { },
  onCancelEdit = () => { },
  onBeginDrag = () => { }
}) => {
  const [isDragHovered, setIsDragHovered] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const [nodeWidth, setNodeWidth] = useState(node.width);
  const textRef = useRef(null);

  const nodeClass = theme?.classMap?.[node.class || 'default'] || theme?.classMap?.default || {
    boxFill: '#ffffff',
    boxStroke: '#e5e7eb',
    textFill: '#1f2937',
    textAlign: 'center'
  };

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [isEditing]);

  useEffect(() => {
    setEditText(node.text);
  }, [node.text]);

  const handleClick = (e) => {
    e.stopPropagation();
    onSelectNode(node.id, { ctrlKey: e.ctrlKey || e.metaKey });
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onBeginEdit(node.id);
  };

  const handleChevronClick = (e) => {
    e.stopPropagation();
    onToggleCollapse(node.id);
  };

  const handleTextInput = (e) => {
    const text = e.currentTarget.textContent || '';
    setEditText(text);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${theme?.font?.weight || 500} ${theme?.font?.size || 14}px ${theme?.font?.family || 'Inter'}`;
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width + (theme?.font?.paddingX || 16) * 2;
    const newWidth = Math.min(Math.max(textWidth, 80), 300);
    setNodeWidth(newWidth);
  };

  const handleTextBlur = () => {
    if (isEditing) {
      onCommitEdit(node.id, editText, { width: nodeWidth, height: node.height });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onCommitEdit(node.id, editText, { width: nodeWidth, height: node.height });
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditText(node.text);
      onCancelEdit(node.id);
    }
  };

  const handleDragStart = (e) => {
    e.stopPropagation();
    onBeginDrag(node.id, e);
  };

  const displayWidth = isEditing ? nodeWidth : node.width;

  return (
    <g
      data-testid={`node-${node.id}`}
      transform={`translate(${node.x}, ${node.y})`}
      style={{ userSelect: 'none' }}
    >
      <rect
        width={displayWidth}
        height={node.height}
        rx={theme?.font?.radius || 8}
        fill={nodeClass.boxFill}
        stroke={isSelected ? '#3b82f6' : nodeClass.boxStroke}
        strokeWidth={isSelected ? 2 : 1}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: 'pointer' }}
      />

      {isEditing ? (
        <foreignObject
          x={0}
          y={0}
          width={displayWidth}
          height={node.height}
        >
          <div
            ref={textRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={handleTextInput}
            onBlur={handleTextBlur}
            onKeyDown={handleKeyDown}
            dir="ltr"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: nodeClass.textAlign || 'center',
              padding: `0 ${theme?.font?.paddingX || 16}px`,
              fontSize: `${theme?.font?.size || 14}px`,
              fontFamily: theme?.font?.family || 'Inter, sans-serif',
              fontWeight: theme?.font?.weight || 500,
              color: nodeClass.textFill,
              outline: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              direction: 'ltr !important',
              unicodeBidi: 'isolate-override',
              textAlign: 'left'
            }}
          >
            {editText || 'New node'}
          </div>
        </foreignObject>
      ) : (
        <text
          x={displayWidth / 2}
          y={node.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={nodeClass.textFill}
          fontSize={theme?.font?.size || 14}
          fontFamily={theme?.font?.family || 'Inter, sans-serif'}
          fontWeight={theme?.font?.weight || 500}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {node.text || 'New node'}
        </text>
      )}

      {/* Chevron */}
      {showChevron && (
        <g
          data-testid={`chevron-${node.id}`}
          transform={`translate(${displayWidth + 20}, ${node.height / 2})`}
          onClick={handleChevronClick}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          <circle
            r="10"
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
          <text
            x="0"
            y="1"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fill="#6b7280"
            fontWeight="400"
            style={{ userSelect: 'none' }}
          >
            {node.isCollapsed ? '+' : '−'}
          </text>
        </g>
      )}

      {/* Drag handle zone */}
      <rect
        data-testid={`drag-${node.id}`}
        x={displayWidth - 8}
        y={0}
        width={8}
        height={node.height}
        fill={isDragHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}
        onMouseEnter={() => setIsDragHovered(true)}
        onMouseLeave={() => setIsDragHovered(false)}
        onMouseDown={handleDragStart}
        style={{ cursor: 'default' }}
      />

      {/* Notes indicator */}
      {node.hasNotes && (
        <circle
          cx={displayWidth - 12}
          cy={12}
          r={4}
          fill="#fbbf24"
        />
      )}

      {/* Multi-select indicator */}
      {isMultiSelected && (
        <rect
          width={displayWidth}
          height={node.height}
          rx={theme?.font?.radius || 8}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="4 2"
          pointerEvents="none"
        />
      )}
    </g>
  );
});

NodeRenderer.capabilities = {
  component: "NodeRenderer",
  version: "1.3.0",
  features: ["inline-editing", "multi-select", "drag-handle", "chevron", "auto-resize"]
};