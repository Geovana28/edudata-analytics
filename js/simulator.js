/**
 * Policy Impact Simulator Module for EduData Analytics
 */

const EduSimulator = {
  chartInstance: null,

  init() {
    this.bindEvents();
    this.calculateImpact();
  },

  bindEvents() {
    const sliders = ['slider-sim-internet', 'slider-sim-lab', 'slider-sim-biblio', 'slider-sim-pcs', 'slider-sim-income'];
    sliders.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.calculateImpact());
      }
    });

    const btnReset = document.getElementById('btn-reset-simulator');
    if (btnReset) {
      btnReset.addEventListener('click', () => this.reset());
    }
  },

  reset() {
    document.getElementById('slider-sim-internet').value = 65;
    document.getElementById('slider-sim-lab').value = 35;
    document.getElementById('slider-sim-biblio').value = 55;
    document.getElementById('slider-sim-pcs').value = 50;
    document.getElementById('slider-sim-income').value = 0;
    this.calculateImpact();
  },

  calculateImpact() {
    const internetVal = parseFloat(document.getElementById('slider-sim-internet').value);
    const labVal = parseFloat(document.getElementById('slider-sim-lab').value);
    const biblioVal = parseFloat(document.getElementById('slider-sim-biblio').value);
    const pcsVal = parseFloat(document.getElementById('slider-sim-pcs').value);
    const incomeIncPct = parseFloat(document.getElementById('slider-sim-income').value);

    // Update Label UI Values
    document.getElementById('val-sim-internet').innerText = `${internetVal}%`;
    document.getElementById('val-sim-lab').innerText = `${labVal}%`;
    document.getElementById('val-sim-biblio').innerText = `${biblioVal}%`;
    document.getElementById('val-sim-pcs').innerText = `${pcsVal}%`;
    document.getElementById('val-sim-income').innerText = `+${incomeIncPct}%`;

    // Baseline stats
    const meta = EduData.getMetadata();
    const basePublicScore = meta.nota_media_publica || 533.5;
    const basePrivateScore = meta.nota_media_privada || 673.8;
    const baseGap = meta.gap_privada_publica || 140.3;

    // Default Baseline Coverage % in Public Schools
    const baseInternet = 65.2;
    const baseLab = 35.4;
    const baseBiblio = 55.0;
    const basePcs = 50.1;

    // Delta Coverage
    const deltaInternet = (internetVal - baseInternet) / 100;
    const deltaLab = (labVal - baseLab) / 100;
    const deltaBiblio = (biblioVal - baseBiblio) / 100;
    const deltaPcs = (pcsVal - basePcs) / 100;

    // Weight parameters based on OLS / Infra Score weights
    // Infra score = 25*internet + 25*lab + 20*biblio + 15*pcs + 15*quadra
    // OLS score_infra beta ~ 0.748
    const betaInfra = 0.748;
    const deltaInfraScore = (deltaInternet * 25) + (deltaLab * 25) + (deltaBiblio * 20) + (deltaPcs * 15);
    const gainInfra = deltaInfraScore * betaInfra;

    // Renda Log Impact (beta ~ 30.088 * ln(1 + pct))
    const betaIncomeLog = 30.088;
    const gainIncome = incomeIncPct > 0 ? betaIncomeLog * Math.log(1 + (incomeIncPct / 100)) : 0;

    const totalGain = Math.max(0, gainInfra + gainIncome);
    const projectedScore = basePublicScore + totalGain;
    const newGap = basePrivateScore - projectedScore;
    const gapReductionPct = ((baseGap - newGap) / baseGap) * 100;

    // Update Metric Displays
    document.getElementById('sim-current-score').innerText = `${basePublicScore.toFixed(1)} pts`;
    document.getElementById('sim-projected-score').innerText = `${projectedScore.toFixed(1)} pts`;
    document.getElementById('sim-delta-score').innerText = `+${totalGain.toFixed(1)} pts no ENEM`;
    document.getElementById('sim-gap-reduction').innerText = `${gapReductionPct.toFixed(1)}% Redução`;
    
    const subText = document.querySelector('.sim-metric-sub');
    if (subText) {
      subText.innerText = `De ${baseGap.toFixed(1)} pts para ${Math.max(0, newGap).toFixed(1)} pts`;
    }

    this.renderChart(basePublicScore, projectedScore, basePrivateScore);
  },

  renderChart(basePub, projPub, priv) {
    const ctx = document.getElementById('chartSimulationImpact');
    if (!ctx || !window.Chart) return;
    if (this.chartInstance) this.chartInstance.destroy();

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Rede Pública (Atual)', 'Rede Pública (Projetada)', 'Benchmark Rede Privada'],
        datasets: [{
          label: 'Nota Média Estimada',
          data: [basePub.toFixed(1), projPub.toFixed(1), priv.toFixed(1)],
          backgroundColor: [
            'rgba(244, 63, 94, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(139, 92, 246, 0.85)'
          ],
          borderColor: ['#f43f5e', '#10b981', '#8b5cf6'],
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: { 
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            min: 450,
            max: 750
          }
        }
      }
    });
  }
};
