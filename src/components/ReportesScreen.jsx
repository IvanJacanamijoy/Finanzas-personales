import React, { useState, useEffect } from 'react';
import { 
  obtenerDatosMes, 
  obtenerReportesHistoricos, 
  obtenerReportePorMes, 
  obtenerDatosMesPorId, 
  generarYGuardarReporteMensual,
  obtenerComparativaMeses,
  obtenerTendenciasMeses
} from '../utils/database';
import { Link, useNavigate } from 'react-router-dom';

function ReportesScreen() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState({
    ingresos: [],
    activos: [],
    pasivos: []
  });
  const [mesSeleccionado, setMesSeleccionado] = useState('');
  const [mesesDisponibles, setMesesDisponibles] = useState([]);
  const [reporteHistorico, setReporteHistorico] = useState(null);
  const [vistaActual, setVistaActual] = useState('actual');
  const [comparativa, setComparativa] = useState(null);
  const [tendencias, setTendencias] = useState(null);
  const [mesComparacion, setMesComparacion] = useState('');

  useEffect(() => {
    cargarDatos();
    cargarMesesDisponibles();
  }, []);

  useEffect(() => {
    if (mesSeleccionado && vistaActual === 'historico') {
      cargarReporteHistorico();
    }
  }, [mesSeleccionado, vistaActual]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const datosMes = await obtenerDatosMes();
      setDatos(datosMes);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarMesesDisponibles = async () => {
    try {
      const reportes = await obtenerReportesHistoricos();
      const meses = Object.keys(reportes).sort((a, b) => b.localeCompare(a));
      setMesesDisponibles(meses);
    } catch (error) {
      console.error('Error al cargar meses disponibles:', error);
    }
  };

  const cargarReporteHistorico = async () => {
    if (!mesSeleccionado) return;
    
    try {
      setCargando(true);
      const reporte = await obtenerReportePorMes(mesSeleccionado);
      setReporteHistorico(reporte);
    } catch (error) {
      console.error('Error al cargar reporte histórico:', error);
    } finally {
      setCargando(false);
    }
  };

  const generarReporteActual = async () => {
    try {
      setCargando(true);
      await generarYGuardarReporteMensual();
      await cargarMesesDisponibles();
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setCargando(false);
    }
  };

  const cambiarVista = (vista) => {
    setVistaActual(vista);
    setComparativa(null);
    setTendencias(null);
    setReporteHistorico(null);
  };

  const generarComparativa = async () => {
    if (!mesSeleccionado || !mesComparacion) return;
    
    try {
      setCargando(true);
      const comparativaData = await obtenerComparativaMeses(mesSeleccionado, mesComparacion);
      setComparativa(comparativaData);
    } catch (error) {
      console.error('Error al generar comparativa:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarTendencias = async () => {
    try {
      setCargando(true);
      const tendenciasData = await obtenerTendenciasMeses(6);
      setTendencias(tendenciasData);
    } catch (error) {
      console.error('Error al cargar tendencias:', error);
    } finally {
      setCargando(false);
    }
  };

  const calcularTotalIngresos = () => {
    return datos.ingresos.reduce((total, ingreso) => total + ingreso.monto, 0);
  };

  const calcularTotalActivos = () => {
    return datos.activos.reduce((total, activo) => total + activo.valor, 0);
  };

  const calcularTotalPasivos = () => {
    return datos.pasivos.reduce((total, pasivo) => total + pasivo.valor, 0);
  };

  const calcularPatrimonioNeto = () => {
    return calcularTotalActivos() - calcularTotalPasivos();
  };

  const calcularLiquidezDisponible = () => {
    const activosLiquidos = datos.activos
      .filter(activo => activo.tipo === 'efectivo' || activo.tipo === 'cuenta_bancaria')
      .reduce((total, activo) => total + activo.valor, 0);
    return activosLiquidos;
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const hayDatos = datos.ingresos.length > 0 || datos.activos.length > 0 || datos.pasivos.length > 0;

  function renderReporteActual() {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg mr-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Resumen Ejecutivo</h2>
                <p className="text-gray-600">{new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="metric-card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
              <h3 className="text-sm font-medium text-primary-800 mb-2">Total Ingresos</h3>
              <p className="text-2xl font-bold text-primary-900">{formatearMoneda(calcularTotalIngresos())}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-success-50 to-success-100 border-success-200">
              <h3 className="text-sm font-medium text-success-800 mb-2">Activos Totales</h3>
              <p className="text-2xl font-bold text-success-900">{formatearMoneda(calcularTotalActivos())}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <h3 className="text-sm font-medium text-red-800 mb-2">Pasivos Totales</h3>
              <p className="text-2xl font-bold text-red-900">{formatearMoneda(calcularTotalPasivos())}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Patrimonio Neto</h3>
              <p className="text-2xl font-bold text-blue-900">{formatearMoneda(calcularPatrimonioNeto())}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Liquidez Disponible</h3>
              <p className="text-2xl font-bold text-purple-900">{formatearMoneda(calcularLiquidezDisponible())}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderReporteHistorico() {
    if (!reporteHistorico) return null;

    const { resumen, analisis } = reporteHistorico;

    return (
      <div className="space-y-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg mr-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Resumen Ejecutivo</h2>
                <p className="text-gray-600">{new Date(mesSeleccionado + '-01').toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="metric-card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
              <h3 className="text-sm font-medium text-primary-800 mb-2">Total Ingresos</h3>
              <p className="text-2xl font-bold text-primary-900">{formatearMoneda(resumen.totalIngresos)}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-success-50 to-success-100 border-success-200">
              <h3 className="text-sm font-medium text-success-800 mb-2">Activos Totales</h3>
              <p className="text-2xl font-bold text-success-900">{formatearMoneda(resumen.totalActivos)}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <h3 className="text-sm font-medium text-red-800 mb-2">Pasivos Totales</h3>
              <p className="text-2xl font-bold text-red-900">{formatearMoneda(resumen.totalPasivos)}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Patrimonio Neto</h3>
              <p className="text-2xl font-bold text-blue-900">{formatearMoneda(resumen.patrimonioNeto)}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Liquidez Disponible</h3>
              <p className="text-2xl font-bold text-purple-900">{formatearMoneda(resumen.liquidezDisponible)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Análisis Financiero</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Situación Patrimonial</h4>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                analisis.situacionPatrimonial === 'Positiva' 
                  ? 'bg-success-100 text-success-800' 
                  : analisis.situacionPatrimonial === 'Neutral'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {analisis.situacionPatrimonial}
              </div>
              <p className="text-sm text-gray-600">
                {analisis.situacionPatrimonial === 'Positiva' 
                  ? 'Tus activos superan significativamente a tus pasivos.'
                  : analisis.situacionPatrimonial === 'Neutral'
                  ? 'Tus activos y pasivos están equilibrados.'
                  : 'Tus pasivos superan a tus activos, considera reducir deudas.'
                }
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Liquidez</h4>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                analisis.nivelLiquidez === 'Alta' 
                  ? 'bg-success-100 text-success-800' 
                  : analisis.nivelLiquidez === 'Media'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {analisis.nivelLiquidez}
              </div>
              <p className="text-sm text-gray-600">
                {analisis.nivelLiquidez === 'Alta' 
                  ? 'Excelente capacidad para cubrir gastos inmediatos.'
                  : analisis.nivelLiquidez === 'Media'
                  ? 'Liquidez adecuada, considera aumentar reservas.'
                  : 'Liquidez baja, es importante aumentar efectivo disponible.'
                }
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Endeudamiento</h4>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                analisis.nivelEndeudamiento === 'Bajo' 
                  ? 'bg-success-100 text-success-800' 
                  : analisis.nivelEndeudamiento === 'Moderado'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {analisis.nivelEndeudamiento}
              </div>
              <p className="text-sm text-gray-600">
                {analisis.nivelEndeudamiento === 'Bajo' 
                  ? 'Nivel de deuda saludable, tienes capacidad de endeudamiento.'
                  : analisis.nivelEndeudamiento === 'Moderado'
                  ? 'Nivel de deuda moderado, mantén control sobre nuevas obligaciones.'
                  : 'Nivel de deuda alto, considera estrategias de reducción de pasivos.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderComparativa() {
    if (!comparativa) return null;

    const { mes1, mes2, diferencias, porcentajes } = comparativa;

    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Comparativa Mensual</h2>
            <p className="text-gray-600">
              {new Date(mes1.periodo + '-01').toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })} vs {' '}
              {new Date(mes2.periodo + '-01').toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="metric-card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
              <h3 className="text-sm font-medium text-primary-800 mb-2">Ingresos</h3>
              <div className="space-y-1">
                <p className="text-lg font-bold text-primary-900">{formatearMoneda(mes2.resumen.totalIngresos)}</p>
                <div className={`flex items-center text-sm ${diferencias.ingresos >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  <svg className={`w-4 h-4 mr-1 ${diferencias.ingresos >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {Math.abs(porcentajes.ingresos).toFixed(1)}% ({formatearMoneda(Math.abs(diferencias.ingresos))})
                </div>
              </div>
            </div>

            <div className="metric-card bg-gradient-to-r from-success-50 to-success-100 border-success-200">
              <h3 className="text-sm font-medium text-success-800 mb-2">Activos</h3>
              <div className="space-y-1">
                <p className="text-lg font-bold text-success-900">{formatearMoneda(mes2.resumen.totalActivos)}</p>
                <div className={`flex items-center text-sm ${diferencias.activos >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  <svg className={`w-4 h-4 mr-1 ${diferencias.activos >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {Math.abs(porcentajes.activos).toFixed(1)}% ({formatearMoneda(Math.abs(diferencias.activos))})
                </div>
              </div>
            </div>

            <div className="metric-card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <h3 className="text-sm font-medium text-red-800 mb-2">Pasivos</h3>
              <div className="space-y-1">
                <p className="text-lg font-bold text-red-900">{formatearMoneda(mes2.resumen.totalPasivos)}</p>
                <div className={`flex items-center text-sm ${diferencias.pasivos <= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  <svg className={`w-4 h-4 mr-1 ${diferencias.pasivos <= 0 ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {Math.abs(porcentajes.pasivos).toFixed(1)}% ({formatearMoneda(Math.abs(diferencias.pasivos))})
                </div>
              </div>
            </div>

            <div className="metric-card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Patrimonio Neto</h3>
              <div className="space-y-1">
                <p className="text-lg font-bold text-blue-900">{formatearMoneda(mes2.resumen.patrimonioNeto)}</p>
                <div className={`flex items-center text-sm ${diferencias.patrimonioNeto >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  <svg className={`w-4 h-4 mr-1 ${diferencias.patrimonioNeto >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {Math.abs(porcentajes.patrimonioNeto).toFixed(1)}% ({formatearMoneda(Math.abs(diferencias.patrimonioNeto))})
                </div>
              </div>
            </div>

            <div className="metric-card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Liquidez</h3>
              <div className="space-y-1">
                <p className="text-lg font-bold text-purple-900">{formatearMoneda(mes2.resumen.liquidezDisponible)}</p>
                <div className={`flex items-center text-sm ${diferencias.liquidez >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                  <svg className={`w-4 h-4 mr-1 ${diferencias.liquidez >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {Math.abs(porcentajes.liquidez).toFixed(1)}% ({formatearMoneda(Math.abs(diferencias.liquidez))})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderTendencias() {
    if (!tendencias) return null;

    const { meses, ingresos, activos, pasivos, patrimonioNeto, liquidez, promedios } = tendencias;

    return (
      <div className="space-y-6">
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Análisis de Tendencias</h2>
            <p className="text-gray-600">Últimos {meses.length} meses</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="metric-card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
              <h3 className="text-sm font-medium text-primary-800 mb-2">Promedio Ingresos</h3>
              <p className="text-lg font-bold text-primary-900">{formatearMoneda(promedios.ingresos)}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-success-50 to-success-100 border-success-200">
              <h3 className="text-sm font-medium text-success-800 mb-2">Promedio Activos</h3>
              <p className="text-lg font-bold text-success-900">{formatearMoneda(promedios.activos)}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <h3 className="text-sm font-medium text-red-800 mb-2">Promedio Pasivos</h3>
              <p className="text-lg font-bold text-red-900">{formatearMoneda(promedios.pasivos)}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Promedio Patrimonio</h3>
              <p className="text-lg font-bold text-blue-900">{formatearMoneda(promedios.patrimonioNeto)}</p>
            </div>
            <div className="metric-card bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <h3 className="text-sm font-medium text-purple-800 mb-2">Promedio Liquidez</h3>
              <p className="text-lg font-bold text-purple-900">{formatearMoneda(promedios.liquidez)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mes</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Ingresos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Activos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Pasivos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Patrimonio</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Liquidez</th>
                </tr>
              </thead>
              <tbody>
                {meses.map((mes, index) => (
                  <tr key={mes} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {new Date(mes + '-01').toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatearMoneda(ingresos[index])}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatearMoneda(activos[index])}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatearMoneda(pasivos[index])}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatearMoneda(patrimonioNeto[index])}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatearMoneda(liquidez[index])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Reportes Financieros</h1>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              ← Volver al Home
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => cambiarVista('actual')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActual === 'actual'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Mes Actual
            </button>
            <button
              onClick={() => cambiarVista('historico')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActual === 'historico'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Reportes Históricos
            </button>
            <button
              onClick={() => cambiarVista('comparativa')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActual === 'comparativa'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Comparar Meses
            </button>
            <button
              onClick={() => cambiarVista('tendencias')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActual === 'tendencias'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Tendencias
            </button>
          </div>

          {vistaActual === 'actual' && (
            <button
              onClick={generarReporteActual}
              className="btn-primary mb-4"
              disabled={cargando}
            >
              {cargando ? 'Generando...' : 'Generar Reporte'}
            </button>
          )}

          {vistaActual === 'historico' && mesesDisponibles.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar mes:
              </label>
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="input-field max-w-xs"
              >
                <option value="">Selecciona un mes...</option>
                {mesesDisponibles.map(mes => (
                  <option key={mes} value={mes}>
                    {new Date(mes + '-01').toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {vistaActual === 'comparativa' && (
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primer mes:
                </label>
                <select
                  value={mesSeleccionado}
                  onChange={(e) => setMesSeleccionado(e.target.value)}
                  className="input-field"
                >
                  <option value="">Selecciona primer mes...</option>
                  {mesesDisponibles.map(mes => (
                    <option key={mes} value={mes}>
                      {new Date(mes + '-01').toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segundo mes:
                </label>
                <select
                  value={mesComparacion}
                  onChange={(e) => setMesComparacion(e.target.value)}
                  className="input-field"
                >
                  <option value="">Selecciona segundo mes...</option>
                  {mesesDisponibles.map(mes => (
                    <option key={mes} value={mes}>
                      {new Date(mes + '-01').toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              {mesSeleccionado && mesComparacion && mesSeleccionado !== mesComparacion && (
                <div className="flex items-end">
                  <button
                    onClick={generarComparativa}
                    className="btn-primary"
                  >
                    Comparar
                  </button>
                </div>
              )}
            </div>
          )}

          {vistaActual === 'tendencias' && (
            <div className="mb-4">
              <button
                onClick={cargarTendencias}
                className="btn-primary"
                disabled={cargando}
              >
                {cargando ? 'Cargando...' : 'Cargar Tendencias'}
              </button>
            </div>
          )}
        </div>

        {cargando ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {vistaActual === 'historico' && mesesDisponibles.length === 0 && (
              <div className="card text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">No hay reportes históricos</h3>
                <p className="text-gray-600 mb-6">Genera tu primer reporte mensual para comenzar a ver el historial.</p>
                <button
                  onClick={generarReporteActual}
                  className="btn-primary"
                >
                  Generar Primer Reporte
                </button>
              </div>
            )}

            {vistaActual === 'actual' && !hayDatos && (
              <div className="card text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Sin datos para mostrar</h3>
                <p className="text-gray-600 mb-6">Para generar reportes, necesitas registrar ingresos y agregar activos.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/iniciar-mes')}
                    className="btn-primary"
                  >
                    Registrar Ingresos
                  </button>
                  <button
                    onClick={() => navigate('/activos')}
                    className="btn-secondary"
                  >
                    Agregar Activos
                  </button>
                </div>
              </div>
            )}

            {vistaActual === 'actual' && hayDatos && renderReporteActual()}
            {vistaActual === 'historico' && reporteHistorico && renderReporteHistorico()}
            {vistaActual === 'comparativa' && comparativa && renderComparativa()}
            {vistaActual === 'tendencias' && tendencias && renderTendencias()}
          </>
        )}
      </div>
    </div>
  );
}

export default ReportesScreen;