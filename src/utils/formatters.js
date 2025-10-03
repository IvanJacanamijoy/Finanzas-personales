// Utilidades para formatear números y moneda
import { useState } from 'react';

/**
 * Formatea un número agregando separadores de miles (puntos)
 * @param {string|number} value - El valor a formatear
 * @returns {string} - El número formateado con separadores de miles
 */
export const formatearNumeroConSeparadores = (value) => {
  if (!value) return '';
  
  // Convertir a string y remover cualquier carácter que no sea número
  const numeroLimpio = value.toString().replace(/[^\d]/g, '');
  
  if (!numeroLimpio) return '';
  
  // Agregar separadores de miles (puntos)
  return numeroLimpio.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Remueve los separadores de miles de un string formateado
 * @param {string} formattedValue - El valor formateado con separadores
 * @returns {string} - El número sin separadores
 */
export const removerSeparadores = (formattedValue) => {
  if (!formattedValue) return '';
  return formattedValue.toString().replace(/\./g, '');
};

/**
 * Convierte un valor formateado a número
 * @param {string} formattedValue - El valor formateado
 * @returns {number} - El número convertido
 */
export const convertirANumero = (formattedValue) => {
  const numeroLimpio = removerSeparadores(formattedValue);
  return parseFloat(numeroLimpio) || 0;
};

/**
 * Formatea un número como moneda colombiana
 * @param {number} monto - El monto a formatear
 * @returns {string} - El monto formateado como moneda
 */
export const formatearMoneda = (monto) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(monto);
};

/**
 * Hook personalizado para manejar inputs con formateo de números
 * @param {string} initialValue - Valor inicial
 * @returns {object} - Objeto con value, displayValue y handlers
 */
export const useFormattedInput = (initialValue = '') => {
  const [rawValue, setRawValue] = useState(initialValue);
  const [displayValue, setDisplayValue] = useState(
    initialValue ? formatearNumeroConSeparadores(initialValue) : ''
  );

  const handleChange = (e) => {
    const inputValue = e.target.value;
    const numeroLimpio = removerSeparadores(inputValue);
    
    setRawValue(numeroLimpio);
    setDisplayValue(formatearNumeroConSeparadores(numeroLimpio));
  };

  const setValue = (newValue) => {
    const valorLimpio = newValue.toString();
    setRawValue(valorLimpio);
    setDisplayValue(formatearNumeroConSeparadores(valorLimpio));
  };

  return {
    value: rawValue,
    displayValue,
    handleChange,
    setValue
  };
};