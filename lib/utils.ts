import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatInTimeZone } from 'date-fns-tz'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TZ = 'America/Argentina/Buenos_Aires'

export function formatMatchDate(utcDate: string) {
  return formatInTimeZone(new Date(utcDate), TZ, "EEEE d 'de' MMMM", { locale: es })
}

export function formatMatchTime(utcDate: string) {
  return formatInTimeZone(new Date(utcDate), TZ, 'HH:mm')
}

export function formatFullDateTime(utcDate: string) {
  return formatInTimeZone(new Date(utcDate), TZ, "d MMM · HH:mm", { locale: es })
}

export function groupLabel(group: string | null): string {
  if (!group) return ''
  return group.replace('GROUP_', 'Grupo ')
}

export function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    GROUP_STAGE: 'Fase de Grupos',
    ROUND_OF_32: 'Ronda de 32',
    ROUND_OF_16: 'Octavos de Final',
    QUARTER_FINALS: 'Cuartos de Final',
    SEMI_FINALS: 'Semifinales',
    THIRD_PLACE: 'Tercer Puesto',
    FINAL: 'Final',
  }
  return labels[stage] ?? stage
}
