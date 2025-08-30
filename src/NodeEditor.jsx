import React, { useState, useRef, useEffect } from 'react';

export const NodeEditor = ({ 
  initialText, 
  textClass, 
  fontSize, 
  fontFamily, 
  fontWeight, 
  maxWidth, 
  minWidth,
  textAlign = 'center',
  onCommit = () => {},
  onCancel = () => {},
  onTextChange = () => {},
  onSizeChange = () => {}
}) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  useEffect(() => {
    const measureSize = () => {
      if (measureRef.current) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        
        const metrics = ctx.measureText(text || 'M');
        const width = Math.min(Math.max(metrics.width + 24, minWidth), maxWidth);
        const lines = Math.ceil(metrics.width / (maxWidth - 24));
        const height = lines * (fontSize + 6) + 20;
        
        onSizeChange(width, height);
      }
    };

    const timeoutId = setTimeout(measureSize, 10);
    return () => clearTimeout(timeoutId);
  }, [text, fontSize, fontFamily, fontWeight, maxWidth, minWidth, onSizeChange]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onCommit(text);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange(newText);
  };

  return (
    <div data-testid="node-editor" className="relative">
      <textarea
        ref={textareaRef}
        data-testid="node-editor-textarea"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`resize-none overflow-hidden ${textClass} p-2 border rounded`}
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          fontWeight,
          maxWidth: `${maxWidth}px`,
          minWidth: `${minWidth}px`,
          textAlign
        }}
      />
      <div ref={measureRef} className="sr-only" />
    </div>
  );
};

NodeEditor.capabilities = {
  component: "NodeEditor",
  version: "1.0.0",
  features: ["auto-resize", "multi-line", "keyboard-shortcuts", "real-time-updates"]
};