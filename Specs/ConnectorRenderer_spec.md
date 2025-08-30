# Component: ConnectorRenderer
**Contract Version:** 1.0.0  
**Import Path:** `<namespace>/connector-renderer/v1`

## 1. Purpose
ConnectorRenderer draws visual connections between parent and child nodes in the mind map using SVG paths with configurable styles.

## 2. Responsibilities
1. Generate SVG paths between nodes
2. Support different connector types (bezier, straight, orthogonal)
3. Apply styling (color, stroke, opacity)
4. Handle path animations
5. Optimize rendering for many connectors

## 3. Inputs (Props)
1. `connectors: Connector[]`
   - Array of connections: `{ fromNodeId: string, toNodeId: string }`
2. `nodePositions: Map<string, NodePosition>`
   - Node positions: `{ x, y, width, height }`
3. `linkConfig: LinkConfig`
   - Styling: `{ type: 'bezier'|'straight'|'orthogonal', curvature: number, stroke: number, color: string, opacity: number }`
4. `animated?: boolean`
   - Whether to animate path drawing

## 4. Outputs
- Returns SVG `<g>` element containing all paths

## 5. Behavior
1. **Path Calculation**
   - Start from parent node edge
   - End at child node edge
   - Calculate control points for curves
   - Handle different path types

2. **Bezier Curves**
   - Smooth curves between nodes
   - Curvature based on distance
   - Horizontal entry/exit for tree layout

3. **Straight Lines**
   - Direct connection
   - Shortest path between edges

4. **Orthogonal Paths**
   - Right-angle connections
   - Manhattan-style routing

5. **Optimization**
   - Batch path updates
   - Use CSS for common styles
   - Minimal DOM manipulation

## 6. Non-Responsibilities
- Does not calculate node positions
- Does not handle interactions
- Does not manage connector data

## 7. Performance
- Use single path element when possible
- Cache path calculations
- Virtualize off-screen connectors
- Batch DOM updates

## 8. Edge Cases
1. Missing node position → skip connector
2. Self-connection → create loop path
3. Overlapping nodes → adjust path
4. Zero-length path → hide connector

## 9. Path Generation
```ts
// Bezier path example
function bezierPath(x1, y1, x2, y2, curvature) {
  const dx = x2 - x1;
  const cp1x = x1 + dx * curvature;
  const cp2x = x2 - dx * curvature;
  return `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
}
```

## 10. Diagnostics
```ts
export const capabilities = {
  component: "ConnectorRenderer",
  version: "1.0.0",
  features: ["bezier-paths", "straight-lines", "orthogonal-routing", "path-animation"]
}
```

```conformance
{
  "component": "ConnectorRenderer",
  "importPath": "<namespace>/connector-renderer/v1",
  "propsContract": {
    "required": ["connectors", "nodePositions", "linkConfig"],
    "optional": ["animated"]
  },
  "selectors": {
    "container": "[data-testid='connectors']",
    "path": "[data-testid='connector-{{from}}-{{to}}']"
  },
  "fixtures": {
    "connectors": [
      { "fromNodeId": "root", "toNodeId": "child1" },
      { "fromNodeId": "root", "toNodeId": "child2" }
    ],
    "nodePositions": {
      "root": { "x": 100, "y": 100, "width": 120, "height": 40 },
      "child1": { "x": 100, "y": 250, "width": 100, "height": 40 },
      "child2": { "x": 160, "y": 250, "width": 100, "height": 40 }
    },
    "linkConfig": {
      "type": "bezier",
      "curvature": 0.3,
      "stroke": 2,
      "color": "#64748b",
      "opacity": 0.8
    }
  },
  "tests": [
    {
      "name": "renders connectors between nodes",
      "mount": {
        "props": {
          "connectors": "$fixtures.connectors",
          "nodePositions": "$fixtures.nodePositions",
          "linkConfig": "$fixtures.linkConfig"
        }
      },
      "assert": [
        { "exists": { "selector": "$selectors.container" } },
        { "exists": { "selector": "$selectors.path", "params": { "from": "root", "to": "child1" } } },
        { "exists": { "selector": "$selectors.path", "params": { "from": "root", "to": "child2" } } }
      ]
    },
    {
      "name": "applies link configuration styles",
      "mount": {
        "props": {
          "connectors": "$fixtures.connectors",
          "nodePositions": "$fixtures.nodePositions",
          "linkConfig": "$fixtures.linkConfig"
        }
      },
      "assert": [
        { "attribute": { 
          "selector": "$selectors.path",
          "params": { "from": "root", "to": "child1" },
          "name": "stroke",
          "value": "#64748b"
        }},
        { "attribute": { 
          "selector": "$selectors.path",
          "params": { "from": "root", "to": "child1" },
          "name": "stroke-width",
          "value": "2"
        }},
        { "attribute": { 
          "selector": "$selectors.path",
          "params": { "from": "root", "to": "child1" },
          "name": "stroke-opacity",
          "value": "0.8"
        }}
      ]
    },
    {
      "name": "handles missing node positions gracefully",
      "mount": {
        "props": {
          "connectors": [
            { "fromNodeId": "root", "toNodeId": "missing" }
          ],
          "nodePositions": "$fixtures.nodePositions",
          "linkConfig": "$fixtures.linkConfig"
        }
      },
      "assert": [
        { "notExists": { "selector": "$selectors.path", "params": { "from": "root", "to": "missing" } } }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "ConnectorRenderer",
      "version": "1.0.0",
      "features": ["bezier-paths", "straight-lines", "orthogonal-routing", "path-animation"]
    }
  }
}
```