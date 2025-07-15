// src/app/core/models/student.ts
export interface Student {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto?: string;
  refSEP: string;            // Referencia escolar como string
  plantel: string;           // centro, ecatepec, huipulco, izcalli
  correo?: string;
  foto_url?: string;
  
  // Campos adicionales de la API EPD
  tipoUsuario?: number;      // Tipo de usuario del sistema
  status?: number;           // Status del alumno (1=activo, 2=inactivo, etc.)
  curso?: number;            // ID del curso
  nivel?: number;            // ID del nivel escolar
  fechaInicio?: string;      // Fecha de inicio en formato YYYY-MM-DD
  fechaTermino?: string;     // Fecha de término en formato YYYY-MM-DD
}

// Interfaces para respuestas de la API
export interface LoginResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    token: string;
    user: StudentFromApi;
  };
  timestamp: string;
}

export interface StudentFromApi {
  id: number;
  refEsc: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  correo: string;
  plantel: string;
  tipoUsuario: number;
  status: number;
  curso: number;
  nivel: number;
  fechaInicio: string;
  fechaTermino: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  timestamp: string;
}

// Enum para planteles
export enum Plantel {
  CENTRO = 'centro',
  ECATEPEC = 'ecatepec',
  HUIPULCO = 'huipulco',
  IZCALLI = 'izcalli'
}

// Interface para datos de login
export interface LoginRequest {
  refEsc: number;
  password: string;
  plantel: string;
}

// Enum para status de alumno (basado en tu BD)
export enum StudentStatus {
  ACTIVO = 1,
  INACTIVO = 2,
  SUSPENDIDO = 3,
  EGRESADO = 4
}

// Enum para tipos de usuario
export enum UserType {
  ESTUDIANTE = 1,
  DOCENTE = 2,
  ADMINISTRADOR = 3,
  COORDINADOR = 4
}

// Interface para información del plantel
export interface PlantelInfo {
  id: string;
  nombre: string;
  tabla: string;
}

// Utilidad para mapear datos de API a modelo Student
export function mapApiUserToStudent(apiUser: StudentFromApi): Student {
  return {
    id: apiUser.id,
    nombre: apiUser.nombre,
    apellidoPaterno: apiUser.apellidoPaterno,
    apellidoMaterno: apiUser.apellidoMaterno,
    nombreCompleto: apiUser.nombreCompleto || 
      `${apiUser.nombre} ${apiUser.apellidoPaterno} ${apiUser.apellidoMaterno}`.trim(),
    refSEP: apiUser.refEsc?.toString() || '',
    plantel: apiUser.plantel,
    correo: apiUser.correo,
    tipoUsuario: apiUser.tipoUsuario,
    status: apiUser.status,
    curso: apiUser.curso,
    nivel: apiUser.nivel,
    fechaInicio: apiUser.fechaInicio,
    fechaTermino: apiUser.fechaTermino
  };
}

// Utilidad para validar planteles
export function isValidPlantel(plantel: string): boolean {
  return Object.values(Plantel).includes(plantel as Plantel);
}

// Utilidad para obtener nombre legible del plantel
export function getPlantelDisplayName(plantel: string): string {
  switch (plantel.toLowerCase()) {
    case Plantel.CENTRO:
      return 'Centro';
    case Plantel.ECATEPEC:
      return 'Ecatepec';
    case Plantel.HUIPULCO:
      return 'Huipulco';
    case Plantel.IZCALLI:
      return 'Izcalli';
    default:
      return plantel;
  }
}

// Utilidad para obtener descripción del status
export function getStatusDisplayName(status: number): string {
  switch (status) {
    case StudentStatus.ACTIVO:
      return 'Activo';
    case StudentStatus.INACTIVO:
      return 'Inactivo';
    case StudentStatus.SUSPENDIDO:
      return 'Suspendido';
    case StudentStatus.EGRESADO:
      return 'Egresado';
    default:
      return 'Desconocido';
  }
}