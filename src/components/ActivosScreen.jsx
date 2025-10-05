import React, { useState, useEffect } from 'react';
import { 
  insertarActivo, 
  obtenerDatosMes, 
  editarActivo, 
  eliminarActivo,
  obtenerPrestamosConVencimiento,
  crearPrestamoOtorgado,
  registrarPagoPrestamo,
  eliminarPrestamoOtorgado,
  actualizarPrestamoOtorgado
} from '../utils/database';
import { useToast } from '../contexts/ToastContext';
import { formatearNumeroConSeparadores, removerSeparadores, convertirANumero } from '../utils/formatters';

function ActivosScreen() {
  const [descripcionActivo, setDescripcionActivo] = useState('');
  const [valorActivo, setValorActivo] = useState('');
  const [valorActivoDisplay, setValorActivoDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [activos, setActivos] = useState([]);
  const [editandoActivo, setEditandoActivo] = useState(null);
  
  // Estados para préstamos otorgados
  const [prestamos, setPrestamos] = useState({});
  const [mostrarModalPrestamo, setMostrarModalPrestamo] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [editandoPrestamo, setEditandoPrestamo] = useState(null);
  
  // Estados para formulario de préstamo
  const [formPrestamo, setFormPrestamo] = useState({
    persona: '',
    montoPrestado: '',
    montoARecibir: '',
    fechaPrestamo: new Date().toISOString().split('T')[0],
    fechaDevolucion: '',
    concepto: '',
    categoria: 'general',
    diasRecordatorio: 3
  });
  
  // Estados para formulario de pago
  const [formPago, setFormPago] = useState({
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: ''
  });
  
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const datos = await obtenerDatosMes();
      setActivos(datos.activos || []);
      setPrestamos(datos.prestamosOtorgados || {});
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const manejarCambioValor = (e) => {
    const inputValue = e.target.value;
    const numeroLimpio = removerSeparadores(inputValue);

    setValorActivo(numeroLimpio);
    setValorActivoDisplay(formatearNumeroConSeparadores(numeroLimpio));
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
      setValorActivoDisplay('');
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
    setValorActivoDisplay(formatearNumeroConSeparadores(activo.valor.toString()));
  };

  const manejarCancelarEdicion = () => {
    setEditandoActivo(null);
    setDescripcionActivo('');
    setValorActivo('');
    setValorActivoDisplay('');
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
    const totalActivosRegulares = activos.reduce((total, activo) => total + activo.valor, 0);
    
    // Agregar préstamos otorgados como activos
    const totalPrestamos = Object.values(prestamos).reduce((total, prestamo) => {
      // Solo contar el monto restante por cobrar como activo
      return total + (prestamo.montoARecibir - prestamo.montoPagado);
    }, 0);
    
    return totalActivosRegulares + totalPrestamos;
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

  // Funciones para préstamos otorgados
  const manejarCambioPrestamo = (campo, valor) => {
    setFormPrestamo(prev => {
      const nuevo = { ...prev, [campo]: valor };
      
      // Calcular ganancia automáticamente
      if (campo === 'montoPrestado' || campo === 'montoARecibir') {
        const prestado = parseFloat(removerSeparadores(campo === 'montoPrestado' ? valor : nuevo.montoPrestado)) || 0;
        const aRecibir = parseFloat(removerSeparadores(campo === 'montoARecibir' ? valor : nuevo.montoARecibir)) || 0;
        nuevo.ganancia = aRecibir - prestado;
      }
      
      return nuevo;
    });
  };

  const crearNuevoPrestamo = async () => {
    try {
      if (!formPrestamo.persona || !formPrestamo.montoPrestado || !formPrestamo.montoARecibir) {
        showError('Por favor completa todos los campos obligatorios');
        return;
      }

      const montoPrestado = parseFloat(removerSeparadores(formPrestamo.montoPrestado));
      const montoARecibir = parseFloat(removerSeparadores(formPrestamo.montoARecibir));

      if (montoPrestado <= 0 || montoARecibir <= 0) {
        showError('Los montos deben ser mayores a cero');
        return;
      }

      if (montoARecibir < montoPrestado) {
        showError('El monto a recibir debe ser mayor o igual al monto prestado');
        return;
      }

      const prestamo = {
        persona: formPrestamo.persona,
        montoPrestado,
        montoARecibir,
        fechaPrestamo: formPrestamo.fechaPrestamo,
        fechaDevolucion: formPrestamo.fechaDevolucion,
        concepto: formPrestamo.concepto || 'Préstamo personal',
        categoria: formPrestamo.categoria,
        diasRecordatorio: parseInt(formPrestamo.diasRecordatorio)
      };

      if (editandoPrestamo) {
        await actualizarPrestamoOtorgado(editandoPrestamo, prestamo);
        showSuccess('Préstamo actualizado exitosamente');
      } else {
        await crearPrestamoOtorgado(prestamo);
        showSuccess('Préstamo registrado exitosamente');
      }

      setMostrarModalPrestamo(false);
      setEditandoPrestamo(null);
      resetFormPrestamo();
      cargarDatos();
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      showError('Error al procesar el préstamo');
    }
  };

  const registrarPago = async () => {
    try {
      if (!formPago.monto || !prestamoSeleccionado) {
        showError('Por favor completa todos los campos');
        return;
      }

      const montoPago = parseFloat(removerSeparadores(formPago.monto));
      if (montoPago <= 0) {
        showError('El monto del pago debe ser mayor a cero');
        return;
      }

      const prestamo = prestamos[prestamoSeleccionado];
      const montoRestante = prestamo.montoARecibir - (prestamo.montoPagado || 0);

      if (montoPago > montoRestante) {
        showError(`El pago no puede ser mayor al monto restante: ${formatearMoneda(montoRestante)}`);
        return;
      }

      await registrarPagoPrestamo(prestamoSeleccionado, {
        monto: montoPago,
        fecha: formPago.fecha,
        descripcion: formPago.descripcion || 'Pago de préstamo'
      });

      showSuccess('Pago registrado exitosamente');
      setMostrarModalPago(false);
      setPrestamoSeleccionado(null);
      resetFormPago();
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      showError('Error al registrar el pago');
    }
  };

  const eliminarPrestamo = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este préstamo?')) {
      try {
        await eliminarPrestamoOtorgado(id);
        showSuccess('Préstamo eliminado exitosamente');
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar préstamo:', error);
        showError('Error al eliminar el préstamo');
      }
    }
  };

  const editarPrestamo = (id, prestamo) => {
    setEditandoPrestamo(id);
    setFormPrestamo({
      persona: prestamo.persona,
      montoPrestado: formatearNumeroConSeparadores(prestamo.montoPrestado.toString()),
      montoARecibir: formatearNumeroConSeparadores(prestamo.montoARecibir.toString()),
      fechaPrestamo: prestamo.fechaPrestamo,
      fechaDevolucion: prestamo.fechaDevolucion,
      concepto: prestamo.concepto,
      categoria: prestamo.categoria,
      diasRecordatorio: prestamo.diasRecordatorio
    });
    setMostrarModalPrestamo(true);
  };

  const resetFormPrestamo = () => {
    setFormPrestamo({
      persona: '',
      montoPrestado: '',
      montoARecibir: '',
      fechaPrestamo: new Date().toISOString().split('T')[0],
      fechaDevolucion: '',
      concepto: '',
      categoria: 'general',
      diasRecordatorio: 3
    });
  };

  const resetFormPago = () => {
    setFormPago({
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      descripcion: ''
    });
  };

  const obtenerEstadoPrestamo = (prestamo) => {
    const hoy = new Date();
    const fechaDevolucion = new Date(prestamo.fechaDevolucion);
    const montoPagado = prestamo.montoPagado || 0;
    const montoTotal = prestamo.montoARecibir;

    if (montoPagado >= montoTotal) return 'pagado';
    if (fechaDevolucion < hoy) return 'vencido';
    if (montoPagado > 0) return 'parcial';
    return 'activo';
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'pagado': return 'text-green-600 bg-green-100';
      case 'vencido': return 'text-red-600 bg-red-100';
      case 'parcial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'pagado': return 'Pagado';
      case 'vencido': return 'Vencido';
      case 'parcial': return 'Pago Parcial';
      default: return 'Activo';
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="header-gradient text-white py-6 px-6 shadow-lg">
        <div>
          <h1 className="text-2xl font-bold mb-1">Gestionar Activos</h1>
          <p className="text-primary-100">Registra y administra tus bienes y propiedades</p>
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
                    type="text"
                    value={valorActivoDisplay}
                    onChange={manejarCambioValor}
                    placeholder="0"
                    className="input-field pl-8 w-full px-4 py-2 bg-white/80 shadow rounded-lg"
                    disabled={loading}
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
              <div className="space-y-0 rounded-lg overflow-hidden my-2 flex flex-col items-center gap-2">
                {activos.map((activo, index) => (
                  <div key={activo.id || index} className="flex bg-white w-full py-4 px-4 rounded-lg shadow justify-between items-center">
                    <div className="flex">
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

          {/* Préstamos Otorgados */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Préstamos Otorgados</h2>
                <p className="text-gray-600">Dinero prestado a terceros</p>
              </div>
              <button
                onClick={() => {
                  resetFormPrestamo();
                  setMostrarModalPrestamo(true);
                }}
                className="btn-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Préstamo
              </button>
            </div>

            {Object.keys(prestamos).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No tienes préstamos registrados</p>
                <p className="text-sm text-gray-400">Los préstamos que otorgues aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(prestamos).map(([id, prestamo]) => {
                  const estado = obtenerEstadoPrestamo(prestamo);
                  const montoPagado = prestamo.montoPagado || 0;
                  const montoRestante = prestamo.montoARecibir - montoPagado;
                  const porcentajePagado = (montoPagado / prestamo.montoARecibir) * 100;

                  return (
                    <div key={id} className="bg-white/50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">{prestamo.persona}</h3>
                          <p className="text-sm text-gray-600">{prestamo.concepto}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerColorEstado(estado)}`}>
                            {obtenerTextoEstado(estado)}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => editarPrestamo(id, prestamo)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Editar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {estado !== 'pagado' && (
                              <button
                                onClick={() => {
                                  setPrestamoSeleccionado(id);
                                  setFormPago({
                                    monto: formatearNumeroConSeparadores(montoRestante.toString()),
                                    fecha: new Date().toISOString().split('T')[0],
                                    descripcion: ''
                                  });
                                  setMostrarModalPago(true);
                                }}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                title="Registrar Pago"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => eliminarPrestamo(id)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Prestado</p>
                          <p className="font-semibold">{formatearMoneda(prestamo.montoPrestado)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">A Recibir</p>
                          <p className="font-semibold">{formatearMoneda(prestamo.montoARecibir)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pagado</p>
                          <p className="font-semibold text-green-600">{formatearMoneda(montoPagado)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Restante</p>
                          <p className="font-semibold text-blue-600">{formatearMoneda(montoRestante)}</p>
                        </div>
                      </div>

                      {montoPagado > 0 && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progreso de pago</span>
                            <span>{porcentajePagado.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${porcentajePagado}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex justify-between text-xs text-gray-500">
                        <span>Fecha préstamo: {new Date(prestamo.fechaPrestamo).toLocaleDateString()}</span>
                        <span>Vence: {new Date(prestamo.fechaDevolucion).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
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

      {/* Modal Nuevo/Editar Préstamo */}
      {mostrarModalPrestamo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editandoPrestamo ? 'Editar Préstamo' : 'Nuevo Préstamo Otorgado'}
                </h3>
                <button
                  onClick={() => {
                    setMostrarModalPrestamo(false);
                    setEditandoPrestamo(null);
                    resetFormPrestamo();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Persona *
                  </label>
                  <input
                    type="text"
                    value={formPrestamo.persona}
                    onChange={(e) => manejarCambioPrestamo('persona', e.target.value)}
                    placeholder="Nombre de la persona"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Prestado *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="text"
                        value={formPrestamo.montoPrestado}
                        onChange={(e) => {
                          const valor = e.target.value;
                          const numeroLimpio = removerSeparadores(valor);
                          if (/^\d*$/.test(numeroLimpio)) {
                            const valorFormateado = formatearNumeroConSeparadores(numeroLimpio);
                            manejarCambioPrestamo('montoPrestado', valorFormateado);
                          }
                        }}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto a Recibir *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="text"
                        value={formPrestamo.montoARecibir}
                        onChange={(e) => {
                          const valor = e.target.value;
                          const numeroLimpio = removerSeparadores(valor);
                          if (/^\d*$/.test(numeroLimpio)) {
                            const valorFormateado = formatearNumeroConSeparadores(numeroLimpio);
                            manejarCambioPrestamo('montoARecibir', valorFormateado);
                          }
                        }}
                        placeholder="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {formPrestamo.montoPrestado && formPrestamo.montoARecibir && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm text-green-700">
                      <strong>Ganancia: </strong>
                      {formatearMoneda(
                        parseFloat(removerSeparadores(formPrestamo.montoARecibir)) - 
                        parseFloat(removerSeparadores(formPrestamo.montoPrestado))
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Préstamo
                    </label>
                    <input
                      type="date"
                      value={formPrestamo.fechaPrestamo}
                      onChange={(e) => manejarCambioPrestamo('fechaPrestamo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Devolución
                    </label>
                    <input
                      type="date"
                      value={formPrestamo.fechaDevolucion}
                      onChange={(e) => manejarCambioPrestamo('fechaDevolucion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={formPrestamo.concepto}
                    onChange={(e) => manejarCambioPrestamo('concepto', e.target.value)}
                    placeholder="Descripción del préstamo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={formPrestamo.categoria}
                      onChange={(e) => manejarCambioPrestamo('categoria', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="familiar">Familiar</option>
                      <option value="amigos">Amigos</option>
                      <option value="negocio">Negocio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recordatorio (días antes)
                    </label>
                    <input
                      type="number"
                      value={formPrestamo.diasRecordatorio}
                      onChange={(e) => manejarCambioPrestamo('diasRecordatorio', e.target.value)}
                      min="1"
                      max="30"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setMostrarModalPrestamo(false);
                    setEditandoPrestamo(null);
                    resetFormPrestamo();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={crearNuevoPrestamo}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editandoPrestamo ? 'Actualizar' : 'Crear Préstamo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {mostrarModalPago && prestamoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Registrar Pago</h3>
                <button
                  onClick={() => {
                    setMostrarModalPago(false);
                    setPrestamoSeleccionado(null);
                    resetFormPago();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {(() => {
                const prestamo = prestamos[prestamoSeleccionado];
                const montoPagado = prestamo.montoPagado || 0;
                const montoRestante = prestamo.montoARecibir - montoPagado;
                
                return (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{prestamo.persona}</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Total</p>
                          <p className="font-semibold">{formatearMoneda(prestamo.montoARecibir)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pagado</p>
                          <p className="font-semibold text-green-600">{formatearMoneda(montoPagado)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Restante</p>
                          <p className="font-semibold text-blue-600">{formatearMoneda(montoRestante)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto del Pago *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formPago.monto}
                          onChange={(e) => {
                            const valor = e.target.value;
                            const numeroLimpio = removerSeparadores(valor);
                            if (/^\d*$/.test(numeroLimpio)) {
                              const valorFormateado = formatearNumeroConSeparadores(numeroLimpio);
                              setFormPago(prev => ({ ...prev, monto: valorFormateado }));
                            }
                          }}
                          placeholder="0"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <button
                          onClick={() => setFormPago(prev => ({ 
                            ...prev, 
                            monto: formatearNumeroConSeparadores(montoRestante.toString()) 
                          }))}
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Pago completo
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha del Pago
                      </label>
                      <input
                        type="date"
                        value={formPago.fecha}
                        onChange={(e) => setFormPago(prev => ({ ...prev, fecha: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción (opcional)
                      </label>
                      <input
                        type="text"
                        value={formPago.descripcion}
                        onChange={(e) => setFormPago(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Descripción del pago"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    setMostrarModalPago(false);
                    setPrestamoSeleccionado(null);
                    resetFormPago();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={registrarPago}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Registrar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivosScreen;