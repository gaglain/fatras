import React from 'react';

const App = () => {
  console.log('🚀 Super minimal App starting...');
  
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: '#333', 
        marginBottom: '20px',
        fontSize: '32px'
      }}>
        ✅ Application Chargée
      </h1>
      <p style={{ 
        color: '#666', 
        fontSize: '18px',
        marginBottom: '30px'
      }}>
        Si vous voyez ce texte, React fonctionne correctement.
      </p>
      <div style={{ 
        background: '#e7f5e7', 
        border: '2px solid #22c55e', 
        borderRadius: '8px', 
        padding: '20px',
        maxWidth: '500px'
      }}>
        <strong style={{ color: '#16a34a' }}>
          Diagnostic: Application React OK
        </strong>
        <br />
        <small>Timestamp: {new Date().toLocaleTimeString()}</small>
      </div>
    </div>
  );
};

export default App;