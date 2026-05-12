// Logo + nom d'une équipe

import Image from 'next/image'

interface TeamBadgeProps {
  name: string
  shortName?: string | null
  logoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  align?: 'left' | 'right' | 'center'
}

export function TeamBadge({
  name,
  shortName,
  logoUrl,
  size = 'md',
  showName = true,
  align = 'left',
}: TeamBadgeProps) {
  const logoSize = { sm: 20, md: 28, lg: 40 }[size]
  const textSize = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }[size]
  const displayName = shortName ?? name

  const alignClass = {
    left: 'flex-row',
    right: 'flex-row-reverse',
    center: 'flex-col items-center',
  }[align]

  return (
    <div className={`flex items-center gap-2 ${alignClass}`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={name}
          width={logoSize}
          height={logoSize}
          className="object-contain"
          unoptimized // logos externes
        />
      ) : (
        <div
          className="bg-muted text-muted-foreground flex items-center justify-center rounded-full font-bold"
          style={{ width: logoSize, height: logoSize, fontSize: logoSize * 0.4 }}
        >
          {name.charAt(0)}
        </div>
      )}
      {showName && <span className={`leading-tight font-medium ${textSize}`}>{displayName}</span>}
    </div>
  )
}
