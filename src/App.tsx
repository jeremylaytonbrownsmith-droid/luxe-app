import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Login from './pages/Login'
import OwnerHome from './pages/OwnerHome'
import OwnerVisits from './pages/OwnerVisits'
import ReportView from './pages/ReportView'
import RequestConcierge from './pages/RequestConcierge'
import Account from './pages/Account'
import OperatorHome from './pages/OperatorHome'
import OperatorRequests from './pages/OperatorRequests'
import Inspection from './pages/Inspection'

export default function App() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  if (user.role === 'operator') {
    return (
      <Routes>
        <Route path="/operator" element={<OperatorHome />} />
        <Route path="/operator/requests" element={<OperatorRequests />} />
        <Route path="/operator/account" element={<Account />} />
        <Route path="/operator/visit/:id" element={<Inspection />} />
        <Route path="*" element={<Navigate to="/operator" replace />} />
      </Routes>
    )
  }

  // owner
  return (
    <Routes>
      <Route path="/owner" element={<OwnerHome />} />
      <Route path="/owner/visits" element={<OwnerVisits />} />
      <Route path="/owner/report/:id" element={<ReportView />} />
      <Route path="/owner/request" element={<RequestConcierge />} />
      <Route path="/owner/account" element={<Account />} />
      <Route path="*" element={<Navigate to="/owner" replace />} />
    </Routes>
  )
}
