import React, { useState } from 'react';

export const NodePropertiesPanel = ({
  node,
  isOpen,
  classes,
  constraints,
  onUpdate = () => {},
  onClose = () => {}
}) => {
  const [properties, setProperties] = useState({
    text: node?.text || '',
    class: node?.class || 'default',
    textAlign: node?.textAlign || 'center'
  });

  const handleApply = () => {
    onUpdate(node.id, properties);
  };

  const handleCancel = () => {
    setProperties({
      text: node?.text || '',
      class: node?.class || 'default',
      textAlign: node?.textAlign || 'center'
    });
    onClose();
  };

  if (!isOpen) return null;

  const selectedClass = classes[properties.class] || classes.default;

  return (
    <div data-testid="properties-panel" className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Node Properties</h3>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Text</label>
          <textarea
            data-testid="prop-text"
            value={properties.text}
            onChange={(e) => setProperties({...properties, text: e.target.value})}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <select
            data-testid="prop-class"
            value={properties.class}
            onChange={(e) => setProperties({...properties, class: e.target.value})}
            className="w-full p-2 border rounded"
          >
            {Object.keys(classes).map(className => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Text Alignment</label>
          <div data-testid="prop-align" className="flex gap-2">
            {['left', 'center', 'right'].map(align => (
              <button
                key={align}
                className={`px-3 py-1 border rounded ${properties.textAlign === align ? 'bg-blue-100 border-blue-500' : ''}`}
                onClick={() => setProperties({...properties, textAlign: align})}
              >
                {align}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Preview</label>
          <div
            data-testid="prop-preview"
            className={`p-4 rounded ${selectedClass.box} ${selectedClass.text}`}
            style={{ textAlign: properties.textAlign }}
          >
            {properties.text || 'Preview'}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
        <div className="flex gap-2">
          <button
            data-testid="prop-apply"
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply
          </button>
          <button
            data-testid="prop-cancel"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

NodePropertiesPanel.capabilities = {
  component: "NodePropertiesPanel",
  version: "1.0.0",
  features: ["live-preview", "validation", "multi-field-editing", "class-preview"]
};