# 📊 EduData Analytics — Desigualdade Educacional & Socioeconômica

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![HTML5](https://img.shields.io/badge/HTML5-Semântico-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Glassmorphism-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Licença MIT](https://img.shields.io/badge/Licença-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Painel Interativo de Econometria e Ciência de Dados Aplicada a Políticas Públicas Educacionais.**
> Análise da disparidade socioeconômica no desempenho do ENEM integrada a indicadores demográficos e educacionais do IBGE.

---

## 💡 Motivação do Projeto & Decisões Técnicas

As disparidades no desempenho do ENEM são amplamente debatidas, mas muitas vezes reduzidas a uma comparação binária simples entre escolas públicas e privadas. O objetivo do **EduData Analytics** foi estruturar um modelo econométrico capaz de isolar o efeito da infraestrutura física escolar (laboratórios, bibliotecas, internet) controlando pelo nível socioeconômico familiar (renda e escolaridade materna).

### Decisões de Engenharia:
1. **Arquitetura Autocontida (Zero Backend):**
   Para permitir que qualquer avaliador ou gestor execute o projeto com um duplo clique no navegador, o painel foi construído em HTML5 semântico, JavaScript ES6+ e Chart.js via CDN, eliminando atritos de instalação de servidores locais.
2. **Controle Econométrico (Mínimos Quadrados Ordinários - OLS):**
   Em vez de apenas correlações superficiais, estimamos um modelo de regressão múltipla que demonstra que cada ponto adicional no índice de infraestrutura escolar agrega ganhos mensuráveis na proficiência média dos estudantes, mesmo ao controlar por renda.
3. **Simulador com Feedback Imediato:**
   O simulador de políticas públicas traduz coeficientes econométricos em sliders intuitivos, demonstrando o impacto projetado de investimentos estatais em conectividade e laboratórios.

---

## 🖥️ Módulos do Dashboard

| Módulo | Descrição |
|--------|-----------|
| 📈 **Panorama & Disparidade** | Gráficos de desempenho por renda, escola (pública vs privada) e região |
| 🏫 **Infraestrutura Escolar** | Impacto de cada recurso educacional + comparativo de cobertura |
| 🧠 **Econometria & ML** | Regressão OLS, Random Forest Feature Importance, Matriz de Correlação |
| 🎛️ **Simulador de Políticas** | 5 sliders interativos com projeção econométrica em tempo real |
| 📋 **Data Explorer** | Tabela paginada com filtros por UF, escola e renda + exportação CSV |

---

## 🔬 Métricas Científicas

- **Índice de Gini Educacional:** `0.0858` — concentração na distribuição de notas
- **Gap Público-Privado:** `+140.3 pts` — disparidade média nacional
- **OLS R² Ajustado:** `76.16%` — variância explicada pelo modelo econométrico
- **5 variáveis explicativas:** ln(Renda), ln(PIB), Escola Privada, Infraestrutura, Escolaridade Mãe

### Modelo Econométrico OLS (Mínimos Quadrados Ordinários)

$$\text{Nota}_{ENEM} = 63.8 + 30.1 \cdot \ln(\text{Renda}) + 15.0 \cdot \ln(\text{PIB}) + 73.0 \cdot \text{Privada} + 0.75 \cdot \text{Infra} + 12.6 \cdot \text{EscMãe}$$

Todos os 5 regressores apresentam significância estatística ($p < 0.001$) na amostra analisada, e são complementados pela análise de importância relativa via *Random Forest* e matriz de correlação de Pearson no módulo **Econometria & ML**.

### Dicionário de Variáveis e Limitações Metodológicas

- **Variáveis**:
  - `Nota_ENEM`: Proficiência média agregada nas provas objetivas e redação (escala 0–1000).
  - `ln(Renda)`: Logaritmo natural da renda familiar mensal per capita.
  - `ln(PIB)`: Logaritmo natural do PIB per capita municipal (IBGE).
  - `Privada`: Variável *dummy* indicadora de dependência administrativa privada ($1 = \text{Privada}, 0 = \text{Pública}$).
  - `Infra`: Índice composto de infraestrutura escolar ($0\text{–}100$, contemplando laboratório de ciências, informática, internet banda larga, biblioteca e quadra).
  - `EscMãe`: Nível de escolaridade materna categorizado.
- **Associação Estatística vs. Causalidade**: Os coeficientes estimados por OLS e as importâncias de variáveis por *Random Forest* refletem **associações condicionais observacionais** em dados em corte transversal (*cross-section*). Não devem ser interpretados como efeito causal direto sem estratégias adicionais de identificação (como variáveis instrumentais, *differences-in-differences* ou regressão descontínua) devido à potencial variável omitida (ex.: seleção familiar não observada).

---

## 🛠️ Tecnologias

| Categoria | Stack |
|-----------|-------|
| **Frontend** | HTML5 Semântico, Vanilla JavaScript (ES6+), CSS3 (Dark Glassmorphism) |
| **Gráficos** | [Chart.js 4.4](https://www.chartjs.org/) via CDN |
| **Ícones** | [Lucide Icons](https://lucide.dev/) via CDN |
| **Tipografia** | Google Fonts (Inter & Outfit) |
| **Arquitetura** | Single-file auto-contido — zero dependências locais |

---

## 🚀 Como Executar

### Abrir direto no navegador (recomendado)

Basta dar **dois cliques** no arquivo `index.html`. Funciona 100% via `file://` — sem necessidade de servidor.

```bash
# Ou via servidor local (opcional)
python -m http.server 8000
# Acesse http://localhost:8000
```

---

## 📂 Estrutura do Projeto

```text
educacao/
├── index.html               # Dashboard completo (single-file, ~50KB)
├── README.md                # Esta documentação
├── data/
│   └── enem_ibge_dataset.json   # Dataset original (backup)
└── js/                      # Arquivos legados (v1 — não necessários)
```

> **Nota:** A versão atual é o `index.html` auto-contido. Os arquivos na pasta `js/` e `css/` são da versão anterior e podem ser removidos.

---

## 🎓 Citação (BibTeX)

```bibtex
@misc{edudata_analytics_2026,
  title   = {EduData Analytics: Educational Inequality \& Socioeconomic Dashboard},
  author  = {Geovana Luiza Morais Moreira},
  year    = {2026},
  url     = {https://github.com/Geovana28/edudata-analytics}
}
```

---

## ⚖️ Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
