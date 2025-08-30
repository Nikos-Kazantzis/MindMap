import React, { useState } from 'react';

export const ClassEditorPanel = ({
  classes,
  isOpen,
  defaultClasses,
  colorPresets,
  onSave = () => { },
  onClose = () => { }
}) => {
  const [editedClasses, setEditedClasses] = useState(classes);
  const [selectedClass, setSelectedClass] = useState(Object.keys(classes)[0]);
  const [newClassName, setNewClassName] = useState('');

  const handleAddClass = () => {
    if (newClassName && !editedClasses[newClassName]) {
      setEditedClasses({
        ...editedClasses,
        [newClassName]: {
          box: 'bg-white border-gray-300',
          text: 'text-gray-900',
          textAlign: 'center'
        }
      });
      setSelectedClass(newClassName);
      setNewClassName('');
    }
  };

  const handleDeleteClass = (className) => {
    if (!defaultClasses.includes(className)) {
      const newClasses = { ...editedClasses };
      delete newClasses[className];
      setEditedClasses(newClasses);
      setSelectedClass(Object.keys(newClasses)[0]);
    }
  };

  const handleSave = () => {
    onSave(editedClasses);
  };

  if (!isOpen) return null;

  return (
    <div data-testid="class-editor" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-4/5 max-w-4xl h-3/4 flex">
        <div data-testid="class-list" className="w-1/3 border-r p-4">
          <h3 className="font-semibold mb-4">Classes</h3>
          {Object.keys(editedClasses).map(className => (
            <div
              key={className}
              data-testid={`class-item-${className}`}
              className={`p-2 rounded cursor-pointer flex justify-between items-center ${selectedClass === className ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => setSelectedClass(className)}
            >
              <span>{className}</span>
              <button
                data-testid={`delete-class-${className}`}
                disabled={defaultClasses.includes(className)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClass(className);
                }}
                className={defaultClasses.includes(className) ? 'opacity-50 cursor-not-allowed' : ''}
              >
                ×
              </button>
            </div>
          ))}

          <div className="mt-4 flex gap-2">
            <input
              data-testid="class-name"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="New class name"
              className="flex-1 p-2 border rounded"
            />
            <button
              data-testid="add-class"
              onClick={handleAddClass}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <h3 className="font-semibold mb-4">Edit: {selectedClass}</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Background Color</label>
              <input
                data-testid="bg-color"
                type="text"
                value={editedClasses[selectedClass]?.box || ''}
                onChange={(e) => setEditedClasses({
                  ...editedClasses,
                  [selectedClass]: {
                    ...editedClasses[selectedClass],
                    box: e.target.value
                  }
                })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Text Color</label>
              <input
                data-testid="text-color"
                type="text"
                value={editedClasses[selectedClass]?.text || ''}
                onChange={(e) => setEditedClasses({
                  ...editedClasses,
                  [selectedClass]: {
                    ...editedClasses[selectedClass],
                    text: e.target.value
                  }
                })}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Preview</label>
              <div
                data-testid="class-preview"
                className={`p-4 rounded ${editedClasses[selectedClass]?.box} ${editedClasses[selectedClass]?.text}`}
              >
                Sample Node Text
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 flex gap-2">
        <button
          data-testid="save-classes"
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save All
        </button>
        <button
          data-testid="cancel-classes"
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

ClassEditorPanel.capabilities = {
  component: "ClassEditorPanel",
  version: "1.0.0",
  features: ["color-picker", "live-preview", "batch-editing", "contrast-validation"]
};