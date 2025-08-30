export class LayoutEngine {
  constructor({ rootNode, layoutConfig, theme, collapsedNodes = new Set() }) {
    this.rootNode = rootNode;
    this.layoutConfig = layoutConfig || {
      type: 'tree-ltr',
      spacing: { horizontal: 100, vertical: 20 },
      maxTextWidth: 300,
      minTextWidth: 80
    };
    this.theme = theme;
    this.collapsedNodes = collapsedNodes;
  }

  layout(rootNode = this.rootNode, config = this.layoutConfig, theme = this.theme, collapsed = this.collapsedNodes) {
    const nodes = [];
    const links = [];
    const bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

    const measureNode = (text, config, theme) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.font = `${theme.font.weight} ${theme.font.size}px ${theme.font.family}`;
      
      const metrics = ctx.measureText(text);
      const width = Math.min(Math.max(metrics.width + theme.font.paddingX * 2, config.minTextWidth), config.maxTextWidth);
      const height = theme.font.lineHeight + theme.font.paddingY * 2;
      
      return { width, height };
    };

    const layoutNode = (node, x, y, depth = 0) => {
      const { width, height } = measureNode(node.text, config, theme);
      const isCollapsed = collapsed.has(node.id);
      
      nodes.push({
        id: node.id,
        nodeId: node.id,
        x,
        y,
        width,
        height,
        text: node.text,
        classId: node.class || 'default',
        isCollapsed,
        hasNotes: !!node.notes,
        hasChildren: !!(node.children && node.children.length > 0),
        depth
      });

      bounds.minX = Math.min(bounds.minX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxX = Math.max(bounds.maxX, x + width);
      bounds.maxY = Math.max(bounds.maxY, y + height);

      if (node.children && !isCollapsed) {
        let childY = y - ((node.children.length - 1) * (height + config.spacing.vertical)) / 2;
        
        node.children.forEach(child => {
          const childX = x + width + config.spacing.horizontal;
          layoutNode(child, childX, childY, depth + 1);
          
          links.push({
            fromNodeId: node.id,
            toNodeId: child.id
          });
          
          childY += height + config.spacing.vertical;
        });
      }
    };

    layoutNode(rootNode, 0, 0);

    return { 
      nodes, 
      connectors: links, 
      bounds 
    };
  }

  measureNode(text, config = this.layoutConfig, theme = this.theme) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${theme.font.weight} ${theme.font.size}px ${theme.font.family}`;
    
    const metrics = ctx.measureText(text);
    const width = Math.min(Math.max(metrics.width + theme.font.paddingX * 2, config.minTextWidth), config.maxTextWidth);
    const height = theme.font.lineHeight + theme.font.paddingY * 2;
    
    return { width, height };
  }

  getConnectorPath(from, to, config) {
    const dx = to.x - (from.x + from.width);
    const dy = to.y + to.height/2 - (from.y + from.height/2);
    const curvature = config.curvature || 0.3;
    
    const x1 = from.x + from.width;
    const y1 = from.y + from.height / 2;
    const x2 = to.x;
    const y2 = to.y + to.height / 2;
    
    const cp1x = x1 + dx * curvature;
    const cp2x = x2 - dx * curvature;
    
    return `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`;
  }
}

LayoutEngine.capabilities = {
  component: "LayoutEngine",
  version: "1.0.0",
  features: ["tree-layout", "text-measurement", "collapse-support", "bezier-connectors"]
};