# Component: CanvasView
**Contract Version:** 1.0.0  
**Import Path:** `<namespace>/canvas-view/v1`

## 1. Purpose
CanvasView renders the positioned mind-map (nodes + connectors) on an infinite surface and handles navigation (pan/zoom) and hit-testing for selection.

## 2. Responsibilities
1. Render all nodes and connectors provided via a layouted scene graph.
2. Maintain and expose viewport interactions: panning, zooming, center & fit, go to root.
3. Emit selection and view-change events; never mutate application state directly.
4. Support multi-selection highlighting.

## 3. Inputs (Props)
1. `sceneGraph: SceneGraph`  
   - Layouted view of the map:  
     - `nodes: { nodeId, x, y, width, height, text, classId, isCollapsed, hasNotes, hasChildren }[]`  
     - `connectors: { fromNodeId, toNodeId }[]`
2. `viewport: Viewport`  
   - Camera state: `{ zoom: number, offsetX: number, offsetY: number }`
3. `selectedNodeIds: string[]`  
   - Zero or more currently selected nodes.
4. `zoomLimits?: { min: number; max: number }`
5. `fitMarginRatio?: number` (default ~0.1; margin when fitting all nodes)
6. `theme: ThemeConfig`
   - Theme configuration for rendering nodes

## 4. Outputs (Callbacks)
1. `onSelectNode(nodeId: string | null)`
2. `onPan(deltaX: number, deltaY: number)`
3. `onZoomTo(zoom: number, centerX: number, centerY: number)`
4. `onCenterFit()`
5. `onGoToRoot()`

## 5. Behavior
1. **Rendering**
   - Container must fill available space (100% width and height)
   - Instantiates **NodeRenderer** once per `sceneGraph.nodes` item.
   - Uses **ConnectorRenderer** for `sceneGraph.connectors`.
   - Highlights nodes whose IDs are in `selectedNodeIds`.
2. **Panning**
   - Dragging the background emits `onPan` deltas in screen pixels.
3. **Zooming**
   - Wheel + Ctrl/Cmd modifier emits `onZoomTo` with clamped zoom
   - Zoom must center on pointer position (focal point zooming)
   - Calculate new offset to maintain pointer position after zoom
   - Event listeners must use `{ passive: false }` to allow preventDefault
4. **Center & Fit**
   - Invoking fit triggers `onCenterFit()`, host recalculates and provides a new viewport.
5. **Go to Root**
   - Invoking go-to-root triggers `onGoToRoot()`.
6. **Selection**
   - Clicking a node emits `onSelectNode(nodeId)`
   - Text selection must be prevented during drag operations
   - Use CSS `user-select: none` on non-editable elements
7. **Initial Viewport**
   - Calculate scene bounds from sceneGraph
   - Center the scene in the viewport on mount
   - Apply default zoom level

## 6. Non-Responsibilities
- Does not compute layout (relies on `sceneGraph`).
- Does not mutate app state.
- Does not handle undo/redo or clipboard.

## 7. Performance
- Maintain interactive panning/zooming at ≥ 60 FPS for up to 2,000 visible nodes.

## 8. Accessibility
1. Background and nodes are focusable via the app's accessibility layer.
2. Focus is updated consistently when selection changes.

## 9. Edge Cases
1. Empty `sceneGraph.nodes` → render background only; still pannable/zoomable.
2. Degenerate sizes (`width < 1`) are clamped visually; no error thrown.
3. Zoom values outside `zoomLimits` are clamped before emitting `onZoomTo`.

## 10. Diagnostics
```ts
export const capabilities = {
  component: "CanvasView",
  version: "1.0.1",
  features: ["multi-selection", "zoom-to", "center-fit", "go-to-root"]
}
```

```conformance
{
  "component": "CanvasView",
  "importPath": "<namespace>/canvas-view/v1",
  "propsContract": {
    "required": ["sceneGraph","viewport","selectedNodeIds","theme","onSelectNode","onPan","onZoomTo","onCenterFit","onGoToRoot"],
    "optional": ["zoomLimits","fitMarginRatio"]
  },
  "selectors": {
    "background": "[data-testid='canvas-background']",
    "node": "[data-testid='node-{{nodeId}}']"
  },
  "fixtures": {
    "sceneGraph": {
      "nodes": [
        { "nodeId":"root","x":0,"y":0,"width":120,"height":40,"text":"Root","classId":"default","isCollapsed":false,"hasNotes":false,"hasChildren":true },
        { "nodeId":"a","x":180,"y":-60,"width":100,"height":36,"text":"A","classId":"idea","isCollapsed":false,"hasNotes":false,"hasChildren":false },
        { "nodeId":"b","x":180,"y":60,"width":100,"height":36,"text":"B","classId":"idea","isCollapsed":false,"hasNotes":true,"hasChildren":false }
      ],
      "connectors": [{ "fromNodeId":"root","toNodeId":"a" }, { "fromNodeId":"root","toNodeId":"b" }]
    },
    "viewport": { "zoom":1.0, "offsetX":0, "offsetY":0 },
    "theme": {
      "font": {
        "size": 14,
        "weight": 600,
        "family": "Inter",
        "lineHeight": 20,
        "paddingX": 12,
        "paddingY": 10
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
      }
    }
  },
  "tests": [
    {
      "name": "renders nodes and highlights selection",
      "mount": {
        "props": {
          "sceneGraph": "$fixtures.sceneGraph",
          "viewport": "$fixtures.viewport",
          "selectedNodeIds": ["a"],
          "theme": "$fixtures.theme"
        },
        "spies": ["onSelectNode","onPan","onZoomTo","onCenterFit","onGoToRoot"]
      },
      "assert": [
        { "exists": { "selector": "$selectors.node", "params": { "nodeId": "root" } } },
        { "exists": { "selector": "$selectors.node", "params": { "nodeId": "a" } } }
      ]
    },
    {
      "name": "click node selects it; click background clears",
      "mount": {
        "props": {
          "sceneGraph": "$fixtures.sceneGraph",
          "viewport": "$fixtures.viewport",
          "selectedNodeIds": [],
          "theme": "$fixtures.theme"
        },
        "spies": ["onSelectNode"]
      },
      "steps": [
        { "click": { "selector": "$selectors.node", "params": { "nodeId": "a" } } },
        { "expectCallback": { "name": "onSelectNode", "with": ["a"] } },
        { "click": { "selector": "$selectors.background" } },
        { "expectCallback": { "name": "onSelectNode", "with": [null] } }
      ]
    },
    {
      "name": "pan emits deltas",
      "mount": {
        "props": {
          "sceneGraph": "$fixtures.sceneGraph",
          "viewport": "$fixtures.viewport",
          "selectedNodeIds": [],
          "theme": "$fixtures.theme"
        },
        "spies": ["onPan"]
      },
      "steps": [
        { "drag": { "selector": "$selectors.background", "from": [100,100], "to": [160,130] } },
        { "expectCallbackCalled": { "name": "onPan" } }
      ]
    },
    {
      "name": "wheel zoom emits onZoomTo at pointer center",
      "mount": {
        "props": {
          "sceneGraph": "$fixtures.sceneGraph",
          "viewport": "$fixtures.viewport",
          "selectedNodeIds": [],
          "theme": "$fixtures.theme"
        },
        "spies": ["onZoomTo"]
      },
      "steps": [
        { "wheel": { "selector": "$selectors.background", "deltaY": -120, "center": [250,180], "ctrlKey": true } },
        { "expectCallbackArgs": { "name": "onZoomTo", "argTypes": ["number", "250", "180"] } }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "CanvasView",
      "version": "1.0.0",
      "features": ["multi-selection","zoom-to","center-fit","go-to-root"]
    }
  }
}
```