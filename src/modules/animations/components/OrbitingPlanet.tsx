import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import { PlanetData } from '../data/planets';

interface OrbitingPlanetProps {
  /** Datos del planeta (color, radio, radio orbital) */
  planet: PlanetData;
  /** Ángulo actual en radianes, provisto por useOrbitAnimation */
  angle: SharedValue<number>;
  /** Centro del sistema solar en px (usualmente la mitad del contenedor) */
  centerX: number;
  centerY: number;
  /** Callback cuando el usuario toca el planeta */
  onPress: (planet: PlanetData) => void;
}

/**
 * @what Componente que renderiza un planeta orbitando alrededor del sol.
 * @why Encapsula la lógica de transformación trigonométrica (cos/sin) en un
 *   worklet de Reanimated para mantener la animación en el hilo de UI sin bloquear JS.
 * @impact Depende de `useOrbitAnimation` para el SharedValue de ángulo.
 *   Cada instancia crea su propio SharedValue de escala para el efecto spring al tocar.
 *   Cambios en `orbitRadius` o `radius` del planeta afectan el layout visual.
 */
export function OrbitingPlanet({
  planet,
  angle,
  centerX,
  centerY,
  onPress,
}: OrbitingPlanetProps) {
  // Escala para el efecto spring al tocar el planeta
  const scale = useSharedValue(1);

  /** Estilo animado: posición orbital calculada con trigonometría en worklet */
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const x = centerX + planet.orbitRadius * Math.cos(angle.value) - planet.radius;
    const y = centerY + planet.orbitRadius * Math.sin(angle.value) - planet.radius;
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: scale.value },
      ],
    };
  });

  const handlePress = () => {
    // Efecto spring al tocar: crece y vuelve
    scale.value = withSpring(1.6, { damping: 4, stiffness: 300 }, () => {
      'worklet';
      scale.value = withSpring(1);
    });
    onPress(planet);
  };

  return (
    <>
      {/* Anillo orbital (estático) */}
      <View
        style={[
          styles.orbitRing,
          {
            width: planet.orbitRadius * 2,
            height: planet.orbitRadius * 2,
            borderRadius: planet.orbitRadius,
            left: centerX - planet.orbitRadius,
            top: centerY - planet.orbitRadius,
          },
        ]}
      />
      {/* Punto del planeta (animado) */}
      <Animated.View
        style={[styles.planetContainer, animatedStyle]}
        testID={`planet-${planet.id}`}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <View
            style={[
              styles.planet,
              {
                width: planet.radius * 2,
                height: planet.radius * 2,
                borderRadius: planet.radius,
                backgroundColor: planet.color,
              },
            ]}
          />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  orbitRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'transparent',
  },
  planetContainer: {
    position: 'absolute',
  },
  planet: {
    shadowColor: '#fff',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});
