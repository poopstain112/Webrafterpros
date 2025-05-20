import React from 'react';

const FullScreenLoader: React.FC = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', padding: '20px', maxWidth: '90%' }}>
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto 20px',
            border: '8px solid #f3f3f3',
            borderTop: '8px solid #3498db',
            borderRadius: '50%',
          }}
          className="animate-spin"
        />
        
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '12px',
          background: 'linear-gradient(to right, #4a90e2, #63b3ed)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Creating Your Website
        </h2>
        
        <p style={{ marginBottom: '20px', color: '#4a5568' }}>
          This typically takes 30-60 seconds. Please wait...
        </p>
        
        <div style={{ 
          width: '100%', 
          height: '6px', 
          backgroundColor: '#f3f3f3',
          borderRadius: '99px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div 
            className="animate-pulse"
            style={{ 
              height: '100%', 
              width: '100%',
              background: 'linear-gradient(to right, #4a90e2, #63b3ed)',
              borderRadius: '99px',
            }}
          />
        </div>
        
        <div style={{ fontSize: '14px', color: '#718096', textAlign: 'left' }}>
          <p className="animate-pulse">Creating responsive layout...</p>
          <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>Optimizing colors and typography...</p>
          <p className="animate-pulse" style={{ animationDelay: '1s' }}>Generating professional content...</p>
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;