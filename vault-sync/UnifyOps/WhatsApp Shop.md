---
tags: [unifyops, whatsapp, shop]
---
# WhatsApp Shop — UnifyOps (catálogo pronto a colar)
Destination for the Wave 7 clinics. Prices = [[Offer Ladder]] (locked; they change only by a rail decision).
Placeholders in {{braces}} are things only Bianno has: Stripe link, shop number. Nothing here is sent by Jarvis.

## Catálogo (WhatsApp Business → Ferramentas → Catálogo)
**1 · Demonstração gratuita — Recepcionista IA** · €0
Fale com a nossa recepcionista IA em português: marca, remarca e responde a perguntas 24/7. Experimente em 2 minutos.
Link: https://biannogomes.github.io/expo (live only after the Pages switch — test it logged-out first, rule links-001)

**2 · Auditoria de Chamadas Perdidas** · €97
Analisamos quantas chamadas e mensagens a sua clínica perde por semana e quanto isso custa em marcações. Relatório claro, com números da sua clínica.
Link: {{STRIPE_LINK_97}}

**3 · AI Front Desk — Instalação** · a partir de €1.500
Recepcionista IA configurada para a sua clínica: horários, serviços, preços, marcações e lembretes. €1.500–2.500 consoante o âmbito.

**4 · AI Front Desk — Mensalidade** · €500/mês
Funcionamento contínuo e melhorias da recepcionista. Garantia: 5 marcações novas em 30 dias ou o mês seguinte é grátis.

## Mensagem de boas-vindas (Greeting)
Olá! 👋 Obrigado por contactar a UnifyOps. Ajudamos clínicas dentárias a não perder marcações com uma recepcionista IA que atende 24/7. Veja o catálogo ou responda *DEMO* para experimentar.

## Mensagem de ausência (Away)
Neste momento não consigo responder — respondo assim que possível. Entretanto pode experimentar a demo: https://biannogomes.github.io/expo

## Respostas rápidas (Quick replies)
- `/demo` — Pode experimentar aqui, em português, em 2 minutos: https://biannogomes.github.io/expo
- `/precos` — Começamos com a Auditoria de Chamadas Perdidas (€97). A instalação fica entre €1.500 e €2.500 e a mensalidade a partir de €500, com garantia de 5 marcações novas em 30 dias.
- `/auditoria` — A auditoria custa €97 e mostra quanto a clínica perde em chamadas não atendidas. Pagamento aqui: {{STRIPE_LINK_97}}
- `/marcar` — Que dia e hora lhe dá mais jeito para uma chamada de 15 minutos?

## Wave 7 hook (add to every follow-up in [[Follow-up Templates]])
P.S. Se preferir, fale connosco diretamente no WhatsApp: {{SHOP_NUMBER}}

## Rules
- Jarvis drafts customer replies for Bianno; it never answers customers on its own (whatsapp-002).
- The Jarvis line (Kapso) and the shop number are separate until coexistence is set up — see jarvis/whatsapp/WHATSAPP.md.
