/** @type {import('jest').Config} */
const config = {
  // Preset de Expo que configura Babel, transforms y entorno para React Native
  preset: 'jest-expo',

  // Extensiones a resolver
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Alias de paths para que coincidan con tsconfig.json (@/ → src/)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Patrones de archivos de test
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],

  // Archivos a excluir del análisis de cobertura
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
    '/coverage/',
    'index\\.ts$',
    '\\.d\\.ts$',
  ],

  // Recopilar cobertura solo de los archivos fuente en src/
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],

  // ── Umbral mínimo de cobertura (80%) ─────────────────────────────────────
  // Si alguno de estos valores cae por debajo del 80%, Jest retorna exit code 1
  // y bloquea el commit (configurar en el hook pre-commit de git o CI).
  coverageThreshold: {
    global: {
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
    },
  },

  // Formato de reporte de cobertura
  coverageReporters: ['text', 'lcov', 'html'],

  // Tiempo máximo por test (ms)
  testTimeout: 10000,

  // Archivo de setup que inyecta variables de entorno para todos los tests
  setupFiles: ['<rootDir>/jest.setup.js'],
};

module.exports = config;
