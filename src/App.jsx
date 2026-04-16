import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PriceList from './pages/PriceList'
import Quotes from './pages/Quotes'
import QuoteBuilder from './pages/QuoteBuilder'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import ProjectTasks from './pages/ProjectTasks'
import Procurement from './pages/Procurement'
import Subcontractors from './pages/Subcontractors'
import WorkLogs from './pages/WorkLogs'
import WorkLogForm from './pages/WorkLogForm'
import ProjectBilling from './pages/ProjectBilling'
import ProjectOverview from './pages/ProjectOverview'
import Tutorial from './pages/Tutorial'

function App() {
  return (
    <Routes>
      {/* טופס יומן עבודה חיצוני */}
      <Route path="/log/:projectId" element={<WorkLogForm />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/price-list" element={<PriceList />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/quote/:id" element={<QuoteBuilder />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/project/:id/tasks" element={<ProjectTasks />} />
        <Route path="/project/:id/procurement" element={<Procurement />} />
        <Route path="/project/:id/subcontractors" element={<Subcontractors />} />
        <Route path="/project/:id/logs" element={<WorkLogs />} />
        <Route path="/project/:id/billing" element={<ProjectBilling />} />
        <Route path="/project/:id/overview" element={<ProjectOverview />} />
      </Route>
    </Routes>
  )
}

export default App
