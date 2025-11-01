import { useState, useEffect } from 'react';

interface HealthResponse {
  status: string;
  [key: string]: any;
}

export const BackendTest = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/actuator/health');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    checkBackend();
    
    // Poll every 5 seconds
    const interval = setInterval(checkBackend, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #ddd', 
      borderRadius: '8px',
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔌 Backend Connection Test</h3>
      
      {loading && <p>⏳ Connecting to backend...</p>}
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828',
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      
      {health && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f5e9', 
          color: '#2e7d32',
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <strong>✅ Backend Status:</strong> {health.status}
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              View Full Response
            </summary>
            <pre style={{ 
              marginTop: '10px', 
              padding: '10px',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(health, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Endpoint:</strong> http://localhost:8080/actuator/health<br/>
        <strong>Auto-refresh:</strong> Every 5 seconds
      </div>
    </div>
  );
};
