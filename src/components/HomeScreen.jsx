import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mesEstaInicializado } from '../utils/database';

function HomeScreen() {
  const [mesInicializado, setMesInicializado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarInicializacion();
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
      <div className="header-gradient text-white py-8 px-6 text-center shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Finanzas Personales</h1>
        <p className="text-primary-100 text-lg">Gestiona tus finanzas de manera inteligente</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Gestionar Ingresos */}
              <Link to="/iniciar-mes" className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer group py-2 px-4 rounded-lg">
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
              <Link to="/activos" className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer group py-2 px-4 rounded-lg">
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
              <Link to="/pasivos" className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer group py-2 px-4 rounded-lg">
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
              <Link to="/reportes" className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer group py-2 px-4 rounded-lg">
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
    </div>
  );
}

export default HomeScreen;