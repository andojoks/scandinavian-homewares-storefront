export type Point = [number, number]

/**
 * Monotone cubic Hermite interpolation path for smooth SVG line charts.
 */
export function smoothPath(points: Point[]): string {
  const n = points.length
  if (n === 0) return ''
  if (n === 1) return `M${points[0][0]},${points[0][1]}`

  const dx: number[] = []
  const dy: number[] = []
  const m: number[] = []
  const c: number[] = []

  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1][0] - points[i][0]
    dy[i] = points[i + 1][1] - points[i][1]
    m[i] = dy[i] / dx[i]
  }

  c[0] = m[0]
  c[n - 1] = m[n - 2]

  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      c[i] = 0
    } else {
      c[i] =
        (3 * (dx[i - 1] + dx[i])) /
        ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i])
    }
  }

  let path = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    const step = dx[i] / 3
    path += `C${(x0 + step).toFixed(2)},${(y0 + step * c[i]).toFixed(2)} ${(x1 - step).toFixed(2)},${(y1 - step * c[i + 1]).toFixed(2)} ${x1.toFixed(2)},${y1.toFixed(2)}`
  }
  return path
}

export function areaPath(points: Point[], baselineY: number): string {
  if (!points.length) return ''
  return `${smoothPath(points)}L${points[points.length - 1][0].toFixed(2)},${baselineY}L${points[0][0].toFixed(2)},${baselineY}Z`
}

export function niceMax(value: number): number {
  if (value <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const norm = value / magnitude
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10
  return nice * magnitude
}

export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const x0 = cx + r * Math.sin(startAngle)
  const y0 = cy - r * Math.cos(startAngle)
  const x1 = cx + r * Math.sin(endAngle)
  const y1 = cy - r * Math.cos(endAngle)
  const largeArc = +(endAngle - startAngle > Math.PI)
  return `M${x0.toFixed(2)},${y0.toFixed(2)}A${r},${r} 0 ${largeArc} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`
}
