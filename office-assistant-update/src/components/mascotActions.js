// Sprite windows use the supplied 220 × 154 image without repainting its pixels.
export const POSES = {
  sit: { x: 1, y: 0, width: 47, height: 63 },
  look: { x: 56, y: 2, width: 47, height: 65 },
  tilt: { x: 103, y: 5, width: 46, height: 64 },
  read: { x: 149, y: 3, width: 63, height: 64 },
  phone: { x: 2, y: 76, width: 56, height: 72 },
  sleep: { x: 56, y: 70, width: 85, height: 28 },
  // Exclude the sleeping pose beside the chair's upper-left corner.
  work: { x: 111, y: 79, width: 88, height: 68, clip: 'polygon(30px 0, 100% 0, 100% 100%, 0 100%, 0 19px, 30px 19px)' },
}

const frame = (pose, duration, motion = '') => ({ pose, duration, motion })

export const ACTIONS = [
  {
    id: 'look', label: '주변 둘러보기',
    frames: [frame('look', 800), frame('sit', 400), frame('look', 1000), frame('sit', 500)],
  },
  {
    id: 'curious', label: '고개 갸웃하기',
    frames: [frame('look', 450), frame('tilt', 1400, 'curious'), frame('look', 450), frame('sit', 500)],
  },
  {
    id: 'read', label: '책 읽기',
    frames: [frame('look', 400), frame('read', 4200, 'reading'), frame('look', 400), frame('sit', 500)],
  },
  {
    id: 'phone', label: '전화하기',
    frames: [frame('tilt', 450), frame('phone', 3600, 'talking'), frame('look', 400), frame('sit', 500)],
  },
  {
    id: 'sleep', label: '낮잠 자기',
    frames: [
      frame('tilt', 420),
      frame('sleep', 3600, 'sleeping'),
      frame('sleep', 420, 'waking'),
      frame('look', 520, 'rising'),
      frame('look', 900, 'proud'),
      frame('sit', 550, 'settling'),
    ],
  },
  {
    id: 'work', label: '책상에서 쉬기',
    frames: [frame('look', 450), frame('work', 4200, 'relaxing'), frame('look', 450), frame('sit', 500)],
  },
]

// A shuffle bag shows every action before starting another round.
export function createActionBag(previous = '', random = Math.random) {
  const bag = [...ACTIONS]
  for (let index = bag.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[bag[index], bag[other]] = [bag[other], bag[index]]
  }
  if (bag[0].id === previous) [bag[0], bag[1]] = [bag[1], bag[0]]
  return bag
}
