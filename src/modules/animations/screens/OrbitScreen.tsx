import React, { useCallback, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import type { DrawerScreenProps } from '@react-navigation/drawer';

import { PLANETS, PlanetData } from '../data/planets';
import { OrbitingPlanet } from '../components/OrbitingPlanet';
import { useOrbitAnimation } from '../hooks/useOrbitAnimation';
import type { DrawerParamList } from '@/modules/navigation/types';

/**
 * @what Pantalla principal del módulo de animaciones: muestra el sistema solar interior
 *   con órbitas animadas usando Reanimated 4 worklets.
 * @why Demuestra capacidades clave de React Native: animaciones continuas en hilo de UI,
 *   gestos de arrastre con GestureDetector, y efectos spring al interactuar con planetas.
 * @impact Requiere `react-native-reanimated@4.x` y `react-native-gesture-handler@2.x`.
 *   La pantalla es independiente: no depende de APIs externas ni de Supabase.
 */

type Props = DrawerScreenProps<DrawerParamList, 'Animations'>;

/** Tamaño del canvas de animación (cuadrado, centrado en pantalla) */
const CANVAS_SIZE = 420;
const CENTER = CANVAS_SIZE / 2;
/** Radio del sol en px */
const SUN_RADIUS = 22;

/** Hook que gestiona las 4 animaciones orbitales de manera unificada */
function useSolarSystem() {
  const mercury = useOrbitAnimation(PLANETS[0].periodMs, 0.3);
  const venus = useOrbitAnimation(PLANETS[1].periodMs, 1.2);
  const earth = useOrbitAnimation(PLANETS[2].periodMs, 2.5);
  const mars = useOrbitAnimation(PLANETS[3].periodMs, 4.1);

  const animations = [mercury, venus, earth, mars];

  const pauseAll = useCallback(() => {
    animations.forEach((a) => a.pause());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resumeAll = useCallback(() => {
    animations.forEach((a) => a.resume());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { animations, pauseAll, resumeAll, isPlaying: mercury.isPlaying };
}

export function OrbitScreen(_props: Props) {
  const { animations, pauseAll, resumeAll, isPlaying } = useSolarSystem();
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);

  // Rotación global del sistema (drag gesture)
  const systemRotation = useSharedValue(0);
  const lastRotation = useRef(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      // Rotación proporcional al desplazamiento horizontal
      systemRotation.value = lastRotation.current + event.translationX * 0.005;
    })
    .onEnd(() => {
      'worklet';
      runOnJS((v: number) => { lastRotation.current = v; })(systemRotation.value);
    });

  const systemStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${systemRotation.value}rad` }],
  }));

  const handlePlanetPress = useCallback((planet: PlanetData) => {
    setSelectedPlanet(planet);
  }, []);

  const handleToggle = useCallback(() => {
    if (isPlaying) {
      pauseAll();
    } else {
      resumeAll();
    }
  }, [isPlaying, pauseAll, resumeAll]);

  return (
    <SafeAreaView style={styles.safeArea} testID="orbit-screen">
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        {/* Título */}
        <Text style={styles.title}>Sistema Solar Interior</Text>
        <Text style={styles.subtitle}>
          Proporcional a los períodos reales orbitales
        </Text>

        {/* Canvas del sistema solar */}
        <GestureDetector gesture={panGesture}>
          <View style={styles.canvas}>
            <Animated.View style={[styles.solarSystem, systemStyle]}>
              {/* Sol */}
              <View
                style={[
                  styles.sun,
                  {
                    width: SUN_RADIUS * 2,
                    height: SUN_RADIUS * 2,
                    borderRadius: SUN_RADIUS,
                    left: CENTER - SUN_RADIUS,
                    top: CENTER - SUN_RADIUS,
                  },
                ]}
                testID="sun"
              />

              {/* Planetas */}
              {PLANETS.map((planet, index) => (
                <OrbitingPlanet
                  key={planet.id}
                  planet={planet}
                  angle={animations[index].angle}
                  centerX={CENTER}
                  centerY={CENTER}
                  onPress={handlePlanetPress}
                />
              ))}
            </Animated.View>
          </View>
        </GestureDetector>

        {/* Panel de información del planeta seleccionado */}
        {selectedPlanet && (
          <View style={styles.infoPanel} testID={`planet-label-${selectedPlanet.id}`}>
            <View
              style={[
                styles.colorDot,
                { backgroundColor: selectedPlanet.color },
              ]}
            />
            <View>
              <Text style={styles.planetName}>{selectedPlanet.name}</Text>
              <Text style={styles.planetPeriod}>
                Período orbital:{' '}
                {(selectedPlanet.periodMs / 1000).toFixed(1)} s (animación)
              </Text>
            </View>
          </View>
        )}

        {/* Controles */}
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={handleToggle}
          activeOpacity={0.7}
          testID="pause-resume-button"
        >
          <Text style={styles.toggleText}>
            {isPlaying ? '⏸  Pausar' : '▶  Reanudar'}
          </Text>
        </TouchableOpacity>

        {/* Leyenda de planetas */}
        <View style={styles.legend}>
          {PLANETS.map((planet) => (
            <View key={planet.id} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: planet.color },
                ]}
              />
              <Text style={styles.legendName} testID={`planet-label-legend-${planet.id}`}>
                {planet.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Nota técnica */}
        <Text style={styles.hint}>
          Arrastra para rotar el sistema · Toca un planeta para ver su info
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  scroll: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E8E8FF',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#8888AA',
    marginBottom: 20,
    textAlign: 'center',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  solarSystem: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  sun: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  infoPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 12,
    width: '90%',
    gap: 14,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  planetName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E8E8FF',
  },
  planetPeriod: {
    fontSize: 13,
    color: '#8888AA',
    marginTop: 2,
  },
  toggleButton: {
    marginTop: 20,
    paddingHorizontal: 40,
    paddingVertical: 14,
    backgroundColor: '#2A2A4A',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#4A4A8A',
  },
  toggleText: {
    color: '#E8E8FF',
    fontSize: 16,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    color: '#AAAACC',
    fontSize: 14,
  },
  hint: {
    color: '#555577',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
