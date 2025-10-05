import React, { useState, useEffect } from 'react';
import {
  insertarPasivo,
  obtenerDatosMes,
  editarPasivo,
  eliminarPasivo,
  crearDeudaProgramada,
  obtenerDeudasProgramadas,
  editarDeudaProgramada,
  eliminarDeudaProgramada,
  toggleDeudaProgramada,
  obtenerDeudasProgramadasConVencimiento
} from '../utils/database';
import { useToast } from '../contexts/ToastContext';
import { formatearNumeroConSeparadores, removerSeparadores, convertirANumero } from '../utils/formatters';

function PasivosScreen() {
  const [descripcionPasivo, setDescripcionPasivo] = useState('');
  const [valorPasivo, setValorPasivo] = useState('');
  const [valorPasivoDisplay, setValorPasivoDisplay] = useState('');
  const [tipoPasivo, setTipoPasivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [pasivos, setPasivos] = useState([]);
  const [editandoPasivo, setEditandoPasivo] = useState(null);

  // Estados para deudas programadas
  const [mostrarDeudaProgramada, setMostrarDeudaProgramada] = useState(false);
  const [deudasProgramadas, setDeudasProgramadas] = useState([]);
  const [deudasConVencimiento, setDeudasConVencimiento] = useState([]);
  const [editandoDeudaProgramada, setEditandoDeudaProgramada] = useState(null);
  const [formDeudaProgramada, setFormDeudaProgramada] = useState({
    descripcion: '',
    categoria: '',
    valor: '',
    valorDisplay: '',
    frecuencia: 'mensual',
    fechaInicio: '',
    fechaFin: ''
  });

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    cargarDatos();
    cargarDeudasProgramadas();
    cargarDeudasConVencimiento();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const datos = await obtenerDatosMes();
      setPasivos(datos.pasivos || []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarDeudasProgramadas = async () => {
    try {
      const deudas = await obtenerDeudasProgramadas();
      setDeudasProgramadas(deudas);
    } catch (error) {
      console.error('Error al cargar deudas programadas:', error);
    }
  };

  const cargarDeudasConVencimiento = async () => {
    try {
      const deudasConInfo = await obtenerDeudasProgramadasConVencimiento();
      setDeudasConVencimiento(deudasConInfo);
    } catch (error) {
      console.error('Error al cargar deudas con vencimiento:', error);
    }
  };

  const manejarCambioValor = (e) => {
    const inputValue = e.target.value;
    const numeroLimpio = removerSeparadores(inputValue);

    setValorPasivo(numeroLimpio);
    setValorPasivoDisplay(formatearNumeroConSeparadores(numeroLimpio));
  };

  const manejarAgregarPasivo = async () => {
    if (!descripcionPasivo || !valorPasivo || !tipoPasivo) {
      showError('Por favor, completa todos los campos');
      return;
    }

    const valor = parseFloat(valorPasivo);
    if (isNaN(valor) || valor <= 0) {
      showError('Por favor, ingresa un valor válido');
      return;
    }

    try {
      setLoading(true);
      if (editandoPasivo) {
        // Editar pasivo existente
        await editarPasivo(editandoPasivo.id, descripcionPasivo, valor, tipoPasivo);
        showSuccess('¡Pasivo actualizado correctamente!');
        setEditandoPasivo(null);
      } else {
        // Agregar nuevo pasivo
        await insertarPasivo(descripcionPasivo, valor, tipoPasivo);
        showSuccess('¡Pasivo agregado correctamente!');
      }

      await cargarDatos();
      setDescripcionPasivo('');
      setValorPasivo('');
      setValorPasivoDisplay('');
      setTipoPasivo('');
    } catch (error) {
      console.error('Error al procesar pasivo:', error);
      showError(editandoPasivo ? 'Error al actualizar el pasivo' : 'Error al agregar el pasivo');
    } finally {
      setLoading(false);
    }
  };

  const manejarEditarPasivo = (pasivo) => {
    setEditandoPasivo(pasivo);
    setDescripcionPasivo(pasivo.descripcion);
    setValorPasivo(pasivo.valor.toString());
    setValorPasivoDisplay(formatearNumeroConSeparadores(pasivo.valor.toString()));
    setTipoPasivo(pasivo.categoria || '');
  };

  const manejarCancelarEdicion = () => {
    setEditandoPasivo(null);
    setDescripcionPasivo('');
    setValorPasivo('');
    setValorPasivoDisplay('');
    setTipoPasivo('');
  };

  const manejarEliminarPasivo = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pasivo?')) {
      return;
    }

    setLoading(true);
    try {
      await eliminarPasivo(id);
      showSuccess('¡Pasivo eliminado correctamente!');
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar pasivo:', error);
      showError('Error al eliminar el pasivo');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalPasivos = () => {
    const totalPasivosRegulares = pasivos.reduce((total, pasivo) => total + pasivo.valor, 0);
    const totalDeudasProgramadas = deudasConVencimiento.reduce((total, deuda) => total + deuda.valor, 0);
    return totalPasivosRegulares + totalDeudasProgramadas;
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const obtenerIconoPasivo = (descripcion) => {
    const desc = descripcion.toLowerCase();
    if (desc.includes('hipoteca') || desc.includes('casa') || desc.includes('vivienda')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    } else if (desc.includes('tarjeta') || desc.includes('crédito')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      );
    } else if (desc.includes('préstamo') || desc.includes('crédito') || desc.includes('banco')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      );
    } else if (desc.includes('carro') || desc.includes('auto') || desc.includes('vehículo')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM7 9l4-4.5a1 1 0 011.4 0L17 9M7 9v8a2 2 0 002 2h6a2 2 0 002-2V9M7 9h10" />
        </svg>
      );
    } else if (desc.includes('servicio') || desc.includes('factura') || desc.includes('cuenta')) {
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const obtenerCategoriaPasivo = (descripcion) => {
    const desc = descripcion.toLowerCase();
    if (desc.includes('hipoteca') || desc.includes('casa') || desc.includes('vivienda')) {
      return { categoria: 'Hipoteca', color: 'bg-red-100 text-red-800' };
    } else if (desc.includes('tarjeta') || desc.includes('crédito')) {
      return { categoria: 'Tarjeta de Crédito', color: 'bg-orange-100 text-orange-800' };
    } else if (desc.includes('préstamo') || desc.includes('banco')) {
      return { categoria: 'Préstamo', color: 'bg-primary-100 text-primary-800' };
    } else if (desc.includes('carro') || desc.includes('auto') || desc.includes('vehículo')) {
      return { categoria: 'Vehículo', color: 'bg-success-100 text-success-800' };
    } else if (desc.includes('servicio') || desc.includes('factura') || desc.includes('cuenta')) {
      return { categoria: 'Servicios', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { categoria: 'Otros', color: 'bg-gray-100 text-gray-800' };
  };

  // Funciones para deudas programadas
  const manejarCambioFormDeudaProgramada = (campo, valor) => {
    if (campo === 'valor') {
      const valorNumerico = removerSeparadores(valor);
      const valorFormateado = formatearNumeroConSeparadores(valor);
      setFormDeudaProgramada(prev => ({
        ...prev,
        valor: valorNumerico,
        valorDisplay: valorFormateado
      }));
    } else {
      setFormDeudaProgramada(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  };

  const manejarAgregarDeudaProgramada = async () => {
    if (!formDeudaProgramada.descripcion || !formDeudaProgramada.categoria ||
      !formDeudaProgramada.valor || !formDeudaProgramada.fechaInicio) {
      showError('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      const deudaData = {
        descripcion: formDeudaProgramada.descripcion,
        categoria: formDeudaProgramada.categoria,
        valor: convertirANumero(formDeudaProgramada.valor),
        frecuencia: formDeudaProgramada.frecuencia,
        fechaInicio: formDeudaProgramada.fechaInicio,
        fechaFin: formDeudaProgramada.fechaFin || null
      };

      if (editandoDeudaProgramada) {
        await editarDeudaProgramada(editandoDeudaProgramada.id, deudaData);
        showSuccess('¡Deuda programada actualizada correctamente!');
        setEditandoDeudaProgramada(null);
      } else {
        await crearDeudaProgramada(deudaData);
        showSuccess('¡Deuda programada creada correctamente!');
      }

      setFormDeudaProgramada({
        descripcion: '',
        categoria: '',
        valor: '',
        valorDisplay: '',
        frecuencia: 'mensual',
        fechaInicio: '',
        fechaFin: ''
      });
      setMostrarDeudaProgramada(false);
      await cargarDeudasProgramadas();
      await cargarDeudasConVencimiento();
    } catch (error) {
      console.error('Error al guardar deuda programada:', error);
      showError('Error al guardar la deuda programada');
    } finally {
      setLoading(false);
    }
  };

  const manejarEditarDeudaProgramada = (deuda) => {
    setEditandoDeudaProgramada(deuda);
    setFormDeudaProgramada({
      descripcion: deuda.descripcion,
      categoria: deuda.categoria,
      valor: deuda.valor.toString(),
      valorDisplay: formatearNumeroConSeparadores(deuda.valor.toString()),
      frecuencia: deuda.frecuencia,
      fechaInicio: deuda.fechaInicio,
      fechaFin: deuda.fechaFin || ''
    });
    setMostrarDeudaProgramada(true);
  };

  const manejarEliminarDeudaProgramada = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta deuda programada?')) {
      return;
    }

    setLoading(true);
    try {
      await eliminarDeudaProgramada(id);
      showSuccess('¡Deuda programada eliminada correctamente!');
      await cargarDeudasProgramadas();
      await cargarDeudasConVencimiento();
    } catch (error) {
      console.error('Error al eliminar deuda programada:', error);
      showError('Error al eliminar la deuda programada');
    } finally {
      setLoading(false);
    }
  };

  const manejarToggleDeudaProgramada = async (id) => {
    setLoading(true);
    try {
      await toggleDeudaProgramada(id);
      showSuccess('Estado de deuda programada actualizado');
      await cargarDeudasProgramadas();
      await cargarDeudasConVencimiento();
    } catch (error) {
      console.error('Error al cambiar estado de deuda programada:', error);
      showError('Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const manejarCancelarDeudaProgramada = () => {
    setMostrarDeudaProgramada(false);
    setEditandoDeudaProgramada(null);
    setFormDeudaProgramada({
      descripcion: '',
      categoria: '',
      valor: '',
      valorDisplay: '',
      frecuencia: 'mensual',
      fechaInicio: '',
      fechaFin: ''
    });
  };

  if (loading && pasivos.length === 0) {
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
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-col gap-5 md:flex-row md:gap-0">
          <div>
            <h1 className="text-2xl font-bold mb-1">Gestionar Pasivos</h1>
            <p className="text-primary-100">Registra y controla tus deudas y obligaciones</p>
          </div>
          <button
            onClick={() => setMostrarDeudaProgramada(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Deudas Programadas
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
                {editandoPasivo ? 'Editar Pasivo' : 'Agregar Nuevo Pasivo'}
              </h2>
              <p className="text-gray-600">
                {editandoPasivo
                  ? 'Modifica los datos del pasivo seleccionado'
                  : 'Registra tus deudas como hipotecas, préstamos, tarjetas de crédito, etc.'
                }
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label-field block mb-2">
                  Descripción del pasivo
                </label>
                <input
                  type="text"
                  value={descripcionPasivo}
                  onChange={(e) => setDescripcionPasivo(e.target.value)}
                  placeholder="Ej: Hipoteca casa, Préstamo carro, Tarjeta de crédito..."
                  className="input-field w-full px-4 py-2 shadow rounded-lg bg-white/80"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label-field block mb-2">
                  Tipo de Gasto
                </label>
                <select
                  value={tipoPasivo}
                  onChange={(e) => setTipoPasivo(e.target.value)}
                  className="input-field w-full px-4 py-2 shadow rounded-lg bg-white/80"
                  disabled={loading}
                >
                  <option value="">Selecciona el tipo de gasto</option>
                  <option value="Hipoteca">Hipoteca</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Préstamo">Préstamo</option>
                  <option value="Vehículo">Vehículo</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Otros">Otros</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Selecciona la categoría que mejor describe este gasto
                </p>
              </div>

              <div>
                <label className="label-field block mb-2">
                  Valor de la deuda (COP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    $
                  </span>
                  <input
                    type="text"
                    value={valorPasivoDisplay}
                    onChange={manejarCambioValor}
                    placeholder="0"
                    className="input-field pl-8 w-full px-4 py-2 shadow rounded-lg bg-white/80"
                    disabled={loading}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Ingresa el saldo actual de tu deuda u obligación
                </p>
              </div>

              <button
                onClick={manejarAgregarPasivo}
                disabled={loading || !descripcionPasivo || !valorPasivo || !tipoPasivo}
                className="btn-success w-full text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2 h-5 w-5"></div>
                    {editandoPasivo ? 'Actualizando...' : 'Agregando...'}
                  </div>
                ) : (
                  editandoPasivo ? 'Actualizar Pasivo' : 'Agregar Pasivo'
                )}
              </button>

              {editandoPasivo && (
                <button
                  onClick={manejarCancelarEdicion}
                  disabled={loading}
                  className="btn-secondary w-full text-lg mt-3"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </div>

          {/* Lista de pasivos */}
          <div className="card">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Pasivos Registrados</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Total de tus deudas</p>
                <div className="text-right">
                  <p className="text-2xl font-bold value-negative">
                    {formatearMoneda(calcularTotalPasivos())}
                  </p>
                  <p className="text-sm text-gray-500">{pasivos.length} pasivo(s)</p>
                </div>
              </div>
            </div>

            {pasivos.length === 0 && deudasConVencimiento.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">¡Sin deudas registradas!</h3>
                <p className="text-gray-600">
                  Excelente situación financiera. Si tienes deudas, regístralas para un mejor control.
                </p>
              </div>
            ) : (
              <div className="space-y-0 rounded-lg overflow-hidden my-2 flex flex-col items-center gap-2">
                {/* Deudas programadas con vencimiento */}
                {deudasConVencimiento.map((deuda, index) => {
                  const categoria = deuda.categoria || 'Deuda Programada';
                  let colorCategoria = 'bg-blue-100 text-blue-800';
                  let indicadorVencimiento = '';
                  let colorIndicador = '';

                  if (deuda.esHoy) {
                    colorCategoria = 'bg-red-100 text-red-800';
                    indicadorVencimiento = '¡VENCE HOY!';
                    colorIndicador = 'bg-red-500 text-white animate-pulse';
                  } else if (deuda.esProximo) {
                    colorCategoria = 'bg-yellow-100 text-yellow-800';
                    indicadorVencimiento = `Vence en ${deuda.diasHastaVencimiento} día(s)`;
                    colorIndicador = 'bg-yellow-500 text-white';
                  } else if (deuda.estaVencida) {
                    colorCategoria = 'bg-red-100 text-red-800';
                    indicadorVencimiento = `Vencida hace ${Math.abs(deuda.diasHastaVencimiento)} día(s)`;
                    colorIndicador = 'bg-red-600 text-white';
                  }

                  return (
                    <div key={`deuda-${deuda.id}-${index}`} className="flex bg-gradient-to-r from-blue-50 to-indigo-50 w-full py-4 px-4 rounded-lg shadow border-l-4 border-blue-500 justify-between items-center">
                      <div className="flex items-center flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3 text-blue-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800">{deuda.descripcion}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorCategoria}`}>
                              {categoria}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Programada
                            </span>
                            {indicadorVencimiento && (
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${colorIndicador}`}>
                                {indicadorVencimiento}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Próximo vencimiento: {new Date(deuda.proximaGeneracion).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })} • Frecuencia: {deuda.frecuencia}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="font-semibold value-negative">
                            {formatearMoneda(deuda.valor)}
                          </p>
                        </div>
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pasivos regulares */}
                {pasivos.map((pasivo, index) => {
                  const categoria = pasivo.categoria || obtenerCategoriaPasivo(pasivo.descripcion).categoria;
                  const colorCategoria = obtenerCategoriaPasivo(pasivo.descripcion).color;
                  return (
                    <div key={pasivo.id || index} className="flex bg-white w-full py-4 px-4 rounded-lg shadow justify-between items-center">
                      <div className="flex items-center flex-1">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 text-red-600">
                          {obtenerIconoPasivo(pasivo.descripcion)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-800">{pasivo.descripcion}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorCategoria}`}>
                              {categoria}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Registrado el {new Date(pasivo.fecha).toLocaleDateString('es-CO', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-2">
                          <p className="font-semibold value-negative">
                            {formatearMoneda(pasivo.valor)}
                          </p>
                        </div>
                        <button
                          onClick={() => manejarEditarPasivo(pasivo)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Editar pasivo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => manejarEliminarPasivo(pasivo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar pasivo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
          <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <div className="flex items-start">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Deudas</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Prioriza pagar deudas con mayor interés</li>
                  <li>• Mantén un registro actualizado de saldos</li>
                  <li>• Considera consolidar deudas si es conveniente</li>
                  <li>• Evita adquirir nuevas deudas innecesarias</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Análisis de deudas */}
          {pasivos.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Deudas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Deuda promedio:</span>
                  <span className="font-semibold text-gray-800">
                    {formatearMoneda(calcularTotalPasivos() / pasivos.length)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mayor deuda:</span>
                  <span className="font-semibold text-red-600">
                    {formatearMoneda(Math.max(...pasivos.map(p => p.valor)))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Menor deuda:</span>
                  <span className="font-semibold text-orange-600">
                    {formatearMoneda(Math.min(...pasivos.map(p => p.valor)))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Acciones rápidas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigation.navigate('Activos')}
                className="btn-secondary w-full justify-between"
              >
                <span>Gestionar Activos</span>
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

      {/* Modal de Deudas Programadas */}
      {mostrarDeudaProgramada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editandoDeudaProgramada ? 'Editar Deuda Programada' : 'Gestionar Deudas Programadas'}
                </h2>
                <button
                  onClick={manejarCancelarDeudaProgramada}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulario */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {editandoDeudaProgramada ? 'Editar Deuda' : 'Nueva Deuda Programada'}
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción *
                    </label>
                    <input
                      type="text"
                      value={formDeudaProgramada.descripcion}
                      onChange={(e) => manejarCambioFormDeudaProgramada('descripcion', e.target.value)}
                      className="input-field"
                      placeholder="Ej: Cuota hipoteca casa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formDeudaProgramada.categoria}
                      onChange={(e) => manejarCambioFormDeudaProgramada('categoria', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Selecciona una categoría</option>
                      <option value="Hipoteca">Hipoteca</option>
                      <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                      <option value="Préstamo">Préstamo</option>
                      <option value="Vehículo">Vehículo</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor *
                    </label>
                    <input
                      type="text"
                      value={formDeudaProgramada.valorDisplay}
                      onChange={(e) => manejarCambioFormDeudaProgramada('valor', e.target.value)}
                      className="input-field"
                      placeholder="Ej: 1,500,000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frecuencia
                    </label>
                    <select
                      value={formDeudaProgramada.frecuencia}
                      onChange={(e) => manejarCambioFormDeudaProgramada('frecuencia', e.target.value)}
                      className="input-field"
                    >
                      <option value="mensual">Mensual</option>
                      <option value="bimestral">Bimestral</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      value={formDeudaProgramada.fechaInicio}
                      onChange={(e) => manejarCambioFormDeudaProgramada('fechaInicio', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin (Opcional)
                    </label>
                    <input
                      type="date"
                      value={formDeudaProgramada.fechaFin}
                      onChange={(e) => manejarCambioFormDeudaProgramada('fechaFin', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={manejarAgregarDeudaProgramada}
                      disabled={loading || !formDeudaProgramada.descripcion || !formDeudaProgramada.categoria ||
                        !formDeudaProgramada.valor || !formDeudaProgramada.fechaInicio}
                      className="btn-primary flex-1"
                    >
                      {loading ? 'Guardando...' : (editandoDeudaProgramada ? 'Actualizar' : 'Crear Deuda')}
                    </button>
                    <button
                      onClick={manejarCancelarDeudaProgramada}
                      className="btn-secondary"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

                {/* Lista de deudas programadas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Deudas Programadas Existentes</h3>

                  {deudasProgramadas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p>No hay deudas programadas</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {deudasProgramadas.map((deuda) => (
                        <div key={deuda.id} className={`p-4 rounded-lg border ${deuda.activa ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className={`font-medium ${deuda.activa ? 'text-gray-800' : 'text-gray-500'}`}>
                                  {deuda.descripcion}
                                </h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${deuda.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                  {deuda.activa ? 'Activa' : 'Inactiva'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-medium">Categoría:</span> {deuda.categoria}</p>
                                <p><span className="font-medium">Valor:</span> {formatearMoneda(deuda.valor)}</p>
                                <p><span className="font-medium">Frecuencia:</span> {deuda.frecuencia}</p>
                                <p><span className="font-medium">Próxima generación:</span> {new Date(deuda.proximaGeneracion).toLocaleDateString()}</p>
                                {deuda.fechaFin && (
                                  <p><span className="font-medium">Fecha fin:</span> {new Date(deuda.fechaFin).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => manejarToggleDeudaProgramada(deuda.id)}
                                className={`p-2 rounded-lg transition-colors ${deuda.activa
                                    ? 'text-green-600 hover:bg-green-50'
                                    : 'text-gray-400 hover:bg-gray-100'
                                  }`}
                                title={deuda.activa ? 'Desactivar' : 'Activar'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => manejarEditarDeudaProgramada(deuda)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => manejarEliminarDeudaProgramada(deuda.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PasivosScreen;