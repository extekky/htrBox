import { cn } from "@/lib/cn";
import {
  getResolvedUserStatuses,
  type UserStatusCarrier,
} from "@/lib/userStatuses";
import { StatusChip } from "@/components/common/StatusBadge";
import { styles } from "@/styles";

const s = styles.userStatusList;

interface UserStatusListProps {
  user: UserStatusCarrier;
  interactive?: boolean;
  compact?: boolean;
  onSelect?: (key: string) => void;
  className?: string;
}

export function UserStatusList({
  user,
  interactive = false,
  compact = false,
  onSelect,
  className,
}: UserStatusListProps) {
  const statuses = getResolvedUserStatuses(user);

  if (statuses.length === 0) {
    return null;
  }

  return (
    <div className={cn(s.root, className)}>
      {statuses.map((status) => {
        const Icon = status.Icon;
        const content = <Icon className={s.icon} />;

        return (
          <StatusChip
            key={status.key}
            className={status.tone}
            interactive={interactive}
            iconOnly
            compact={compact}
            onClick={interactive ? () => onSelect?.(status.key) : undefined}
            ariaLabel={status.label}
            title={status.label}
          >
            {content}
          </StatusChip>
        );
      })}
    </div>
  );
}
