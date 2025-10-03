// Sistema de base de datos usando localStorage para la aplicación web de finanzas personales

const STORAGE_KEY = 'finanzas_personales_data';

// Estructura inicial de datos
const estructuraInicial = {
  meses: {},
  reportes: {}, // Nueva estructura para almacenar reportes históricos
  deudasProgramadas: {}, // Nueva estructura para deudas programadas
  configuracion: {
    version: '1.0.0',
    fechaCreacion: new Date().toISOString()
  }
};

// Función para obtener datos del localStorage
const obtenerDatosStorage = () => {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);
    if (!datos) {
      return estructuraInicial;
    }
    return JSON.parse(datos);
  } catch (error) {
    console.error('Error al obtener datos del storage:', error);
    return estructuraInicial;
  }
};

// Función para guardar datos en localStorage
const guardarDatosStorage = (datos) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    return true;
  } catch (error) {
    console.error('Error al guardar datos en storage:', error);
    return false;
  }
};

// Función para obtener el número del mes actual
const obtenerNumeroMes = () => {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = fecha.getMonth() + 1; // getMonth() devuelve 0-11
  return `${año}-${mes.toString().padStart(2, '0')}`;
};

// Inicializar la base de datos
export const inicializarDB = async () => {
  try {
    const datos = obtenerDatosStorage();
    if (!datos.meses) {
      datos.meses = {};
      guardarDatosStorage(datos);
    }
    return true;
  } catch (error) {
    console.error('Error inicializando DB:', error);
    return false;
  }
};

// Inicializar un nuevo mes
export const inicializarMes = async () => {
  try {
    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    if (!datos.meses[numeroMes]) {
      datos.meses[numeroMes] = {
        inicializado: true,
        fechaInicializacion: new Date().toISOString(),
        ingresos: [],
        activos: [],
        pasivos: []
      };
      
      const guardado = guardarDatosStorage(datos);
      if (!guardado) {
        throw new Error('No se pudo guardar la inicialización del mes');
      }
    }
    
    return datos.meses[numeroMes];
  } catch (error) {
    console.error('Error inicializando mes:', error);
    throw error;
  }
};

// Insertar un nuevo ingreso
export const insertarIngreso = async (descripcion, valor) => {
  try {
    if (!descripcion || valor <= 0) {
      throw new Error('Descripción y valor son requeridos');
    }

    // Validar que descripcion sea un string
    if (typeof descripcion !== 'string') {
      throw new Error('La descripción debe ser un texto válido');
    }

    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    // Asegurar que el mes esté inicializado
    if (!datos.meses[numeroMes]) {
      await inicializarMes();
      // Recargar datos después de inicializar
      const datosActualizados = obtenerDatosStorage();
      datos.meses = datosActualizados.meses;
    }
    
    const nuevoIngreso = {
      id: Date.now().toString(),
      descripcion: descripcion.trim(),
      valor: parseFloat(valor),
      fecha: new Date().toISOString(),
      tipo: 'ingreso'
    };
    
    datos.meses[numeroMes].ingresos.push(nuevoIngreso);
    
    const guardado = guardarDatosStorage(datos);
    if (!guardado) {
      throw new Error('No se pudo guardar el ingreso');
    }
    
    return nuevoIngreso;
  } catch (error) {
    console.error('Error insertando ingreso:', error);
    throw error;
  }
};

// Insertar un nuevo activo
export const insertarActivo = async (descripcion, valor) => {
  try {
    if (!descripcion || valor <= 0) {
      throw new Error('Descripción y valor son requeridos');
    }

    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    // Asegurar que el mes esté inicializado
    if (!datos.meses[numeroMes]) {
      await inicializarMes();
      // Recargar datos después de inicializar
      const datosActualizados = obtenerDatosStorage();
      datos.meses = datosActualizados.meses;
    }
    
    const nuevoActivo = {
      id: Date.now().toString(),
      descripcion: descripcion.trim(),
      valor: parseFloat(valor),
      fecha: new Date().toISOString(),
      tipo: 'activo'
    };
    
    datos.meses[numeroMes].activos.push(nuevoActivo);
    
    const guardado = guardarDatosStorage(datos);
    if (!guardado) {
      throw new Error('No se pudo guardar el activo');
    }
    
    return nuevoActivo;
  } catch (error) {
    console.error('Error insertando activo:', error);
    throw error;
  }
};

// Insertar un nuevo pasivo
export const insertarPasivo = async (descripcion, valor, tipoPasivo = '') => {
  try {
    if (!descripcion || valor <= 0) {
      throw new Error('Descripción y valor son requeridos');
    }

    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    // Asegurar que el mes esté inicializado
    if (!datos.meses[numeroMes]) {
      await inicializarMes();
      // Recargar datos después de inicializar
      const datosActualizados = obtenerDatosStorage();
      datos.meses = datosActualizados.meses;
    }
    
    const nuevoPasivo = {
      id: Date.now().toString(),
      descripcion: descripcion.trim(),
      valor: parseFloat(valor),
      fecha: new Date().toISOString(),
      tipo: 'pasivo',
      categoria: tipoPasivo
    };
    
    datos.meses[numeroMes].pasivos.push(nuevoPasivo);
    
    const guardado = guardarDatosStorage(datos);
    if (!guardado) {
      throw new Error('No se pudo guardar el pasivo');
    }
    
    return nuevoPasivo;
  } catch (error) {
    console.error('Error insertando pasivo:', error);
    throw error;
  }
};

// Obtener datos del mes actual
export const obtenerDatosMes = async () => {
  try {
    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    if (!datos.meses[numeroMes]) {
      return {
        inicializado: false,
        ingresos: [],
        activos: [],
        pasivos: []
      };
    }
    
    return datos.meses[numeroMes];
  } catch (error) {
    console.error('Error obteniendo datos del mes:', error);
    throw error;
  }
};

// Verificar si el mes actual está inicializado
export const mesEstaInicializado = async () => {
  try {
    const datosMes = await obtenerDatosMes();
    return datosMes.inicializado || false;
  } catch (error) {
    console.error('Error verificando inicialización del mes:', error);
    return false;
  }
};

// Limpiar todos los datos (usar con precaución)
export const limpiarDatos = async () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error limpiando datos:', error);
    return false;
  }
};

// Editar ingreso
export const editarIngreso = async (id, descripcion, valor) => {
  try {
    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    if (!datos.meses[numeroMes]) {
      throw new Error('El mes no está inicializado');
    }
    
    const ingresoIndex = datos.meses[numeroMes].ingresos.findIndex(ingreso => ingreso.id === id);
    if (ingresoIndex === -1) {
      throw new Error('Ingreso no encontrado');
    }
    
    datos.meses[numeroMes].ingresos[ingresoIndex] = {
      ...datos.meses[numeroMes].ingresos[ingresoIndex],
      descripcion,
      valor: parseFloat(valor),
      fechaModificacion: new Date().toISOString()
    };
    
    guardarDatosStorage(datos);
    return datos.meses[numeroMes].ingresos[ingresoIndex];
  } catch (error) {
    console.error('Error editando ingreso:', error);
    throw error;
  }
};

// Eliminar ingreso
export const eliminarIngreso = async (id) => {
  try {
    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    if (!datos.meses[numeroMes]) {
      throw new Error('El mes no está inicializado');
    }
    
    const ingresoIndex = datos.meses[numeroMes].ingresos.findIndex(ingreso => ingreso.id === id);
    if (ingresoIndex === -1) {
      throw new Error('Ingreso no encontrado');
    }
    
    const ingresoEliminado = datos.meses[numeroMes].ingresos.splice(ingresoIndex, 1)[0];
    guardarDatosStorage(datos);
    return ingresoEliminado;
  } catch (error) {
    console.error('Error eliminando ingreso:', error);
    throw error;
  }
};

// Editar activo
export const editarActivo = async (id, descripcion, valor) => {
  try {
    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    if (!datos.meses[numeroMes]) {
      throw new Error('El mes no está inicializado');
    }
    
    const activoIndex = datos.meses[numeroMes].activos.findIndex(activo => activo.id === id);
    if (activoIndex === -1) {
      throw new Error('Activo no encontrado');
    }
    
    datos.meses[numeroMes].activos[activoIndex] = {
      ...datos.meses[numeroMes].activos[activoIndex],
      descripcion,
      valor: parseFloat(valor),
      fechaModificacion: new Date().toISOString()
    };
    
    guardarDatosStorage(datos);
    return datos.meses[numeroMes].activos[activoIndex];
  } catch (error) {
    console.error('Error editando activo:', error);
    throw error;
  }
};

// Eliminar activo
export const eliminarActivo = async (id) => {
  try {
    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    if (!datos.meses[numeroMes]) {
      throw new Error('El mes no está inicializado');
    }
    
    const activoIndex = datos.meses[numeroMes].activos.findIndex(activo => activo.id === id);
    if (activoIndex === -1) {
      throw new Error('Activo no encontrado');
    }
    
    const activoEliminado = datos.meses[numeroMes].activos.splice(activoIndex, 1)[0];
    guardarDatosStorage(datos);
    return activoEliminado;
  } catch (error) {
    console.error('Error eliminando activo:', error);
    throw error;
  }
};

// Editar pasivo
export const editarPasivo = async (id, descripcion, valor, tipoPasivo = '') => {
  try {
    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    if (!datos.meses[numeroMes]) {
      throw new Error('El mes no está inicializado');
    }
    
    const pasivoIndex = datos.meses[numeroMes].pasivos.findIndex(pasivo => pasivo.id === id);
    if (pasivoIndex === -1) {
      throw new Error('Pasivo no encontrado');
    }
    
    datos.meses[numeroMes].pasivos[pasivoIndex] = {
      ...datos.meses[numeroMes].pasivos[pasivoIndex],
      descripcion,
      valor: parseFloat(valor),
      categoria: tipoPasivo,
      fechaModificacion: new Date().toISOString()
    };
    
    guardarDatosStorage(datos);
    return datos.meses[numeroMes].pasivos[pasivoIndex];
  } catch (error) {
    console.error('Error editando pasivo:', error);
    throw error;
  }
};

// Eliminar pasivo
export const eliminarPasivo = async (id) => {
  try {
    const datos = obtenerDatosStorage();
    const numeroMes = obtenerNumeroMes();
    
    if (!datos.meses[numeroMes]) {
      throw new Error('El mes no está inicializado');
    }
    
    const pasivoIndex = datos.meses[numeroMes].pasivos.findIndex(pasivo => pasivo.id === id);
    if (pasivoIndex === -1) {
      throw new Error('Pasivo no encontrado');
    }
    
    const pasivoEliminado = datos.meses[numeroMes].pasivos.splice(pasivoIndex, 1)[0];
    guardarDatosStorage(datos);
    return pasivoEliminado;
  } catch (error) {
    console.error('Error eliminando pasivo:', error);
    throw error;
  }
};

// Exportar datos para respaldo
export const exportarDatos = async () => {
  try {
    const datos = obtenerDatosStorage();
    return JSON.stringify(datos, null, 2);
  } catch (error) {
    console.error('Error exportando datos:', error);
    throw error;
  }
};

// Importar datos desde respaldo
export const importarDatos = async (datosJSON) => {
  try {
    const datos = JSON.parse(datosJSON);
    const guardado = guardarDatosStorage(datos);
    if (!guardado) {
      throw new Error('No se pudieron importar los datos');
    }
    return true;
  } catch (error) {
    console.error('Error importando datos:', error);
    throw error;
  }
};

// Obtener estadísticas generales
export const obtenerEstadisticas = async () => {
  try {
    const datos = obtenerDatosStorage();
    const estadisticas = {
      totalMeses: Object.keys(datos.meses || {}).length,
      mesActual: obtenerNumeroMes(),
      fechaCreacion: datos.configuracion?.fechaCreacion || null
    };
    
    return estadisticas;
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    throw error;
  }
};

// Funciones para reportes históricos
export const generarReporteMensual = async (mesId = null) => {
  try {
    const datos = obtenerDatosStorage();
    const mesActual = mesId || obtenerNumeroMes();
    const datosMes = datos.meses[mesActual];
    
    if (!datosMes) {
      throw new Error(`No hay datos para el mes ${mesActual}`);
    }

    // Calcular totales
    const totalIngresos = datosMes.ingresos.reduce((sum, item) => sum + item.valor, 0);
    const totalActivos = datosMes.activos.reduce((sum, item) => sum + item.valor, 0);
    const totalPasivos = datosMes.pasivos.reduce((sum, item) => sum + item.valor, 0);
    
    // Calcular métricas financieras
    const patrimonioNeto = totalActivos - totalPasivos;
    const liquidezDisponible = totalIngresos - totalPasivos;
    const ratioDeuda = totalActivos > 0 ? (totalPasivos / totalActivos) * 100 : 0;

    const reporte = {
      id: mesActual,
      fecha: new Date().toISOString(),
      periodo: mesActual,
      resumen: {
        totalIngresos,
        totalActivos,
        totalPasivos,
        patrimonioNeto,
        liquidezDisponible,
        ratioDeuda: Math.round(ratioDeuda * 100) / 100
      },
      detalles: {
        ingresos: datosMes.ingresos.map(item => ({
          descripcion: item.descripcion,
          valor: item.valor,
          fecha: item.fecha
        })),
        activos: datosMes.activos.map(item => ({
          descripcion: item.descripcion,
          valor: item.valor,
          fecha: item.fecha
        })),
        pasivos: datosMes.pasivos.map(item => ({
          descripcion: item.descripcion,
          valor: item.valor,
          fecha: item.fecha
        }))
      },
      analisis: {
        situacionPatrimonial: patrimonioNeto >= 0 ? 'Positiva' : 'Negativa',
        situacionLiquidez: liquidezDisponible >= 0 ? 'Buena' : 'Ajustada',
        nivelEndeudamiento: ratioDeuda < 30 ? 'Bajo' : ratioDeuda < 60 ? 'Moderado' : 'Alto'
      }
    };

    return reporte;
  } catch (error) {
    console.error('Error generando reporte mensual:', error);
    throw error;
  }
};

export const guardarReporteMensual = async (reporte) => {
  try {
    const datos = obtenerDatosStorage();
    
    if (!datos.reportes) {
      datos.reportes = {};
    }
    
    datos.reportes[reporte.id] = reporte;
    guardarDatosStorage(datos);
    
    return reporte;
  } catch (error) {
    console.error('Error guardando reporte mensual:', error);
    throw error;
  }
};

export const obtenerReportesHistoricos = async () => {
  try {
    const datos = obtenerDatosStorage();
    return datos.reportes || {};
  } catch (error) {
    console.error('Error obteniendo reportes históricos:', error);
    throw error;
  }
};

export const obtenerReportePorMes = async (mesId) => {
  try {
    const datos = obtenerDatosStorage();
    return datos.reportes?.[mesId] || null;
  } catch (error) {
    console.error('Error obteniendo reporte por mes:', error);
    throw error;
  }
};

export const obtenerDatosMesPorId = async (mesId) => {
  try {
    const datos = obtenerDatosStorage();
    return datos.meses?.[mesId] || null;
  } catch (error) {
    console.error('Error obteniendo datos del mes:', error);
    throw error;
  }
};

export const generarYGuardarReporteMensual = async (mesId = null) => {
  try {
    const reporte = await generarReporteMensual(mesId);
    await guardarReporteMensual(reporte);
    return reporte;
  } catch (error) {
    console.error('Error generando y guardando reporte mensual:', error);
    throw error;
  }
};

// Función para obtener comparativa entre dos meses
export const obtenerComparativaMeses = async (mesId1, mesId2) => {
  try {
    const reporte1 = await obtenerReportePorMes(mesId1);
    const reporte2 = await obtenerReportePorMes(mesId2);
    
    if (!reporte1 || !reporte2) {
      return null;
    }

    const comparativa = {
      mes1: {
        periodo: reporte1.periodo,
        fecha: reporte1.fecha,
        resumen: reporte1.resumen
      },
      mes2: {
        periodo: reporte2.periodo,
        fecha: reporte2.fecha,
        resumen: reporte2.resumen
      },
      diferencias: {
        ingresos: reporte2.resumen.totalIngresos - reporte1.resumen.totalIngresos,
        activos: reporte2.resumen.totalActivos - reporte1.resumen.totalActivos,
        pasivos: reporte2.resumen.totalPasivos - reporte1.resumen.totalPasivos,
        patrimonioNeto: reporte2.resumen.patrimonioNeto - reporte1.resumen.patrimonioNeto,
        liquidez: reporte2.resumen.liquidezDisponible - reporte1.resumen.liquidezDisponible
      },
      porcentajes: {
        ingresos: reporte1.resumen.totalIngresos !== 0 ? 
          ((reporte2.resumen.totalIngresos - reporte1.resumen.totalIngresos) / Math.abs(reporte1.resumen.totalIngresos)) * 100 : 0,
        activos: reporte1.resumen.totalActivos !== 0 ? 
          ((reporte2.resumen.totalActivos - reporte1.resumen.totalActivos) / Math.abs(reporte1.resumen.totalActivos)) * 100 : 0,
        pasivos: reporte1.resumen.totalPasivos !== 0 ? 
          ((reporte2.resumen.totalPasivos - reporte1.resumen.totalPasivos) / Math.abs(reporte1.resumen.totalPasivos)) * 100 : 0,
        patrimonioNeto: reporte1.resumen.patrimonioNeto !== 0 ? 
          ((reporte2.resumen.patrimonioNeto - reporte1.resumen.patrimonioNeto) / Math.abs(reporte1.resumen.patrimonioNeto)) * 100 : 0,
        liquidez: reporte1.resumen.liquidezDisponible !== 0 ? 
          ((reporte2.resumen.liquidezDisponible - reporte1.resumen.liquidezDisponible) / Math.abs(reporte1.resumen.liquidezDisponible)) * 100 : 0
      }
    };

    return comparativa;
  } catch (error) {
    console.error('Error al obtener comparativa entre meses:', error);
    throw error;
  }
};

// Función para obtener tendencias de los últimos N meses
export const obtenerTendenciasMeses = async (numeroMeses = 6) => {
  try {
    const reportes = await obtenerReportesHistoricos();
    const reportesArray = Object.values(reportes);
    
    if (!reportesArray || reportesArray.length === 0) {
      return null;
    }

    // Ordenar reportes por fecha (más recientes primero)
    const reportesOrdenados = reportesArray
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, numeroMeses);

    const tendencias = {
      meses: reportesOrdenados.map(r => r.periodo),
      ingresos: reportesOrdenados.map(r => r.resumen.totalIngresos),
      activos: reportesOrdenados.map(r => r.resumen.totalActivos),
      pasivos: reportesOrdenados.map(r => r.resumen.totalPasivos),
      patrimonioNeto: reportesOrdenados.map(r => r.resumen.patrimonioNeto),
      liquidez: reportesOrdenados.map(r => r.resumen.liquidezDisponible),
      promedios: {
        ingresos: reportesOrdenados.reduce((sum, r) => sum + r.resumen.totalIngresos, 0) / reportesOrdenados.length,
        activos: reportesOrdenados.reduce((sum, r) => sum + r.resumen.totalActivos, 0) / reportesOrdenados.length,
        pasivos: reportesOrdenados.reduce((sum, r) => sum + r.resumen.totalPasivos, 0) / reportesOrdenados.length,
        patrimonioNeto: reportesOrdenados.reduce((sum, r) => sum + r.resumen.patrimonioNeto, 0) / reportesOrdenados.length,
        liquidez: reportesOrdenados.reduce((sum, r) => sum + r.resumen.liquidezDisponible, 0) / reportesOrdenados.length
      }
    };

    return tendencias;
  } catch (error) {
    console.error('Error al obtener tendencias de meses:', error);
    throw error;
  }
};

// ==================== FUNCIONES PARA DEUDAS PROGRAMADAS ====================

// Crear una nueva deuda programada
export const crearDeudaProgramada = async (deudaData) => {
  try {
    const { descripcion, categoria, valor, frecuencia, fechaInicio, fechaFin } = deudaData;
    
    if (!descripcion || !categoria || !valor || !frecuencia || !fechaInicio) {
      throw new Error('Todos los campos obligatorios deben estar completos');
    }

    const datos = obtenerDatosStorage();
    
    if (!datos.deudasProgramadas) {
      datos.deudasProgramadas = {};
    }

    const nuevaDeuda = {
      id: Date.now().toString(),
      descripcion: descripcion.trim(),
      categoria,
      valor: parseFloat(valor),
      frecuencia, // 'mensual', 'quincenal', 'semanal'
      fechaInicio: new Date(fechaInicio).toISOString(),
      fechaFin: fechaFin ? new Date(fechaFin).toISOString() : null,
      activa: true,
      fechaCreacion: new Date().toISOString(),
      proximaGeneracion: calcularProximaGeneracion(fechaInicio, frecuencia),
      configuracion: generarConfiguracionFrecuencia(frecuencia, fechaInicio)
    };

    datos.deudasProgramadas[nuevaDeuda.id] = nuevaDeuda;
    
    const guardado = guardarDatosStorage(datos);
    if (!guardado) {
      throw new Error('No se pudo guardar la deuda programada');
    }

    return nuevaDeuda;
  } catch (error) {
    console.error('Error creando deuda programada:', error);
    throw error;
  }
};

// Obtener todas las deudas programadas
export const obtenerDeudasProgramadas = async () => {
  try {
    const datos = obtenerDatosStorage();
    return Object.values(datos.deudasProgramadas || {});
  } catch (error) {
    console.error('Error obteniendo deudas programadas:', error);
    throw error;
  }
};

// Obtener deudas programadas activas
export const obtenerDeudasProgramadasActivas = async () => {
  try {
    const todasLasDeudas = await obtenerDeudasProgramadas();
    return todasLasDeudas.filter(deuda => deuda.activa);
  } catch (error) {
    console.error('Error obteniendo deudas programadas activas:', error);
    throw error;
  }
};

// Editar deuda programada
export const editarDeudaProgramada = async (id, datosActualizados) => {
  try {
    const datos = obtenerDatosStorage();
    
    if (!datos.deudasProgramadas || !datos.deudasProgramadas[id]) {
      throw new Error('Deuda programada no encontrada');
    }

    const deudaActual = datos.deudasProgramadas[id];
    const deudaActualizada = {
      ...deudaActual,
      ...datosActualizados,
      fechaModificacion: new Date().toISOString()
    };

    // Recalcular próxima generación si cambió la frecuencia o fecha de inicio
    if (datosActualizados.frecuencia || datosActualizados.fechaInicio) {
      deudaActualizada.proximaGeneracion = calcularProximaGeneracion(
        deudaActualizada.fechaInicio, 
        deudaActualizada.frecuencia
      );
      deudaActualizada.configuracion = generarConfiguracionFrecuencia(
        deudaActualizada.frecuencia, 
        deudaActualizada.fechaInicio
      );
    }

    datos.deudasProgramadas[id] = deudaActualizada;
    guardarDatosStorage(datos);
    
    return deudaActualizada;
  } catch (error) {
    console.error('Error editando deuda programada:', error);
    throw error;
  }
};

// Eliminar deuda programada
export const eliminarDeudaProgramada = async (id) => {
  try {
    const datos = obtenerDatosStorage();
    
    if (!datos.deudasProgramadas || !datos.deudasProgramadas[id]) {
      throw new Error('Deuda programada no encontrada');
    }

    const deudaEliminada = datos.deudasProgramadas[id];
    delete datos.deudasProgramadas[id];
    guardarDatosStorage(datos);
    
    return deudaEliminada;
  } catch (error) {
    console.error('Error eliminando deuda programada:', error);
    throw error;
  }
};

// Activar/Desactivar deuda programada
export const toggleDeudaProgramada = async (id) => {
  try {
    const datos = obtenerDatosStorage();
    
    if (!datos.deudasProgramadas || !datos.deudasProgramadas[id]) {
      throw new Error('Deuda programada no encontrada');
    }

    datos.deudasProgramadas[id].activa = !datos.deudasProgramadas[id].activa;
    datos.deudasProgramadas[id].fechaModificacion = new Date().toISOString();
    
    guardarDatosStorage(datos);
    return datos.deudasProgramadas[id];
  } catch (error) {
    console.error('Error cambiando estado de deuda programada:', error);
    throw error;
  }
};

// Verificar deudas pendientes para el mes actual
export const verificarDeudasPendientes = async () => {
  try {
    const deudasActivas = await obtenerDeudasProgramadasActivas();
    const fechaActual = new Date();
    const mesActual = obtenerNumeroMes();
    
    const deudasPendientes = [];
    
    for (const deuda of deudasActivas) {
      const proximaGeneracion = new Date(deuda.proximaGeneracion);
      
      // Verificar si la deuda debe generarse este mes
      if (proximaGeneracion <= fechaActual) {
        // Verificar si ya existe en el mes actual
        const datosMes = await obtenerDatosMes();
        const yaExiste = datosMes.pasivos?.some(pasivo => 
          pasivo.deudaProgramadaId === deuda.id
        );
        
        if (!yaExiste) {
          deudasPendientes.push(deuda);
        }
      }
    }
    
    return deudasPendientes;
  } catch (error) {
    console.error('Error verificando deudas pendientes:', error);
    throw error;
  }
};

// Generar deudas automáticamente
export const generarDeudasAutomaticas = async (deudasSeleccionadas = null) => {
  try {
    const deudasPendientes = deudasSeleccionadas || await verificarDeudasPendientes();
    const deudasGeneradas = [];
    
    for (const deuda of deudasPendientes) {
      // Crear el pasivo automáticamente
      const nuevoPasivo = await insertarPasivo(
        `${deuda.descripcion} (Automático)`,
        deuda.valor,
        deuda.categoria
      );
      
      // Agregar referencia a la deuda programada
      const datos = obtenerDatosStorage();
      const numeroMes = obtenerNumeroMes();
      const pasivoIndex = datos.meses[numeroMes].pasivos.findIndex(p => p.id === nuevoPasivo.id);
      
      if (pasivoIndex !== -1) {
        datos.meses[numeroMes].pasivos[pasivoIndex].deudaProgramadaId = deuda.id;
        datos.meses[numeroMes].pasivos[pasivoIndex].esAutomatico = true;
        guardarDatosStorage(datos);
      }
      
      // Actualizar próxima generación
      await actualizarProximaGeneracion(deuda.id);
      
      deudasGeneradas.push({
        deuda: deuda,
        pasivo: nuevoPasivo
      });
    }
    
    return deudasGeneradas;
  } catch (error) {
    console.error('Error generando deudas automáticas:', error);
    throw error;
  }
};

// Funciones auxiliares
const calcularProximaGeneracion = (fechaInicio, frecuencia) => {
  const fecha = new Date(fechaInicio);
  const hoy = new Date();
  
  switch (frecuencia) {
    case 'mensual':
      // Encontrar el próximo mes
      while (fecha <= hoy) {
        fecha.setMonth(fecha.getMonth() + 1);
      }
      break;
    case 'quincenal':
      // Cada 15 días
      while (fecha <= hoy) {
        fecha.setDate(fecha.getDate() + 15);
      }
      break;
    case 'semanal':
      // Cada 7 días
      while (fecha <= hoy) {
        fecha.setDate(fecha.getDate() + 7);
      }
      break;
    default:
      throw new Error('Frecuencia no válida');
  }
  
  return fecha.toISOString();
};

const generarConfiguracionFrecuencia = (frecuencia, fechaInicio) => {
  const fecha = new Date(fechaInicio);
  
  switch (frecuencia) {
    case 'mensual':
      return {
        diaDelMes: fecha.getDate()
      };
    case 'quincenal':
      return {
        intervalo: 15
      };
    case 'semanal':
      return {
        diaDeLaSemana: fecha.getDay(),
        intervalo: 7
      };
    default:
      return {};
  }
};

const actualizarProximaGeneracion = async (deudaId) => {
  try {
    const datos = obtenerDatosStorage();
    const deuda = datos.deudasProgramadas[deudaId];
    
    if (deuda) {
      deuda.proximaGeneracion = calcularProximaGeneracion(
        deuda.proximaGeneracion, 
        deuda.frecuencia
      );
      guardarDatosStorage(datos);
    }
  } catch (error) {
    console.error('Error actualizando próxima generación:', error);
    throw error;
  }
};

// Función para calcular días hasta vencimiento
export const calcularDiasHastaVencimiento = (fechaProximaGeneracion) => {
  try {
    const hoy = new Date();
    const fechaVencimiento = new Date(fechaProximaGeneracion);
    
    // Normalizar las fechas para comparar solo días (sin horas)
    hoy.setHours(0, 0, 0, 0);
    fechaVencimiento.setHours(0, 0, 0, 0);
    
    const diferenciaTiempo = fechaVencimiento.getTime() - hoy.getTime();
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    
    return diferenciaDias;
  } catch (error) {
    console.error('Error calculando días hasta vencimiento:', error);
    return null;
  }
};

// Función para obtener deudas programadas con información de vencimiento
export const obtenerDeudasProgramadasConVencimiento = async () => {
  try {
    const deudas = await obtenerDeudasProgramadasActivas();
    
    return deudas.map(deuda => {
      const diasHastaVencimiento = calcularDiasHastaVencimiento(deuda.proximaGeneracion);
      
      return {
        ...deuda,
        diasHastaVencimiento,
        esHoy: diasHastaVencimiento === 0,
        esProximo: diasHastaVencimiento >= 0 && diasHastaVencimiento <= 7,
        estaVencida: diasHastaVencimiento < 0
      };
    });
  } catch (error) {
    console.error('Error obteniendo deudas con vencimiento:', error);
    return [];
  }
};

// Inicializar automáticamente al cargar el módulo
inicializarDB();