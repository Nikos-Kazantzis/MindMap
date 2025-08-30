# Component: NodeEditor
**Contract Version:** 1.0.0  
**Import Path:** `<namespace>/node-editor/v1`

## 1. Purpose
NodeEditor provides inline text editing for mind map nodes with real-time size updates and keyboard controls.

## 2. Responsibilities
1. Display editable text input that matches node styling
2. Auto-resize based on text content
3. Handle keyboard shortcuts for commit/cancel
4. Maintain focus and selection state
5. Provide real-time text change feedback

## 3. Inputs (Props)
1. `initialText: string`
   - Starting text value
2. `textClass: string`
   - CSS classes for text styling
3. `fontSize: number`
   - Font size in pixels
4. `fontFamily: string`
   - Font family string
5. `fontWeight: number`
   - Font weight value
6. `maxWidth: number`
   - Maximum width constraint
7. `minWidth: number`
   - Minimum width constraint
8. `textAlign: 'left' | 'center' | 'right'`
   - Text alignment

## 4. Outputs (Callbacks)
1. `onCommit(text: string)`
   - Called when editing is confirmed
2. `onCancel()`
   - Called when editing is cancelled
3. `onTextChange(text: string)`
   - Called on each text change for live updates
4. `onSizeChange(width: number, height: number)`
   - Called when calculated size changes

## 5. Behavior
1. **Initial State**
   - Auto-focus on mount
   - Select all text initially
   - Calculate and report initial size

2. **Text Input**
   - Multi-line support with Enter for new lines
   - Real-time size calculation as user types
   - Preserve whitespace and line breaks

3. **Keyboard Controls**
   - Ctrl/Cmd+Enter: commit changes
   - Escape: cancel editing
   - Tab: commit and move to next (optional)

4. **Size Calculation**
   - Use canvas API for accurate text measurement
   - Account for padding and line height
   - Respect min/max width constraints

5. **Focus Management**
   - Maintain focus during editing
   - Blur triggers commit (configurable)
   - Prevent focus loss from parent interactions

## 6. Non-Responsibilities
- Does not handle node positioning
- Does not manage node data persistence
- Does not apply node styling (only text styling)

## 7. Performance
- Debounce size calculations (10ms)
- Cache text measurements
- Minimize re-renders during typing

## 8. Accessibility
1. Proper ARIA attributes for edit field
2. Screen reader announces edit mode
3. Keyboard-only operation support

## 9. Edge Cases
1. Empty text → show placeholder, maintain min size
2. Very long text → wrap and scroll if needed
3. Paste operation → handle multi-line content
4. Rapid commit/cancel → ensure single execution

## 10. Diagnostics
```ts
export const capabilities = {
  component: "NodeEditor",
  version: "1.0.0",
  features: ["auto-resize", "multi-line", "keyboard-shortcuts", "real-time-updates"]
}
```

```conformance
{
  "component": "NodeEditor",
  "importPath": "<namespace>/node-editor/v1",
  "propsContract": {
    "required": ["initialText", "textClass", "fontSize", "fontFamily", "fontWeight", "maxWidth", "minWidth"],
    "optional": ["textAlign", "onCommit", "onCancel", "onTextChange", "onSizeChange"]
  },
  "selectors": {
    "editor": "[data-testid='node-editor']",
    "textarea": "[data-testid='node-editor-textarea']"
  },
  "fixtures": {
    "props": {
      "initialText": "Test Node",
      "textClass": "text-gray-900",
      "fontSize": 14,
      "fontFamily": "Inter",
      "fontWeight": 600,
      "maxWidth": 400,
      "minWidth": 100,
      "textAlign": "center"
    }
  },
  "tests": [
    {
      "name": "auto-focuses and selects text on mount",
      "mount": {
        "props": "$fixtures.props",
        "spies": ["onTextChange", "onSizeChange"]
      },
      "assert": [
        { "exists": { "selector": "$selectors.textarea" } },
        { "focused": { "selector": "$selectors.textarea" } },
        { "selected": { "selector": "$selectors.textarea", "all": true } }
      ]
    },
    {
      "name": "commits on Ctrl+Enter",
      "mount": {
        "props": "$fixtures.props",
        "spies": ["onCommit"]
      },
      "steps": [
        { "type": { "selector": "$selectors.textarea", "text": "Updated Text" } },
        { "keydown": { "selector": "$selectors.textarea", "key": "Enter", "ctrlKey": true } },
        { "expectCallback": { "name": "onCommit", "with": ["Updated Text"] } }
      ]
    },
    {
      "name": "cancels on Escape",
      "mount": {
        "props": "$fixtures.props",
        "spies": ["onCancel"]
      },
      "steps": [
        { "type": { "selector": "$selectors.textarea", "text": "Changed" } },
        { "keydown": { "selector": "$selectors.textarea", "key": "Escape" } },
        { "expectCallback": { "name": "onCancel", "with": [] } }
      ]
    },
    {
      "name": "reports size changes during typing",
      "mount": {
        "props": "$fixtures.props",
        "spies": ["onTextChange", "onSizeChange"]
      },
      "steps": [
        { "type": { "selector": "$selectors.textarea", "text": "Short" } },
        { "expectCallbackCalled": { "name": "onTextChange" } },
        { "expectCallbackCalled": { "name": "onSizeChange" } }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "NodeEditor",
      "version": "1.0.0",
      "features": ["auto-resize", "multi-line", "keyboard-shortcuts", "real-time-updates"]
    }
  }
}
```