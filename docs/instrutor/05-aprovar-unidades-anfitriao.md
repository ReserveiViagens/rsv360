---
id: instrutor-05
titulo: "Como aprovar ou rejeitar unidades de anfitriões"
papel: staff
rotas: ["/modulos", "/anfitriao/unidades"]
versao_base: "2026-07-13"
---

# Aprovar ou rejeitar unidades enviadas pelos anfitriões

## Situação atual (importante)

🚧 **Em construção na UI do Turismo:** o hub `/modulos` menciona unidades parceiro + aprovação, e a **API** staff de aprovar/rejeitar existe no backend — mas **não há página staff** em `pages/` com botões **Aprovar** / **Rejeitar** para moderar filas de unidades.

O anfitrião, por outro lado, **consegue enviar** a unidade para aprovação (veja guia 06).

## O que você pode fazer hoje

1. Oriente o anfitrião a concluir o cadastro e clicar **Enviar para aprovação**.  
   **Onde clicar (lado parceiro):** `/anfitriao/unidades/[id]` → **Enviar para aprovação**.

2. Acompanhe status visíveis no portal do anfitrião (Em aprovação / Publicadas no painel).  
   **Onde clicar:** `/anfitriao` (visão do parceiro) — staff sem tela de fila própria.

3. Se a moderação for urgente, acione a operação/produto para usar o endpoint admin até a UI existir.  
   **Onde clicar:** não há botão na UI atual.

## ⚠️ Quando falar com um humano

Use este caminho humano/processo interno até existir a tela staff de moderação. Não diga ao anfitrião que “já aprovou” sem ter confirmação real no sistema.
