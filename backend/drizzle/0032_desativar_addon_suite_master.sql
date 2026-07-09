-- Desativa add-on global "Upgrade Suíte Master" (escopo=hotel).
-- Modelo híbrido: upgrade varanda por unidade (metadata). Evita cobrança dupla
-- e oferta sem lastro. Itens já persistidos em orcamento_itens NÃO são alterados.

UPDATE wizard_addons
SET ativo = false
WHERE nome = 'Upgrade Suíte Master'
  AND escopo = 'hotel'
  AND ativo = true;
