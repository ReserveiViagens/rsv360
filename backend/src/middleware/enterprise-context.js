/** Middleware Express — propaga enterpriseId canônico no request. */
function enterpriseContextMiddleware(req, _res, next) {
  const header = req.header('X-Enterprise-Id') || req.header('x-enterprise-id');
  const query = req.query?.enterpriseId ?? req.query?.enterprise_id;
  const pathMatch = (req.path || req.url || '').match(/^\/e\/([^/]+)/);

  const fromQuery = Array.isArray(query) ? query[0] : query;
  req.enterpriseId = String(
    (pathMatch && pathMatch[1]) ||
      (typeof fromQuery === 'string' && fromQuery.trim()) ||
      (header && header.trim()) ||
      'ent_1'
  ).trim();

  next();
}

module.exports = { enterpriseContextMiddleware };
