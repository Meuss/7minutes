// Rank ladder by finishing time (faster = more legendary) + fail verdicts + facts.

// Thresholds anchored to what's physically achievable: optimal play bottoms out
// around ~14.2s (the choke gauge forces breathing breaks), so the top rank sits
// just above that floor. A skilled human realistically lands ~18-25s.
const LADDER = [
  { max: 16500, rank: 'LÉGENDE VIVANTE', emoji: '🏆', blurb: 'Quasi-parfait. On parlera de toi pendant 15 ans.' },
  { max: 20000, rank: 'Const', emoji: '🥃', blurb: 'Le maître absolu de la gorgée.' },
  { max: 24000, rank: 'Meuss', emoji: '😎', blurb: 'Technique impeccable, foie en béton.' },
  { max: 29000, rank: 'Bon vivant', emoji: '🍻', blurb: 'Tu tiens bien la Suze, respect.' },
  { max: 38000, rank: 'Petit joueur', emoji: '🙂', blurb: 'Pas mal, mais la légende est loin.' },
  { max: Infinity, rank: 'Sobre comme un chameau', emoji: '🐫', blurb: 'Tu as pris ton temps… trop ton temps.' },
]

export function verdictFor(timeMs) {
  return LADDER.find((l) => timeMs <= l.max)
}

export const FAIL_VERDICTS = [
  { rank: 'Recraché', emoji: '🤢', blurb: 'La Suze a fait demi-tour. Réessaie.' },
  { rank: 'Endormi', emoji: '😴', blurb: 'Tu t’es écroulé avant la fin. Classique.' },
  { rank: 'Étouffé', emoji: '🥴', blurb: 'La gorge a dit stop. Respire entre deux gorgées !' },
]

export function failVerdict(seed = 0) {
  return FAIL_VERDICTS[Math.floor(seed) % FAIL_VERDICTS.length]
}

export function formatTime(ms) {
  if (ms == null) return '—'
  const s = ms / 1000
  return s.toFixed(2).replace('.', ',') + ' s'
}
