import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TrafficMap from './pages/TrafficMap'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Heatmap from './pages/Heatmap'
import RouteSuggestion from './pages/RouteSuggestion'
import AuthorityDashboard from './pages/AuthorityDashboard'
import TestPage from './TestPage'
import './App.css'

function App() {
  console.log('App component rendering');
  
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/map" element={<TrafficMap />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/routes" element={<RouteSuggestion />} />
        <Route path="/authority" element={<AuthorityDashboard />} />
      </Routes>
    </Layout>
  )
}

export default App
