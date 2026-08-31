# 🎓 Relatório Executivo: Analytics de Desigualdade Social e Educacional (ENEM x IBGE)

## 📌 Resumo Executivo
Este documento apresenta a síntese estatística e econométrica do cruzamento entre os microdados do **ENEM** e indicadores do **IBGE** (Renda Per Capita, PIB Municipal e Infraestrutura Escolar), abrangendo uma amostra representativa de **5,000 estudantes**.

---

## 📊 Principais Indicadores Sintéticos

| Indicador | Valor Encontrado | Interpretação Socioeconômica |
| :--- | :---: | :--- |
| **Coeficiente de Gini (Notas ENEM)** | **0.0858** | Nível de concentração e disparidade na distribuição de notas |
| **Nota Média Nacional** | **571.8 pts** | Média geral ponderada das 5 provas do ENEM |
| **Nota Média - Rede Privada** | **673.8 pts** | Desempenho médio dos alunos de escolas privadas |
| **Nota Média - Rede Pública** | **533.5 pts** | Desempenho médio dos alunos de escolas públicas |
| **Gap Estrutural (Privada - Pública)** | **+140.3 pts** | Abismo educacional médio entre as duas redes |
| **Renda Média Familiar** | **R$ 5,950.17** | Média da renda bruta mensal das famílias |
| **PIB per Capita Municipal Médio** | **R$ 42,908.91** | Média do PIB per capita dos municípios analisados |

---

## 🤖 Modelo Econométrico OLS (Ordinary Least Squares)

Foi estimado um modelo de Regressão Linear Múltipla com especificação log-linear para explicar o desempenho no ENEM:

$$\text{Nota Geral} = \beta_0 + \beta_1 \ln(\text{Renda}) + \beta_2 \ln(\text{PIB}) + \beta_3 \text{Privada} + \beta_4 \text{Score Infra} + \beta_5 \text{Escolaridade Mãe} + \varepsilon$$

* **Ajuste do Modelo ($R^2$):** **76.16%** da variância das notas no ENEM é explicada exclusivamente por este conjunto de fatores socioeconômicos e estruturais.
* **Significância Global (p-valor do F):** `< 0.0001` (Modelo estatisticamente robusto).

### Coeficientes Estimados (Pesos das Variáveis):

1. **ln(Renda Familiar) ($\beta = 30.088$):** Cada aumento proporcional na renda familiar mensal eleva a nota geral do aluno em aproximadamente **30.088 pontos**.
2. **Escola Privada ($\beta = 72.979$):** O fato de estudar na rede privada adiciona **+72.979 pontos** diretamente na nota média, isolando os demais fatores.
3. **Score de Infraestrutura ($\beta = 0.748$):** Uma escola com infraestrutura 100% equipada proporciona um ganho médio de **+74.8 pontos** no ENEM.
4. **Escolaridade da Mãe ($\beta = 12.624$):** Cada nível adicional na formação materna adiciona **+12.624 pontos** no desempenho do estudante.

---

## 🏫 Impacto da Infraestrutura na Rede Pública

A análise pontual de cada item de infraestrutura em escolas públicas revelou os seguintes ganhos médios:

- **Acesso à Internet Banda Larga:** Escolas com este recurso obtêm nota média de **546.1 pts** vs. **505.6 pts** sem o recurso (Diferença: **+40.5 pts**).
- **Laboratório de Ciências:** Escolas com este recurso obtêm nota média de **554.1 pts** vs. **520.2 pts** sem o recurso (Diferença: **+33.9 pts**).
- **Biblioteca Escolar:** Escolas com este recurso obtêm nota média de **546.8 pts** vs. **514.4 pts** sem o recurso (Diferença: **+32.5 pts**).
- **Quadra de Esportes:** Escolas com este recurso obtêm nota média de **544.9 pts** vs. **513.6 pts** sem o recurso (Diferença: **+31.3 pts**).
- **Computadores para Alunos:** Escolas com este recurso obtêm nota média de **544.5 pts** vs. **520.9 pts** sem o recurso (Diferença: **+23.6 pts**).

---

## 🔮 Recomendações para Políticas Públicas

1. **Priorização de Conectividade & Laboratórios nas Escolas Públicas:** Investimentos em internet de alta velocidade e laboratórios de ciências nas redes municipais e estaduais oferecem o maior retorno marginal por real investido nas notas do ENEM.
2. **Combate à Segregação Educacional:** Políticas de incentivo ao tempo integral e bibliotecas comunitárias atenuam o impacto da baixa escolaridade dos pais.
3. **Equidade na Distribuição de Recursos:** Direcionamento prioritário de fundos para municípios com menor PIB per capita e alto déficit estrutural em escolas.

---
*Relatório gerado automaticamente pela suíte estatística EduData Analytics.*
