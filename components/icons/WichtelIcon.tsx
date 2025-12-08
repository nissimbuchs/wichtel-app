import {
  TreePine,
  Gift,
  MessageCircle,
  CheckCircle,
  Archive,
  MessageSquare,
  Users,
  Calendar,
  AlertTriangle,
  Lightbulb,
  Lock,
  Mail,
  Sparkles,
  Snowflake,
  Star,
  Dices,
  Trash2,
  Clipboard,
  RotateCcw,
  List,
  Edit,
  Check,
  Smartphone,
  User,
  UserCheck,
  Info,
  type LucideIcon
} from 'lucide-react'

export type IconName =
  | 'tree'
  | 'gift'
  | 'message'
  | 'message-circle'
  | 'message-square'
  | 'check'
  | 'check-circle'
  | 'archive'
  | 'users'
  | 'user'
  | 'user-check'
  | 'calendar'
  | 'alert-triangle'
  | 'lightbulb'
  | 'lock'
  | 'mail'
  | 'sparkles'
  | 'sparkle'
  | 'snowflake'
  | 'star'
  | 'dices'
  | 'trash'
  | 'clipboard'
  | 'rotate-ccw'
  | 'list'
  | 'edit'
  | 'smartphone'
  | 'info'

const iconMap: Record<IconName, LucideIcon> = {
  tree: TreePine,
  gift: Gift,
  message: MessageCircle,
  'message-circle': MessageCircle,
  'message-square': MessageSquare,
  check: Check,
  'check-circle': CheckCircle,
  archive: Archive,
  users: Users,
  user: User,
  'user-check': UserCheck,
  calendar: Calendar,
  'alert-triangle': AlertTriangle,
  lightbulb: Lightbulb,
  lock: Lock,
  mail: Mail,
  sparkles: Sparkles,
  sparkle: Sparkles,
  snowflake: Snowflake,
  star: Star,
  dices: Dices,
  trash: Trash2,
  clipboard: Clipboard,
  'rotate-ccw': RotateCcw,
  list: List,
  edit: Edit,
  smartphone: Smartphone,
  info: Info,
}

interface WichtelIconProps {
  name: IconName
  size?: number
  className?: string
}

export function WichtelIcon({ name, size = 24, className = '' }: WichtelIconProps) {
  const Icon = iconMap[name]

  if (!Icon) {
    console.warn(`Icon "${name}" not found in iconMap`)
    return null
  }

  return <Icon size={size} className={className} />
}
