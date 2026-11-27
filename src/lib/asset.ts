export const BASE_URL = import.meta.env.BASE_URL || '/'

export function asset(path: string): string {
  const clean = path.replace(/^\/+/, '')
  return `${BASE_URL.replace(/\/$/, '')}/${clean}`
}

export function imageAsset(name: string): string {
  return asset(`images/${name}`)
}
