import React, { useState, useRef, useEffect } from 'react';

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  place_type: string[];
}

interface SearchBarProps {
  onLocationSelect: (location: { name: string; coordinates: [number, number] }) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onLocationSelect, className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<{ message: string; tips: string } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get error message with troubleshooting tips
  const getErrorWithTips = (error: Error | string): { message: string; tips: string } => {
    const errorMsg = error instanceof Error ? error.message : error;
    
    if (errorMsg.includes('access token not found')) {
      return {
        message: 'Configuration Error',
        tips: 'The Mapbox access token is missing. Please check your environment configuration.'
      };
    }
    
    if (errorMsg.includes('401')) {
      return {
        message: 'Authentication Failed',
        tips: 'The Mapbox access token is invalid or expired. Please check your token.'
      };
    }
    
    if (errorMsg.includes('403')) {
      return {
        message: 'Permission Denied',
        tips: 'Your Mapbox token doesn\'t have geocoding permissions.'
      };
    }
    
    if (errorMsg.includes('429')) {
      return {
        message: 'Rate Limited',
        tips: 'Too many requests. Please wait a moment and try again.'
      };
    }
    
    if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
      return {
        message: 'Network Error',
        tips: 'Please check your internet connection and try again.'
      };
    }
    
    return {
      message: errorMsg,
      tips: 'Please check your internet connection and try again.'
    };
  };

  // Debounced search function
  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      
      if (!accessToken) {
        throw new Error('Mapbox access token not found');
      }

      const apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${accessToken}&limit=5&types=place,locality,neighborhood,address,poi`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data.features || []);
      setShowResults(true);
    } catch (err) {
      setError(getErrorWithTips(err instanceof Error ? err : 'Search failed'));
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(value.trim());
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    setQuery(result.place_name);
    setResults([]);
    setShowResults(false);
    
    onLocationSelect({
      name: result.place_name,
      coordinates: result.center
    });
  };

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchLocations(query.trim());
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for places..."
            className="w-full px-4 py-3 pl-12 pr-4 text-white placeholder-white/70 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 focus:bg-white/15 transition-all duration-200"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg
                className="w-5 h-5 text-white/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (results.length > 0 || error) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
          {error ? (
            <div className="px-4 py-3">
              <div className="text-red-300 text-sm mb-2">
                {error.message}
              </div>
              <div className="text-white/60 text-xs">
                {error.tips}
              </div>
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleResultSelect(result)}
                className={`w-full px-4 py-3 text-left hover:bg-white/10 focus:bg-white/10 focus:outline-none transition-colors duration-150 ${
                  index !== results.length - 1 ? 'border-b border-white/10' : ''
                } ${index === 0 ? 'rounded-t-xl' : ''} ${
                  index === results.length - 1 ? 'rounded-b-xl' : ''
                }`}
              >
                <div className="flex items-start">
                  <svg
                    className="w-4 h-4 text-white/60 mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {result.place_name}
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {result.place_type.join(', ')}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* No results message */}
      {showResults && results.length === 0 && !error && !isLoading && query.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl z-50">
          <div className="px-4 py-3 text-white/70 text-sm">
            No results found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;