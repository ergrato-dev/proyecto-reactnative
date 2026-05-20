/**
 * Pantalla de inicio de sesión con Supabase.
 *
 * @what Formulario de email + contraseña con validación Zod. Incluye botón
 *   de autenticación biométrica (huella / Face ID) si el hardware está
 *   disponible y el usuario ya inició sesión previamente. Tras 3 fallos
 *   biométricos consecutivos el botón se oculta y se muestra un aviso para
 *   usar la contraseña (criterio de aceptación HU-12).
 * @why El módulo auth demuestra el flujo completo de autenticación con
 *   Supabase: registro, login, biometría y persistencia de sesión segura.
 * @impact Usa `useAuthActions` para delegar la lógica de Supabase y
 *   `useBiometrics` para el prompt nativo. Al autenticarse correctamente,
 *   `useAuthSession` reacciona automáticamente y navega a ObservationLog.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/modules/navigation/types';
import { useAuthActions } from '../hooks/useAuthActions';
import { useAuthSession } from '../hooks/useAuthSession';
import { useBiometrics } from '../hooks/useBiometrics';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Auth'>;

// ─── Esquema de validación ────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de login / perfil de usuario.
 *
 * @what Muestra el formulario de login si no hay sesión activa, o el
 *   perfil del usuario con acceso al diario si la sesión existe.
 * @why React Navigation registra esta pantalla como `Auth`; el contenido
 *   cambia según el estado de la sesión.
 * @impact Navega a `ObservationLog` al pulsar "Ver diario". El estado de
 *   sesión lo gestiona `useAuthSession` reactivamente.
 */
export function LoginScreen({ navigation }: Props) {
  const { user, loading: sessionLoading } = useAuthSession();
  const { state: authState, login, logout } = useAuthActions();
  const biometrics = useBiometrics();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Si ya hay sesión activa → mostrar perfil
  if (sessionLoading) {
    return (
      <View style={styles.centered} testID="loading-screen">
        <ActivityIndicator color="#4fc3f7" size="large" />
      </View>
    );
  }

  if (user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="profile-screen">
        <Text style={styles.starIcon}>⭐</Text>
        <Text style={styles.title}>Perfil de Observador</Text>
        <Text style={styles.email}>{user.email}</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ObservationLog')}
          testID="go-to-diary-button"
        >
          <Text style={styles.primaryButtonText}>📔 Ver mi diario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={logout}
          disabled={authState.loading}
          testID="logout-button"
        >
          {authState.loading ? (
            <ActivityIndicator color="#ef5350" size="small" />
          ) : (
            <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Formulario de login
  const handleLogin = async () => {
    setValidationError(null);
    const result = loginSchema.safeParse({ email: email.trim(), password });
    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }
    await login(result.data.email, result.data.password);
  };

  const handleBiometricLogin = async () => {
    const ok = await biometrics.authenticate();
    if (!ok) return;
    // La biometría confirma identidad local; la sesión ya debe estar en
    // expo-secure-store. Si no hay sesión Supabase, pedimos credenciales.
    if (!user) {
      setValidationError('Introduce tus credenciales para vincular la biometría.');
    }
  };

  const displayError = validationError ?? authState.error ?? biometrics.error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="login-screen"
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.starIcon}>🔭</Text>
        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Accede a tu diario de observaciones</Text>

        {displayError ? (
          <View style={styles.errorBanner} testID="error-banner">
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#546e7a"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          testID="email-input"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#546e7a"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          testID="password-input"
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={authState.loading}
          testID="login-button"
        >
          {authState.loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        {/* Botón biométrico: visible solo si está disponible Y no está bloqueado (HU-12) */}
        {biometrics.isAvailable && !biometrics.isLocked && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
            disabled={biometrics.loading}
            testID="biometric-button"
          >
            <Text style={styles.biometricButtonText}>
              🔑 Usar {biometrics.biometryType ?? 'biometría'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Aviso de bloqueo biométrico: aparece tras 3 fallos consecutivos (HU-12) */}
        {biometrics.isLocked && (
          <View style={styles.lockBanner} testID="biometric-locked-banner">
            <Text style={styles.lockBannerText}>
              Has superado el límite de intentos biométricos. Usa tu contraseña.
            </Text>
            <TouchableOpacity onPress={biometrics.resetLock} testID="biometric-reset-button">
              <Text style={styles.linkText}>Reintentar biometría</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register' as never)}
          testID="go-to-register-button"
        >
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050d24' },
  centered: { flex: 1, backgroundColor: '#050d24', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingTop: 48, alignItems: 'center' },
  starIcon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: '#e3f2fd', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#78909c', marginBottom: 28, textAlign: 'center' },
  email: { fontSize: 16, color: '#4fc3f7', marginBottom: 32 },
  errorBanner: {
    backgroundColor: 'rgba(183,28,28,0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorText: { color: '#ef9a9a', fontSize: 13 },
  input: {
    width: '100%',
    backgroundColor: '#0d1b2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1565c0',
    color: '#e3f2fd',
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#1565c0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef5350',
    marginBottom: 12,
  },
  secondaryButtonText: { color: '#ef5350', fontSize: 15, fontWeight: '600' },
  biometricButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1565c0',
    marginBottom: 12,
    backgroundColor: 'rgba(21,101,192,0.12)',
  },
  biometricButtonText: { color: '#4fc3f7', fontSize: 15 },
  lockBanner: {
    width: '100%',
    backgroundColor: 'rgba(230,81,0,0.15)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e65100',
    alignItems: 'center',
    gap: 8,
  },
  lockBannerText: { color: '#ffb74d', fontSize: 13, textAlign: 'center' },
  linkButton: { marginTop: 8 },
  linkText: { color: '#4fc3f7', fontSize: 14 },
});
