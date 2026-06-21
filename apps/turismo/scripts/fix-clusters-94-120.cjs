#!/usr/bin/env node
/** Apply ESLint fixes for lint clusters 94-120 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
function write(p, c) { fs.writeFileSync(path.join(root, p), c); }

const fixes = [
  // 95
  ['src/components/excursoes/ParticipantesList.tsx', c => c.replace("import { Users, X, CheckCircle, Clock }", "import { Users, X }")],
  ['src/components/leiloes/AuctionList.tsx', c => c.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useCallback }").replace(
    `  useEffect(() => {
    loadAuctions()
  }, [filters])

  const loadAuctions = async () => {`,
    `  const loadAuctions = useCallback(async () => {`
  ).replace(
    `    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange`,
    `    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reload auctions when filters change
    loadAuctions()
  }, [loadAuctions])

  const handleSearchChange`
  )],
  ['src/components/leiloes/AuctionStats.tsx', c => c.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useCallback }").replace(
    `  useEffect(() => {
    loadStats()
  }, [filters])

  const loadStats = async () => {`,
    `  const loadStats = useCallback(async () => {`
  ).replace(
    /    \} finally \{\n      setLoading\(false\)\n    \}\n  \}\n\n  if \(loading\)/,
    `    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reload stats when filters change
    loadStats()
  }, [loadStats])

  if (loading)`
  )],
  // 96
  ['src/components/navigation/Breadcrumbs.tsx', c => c.replace("import { ChevronRight, Home, MapPin }", "import { ChevronRight, Home }").replace(
    '      window.location.href = href;',
    `      // eslint-disable-next-line react-hooks/immutability -- default full-page navigation fallback
      window.location.assign(href);`
  )],
  ['src/components/notifications/NotificationBell.tsx', c => c.replace("import { Bell, X }", "import { Bell }").replace(
    '    if (state.lastNotification && !state.lastNotification.read) {\n      setHasNewNotification(true);',
    `    if (state.lastNotification && !state.lastNotification.read) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pulse bell on new notification
      setHasNewNotification(true);`
  )],
  // 97
  ['src/components/reports/ReportAnalytics.tsx', c => c.replace(/Calendar, |, DollarSign/g, '')],
  ['src/components/ui/PageTransition.tsx', c => c.replace("import { motion, AnimatePresence }", "import { motion }").replace('slideTransition,', '_slideTransition,')],
  ['src/components/ui/SkipLinks.tsx', c => c.replace("import { motion, AnimatePresence }", "import { motion }").replace('{ announce,', '{ announce: _announce,')],
  // 98
  ['src/components/viagens-grupo/PagamentoDividido.tsx', c => c.replace(/, CheckCircle, Clock/g, '')],
  ['src/components/viagens-grupo/GrupoForm.tsx', c => c.replace('value: any', 'value: string | boolean').replace('const submitData: any', 'const submitData: Partial<Grupo>')],
  // 99
  ['src/hooks/useKeyboardShortcuts.ts', c => c.replace('import { useEffect, useCallback }', 'import { useEffect, useCallback, useMemo }').replace(
    '  const { toggleSidebar, toggleMobileSidebar } = useSidebar();',
    '  const { toggleSidebar, toggleMobileSidebar: _toggleMobileSidebar } = useSidebar();'
  ).replace(
    '  const shortcuts: KeyboardShortcut[] = [',
    '  const shortcuts: KeyboardShortcut[] = useMemo(() => ['
  ).replace(
    /(\s+\}\s+\]\s*\n\n\s+const handleKeyDown)/,
    `  ], [router, toggleSidebar, toggleTheme, setColorScheme]);

  const handleKeyDown`
  )],
  ['src/services/auth-service.ts', c => c.replace(/: any/g, ': Record<string, unknown>')],
  ['src/services/websocketClient.ts', c => c.replace(/: any/g, ': unknown')],
  // 100
  ['pages/ANALYTICS-INTELLIGENCE.tsx', c => c.replace(/import \{ useAuth \}[^\n]+\n/, '')],
  ['pages/BUSINESS-MODULES.tsx', c => c.replace(/import \{ useAuth \}[^\n]+\n/, '')],
  // 101
  ['pages/ECOSYSTEM-MASTER.tsx', c => c.replace(/import \{ useAuth \}[^\n]+\n/, '')],
  ['pages/accommodations/enterprises/new.tsx', c => c.replace('const { user }', 'const { user: _user }')],
  ['pages/analytics.tsx', c => c.replace('const { user }', 'const { user: _user }')],
  // 102
  ['pages/attractions.tsx', c => c.replace('<img ', '{/* eslint-disable-next-line @next/next/no-img-element -- attraction card image */}\n        <img ')],
  ['pages/dashboard/excursoes/nova.tsx', c => c.replace('data: any', 'data: Partial<Excursao>')],
  ['pages/dashboard/leiloes/novo.tsx', c => c.replace('data: any', 'data: Partial<Leilao>')],
  // 103
  ['pages/dashboard/viagens-grupo/nova.tsx', c => c.replace('data: any', 'data: Partial<Grupo>')],
  ['pages/login.tsx', c => c.replace('} catch (error)', '} catch (_error)')],
  // 104
  ['pages/register.tsx', c => c.replace('} catch (err)', '} catch (_err)')],
  ['pages/reports-complete.tsx', c => c.replace(/: any\b/g, ': Record<string, unknown>')],
  ['pages/reservations/[id].tsx', c => c.replace(/import \{ useAuth \}[^\n]+\n/, '')],
  // 105+
  ['src/pages/admin-test.tsx', c => c.replace(/import \{ Button \}[^\n]+\n/, '')],
  ['src/pages/analytics.tsx', c => c.replace('const { user }', 'const { user: _user }')],
  ['src/pages/cotacoes/templates.tsx', c => c.replace(/, Calculator/g, '')],
  ['src/pages/recommendations.tsx', c => c.replace('} catch (err)', '} catch (_err)')],
  ['src/pages/register.tsx', c => c.replace('} catch (err)', '} catch (_err)')],
  ['src/pages/settings.tsx', c => c.replace(/, Globe/g, '')],
  ['src/services/api/accommodationsApi.ts', c => c.replace(/PricingRule,\s*/g, '')],
  ['src/services/api/bookingApi.ts', c => c.replace('filters', '_filters')],
  ['src/services/api/excursoesApi.ts', c => c.replace("import apiClient from './apiClient'\n", '')],
  ['src/services/api/viagensGrupoApi.ts', c => c.replace("import apiClient from './apiClient'\n", '')],
  ['src/hooks/use-toast.ts', c => c.replace('const actionTypes', 'const _actionTypes')],
  ['src/components/ToastContainer.tsx', c => c.replace('ToastProps,', '')],
  ['src/components/bookings/BookingViewModal.tsx', c => c.replace(/, CreditCard/g, '')],
  ['src/components/dashboard/AnalyticsCharts.tsx', c => c.replace('[key: string]: any', '[key: string]: unknown')],
  ['src/components/excursoes/RoteiroEditor.tsx', c => c.replace(/: any/g, ': Record<string, unknown>')],
  ['src/components/leiloes/LeilaoDetalhes.tsx', c => c.replace('const isActive', 'const _isActive')],
  ['src/components/navigation/NavigationGuard.tsx', c => c.replace(/Shield, /g, '')],
  ['src/components/reports/ReportHistory.tsx', c => c.replace(/: any/g, ': Record<string, unknown>')],
  ['src/components/security/index.ts', c => c.replace(/: any/g, ': Record<string, unknown>')],
  ['src/components/shared/DataTable.tsx', c => c.replace('<T extends Record<string, any>>', '<T extends Record<string, unknown>>')],
  ['src/components/ui/AnimatedLoader.tsx', c => c.replace(/, Sparkles/g, '')],
  ['src/components/ui/KeyboardShortcutsHelp.tsx', c => c.replace(/: any/g, ': Record<string, unknown>')],
  ['src/hooks/useTravelPackages.ts', c => c.replace(/: any/g, ': unknown')],
  ['src/components/auth/AuthProvider.tsx', c => c.replace('refreshToken', '_refreshToken')],
];

// fetchData pattern for pages
const fetchDataFiles = [
  'pages/multilingual.tsx', 'pages/rewards.tsx', 'pages/subscriptions.tsx',
  'src/pages/giftcards.tsx', 'src/pages/multilingual.tsx', 'src/pages/rewards.tsx',
  'src/pages/subscriptions.tsx', 'src/pages/seo.tsx'
];
for (const f of fetchDataFiles) {
  fixes.push([f, c => {
    if (!c.includes('useCallback')) c = c.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useCallback }");
    c = c.replace(/useEffect\(\(\) => \{\s*\n\s*(fetch\w+)\(\);\s*\n\s*\}, \[\]\);\s*\n\s*const (fetch\w+) = async \(\) => \{/g,
      `const $2 = useCallback(async () => {`);
    c = c.replace(/(const fetch\w+ = useCallback\(async \(\) => \{[\s\S]*?\n    \};)\s*\n(\s*const )/g,
      `$1

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- load data on mount
        $2();
    }, [$2]);

$2`);
    return c;
  }]);
}

// PageTransition navigation - move LoadingComponent
fixes.push(['src/components/navigation/PageTransition.tsx', c => {
  if (c.includes('const PageTransitionLoading')) return c;
  const loadingComp = `
const PageTransitionLoading = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-gray-50"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-4"
        >
          <Loader2 className="w-8 h-8 text-primary-600" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600"
        >
          Carregando...
        </motion.p>
      </div>
    </motion.div>
  );
PageTransitionLoading.displayName = 'PageTransitionLoading';
`;
  c = c.replace('export interface PageTransitionProps', loadingComp + '\nexport interface PageTransitionProps');
  c = c.replace(/  useEffect\(\(\) => \{\s*\n    if \(showLoading\) \{\s*\n      setIsLoading\(true\);/,
    `  useEffect(() => {
    if (showLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- show loading overlay on mount
      setIsLoading(true);`);
  c = c.replace(/  \/\/ Loading component[\s\S]*?  \);\s*\n\s*\/\/ Se ainda está carregando[\s\S]*?return <LoadingComponent \/>;/,
    `  // Se ainda está carregando, mostrar loading
  if (isLoading) {
    return <PageTransitionLoading />;`);
  return c;
}]);

// set-state-in-effect mock dashboards
for (const f of ['src/components/excursoes/ExcursoesDashboard.tsx', 'src/components/viagens-grupo/ViagensGrupoDashboard.tsx']) {
  fixes.push([f, c => c.replace('  useEffect(() => {\n    // TODO: Buscar dados da API\n    setStats({',
    `  useEffect(() => {
    // TODO: Buscar dados da API
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load mock dashboard stats on mount
    setStats({`)]);
}

// ThemeContext, ProtectedRoute, NotificationBell (src), useSidebar, useTheme, offline
const setStateEffectFiles = [
  ['src/context/ThemeContext.tsx', 'setTheme(savedTheme)', 'hydrate theme from localStorage on mount'],
  ['src/context/ThemeContext.tsx', 'setActualTheme(resolvedTheme)', 'apply resolved theme to document'],
  ['src/components/ProtectedRoute.tsx', 'setMounted(true)', 'client-only mount guard'],
  ['src/components/NotificationBell.tsx', 'setUnreadCount(unread)', 'sync unread count from notifications'],
  ['src/hooks/useSidebar.ts', 'setSidebarState(parsedState)', 'hydrate sidebar state from localStorage'],
  ['src/hooks/useTheme.ts', 'setThemeConfig(parsedConfig)', 'hydrate theme config from localStorage'],
  ['src/pages/offline.tsx', 'setIsOnline(navigator.onLine)', 'sync online status on mount'],
];
for (const [f, line, reason] of setStateEffectFiles) {
  fixes.push([f, c => {
    if (c.includes(`eslint-disable-next-line react-hooks/set-state-in-effect -- ${reason}`)) return c;
    return c.replace(line, `// eslint-disable-next-line react-hooks/set-state-in-effect -- ${reason}\n      ${line.trim()}`);
  }]);
}

// LeiloesDashboard useCallback
fixes.push(['src/components/leiloes/LeiloesDashboard.tsx', c => {
  c = c.replace("import React, { useState, useEffect }", "import React, { useState, useEffect, useCallback }");
  return c.replace(`  useEffect(() => {
    loadUpcomingAuctions()
  }, [])

  const loadUpcomingAuctions = async () => {`, `  const loadUpcomingAuctions = useCallback(async () => {`)
    .replace(/    \} catch \(error\) \{[\s\S]*?    \}\n  \}\n\n  const formatTimeUntil/,
      `    } catch (error) {
      console.error('Erro ao carregar leilões:', error)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load upcoming auctions on mount
    loadUpcomingAuctions()
  }, [loadUpcomingAuctions])

  const formatTimeUntil`);
}]);

// LoginForm RegisterForm incompatible-library
fixes.push(['src/components/auth/LoginForm.tsx', c => c.replace('  const rememberMe = watch', '  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch\n  const rememberMe = watch')]);
fixes.push(['src/components/auth/RegisterForm.tsx', c => c.replace('  const password = watch', '  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch\n  const password = watch')]);

// Input label empty interface
fixes.push(['src/components/ui/Input.tsx', c => c.replace('export interface InputProps\n  extends React.InputHTMLAttributes<HTMLInputElement> {}', 'export type InputProps = React.InputHTMLAttributes<HTMLInputElement>')]);
fixes.push(['src/components/ui/label.tsx', c => c.replace(/export interface LabelProps[\s\S]*?\{\}/, 'export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>')]);

// Card img
fixes.push(['src/components/ui/Card.tsx', c => c.replace('<img ', '{/* eslint-disable-next-line @next/next/no-img-element -- card header image */}\n        <img ')]);
fixes.push(['src/components/accommodations/EnterpriseCard.tsx', c => c.replace('<img ', '{/* eslint-disable-next-line @next/next/no-img-element -- enterprise card image */}\n          <img ')]);

// radio-group checkbox separator switch - named forwardRef
for (const [file, name] of [
  ['src/components/ui/radio-group.tsx', 'RadioGroup'],
  ['src/components/ui/radio-group.tsx', 'RadioGroupItem'],
  ['src/components/ui/Checkbox.tsx', 'Checkbox'],
  ['src/components/ui/separator.tsx', 'Separator'],
  ['src/components/ui/switch.tsx', 'Switch'],
]) {
  fixes.push([file, c => c.replace(
    `React.forwardRef<`,
    `React.forwardRef(function ${name}(`
  ).replace(
    `>, ref) =>`,
    `, ref) =>`
  )]);
}

let applied = 0;
for (const [rel, fn] of fixes) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) { console.warn('skip missing', rel); continue; }
  const before = read(rel);
  const after = fn(before);
  if (after !== before) { write(rel, after); applied++; console.log('fixed', rel); }
}
console.log('Applied', applied, 'file fixes');
