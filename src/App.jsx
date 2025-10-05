import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Importar componentes de pantallas
import HomeScreen from './components/HomeScreen.jsx';
import IniciarMesScreen from './components/IniciarMesScreen.jsx';
import ActivosScreen from './components/ActivosScreen.jsx';
import PasivosScreen from './components/PasivosScreen.jsx';
import ReportesScreen from './components/ReportesScreen.jsx';
import CuentasPorCobrarScreen from './components/CuentasPorCobrarScreen.jsx';
import NavBar from './components/NavBar.jsx';

// Importar contexto de Toast
import { ToastProvider } from './contexts/ToastContext.jsx';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <NavBar />
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/iniciar-mes" element={<IniciarMesScreen />} />
            <Route path="/activos" element={<ActivosScreen />} />
            <Route path="/pasivos" element={<PasivosScreen />} />
            <Route path="/cuentas-por-cobrar" element={<CuentasPorCobrarScreen />} />
            <Route path="/reportes" element={<ReportesScreen />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;