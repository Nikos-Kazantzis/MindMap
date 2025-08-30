# Component: LayoutEngine
**Contract Version:** 1.0.0  
**Import Path:** `<namespace>/layout-engine/v1`

## 1. Purpose
LayoutEngine calculates positions and dimensions for all nodes in the mind map tree, supporting multiple layout algorithms and handling collapsed states.

## 2. Responsibilities
1. Calculate node positions based on layout algorithm
2. Measure text to determine node dimensions
3. Handle spacing between nodes
4. Account for collapsed branches
5. Generate connector paths between nodes
6. Support different layout directions (LTR, RTL, vertical)

## 3. Inputs (Props)
1. `rootNode: NodeData`
   - Tree structure with all nodes
2. `layoutConfig: LayoutConfig`
   - Configuration: `{ type: 'tree-ltr'|'tree-rtl'|'radial', spacing: { horizontal, vertical }, maxTextWidth, minTextWidth }`
3. `theme: ThemeConfig`
   - Font settings for text measurement: `{ font: { size, weight, family, lineHeight, paddingX, paddingY } }`
4. `collapsedNodes: Set<string>`
   - IDs of collapsed nodes

## 4. Outputs (Methods)
1. `layout(rootNode, config, theme, collapsed): SceneGraph`
   - Returns positioned nodes and connectors
2. `measureNode(text, config, theme): { width, height }`
   - Calculate node dimensions
3. `getConnectorPath(from, to, config): string`
   - Generate SVG path for connector

## 5. SceneGraph Structure
```ts
interface SceneGraph {
  nodes: Array<{
    id: string;
    x: number;      // top position
    y: number;      // left position  
    width: number;
    height: number;
    text: string;
    class: string;
    collapsed: boolean;
    hasChildren: boolean;
    depth: number;
  }>;
  links: Array<{
    from: string;   // parent node ID
    to: string;     // child node ID
  }>;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}
```

## 6. Behavior
1. **Tree Layout (LTR)**
   - Root at left, children to right
   - Vertically center parent with children
   - Equal vertical spacing between siblings
   - Account for subtree heights

2. **Text Measurement**
   - Use canvas API for accurate measurement
   - Handle multi-line text with word wrap
   - Apply padding to calculated dimensions
   - Cache measurements for performance

3. **Collapsed Handling**
   - Skip layout for collapsed children
   - Mark nodes as collapsed in output
   - Adjust parent positioning accordingly

4. **Connector Generation**
   - Bezier curves for smooth connections
   - Straight lines for close nodes
   - Adjust curvature based on distance

## 7. Non-Responsibilities
- Does not render visual elements
- Does not handle user interactions
- Does not manage node data
- Does not perform animations

## 8. Performance
- O(n) complexity for tree traversal
- Cache text measurements
- Reuse layout calculations when possible
- Batch position updates

## 9. Edge Cases
1. Empty text → use minimum dimensions
2. Very long text → wrap at maxTextWidth
3. Single node → center in viewport
4. Circular references → detect and break
5. Missing theme values → use defaults

## 10. Diagnostics
```ts
export const capabilities = {
  component: "LayoutEngine",
  version: "1.0.0",
  features: ["tree-layout", "text-measurement", "collapse-support", "bezier-connectors"]
}
```

```conformance
{
  "component": "LayoutEngine",
  "importPath": "<namespace>/layout-engine/v1",
  "propsContract": {
    "required": ["rootNode", "layoutConfig", "theme"],
    "optional": ["collapsedNodes"]
  },
  "fixtures": {
    "rootNode": {
      "id": "root",
      "text": "Root",
      "class": "default",
      "children": [
        {
          "id": "child1",
          "text": "Child 1",
          "children": [
            { "id": "grandchild1", "text": "Grandchild 1" }
          ]
        },
        { "id": "child2", "text": "Child 2" }
      ]
    },
    "layoutConfig": {
      "type": "tree-ltr",
      "spacing": { "horizontal": 100, "vertical": 20 },
      "maxTextWidth": 300,
      "minTextWidth": 80
    },
    "theme": {
      "font": {
        "size": 14,
        "weight": 600,
        "family": "Inter",
        "lineHeight": 20,
        "paddingX": 12,
        "paddingY": 10
      }
    }
  },
  "tests": [
    {
      "name": "layouts tree with proper positioning",
      "create": {
        "props": {
          "rootNode": "$fixtures.rootNode",
          "layoutConfig": "$fixtures.layoutConfig",
          "theme": "$fixtures.theme"
        }
      },
      "assert": [
        { "method": "layout", "returns": {
          "nodes.length": 4,
          "links.length": 3,
          "nodes[0].id": "root",
          "nodes[0].x": 0,
          "links[0].from": "root"
        }}
      ]
    },
    {
      "name": "handles collapsed nodes",
      "create": {
        "props": {
          "rootNode": "$fixtures.rootNode",
          "layoutConfig": "$fixtures.layoutConfig",
          "theme": "$fixtures.theme",
          "collapsedNodes": ["child1"]
        }
      },
      "assert": [
        { "method": "layout", "returns": {
          "nodes.length": 3,
          "nodes.find(n => n.id === 'child1').collapsed": true,
          "nodes.find(n => n.id === 'grandchild1')": null
        }}
      ]
    },
    {
      "name": "measures node dimensions accurately",
      "create": {
        "props": {
          "layoutConfig": "$fixtures.layoutConfig",
          "theme": "$fixtures.theme"
        }
      },
      "assert": [
        { "method": "measureNode", "args": ["Short text"], "returns": {
          "width": ">=80",
          "height": ">=40"
        }},
        { "method": "measureNode", "args": ["Very long text that should wrap"], "returns": {
          "width": "<=324",
          "height": ">=40"
        }}
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "LayoutEngine",
      "version": "1.0.0",
      "features": ["tree-layout", "text-measurement", "collapse-support", "bezier-connectors"]
    }
  }
}
```