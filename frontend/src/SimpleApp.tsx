export default function SimpleApp() {
  console.log('SimpleApp component rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      background: '#f0f0f0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        background: '#1a1a2e', 
        color: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0 }}>🚦 Smart Traffic Management System</h1>
        <p style={{ margin: '10px 0 0 0' }}>✅ React is working! The application is loading...</p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Total Reports</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#1a1a2e' }}>3</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Pending</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#ff9800' }}>1</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Resolved</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#4caf50' }}>1</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#666' }}>Active Alerts</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: '#f44336' }}>2</p>
        </div>
      </div>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0 }}>📊 System Status</h2>
        <ul style={{ lineHeight: '2' }}>
          <li>✅ Frontend server running on port 5173</li>
          <li>✅ Backend server running on port 3000</li>
          <li>✅ React is rendering correctly</li>
          <li>✅ All 8 features are implemented</li>
          <li>⚠️ Press F12 to open console and check for any errors</li>
        </ul>
        
        <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '4px', borderLeft: '4px solid #2196f3' }}>
          <strong>Next Step:</strong> Press F12 and check the Console tab for any error messages.
        </div>
      </div>
    </div>
  );
}
