import React, { useRef } from 'react';
import { 
  Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, Home, 
  Plus, Trash2, Palette, Download, Upload, Copy, Clipboard 
} from 'lucide-react';

export const Toolbar = ({
  items,
  selectedCount,
  selectedNodeIds = [],  // Add with default
  state = null,  // Add with default
  canUndo,
  canRedo,
  classes,
  placement,
  onAction = () => {},
  onFileImport = () => {},
  onClassChange = () => {}
}) => {
  const fileInputRef = useRef(null);

  // Helper function to find node in state
  const findNodeInState = (root, nodeId) => {
    if (!root) return null;
    if (root.id === nodeId) return root;
    if (root.children) {
      for (const child of root.children) {
        const found = findNodeInState(child, nodeId);
        if (found) return found;
      }
    }
    return null;
  };

  const defaultItems = [
    { id: 'undo', icon: Undo2, label: 'Undo', action: 'undo' },
    { id: 'redo', icon: Redo2, label: 'Redo', action: 'redo' },
    { id: 'divider1', type: 'divider' },
    { id: 'copy', icon: Copy, label: 'Copy', action: 'copy' },
    { id: 'paste', icon: Clipboard, label: 'Paste', action: 'paste' },
    { id: 'divider2', type: 'divider' },
    { id: 'zoomIn', icon: ZoomIn, label: 'Zoom In', action: 'zoomIn' },
    { id: 'zoomOut', icon: ZoomOut, label: 'Zoom Out', action: 'zoomOut' },
    { id: 'fit', icon: Maximize2, label: 'Fit to Screen', action: 'fit' },
    { id: 'center', icon: Home, label: 'Center', action: 'center' },
    { id: 'divider3', type: 'divider' },
    { id: 'add', icon: Plus, label: 'Add Node', action: 'add' },
    { id: 'delete', icon: Trash2, label: 'Delete', action: 'delete' },
    { id: 'divider4', type: 'divider' },
    { id: 'classEditor', icon: Palette, label: 'Class Editor', action: 'classEditor' },
    { id: 'export', icon: Download, label: 'Export', action: 'export' },
    { id: 'import', icon: Upload, label: 'Import', action: 'import' }
  ];

  const toolbarItems = items?.length > 0 ? items : defaultItems;

  const handleButtonClick = (item) => {
    if (item.id === 'import') {
      fileInputRef.current?.click();
    } else {
      onAction(item.action || item.id, {});
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileImport(file, 'import');
      e.target.value = '';
    }
  };

  const isDisabled = (item) => {
    if (item.id === 'undo') return !canUndo;
    if (item.id === 'redo') return !canRedo;
    if (item.id === 'delete' || item.id === 'add' || item.id === 'copy') return selectedCount === 0;
    if (item.id === 'paste') return false; // Will be handled by clipboard state later
    return false;
  };

  const positionStyles = {
    position: 'absolute',
    top: placement.anchor.includes('top') ? placement.offsetY : 'auto',
    bottom: placement.anchor.includes('bottom') ? placement.offsetY : 'auto',
    left: placement.anchor.includes('left') ? placement.offsetX : 'auto',
    right: placement.anchor.includes('right') ? placement.offsetX : 'auto'
  };

  // Get current class for selector
  const getCurrentClass = () => {
    if (selectedNodeIds.length > 0 && state) {
      const node = findNodeInState(state, selectedNodeIds[0]);
      return node?.class || 'default';
    }
    return 'default';
  };

  return (
    <div
      data-testid="toolbar"
      style={{
        ...positionStyles,
        display: 'flex',
        flexDirection: placement.flow === 'column' ? 'column' : 'row',
        gap: '4px',
        padding: '8px',
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        alignItems: 'center'
      }}
    >
      {toolbarItems.map(item => {
        if (item.type === 'divider') {
          return (
            <div
              key={item.id}
              style={{
                width: placement.flow === 'column' ? '24px' : '1px',
                height: placement.flow === 'column' ? '1px' : '24px',
                backgroundColor: 'rgba(255,255,255,0.2)'
              }}
            />
          );
        }

        const Icon = item.icon;
        return (
          <button
            key={item.id}
            data-testid={`toolbar-btn-${item.id}`}
            onClick={() => handleButtonClick(item)}
            disabled={isDisabled(item)}
            title={item.label}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: isDisabled(item) ? 'not-allowed' : 'pointer',
              opacity: isDisabled(item) ? 0.4 : 1,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isDisabled(item)) {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <Icon size={18} color="white" />
          </button>
        );
      })}
      
      {selectedCount > 0 && (
        <>
          <div
            style={{
              width: placement.flow === 'column' ? '24px' : '1px',
              height: placement.flow === 'column' ? '1px' : '24px',
              backgroundColor: 'rgba(255,255,255,0.2)'
            }}
          />
          <select
            data-testid="class-selector"
            value={getCurrentClass()}
            onChange={(e) => onClassChange(e.target.value)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#334155',
              color: 'white',
              border: '1px solid #475569',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {Object.keys(classes).map(className => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

Toolbar.capabilities = {
  component: "Toolbar",
  version: "1.2.0",
  features: ["file-import", "class-selector", "conditional-enable", "flexible-layout", "lucide-icons"]
};