import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/consumption" element={<Consumption />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App