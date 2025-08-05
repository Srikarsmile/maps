import React from 'react';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
}

const GlassContainer: React.FC<GlassContainerProps> = ({ children, className = '' }) => {
  return (
    <div 
      className={`
        bg-white/10 
        backdrop-blur-xl 
        border border-white/20 
        rounded-2xl 
        shadow-2xl 
        hover:bg-white/15
        hover:border-white/30
        transition-all
        duration-300
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)'
      }}
    >
      {children}
    </div>
  );
};

export default GlassContainer; 