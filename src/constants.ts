import { Student, Mentor, Session } from './types';
import { parse, formatISO } from 'date-fns';

export const INITIAL_MENTORS: Mentor[] = [
  { id: 'm1', name: 'Admin Mentor' },
];

export const INITIAL_STUDENTS: Student[] = [
  { id: 's1', name: 'Jhoyra Iriarte', mentorId: 'm1' },
  { id: 's2', name: 'Juana Hernández', mentorId: 'm1' },
  { id: 's3', name: 'Antonio Martín', mentorId: 'm1' },
];

const parseDate = (d: string) => formatISO(parse(d, 'dd/MM/yyyy', new Date()));

export const INITIAL_SESSIONS: Session[] = [
  // Jhoyra Iriarte
  { id: 'jh1', studentId: 's1', mentorId: 'm1', sessionNumber: '1', date: parseDate('18/03/2026'), status: 'Realizada', observation: '' },
  { id: 'jh2', studentId: 's1', mentorId: 'm1', sessionNumber: '1', date: parseDate('25/03/2026'), status: 'No se conectó', observation: '' },
  { id: 'jh3', studentId: 's1', mentorId: 'm1', sessionNumber: '1', date: parseDate('08/04/2026'), status: 'Realizada', observation: '' },
  { id: 'jh4', studentId: 's1', mentorId: 'm1', sessionNumber: '1', date: parseDate('15/04/2026'), status: 'Realizada', observation: '' },
  { id: 'jh5', studentId: 's1', mentorId: 'm1', sessionNumber: '1', date: parseDate('22/04/2026'), status: 'No se conectó', observation: '' },
  { id: 'jh6', studentId: 's1', mentorId: 'm1', sessionNumber: '1 Hora', date: parseDate('29/04/2026'), status: 'Realizada', observation: '' },
  
  // Juana Hernández
  { id: 'ju1', studentId: 's2', mentorId: 'm1', sessionNumber: '1', date: parseDate('19/03/2026'), status: 'Realizada', observation: '' },
  { id: 'ju2', studentId: 's2', mentorId: 'm1', sessionNumber: '1', date: parseDate('26/03/2026'), status: 'Realizada', observation: '' },
  { id: 'ju3', studentId: 's2', mentorId: 'm1', sessionNumber: '1', date: parseDate('09/04/2026'), status: 'Realizada', observation: '' },
  { id: 'ju4', studentId: 's2', mentorId: 'm1', sessionNumber: '1', date: parseDate('16/04/2026'), status: 'No se conectó', observation: 'tenía feria' },
  { id: 'ju5', studentId: 's2', mentorId: 'm1', sessionNumber: '1', date: parseDate('23/04/2026'), status: 'Realizada', observation: '' },
  { id: 'ju6', studentId: 's2', mentorId: 'm1', sessionNumber: '1', date: parseDate('30/04/2026'), status: 'Realizada', observation: '' },

  // Antonio Martín
  { id: 'an1', studentId: 's3', mentorId: 'm1', sessionNumber: '1', date: parseDate('08/04/2026'), status: 'Realizada', observation: '' },
  { id: 'an2', studentId: 's3', mentorId: 'm1', sessionNumber: '1', date: parseDate('15/04/2026'), status: 'Realizada', observation: '' },
  { id: 'an3', studentId: 's3', mentorId: 'm1', sessionNumber: '1', date: parseDate('22/04/2026'), status: 'No se conectó', observation: '' },
  { id: 'an4', studentId: 's3', mentorId: 'm1', sessionNumber: '1', date: parseDate('29/04/2026'), status: 'Realizada', observation: '' },
];
