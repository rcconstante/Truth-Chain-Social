import React, { useEffect, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export function CustomCursor() {
  const [position, setPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    const handleMouseOut = () => setIsVisible(false);

    // Track all hoverable elements
    const hoverElements = document.querySelectorAll('a, button, [role="button"], .cursor-hover');
    
    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseout', handleMouseOut);
    
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseout', handleMouseOut);
      
      hoverElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Main cursor */}
      <div
        className={`custom-cursor ${isHovering ? 'custom-cursor-hover' : ''} animate-cursor-pulse`}
        style={{
          left: position.x - 10,
          top: position.y - 10,
        }}
      />
      
      {/* Trailing cursor effect */}
      <div
        className="fixed pointer-events-none z-[9998] w-8 h-8 rounded-full border-2 border-purple-400/30 transition-all duration-300 ease-out"
        style={{
          left: position.x - 16,
          top: position.y - 16,
          transform: isHovering ? 'scale(2)' : 'scale(1)',
          opacity: isHovering ? 0.8 : 0.4,
        }}
      />
    </>
  );
} 