import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Login from './pages/Login'
// Homeowner (dark, mobile PWA)
import OwnerHome from './pages/OwnerHome'
import OwnerVisits from './pages/OwnerVisits'
import ReportView from './pages/ReportView'
import RequestConcierge from './pages/RequestConcierge'
import OwnerDocuments from './pages/OwnerDocuments'
import OwnerExperts from './pages/OwnerExperts'
import Account from './pages/Account'
// Pro (light dashboard)
import Dashboard from './pro/Dashboard'
import Clients from './pro/Clients'
import Properties from './pro/Properties'
import PropertyDetail from './pro/PropertyDetail'
import PropertyForm from './pro/PropertyForm'
import InviteClient from './pro/InviteClient'
import Experts from './pro/Experts'
import Visits from './pro/Visits'
import Inspection from './pro/Inspection'
import Requests from './pro/Requests'
import Settings from './pro/Settings'

export default function App() {
  const { user } = useAuth()

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  if (user.role === 'pro') {
    return (
      <Routes>
        <Route path="/pro" element={<Dashboard />} />
        <Route path="/pro/clients" element={<Clients />} />
        <Route path="/pro/properties" element={<Properties />} />
        <Route path="/pro/properties/new" element={<PropertyForm />} />
        <Route path="/pro/properties/:id" element={<PropertyDetail />} />
        <Route path="/pro/properties/:id/edit" element={<PropertyForm />} />
        <Route path="/pro/properties/:id/invite" element={<InviteClient />} />
        <Route path="/pro/experts" element={<Experts />} />
        <Route path="/pro/visits" element={<Visits />} />
        <Route path="/pro/visits/:id" element={<Inspection />} />
        <Route path="/pro/requests" element={<Requests />} />
        <Route path="/pro/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/pro" replace />} />
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
      <Route path="/owner/documents" element={<OwnerDocuments />} />
      <Route path="/owner/experts" element={<OwnerExperts />} />
      <Route path="/owner/account" element={<Account />} />
      <Route path="*" element={<Navigate to="/owner" replace />} />
    </Routes>
  )
}
