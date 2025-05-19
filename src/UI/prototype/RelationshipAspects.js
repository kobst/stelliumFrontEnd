import React from 'react';

const RelationshipAspects = ({ debugInfo, userA, userB }) => {
  if (!debugInfo || !debugInfo.categories) {
    return null;
  }

  const renderAspectList = (aspects, title) => {
    if (!aspects || aspects.length === 0) return null;
    
    return (
      <div className="aspect-list">
        <h4>{title}</h4>
        <ul>
          {aspects.map((aspect, index) => (
            <li key={index}>
              {aspect.aspect} 
              {aspect.scoreType && <span className={aspect.scoreType}> ({aspect.scoreType})</span>}
              {!aspect.scoreType && aspect.score > 0 && <span className="positive"> (positive)</span>}
              {!aspect.scoreType && aspect.score < 0 && <span className="negative"> (negative)</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="relationship-aspects">
      <h3>Relationship Aspects</h3>
      
      {Object.entries(debugInfo.categories).map(([category, data]) => (
        <div key={category} className="category-aspects">
          <h3>{category.replace(/_/g, ' ')}</h3>
          
          {data.synastry && renderAspectList(data.synastry.matchedAspects, "Synastry Aspects")}
          {data.composite && renderAspectList(data.composite.matchedAspects, "Composite Aspects")}
          
          {data.synastryHousePlacements && (
            <>
              {renderAspectList(data.synastryHousePlacements.AinB, `${userA?.firstName}'s Planets in ${userB?.firstName}'s Houses`)}
              {renderAspectList(data.synastryHousePlacements.BinA, `${userB?.firstName}'s Planets in ${userA?.firstName}'s Houses`)}
            </>
          )}
          
          {data.compositeHousePlacements && renderAspectList(data.compositeHousePlacements, "Composite House Placements")}
        </div>
      ))}
    </div>
  );
};

export default RelationshipAspects;