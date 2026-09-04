import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import TrafficMap from './pages/TrafficMap'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Heatmap from './pages/Heatmap'
import RouteSuggestion from './pages/RouteSuggestion'
import AuthorityDashboard from './pages/AuthorityDashboard'
import AuthorityLogin from './pages/AuthorityLogin'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/authority-login" element={<AuthorityLogin />} />
      <Route
        path="*"
        element={
          <Layout>
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/map"       element={<TrafficMap />} />
              <Route path="/heatmap"   element={<Heatmap />} />
              <Route path="/reports"   element={<Reports />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/routes"    element={<RouteSuggestion />} />
              <Route
                path="/authority"
                element={
                  <ProtectedRoute>
                    <AuthorityDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  )
}

export default App
