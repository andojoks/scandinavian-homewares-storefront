export const RECORD_MODE =
  typeof location !== 'undefined' && new URLSearchParams(location.search).has('record')

export const RECORD_LIVE_DELAY =
  (RECORD_MODE && Number(new URLSearchParams(location.search).get('live'))) || 8300

declare global {
  interface Window {
    KVIST?: { start: () => void }
    __kvistDrive?: (fn: () => number) => void
  }
}
