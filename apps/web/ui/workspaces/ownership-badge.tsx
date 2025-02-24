import { OwnershipProps } from '@/lib/types';
import { Badge } from '@dub/ui';

export default function OwnershipBadge({ plan }: { plan: OwnershipProps }) {
  return <Badge variant={plan === 'owner' || plan === 'pemilik' ? 'violet' : 'blue'}>{plan}</Badge>;
}
