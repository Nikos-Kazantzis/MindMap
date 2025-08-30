# Component: NotesPanel
**Contract Version:** 1.1.0  
**Import Path:** `<namespace>/notes-panel/v1`

## 1. Purpose
NotesPanel provides a rich text editor for adding and editing notes associated with mind map nodes, supporting Markdown formatting.

## 2. Responsibilities
1. Display panel with node context
2. Provide rich text editing capabilities
3. Support Markdown syntax
4. Preview formatted output
5. Save or cancel changes

## 3. Inputs (Props)
1. `node: NodeData`
   - Node being edited: `{ id, text, notes }`
2. `isOpen: boolean`
   - Panel visibility state
3. `dockSide: 'right'` (fixed)
   - Panel always docks to right side
4. `width?: number`
   - Panel width in pixels (default: 320)

## 4. Outputs (Callbacks)
1. `onSave(nodeId: string, notes: string)`
2. `onCancel()`
3. `onClose()`

## 5. Behavior
1. **Panel Display**
   - Slide in from right side
   - Full viewport height
   - Fixed width (320px default)
   - White background with left border
   - Show node name as title
   - Close button (X) in top right

2. **Editor Features**
   - Clean textarea with proper padding
   - Placeholder text when empty
   - Auto-focus when opened

3. **Markdown Support**
   - Bold, italic, headers
   - Lists (ordered/unordered)
   - Code blocks
   - Links
   - Live preview toggle

4. **Actions**
   - Save: commit changes and close
   - Cancel: discard changes and close
   - Keyboard shortcuts (Ctrl+S to save)

## 6. Non-Responsibilities
- Does not manage node data persistence
- Does not handle panel animations (CSS)
- Does not validate Markdown syntax

## 7. Performance
- Debounce preview updates (200ms)
- Lazy load Markdown parser
- Virtual scrolling for long content

## 8. Accessibility
1. Focus management when panel opens
2. Escape key to close
3. ARIA labels for all controls
4. Screen reader announces panel state

## 9. Edge Cases
1. Empty notes → show placeholder text
2. Very long notes → scrollable container
3. Invalid Markdown → display as plain text
4. Rapid open/close → maintain state

## 10. Diagnostics
```ts
export const capabilities = {
  component: "NotesPanel",
  version: "1.0.0",
  features: ["markdown-support", "rich-editor", "keyboard-shortcuts", "preview-mode"]
}
```

```conformance
{
  "component": "NotesPanel",
  "importPath": "<namespace>/notes-panel/v1",
  "propsContract": {
    "required": ["node", "isOpen"],
    "optional": ["dockSide", "width", "enableMarkdown", "onSave", "onCancel", "onClose"]
  },
  "selectors": {
    "panel": "[data-testid='notes-panel']",
    "header": "[data-testid='notes-header']",
    "editor": "[data-testid='notes-editor']",
    "saveBtn": "[data-testid='notes-save']",
    "cancelBtn": "[data-testid='notes-cancel']",
    "closeBtn": "[data-testid='notes-close']"
  },
  "fixtures": {
    "node": {
      "id": "test-1",
      "text": "Test Node",
      "notes": "Initial notes content"
    }
  },
  "tests": [
    {
      "name": "displays panel with node context",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "isOpen": true,
          "enableMarkdown": true
        },
        "spies": ["onSave", "onClose"]
      },
      "assert": [
        { "exists": { "selector": "$selectors.panel" } },
        { "textContent": { "selector": "$selectors.header", "contains": "Test Node" } },
        { "value": { "selector": "$selectors.editor", "equals": "Initial notes content" } }
      ]
    },
    {
      "name": "saves changes on save button",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "isOpen": true
        },
        "spies": ["onSave"]
      },
      "steps": [
        { "type": { "selector": "$selectors.editor", "text": "Updated notes" } },
        { "click": { "selector": "$selectors.saveBtn" } },
        { "expectCallback": { "name": "onSave", "with": ["test-1", "Updated notes"] } }
      ]
    },
    {
      "name": "discards changes on cancel",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "isOpen": true
        },
        "spies": ["onCancel"]
      },
      "steps": [
        { "type": { "selector": "$selectors.editor", "text": "Changed text" } },
        { "click": { "selector": "$selectors.cancelBtn" } },
        { "expectCallback": { "name": "onCancel", "with": [] } }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "NotesPanel",
      "version": "1.0.0",
      "features": ["markdown-support", "rich-editor", "keyboard-shortcuts", "preview-mode"]
    }
  }
}
```