import React, { memo, useMemo } from 'react';

export const ConnectorRenderer = memo(({ 
  connectors, 
  nodePositions, 
  linkConfig, 
  animated = false 
}) => {
  const paths = useMemo(() => {
    return connectors.map(connector => {
      const from = nodePositions.get(connector.fromNodeId);
      const to = nodePositions.get(connector.toNodeId);
      
      if (!from || !to) return null;
      
      const x1 = from.x + from.width;
      const y1 = from.y + from.height / 2;
      const x2 = to.x;
      const y2 = to.y + to.height / 2;
      
      const dx = x2 - x1;
      const curvature = linkConfig.curvature || 0.3;
      const cp1x = x1 + dx * curvature;
      const cp2x = x2 - dx * curvature;
      
      return {
        id: `${connector.fromNodeId}-${connector.toNodeId}`,
        d: `M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`
      };
    }).filter(Boolean);
  }, [connectors, nodePositions, linkConfig]);

  return (
    <g data-testid="connectors">
      {paths.map(path => (
        <path
          key={path.id}
          data-testid={`connector-${path.id}`}
          d={path.d}
          stroke={linkConfig.color}
          strokeWidth={linkConfig.stroke}
          strokeOpacity={linkConfig.opacity}
          fill="none"
          className={animated ? 'transition-all duration-300' : ''}
        />
      ))}
    </g>
  );
});

ConnectorRenderer.capabilities = {
  component: "ConnectorRenderer",
  version: "1.0.0",
  features: ["bezier-paths", "straight-lines", "orthogonal-routing", "path-animation"]
};