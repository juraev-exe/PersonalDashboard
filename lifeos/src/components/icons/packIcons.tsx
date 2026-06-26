import React from 'react';

type PackIconName =
  | 'activity'
  | 'alert-triangle'
  | 'archive'
  | 'angle-left'
  | 'angle-right'
  | 'arrow-right'
  | 'arrow-up-down'
  | 'award'
  | 'bar-chart'
  | 'bell'
  | 'book-open'
  | 'bookmark'
  | 'calendar'
  | 'calendar-days'
  | 'check'
  | 'check-square'
  | 'circle-check'
  | 'clock'
  | 'code'
  | 'download'
  | 'edit'
  | 'external-link'
  | 'file-excel'
  | 'file-lines'
  | 'filter'
  | 'flame'
  | 'folder-kanban'
  | 'gamepad'
  | 'git-branch'
  | 'glass-water'
  | 'globe'
  | 'graduation-cap'
  | 'help-circle'
  | 'history'
  | 'info'
  | 'kanban'
  | 'layers'
  | 'layout-dashboard'
  | 'list'
  | 'lock'
  | 'mail'
  | 'maximize'
  | 'message-square'
  | 'minimize'
  | 'moon'
  | 'pause'
  | 'pen-tool'
  | 'pin'
  | 'play'
  | 'plug'
  | 'plus'
  | 'refresh'
  | 'repeat'
  | 'save'
  | 'search'
  | 'settings'
  | 'shield'
  | 'shield-alert'
  | 'skip-forward'
  | 'square'
  | 'star'
  | 'status-good'
  | 'status-low'
  | 'status-neutral'
  | 'sticky-note'
  | 'sun'
  | 'tag'
  | 'target'
  | 'terminal'
  | 'timer'
  | 'trash'
  | 'trending-up'
  | 'trophy'
  | 'upload'
  | 'user'
  | 'volume'
  | 'volume-x'
  | 'mic'
  | 'mic-off'
  | 'zap';

export type LucideProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> & {
  size?: number | string;
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

const iconPath = (name: PackIconName) => `/icons/app/${name}.svg`;

function PackIcon({
  name,
  size = 24,
  color,
  className,
  style,
  title,
  fill: _fill,
  stroke: _stroke,
  strokeWidth: _strokeWidth,
  ...rest
}: LucideProps & { name: PackIconName }) {
  const iconSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      {...rest}
      aria-hidden={title ? undefined : true}
      className={className}
      role={title ? 'img' : undefined}
      title={title}
      style={{
        display: 'inline-block',
        width: iconSize,
        height: iconSize,
        flexShrink: 0,
        backgroundColor: color ?? 'currentColor',
        maskImage: `url("${iconPath(name)}")`,
        WebkitMaskImage: `url("${iconPath(name)}")`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        ...style,
      }}
    />
  );
}

const createIcon = (name: PackIconName) => function Icon(props: LucideProps) {
  return <PackIcon name={name} {...props} />;
};

export const Activity = createIcon('activity');
export const AlertTriangle = createIcon('alert-triangle');
export const Archive = createIcon('archive');
export const ArrowRight = createIcon('arrow-right');
export const ArrowUpDown = createIcon('arrow-up-down');
export const Award = createIcon('award');
export const BarChart3 = createIcon('bar-chart');
export const Bell = createIcon('bell');
export const BookOpen = createIcon('book-open');
export const BookText = createIcon('file-lines');
export const Bookmark = createIcon('bookmark');
export const Calendar = createIcon('calendar');
export const CalendarDays = createIcon('calendar-days');
export const Check = createIcon('check');
export const CheckCircle = createIcon('circle-check');
export const CheckSquare = createIcon('check-square');
export const ChevronLeft = createIcon('angle-left');
export const ChevronRight = createIcon('angle-right');
export const Clock = createIcon('clock');
export const Code = createIcon('code');
export const Code2 = createIcon('code');
export const Download = createIcon('download');
export const Edit3 = createIcon('edit');
export const ExternalLink = createIcon('external-link');
export const FileSpreadsheet = createIcon('file-excel');
export const FileText = createIcon('file-lines');
export const Filter = createIcon('filter');
export const Flame = createIcon('flame');
export const FolderKanban = createIcon('folder-kanban');
export const Gamepad2 = createIcon('gamepad');
export const GitBranch = createIcon('git-branch');
export const GlassWater = createIcon('glass-water');
export const Globe = createIcon('globe');
export const GraduationCap = createIcon('graduation-cap');
export const HelpCircle = createIcon('help-circle');
export const History = createIcon('history');
export const Info = createIcon('info');
export const Kanban = createIcon('kanban');
export const Layers = createIcon('layers');
export const LayoutDashboard = createIcon('layout-dashboard');
export const List = createIcon('list');
export const Lock = createIcon('lock');
export const Mail = createIcon('mail');
export const Maximize2 = createIcon('maximize');
export const Meh = createIcon('status-neutral');
export const MessageSquare = createIcon('message-square');
export const Mic = createIcon('mic');
export const MicOff = createIcon('mic-off');
export const Minimize2 = createIcon('minimize');
export const Moon = createIcon('moon');
export const Pause = createIcon('pause');
export const PenTool = createIcon('pen-tool');
export const Pin = createIcon('pin');
export const Play = createIcon('play');
export const Plug = createIcon('plug');
export const Plus = createIcon('plus');
export const RefreshCw = createIcon('refresh');
export const Repeat = createIcon('repeat');
export const Save = createIcon('save');
export const Search = createIcon('search');
export const Settings = createIcon('settings');
export const Shield = createIcon('shield');
export const ShieldAlert = createIcon('shield-alert');
export const SkipForward = createIcon('skip-forward');
export const Smile = createIcon('status-good');
export const Frown = createIcon('status-low');
export const Square = createIcon('square');
export const Star = createIcon('star');
export const StickyNote = createIcon('sticky-note');
export const Sun = createIcon('sun');
export const Tag = createIcon('tag');
export const Target = createIcon('target');
export const Terminal = createIcon('terminal');
export const Timer = createIcon('timer');
export const Trash2 = createIcon('trash');
export const TrendingUp = createIcon('trending-up');
export const Trophy = createIcon('trophy');
export const Upload = createIcon('upload');
export const User = createIcon('user');
export const Volume2 = createIcon('volume');
export const VolumeX = createIcon('volume-x');
export const Zap = createIcon('zap');
