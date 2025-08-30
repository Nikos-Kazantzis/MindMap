import React, { useRef, useState, useMemo, useEffect } from 'react';
import { ConnectorRenderer } from './ConnectorRenderer';
import { NodeRenderer } from './NodeRenderer';
import { NodeMenu } from './NodeMenu';

export const CanvasView = ({
  sceneGraph,
  viewport,
  selectedNodeIds,
  editingNodeId,
  zoomLimits = { min: 0.25, max: 2.5 },
  fitMarginRatio = 0.1,
  theme,
  onSelectNode = () => {},
  onToggleCollapse = () => {},
  onBeginEdit = () => {},
  onCommitEdit = () => {},
  onCancelEdit = () => {},
  onMenuAction = () => {},
  onPan = () => {},
  onZoomTo = () => {},
  onCenterFit = () => {},
  onGoToRoot = () => {},
  onBeginDrag = () => {},
  onDrag = () => {},
  onEndDrag = () => {}
}) => {
  const svgRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [dragPreview, setDragPreview] = useState(null);

  const nodePositions = useMemo(() => {
    const positions = new Map();
    sceneGraph.nodes.forEach(node => {
      positions.set(node.nodeId || node.id, {
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height
      });
    });
    return positions;
  }, [sceneGraph.nodes]);

  // Handle wheel zoom with proper focal point
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate world coordinates at mouse position
        const worldX = (mouseX - viewport.offsetX) / viewport.zoom;
        const worldY = (mouseY - viewport.offsetY) / viewport.zoom;
        
        // Calculate new zoom
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.min(Math.max(viewport.zoom * delta, zoomLimits.min), zoomLimits.max);
        
        // Calculate new offset to keep mouse position fixed
        const newOffsetX = mouseX - worldX * newZoom;
        const newOffsetY = mouseY - worldY * newZoom;
        
        onZoomTo(newZoom, newOffsetX, newOffsetY);
      }
    };
    
    // Add with passive: false to allow preventDefault
    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => svgElement.removeEventListener('wheel', handleWheel);
    }
  }, [viewport, zoomLimits, onZoomTo]);

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.dataset.testid === 'canvas-background') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      onPan(deltaX, deltaY);
      setPanStart({ x: e.clientX, y: e.clientY });
    } else if (isDraggingNode && dragPreview) {
      // Update drag preview position
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - viewport.offsetX) / viewport.zoom;
      const y = (e.clientY - rect.top - viewport.offsetY) / viewport.zoom;
      setDragPreview({ ...dragPreview, x, y });
    }
  };

  const handleMouseUp = (e) => {
    if (isDraggingNode && dragPreview) {
      // Calculate distance dragged
      const distance = Math.sqrt(
        Math.pow(dragPreview.x - dragPreview.startX, 2) + 
        Math.pow(dragPreview.y - dragPreview.startY, 2)
      );
      
      if (distance > 20) {
        // Create new child node
        onEndDrag(dragPreview.parentId, dragPreview.x, dragPreview.y);
      }
      
      setDragPreview(null);
      setIsDraggingNode(false);
    }
    setIsPanning(false);
  };

  const handleBackgroundClick = (e) => {
    if (e.target.dataset.testid === 'canvas-background') {
      onSelectNode(null);
    }
  };

  const handleNodeDragStart = (nodeId, e) => {
    const node = sceneGraph.nodes.find(n => (n.nodeId || n.id) === nodeId);
    if (node) {
      setIsDraggingNode(true);
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - viewport.offsetX) / viewport.zoom;
      const y = (e.clientY - rect.top - viewport.offsetY) / viewport.zoom;
      setDragPreview({
        parentId: nodeId,
        startX: x,
        startY: y,
        x,
        y,
        width: 100,
        height: node.height
      });
    }
  };

  // Get selected node for menu display
  const selectedNode = selectedNodeIds.length === 1 
    ? sceneGraph.nodes.find(n => (n.nodeId || n.id) === selectedNodeIds[0])
    : null;

  return (
    <svg
      ref={svgRef}
      data-testid="canvas-view"
      width="100%"
      height="100%"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ 
        cursor: isPanning ? 'grabbing' : (isDraggingNode ? 'move' : 'grab'),
        display: 'block',
        width: '100vw',
        height: '100vh',
        userSelect: 'none'
      }}
    >
      <rect
        data-testid="canvas-background"
        width="100%"
        height="100%"
        fill="#f8fafc"
        onClick={handleBackgroundClick}
      />
      
      <g transform={`translate(${viewport.offsetX}, ${viewport.offsetY}) scale(${viewport.zoom})`}>
        {sceneGraph.connectors && (
          <ConnectorRenderer
            connectors={sceneGraph.connectors}
            nodePositions={nodePositions}
            linkConfig={{
              type: 'bezier',
              curvature: 0.3,
              stroke: 2,
              color: '#cbd5e1',
              opacity: 0.6
            }}
          />
        )}
        
        {sceneGraph.nodes.map(node => (
          <NodeRenderer
            key={node.nodeId || node.id}
            node={{
              id: node.nodeId || node.id,
              x: node.x,
              y: node.y,
              width: node.width,
              height: node.height,
              text: node.text,
              class: node.classId || node.class,
              isCollapsed: node.isCollapsed,
              hasNotes: node.hasNotes,
              hasChildren: node.hasChildren
            }}
            isSelected={selectedNodeIds.includes(node.nodeId || node.id)}
            isEditing={node.isEditing || false}
            isMultiSelected={selectedNodeIds.length > 1 && selectedNodeIds.includes(node.nodeId || node.id)}
            showChevron={node.hasChildren}
            theme={theme}
            onSelectNode={onSelectNode}
            onToggleCollapse={onToggleCollapse}
            onBeginEdit={onBeginEdit}
            onCommitEdit={onCommitEdit}
            onCancelEdit={onCancelEdit}
            onBeginDrag={handleNodeDragStart}
          />
        ))}
        
        {/* Drag preview */}
        {dragPreview && (
          <rect
            x={dragPreview.x}
            y={dragPreview.y}
            width={dragPreview.width}
            height={dragPreview.height}
            rx={8}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="4 2"
            pointerEvents="none"
          />
        )}
        
        {/* Node Menu */}
        {selectedNode && (
          <NodeMenu
            node={selectedNode}
            visible={selectedNodeIds.length === 1}
            theme={theme}
            onAction={onMenuAction}
          />
        )}
      </g>
    </svg>
  );
};

CanvasView.capabilities = {
  component: "CanvasView",
  version: "1.0.1",
  features: ["multi-selection", "zoom-to", "center-fit", "go-to-root", "node-menu", "drag-create"]
};