# Component: NodeMenu
**Contract Version:** 1.2.0  
**Import Path:** `<namespace>/node-menu/v1`

## 1. Purpose
NodeMenu provides a toolbar of icon-based actions that appears above selected nodes for quick operations.

## 2. Responsibilities
1. Display action toolbar above selected node(s)
2. Position toolbar centered above the node
3. Show icon-only buttons with tooltips
4. Hide when no nodes selected or multiple nodes selected
5. Execute actions via callbacks

## 3. Inputs (Props)
1. `node: NodeData`
   - Node data: `{ id, text, class, notes, isRoot, x, y, width, height }`
2. `items: MenuItem[]`
   - Menu items: `{ id, icon: ReactElement, tooltip: string, action: string, when?: string }`
3. `visible: boolean`
   - Whether menu should be shown
4. `theme: ThemeConfig`
   - For consistent styling

## 4. Outputs (Callbacks)
1. `onAction(actionId: string, params: object)`

## 5. Behavior
1. **Visibility**
   - Show when single node selected
   - Hide when no selection or multi-selection
   - Hide when clicking elsewhere

2. **Positioning**
   - Center horizontally above node
   - Offset 12px above node top edge (no overlap)
   - Use Lucide React icons (20x20)
   - Stay within viewport bounds

3. **Appearance**
   - Horizontal row of icon buttons
   - Dark background (#1e293b) with rounded corners
   - White icons (20x20px)
   - Show tooltip on hover

4. **Item Types**
   - Icon button: SVG icon, click to execute
   - Conditional display based on 'when' clause

## 6. Non-Responsibilities
- Does not handle text editing (inline in node)
- Does not manage panels (delegated to parent)

## 7. Performance
- Use portal for rendering outside node tree
- Memoize position calculations
- Lazy render menu content

## 8. Accessibility
1. Menu has proper ARIA role
2. Focus management when opened
3. Escape key closes menu
4. Arrow keys navigate items

## 9. Edge Cases
1. Menu extends beyond viewport → flip position
2. Rapid node selection changes → update menu node context
3. No visible items → hide entire menu
4. Invalid action → ignore, log warning

## 10. Diagnostics
```ts
export const capabilities = {
  component: "NodeMenu",
  version: "1.0.0",
  features: ["conditional-items", "multi-trigger", "smart-positioning", "mixed-inputs"]
}
```

```conformance
{
  "component": "NodeMenu",
  "importPath": "<namespace>/node-menu/v1",
  "propsContract": {
    "required": ["node", "items", "visible", "anchor"],
    "optional": ["trigger", "onAction", "onChange"]
  },
  "selectors": {
    "menu": "[data-testid='node-menu-{{nodeId}}']",
    "button": "[data-testid='menu-btn-{{itemId}}']",
    "select": "[data-testid='menu-select-{{itemId}}']"
  },
  "fixtures": {
    "node": {
      "id": "test-1",
      "text": "Test Node",
      "class": "default",
      "notes": "",
      "isRoot": false
    },
    "items": [
      { "id": "add", "type": "button", "icon": "Plus", "onClick": { "action": "addChild" } },
      { "id": "delete", "type": "button", "icon": "Trash", "when": "!isRoot", "onClick": { "action": "delete" } },
      { "id": "class", "type": "select", "options": ["default", "idea", "calm"], "value": "default" }
    ],
    "anchor": {
      "x": "right",
      "y": "top",
      "offsetX": -4,
      "offsetY": -28
    }
  },
  "tests": [
    {
      "name": "shows menu when visible",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "items": "$fixtures.items",
          "visible": true,
          "anchor": "$fixtures.anchor"
        },
        "spies": ["onAction"]
      },
      "assert": [
        { "exists": { "selector": "$selectors.menu", "params": { "nodeId": "test-1" } } },
        { "exists": { "selector": "$selectors.button", "params": { "itemId": "add" } } }
      ]
    },
    {
      "name": "hides conditional items",
      "mount": {
        "props": {
          "node": { "id": "root", "text": "Root", "isRoot": true },
          "items": "$fixtures.items",
          "visible": true,
          "anchor": "$fixtures.anchor"
        }
      },
      "assert": [
        { "exists": { "selector": "$selectors.button", "params": { "itemId": "add" } } },
        { "notExists": { "selector": "$selectors.button", "params": { "itemId": "delete" } } }
      ]
    },
    {
      "name": "triggers action on button click",
      "mount": {
        "props": {
          "node": "$fixtures.node",
          "items": "$fixtures.items",
          "visible": true,
          "anchor": "$fixtures.anchor"
        },
        "spies": ["onAction"]
      },
      "steps": [
        { "click": { "selector": "$selectors.button", "params": { "itemId": "add" } } },
        { "expectCallback": { "name": "onAction", "with": ["addChild", { "nodeId": "test-1" }] } }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "NodeMenu",
      "version": "1.0.0",
      "features": ["conditional-items", "multi-trigger", "smart-positioning", "mixed-inputs"]
    }
  }
}
```