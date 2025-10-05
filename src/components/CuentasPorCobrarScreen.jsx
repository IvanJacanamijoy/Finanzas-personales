import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { formatearMoneda } from '../utils/formatters';
import { 
  obtenerDatosMes, 
  registrarCuentaPorCobrar, 
  registrarPagoCuentaPorCobrar,
  eliminarCuentaPorCobrar 
} from '../utils/database';

const CuentasPorCobrarScreen = () => {
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(null);
  const [nuevaCuenta, setNuevaCuenta] = useState({
    cliente: '',
    descripcion: '',
    valorTotal: '',
    montoPagado: ''
  });
  const [montoPago, setMontoPago] = useState('');
  const { mostrarToast } = useToast();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const datos = await obtenerDatosMes();
      setCuentasPorCobrar(datos.cuentasPorCobrar || []);
    } catch (error) {
      console.error('Error al cargar cuentas por cobrar:', error);
      mostrarToast('Error al cargar los datos', 'error');
    }
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    if (!nuevaCuenta.cliente || !nuevaCuenta.descripcion || !nuevaCuenta.valorTotal) {
      mostrarToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    const valorTotal = parseFloat(nuevaCuenta.valorTotal);
    const montoPagado = parseFloat(nuevaCuenta.montoPagado) || 0;

    if (valorTotal <= 0) {
      mostrarToast('El valor total debe ser mayor a 0', 'error');
      return;
    }

    if (montoPagado > valorTotal) {
      mostrarToast('El monto pagado no puede ser mayor al valor total', 'error');
      return;
    }

    try {
      await registrarCuentaPorCobrar({
        cliente: nuevaCuenta.cliente,
        descripcion: nuevaCuenta.descripcion,
        valorTotal: valorTotal,
        montoPagado: montoPagado
      });

      mostrarToast('Cuenta por cobrar registrada exitosamente', 'success');
      setNuevaCuenta({ cliente: '', descripcion: '', valorTotal: '', montoPagado: '' });
      setMostrarFormulario(false);
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar cuenta por cobrar:', error);
      mostrarToast('Error al registrar la cuenta por cobrar', 'error');
    }
  };

  const manejarPago = async (cuentaId) => {
    if (!montoPago || parseFloat(montoPago) <= 0) {
      mostrarToast('Ingresa un monto válido', 'error');
      return;
    }

    try {
      await registrarPagoCuentaPorCobrar(cuentaId, parseFloat(montoPago));
      mostrarToast('Pago registrado exitosamente', 'success');
      setMontoPago('');
      setMostrarPago(null);
      cargarDatos();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      mostrarToast(error.message || 'Error al registrar el pago', 'error');
    }
  };

  const eliminarCuenta = async (cuentaId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cuenta por cobrar?')) {
      try {
        await eliminarCuentaPorCobrar(cuentaId);
        mostrarToast('Cuenta por cobrar eliminada', 'success');
        cargarDatos();
      } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        mostrarToast('Error al eliminar la cuenta', 'error');
      }
    }
  };

  const calcularTotalPorCobrar = () => {
    return cuentasPorCobrar.reduce((total, cuenta) => {
      return total + (cuenta.valorTotal - cuenta.montoPagado);
    }, 0);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Cuentas por Cobrar</h2>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Nueva Venta
          </button>
        </div>

        {/* Resumen */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total por Cobrar</p>
              <p className="text-xl font-bold text-blue-600">
                {formatearMoneda(calcularTotalPorCobrar())}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Cuentas Activas</p>
              <p className="text-xl font-bold text-green-600">
                {cuentasPorCobrar.filter(c => c.montoRestante > 0).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Cuentas Pagadas</p>
              <p className="text-xl font-bold text-gray-600">
                {cuentasPorCobrar.filter(c => c.montoRestante === 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Cuentas por Cobrar */}
        <div className="space-y-4">
          {cuentasPorCobrar.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay cuentas por cobrar registradas</p>
              <p className="text-sm">Registra tu primera venta pendiente de pago</p>
            </div>
          ) : (
            cuentasPorCobrar.map((cuenta) => (
              <div key={cuenta.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">{cuenta.cliente}</h3>
                    <p className="text-gray-600">{cuenta.descripcion}</p>
                    <p className="text-sm text-gray-500">
                      Venta: {new Date(cuenta.fechaVenta).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-800">
                      {formatearMoneda(cuenta.valorTotal)}
                    </p>
                    <p className="text-sm text-green-600">
                      Pagado: {formatearMoneda(cuenta.montoPagado)}
                    </p>
                    <p className="text-sm font-semibold text-red-600">
                      Pendiente: {formatearMoneda(cuenta.montoRestante)}
                    </p>
                  </div>
                </div>

                {cuenta.montoRestante > 0 && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setMostrarPago(cuenta.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Registrar Pago
                    </button>
                    <button
                      onClick={() => eliminarCuenta(cuenta.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                )}

                {/* Formulario de pago */}
                {mostrarPago === cuenta.id && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Monto del pago"
                        value={montoPago}
                        onChange={(e) => setMontoPago(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                        max={cuenta.montoRestante}
                      />
                      <button
                        onClick={() => manejarPago(cuenta.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => {
                          setMostrarPago(null);
                          setMontoPago('');
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo: {formatearMoneda(cuenta.montoRestante)}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para nueva cuenta por cobrar */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Registrar Nueva Venta</h3>
            <form onSubmit={manejarSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente *
                </label>
                <input
                  type="text"
                  value={nuevaCuenta.cliente}
                  onChange={(e) => setNuevaCuenta({...nuevaCuenta, cliente: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={nuevaCuenta.descripcion}
                  onChange={(e) => setNuevaCuenta({...nuevaCuenta, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Manillas doradas x5"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Total *
                </label>
                <input
                  type="number"
                  value={nuevaCuenta.valorTotal}
                  onChange={(e) => setNuevaCuenta({...nuevaCuenta, valorTotal: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                  min="0"
                  step="100"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Pagado (opcional)
                </label>
                <input
                  type="number"
                  value={nuevaCuenta.montoPagado}
                  onChange={(e) => setNuevaCuenta({...nuevaCuenta, montoPagado: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="100"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Registrar Venta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNuevaCuenta({ cliente: '', descripcion: '', valorTotal: '', montoPagado: '' });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuentasPorCobrarScreen;