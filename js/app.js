/**
 * Master Application Controller for EduData Analytics
 */

const App = {
  currentPage: 1,
  pageSize: 15,
  filteredData: [],

  async init() {
    console.log('🚀 Inicializando EduData Analytics Application...');
    
    // 1. Load Data
    await EduData.init();

    // 2. Render KPI Strip
    this.renderKPIs();

    // 3. Render Charts & Tables
    if (window.EduCharts) EduCharts.renderAll();
    if (window.EduEconometrics) {
      EduEconometrics.renderOLS();
      EduEconometrics.renderCorrelationMatrix();
      EduEconometrics.renderInfraSummaryTable();
    }
    if (window.EduSimulator) EduSimulator.init();

    // 4. Bind UI Event Listeners
    this.bindTabNavigation();
    this.bindExplorerEvents();
    this.bindExportEvents();

    // 5. Initial Data Explorer population
    this.initDataExplorer();

    // 6. Create Icons
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  },

  renderKPIs() {
    const meta = EduData.getMetadata();
    const ols = EduData.getOLSResults();

    if (meta) {
      const kpiGini = document.getElementById('kpi-gini');
      if (kpiGini) kpiGini.innerText = meta.gini_notas ? meta.gini_notas.toFixed(4) : '0.0858';

      const kpiGap = document.getElementById('kpi-gap');
      if (kpiGap) kpiGap.innerText = `+${meta.gap_privada_publica ? meta.gap_privada_publica.toFixed(1) : '140.3'} pts`;
    }

    if (ols) {
      const kpiR2 = document.getElementById('kpi-r2');
      if (kpiR2) kpiR2.innerText = `${(ols.r_squared * 100).toFixed(2)}%`;

      const kpiInfraGain = document.getElementById('kpi-infra-gain');
      if (kpiInfraGain && ols.params && ols.params.score_infra) {
        const fullInfraGain = (ols.params.score_infra * 100).toFixed(1);
        kpiInfraGain.innerText = `+${fullInfraGain} pts`;
      }
    }
  },

  bindTabNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetId = tab.getAttribute('data-tab');

        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');

        // Renderizar ou redimensionar elementos da aba selecionada
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (targetId === 'tab-overview' && window.EduCharts) {
              EduCharts.renderOverviewCharts();
            } else if (targetId === 'tab-infrastructure') {
              if (window.EduCharts) EduCharts.renderInfraCharts();
              if (window.EduEconometrics) EduEconometrics.renderInfraSummaryTable();
            } else if (targetId === 'tab-econometrics') {
              if (window.EduEconometrics) {
                EduEconometrics.renderOLS();
                EduEconometrics.renderCorrelationMatrix();
              }
              if (window.EduCharts) EduCharts.renderEconometricsCharts();
            } else if (targetId === 'tab-simulator') {
              if (window.EduSimulator) EduSimulator.calculateImpact();
            } else if (targetId === 'tab-explorer') {
              App.renderExplorerTable();
            }

            if (window.EduCharts && EduCharts.resizeAll) {
              EduCharts.resizeAll();
            }
          }, 50);
        });
      });
    });
  },

  initDataExplorer() {
    const microdata = EduData.getSampleMicrodata();
    this.filteredData = microdata && microdata.length > 0 ? microdata : this.generateMockMicrodata();
    this.renderExplorerTable();
  },

  bindExplorerEvents() {
    const searchInput = document.getElementById('search-explorer');
    const filterEscola = document.getElementById('filter-escola');
    const filterRenda = document.getElementById('filter-renda');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    const applyFilters = () => {
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const escolaVal = filterEscola ? filterEscola.value : 'ALL';
      const rendaVal = filterRenda ? filterRenda.value : 'ALL';

      const microdata = EduData.getSampleMicrodata();
      const source = microdata && microdata.length > 0 ? microdata : this.generateMockMicrodata();

      this.filteredData = source.filter(row => {
        const matchesQuery = !query || row.uf.toLowerCase().includes(query) || row.region.toLowerCase().includes(query);
        const matchesEscola = escolaVal === 'ALL' || row.tp_escola === escolaVal;
        const matchesRenda = rendaVal === 'ALL' || row.faixa_renda === rendaVal;
        return matchesQuery && matchesEscola && matchesRenda;
      });

      this.currentPage = 1;
      this.renderExplorerTable();
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (filterEscola) filterEscola.addEventListener('change', applyFilters);
    if (filterRenda) filterRenda.addEventListener('change', applyFilters);

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderExplorerTable();
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderExplorerTable();
        }
      });
    }
  },

  renderExplorerTable() {
    const tbody = document.querySelector('#table-microdata tbody');
    const paginationInfo = document.getElementById('pagination-info');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    if (!tbody) return;

    const total = this.filteredData.length;
    const totalPages = Math.ceil(total / this.pageSize) || 1;
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const pageRows = this.filteredData.slice(startIdx, startIdx + this.pageSize);

    let html = '';
    if (pageRows.length === 0) {
      html = '<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 24px;">Nenhum registro encontrado para os filtros selecionados.</td></tr>';
    } else {
      pageRows.forEach(r => {
        const badgeClass = r.tp_escola === 'Privada' ? 'badge-info' : 'badge-warning';
        html += `
          <tr>
            <td>#${r.id}</td>
            <td><strong>${r.uf}</strong></td>
            <td>${r.region}</td>
            <td><span class="badge ${badgeClass}">${r.tp_escola}</span></td>
            <td>${r.faixa_renda}</td>
            <td>R$ ${r.pib_per_capita.toLocaleString('pt-BR')}</td>
            <td>${r.score_infra} / 100</td>
            <td>${r.nota_mt}</td>
            <td>${r.nota_redacao}</td>
            <td><strong style="color: var(--accent-cyan)">${r.nota_geral}</strong></td>
          </tr>
        `;
      });
    }

    tbody.innerHTML = html;

    if (paginationInfo) {
      const endIdx = Math.min(startIdx + this.pageSize, total);
      paginationInfo.innerText = total > 0 
        ? `Exibindo ${startIdx + 1}-${endIdx} de ${total} registros` 
        : '0 registros encontrados';
    }

    if (btnPrev) btnPrev.disabled = this.currentPage <= 1;
    if (btnNext) btnNext.disabled = this.currentPage >= totalPages;
  },

  bindExportEvents() {
    const btnExport = document.getElementById('btn-export-summary');
    if (btnExport) {
      btnExport.addEventListener('click', () => this.exportCSV());
    }
  },

  exportCSV() {
    const data = this.filteredData.length > 0 ? this.filteredData : this.generateMockMicrodata();
    if (!data || data.length === 0) return;

    const headers = ['ID', 'UF', 'Regiao', 'Tipo_Escola', 'Faixa_Renda', 'PIB_Per_Capita', 'Score_Infra', 'Nota_MT', 'Nota_Redacao', 'Nota_Geral'];
    
    let csvContent = headers.join(';') + '\n';
    data.forEach(r => {
      const row = [r.id, r.uf, r.region, r.tp_escola, `"${r.faixa_renda}"`, r.pib_per_capita, r.score_infra, r.nota_mt, r.nota_redacao, r.nota_geral];
      csvContent += row.join(';') + '\n';
    });

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `microdados_enem_ibge_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  generateMockMicrodata() {
    const ufs = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'CE', 'PE', 'DF', 'PA'];
    const regions = { SP: 'Sudeste', RJ: 'Sudeste', MG: 'Sudeste', BA: 'Nordeste', PR: 'Sul', RS: 'Sul', CE: 'Nordeste', PE: 'Nordeste', DF: 'Centro-Oeste', PA: 'Norte' };
    const rendas = ['Classe E (Até 1.5 SM)', 'Classe D (1.5 a 3 SM)', 'Classe C (3 a 6 SM)', 'Classe B (6 a 12 SM)', 'Classe A (Acima 12 SM)'];

    const mock = [];
    for (let i = 1; i <= 100; i++) {
      const uf = ufs[i % ufs.length];
      const tp = i % 5 === 0 ? 'Privada' : 'Pública';
      const renda = rendas[i % rendas.length];
      const pib = 18000 + (i * 450);
      const score = tp === 'Privada' ? 90 + (i % 10) : 40 + (i % 45);
      const notaGeral = tp === 'Privada' ? 655 + (i % 120) : 490 + (i % 110);

      mock.push({
        id: i,
        uf: uf,
        region: regions[uf],
        tp_escola: tp,
        faixa_renda: renda,
        pib_per_capita: pib,
        score_infra: score,
        nota_mt: (notaGeral * 1.02).toFixed(1),
        nota_redacao: (notaGeral * 1.05).toFixed(1),
        nota_geral: notaGeral.toFixed(1)
      });
    }
    return mock;
  }
};

// Initialize Application safely
function startApp() {
  if (window._appInitialized) return;
  window._appInitialized = true;
  App.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
window.addEventListener('load', startApp);
