# Maps Frontend

A React TypeScript application with Mapbox GL integration for visualizing hexagon density data.

## Features

- **GlassContainer**: Translucent wrapper component with Tailwind backdrop-blur
- **MapPanel**: Mapbox GL map with hexagon visualization
- **OfferCard**: Simple card component for displaying offers
- **HexTooltip**: Hover overlay for hexagon data
- **Real-time Updates**: Updates hexagon data every 3 seconds

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Mapbox access token:
   - Get a Mapbox access token from [Mapbox](https://account.mapbox.com/access-tokens/)
   - Add it to your environment variables or directly in `MapPanel.tsx`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Components

### GlassContainer
A reusable translucent container with backdrop blur effect.

### MapPanel
- Initializes Mapbox GL map
- Adds hexagon source and layer
- Exposes `updateHexes(hexGeoJson)` function for updating hexagon data

### OfferCard
Simple card component for displaying offers with glass effect.

### HexTooltip
Optional hover overlay for displaying hexagon information.

## Data Structure

The application uses fake pings data with the following structure:
```typescript
interface Ping {
  lat: number;
  lng: number;
  density: number;
  hexId: string;
}
```

## Styling

The application uses Tailwind CSS with custom glass morphism effects and a dark gradient background.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking 