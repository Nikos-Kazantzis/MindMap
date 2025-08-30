import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const NotesPanel = ({
  node,
  isOpen,
  width = 320,
  onSave = () => {},
  onCancel = () => {},
  onClose = () => {}
}) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(node?.notes || '');
  }, [node]);

  const handleSave = () => {
    onSave(node.id, notes);
  };

  const handleCancel = () => {
    setNotes(node?.notes || '');
    onCancel();
  };

  if (!isOpen || !node) return null;

  return (
    <div
      data-testid="notes-panel"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: `${width}px`,
        height: '100vh',
        backgroundColor: 'white',
        borderLeft: '1px solid #e5e7eb',
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000
      }}
    >
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          Notes
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} color="#6b7280" />
        </button>
      </div>
      
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '8px', fontSize: '14px', color: '#6b7280' }}>
          {node.text}
        </div>
        <textarea
          data-testid="notes-editor"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes here..."
          style={{
            flex: 1,
            width: '100%',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            resize: 'none',
            outline: 'none'
          }}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>
      
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={handleCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          data-testid="notes-save"
          onClick={handleSave}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

NotesPanel.capabilities = {
  component: "NotesPanel",
  version: "1.1.0",
  features: ["right-dock", "full-height", "clean-design"]
};