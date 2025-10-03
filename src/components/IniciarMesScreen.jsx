import React, { useState, useEffect } from 'react';
import { inicializarMes, insertarIngreso, obtenerDatosMes, mesEstaInicializado, editarIngreso, eliminarIngreso } from '../utils/database';
import { useToast } from '../contexts/ToastContext';
import { formatearNumeroConSeparadores, removerSeparadores, convertirANumero } from '../utils/formatters';

function IniciarMesScreen() {
  const [montoIngreso, setMontoIngreso] = useState('');
  const [montoIngresoDisplay, setMontoIngresoDisplay] = useState('');
  const [descripcionIngreso, setDescripcionIngreso] = useState('');
  const [loading, setLoading] = useState(false);
  const [ingresos, setIngresos] = useState([]);
  const [mesYaInicializado, setMesYaInicializado] = useState(false);
  const [editandoIngreso, setEditandoIngreso] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const inicializado = await mesEstaInicializado();
      setMesYaInicializado(inicializado);
      
      if (inicializado) {
        const datos = await obtenerDatosMes();
        setIngresos(datos.ingresos || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const manejarCambioMonto = (e) => {
    const inputValue = e.target.value;
    const numeroLimpio = removerSeparadores(inputValue);
    
    setMontoIngreso(numeroLimpio);
    setMontoIngresoDisplay(formatearNumeroConSeparadores(numeroLimpio));
  };

  const manejarInicializarMes = async () => {
    if (!montoIngreso || !descripcionIngreso) {
      showError('Por favor, completa todos los campos');
      return;
    }

    const monto = parseFloat(montoIngreso);
    if (isNaN(monto) || monto <= 0) {
      showError('Por favor, ingresa un monto válido');
      return;
    }

    try {
      setLoading(true);
      await inicializarMes(monto, descripcionIngreso);
      await cargarDatos();
      setMontoIngreso('');
      setMontoIngresoDisplay('');
      setDescripcionIngreso('');
      showSuccess('¡Mes inicializado correctamente!');
    } catch (error) {
      console.error('Error al inicializar mes:', error);
      showError('Error al inicializar el mes');
    } finally {
      setLoading(false);
    }
  };

  const manejarAgregarIngreso = async () => {
    if (!montoIngreso || !descripcionIngreso) {
      showError('Por favor, completa todos los campos');
      return;
    }

    const monto = parseFloat(montoIngreso);
    if (isNaN(monto) || monto <= 0) {
      showError('Por favor, ingresa un monto válido');
      return;
    }

    try {
      setLoading(true);
      if (editandoIngreso) {
        // Editar ingreso existente
        await editarIngreso(editandoIngreso.id, descripcionIngreso, monto);
        showSuccess('¡Ingreso actualizado correctamente!');
        setEditandoIngreso(null);
      } else {
        // Agregar nuevo ingreso
        await insertarIngreso(descripcionIngreso, monto);
        showSuccess('¡Ingreso agregado correctamente!');
      }
      
      await cargarDatos();
      setMontoIngreso('');
      setMontoIngresoDisplay('');
      setDescripcionIngreso('');
    } catch (error) {
      console.error('Error al procesar ingreso:', error);
      showError(editandoIngreso ? 'Error al actualizar el ingreso' : 'Error al agregar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  const manejarEditarIngreso = (ingreso) => {
    setEditandoIngreso(ingreso);
    setDescripcionIngreso(ingreso.descripcion);
    setMontoIngreso(ingreso.valor.toString());
    setMontoIngresoDisplay(formatearNumeroConSeparadores(ingreso.valor.toString()));
  };

  const manejarCancelarEdicion = () => {
    setEditandoIngreso(null);
    setDescripcionIngreso('');
    setMontoIngreso('');
    setMontoIngresoDisplay('');
  };

  const manejarEliminarIngreso = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este ingreso?')) {
      return;
    }

    setLoading(true);
    try {
      await eliminarIngreso(id);
      showSuccess('¡Ingreso eliminado correctamente!');
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar ingreso:', error);
      showError('Error al eliminar el ingreso');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalIngresos = () => {
    return ingresos.reduce((total, ingreso) => total + ingreso.valor, 0);
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  if (loading && !mesYaInicializado) {
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
      <div className="header-gradient text-white py-6 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-white">
              {mesYaInicializado ? 'Gestionar Ingresos' : 'Inicializar Mes'}
            </h1>
            <p className="text-primary-200 text-white">
              {mesYaInicializado ? 'Administra tus fuentes de ingresos' : 'Configura tu ingreso principal para comenzar'}
            </p>
          </div>
          <button
            onClick={() => navigation.navigate('/')}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {editandoIngreso ? 'Editar Ingreso' : (mesYaInicializado ? 'Agregar Nuevo Ingreso' : 'Ingreso Principal')}
              </h2>
              <p className="text-gray-600">
                {editandoIngreso 
                  ? 'Modifica los datos del ingreso seleccionado'
                  : (mesYaInicializado 
                    ? 'Registra ingresos adicionales como bonos, freelance, etc.'
                    : 'Ingresa tu salario o ingreso principal del mes'
                  )
                }
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-field block mb-2">
                  Descripción del ingreso
                </label>
                <input
                  type="text"
                  value={descripcionIngreso}
                  onChange={(e) => setDescripcionIngreso(e.target.value)}
                  placeholder="Ej: Salario, Freelance, Bonificación..."
                  className="input-field w-full px-4 py-2 shadow rounded-lg bg-white/80"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label-field mb-2">
                  Monto (COP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="text"
                    value={montoIngresoDisplay}
                    onChange={manejarCambioMonto}
                    placeholder="0"
                    className="input-field pl-8 w-full px-4 py-2 bg-white/80 shadow rounded-lg"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                onClick={mesYaInicializado ? manejarAgregarIngreso : manejarInicializarMes}
                disabled={loading || !montoIngreso || !descripcionIngreso}
                className="btn-primary w-full text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2 h-5 w-5"></div>
                    {editandoIngreso ? 'Actualizando...' : (mesYaInicializado ? 'Agregando...' : 'Inicializando...')}
                  </div>
                ) : (
                  editandoIngreso ? 'Actualizar Ingreso' : (mesYaInicializado ? 'Agregar Ingreso' : 'Inicializar Mes')
                )}
              </button>
              {editandoIngreso && (
                <button
                  onClick={manejarCancelarEdicion}
                  className="btn-secondary w-full text-lg mt-3"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          {/* Lista de ingresos */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Ingresos Registrados</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Total de ingresos del mes</p>
                <div className="text-right">
                  <p className="text-2xl font-bold value-positive">
                    {formatearMoneda(calcularTotalIngresos())}
                  </p>
                  <p className="text-sm text-gray-500">{ingresos.length} ingreso(s)</p>
                </div>
              </div>
            </div>

            {ingresos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Sin ingresos registrados</h3>
                <p className="text-gray-600">
                  {mesYaInicializado 
                    ? 'Agrega tu primer ingreso usando el formulario'
                    : 'Inicializa el mes para comenzar a registrar ingresos'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-0 rounded-lg overflow-hidden my-2 flex flex-col items-center gap-2">
                {ingresos.map((ingreso, index) => (
                  <div key={ingreso.id || index} className="flex bg-white w-full py-4 px-4 rounded-lg shadow justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{ingreso.descripcion}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(ingreso.fecha).toLocaleDateString('es-CO', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold value-positive">
                          {formatearMoneda(ingreso.valor)}
                        </p>
                        {index === 0 && ingresos.length > 1 && (
                          <span className="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full mt-1">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => manejarEditarIngreso(ingreso)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar ingreso"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => manejarEliminarIngreso(ingreso.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar ingreso"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones adicionales */}
        {mesYaInicializado && (
          <div className="mt-8 card bg-gradient-to-r from-accent-50 to-primary-50 border-accent-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Qué sigue?</h3>
              <p className="text-gray-600 mb-6">
                Ahora que tienes tus ingresos registrados, puedes continuar gestionando tus activos y pasivos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigation.navigate('Activos')}
                  className="btn-success"
                >
                  Gestionar Activos
                </button>
                <button
                  onClick={() => navigation.navigate('Pasivos')}
                  className="btn-secondary"
                >
                  Gestionar Pasivos
                </button>
                <button
                  onClick={() => navigation.navigate('Reportes')}
                  className="btn-primary"
                >
                  Ver Reportes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IniciarMesScreen;