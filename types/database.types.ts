// --- Módulo 1: Infraestructura ---
export interface Aeropuerto {
  codigo_aeropuerto: string; // PK (IATA/ICAO)
  nombre: string;
  ciudad: string;
  pais: string;
  terminales: number;
  puertas_abordaje: number;
  activo: 0 | 1;
}

// --- Módulo 3: Aerolíneas ---
export interface Aerolinea {
  id_aerolinea: number; // PK
  nombre_aerolinea: string;
  codigo_iata: string;
  pais_origen: string;
  alianza?: 'STAR_ALLIANCE' | 'SKYTEAM' | 'ONEWORLD' | 'NINGUNA';
  activo: 0 | 1;
}

// --- Módulo 5: Operaciones (Vuelos) ---
export interface Vuelo {
  id_vuelo: number; // PK
  id_programa: number; // FK
  numero_vuelo: string; // Viene del JOIN con programa
  fecha_vuelo: string | Date;
  hora_salida_programada: string;
  hora_llegada_programada: string;
  id_modelo_avion: number;
  estado_vuelo: 'PROGRAMADO' | 'EN_VUELO' | 'ATERRIZADO' | 'CANCELADO' | 'REPROGRAMADO' | 'DEMORADO' | 'DESVIADO';
  id_puerta_salida?: number;
}

// --- Módulo 24: Seguridad (Para el Login) ---
export interface UsuarioSistema {
  id_usuario: number;
  usuario: string;
  nombre_completo: string;
  id_rol: number;
  email: string;
  activo: 0 | 1;
}