export function clampValue(value: number, minValue: number, maxValue: number): number {
   return Math.min(Math.max(value, minValue), maxValue);
}

export function getClientXY(e: MouseEvent | TouchEvent) : [number, number] {
   if (e instanceof MouseEvent)
      return [
         e.clientX,
         e.clientY
      ]

   return [
      e.touches[0].clientX,
      e.touches[0].clientY
   ]
}