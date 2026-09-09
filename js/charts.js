/**
 * Robust Chart Renderer for EduData Analytics
 * Clean & Minimalist Theme with seamless tab support
 */

const EduCharts = {
  instances: {},

  _prepareCanvas(canvas) {
    if (!canvas) return;
    canvas.style.display = 'block';
    if (canvas.parentElement) {
      const existingFallback = canvas.parentElement.querySelector('.html-chart-fallback');
      if (existingFallback) existingFallback.remove();
    }
  },

  renderAll() {
    console.log('📊 Renderizando visualizações EduCharts...');
    this.renderOverviewCharts();
    this.renderInfraCharts();
    this.renderEconometricsCharts();
  },

  renderOverviewCharts() {
    this.renderIncomeDisparity();
    this.renderSchoolComparison();
    this.renderRegionalDisparity();
  },

  renderInfraCharts() {
    this.renderInfraImpact();
    this.renderInfraCoverage();
  },

  renderEconometricsCharts() {
    this.renderFeatureImportance();
  },

  renderIncomeDisparity() {
    const canvas = document.getElementById('chartIncomeDisparity');
    if (!canvas) return;
    const data = EduData.getIncomeData() || [];
    if (!data || data.length === 0) return;

    if (window.Chart) {
      try {
        this._prepareCanvas(canvas);
        if (this.instances.income) this.instances.income.destroy();

        const labels = data.map(d => (d.faixa_renda ? d.faixa_renda.split(' ').slice(0, 2).join(' ') : ''));
        const scoresGeral = data.map(d => d.nota_media || 0);
        const scoresMT = data.map(d => d.nota_mt || 0);

        this.instances.income = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              { label: 'Nota Geral Média', data: scoresGeral, backgroundColor: '#1d4ed8', borderRadius: 6 },
              { label: 'Matemática (MT)', data: scoresMT, backgroundColor: '#0d9488', borderRadius: 6 }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { color: '#334155', font: { family: 'Inter', weight: 500 } } }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#64748b' } },
              y: { min: 400, max: 850, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } }
            }
          }
        });
        return;
      } catch (err) {
        console.warn('Erro ao criar Chart.js income:', err);
      }
    }

    // Fallback HTML sem destruir o canvas
    this._renderHtmlFallback(canvas, () => {
      let html = '<div style="display:flex; flex-direction:column; gap:10px; height:100%; justify-content:center; padding:10px;">';
      data.forEach(d => {
        const pctGeral = Math.min(100, Math.max(10, ((d.nota_media - 400) / 400) * 100));
        html += `
          <div style="display:flex; align-items:center; gap:10px; font-size:0.85rem;">
            <span style="width:110px; color:#1e293b; font-weight:600;">${d.faixa_renda.split(' ')[0]} ${d.faixa_renda.split(' ')[1]}</span>
            <div style="flex:1; background:#e2e8f0; height:20px; border-radius:4px; overflow:hidden;">
              <div style="width:${pctGeral}%; background:#1d4ed8; height:100%; border-radius:4px;"></div>
            </div>
            <strong style="color:#1d4ed8; width:65px; text-align:right;">${d.nota_media} pts</strong>
          </div>
        `;
      });
      html += '</div>';
      return html;
    });
  },

  renderSchoolComparison() {
    const canvas = document.getElementById('chartSchoolComparison');
    if (!canvas) return;
    const data = EduData.getSchoolComparison() || [];
    const pub = data.find(d => d && (d.tp_escola === 'Pública' || d.tp_escola.includes('blica'))) || { nota_cn: 510, nota_ch: 545, nota_lc: 538, nota_mt: 512, nota_redacao: 561 };
    const priv = data.find(d => d && d.tp_escola === 'Privada') || { nota_cn: 658, nota_ch: 680, nota_lc: 668, nota_mt: 685, nota_redacao: 727 };

    if (window.Chart) {
      try {
        this._prepareCanvas(canvas);
        if (this.instances.school) this.instances.school.destroy();

        const categories = ['CN', 'CH', 'LC', 'MT', 'Redação'];
        const pubScores = [pub.nota_cn, pub.nota_ch, pub.nota_lc, pub.nota_mt, pub.nota_redacao];
        const privScores = [priv.nota_cn, priv.nota_ch, priv.nota_lc, priv.nota_mt, priv.nota_redacao];

        this.instances.school = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: categories,
            datasets: [
              { label: 'Escola Privada', data: privScores, backgroundColor: '#4338ca', borderRadius: 6 },
              { label: 'Escola Pública', data: pubScores, backgroundColor: '#e11d48', borderRadius: 6 }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { color: '#334155', font: { family: 'Inter', weight: 500 } } }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#64748b' } },
              y: { min: 400, max: 800, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } }
            }
          }
        });
        return;
      } catch (err) {
        console.warn('Erro ao criar Chart.js school:', err);
      }
    }

    this._renderHtmlFallback(canvas, () => {
      const items = [
        { name: 'Matemática (MT)', pub: pub.nota_mt, priv: priv.nota_mt },
        { name: 'Redação', pub: pub.nota_redacao, priv: priv.nota_redacao },
        { name: 'Ciências da Natureza', pub: pub.nota_cn, priv: priv.nota_cn },
        { name: 'Ciências Humanas', pub: pub.nota_ch, priv: priv.nota_ch },
        { name: 'Linguagens & Códigos', pub: pub.nota_lc, priv: priv.nota_lc }
      ];
      let html = '<div style="display:flex; flex-direction:column; gap:12px; padding:10px;">';
      items.forEach(it => {
        html += `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
              <span style="color:#334155; font-weight:500;">${it.name}</span>
              <span><strong style="color:#e11d48">Pública: ${it.pub}</strong> vs <strong style="color:#4338ca">Privada: ${it.priv}</strong></span>
            </div>
            <div style="display:flex; gap:4px; height:10px;">
              <div style="width:${(it.pub/800)*100}%; background:#e11d48; border-radius:3px;"></div>
              <div style="width:${(it.priv/800)*100}%; background:#4338ca; border-radius:3px;"></div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      return html;
    });
  },

  renderRegionalDisparity() {
    const canvas = document.getElementById('chartRegionalDisparity');
    if (!canvas) return;
    const data = EduData.getRegionalData() || [];

    if (window.Chart && data.length > 0) {
      try {
        this._prepareCanvas(canvas);
        if (this.instances.regional) this.instances.regional.destroy();

        const regions = data.map(d => d.region);
        const scores = data.map(d => d.nota_media);
        const pibs = data.map(d => d.pib_medio / 1000);

        this.instances.regional = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: regions,
            datasets: [
              { label: 'Nota Média', data: scores, backgroundColor: '#0d9488', borderRadius: 6, yAxisID: 'y' },
              { type: 'line', label: 'PIB per Capita (R$ mil)', data: pibs, borderColor: '#d97706', backgroundColor: '#d97706', borderWidth: 2.5, tension: 0.2, yAxisID: 'y1' }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { color: '#334155', font: { family: 'Inter', weight: 500 } } }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#64748b' } },
              y: { type: 'linear', position: 'left', min: 450, max: 600, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
              y1: { type: 'linear', position: 'right', grid: { display: false }, ticks: { color: '#d97706' } }
            }
          }
        });
        return;
      } catch (err) {
        console.warn('Erro ao criar Chart.js regional:', err);
      }
    }

    this._renderHtmlFallback(canvas, () => {
      let html = '<div style="display:flex; flex-direction:column; gap:10px; padding:10px;">';
      data.forEach(d => {
        html += `
          <div style="display:flex; align-items:center; gap:12px; font-size:0.85rem;">
            <span style="width:90px; color:#0f172a; font-weight:600;">${d.region}</span>
            <div style="flex:1; background:#e2e8f0; height:18px; border-radius:4px; overflow:hidden;">
              <div style="width:${((d.nota_media-450)/200)*100}%; background:#0d9488; height:100%; border-radius:4px;"></div>
            </div>
            <span style="color:#0d9488; font-weight:700;">${d.nota_media} pts</span>
            <span style="color:#d97706; font-size:0.75rem; font-weight:600;">(R$ ${(d.pib_medio/1000).toFixed(1)}k PIB)</span>
          </div>
        `;
      });
      html += '</div>';
      return html;
    });
  },

  renderInfraImpact() {
    const canvas = document.getElementById('chartInfraImpact');
    if (!canvas) return;
    const data = EduData.getInfraImpact() || [];

    if (window.Chart && data.length > 0) {
      try {
        this._prepareCanvas(canvas);
        if (this.instances.infraImpact) this.instances.infraImpact.destroy();

        this.instances.infraImpact = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: data.map(d => d.item),
            datasets: [{ label: 'Ganho na Nota (Pontos)', data: data.map(d => d.diferenca_pontos), backgroundColor: '#16a34a', borderRadius: 6 }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
              y: { grid: { display: false }, ticks: { color: '#334155' } }
            }
          }
        });
        return;
      } catch (err) {
        console.warn('Erro ao criar Chart.js infraImpact:', err);
      }
    }

    this._renderHtmlFallback(canvas, () => {
      let html = '<div style="display:flex; flex-direction:column; gap:10px; padding:10px;">';
      data.forEach(d => {
        html += `
          <div style="display:flex; align-items:center; gap:10px; font-size:0.85rem;">
            <span style="width:180px; color:#334155; font-weight:500;">${d.item}</span>
            <div style="flex:1; background:#e2e8f0; height:18px; border-radius:4px; overflow:hidden;">
              <div style="width:${(d.diferenca_pontos/60)*100}%; background:#16a34a; height:100%; border-radius:4px;"></div>
            </div>
            <strong style="color:#16a34a; width:70px; text-align:right;">+${d.diferenca_pontos} pts</strong>
          </div>
        `;
      });
      html += '</div>';
      return html;
    });
  },

  renderInfraCoverage() {
    const canvas = document.getElementById('chartInfraCoverage');
    if (!canvas) return;
    const data = EduData.getSchoolComparison() || [];
    const pub = data.find(d => d && (d.tp_escola === 'Pública' || d.tp_escola.includes('blica'))) || {};

    const items = [
      { name: 'Internet Banda Larga', pub: pub.pct_internet || 68.7, priv: 97.7 },
      { name: 'Lab de Ciências', pub: pub.pct_lab || 39.1, priv: 92.2 },
      { name: 'Biblioteca', pub: 55.0, priv: 95.0 },
      { name: 'Salas de Computação', pub: 50.1, priv: 96.4 }
    ];

    if (window.Chart) {
      try {
        this._prepareCanvas(canvas);
        if (this.instances.infraCoverage) this.instances.infraCoverage.destroy();

        this.instances.infraCoverage = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: items.map(i => i.name),
            datasets: [
              { label: 'Rede Pública (%)', data: items.map(i => i.pub), backgroundColor: '#e11d48', borderRadius: 6 },
              { label: 'Rede Privada (%)', data: items.map(i => i.priv), backgroundColor: '#4338ca', borderRadius: 6 }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top', labels: { color: '#334155', font: { family: 'Inter', weight: 500 } } }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#64748b' } },
              y: { min: 0, max: 100, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } }
            }
          }
        });
        return;
      } catch (err) {
        console.warn('Erro ao criar Chart.js infraCoverage:', err);
      }
    }

    this._renderHtmlFallback(canvas, () => {
      let html = '<div style="display:flex; flex-direction:column; gap:12px; padding:10px;">';
      items.forEach(it => {
        html += `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
              <span style="color:#334155; font-weight:500;">${it.name}</span>
              <span><strong style="color:#e11d48">Pública: ${it.pub}%</strong> vs <strong style="color:#4338ca">Privada: ${it.priv}%</strong></span>
            </div>
            <div style="display:flex; gap:4px; height:10px;">
              <div style="width:${it.pub}%; background:#e11d48; border-radius:3px;"></div>
              <div style="width:${it.priv}%; background:#4338ca; border-radius:3px;"></div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      return html;
    });
  },

  renderFeatureImportance() {
    const canvas = document.getElementById('chartFeatureImportance');
    if (!canvas) return;
    const raw = EduData.getFeatureImportance() || {};

    const labelMap = {
      renda_num: 'Renda Familiar',
      is_privada: 'Tipo de Escola (Privada)',
      score_infra: 'Infraestrutura Escolar',
      escolaridade_mae: 'Escolaridade Mãe',
      pib_per_capita: 'PIB per Capita',
      in_internet: 'Acesso à Internet',
      in_lab_ciencias: 'Laboratório Ciências'
    };

    const items = Object.entries(raw).map(([k, v]) => ({ name: labelMap[k] || k, val: (v * 100).toFixed(1) }));

    if (window.Chart && items.length > 0) {
      try {
        this._prepareCanvas(canvas);
        if (this.instances.featureImp) this.instances.featureImp.destroy();

        this.instances.featureImp = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: items.map(i => i.name),
            datasets: [{ label: 'Importância (%)', data: items.map(i => i.val), backgroundColor: '#1d4ed8', borderRadius: 6 }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: '#e2e8f0' }, ticks: { color: '#64748b' } },
              y: { grid: { display: false }, ticks: { color: '#334155' } }
            }
          }
        });
        return;
      } catch (err) {
        console.warn('Erro ao criar Chart.js featureImp:', err);
      }
    }

    this._renderHtmlFallback(canvas, () => {
      let html = '<div style="display:flex; flex-direction:column; gap:10px; padding:10px;">';
      items.forEach(it => {
        html += `
          <div style="display:flex; align-items:center; gap:10px; font-size:0.85rem;">
            <span style="width:160px; color:#334155; font-weight:500;">${it.name}</span>
            <div style="flex:1; background:#e2e8f0; height:18px; border-radius:4px; overflow:hidden;">
              <div style="width:${it.val}%; background:#1d4ed8; height:100%; border-radius:4px;"></div>
            </div>
            <strong style="color:#1d4ed8; width:45px; text-align:right;">${it.val}%</strong>
          </div>
        `;
      });
      html += '</div>';
      return html;
    });
  },

  // Helper para exibir fallback visual SEM destruir a tag <canvas>
  _renderHtmlFallback(canvas, htmlGenerator) {
    if (!canvas || !canvas.parentElement) return;
    const parent = canvas.parentElement;
    canvas.style.display = 'none';

    let fallback = parent.querySelector('.html-chart-fallback');
    if (!fallback) {
      fallback = document.createElement('div');
      fallback.className = 'html-chart-fallback';
      fallback.style.height = '100%';
      fallback.style.width = '100%';
      parent.appendChild(fallback);
    }
    fallback.innerHTML = htmlGenerator();
  },

  // Força o redimensionamento dos gráficos visíveis
  resizeAll() {
    Object.values(this.instances).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        try { chart.resize(); } catch(e) {}
      }
    });
  }
};
