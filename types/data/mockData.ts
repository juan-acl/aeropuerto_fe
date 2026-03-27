// Definimos la interfaz aquí mismo temporalmente para evitar errores de ruta
export interface Vuelo {
  id_vuelo: number;
  id_programa: number;
  numero_vuelo: string;
  fecha_vuelo: string;
  hora_salida_programada: string;
  hora_llegada_programada: string;
  id_modelo_avion: number;
  estado_vuelo: 'PROGRAMADO' | 'EN_VUELO' | 'ATERRIZADO' | 'CANCELADO' | 'REPROGRAMADO' | 'DEMORADO' | 'DESVIADO';
  id_puerta_salida?: number;
}

export const MOCK_VUELOS: Vuelo[] = [
  {
    id_vuelo: 101,
    id_programa: 1,
    numero_vuelo: 'IB6341',
    fecha_vuelo: '2026-03-17',
    hora_salida_programada: '2026-03-17T18:30:00',
    hora_llegada_programada: '2026-03-18T11:00:00',
    id_modelo_avion: 5,
    estado_vuelo: 'PROGRAMADO',
    id_puerta_salida: 12
  },
  {
    id_vuelo: 102,
    id_programa: 2,
    numero_vuelo: 'AV450',
    fecha_vuelo: '2026-03-17',
    hora_salida_programada: '2026-03-17T09:15:00',
    hora_llegada_programada: '2026-03-17T10:45:00',
    id_modelo_avion: 3,
    estado_vuelo: 'EN_VUELO',
    id_puerta_salida: 5
  }
];