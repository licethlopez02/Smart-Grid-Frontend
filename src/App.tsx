import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/home/Home'
import Consumption from './pages/consumption/Consumption'
import Alerts from './pages/alerts/Alerts'
import Invoices from './pages/invoices/Invoices'
import InvoiceDetail from './pages/invoices/InvoiceDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/consumption" element={<Consumption />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App