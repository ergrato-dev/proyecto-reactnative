/**
 * Pantalla de registro de nuevo usuario con Supabase.
 *
 * @what Formulario email + contraseña + confirmación, validado con Zod.
 *   Al registrarse correctamente, Supabase envía email de confirmación y
 *   la pantalla muestra un banner de éxito.
 * @why El flujo de registro es independiente del login para seguir el
 *   principio de responsabilidad única y facilitar el testing.
 * @impact Usa `useAuthActions.register`. Errores de Supabase (email ya
 *   en uso, contraseña débil) se muestran en español al usuario.
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

type Props = NativeStackScreenProps<ProfileStackParamList, 'Register'>;

// ─── Esquema de validación ────────────────────────────────────────────────────

const registerSchema = z
  .object({
    email: z.string().email('Introduce un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de registro de observador.
 *
 * @what Formulario de registro con validación Zod; al registrarse con
 *   éxito muestra un banner de confirmación y vuelve al login.
 * @why Supabase requiere confirmación de email por defecto; esta pantalla
 *   guía al usuario sobre el paso siguiente.
 * @impact Al registrarse correctamente no hay sesión activa hasta que el
 *   usuario confirme su email y vuelva a iniciar sesión.
 */
export function RegisterScreen({ navigation }: Props) {
  const { state: authState, register } = useAuthActions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setValidationError(null);
    const result = registerSchema.safeParse({
      email: email.trim(),
      password,
      confirmPassword,
    });
    if (!result.success) {
      setValidationError(result.error.issues[0].message);
      return;
    }
    const ok = await register(result.data.email, result.data.password);
    if (ok) setSuccess(true);
  };

  if (success) {
    return (
      <View style={styles.centered} testID="success-screen">
        <Text style={styles.successIcon}>✉️</Text>
        <Text style={styles.title}>¡Registro exitoso!</Text>
        <Text style={styles.subtitle}>
          Revisa tu email para confirmar tu cuenta y luego inicia sesión.
        </Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
          testID="go-to-login-button"
        >
          <Text style={styles.primaryButtonText}>Ir al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayError = validationError ?? authState.error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="register-screen"
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.starIcon}>🚀</Text>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Empieza tu diario de observaciones astronómicas</Text>

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
          placeholder="Contraseña (mín. 6 caracteres)"
          placeholderTextColor="#546e7a"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          testID="password-input"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar contraseña"
          placeholderTextColor="#546e7a"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          testID="confirm-password-input"
        />

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={authState.loading}
          testID="register-button"
        >
          {authState.loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.goBack()}
          testID="go-to-login-link"
        >
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050d24' },
  centered: {
    flex: 1,
    backgroundColor: '#050d24',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: { padding: 24, paddingTop: 48, alignItems: 'center' },
  starIcon: { fontSize: 48, marginBottom: 12 },
  successIcon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#e3f2fd', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#78909c', marginBottom: 28, textAlign: 'center' },
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
  linkButton: { marginTop: 8 },
  linkText: { color: '#4fc3f7', fontSize: 14 },
});
