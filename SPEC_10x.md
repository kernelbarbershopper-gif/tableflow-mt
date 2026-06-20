# TableFlow MT — 10/10 Revolutionary SaaS Specification
**Codename: "AVALANCHE"** — The first AI-Native, Predictive, Unified Commerce OS for Independent Restaurants

---

## 🎯 VISION: "O primeiro SaaS que GERENCIA o restaurante POR VOCÊ"

Não é um PDV. Não é um sistema. **É um sócio operacional invisível** que:
- Aprende seu negócio em 48h (computer vision + voice + data)
- Preve demanda, engenha cardápio, negocia compras, otimiza equipe
- Executa pagamentos, folha, impostos, capital de giro — automático
- Conecta você a rede de 10.000+ restaurantes para benchmarking anônimo
- Funciona 100% offline, voz-first, edge-native

---

## 🏗 ARQUITETURA SOBERANA (Zero Vendor Lock-in)

```
┌─────────────────────────────────────────────────────────────────┐
│                    TABLEFLOW EDGE RUNTIME                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  React 19   │  │  Rust/WASM  │  │  SQLite     │             │
│  │  + PWA      │  │  (Core Ops) │  │  (Local DB) │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│              ┌───────────────────────┐                          │
│              │   SYNC ENGINE (CRDT)  │  ← Conflict-free merge   │
│              │   (Yjs + WebRTC)      │     Peer-to-peer sync    │
│              └───────────┬───────────┘                          │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  PostgreSQL │  │   Redis     │  │  S3/R2      │             │
│  │  (Cloud)    │  │  (Cache)    │  │  (Assets)   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

**Stack Decisivo:**
- **Frontend**: React 19 + Vite + Tailwind 4 + PWA + Workbox
- **Core Engine**: Rust → WASM (inventory math, forecasting, tax engine)
- **Local DB**: SQLite (via sql.js / wa-sqlite) — 100% offline
- **Sync**: Yjs (CRDT) + WebRTC (P2P) + WebSocket (cloud)
- **Cloud**: PostgreSQL (Neon/Supabase) + Redis (Upstash) + Cloudflare R2
- **AI**: Local LLMs (Llama.cpp WASM) + Cloud (Gemini/Claude) hybrid
- **Voice**: Whisper.cpp (local) + Web Speech API
- **Computer Vision**: ONNX Runtime Web (YOLO + OCR)
- **Payments**: Stripe Connect + Terminal + Capital + Treasury
- **Auth**: Clerk / Auth.js (multi-tenant, RBAC, SSO)

---

## 🧠 MÓDULOS REVOLUCIONÁRIOS (10x Diferenciais)

### 1. **MENU GENESIS** — Computer Vision Onboarding em 15 min
```
Usuário aponta câmera → Cardápio físico/foto → 
OCR + Layout Analysis + LLM → 
Menu estruturado (pratos, preços, descrições, alérgenos) + 
Receitas inferidas + Fornecedores sugeridos + 
Custeio automático + Margens calculadas
```
**Output**: Menu digital completo + QR Code + Cozinha sincronizada em < 15 min.

### 2. **VOICE OPS** — Operação 100% Mãos-Livres
```
Garçom: "Mesa 12, dois Bison Burger, um sem queijo, batata doce"
Sistema: Confirma visual → Envia cozinha → Atualiza mesa → Calcula conta

Cozinheiro: "Pronto, Bison Burger mesa 12"
Sistema: Notifica garçom → Inicia timer tempo de mesa

Gerente: "Como tá o food cost hoje?"
Sistema: "31.2%, acima da meta 28%. Huckleberry Cheesecake puxando. Quer que eu ajuste preço ou negocie mirtilo?"
```

### 3. **PREDICTIVE ENGINE** — Não Relata, **ANTECIPA**
| Input | Output Automático |
|-------|-------------------|
| Histórico + Clima + Eventos locais + Reservas | **Previsão demanda/hora** (95%+ acurácia) |
| Previsão + Estoque + Lead time fornecedores | **Pedidos de compra auto-gerados** (aprovação 1-click) |
| Vendas + Custos + Concorrência anônima | **Engenharia cardápio**: "Remova X, suba Y 12%, adicione combo Z" |
| Team performance + Peak hours | **Escala otimizada** (custo mão de obra % meta) |
| Cash flow + Sazonalidade | **Linha de crédito pré-aprovada** (Stripe Capital) |

### 4. **UNIFIED COMMERCE OS** — Um Contrato, Uma Plataforma
| Módulo | Concorrente | TableFlow |
|--------|-------------|-----------|
| PDV | Toast/Square | ✅ Nativo |
| KDS | Add-on | ✅ Nativo (voice) |
| Online Ordering | $50-200/mês | ✅ Nativo (PWA + QR) |
| Delivery Integration | $100-300/mês | ✅ Nativo (DoorDash/Uber/Grubhub API) |
| Loyalty | $50-150/mês | ✅ Nativo (Wallet + Auto-campaigns) |
| **Payments** | **2.9% + 30¢ (eles ficam)** | **Interchange+ (você fica com spread)** |
| **Capital/Empréstimo** | **Separado** | **Embedded (Stripe Capital, auto-offer)** |
| **Folha/RH** | **Gusto/ADP ($40+/pessoa)** | **Embedded (cálculo tip pooling, escalas)** |
| **Impostos** | **Manual/Contador** | **Auto-filing (Resort Tax MT + Sales Tax US)** |
| **Seguro** | **Corretor separado** | **Embedded (Workers Comp, Liability — pay-as-you-go)** |
| **Contabilidade** | **QuickBooks ($30-80/mês)** | **Ledger nativo + Sync QB/Xero/NetSuite** |

### 5. **NETWORK INTELLIGENCE** — O "Bloomberg" dos Restaurantes Independentes
- **Benchmarking anônimo**: "Seu food cost 31% vs 27% média região (p50), 22% top 10%"
- **Demanda cooperativa**: Compra coletiva mirtilo/bison/cerveja → 15-25% desconto volume
- **Menu intelligence**: "Restaurantes como você vendem 40% mais 'Smash Burger' — adicionamos?"
- **Talent network**: Compartilhamento staff sazonal (verão Glacier/Yellowstone)
- **Data moat**: Cada restaurante melhora o modelo global → todos ganham

### 6. **MONTANA MOATS** — Incopiáveis
- **Resort Tax Auto-Filing**: Calcula + Gera relatório + Submete ao DOR Montana (API)
- **Local Supply Chain Network**: 200+ fornecedores MT integrados (API EDI) — auto-reorder
- **Seasonal Staffing Pool**: Conecta com universidades (MSU, UM) + trabalhadores sazonais H-2B
- **Tourism Forecast**: Integra dados NPS/Glacier Park + AirDNA + eventos → previsão turistas
- **Regulatory Radar**: Alertas automáticos mudanças lei MT (salário mínimo, gorjetas, álcool)

---

## 💰 MODELO DE NEGÓCIO: "WIN-WIN-WIN"

| Camada | Preço | Valor Entregue |
|--------|-------|----------------|
| **Core OS** | **$0/mês** (para sempre) | PDV + KDS + Inventory + QR Menu + Loyalty + Reports |
| **Payments** | **Interchange + 0.3%** (vs 2.9% mercado) | Você economiza $3-8k/mês → reinveste |
| **Capital** | 0% originação (Stripe Capital) | Empréstimo 24h baseado no SEU fluxo |
| **Finance+** | $49/mês/unidade | Folha + Impostos + Seguro + Contabilidade |
| **Network Pro** | $99/mês | Benchmarking + Compra coletiva + Menu AI + Staff pool |
| **Enterprise** | Custom | Multi-brand, API white-label, SLA, on-premise |

**Unit Economics**: LTV/CAC > 15x | Payback < 3 meses | NRR > 130%

---

## 🚀 ROADMAP EXECUÇÃO (12 SEMANAS)

### **SPRINT 1-2: Foundation Soberana** (Semanas 1-2)
- [ ] Migrar Firebase → PostgreSQL + SQLite (WASM) + CRDT Sync
- [ ] Auth multi-tenant + RBAC + SSO
- [ ] Edge Runtime (Service Worker + SQLite + WASM)
- [ ] Design System "Avalanche" (tokens, componentes, motion)

### **SPRINT 3-4: AI-Native Core** (Semanas 3-4)
- [ ] Menu Genesis: ONNX YOLO + Tesseract + Gemini Vision
- [ ] Voice Ops: Whisper.cpp WASM + Web Speech + Intent Engine
- [ ] Predictive Engine: Rust/WASM (Prophet + LightGBM + Custom)
- [ ] Local LLM (Llama-3.2-3B-Instruct quantizado 4-bit)

### **SPRINT 5-6: Unified Commerce** (Semanas 5-6)
- [ ] Stripe Connect + Terminal + Capital + Treasury
- [ ] KDS Voice-Native (bump/hold/recall por voz)
- [ ] Delivery API Unificada (DoorDash + Uber + Grubhub + Direto)
- [ ] PWA Cliente (Pedido + Pagamento + Fidelidade + Wallet)

### **SPRINT 7-8: Montana Moats + Network** (Semanas 7-8)
- [ ] Resort Tax Auto-Filing (MT DOR API)
- [ ] Fornecedor Network MT (EDI/API 200+)
- [ ] Benchmarking Anônimo (Differential Privacy)
- [ ] Compra Coletiva Engine

### **SPRINT 9-10: Finance+ Embedded** (Semanas 9-10)
- [ ] Folha + Tip Pooling + Escalas Otimizadas
- [ ] Workers Comp + Liability (pay-as-you-go)
- [ ] Ledger Contábil Nativo (Double-entry + Sync QB/Xero)
- [ ] Cash Flow Forecasting + Auto-Capital Offers

### **SPRINT 11-12: Platform + Launch** (Semanas 11-12)
- [ ] Plugin Marketplace + Webhooks + SDK
- [ ] White-label Program (MSPs Montana)
- [ ] Documentation + Onboarding Flow (15 min)
- [ ] Launch: 50 restaurantes beta Montana → Nacional

---

## 🎨 DESIGN PHILOSOPHY: "RÚSTICO-TECNOLÓGICO"

```
Visual Language:
- Cores: Amber/Slate (atual) + Copper/Forest/Glacier accents
- Tipografia: Space Grotesk (tech) + Fraunces (rustic headlines)
- Motion: 60fps, spring physics, reduced-motion respect
- Density: Information-dense (expert mode) ↔ Airy (guest mode)

Voice Personality:
- Tom: "Vizinho experiente" — direto, sem jargão, pró-ativo
- "Seu food cost subiu 2% — o mirtilo dobrou. Já pedi pro Foragers of Flathead no preço antigo."
- Nunca: "Atenção: custo do ingrediente ID i5 aumentou."
```

---

## 🔒 SEGURANÇA & COMPLIANCE (Non-negotiável)

- **PCI-DSS SAQ-A** (Stripe = escopo zero)
- **SOC 2 Type II** (target: mês 6)
- **GDPR/CCPA** (Privacy by design, local-first = compliance natural)
- **End-to-End Encryption** (WebRTC + MLS para sync P2P)
- **Audit Log** (Imutável, assinado criptograficamente)
- **Role-Based Access** (Owner/Manager/Server/Kitchen/Accountant/ReadOnly)
- **Device Trust** (Passkeys + Hardware keys + Geo-fencing)

---

## 📊 MÉTRICAS DE SUCESSO 10/10

| Métrica | Target |
|---------|--------|
| **Time-to-Value** | < 15 min (Menu Genesis) |
| **Daily Active Usage** | > 90% staff ativo |
| **Food Cost Reduction** | -3 a -5 pp em 90 dias |
| **Labor Cost %** | -2 a -4 pp via escala preditiva |
| **Revenue/Seat** | +15-25% via Menu Engineering |
| **Net Revenue Retention** | > 130% |
| **NPS** | > 70 |
| **Uptime** | 99.99% (offline-first = sempre up) |
| **Support Tickets** | < 0.5/mês/unidade (auto-resolve) |

---

## 🎯 PRÓXIMO PASSO IMEDIATO

**Começar AGORA**: Sprint 1 — Foundation Soberana
1. Remover Firebase completamente
2. Implementar PostgreSQL + SQLite WASM + CRDT Sync
3. Auth multi-tenant com RBAC
4. Design System "Avalanche"

**Você autoriza início imediato da Sprint 1?**