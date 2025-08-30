# Component: MindmapView
**Contract Version:** 1.0.0  
**Import Path:** `<namespace>/mindmap-view/v1`

## 1. Purpose
MindmapView is the main application container that orchestrates all components, manages global state, handles keyboard shortcuts, and coordinates between the canvas, panels, and runtime.

## 2. Responsibilities
1. Integrate all sub-components (Canvas, Toolbar, Panels)
2. Manage application-level state (selection, editing, panels)
3. Handle global keyboard shortcuts
4. Coordinate between runtime and UI components
5. Manage clipboard operations
6. Control zoom and viewport

## 3. Inputs (Props)
1. `runtime: MindmapRuntime`
   - Core data management instance
2. `appSpec: AppSpec`
   - Application configuration and initial data
3. `uiSpec: UiSpec`
   - UI configuration (theme, layout, behaviors)
4. `enableKeyboardShortcuts?: boolean`
   - Whether to enable keyboard shortcuts (default: true)

## 4. Outputs (Callbacks)
1. `onStateChange?(state: MindmapData)`
   - Called when mindmap data changes
2. `onSelectionChange?(nodeIds: string[])`
   - Called when selection changes
3. `onError?(error: Error)`
   - Error boundary callback

## 5. Behavior
1. **Component Integration**
   - Render CanvasView with scene graph
   - Position Toolbar based on config
   - Show/hide panels as needed
   - Coordinate data flow between components

2. **State Management**
   - Track selected nodes
   - Manage editing state
   - Control panel visibility
   - Maintain clipboard
   - Handle viewport/zoom

3. **Keyboard Shortcuts**
   - Ctrl+Z/Cmd+Z: Undo
   - Ctrl+Y/Cmd+Y: Redo
   - Ctrl+C/Cmd+C: Copy
   - Ctrl+X/Cmd+X: Cut
   - Ctrl+V/Cmd+V: Paste
   - Delete: Delete selected
   - F2: Edit selected
   - Escape: Cancel operation
   - Ctrl+S: Save (if applicable)

4. **Data Flow**
   - Runtime → Layout → Canvas
   - User action → Runtime → Re-render
   - Selection → Enable/disable toolbar
   - Edit → Update runtime → Update view

## 6. Non-Responsibilities
- Does not persist data (runtime handles)
- Does not calculate layouts (LayoutEngine handles)
- Does not render nodes (NodeRenderer handles)

## 7. Performance
- Batch state updates
- Debounce rapid actions
- Memoize expensive calculations
- Virtual rendering for large maps

## 8. Accessibility
1. Announce major state changes
2. Keyboard navigation throughout
3. Focus management between components
4. High contrast mode support

## 9. Edge Cases
1. Runtime error → show error boundary
2. Invalid config → use defaults
3. Conflicting shortcuts → prioritize by focus
4. Panel overlap → auto-adjust positions

## 10. Diagnostics
```ts
export const capabilities = {
  component: "MindmapView",
  version: "1.0.0",
  features: ["multi-component-orchestration", "keyboard-shortcuts", "state-management", "error-boundaries"]
}
```

```conformance
{
  "component": "MindmapView",
  "importPath": "<namespace>/mindmap-view/v1",
  "propsContract": {
    "required": ["runtime", "appSpec", "uiSpec"],
    "optional": ["enableKeyboardShortcuts", "onStateChange", "onSelectionChange", "onError"]
  },
  "selectors": {
    "container": "[data-testid='mindmap-view']",
    "canvas": "[data-testid='canvas-view']",
    "toolbar": "[data-testid='toolbar']",
    "notesPanel": "[data-testid='notes-panel']",
    "propertiesPanel": "[data-testid='properties-panel']"
  },
  "fixtures": {
    "runtime": {
      "getState": "mockGetState",
      "dispatch": "mockDispatch",
      "canUndo": "mockCanUndo",
      "canRedo": "mockCanRedo"
    },
    "appSpec": {
      "data": {
        "id": "root",
        "text": "Root",
        "children": [
          { "id": "child1", "text": "Child 1" }
        ]
      }
    },
    "uiSpec": {
      "canvas": {
        "background": "bg-slate-50",
        "zoom": { "min": 0.25, "max": 2.5, "default": 1 }
      },
      "toolbar": {
        "placement": { "anchor": "top-right", "offsetX": 16, "offsetY": 16 },
        "items": []
      },
      "theme": {
        "font": { "size": 14, "weight": 600 },
        "classMap": {
          "default": { "box": "bg-white", "text": "text-black" }
        }
      },
      "layout": {
        "type": "tree-ltr",
        "spacing": { "horizontal": 100, "vertical": 20 }
      }
    }
  },
  "tests": [
    {
      "name": "renders all main components",
      "mount": {
        "props": {
          "runtime": "$fixtures.runtime",
          "appSpec": "$fixtures.appSpec",
          "uiSpec": "$fixtures.uiSpec"
        }
      },
      "assert": [
        { "exists": { "selector": "$selectors.container" } },
        { "exists": { "selector": "$selectors.canvas" } },
        { "exists": { "selector": "$selectors.toolbar" } }
      ]
    },
    {
      "name": "handles keyboard shortcuts",
      "mount": {
        "props": {
          "runtime": "$fixtures.runtime",
          "appSpec": "$fixtures.appSpec",
          "uiSpec": "$fixtures.uiSpec",
          "enableKeyboardShortcuts": true
        }
      },
      "steps": [
        { "keydown": { "key": "z", "ctrlKey": true } },
        { "expectMethodCall": { "object": "runtime", "method": "undo" } },
        { "keydown": { "key": "y", "ctrlKey": true } },
        { "expectMethodCall": { "object": "runtime", "method": "redo" } }
      ]
    },
    {
      "name": "coordinates selection between components",
      "mount": {
        "props": {
          "runtime": "$fixtures.runtime",
          "appSpec": "$fixtures.appSpec",
          "uiSpec": "$fixtures.uiSpec"
        },
        "spies": ["onSelectionChange"]
      },
      "steps": [
        { "click": { "selector": "[data-testid='node-child1']" } },
        { "expectCallback": { "name": "onSelectionChange", "with": [["child1"]] } }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "MindmapView",
      "version": "1.0.0",
      "features": ["multi-component-orchestration", "keyboard-shortcuts", "state-management", "error-boundaries"]
    }
  }
}
```