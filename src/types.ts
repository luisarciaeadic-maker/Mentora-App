export type SessionStatus = 'Realizada' | 'No se conectó' | 'Aplazada' | 'Pendiente';

export interface Student {
  id: string;
  name: string;
  mentorId: string;
}

export interface Mentor {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  studentId: string;
  mentorId: string;
  sessionNumber: string;
  date: string; // ISO string
  status: SessionStatus;
  observation: string;
}
