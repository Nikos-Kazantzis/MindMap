export class MindmapRuntime {
  constructor({ initialData, actions, maxHistorySize = 50 }) {
    this.state = this.cloneDeep(initialData);
    this.actions = actions || {};
    this.maxHistorySize = maxHistorySize;
    this.history = [];
    this.historyIndex = -1;
    this.listeners = new Set();
  }

  cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  getState() {
    return this.cloneDeep(this.state);
  }

  setState(data) {
    this.pushHistory();
    this.state = this.cloneDeep(data);
    this.notifyListeners();
  }

  findNode(nodeId, node = this.state) {
    if (node.id === nodeId) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = this.findNode(nodeId, child);
        if (found) return found;
      }
    }
    return null;
  }

  async dispatch(action, context = {}) {
    const handler = this.actions[action.type];
    if (!handler) {
      throw new Error(`Unknown action: ${action.type}`);
    }

    // Push history BEFORE each action
    this.pushHistory();

    const result = await handler(this.state, action.params, context);
    if (result !== undefined) {
      this.state = this.cloneDeep(result);
    }

    this.notifyListeners();
    return result;
  }

  pushHistory() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(this.cloneDeep(this.state));
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  undo() {
    if (this.canUndo()) {
      this.historyIndex--;
      this.state = this.cloneDeep(this.history[this.historyIndex]);
      this.notifyListeners();
    }
  }

  redo() {
    if (this.canRedo()) {
      this.historyIndex++;
      this.state = this.cloneDeep(this.history[this.historyIndex]);
      this.notifyListeners();
    }
  }

  exportJSON() {
    return JSON.stringify(this.state);
  }

  importJSON(json) {
    try {
      const data = JSON.parse(json);
      this.setState(data);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.getState()));
  }
}

MindmapRuntime.capabilities = {
  component: "MindmapRuntime",
  version: "1.0.0",
  features: ["undo-redo", "import-export", "guards", "subscriptions", "async-actions"]
};