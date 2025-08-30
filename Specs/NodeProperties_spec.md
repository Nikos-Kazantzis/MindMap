# Component: NodePropertiesPanel
**Contract Version:** 1.0.0  
**Import Path:** `<namespace>/node-properties-panel/v1`

## 1. Purpose
NodePropertiesPanel provides a form interface for editing all properties of a mind map node including text, class, alignment, and other attributes.

## 2. Responsibilities
1. Display editable form for node properties
2. Provide controls for all node attributes
3. Show live preview of changes
4. Validate input values
5. Apply or cancel changes

## 3. Inputs (Props)
1. `node: NodeData`
   - Node to edit: `{ id, text, class, textAlign, notes, collapsed }`
2. `isOpen: boolean`
   - Panel visibility
3. `classes: ClassMap`
   - Available node classes with styles
4. `constraints?: PropertyConstraints`
   - Validation rules: `{ maxTextLength, allowedClasses }`

## 4. Outputs (Callbacks)
1. `onUpdate(nodeId: string, properties: NodeProperties)`
2. `onClose()`

## 5. Behavior
1. **Form Fields**
   - Text: multi-line input with character count
   - Class: dropdown selector with preview
   - Text Alignment: radio/segmented control
   - Collapsed: checkbox
   - ID: read-only display

2. **Live Preview**
   - Show node preview with current settings
   - Update preview as fields change
   - Use actual theme styles

3. **Validation**
   - Required fields marked
   - Show validation errors
   - Disable save if invalid

4. **Actions**
   - Apply: save all changes
   - Cancel: close without saving
   - Reset: revert to original values

## 6. Non-Responsibilities
- Does not directly update node data
- Does not manage panel animations
- Does not handle node deletion

## 7. Performance
- Debounce preview updates
- Memoize form validation
- Lazy render class previews

## 8. Accessibility
1. Proper form labels and descriptions
2. Error messages linked to fields
3. Keyboard navigation between fields
4. Focus management

## 9. Edge Cases
1. Node deleted while panel open → close panel
2. Invalid class in data → default to 'default'
3. Empty text → show warning but allow
4. Multiple panels for same node → prevent

## 10. Diagnostics
```ts
export const capabilities = {
  component: "NodePropertiesPanel",
  version: "1.0.0",
  features: ["live-preview", "validation", "multi-field-editing", "class-preview"]
}
```

```conformance
{
  "component": "NodePropertiesPanel",
  "importPath": "<namespace>/node-properties-panel/v1",
  "propsContract": {
    "required": ["node", "isOpen", "classes"],
    "optional": ["constraints", "onUpdate", "onClose"]
  },
  "selectors": {
    "panel": "[data-testid='properties-panel']",
    "textInput": "[data-testid='prop-text']",
    "classSelect": "[data-testid='prop-class']",
    "alignmentControl": "[data-testid='prop-align']",
    "preview": "[data-testid='prop-preview']",
    "applyBtn": "[data-testid='prop-apply']",
    "cancelBtn": "[data-testid='prop-cancel']"
  },
  "fixtures": {
    "node": {
      "id": "test-1",
      "text": "Test Node",
      "class": "default",
      "textAlign": "center"
    },
    "classes": {
      "default": { "box": "bg-white", "text": "text-black" },
      "idea": { "box": "bg-yellow-50", "text": "text-yellow-900" },
      "calm": { "box": "bg-green-50", "text": "text-green-900" }
    }
  },
  "tests": [
    {
      "name": "displays node properties in form",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "isOpen": true,
          "classes": "$fixtures.classes"
        }
      },
      "assert": [
        { "exists": { "selector": "$selectors.panel" } },
        { "value": { "selector": "$selectors.textInput", "equals": "Test Node" } },
        { "value": { "selector": "$selectors.classSelect", "equals": "default" } }
      ]
    },
    {
      "name": "updates properties on apply",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "isOpen": true,
          "classes": "$fixtures.classes"
        },
        "spies": ["onUpdate"]
      },
      "steps": [
        { "type": { "selector": "$selectors.textInput", "text": "Updated Text" } },
        { "select": { "selector": "$selectors.classSelect", "value": "idea" } },
        { "click": { "selector": "$selectors.applyBtn" } },
        { "expectCallback": { "name": "onUpdate", "with": ["test-1", {
          "text": "Updated Text",
          "class": "idea",
          "textAlign": "center"
        }] } }
      ]
    },
    {
      "name": "shows live preview of changes",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "isOpen": true,
          "classes": "$fixtures.classes"
        }
      },
      "steps": [
        { "select": { "selector": "$selectors.classSelect", "value": "calm" } },
        { "assert": [
          { "hasClass": { "selector": "$selectors.preview", "class": "bg-green-50" } }
        ] }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "NodePropertiesPanel",
      "version": "1.0.0",
      "features": ["live-preview", "validation", "multi-field-editing", "class-preview"]
    }
  }
}
```