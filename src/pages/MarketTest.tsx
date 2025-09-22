import React from 'react';

const MarketTest = () => {
  console.log('MarketTest component rendering...');
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-4">Market Analytics Test</h1>
      <p className="text-muted-foreground mb-4">This is a test component to check if the Market page works.</p>
      <div className="bg-green-100 p-4 rounded-lg">
        <p className="text-green-800">✅ Market component is working!</p>
      </div>
    </div>
  );
};

export default MarketTest;



