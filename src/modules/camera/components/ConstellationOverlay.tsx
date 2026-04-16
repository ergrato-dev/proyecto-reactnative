import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions, Text } from 'react-native';
import Svg, { Line, Circle, Text as SvgText } from 'react-native-svg';
import type { ARConstellation } from '../data/constellations';

/** Props del componente `ConstellationOverlay` */
export interface ConstellationOverlayProps {
  /** Lista de constelaciones a renderizar sobre la vista de cámara */
  constellations: ARConstellation[];
  /** Rotación del giroscopio en el eje X (pitch, grados) para alinear el overlay */
  pitchDeg?: number;
  /** Rotación del giroscopio en el eje Z (roll, grados) para alinear el overlay */
  rollDeg?: number;
}

/** Radio de los puntos de estrellas en función de la magnitud aparente */
function starRadius(magnitude: number): number {
  // Magnitud -1.5 → r=8, magnitud 3.5 → r=3 (inversamente proporcional)
  return Math.max(3, 8 - magnitude * 1.2);
}

/**
 * @what Renderiza un overlay SVG semitransparente con las constelaciones
 *   proyectadas sobre la vista de la cámara. Las posiciones se ajustan
 *   suavemente con los datos del giroscopio para simular alineación AR.
 * @why El módulo de cámara necesita un overlay vectorial que no impacte el
 *   rendimiento de la cámara; SVG es la solución más liviana sin depender
 *   de WebGL ni Three.js.
 * @impact Usado exclusivamente por `ARConstellationScreen`. Si se cambia la
 *   estructura de `ARConstellation`, este componente debe actualizarse.
 */
export function ConstellationOverlay({
  constellations,
  pitchDeg = 0,
  rollDeg = 0,
}: ConstellationOverlayProps) {
  const { width, height } = useWindowDimensions();

  // Desplazamiento en píxeles derivado de la orientación del giroscopio
  // Factor de sensibilidad: 2 px por grado (rango de movimiento suave)
  const offsetX = useMemo(() => rollDeg * 2, [rollDeg]);
  const offsetY = useMemo(() => pitchDeg * 2, [pitchDeg]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" testID="constellation-overlay">
      <Svg width={width} height={height}>
        {constellations.map((constellation) => {
          // Índice de estrellas por ID para buscar coordenadas al dibujar líneas
          const starById = Object.fromEntries(
            constellation.stars.map((s) => [s.id, s]),
          );

          return (
            <React.Fragment key={constellation.id}>
              {/* Líneas de conexión */}
              {constellation.lines.map(([fromId, toId]) => {
                const from = starById[fromId];
                const to = starById[toId];
                if (!from || !to) return null;
                return (
                  <Line
                    key={`${constellation.id}-line-${fromId}-${toId}`}
                    x1={from.x * width + offsetX}
                    y1={from.y * height + offsetY}
                    x2={to.x * width + offsetX}
                    y2={to.y * height + offsetY}
                    stroke={constellation.color}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                  />
                );
              })}

              {/* Puntos de estrellas */}
              {constellation.stars.map((star) => (
                <React.Fragment key={`star-${star.id}`}>
                  <Circle
                    cx={star.x * width + offsetX}
                    cy={star.y * height + offsetY}
                    r={starRadius(star.magnitude)}
                    fill={constellation.color}
                    opacity={0.85}
                    testID={`star-${star.id}`}
                  />
                  {/* Etiqueta de nombre (solo estrellas con nombre propio) */}
                  {star.name != null && (
                    <SvgText
                      x={star.x * width + offsetX + 8}
                      y={star.y * height + offsetY - 6}
                      fill={constellation.color}
                      fontSize={10}
                      opacity={0.9}
                    >
                      {star.name}
                    </SvgText>
                  )}
                </React.Fragment>
              ))}

              {/* Etiqueta del nombre de la constelación en el centroide */}
              {(() => {
                if (constellation.stars.length === 0) return null;
                const cx =
                  constellation.stars.reduce((sum, s) => sum + s.x, 0) /
                  constellation.stars.length;
                const cy =
                  constellation.stars.reduce((sum, s) => sum + s.y, 0) /
                  constellation.stars.length;
                return (
                  <SvgText
                    x={cx * width + offsetX}
                    y={cy * height + offsetY - 14}
                    fill={constellation.color}
                    fontSize={12}
                    fontWeight="bold"
                    textAnchor="middle"
                    opacity={0.95}
                    testID={`label-${constellation.id}`}
                  >
                    {constellation.name}
                  </SvgText>
                );
              })()}
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Indicador de modo AR en la esquina superior izquierda */}
      <View style={styles.arBadge} testID="ar-badge">
        <Text style={styles.arBadgeText}>● AR</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  arBadgeText: {
    color: '#4fc3f7',
    fontSize: 12,
    fontWeight: '700',
  },
});
