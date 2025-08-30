# Component: NodeRenderer
**Contract Version:** 1.3.0
**Import Path:** `<namespace>/node-renderer/v1`

## 1. Purpose
NodeRenderer renders individual mind map nodes with text, styling, selection state, editing capabilities, and interactive elements like chevrons and menus.

## 2. Responsibilities
1. Render node with proper styling based on class and selection state
2. Display node text with proper alignment and formatting
3. Handle inline text editing with real-time size updates
4. Show collapse/expand chevron when appropriate
5. Display context menu for node operations
6. Show visual indicators for notes and multi-selection
7. Provide drag handle for quick child creation

## 3. Inputs (Props)
1. `node: NodeData`
   - Complete node data: `{ id, text, class, notes, collapsed, hasChildren, textAlign?, x, y, width, height }`
2. `isSelected: boolean`
   - Whether this node is currently selected
3. `isEditing: boolean`
   - Whether this node is being edited
4. `isMultiSelected: boolean`
   - Whether this node is part of a multi-selection
5. `showChevron: boolean`
   - Whether to show collapse/expand control
6. `theme: ThemeConfig`
   - Styling configuration including classMap, fonts, colors
7. `menuConfig?: MenuConfig`
   - Context menu configuration with trigger mode and items

## 4. Outputs (Callbacks)
1. `onSelectNode(nodeId: string, event: { ctrlKey: boolean })`
2. `onToggleCollapse(nodeId: string)`
3. `onBeginEdit(nodeId: string)`
4. `onCommitEdit(nodeId: string, text: string, size: { width: number, height: number })`
5. `onCancelEdit(nodeId: string)`
6. `onMenuAction(action: string, params: object)`
7. `onBeginDrag(nodeId: string, event: PointerEvent)`

## 5. Behavior
1. **Rendering**
   - Apply class-based styling from theme.classMap
   - Highlight when selected
   - Show multi-select indicator when appropriate
   - Display notes indicator if node has notes

2. **Text Editing**
   - Enter edit mode on double-click
   - Text input must be left-to-right (LTR) regardless of content
   - Direction property must be 'ltr' for contentEditable elements
   - Node auto-expands width as text grows
   - Commit on blur or Enter
   - Cancel on Escape
   - NO textarea or foreign object - direct inline editing

3. **Chevron**
   - Position: 20px outside node boundary on the right (no overlap)
   - Appearance: Circle (20px diameter) with plus/minus icon
   - Show when node has children
   - Toggle collapse state on click
   - Display plus when collapsed, minus when expanded

4. **Context Menu**
   - Show based on menuConfig.trigger ('rightclick' or 'selected')
   - Position relative to node based on anchor settings
   - Execute actions through onMenuAction

5. **Drag Handle**
   - 8px wide zone on right edge
   - On drag start: Show preview of new child node at cursor
   - During drag: Update preview position following cursor
   - On drag end: If distance > 20px, create child node at that position
   - Visual feedback: Semi-transparent node preview during drag

## 6. Non-Responsibilities
- Does not manage node position (handled by parent)
- Does not perform layout calculations
- Does not handle data persistence
- Does not manage selection state

## 7. Performance
- Optimize re-renders using React.memo
- Efficient text measurement using canvas API
- Debounce size calculations during editing

## 8. Accessibility
1. Node has proper ARIA role and labels
2. Keyboard navigation support (Tab, Enter, Escape)
3. Screen reader announces selection state
4. Focus management during editing

## 9. Edge Cases
1. Empty text → display placeholder "New node"
2. Very long text → wrap and expand height
3. Missing class → use default styling
4. Rapid edit/cancel → maintain state consistency

## 10. Diagnostics
```ts
export const capabilities = {
  component: "NodeRenderer",
  version: "1.0.1",
  features: ["inline-editing", "multi-select", "context-menu", "drag-handle", "chevron"]
}
```

```conformance
{
  "component": "NodeRenderer",
  "importPath": "<namespace>/node-renderer/v1",
  "propsContract": {
    "required": ["node", "isSelected", "isEditing", "showChevron", "theme"],
    "optional": ["isMultiSelected", "menuConfig"]
  },
  "selectors": {
    "node": "[data-testid='node-{{nodeId}}']",
    "chevron": "[data-testid='chevron-{{nodeId}}']",
    "editor": "[data-testid='editor-{{nodeId}}']",
    "menu": "[data-testid='menu-{{nodeId}}']",
    "dragHandle": "[data-testid='drag-{{nodeId}}']"
  },
  "fixtures": {
    "node": {
      "id": "test-1",
      "text": "Test Node",
      "class": "default",
      "notes": "Some notes",
      "collapsed": false,
      "hasChildren": true,
      "x": 100,
      "y": 100,
      "width": 120,
      "height": 40
    },
    "theme": {
      "font": {
        "size": 14,
        "weight": 600,
        "family": "Inter",
        "lineHeight": 20,
        "paddingX": 12,
        "paddingY": 10,
        "radius": 12
      },
      "classMap": {
        "default": {
          "boxFill": "#ffffff",
          "boxStroke": "#0ea5e9",
          "textFill": "#111827",
          "textAlign": "center"
        },
        "idea": {
          "boxFill": "#fef3c7",
          "boxStroke": "#f59e0b",
          "textFill": "#78350f",
          "textAlign": "center"
        }
      },
      "selected": {
        "strokeColor": "#0284c7"
      }
    }
  },
  "tests": [
    {
      "name": "renders node with text and styling",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "isSelected": false,
          "isEditing": false,
          "showChevron": true,
          "theme": "$fixtures.theme"
        },
        "spies": ["onSelectNode", "onToggleCollapse", "onBeginEdit"]
      },
      "assert": [
        { "exists": { "selector": "$selectors.node", "params": { "nodeId": "test-1" } } },
        { "textContent": { "selector": "$selectors.node", "params": { "nodeId": "test-1" }, "contains": "Test Node" } }
      ]
    },
    {
      "name": "enters edit mode on double-click",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "isSelected": true,
          "isEditing": false,
          "showChevron": false,
          "theme": "$fixtures.theme"
        },
        "spies": ["onBeginEdit"]
      },
      "steps": [
        { "dblclick": { "selector": "$selectors.node", "params": { "nodeId": "test-1" } } },
        { "expectCallback": { "name": "onBeginEdit", "with": ["test-1"] } }
      ]
    },
    {
      "name": "toggles collapse via chevron",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "isSelected": false,
          "isEditing": false,
          "showChevron": true,
          "theme": "$fixtures.theme"
        },
        "spies": ["onToggleCollapse"]
      },
      "steps": [
        { "click": { "selector": "$selectors.chevron", "params": { "nodeId": "test-1" } } },
        { "expectCallback": { "name": "onToggleCollapse", "with": ["test-1"] } }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "NodeRenderer",
      "version": "1.0.0",
      "features": ["inline-editing", "multi-select", "context-menu", "drag-handle", "chevron"]
    }
  }
}
```