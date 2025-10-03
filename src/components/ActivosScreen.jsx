import React, { useState, useEffect } from 'react';
import { insertarActivo, obtenerDatosMes, editarActivo, eliminarActivo } from '../utils/database';
import { useToast } from '../contexts/ToastContext';

function ActivosScreen() {
  const [descripcionActivo, setDescripcionActivo] = useState('');
  const [valorActivo, setValorActivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [activos, setActivos] = useState([]);
  const [editandoActivo, setEditandoActivo] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const datos = await obtenerDatosMes();
      setActivos(datos.activos || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const manejarAgregarActivo = async () => {
    if (!descripcionActivo || !valorActivo) {
      showError('Por favor, completa todos los campos');
      return;
    }

    const valor = parseFloat(valorActivo);
    if (isNaN(valor) || valor <= 0) {
      showError('Por favor, ingresa un valor válido');
      return;
    }

    try {
      setLoading(true);
      if (editandoActivo) {
        // Editar activo existente
        await editarActivo(editandoActivo.id, descripcionActivo, valor);
        showSuccess('¡Activo actualizado correctamente!');
        setEditandoActivo(null);
      } else {
        // Agregar nuevo activo
        await insertarActivo(descripcionActivo, valor);
        showSuccess('¡Activo agregado correctamente!');
      }
      
      await cargarDatos();
      setDescripcionActivo('');
      setValorActivo('');
    } catch (error) {
      console.error('Error al procesar activo:', error);
      showError(editandoActivo ? 'Error al actualizar el activo' : 'Error al agregar el activo');
    } finally {
      setLoading(false);
    }
  };

  const manejarEditarActivo = (activo) => {
    setEditandoActivo(activo);
    setDescripcionActivo(activo.descripcion);
    setValorActivo(activo.valor.toString());
  };

  const manejarCancelarEdicion = () => {
    setEditandoActivo(null);
    setDescripcionActivo('');
    setValorActivo('');
  };

  const manejarEliminarActivo = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este activo?')) {
      return;
    }

    setLoading(true);
    try {
      await eliminarActivo(id);
      showSuccess('¡Activo eliminado correctamente!');
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar activo:', error);
      showError('Error al eliminar el activo');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalActivos = () => {
    return activos.reduce((total, activo) => total + activo.valor, 0);
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const obtenerIconoActivo = (descripcion) => {
    const desc = descripcion.toLowerCase();
    if (desc.includes('casa') || desc.includes('apartamento') || desc.includes('propiedad')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    } else if (desc.includes('carro') || desc.includes('auto') || desc.includes('vehículo')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM7 9l4-4.5a1 1 0 011.4 0L17 9M7 9v8a2 2 0 002 2h6a2 2 0 002-2V9M7 9h10" />
        </svg>
      );
    } else if (desc.includes('ahorro') || desc.includes('cuenta') || desc.includes('banco')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      );
    } else if (desc.includes('inversión') || desc.includes('acción') || desc.includes('fondo')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  };

  if (loading && activos.length === 0) {
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
            <h1 className="text-2xl font-bold mb-1">Gestionar Activos</h1>
            <p className="text-primary-100">Registra y administra tus bienes y propiedades</p>
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
                {editandoActivo ? 'Editar Activo' : 'Agregar Nuevo Activo'}
              </h2>
              <p className="text-gray-600">
                {editandoActivo 
                  ? 'Modifica los datos del activo seleccionado'
                  : 'Registra tus bienes como propiedades, vehículos, ahorros, inversiones, etc.'
                }
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label-field block mb-2">
                  Descripción del activo
                </label>
                <input
                  type="text"
                  value={descripcionActivo}
                  onChange={(e) => setDescripcionActivo(e.target.value)}
                  placeholder="Ej: Casa, Apartamento, Carro, Ahorros, Inversiones..."
                  className="input-field w-full px-4 py-2 shadow rounded-lg bg-white/80"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label-field block mb-2">
                  Valor estimado (COP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={valorActivo}
                    onChange={(e) => setValorActivo(e.target.value)}
                    placeholder="0"
                    className="input-field pl-8 w-full px-4 py-2 bg-white/80 shadow rounded-lg"
                    disabled={loading}
                    min="0"
                    step="100000"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Ingresa el valor actual estimado de tu activo
                </p>
              </div>

              <button
                onClick={manejarAgregarActivo}
                disabled={loading || !descripcionActivo || !valorActivo}
                className="btn-success w-full text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2 h-5 w-5"></div>
                    {editandoActivo ? 'Actualizando...' : 'Agregando...'}
                  </div>
                ) : (
                  editandoActivo ? 'Actualizar Activo' : 'Agregar Activo'
                )}
              </button>
              {editandoActivo && (
                <button
                  onClick={manejarCancelarEdicion}
                  className="btn-secondary w-full text-lg mt-3"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          {/* Lista de activos */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Activos Registrados</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Valor total de tus activos</p>
                <div className="text-right">
                  <p className="text-2xl font-bold value-positive">
                    {formatearMoneda(calcularTotalActivos())}
                  </p>
                  <p className="text-sm text-gray-500">{activos.length} activo(s)</p>
                </div>
              </div>
            </div>

            {activos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Sin activos registrados</h3>
                <p className="text-gray-600">
                  Comienza agregando tus primeros activos usando el formulario
                </p>
              </div>
            ) : (
              <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
                {activos.map((activo, index) => (
                  <div key={activo.id || index} className="list-item">
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-3 text-accent-600">
                        {obtenerIconoActivo(activo.descripcion)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800">{activo.descripcion}</h3>
                        <p className="text-sm text-gray-500">
                          Registrado el {new Date(activo.fecha).toLocaleDateString('es-CO', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold value-positive">
                          {formatearMoneda(activo.valor)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => manejarEditarActivo(activo)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar activo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => manejarEliminarActivo(activo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar activo"
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

        {/* Información adicional */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Consejos */}
          <div className="card bg-gradient-to-r from-accent-50 to-success-50 border-accent-200">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Consejos para Activos</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Actualiza regularmente el valor de tus activos</li>
                  <li>• Incluye propiedades, vehículos, ahorros e inversiones</li>
                  <li>• Considera la depreciación en vehículos y equipos</li>
                  <li>• Mantén documentos de respaldo actualizados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button
                 onClick={() => navigation.navigate('Pasivos')}
                 className="btn-secondary w-full justify-between"
               >
                 <span>Gestionar Pasivos</span>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </button>
               <button
                 onClick={() => navigation.navigate('Reportes')}
                 className="btn-primary w-full justify-between"
               >
                 <span>Ver Reportes</span>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivosScreen;