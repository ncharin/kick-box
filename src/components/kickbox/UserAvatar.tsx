import Image from 'next/image'

interface UserAvatarProps {
  url: string | null | undefined
  name: string
  size?: number
  className?: string
}

export function UserAvatar({ url, name, size = 32, className = '' }: UserAvatarProps) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        unoptimized
      />
    )
  }
  return (
    <div
      className={`bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-full font-bold ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
    >
      {(name[0] ?? '?').toUpperCase()}
    </div>
  )
}
