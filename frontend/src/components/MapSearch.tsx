import { useState, useEffect } from 'react';
import { Search, MapPin, Globe, X } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { apiClient, Artifact } from '@/services/api';
import { cn } from '@/lib/utils';

interface SearchableItem {
  id: string;
  name: string;
  type: 'artifact' | 'culture' | 'location';
  culture?: string;
  location?: string;
  coordinates?: [number, number];
  artifact?: Artifact;
}

interface MapSearchProps {
  onResultSelect: (item: SearchableItem) => void;
  className?: string;
}

const MapSearch = ({ onResultSelect, className }: MapSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchableItems, setSearchableItems] = useState<SearchableItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SearchableItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchableItem | null>(null);

  // Load all searchable data on mount
  useEffect(() => {
    const loadSearchableData = async () => {
      setIsLoading(true);
      try {
        // Fetch artifacts from backend
        const { artifacts } = await apiClient.getArtifacts();
        
        const items: SearchableItem[] = [];
        const culturesSet = new Set<string>();
        const locationsSet = new Set<string>();

        // Process artifacts
        artifacts.forEach((artifact) => {
          // Add artifact as searchable item
          items.push({
            id: `artifact-${artifact.id}`,
            name: artifact.name,
            type: 'artifact',
            culture: artifact.culture,
            location: artifact.location,
            coordinates: artifact.coordinates,
            artifact,
          });

          // Collect unique cultures
          if (artifact.culture) {
            culturesSet.add(artifact.culture);
          }

          // Collect unique locations
          if (artifact.location) {
            locationsSet.add(artifact.location);
          }
        });

        // Add cultures as searchable items
        culturesSet.forEach((culture) => {
          const cultureArtifacts = artifacts.filter((a) => a.culture === culture);
          if (cultureArtifacts.length > 0) {
            // Use the first artifact's coordinates as representative
            items.push({
              id: `culture-${culture}`,
              name: culture,
              type: 'culture',
              culture,
              coordinates: cultureArtifacts[0].coordinates,
            });
          }
        });

        // Add locations as searchable items
        locationsSet.forEach((location) => {
          const locationArtifacts = artifacts.filter((a) => a.location === location);
          if (locationArtifacts.length > 0) {
            items.push({
              id: `location-${location}`,
              name: location,
              type: 'location',
              location,
              coordinates: locationArtifacts[0].coordinates,
            });
          }
        });

        setSearchableItems(items);
        setFilteredItems(items);
      } catch (error) {
        console.error('Failed to load searchable data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSearchableData();
  }, []);

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(searchableItems);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = searchableItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(query);
      const cultureMatch = item.culture?.toLowerCase().includes(query);
      const locationMatch = item.location?.toLowerCase().includes(query);
      
      return nameMatch || cultureMatch || locationMatch;
    });

    setFilteredItems(filtered);
  }, [searchQuery, searchableItems]);

  const handleSelect = (item: SearchableItem) => {
    setSelectedItem(item);
    setSearchQuery(item.name);
    setOpen(false);
    onResultSelect(item);
  };

  const handleClear = () => {
    setSelectedItem(null);
    setSearchQuery('');
    setFilteredItems(searchableItems);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'artifact':
        return <MapPin className="w-4 h-4 text-primary" />;
      case 'culture':
        return <Globe className="w-4 h-4 text-secondary" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-accent" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getItemLabel = (item: SearchableItem) => {
    switch (item.type) {
      case 'artifact':
        return `${item.name} (${item.culture})`;
      case 'culture':
        return `${item.name} Culture`;
      case 'location':
        return item.name;
      default:
        return item.name;
    }
  };

  // Group items by type
  const artifactItems = filteredItems.filter((item) => item.type === 'artifact');
  const cultureItems = filteredItems.filter((item) => item.type === 'culture');
  const locationItems = filteredItems.filter((item) => item.type === 'location');

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-card/80 backdrop-blur-md border-border/50 hover:bg-card/90 hover:border-accent/50 transition-all"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate text-sm">
                {selectedItem ? getItemLabel(selectedItem) : 'Search cultures, artifacts, locations...'}
              </span>
            </div>
            {selectedItem && (
              <X
                className="w-4 h-4 text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search by culture, artifact, or location..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <>
                  {cultureItems.length > 0 && (
                    <CommandGroup heading="Cultures">
                      {cultureItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => handleSelect(item)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            {getItemIcon(item.type)}
                            <span className="flex-1">{getItemLabel(item)}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {artifactItems.length > 0 && (
                    <CommandGroup heading="Artifacts">
                      {artifactItems.slice(0, 10).map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => handleSelect(item)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            {getItemIcon(item.type)}
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {item.culture} • {item.location}
                              </div>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                      {artifactItems.length > 10 && (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          +{artifactItems.length - 10} more artifacts
                        </div>
                      )}
                    </CommandGroup>
                  )}

                  {locationItems.length > 0 && (
                    <CommandGroup heading="Locations">
                      {locationItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => handleSelect(item)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 w-full">
                            {getItemIcon(item.type)}
                            <span className="flex-1">{getItemLabel(item)}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MapSearch;

