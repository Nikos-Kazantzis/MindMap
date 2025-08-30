import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CanvasView } from './CanvasView';
import { Toolbar } from './Toolbar';
import { NotesPanel } from './NotesPanel';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { ClassEditorPanel } from './ClassEditorPanel';
import { LayoutEngine } from './LayoutEngine';

export const MindmapView = ({
  runtime,
  appSpec,
  uiSpec,
  enableKeyboardShortcuts = true,
  onStateChange = () => { },
  onSelectionChange = () => { },
  onError = () => { }
}) => {
  const [state, setState] = useState(() => runtime.getState());
  const [selectedNodeIds, setSelectedNodeIds] = useState([]);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showClassEditor, setShowClassEditor] = useState(false);
  const [clipboard, setClipboard] = useState(null);

  const [viewport, setViewport] = useState(() => {
    const initialZoom = uiSpec.canvas?.zoom?.default || 1;
    return {
      zoom: initialZoom,
      offsetX: window.innerWidth / 2,
      offsetY: window.innerHeight / 2
    };
  });

  useEffect(() => {
    const unsubscribe = runtime.subscribe((newState) => {
      setState(newState);
      onStateChange(newState);
    });
    return unsubscribe;
  }, [runtime, onStateChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!enableKeyboardShortcuts) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        runtime.undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        runtime.redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      } else if (e.key === 'Escape') {
        setEditingNodeId(null);
        setShowNotesPanel(false);
        setShowPropertiesPanel(false);
        setShowClassEditor(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, runtime, selectedNodeIds, clipboard]);

  // Helper to find node in state
  const findNodeInState = useCallback((nodeId, root = state) => {
    if (root.id === nodeId) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findNodeInState(nodeId, child);
        if (found) return found;
      }
    }
    return null;
  }, [state]);

  const layoutEngine = new LayoutEngine({
    rootNode: state,
    layoutConfig: uiSpec.layout || {
      type: 'tree-ltr',
      spacing: { horizontal: 140, vertical: 50 }
    },
    theme: uiSpec.theme,
    collapsedNodes: collapsedNodes
  });

  const sceneGraph = layoutEngine.layout();

  const handleSelectNode = useCallback((nodeId, event = {}) => {
    if (event.ctrlKey) {
      setSelectedNodeIds(prev => {
        if (prev.includes(nodeId)) {
          return prev.filter(id => id !== nodeId);
        }
        return [...prev, nodeId];
      });
    } else {
      const newSelection = nodeId ? [nodeId] : [];
      setSelectedNodeIds(newSelection);
    }
  }, []);

  const handleToggleCollapse = useCallback((nodeId) => {
    setCollapsedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const handleBeginEdit = useCallback((nodeId) => {
    setEditingNodeId(nodeId);
  }, []);

  const handleCommitEdit = useCallback((nodeId, text) => {
    runtime.dispatch({ type: 'setText', params: { nodeId, text } });
    setEditingNodeId(null);
  }, [runtime]);

  const handleCancelEdit = useCallback(() => {
    setEditingNodeId(null);
  }, []);

  const handleCopy = useCallback(() => {
    if (selectedNodeIds.length > 0) {
      const nodesToCopy = selectedNodeIds.map(id => {
        const node = findNodeInState(id);
        if (node) {
          return JSON.parse(JSON.stringify(node));
        }
        return null;
      }).filter(Boolean);

      setClipboard(nodesToCopy);
    }
  }, [selectedNodeIds, findNodeInState]);

  const handlePaste = useCallback(() => {
    if (clipboard && clipboard.length > 0 && selectedNodeIds.length > 0) {
      const targetId = selectedNodeIds[0];
      clipboard.forEach(nodeData => {
        // Generate new IDs for pasted nodes
        const generateNewIds = (node) => {
          const newNode = { ...node, id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
          if (newNode.children) {
            newNode.children = newNode.children.map(generateNewIds);
          }
          return newNode;
        };

        const newNode = generateNewIds(nodeData);
        runtime.dispatch({
          type: 'addChild',
          params: { parentId: targetId, ...newNode }
        });
      });
    }
  }, [clipboard, selectedNodeIds, runtime]);

  const handleMenuAction = useCallback((action, params) => {
    switch (action) {
      case 'addChild':
        if (params.nodeId) {
          runtime.dispatch({
            type: 'addChild',
            params: { parentId: params.nodeId, text: 'New Node' }
          });
        }
        break;
      case 'deleteNode':
        if (params.nodeId) {
          runtime.dispatch({
            type: 'removeNode',
            params: { nodeId: params.nodeId }
          });
          setSelectedNodeIds(prev => prev.filter(id => id !== params.nodeId));
        }
        break;
      case 'openProperties':
        const propNode = findNodeInState(selectedNodeIds[0]);
        if (propNode) {
          setShowPropertiesPanel(true);
          setShowNotesPanel(false);
          setShowClassEditor(false);
        }
        break;
      case 'openNotes':
        setShowNotesPanel(true);
        setShowPropertiesPanel(false);
        setShowClassEditor(false);
        break;
    }
  }, [runtime, selectedNodeIds, findNodeInState]);

  const handleDragEnd = useCallback((parentId, x, y) => {
    runtime.dispatch({
      type: 'addChild',
      params: { parentId, text: 'New Node' }
    });
  }, [runtime]);

  const handleToolbarAction = useCallback((actionId) => {
    switch (actionId) {
      case 'undo':
        runtime.undo();
        break;
      case 'redo':
        runtime.redo();
        break;
      case 'copy':
        handleCopy();
        break;
      case 'paste':
        handlePaste();
        break;
      case 'zoomIn':
        setViewport(prev => ({
          ...prev,
          zoom: Math.min(prev.zoom * 1.2, uiSpec.canvas?.zoom?.max || 2.5)
        }));
        break;
      case 'zoomOut':
        setViewport(prev => ({
          ...prev,
          zoom: Math.max(prev.zoom * 0.8, uiSpec.canvas?.zoom?.min || 0.25)
        }));
        break;
      case 'fit':
        if (sceneGraph.bounds) {
          const { minX, minY, maxX, maxY } = sceneGraph.bounds;
          const width = maxX - minX;
          const height = maxY - minY;
          const scaleX = (window.innerWidth - 100) / width;
          const scaleY = (window.innerHeight - 100) / height;
          const zoom = Math.min(scaleX, scaleY, 1.5);
          setViewport({
            zoom,
            offsetX: (window.innerWidth - width * zoom) / 2 - minX * zoom,
            offsetY: (window.innerHeight - height * zoom) / 2 - minY * zoom
          });
        }
        break;
      case 'center':
        const rootNode = sceneGraph.nodes.find(n => n.depth === 0);
        if (rootNode) {
          setViewport({
            zoom: 1,
            offsetX: window.innerWidth / 2 - rootNode.x - rootNode.width / 2,
            offsetY: window.innerHeight / 2 - rootNode.y - rootNode.height / 2
          });
        }
        break;
      case 'add':
        if (selectedNodeIds.length > 0) {
          runtime.dispatch({
            type: 'addChild',
            params: { parentId: selectedNodeIds[0], text: 'New Node' }
          });
        }
        break;
      case 'delete':
        selectedNodeIds.forEach(nodeId => {
          runtime.dispatch({ type: 'removeNode', params: { nodeId } });
        });
        setSelectedNodeIds([]);
        break;
      case 'classEditor':
        setShowClassEditor(true);
        setShowPropertiesPanel(false);
        setShowNotesPanel(false);
        break;
      case 'export':
        const data = runtime.exportJSON();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mindmap.json';
        a.click();
        URL.revokeObjectURL(url);
        break;
    }
  }, [runtime, selectedNodeIds, sceneGraph.bounds, uiSpec.canvas?.zoom, handleCopy, handlePaste]);

  const handleClassChange = useCallback((className) => {
    selectedNodeIds.forEach(nodeId => {
      runtime.dispatch({
        type: 'setClass',
        params: { nodeId, class: className }
      });
    });
  }, [selectedNodeIds, runtime]);

  const handlePan = (deltaX, deltaY) => {
    setViewport(prev => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY
    }));
  };

  const handleZoomTo = (zoom, offsetX, offsetY) => {
    setViewport({ zoom, offsetX, offsetY });
  };

  const nodesWithEditState = sceneGraph.nodes.map(node => ({
    ...node,
    isEditing: node.nodeId === editingNodeId || node.id === editingNodeId
  }));

  return (
    <div data-testid="mindmap-view" style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <CanvasView
        sceneGraph={{ ...sceneGraph, nodes: nodesWithEditState }}
        viewport={viewport}
        selectedNodeIds={selectedNodeIds}
        editingNodeId={editingNodeId}
        zoomLimits={uiSpec.canvas?.zoom}
        theme={uiSpec.theme}
        onSelectNode={handleSelectNode}
        onToggleCollapse={handleToggleCollapse}
        onBeginEdit={handleBeginEdit}
        onCommitEdit={handleCommitEdit}
        onCancelEdit={handleCancelEdit}
        onMenuAction={handleMenuAction}
        onPan={handlePan}
        onZoomTo={handleZoomTo}
        onEndDrag={handleDragEnd}
      />

      <Toolbar
        items={[]}
        selectedCount={selectedNodeIds.length}
        selectedNodeIds={selectedNodeIds}
        state={state}
        canUndo={runtime.canUndo()}
        canRedo={runtime.canRedo()}
        classes={uiSpec.theme?.classMap || {}}
        placement={uiSpec.toolbar?.placement || {
          anchor: 'top-left',
          offsetX: 16,
          offsetY: 16,
          flow: 'row'
        }}
        onAction={handleToolbarAction}
        onClassChange={handleClassChange}
        onFileImport={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              runtime.importJSON(e.target.result);
            } catch (error) {
              console.error('Import failed:', error);
            }
          };
          reader.readAsText(file);
        }}
      />

      {showNotesPanel && selectedNodeIds.length > 0 && (
        <NotesPanel
          node={findNodeInState(selectedNodeIds[0])}
          isOpen={showNotesPanel}
          onSave={(nodeId, notes) => {
            runtime.dispatch({ type: 'setNotes', params: { nodeId, notes } });
            setShowNotesPanel(false);
          }}
          onClose={() => setShowNotesPanel(false)}
        />
      )}

      {showPropertiesPanel && selectedNodeIds.length > 0 && (
        <NodePropertiesPanel
          node={findNodeInState(selectedNodeIds[0])}
          isOpen={showPropertiesPanel}
          classes={uiSpec.theme?.classMap || {}}
          onUpdate={(nodeId, properties) => {
            Object.entries(properties).forEach(([key, value]) => {
              runtime.dispatch({
                type: `set${key.charAt(0).toUpperCase() + key.slice(1)}`,
                params: { nodeId, [key]: value }
              });
            });
            setShowPropertiesPanel(false);
          }}
          onClose={() => setShowPropertiesPanel(false)}
        />
      )}

      {showClassEditor && (
        <ClassEditorPanel
          classes={uiSpec.theme?.classMap || {}}
          isOpen={showClassEditor}
          defaultClasses={['default']}
          onSave={(newClasses) => {
            // Would need to update uiSpec here
            console.log('Save classes:', newClasses);
            setShowClassEditor(false);
          }}
          onClose={() => setShowClassEditor(false)}
        />
      )}
    </div>
  );
};

MindmapView.capabilities = {
  component: "MindmapView",
  version: "1.0.1",
  features: ["multi-component-orchestration", "keyboard-shortcuts", "state-management", "clipboard", "drag-create"]
};
