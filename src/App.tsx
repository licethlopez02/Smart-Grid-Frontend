import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import RequireAuth from './auth/RequireAuth'
import MainLayout from './layouts/MainLayout'
import Account from './pages/account/Account'
import Alerts from './pages/alerts/Alerts'
import Consumption from './pages/consumption/Consumption'
import Home from './pages/home/Home'
import InvoiceDetail from './pages/invoices/InvoiceDetail'
import Invoices from './pages/invoices/Invoices'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import RegisterMeter from './pages/operator/RegisterMeter'
import ConsumptionByZone from './pages/operator/ConsumptionByZone'

/** Redirects "/" based on role: OPERADOR-only → /operator/zones, otherwise stay. */
function HomeRedirect() {
  const { hasRole } = useAuth()
  if (!hasRole('USUARIO') && hasRole('OPERADOR')) {
    return <Navigate to="/operator/zones" replace />
  }
  return <Home />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Any authenticated user */}
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            {/* Account: any authenticated session */}
            <Route path="/account" element={<Account />} />
            <Route path="/" element={<HomeRedirect />} />

            {/* User-only routes */}
            <Route element={<RequireAuth role="USUARIO" />}>
              <Route path="/consumption" element={<Consumption />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
            </Route>

            {/* Operator-only routes */}
            <Route element={<RequireAuth role="OPERADOR" />}>
              <Route path="/operator/meters/new" element={<RegisterMeter />} />
              <Route path="/operator/zones" element={<ConsumptionByZone />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
