'use client'

// Composant de notation : 0.5 à 5 étoiles, demi-étoiles, mode interactif ou read-only

import { useState } from 'react'

interface RatingStarsProps {
  value?: number | null
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function RatingStars({ value, onChange, readOnly = false, size = 'md' }: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const starSize = { sm: 14, md: 18, lg: 24 }[size]
  const display = hovered ?? value ?? 0

  function handleClick(rating: number) {
    if (!readOnly) onChange?.(rating)
  }

  return (
    <div
      className="flex items-center gap-0.5"
      role={readOnly ? undefined : 'group'}
      aria-label={readOnly ? `Note : ${value ?? 0}/5` : 'Choisir une note'}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const full = display >= star
        const half = !full && display >= star - 0.5

        return (
          <span
            key={star}
            className={`relative select-none ${readOnly ? '' : 'cursor-pointer'}`}
            style={{ width: starSize, height: starSize }}
            onMouseLeave={() => !readOnly && setHovered(null)}
          >
            {/* Demi-étoile gauche */}
            <span
              className="absolute inset-0 w-1/2 overflow-hidden"
              onMouseEnter={() => !readOnly && setHovered(star - 0.5)}
              onClick={() => handleClick(star - 0.5)}
            >
              <Star size={starSize} filled={full || half} color="#F59E0B" />
            </span>
            {/* Étoile droite */}
            <span
              className="absolute inset-0 left-1/2 w-1/2 overflow-hidden"
              onMouseEnter={() => !readOnly && setHovered(star)}
              onClick={() => handleClick(star)}
            >
              <Star size={starSize} filled={full} color="#F59E0B" offset />
            </span>
            {/* Étoile de fond (grise) */}
            <Star size={starSize} filled={false} color="#374151" />
          </span>
        )
      })}
      {value != null && (
        <span className="text-muted-foreground ml-1 text-xs tabular-nums">{value.toFixed(1)}</span>
      )}
    </div>
  )
}

function Star({
  size,
  filled,
  color,
  offset,
}: {
  size: number
  filled: boolean
  color: string
  offset?: boolean
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={filled ? color : '#374151'}
      strokeWidth={1.5}
      style={offset ? { marginLeft: `-${size / 2}px` } : undefined}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
