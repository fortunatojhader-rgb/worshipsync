export const INSTRUMENTS = [
 'Vocal',
 'Violao',
 'Guitarra',
 'Baixo',
 'Teclado',
 'Bateria',
 'Percussao',
 'Som',
 'Midia',
] as const

export type Instrument = typeof INSTRUMENTS[number]

export const INSTRUMENT_LEVELS = [
 { value: 'beginner', label: 'Iniciante' },
 { value: 'intermediate', label: 'Intermediario' },
 { value: 'advanced', label: 'Avancado' },
] as const
