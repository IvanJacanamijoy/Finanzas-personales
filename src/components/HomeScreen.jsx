import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mesEstaInicializado, exportarDatos, importarDatos, crearRespaldo, obtenerPrestamosConVencimiento } from '../utils/database';
import { useToast } from '../contexts/ToastContext';

function HomeScreen() {
  const [mesInicializado, setMesInicializado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mostrarModalImportar, setMostrarModalImportar] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [sobreescribir, setSobreescribir] = useState(false);
  const [recordatoriosPrestamos, setRecordatoriosPrestamos] = useState([]);
  const [mostrarRecordatorios, setMostrarRecordatorios] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    verificarInicializacion();
    verificarRecordatoriosPrestamos();
  }, []);

  const verificarInicializacion = async () => {
    try {
      const inicializado = await mesEstaInicializado();
      setMesInicializado(inicializado);
    } catch (error) {
      console.error('Error al verificar inicialización:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarRecordatoriosPrestamos = async () => {
    try {
      const prestamosVencimiento = await obtenerPrestamosConVencimiento();
      if (prestamosVencimiento.length > 0) {
        setRecordatoriosPrestamos(prestamosVencimiento);
        setMostrarRecordatorios(true);
      }
    } catch (error) {
      console.error('Error al verificar recordatorios de préstamos:', error);
    }
  };

  const manejarExportar = async () => {
    try {
      setLoading(true);
      await crearRespaldo(); // Crear respaldo automático antes de exportar
      await exportarDatos();
      showSuccess('¡Datos exportados correctamente!');
    } catch (error) {
      console.error('Error al exportar:', error);
      showError('Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  const manejarSeleccionarArchivo = (event) => {
    const archivo = event.target.files[0];
    setArchivoSeleccionado(archivo);
  };

  const manejarImportar = async () => {
    if (!archivoSeleccionado) {
      showError('Por favor selecciona un archivo');
      return;
    }

    try {
      setLoading(true);
      await crearRespaldo(); // Crear respaldo antes de importar
      const resultado = await importarDatos(archivoSeleccionado, sobreescribir);

      showSuccess(resultado.mensaje);
      setMostrarModalImportar(false);
      setArchivoSeleccionado(null);
      setSobreescribir(false);

      // Recargar la página para reflejar los cambios
      window.location.reload();
    } catch (error) {
      console.error('Error al importar:', error);
      showError(error.message || 'Error al importar los datos');
    } finally {
      setLoading(false);
    }
  };

  const manejarCancelarImportar = () => {
    setMostrarModalImportar(false);
    setArchivoSeleccionado(null);
    setSobreescribir(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="header-gradient text-white py-8 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto md:flex md:flex-row items-center md:justify-between flex-col">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold mb-2">Finanzas Personales</h1>
            <p className="text-primary-100 text-lg">Gestiona tus finanzas de manera inteligente</p>
          </div>

          {/* Botones de Exportar/Importar */}
          <div className="mt-5 md:mt-0 flex flex-col items-center md:items-baseline gap-2">
            <h1 className="text-white text-lg font-bold">Acciones:</h1>
            <div className='flex gap-5'>
              <button
                onClick={manejarExportar}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Exportar datos"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar
              </button>

              <button
                onClick={() => setMostrarModalImportar(true)}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Importar datos"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Importar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        {!mesInicializado ? (
          // Estado no inicializado
          <div className="text-center mb-8">
            <div className="card max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Bienvenido!</h2>
                <p className="text-gray-600 mb-6">
                  Para comenzar a gestionar tus finanzas, primero debes inicializar el mes actual con tus ingresos.
                </p>
              </div>
              <Link
                to="/iniciar-mes"
                className="btn-primary w-full text-lg"
              >
                Inicializar Mes
              </Link>
            </div>
          </div>
        ) : (
          // Estado inicializado - Dashboard principal
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Financiero</h2>
              <p className="text-gray-600">Accede a todas las funciones de gestión financiera</p>
            </div>

            {/* Grid de opciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 box-border">
              {/* Gestionar Ingresos */}
              <Link to="/iniciar-mes" className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer group py-2 px-4 rounded-lg block mx-auto md:w-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-success-200 transition-colors">
                    <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-success-700 transition-colors">Gestionar Ingresos</h3>
                    <p className="text-gray-600 text-sm">Administra tus fuentes de ingresos</p>
                  </div>
                </div>
                <div className="flex items-center text-primary-600 font-medium">
                  <span>Ver detalles</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Gestionar Activos */}
              <Link to="/activos" className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer group py-2 px-4 rounded-lg block mx-auto md:w-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-700 transition-colors">Gestionar Activos</h3>
                    <p className="text-gray-600 text-sm">Registra tus bienes y propiedades</p>
                  </div>
                </div>
                <div className="flex items-center text-primary-600 font-medium">
                  <span>Ver detalles</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Gestionar Pasivos */}
              <Link to="/pasivos" className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer group py-2 px-4 rounded-lg block mx-auto md:w-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-700 transition-colors">Gestionar Pasivos</h3>
                    <p className="text-gray-600 text-sm">Controla tus deudas y obligaciones</p>
                  </div>
                </div>
                <div className="flex items-center text-primary-600 font-medium">
                  <span>Ver detalles</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Ver Reportes */}
              <Link to="/reportes" className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer group py-2 px-4 rounded-lg block mx-auto md:w-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-success-200 transition-colors">
                    <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-success-700 transition-colors">Ver Reportes</h3>
                    <p className="text-gray-600 text-sm">Analiza tu situación financiera</p>
                  </div>
                </div>
                <div className="flex items-center text-primary-600 font-medium">
                  <span>Ver detalles</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>

            {/* Call to action */}
            <div className="card bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Necesitas ayuda?</h3>
                <p className="text-gray-600 mb-4">
                  Comienza registrando tus ingresos, luego añade tus activos y pasivos para obtener un panorama completo de tu situación financiera.
                </p>
                <Link
                  to="/reportes"
                  className="btn-primary"
                >
                  Ver Resumen Financiero
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Importar */}
      {mostrarModalImportar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Importar Datos</h3>
                <button
                  onClick={manejarCancelarImportar}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar archivo JSON
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={manejarSeleccionarArchivo}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {archivoSeleccionado && (
                    <p className="text-sm text-gray-600 mt-1">
                      Archivo seleccionado: {archivoSeleccionado.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sobreescribir"
                    checked={sobreescribir}
                    onChange={(e) => setSobreescribir(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sobreescribir" className="ml-2 text-sm text-gray-700">
                    Reemplazar todos los datos existentes
                  </label>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-800">
                        <strong>Importante:</strong> Se creará un respaldo automático antes de importar.
                        {sobreescribir
                          ? " Todos los datos actuales serán reemplazados."
                          : " Los datos se fusionarán con los existentes."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={manejarCancelarImportar}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={manejarImportar}
                  disabled={!archivoSeleccionado || loading}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Importando...' : 'Importar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recordatorios de Préstamos */}
      {mostrarRecordatorios && recordatoriosPrestamos.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Recordatorios de Préstamos</h2>
                  <p className="text-gray-600 mt-1">
                    Tienes {recordatoriosPrestamos.length} préstamo(s) que requieren tu atención.
                  </p>
                </div>
                <button
                  onClick={() => setMostrarRecordatorios(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {recordatoriosPrestamos.map((prestamo) => {
                  const diasVencimiento = Math.ceil((new Date(prestamo.fechaDevolucion) - new Date()) / (1000 * 60 * 60 * 24));
                  const esVencido = diasVencimiento < 0;
                  const esPorVencer = diasVencimiento >= 0 && diasVencimiento <= prestamo.diasRecordatorio;
                  
                  return (
                    <div 
                      key={prestamo.id} 
                      className={`p-4 rounded-lg border ${
                        esVencido 
                          ? 'bg-red-50 border-red-200' 
                          : esPorVencer 
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-800">{prestamo.persona}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              esVencido 
                                ? 'bg-red-100 text-red-800' 
                                : esPorVencer 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {esVencido 
                                ? `Vencido hace ${Math.abs(diasVencimiento)} días` 
                                : esPorVencer 
                                  ? `Vence en ${diasVencimiento} días`
                                  : 'Próximo a vencer'
                              }
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Concepto:</span> {prestamo.concepto}</p>
                            <p><span className="font-medium">Monto prestado:</span> {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(prestamo.montoPrestado)}</p>
                            <p><span className="font-medium">Monto a recibir:</span> {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(prestamo.montoARecibir)}</p>
                            <p><span className="font-medium">Monto pagado:</span> {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(prestamo.montoPagado)}</p>
                            <p><span className="font-medium">Pendiente:</span> {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0
                            }).format(prestamo.montoARecibir - prestamo.montoPagado)}</p>
                            <p><span className="font-medium">Fecha de devolución:</span> {new Date(prestamo.fechaDevolucion).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="w-5 h-5 text-blue-600 mr-3 mt-0.5">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Información</h3>
                    <p className="text-sm text-blue-700">
                      Puedes gestionar estos préstamos desde la sección de Activos. 
                      Allí podrás registrar pagos, editar información o eliminar préstamos según sea necesario.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarRecordatorios(false)}
                  className="btn-secondary flex-1"
                >
                  Cerrar
                </button>
                <Link
                  to="/activos"
                  onClick={() => setMostrarRecordatorios(false)}
                  className="btn-primary flex-1 text-center"
                >
                  Gestionar Préstamos
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeScreen;