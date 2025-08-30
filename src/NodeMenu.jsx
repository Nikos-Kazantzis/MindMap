import React from 'react';
import { Plus, Trash2, Settings, FileText } from 'lucide-react';

export const NodeMenu = ({
  node,
  visible,
  theme,
  onAction = () => {}
}) => {
  if (!visible || !node) return null;

  const items = [
    { id: 'add', icon: Plus, tooltip: 'Add Child', action: 'addChild' },
    { id: 'delete', icon: Trash2, tooltip: 'Delete', action: 'deleteNode' },
    { id: 'properties', icon: Settings, tooltip: 'Properties', action: 'openProperties' },
    { id: 'notes', icon: FileText, tooltip: 'Notes', action: 'openNotes' }
  ];

  const menuX = node.x + (node.width / 2) - 80;
  const menuY = node.y - 44;

  return (
    <foreignObject x={menuX} y={menuY} width={160} height={36}>
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '6px',
        backgroundColor: '#1e293b',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onAction(item.action, { nodeId: node.id })}
              title={item.tooltip}
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <Icon size={16} color="white" />
            </button>
          );
        })}
      </div>
    </foreignObject>
  );
};

NodeMenu.capabilities = {
  component: "NodeMenu",
  version: "1.2.0",
  features: ["icon-toolbar", "tooltips", "above-positioning", "lucide-icons"]
};