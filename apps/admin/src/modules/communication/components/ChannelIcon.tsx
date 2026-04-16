import { Mail, MessageSquare, Phone } from 'lucide-react';
import type { CommChannel } from '../types';

export function ChannelIcon({ channel }: { channel: CommChannel }) {
  if (channel === 'sms') return <MessageSquare className="h-4 w-4" />;
  if (channel === 'whatsapp') return <Phone className="h-4 w-4" />;
  return <Mail className="h-4 w-4" />;
}
