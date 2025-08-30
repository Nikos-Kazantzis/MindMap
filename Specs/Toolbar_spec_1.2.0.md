# Component: Toolbar
**Contract Version:** 1.2.0  
**Import Path:** `<namespace>/toolbar/v1`

## 1. Purpose
Toolbar provides primary application controls for mindmap manipulation including navigation, editing operations, zoom controls, and import/export functionality.

## 2. Responsibilities
1. Render action buttons based on configuration
2. Enable/disable buttons based on application state
3. Handle file uploads for import operations
4. Provide class selector when nodes are selected
5. Execute actions through callbacks

## 3. Inputs (Props)
1. `items: ToolbarItem[]`
   - Button configurations: `{ id, icon, label, onClick?, file?, enabled? }`
2. `selectedCount: number`
   - Number of currently selected nodes
3. `canUndo: boolean`
   - Whether undo is available
4. `canRedo: boolean`
   - Whether redo is available
5. `classes: ClassMap`
   - Available node classes for selector
6. `placement: Placement`
   - Positioning: `{ anchor: string, offsetX: number, offsetY: number, flow: 'row'|'column' }`
7. `selectedNodeIds?: string[]`
   - Currently selected node IDs for context-aware displays
8. `state?: MindmapData`
   - Current mindmap state for deriving UI state

## 4. Outputs (Callbacks)
1. `onAction(actionId: string, params?: object)`
2. `onFileImport(file: File, actionId: string)`
3. `onClassChange(className: string)`

## 5. Behavior
1. **Layout**
   - Horizontal row by default (flow: 'row')
   - Dark background (#1e293b) with rounded corners (8px)
   - Padding: 8px
   - Gap between items: 4px

2. **Button Appearance**
   - Size: 32x32px
   - Background: transparent, hover: rgba(255,255,255,0.1)
   - Icons: 20x20px, white fill
   - Rounded: 4px
   - Tooltips on hover

## 3. Required Icons (using Lucide React)
    - Undo: `<Undo2 />`
    - Redo: `<Redo2 />`  
    - Zoom In: `<ZoomIn />`
    - Zoom Out: `<ZoomOut />`
    - Fit: `<Maximize2 />`
    - Center: `<Home />`
    - Add: `<Plus />`
    - Delete: `<Trash2 />`
    - Copy: `<Copy />`
    - Paste: `<Clipboard />`
    - Class Editor: `<Palette />`
    - Export: `<Download />`
    - Import: `<Upload />`

4. **Visual Feedback**
   - Hover states for all buttons
   - Active/pressed states
   - Disabled styling
   - Tooltips on hover

## 6. Non-Responsibilities
- Does not execute actions directly (delegates to callbacks)
- Does not manage application state
- Does not handle keyboard shortcuts
- Does not validate file contents

## 7. Performance
- Memoize button rendering
- Optimize re-renders based on state changes
- Lazy-load icons

## 8. Accessibility
1. All buttons have ARIA labels
2. Keyboard navigation with Tab
3. Space/Enter to activate buttons
4. Screen reader announcements for state changes

## 9. Edge Cases
1. Empty items array → render nothing
2. Invalid icon name → show fallback icon
3. File import cancelled → no action
4. Rapid clicks → debounce actions

## 10. Diagnostics
```ts
export const capabilities = {
  component: "Toolbar",
  version: "1.0.0",
  features: ["file-import", "class-selector", "conditional-enable", "flexible-layout"]
}
```

```conformance
{
  "component": "Toolbar",
  "importPath": "<namespace>/toolbar/v1",
  "propsContract": {
    "required": ["items", "selectedCount", "canUndo", "canRedo", "classes", "placement"],
    "optional": ["onAction", "onFileImport", "onClassChange"]
  },
  "selectors": {
    "toolbar": "[data-testid='toolbar']",
    "button": "[data-testid='toolbar-btn-{{id}}']",
    "classSelector": "[data-testid='class-selector']",
    "fileInput": "[data-testid='file-input-{{id}}']"
  },
  "fixtures": {
    "items": [
      { "id": "undo", "icon": "Undo2", "label": "Undo", "action": "undo" },
      { "id": "redo", "icon": "Redo2", "label": "Redo", "action": "redo" },
      { "id": "cut", "icon": "Scissors", "label": "Cut", "action": "cut" },
      { "id": "import", "icon": "Upload", "label": "Import", "file": { "accept": ".json" } }
    ],
    "classes": {
      "default": { "box": "bg-white", "text": "text-black" },
      "idea": { "box": "bg-yellow-50", "text": "text-yellow-900" }
    },
    "placement": {
      "anchor": "top-right",
      "offsetX": 16,
      "offsetY": 16,
      "flow": "row"
    }
  },
  "tests": [
    {
      "name": "renders toolbar with buttons",
      "mount": {
        "props": {
          "items": "$fixtures.items",
          "selectedCount": 0,
          "canUndo": true,
          "canRedo": false,
          "classes": "$fixtures.classes",
          "placement": "$fixtures.placement"
        },
        "spies": ["onAction"]
      },
      "assert": [
        { "exists": { "selector": "$selectors.toolbar" } },
        { "exists": { "selector": "$selectors.button", "params": { "id": "undo" } } },
        { "attribute": { "selector": "$selectors.button", "params": { "id": "redo" }, "name": "disabled", "value": "true" } }
      ]
    },
    {
      "name": "triggers action on button click",
      "mount": {
        "props": {
          "items": "$fixtures.items",
          "selectedCount": 1,
          "canUndo": true,
          "canRedo": true,
          "classes": "$fixtures.classes",
          "placement": "$fixtures.placement"
        },
        "spies": ["onAction"]
      },
      "steps": [
        { "click": { "selector": "$selectors.button", "params": { "id": "undo" } } },
        { "expectCallback": { "name": "onAction", "with": ["undo", {}] } }
      ]
    },
    {
      "name": "shows class selector when nodes selected",
      "mount": {
        "props": {
          "items": "$fixtures.items",
          "selectedCount": 2,
          "canUndo": false,
          "canRedo": false,
          "classes": "$fixtures.classes",
          "placement": "$fixtures.placement"
        },
        "spies": ["onClassChange"]
      },
      "assert": [
        { "exists": { "selector": "$selectors.classSelector" } }
      ],
      "steps": [
        { "change": { "selector": "$selectors.classSelector", "value": "idea" } },
        { "expectCallback": { "name": "onClassChange", "with": ["idea"] } }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "Toolbar",
      "version": "1.0.0",
      "features": ["file-import", "class-selector", "conditional-enable", "flexible-layout"]
    }
  }
}
```