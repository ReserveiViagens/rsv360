const CANONICALS = {
  'reserveiviagens.com.br': 'www.reserveiviagens.com.br',
  'www.reserveiviagens.com.br': 'www.reserveiviagens.com.br',
  'reserveiviagens.com': 'www.reserveiviagens.com.br',
  'www.reserveiviagens.com': 'www.reserveiviagens.com.br',
  'rsv360.com.br': 'www.rsv360.com.br',
  'www.rsv360.com.br': 'www.rsv360.com.br',
  'rsv360.com': 'www.rsv360.com.br',
  'www.rsv360.com': 'www.rsv360.com.br',
};

function canonicalRedirect(req, res, next) {
  const host = (req.get('host') || '').split(':')[0];

  if (!host || host === 'localhost' || host === '127.0.0.1') {
    return next();
  }

  const canonicalHost = CANONICALS[host];
  if (!canonicalHost || canonicalHost === host) {
    return next();
  }

  const protocol = req.secure ? 'https' : 'https';
  const target = `${protocol}://${canonicalHost}${req.originalUrl}`;
  return res.redirect(301, target);
}

module.exports = { canonicalRedirect };
