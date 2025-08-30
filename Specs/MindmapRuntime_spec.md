# Component: MindmapRuntime
**Contract Version:** 1.1.0  
**Import Path:** `<namespace>/mindmap-runtime/v1`

## 1. Purpose
MindmapRuntime manages the core mind map data model, executes actions, maintains state history, and provides a unified interface for all data operations.

## 2. Responsibilities
1. Maintain the mind map tree data structure
2. Execute CRUD operations on nodes
3. Manage undo/redo history
4. Handle import/export of mind map data
5. Provide state query capabilities
6. Execute action dispatching with guards

## 3. Inputs (Props)
1. `initialData: MindmapData`
   - Root node with children: `{ id, text, class?, notes?, collapsed?, children? }`
2. `actions: ActionRegistry`
   - Map of action names to implementations
3. `maxHistorySize?: number`
   - Maximum undo history (default: 50)

## 4. Outputs (Methods)
1. `getState(): MindmapData` - Get current state
2. `setState(data: MindmapData): void` - Replace entire state
3. `dispatch(action: Action, context?: Context): Promise<any>` - Execute action
4. `findNode(nodeId: string): NodeData | null` - Find node by ID
5. `canUndo(): boolean` - Check if undo available
6. `canRedo(): boolean` - Check if redo available
7. `undo(): void` - Revert to previous state
8. `redo(): void` - Reapply reverted state
9. `exportJSON(): string` - Export as JSON string
10. `importJSON(json: string): void` - Import from JSON
11. `subscribe(listener: (state: MindmapData) => void): () => void` - Subscribe to changes

## 5. Behavior
1. **State Management**
   - Immutable state updates
   - Deep clone before modifications
   - Notify subscribers on changes

2. **Action Execution**
   - Validate action parameters
   - Check guards before execution
   - Support async actions
   - Return action results

3. **History Management**
   - Push state before mutations
   - Limit history to maxHistorySize
   - Clear redo stack on new action
   - Skip history for certain actions

4. **Node Operations**
   - Add child with auto-generated ID
   - Remove node and all descendants
   - Update node properties
   - Toggle collapse state
   - Move nodes between parents

## 6. Non-Responsibilities
- Does not handle UI rendering
- Does not manage selection state
- Does not perform layout calculations
- Does not handle file I/O directly

## 7. Performance
- Efficient tree traversal using recursion
- Memoize frequently accessed nodes
- Batch state updates
- Debounce subscriber notifications

## 8. Edge Cases
1. Circular parent-child relationships → detect and prevent
2. Missing node ID in action → throw error
3. Import invalid JSON → validate and reject
4. Delete root node → prevent with guard
5. Exceed history limit → remove oldest entries

## 9. Action Definitions
```ts
interface Action {
  type: string;
  params: Record<string, any>;
}

// Core actions
- addChild: { parentId, text?, class? }
- removeNode: { nodeId }
- updateNode: { nodeId, updates }
- moveNode: { nodeId, newParentId, index? }
- toggleCollapse: { nodeId }
- setText: { nodeId, text }
- setClass: { nodeId, class }
- setNotes: { nodeId, notes }
- copy: { nodeId }
- copy: { nodeId } - Copies node and its children to clipboard
- paste: { parentId } - Pastes clipboard content as child of parent
- Clipboard must be managed at runtime level or higher
```

## 10. Diagnostics
```ts
export const capabilities = {
  component: "MindmapRuntime",
  version: "1.0.0",
  features: ["undo-redo", "import-export", "guards", "subscriptions", "async-actions"]
}
```

```conformance
{
  "component": "MindmapRuntime",
  "importPath": "<namespace>/mindmap-runtime/v1",
  "propsContract": {
    "required": ["initialData", "actions"],
    "optional": ["maxHistorySize"]
  },
  "fixtures": {
    "initialData": {
      "id": "root",
      "text": "Root Node",
      "class": "default",
      "children": [
        { "id": "child1", "text": "Child 1" },
        { "id": "child2", "text": "Child 2" }
      ]
    },
    "actions": {
      "addChild": "mockAddChild",
      "removeNode": "mockRemoveNode",
      "setText": "mockSetText"
    }
  },
  "tests": [
    {
      "name": "initializes with data",
      "create": {
        "props": {
          "initialData": "$fixtures.initialData",
          "actions": "$fixtures.actions"
        }
      },
      "assert": [
        { "method": "getState", "returns": "$fixtures.initialData" },
        { "method": "findNode", "args": ["child1"], "returns": { "id": "child1", "text": "Child 1" } }
      ]
    },
    {
      "name": "executes actions and maintains history",
      "create": {
        "props": {
          "initialData": "$fixtures.initialData",
          "actions": "$fixtures.actions"
        }
      },
      "steps": [
        { "method": "dispatch", "args": [{ "type": "setText", "params": { "nodeId": "child1", "text": "Updated" } }] },
        { "method": "canUndo", "returns": true },
        { "method": "undo" },
        { "method": "findNode", "args": ["child1"], "returns": { "id": "child1", "text": "Child 1" } },
        { "method": "canRedo", "returns": true },
        { "method": "redo" },
        { "method": "findNode", "args": ["child1"], "returns": { "id": "child1", "text": "Updated" } }
      ]
    },
    {
      "name": "imports and exports JSON",
      "create": {
        "props": {
          "initialData": "$fixtures.initialData",
          "actions": "$fixtures.actions"
        }
      },
      "steps": [
        { "method": "exportJSON", "returns": "{\"id\":\"root\",\"text\":\"Root Node\",\"class\":\"default\",\"children\":[{\"id\":\"child1\",\"text\":\"Child 1\"},{\"id\":\"child2\",\"text\":\"Child 2\"}]}" },
        { "method": "importJSON", "args": ["{\"id\":\"new\",\"text\":\"New Root\"}"] },
        { "method": "getState", "returns": { "id": "new", "text": "New Root" } }
      ]
    }
  ],
  "diagnostics": {
    "capabilities": {
      "component": "MindmapRuntime",
      "version": "1.0.0",
      "features": ["undo-redo", "import-export", "guards", "subscriptions", "async-actions"]
    }
  }
}
```