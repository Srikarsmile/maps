import React from 'react';
import GlassContainer from './GlassContainer';

interface HexTooltipProps {
  isVisible: boolean;
  x: number;
  y: number;
  hexData?: {
    density?: number;
    hexId?: string;
    coordinates?: [number, number];
  };
  className?: string;
}

const HexTooltip: React.FC<HexTooltipProps> = ({ 
  isVisible, 
  x, 
  y, 
  hexData, 
  className = '' 
}) => {
  if (!isVisible || !hexData) return null;

  return (
    <div 
      className={`fixed pointer-events-none z-50 ${className}`}
      style={{
        left: x + 10,
        top: y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <GlassContainer className="p-3 min-w-[200px]">
        <div className="text-white">
          <div className="font-semibold text-sm mb-1">
            Hex ID: {hexData.hexId || 'Unknown'}
          </div>
          <div className="text-xs text-white/80">
            Density: {hexData.density || 0}
          </div>
          {hexData.coordinates && (
            <div className="text-xs text-white/80 mt-1">
              Lat: {hexData.coordinates[1].toFixed(4)}<br />
              Lng: {hexData.coordinates[0].toFixed(4)}
            </div>
          )}
        </div>
      </GlassContainer>
    </div>
  );
};

export default HexTooltip; 