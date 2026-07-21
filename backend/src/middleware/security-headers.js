/**
 * Branding / product identity headers only (PR-05a).
 * Must NOT set X-Frame-Options, nosniff, Referrer-Policy, or X-Powered-By —
 * those come from Helmet (security-config). CSP left unchanged → PR-16.
 */
function brandingHeaders(req, res, next) {
  res.setHeader('X-Author', 'Douglas P. Figueiredo');
  res.setHeader('X-Copyright', '© 2024-2026 Reservei Viagens LTDA');
  res.setHeader('X-Developer', 'Douglas P. Figueiredo');
  res.setHeader('X-Organization', 'Reservei Viagens LTDA');
  res.setHeader('X-Original-Source', 'https://www.reserveiviagens.com.br');
  res.setHeader('X-Website', 'https://www.reserveiviagens.com.br');

  // Existing CSP (not modified in 05a — deep CSP → PR-16)
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://analytics.tiktok.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://www.googletagmanager.com https://www.facebook.com",
    ].join('; '),
  );

  const isPrivateSurface =
    req.originalUrl?.startsWith('/api/') || req.originalUrl?.startsWith('/admin/');
  if (isPrivateSurface) {
    res.setHeader('X-Robots-Tag', 'noindex,nofollow,noarchive');
  }

  next();
}

module.exports = { brandingHeaders };
