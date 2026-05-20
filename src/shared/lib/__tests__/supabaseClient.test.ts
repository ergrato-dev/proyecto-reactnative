/**
 * Tests del cliente singleton de Supabase.
 *
 * Como supabaseClient inicializa la conexión al importarse, se mockean
 * los módulos externos (@supabase/supabase-js y expo-secure-store)
 * para aislar la lógica de configuración del cliente.
 *
 * Nota: el módulo es un singleton y se cachea tras el primer import,
 * por eso las aserciones de configuración se agrupan en un solo test.
 */

// Mock de expo-secure-store antes de importar el módulo bajo test
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock inline de @supabase/supabase-js — sin captura de variable para evitar
// problemas de hoisting (jest.mock se hoista antes de las declaraciones const/let)
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({ _isMocked: true })),
}));

describe('supabaseClient', () => {
  it('debería crear el cliente con la configuración correcta desde las variables de entorno', async () => {
    // Obtener la referencia al mock DESPUÉS de que jest.mock haya sido aplicado
    const { createClient } = jest.requireMock('@supabase/supabase-js') as {
      createClient: jest.Mock;
    };

    // Act — require() síncrono del singleton; las variables de entorno
    // se inyectan desde jest.setup.js antes de ejecutar cualquier test
     
    const { supabase } = require('../supabaseClient') as { supabase: unknown };

    // Assert — el cliente existe
    expect(supabase).toBeDefined();
    expect(createClient).toHaveBeenCalledTimes(1);

    const [url, anonKey, options] = createClient.mock.calls[0] as [
      string,
      string,
      { auth: Record<string, unknown> },
    ];

    // URL y anon key desde variables de entorno
    expect(url).toBe('https://test-project.supabase.co');
    expect(anonKey).toBe('test-anon-key-for-jest');

    // Opciones de autenticación
    expect(options.auth.autoRefreshToken).toBe(true);
    expect(options.auth.persistSession).toBe(true);
    expect(options.auth.detectSessionInUrl).toBe(false); // no aplica en RN
    expect(options.auth.storage).toBeDefined();          // secureStoreAdapter

    // Ejercitar los métodos del secureStoreAdapter para cubrir las arrow functions
    const storage = options.auth.storage as {
      getItem: (key: string) => Promise<string | null>;
      setItem: (key: string, value: string) => Promise<void>;
      removeItem: (key: string) => Promise<void>;
    };
    const SecureStore = jest.requireMock('expo-secure-store') as {
      getItemAsync: jest.Mock;
      setItemAsync: jest.Mock;
      deleteItemAsync: jest.Mock;
    };

    await storage.getItem('test-key');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('test-key');

    await storage.setItem('test-key', 'test-value');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('test-key', 'test-value');

    await storage.removeItem('test-key');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('test-key');
  });

  it('debería lanzar un error si faltan las variables de entorno', () => {
    // Arrange — eliminar temporalmente las variables de entorno
    const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const originalKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    // Act & Assert — usar isolateModules para re-ejecutar el módulo sin caché
    expect(() => {
      jest.isolateModules(() => {
        require('../supabaseClient');
      });
    }).toThrow('Faltan variables de entorno de Supabase');

    // Restore
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = originalKey;
  });
});


