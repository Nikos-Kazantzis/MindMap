# Component: ClassEditorPanel
**Contract Version:** 1.0.0  
**Import Path:** `<namespace>/class-editor-panel/v1`

## 1. Purpose
ClassEditorPanel allows users to create, edit, and delete node style classes, defining the visual appearance of different node types.

## 2. Responsibilities
1. Display list of existing classes
2. Edit class properties (colors, text styles)
3. Add new classes
4. Delete custom classes (protect defaults)
5. Preview class appearance
6. Apply or cancel all changes

## 3. Inputs (Props)
1. `classes: ClassMap`
   - Current class definitions: `{ [name]: { box, text, textAlign } }`
2. `isOpen: boolean`
   - Panel visibility
3. `defaultClasses: string[]`
   - Class names that cannot be deleted
4. `colorPresets?: ColorPreset[]`
   - Available color options

## 4. Outputs (Callbacks)
1. `onSave(classes: ClassMap)`
2. `onClose()`

## 5. Behavior
1. **Class List**
   - Show all defined classes
   - Highlight selected class
   - Add button for new class
   - Delete button (disabled for defaults)

2. **Class Editor**
   - Name field (read-only for existing)
   - Background color picker
   - Text color picker
   - Border color picker
   - Text alignment selector
   - Live preview

3. **Color Selection**
   - Preset color swatches
   - Custom color input
   - Copy/paste hex values
   - Contrast validation

4. **Actions**
   - Save All: apply all changes
   - Cancel: discard all changes
   - Add Class: create new with defaults
   - Delete Class: remove if allowed

## 6. Non-Responsibilities
- Does not update nodes using classes
- Does not manage color themes
- Does not export/import class definitions

## 7. Performance
- Virtual scrolling for many classes
- Debounce color picker updates
- Cache preview rendering

## 8. Accessibility
1. Color contrast warnings
2. Keyboard navigation in color picker
3. Screen reader labels for colors
4. Focus management in dialogs

## 9. Edge Cases
1. Duplicate class names → show error
2. Delete class in use → show warning
3. Invalid color values → revert to previous
4. No classes defined → show defaults

## 10. Diagnostics
```ts
export const capabilities = {
  component: "ClassEditorPanel",
  version: "1.0.0",
  features: ["color-picker", "live-preview", "batch-editing", "contrast-validation"]
}
```

```conformance
{
  "component": "ClassEditorPanel",
  "importPath": "<namespace>/class-editor-panel/v1",
  "propsContract": {
    "required": ["classes", "isOpen", "defaultClasses"],
    "optional": ["colorPresets", "onSave", "onClose"]
  },
  "selectors": {
    "panel": "[data-testid='class-editor']",
    "classList": "[data-testid='class-list']",
    "classItem": "[data-testid='class-item-{{name}}']",
    "addBtn": "[data-testid='add-class']",
    "deleteBtn": "[data-testid='delete-class-{{name}}']",
    "nameInput": "[data-testid='class-name']",
    "bgColorPicker": "[data-testid='bg-color']",
    "textColorPicker": "[data-testid='text-color']",
    "preview": "[data-testid='class-preview']",
    "saveBtn": "[data-testid='save-classes']",
    "cancelBtn": "[data-testid='cancel-classes']"
  },
  "fixtures": {
    "classes": {
      "default": {
        "box": "bg-white border-sky-500",
        "text": "text-gray-900",
        "textAlign": "center"
      },
      "idea": {
        "box": "bg-yellow-50 border-yellow-500",
        "text": "text-yellow-900",
        "textAlign": "center"
      }
    },
    "defaultClasses": ["default"]
  },
  "tests": [
    {
      "name": "displays existing classes",
      "mount": {
        "props": {
          "classes": "$fixtures.classes",
          "isOpen": true,
          "defaultClasses": "$fixtures.defaultClasses"
        }
      },
      "assert": [
        { "exists": { "selector": "$selectors.panel" } },
        { "exists": { "selector": "$selectors.classItem", "params": { "name": "default" } } },
        { "exists": { "selector": "$selectors.classItem", "params": { "name": "idea" } } }
      ]
    },
    {
      "name": "prevents deletion of default classes",
      "mount": {
        "props": {
          "classes": "$fixtures.classes",
          "isOpen": true,
          "defaultClasses": "$fixtures.defaultClasses"
        }
      },
      "assert": [
        { "attribute": { 
          "selector": "$selectors.deleteBtn", 
          "params": { "name": "default" },
          "name": "disabled",
          "value": "true"
        }},
        { "attribute": { 
          "selector": "$selectors.deleteBtn", 
          "params": { "name": "idea" },
          "name": "disabled",
          "value": null
        }}
      ]
    },
    {
      "name": "adds new class",
      "mount": {
        "props": {
          "classes": "$fixtures.classes",
          "isOpen": true,
          "defaultClasses": "$fixtures.defaultClasses"
        },
        "spies": ["onSave"]
      },
      "steps": [
        { "click": { "selector": "$selectors.addBtn" } },
        { "type": { "selector": "$selectors.nameInput", "text": "custom" } },
        { "click": { "selector": "$selectors.saveBtn" } },
        { "expectCallback": { "name": "onSave", "withShape": {
          "custom": { "box": "string", "text": "string" }
        }}}
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "ClassEditorPanel",
      "version": "1.0.0",
      "features": ["color-picker", "live-preview", "batch-editing", "contrast-validation"]
    }
  }
}
```