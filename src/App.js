import React from 'react';
import { MindmapView } from './MindmapView';
import { MindmapRuntime } from './MindmapRuntime';
import './App.css';

function App() {
  const initialData = {
    id: 'root',
    text: 'Mind Map',
    class: 'default',
    children: [
      {
        id: 'idea1',
        text: 'First Idea',
        class: 'idea',
        children: [
          { id: 'sub1', text: 'Subtopic 1', class: 'default' },
          { id: 'sub2', text: 'Subtopic 2', class: 'default' }
        ]
      },
      {
        id: 'idea2',
        text: 'Second Idea',
        class: 'calm',
        notes: 'Some important notes here'
      }
    ]
  };

  const actions = {
    updateNodeProperty: (state, { nodeId, property, value }) => {
      const findAndUpdate = (node) => {
        if (node.id === nodeId) {
          node[property] = value;
          return true;
        }
        if (node.children) {
          return node.children.some(findAndUpdate);
        }
        return false;
      };

      const newState = JSON.parse(JSON.stringify(state));
      findAndUpdate(newState);
      return newState;
    },

    // Create aliases for backward compatibility
    setText: (state, params) => actions.updateNodeProperty(state, { ...params, property: 'text', value: params.text }),
    setNotes: (state, params) => actions.updateNodeProperty(state, { ...params, property: 'notes', value: params.notes }),
    setClass: (state, params) => actions.updateNodeProperty(state, { ...params, property: 'class', value: params.class }),
    addChild: (state, params) => {
      const { parentId, text = 'New Node', ...nodeData } = params;

      const findAndAdd = (node) => {
        if (node.id === parentId) {
          if (!node.children) node.children = [];

          // Don't include position data when pasting
          const { x, y, width, height, ...cleanNodeData } = nodeData;

          if (nodeData.id) {
            node.children.push({ text, ...cleanNodeData });
          } else {
            node.children.push({
              id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              text,
              class: 'default'
            });
          }
          return true;
        }
        if (node.children) {
          return node.children.some(findAndAdd);
        }
        return false;
      };

      const newState = JSON.parse(JSON.stringify(state));
      findAndAdd(newState);
      return newState;
    },
    removeNode: (state, { nodeId }) => {
      if (nodeId === state.id) return state; // Can't delete root

      const removeFromParent = (node) => {
        if (node.children) {
          const index = node.children.findIndex(child => child.id === nodeId);
          if (index !== -1) {
            node.children.splice(index, 1);
            return true;
          }
          return node.children.some(removeFromParent);
        }
        return false;
      };

      const newState = JSON.parse(JSON.stringify(state));
      removeFromParent(newState);
      return newState;
    }
  };

  const runtime = new MindmapRuntime({ initialData, actions });

  const appSpec = { data: initialData };

  const uiSpec = {
    canvas: {
      background: '#f8fafc',
      zoom: { min: 0.25, max: 2.5, default: 1 }
    },
    toolbar: {
      placement: { anchor: 'top-right', offsetX: 16, offsetY: 16, flow: 'row' }
    },
    theme: {
      font: {
        size: 14,
        weight: 600,
        family: 'Inter, sans-serif',
        lineHeight: 20,
        paddingX: 16,
        paddingY: 12,
        radius: 8
      },
      classMap: {
        default: {
          boxFill: '#ffffff',
          boxStroke: '#0ea5e9',
          textFill: '#111827',
          textAlign: 'center'
        },
        idea: {
          boxFill: '#fef3c7',
          boxStroke: '#f59e0b',
          textFill: '#78350f',
          textAlign: 'center'
        },
        calm: {
          boxFill: '#d1fae5',
          boxStroke: '#10b981',
          textFill: '#064e3b',
          textAlign: 'center'
        }
      }
    },
    layout: {
      type: 'tree-ltr',
      spacing: { horizontal: 120, vertical: 40 },
      maxTextWidth: 300,
      minTextWidth: 80
    }
  };

  return (
    <div className="App">
      <MindmapView
        runtime={runtime}
        appSpec={appSpec}
        uiSpec={uiSpec}
        enableKeyboardShortcuts={true}
      />
    </div>
  );
}

export default App;