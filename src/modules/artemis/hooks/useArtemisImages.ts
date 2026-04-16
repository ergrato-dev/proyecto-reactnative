import { useQuery } from '@tanstack/react-query';
import { fetchArtemisImages, type NasaImageItem } from '@/shared/lib/nasaClient';

/** Tiempo de revalidación: 6 horas (las imágenes de archivo no cambian frecuentemente) */
const STALE_TIME_6H = 6 * 60 * 60 * 1000;

/** Número de imágenes a cargar por defecto */
const DEFAULT_IMAGE_LIMIT = 20;

/**
 * Hook que obtiene imágenes oficiales del programa Artemis desde la NASA Images API.
 *
 * @what Encapsula la llamada a `fetchArtemisImages` con TanStack Query, exponiendo
 *   los estados de carga, error y datos para la galería de Artemis.
 * @why Separar el fetching de la UI permite reutilizar la lógica en cualquier
 *   componente que necesite las imágenes y centraliza las políticas de caché.
 * @impact Usado en `ArtemisGalleryScreen`. La query tiene `staleTime` de 6 h
 *   para minimizar peticiones al ser datos de archivo estable.
 *
 * @param limit - Número máximo de imágenes a recuperar (por defecto 20)
 * @returns Objeto con `images`, `isLoading`, `isError`, `error` y `refetch`
 */
export function useArtemisImages(limit = DEFAULT_IMAGE_LIMIT): {
  images: NasaImageItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, isError, error, refetch } = useQuery<NasaImageItem[], Error>({
    queryKey: ['nasa', 'artemis-images', limit],
    queryFn: () => fetchArtemisImages(limit),
    staleTime: STALE_TIME_6H,
  });

  return {
    images: data ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
