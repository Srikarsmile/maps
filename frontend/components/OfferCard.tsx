import React from 'react';
import GlassContainer from './GlassContainer';

interface OfferCardProps {
  title?: string;
  description?: string;
  className?: string;
}

const OfferCard: React.FC<OfferCardProps> = ({ 
  title = 'Sample Offer', 
  description = 'This is a sample offer description',
  className = '' 
}) => {
  return (
    <GlassContainer className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </GlassContainer>
  );
};

export default OfferCard; 