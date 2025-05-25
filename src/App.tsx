import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Search, AlertTriangle, CheckCircle, Info, DollarSign, Move } from 'lucide-react';
import './App.css';

// Plant Database Types
interface Plant {
  id: string;
  name: string;
  variety: string;
  hardiness: string;
  matureSize: string;
  spacing: number;
  guildBenefits: string[];
  compatibleGuilds: number[];
  sunNeeds: string;
  waterNeeds: string;
  soilRequirements: string;
  yieldExpectation: string;
  timeToProduction: string;
  mnSources: string[];
  goodBecause: string[];
  badBecause: string[];
  layer: 'overstory' | 'understory' | 'shrub' | 'herbaceous' | 'groundcover' | 'vine' | 'root';
  nitrogenFixer?: boolean;
  price: number;
  annualYield: number;
}

interface PlacedPlant {
  plant: Plant;
  x: number;
  y: number;
  id: string;
}

interface Compatibility {
  compatible: boolean;
  reason: string;
  type: 'beneficial' | 'neutral' | 'harmful';
}

// Minnesota Plant Database
const MINNESOTA_PLANTS: Plant[] = [
  {
    id: 'apple_prairie_sensation',
    name: 'Prairie Sensation Apple',
    variety: 'Prairie Sensation on M106',
    hardiness: 'Zone 3-7 (-35°F)',
    matureSize: '12-15\' × 12-15\'',
    spacing: 180, // inches (15 feet)
    guildBenefits: ['Edible', 'Pollinator Attractor', 'Wildlife Supporter'],
    compatibleGuilds: [1, 6],
    sunNeeds: 'Full Sun',
    waterNeeds: 'Moderate',
    soilRequirements: 'Well-drained, pH 6.0-7.0, loamy',
    yieldExpectation: '50-90 lbs/tree at maturity',
    timeToProduction: 'First: 4-5 years, Full: 7-9 years',
    mnSources: ['University of Minnesota', 'Jung Garden'],
    goodBecause: ['U of M bred for Minnesota', 'Stores 8+ months', 'Extremely hardy'],
    badBecause: ['Needs cross-pollination', 'Takes 4-5 years to fruit'],
    layer: 'overstory',
    price: 35,
    annualYield: 150
  },
  {
    id: 'elderberry_adams',
    name: 'American Elderberry',
    variety: 'Sambucus canadensis Adams',
    hardiness: 'Zone 3-8 (-40°F)',
    matureSize: '8-12\' × 8-12\'',
    spacing: 96, // inches (8 feet)
    guildBenefits: ['Edible', 'Medicinal', 'Pollinator Attractor', 'Wildlife Supporter'],
    compatibleGuilds: [2, 5, 6],
    sunNeeds: 'Full Sun-Partial Shade',
    waterNeeds: 'Moist',
    soilRequirements: 'Rich, moist, pH 5.5-7.0',
    yieldExpectation: '15-25 lbs berries + 5-10 lbs flowers',
    timeToProduction: 'Flowers: Year 2, Berries: Year 3-4',
    mnSources: ['Prairie Moon', 'Jung Garden'],
    goodBecause: ['Dual harvest', 'Immune support', 'Very hardy', 'Native'],
    badBecause: ['Needs consistent water', 'Attracts Japanese beetles'],
    layer: 'understory',
    price: 20,
    annualYield: 160
  },
  {
    id: 'asparagus_jersey_knight',
    name: 'Asparagus',
    variety: 'Jersey Knight',
    hardiness: 'Zone 3-8 (-40°F)',
    matureSize: '4-6\' × 2-3\'',
    spacing: 18, // inches
    guildBenefits: ['Edible', 'Dynamic Accumulator'],
    compatibleGuilds: [1, 3, 4, 7, 8],
    sunNeeds: 'Full Sun',
    waterNeeds: 'Moderate',
    soilRequirements: 'Well-drained, pH 6.5-7.5, deep sandy-loam',
    yieldExpectation: '1/2-1 lb per plant/season',
    timeToProduction: 'Harvest starts: Year 3, Full: Year 4-5',
    mnSources: ['Most garden centers', 'Johnny\'s Seeds'],
    goodBecause: ['Long-lived (20+ years)', 'All-male variety', 'Early harvest'],
    badBecause: ['3-year establishment', 'Needs full sun'],
    layer: 'herbaceous',
    price: 3,
    annualYield: 8
  },
  {
    id: 'currant_red_lake',
    name: 'Red Currant',
    variety: 'Red Lake',
    hardiness: 'Zone 3-7 (-40°F)',
    matureSize: '4-5\' × 4-5\'',
    spacing: 60, // inches (5 feet)
    guildBenefits: ['Edible', 'Wildlife Supporter'],
    compatibleGuilds: [1, 4, 5, 6],
    sunNeeds: 'Full Sun-Partial Shade',
    waterNeeds: 'Moist',
    soilRequirements: 'Rich, moist, pH 6.0-7.5',
    yieldExpectation: '4-8 lbs/bush',
    timeToProduction: 'First: Year 2, Full: Year 3-4',
    mnSources: ['Jung Garden', 'Landscape Alternatives'],
    goodBecause: ['Reliable producer', 'Very hardy', 'Classic variety'],
    badBecause: ['Needs consistent moisture', 'Tart berries'],
    layer: 'shrub',
    price: 18,
    annualYield: 36
  },
  {
    id: 'black_alder',
    name: 'Black Alder',
    variety: 'Alnus glutinosa',
    hardiness: 'Zone 3-7 (-40°F)',
    matureSize: '40-60\' × 20-30\'',
    spacing: 300, // inches (25 feet)
    guildBenefits: ['Nitrogen-Fixing', 'Wildlife Supporter', 'Pioneer Species', 'Soil Improver'],
    compatibleGuilds: [2, 3, 6],
    sunNeeds: 'Full Sun-Partial Shade',
    waterNeeds: 'Wet-Moist',
    soilRequirements: 'Adaptable, pH 5.0-7.5, wet conditions',
    yieldExpectation: '60-100 lbs nitrogen/year equivalent fertilizer',
    timeToProduction: 'Nitrogen benefit: Year 2-3',
    mnSources: ['Prairie Moon', 'Landscape Alternatives'],
    goodBecause: ['Fast nitrogen production', 'Wetland tolerant', 'Pioneer species'],
    badBecause: ['Gets very large', 'Needs wet conditions'],
    layer: 'overstory',
    nitrogenFixer: true,
    price: 25,
    annualYield: 0 // Nitrogen benefit, not direct food
  },
  {
    id: 'white_clover',
    name: 'White Clover',
    variety: 'Trifolium repens',
    hardiness: 'Zone 2-8 (-50°F)',
    matureSize: '4-6" × spreading',
    spacing: 6, // inches
    guildBenefits: ['Nitrogen-Fixing', 'Pollinator Attractor', 'Wildlife Supporter', 'Living Mulch'],
    compatibleGuilds: [1, 2, 3, 6, 7, 8],
    sunNeeds: 'Full Sun-Partial Shade',
    waterNeeds: 'Moderate',
    soilRequirements: 'Adaptable, pH 6.0-7.5',
    yieldExpectation: 'Living mulch + nitrogen fixation',
    timeToProduction: 'Immediate nitrogen benefit',
    mnSources: ['All garden centers', 'Seed suppliers'],
    goodBecause: ['Nitrogen fixing', 'Living mulch', 'Bee food', 'Self-seeding'],
    badBecause: ['Can spread where not wanted'],
    layer: 'groundcover',
    nitrogenFixer: true,
    price: 5,
    annualYield: 0 // Nitrogen benefit
  },
  {
    id: 'wild_strawberry',
    name: 'Wild Strawberry',
    variety: 'Fragaria virginiana',
    hardiness: 'Zone 2-8 (-50°F)',
    matureSize: '6" × spreading',
    spacing: 12, // inches
    guildBenefits: ['Edible', 'Wildlife Supporter', 'Erosion Control', 'Pollinator Attractor'],
    compatibleGuilds: [1, 2, 3, 4, 5, 6],
    sunNeeds: 'Full Sun-Partial Shade',
    waterNeeds: 'Moderate',
    soilRequirements: 'Adaptable, pH 5.5-7.0',
    yieldExpectation: '1-2 lbs berries per 10 sq ft',
    timeToProduction: 'First berries: Year 1',
    mnSources: ['Prairie Moon', 'Native plant sales'],
    goodBecause: ['Native', 'Edible berries', 'Living mulch', 'Self-spreading'],
    badBecause: ['Small berries', 'Can spread extensively'],
    layer: 'groundcover',
    price: 8,
    annualYield: 24
  }
];

// Compatibility Rules
const checkCompatibility = (plant1: Plant, plant2: Plant, distance: number): Compatibility => {
  // Spacing check - most critical
  const requiredSpacing = (plant1.spacing + plant2.spacing) / 2;
  if (distance < requiredSpacing) {
    return {
      compatible: false,
      reason: `Plants need ${Math.round(requiredSpacing)} inches apart (${Math.round(requiredSpacing/12)} feet). Currently ${Math.round(distance)} inches apart.`,
      type: 'harmful'
    };
  }

  // Beneficial relationships
  if (plant1.layer === 'overstory' && plant2.nitrogenFixer) {
    return {
      compatible: true,
      reason: 'Nitrogen-fixing plant provides fertilizer for fruit tree',
      type: 'beneficial'
    };
  }

  if (plant1.layer === 'groundcover' && plant2.layer !== 'groundcover') {
    return {
      compatible: true,
      reason: 'Ground cover provides living mulch and soil protection',
      type: 'beneficial'
    };
  }

  // Guild compatibility
  const sharedGuilds = plant1.compatibleGuilds.filter(guild => 
    plant2.compatibleGuilds.includes(guild)
  );
  
  if (sharedGuilds.length > 0) {
    return {
      compatible: true,
      reason: `Both plants work well in Guild ${sharedGuilds.join(', ')}`,
      type: 'beneficial'
    };
  }

  return {
    compatible: true,
    reason: 'Plants are compatible with proper spacing',
    type: 'neutral'
  };
};

// Plant Card Component
const PlantCard: React.FC<{ 
  plant: Plant; 
  onDragStart: (plant: Plant) => void;
  isSelected: boolean;
  onClick: () => void;
}> = ({ plant, onDragStart, isSelected, onClick }) => {
  return (
    <div 
      className={`plant-card ${isSelected ? 'selected' : ''}`}
      draggable
      onDragStart={() => onDragStart(plant)}
      onClick={onClick}
    >
      <div className="plant-header">
        <h4>{plant.name}</h4>
        <span className="plant-layer">{plant.layer}</span>
      </div>
      <div className="plant-variety">{plant.variety}</div>
      <div className="plant-size">{plant.matureSize}</div>
      <div className="plant-benefits">
        {plant.guildBenefits.slice(0, 2).map(benefit => (
          <span key={benefit} className="benefit-tag">{benefit}</span>
        ))}
        {plant.nitrogenFixer && <span className="nitrogen-tag">N-Fixer</span>}
      </div>
      <div className="plant-price">${plant.price}</div>
    </div>
  );
};

// Placed Plant Component - Now Draggable!
const PlacedPlantComponent: React.FC<{
  placedPlant: PlacedPlant;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  isSelected: boolean;
  onClick: () => void;
  compatibilityIssues: Array<{other: PlacedPlant, compatibility: Compatibility}>;
}> = ({ placedPlant, onRemove, onMove, isSelected, onClick, compatibilityIssues }) => {
  const hasIssues = compatibilityIssues.some(issue => !issue.compatibility.compatible);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('remove-plant')) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const designArea = document.querySelector('.design-content') as HTMLElement;
    if (!designArea) return;
    
    const rect = designArea.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    onMove(placedPlant.id, 
      Math.max(0, Math.min(newX, 1000 - placedPlant.plant.spacing)),
      Math.max(0, Math.min(newY, 800 - placedPlant.plant.spacing))
    );
  }, [isDragging, dragOffset, onMove, placedPlant.id, placedPlant.plant.spacing]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  return (
    <div 
      className={`placed-plant ${isSelected ? 'selected' : ''} ${hasIssues ? 'has-issues' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: placedPlant.x,
        top: placedPlant.y,
        width: `${placedPlant.plant.spacing}px`,
        height: `${placedPlant.plant.spacing}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onClick={onClick}
      onMouseDown={handleMouseDown}
    >
      <div className="plant-name">{placedPlant.plant.name}</div>
      <div className="plant-layer-indicator">{placedPlant.plant.layer[0].toUpperCase()}</div>
      {hasIssues && <AlertTriangle className="warning-icon" size={16} />}
      {placedPlant.plant.nitrogenFixer && <span className="nitrogen-indicator">N</span>}
      <Move className="drag-indicator" size={14} />
      <button 
        className="remove-plant" 
        onClick={(e) => {e.stopPropagation(); onRemove(placedPlant.id);}}
      >
        ×
      </button>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [plants] = useState<Plant[]>(MINNESOTA_PLANTS);
  const [placedPlants, setPlacedPlants] = useState<PlacedPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedPlacedPlant, setSelectedPlacedPlant] = useState<PlacedPlant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedPlant, setDraggedPlant] = useState<Plant | null>(null);

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.guildBenefits.some(benefit => 
      benefit.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleDragStart = useCallback((plant: Plant) => {
    setDraggedPlant(plant);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPlant) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - draggedPlant.spacing / 2;
    const y = e.clientY - rect.top - draggedPlant.spacing / 2;

    const newPlacedPlant: PlacedPlant = {
      plant: draggedPlant,
      x: Math.max(0, Math.min(x, 1000 - draggedPlant.spacing)),
      y: Math.max(0, Math.min(y, 800 - draggedPlant.spacing)),
      id: `${draggedPlant.id}_${Date.now()}`
    };

    setPlacedPlants(prev => [...prev, newPlacedPlant]);
    setDraggedPlant(null);
  }, [draggedPlant]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removePlacedPlant = useCallback((id: string) => {
    setPlacedPlants(prev => prev.filter(p => p.id !== id));
    if (selectedPlacedPlant?.id === id) {
      setSelectedPlacedPlant(null);
    }
  }, [selectedPlacedPlant]);

  // NEW: Move placed plant function
  const movePlacedPlant = useCallback((id: string, x: number, y: number) => {
    setPlacedPlants(prev => prev.map(p => 
      p.id === id ? { ...p, x, y } : p
    ));
  }, []);

  // Calculate compatibility for all plant pairs
  const getCompatibilityIssues = (placedPlant: PlacedPlant) => {
    return placedPlants
      .filter(other => other.id !== placedPlant.id)
      .map(other => {
        const distance = Math.sqrt(
          Math.pow(placedPlant.x - other.x, 2) + 
          Math.pow(placedPlant.y - other.y, 2)
        );
        return {
          other,
          compatibility: checkCompatibility(placedPlant.plant, other.plant, distance)
        };
      });
  };

  // Calculate total investment and potential return
  const totalInvestment = placedPlants.reduce((sum, pp) => sum + pp.plant.price, 0);
  const annualYield = placedPlants.reduce((sum, pp) => sum + pp.plant.annualYield, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <header className="app-header">
          <h1>🌱 Minnesota Permaculture Guild Designer</h1>
          <p>Design your food forest with intelligent plant compatibility checking</p>
        </header>

        <div className="app-content">
          {/* Plant Database Panel */}
          <div className="plant-panel">
            <div className="panel-header">
              <h2>Minnesota Plant Database</h2>
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="plant-list">
              {filteredPlants.map(plant => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onDragStart={handleDragStart}
                  isSelected={selectedPlant?.id === plant.id}
                  onClick={() => setSelectedPlant(plant)}
                />
              ))}
            </div>
          </div>

          {/* Guild Designer */}
          <div className="designer-panel">
            <div className="panel-header">
              <h2>Guild Designer</h2>
              <div className="guild-stats">
                <div className="stat">
                  <DollarSign size={16} />
                  Investment: ${totalInvestment}
                </div>
                <div className="stat">
                  Annual Value: ${annualYield}
                </div>
                <div className="stat">
                  Plants: {placedPlants.length}
                </div>
              </div>
            </div>

            <div 
              className="design-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="design-content">
                <div className="design-grid"></div>
                {placedPlants.map(placedPlant => (
                  <PlacedPlantComponent
                    key={placedPlant.id}
                    placedPlant={placedPlant}
                    onRemove={removePlacedPlant}
                    onMove={movePlacedPlant}
                    isSelected={selectedPlacedPlant?.id === placedPlant.id}
                    onClick={() => setSelectedPlacedPlant(placedPlant)}
                    compatibilityIssues={getCompatibilityIssues(placedPlant)}
                  />
                ))}
                
                {placedPlants.length === 0 && (
                  <div className="empty-design">
                    <p>Drag plants from the database to start designing your guild!</p>
                    <p>🌳 Start with a fruit tree, then add supporting plants</p>
                    <p>💡 Scroll/pan this area to see more space • Drag placed plants to move them</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="info-panel">
            {selectedPlant && (
              <div className="plant-details">
                <h3>{selectedPlant.name}</h3>
                <p className="variety">{selectedPlant.variety}</p>
                
                <div className="detail-section">
                  <strong>Hardiness:</strong> {selectedPlant.hardiness}
                </div>
                <div className="detail-section">
                  <strong>Mature Size:</strong> {selectedPlant.matureSize}
                </div>
                <div className="detail-section">
                  <strong>Growing Conditions:</strong>
                  <ul>
                    <li>Sun: {selectedPlant.sunNeeds}</li>
                    <li>Water: {selectedPlant.waterNeeds}</li>
                    <li>Soil: {selectedPlant.soilRequirements}</li>
                  </ul>
                </div>
                
                <div className="detail-section">
                  <strong>Production:</strong>
                  <ul>
                    <li>Yield: {selectedPlant.yieldExpectation}</li>
                    <li>Timeline: {selectedPlant.timeToProduction}</li>
                  </ul>
                </div>

                <div className="detail-section">
                  <strong>Benefits:</strong>
                  <div className="benefits-list">
                    {selectedPlant.guildBenefits.map(benefit => (
                      <span key={benefit} className="benefit-tag">{benefit}</span>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <strong>Minnesota Sources:</strong>
                  <ul>
                    {selectedPlant.mnSources.map(source => (
                      <li key={source}>{source}</li>
                    ))}
                  </ul>
                </div>

                <div className="pros-cons">
                  <div className="pros">
                    <strong>✅ Good Because:</strong>
                    <ul>
                      {selectedPlant.goodBecause.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="cons">
                    <strong>⚠️ Consider:</strong>
                    <ul>
                      {selectedPlant.badBecause.map(item => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedPlacedPlant && (
              <div className="compatibility-info">
                <h3>Compatibility Analysis</h3>
                <div className="placed-plant-info">
                  <strong>{selectedPlacedPlant.plant.name}</strong>
                  <p>Position: {Math.round(selectedPlacedPlant.x/12)}'×{Math.round(selectedPlacedPlant.y/12)}'</p>
                </div>
                
                <div className="compatibility-list">
                  {getCompatibilityIssues(selectedPlacedPlant).map((issue, index) => (
                    <div 
                      key={index} 
                      className={`compatibility-item ${issue.compatibility.type}`}
                    >
                      <div className="compatibility-header">
                        {issue.compatibility.compatible ? 
                          <CheckCircle size={16} /> : 
                          <AlertTriangle size={16} />
                        }
                        <strong>{issue.other.plant.name}</strong>
                      </div>
                      <p>{issue.compatibility.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!selectedPlant && !selectedPlacedPlant && (
              <div className="welcome-info">
                <h3>🌟 Welcome to Guild Designer!</h3>
                <div className="instructions">
                  <h4>How to use:</h4>
                  <ol>
                    <li><strong>Browse plants</strong> in the left panel</li>
                    <li><strong>Click a plant</strong> to see detailed information</li>
                    <li><strong>Drag plants</strong> to the design area to place them</li>
                    <li><strong>🆕 Drag placed plants</strong> to reposition them</li>
                    <li><strong>🆕 Scroll the design area</strong> to see more space</li>
                    <li><strong>Watch for warnings</strong> about spacing and compatibility</li>
                    <li><strong>Click placed plants</strong> for compatibility analysis</li>
                  </ol>
                  
                  <h4>🎯 Quick Start Templates:</h4>
                  <div className="templates">
                    <button 
                      className="template-button"
                      onClick={() => {
                        // Auto-place Classic Apple Guild
                        setPlacedPlants([
                          {
                            plant: MINNESOTA_PLANTS.find(p => p.id === 'apple_prairie_sensation')!,
                            x: 300, y: 200, id: 'apple_center'
                          },
                          {
                            plant: MINNESOTA_PLANTS.find(p => p.id === 'elderberry_adams')!,
                            x: 150, y: 100, id: 'elderberry_north'
                          },
                          {
                            plant: MINNESOTA_PLANTS.find(p => p.id === 'currant_red_lake')!,
                            x: 450, y: 150, id: 'currant_east'
                          }
                        ]);
                      }}
                    >
                      🍎 Classic Apple Guild
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default App;