# 📊 EduData Analytics: Educational Inequality & Socioeconomic Analytics (ENEM x IBGE)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5 / Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%7C%20CSS3%20%7C%20HTML5-blue.svg)](https://developer.mozilla.org/)
[![Chart.js](https://img.shields.io/badge/Visualizations-Chart.js-orange.svg)](https://www.chartjs.org/)

> **Painel Interativo de Econometria e Ciência de Dados Aplicada a Políticas Públicas Educacionais.**  
> Análise aprofundada da disparidade socioeconômica no desempenho do ENEM integrada a indicadores demográficos e educacionais do IBGE.

---

## 📌 Visão Geral

O **EduData Analytics** é uma plataforma analítica desenvolvida para explorar, quantificar e visualizar as disparidades no desempenho escolar de estudantes brasileiros. Utilizando microdados do ENEM e cruzamentos com dados do IBGE, o projeto aplica métricas econométricas clássicas e visualizações interativas de alta densidade informativa.

---

## 🔬 Principais Métricas e Recursos

- **Índice de Gini Educacional:** Cálculo da concentração e desigualdade na distribuição de notas do exame nacional.
- **Análise de Disparidade (Gap de Desempenho):** Comparativo direto entre alunos da rede pública vs. privada e impacto de renda familiar per capita.
- **Matriz de Correlação Multivariada:** Relação entre escolaridade dos pais, acesso à tecnologia, infraestrutura domiciliar e nota final.
- **Simulador Interativo de Políticas Públicas:** Projeção de impacto hipotético de intervenções educacionais e bolsas de permanência.
- **Exportação de Dados:** Download de relatórios e dados sumarizados em formato `.csv`.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend Core:** HTML5 Semântico, Vanilla JavaScript (ES6+), CSS3 Moderno (Glassmorphism, Dark Theme, Design Responsivo).
- **Bibliotecas de Visualização:** [Chart.js](https://www.chartjs.org/) com personalização de tooltips, gradientes e animações.
- **Ícones & Tipografia:** [Lucide Icons](https://lucide.dev/), Google Fonts (Inter & Outfit).
- **Zero Dependências Pesadas:** Funciona diretamente no navegador sem necessidade de build complexo.

---

## 🚀 Como Executar

### Opção 1: Abrir diretamente no Navegador
Basta abrir o arquivo `index.html` ou `dashboard_standalone.html` no seu navegador de preferência (Google Chrome, Firefox, Edge).

### Opção 2: Servidor Local (Live Server / Python)
Para melhor experiência com carregamento de módulos locais:

```bash
# Usando Python 3
python -m http.server 8000
```
Acesse `http://localhost:8000` no seu navegador.

---

## 📂 Estrutura do Projeto

```text
educacao/
├── css/
│   └── styles.css               # Folhas de estilo e variáveis de tema
├── js/
│   ├── app.js                   # Lógica de manipulação do DOM e filtros
│   ├── charts.js                # Configuração e renderização dos gráficos
│   └── data.js                  # Estruturas e datasets processados
├── data/                        # Bases de dados e microdados processados
├── index.html                   # Painel principal modular
├── dashboard_standalone.html    # Versão standalone autocontida
└── README.md                    # Documentação do projeto
```

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais detalhes.
