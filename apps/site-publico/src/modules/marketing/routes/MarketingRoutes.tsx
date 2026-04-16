import MarketingDashboard from '../pages/MarketingDashboard';
import CampaignsList from '../pages/CampaignsList';
import BroadcastsList from '../pages/BroadcastsList';
import FunnelsView from '../pages/FunnelsView';
import WhatsAppInbox from '../pages/WhatsAppInbox';
import { AbTestsView } from '../pages/AbTestsView';
import AnalyticsReports from '../pages/AnalyticsReports';

const navItems = [
  { path: '', label: '📊 Dashboard' },
  { path: 'campaigns', label: '📢 Campanhas' },
  { path: 'broadcasts', label: '📨 Broadcasts' },
  { path: 'funnels', label: '🔄 Funis' },
  { path: 'whatsapp', label: '💬 WhatsApp' },
  { path: 'ab-tests', label: '🧪 Testes A/B' },
  { path: 'analytics', label: '📈 Analytics' },
];

export { navItems };
export {
  MarketingDashboard,
  CampaignsList,
  BroadcastsList,
  FunnelsView,
  WhatsAppInbox,
  AbTestsView,
  AnalyticsReports,
};