import React from 'react';

const EnvTest = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      borderRadius: '8px',
      margin: '20px'
    }}>
      <h2>Environment Variables Test</h2>
      <div style={{ marginTop: '10px' }}>
        <p>TMDB API Key: {import.meta.env.VITE_TMDB_API_KEY ? '✅ Present' : '❌ Missing'}</p>
        <p>Appwrite Project ID: {import.meta.env.VITE_APPWRITE_PROJECT_ID ? '✅ Present' : '❌ Missing'}</p>
        <p>Appwrite Database ID: {import.meta.env.VITE_APPWRITE_DATABASE_ID ? '✅ Present' : '❌ Missing'}</p>
        <p>Appwrite Collection ID: {import.meta.env.VITE_APPWRITE_COLLECTION_ID ? '✅ Present' : '❌ Missing'}</p>
      </div>
    </div>
  );
};

export default EnvTest; 