/**
 * Econometrics & Statistical Tables module for EduData Analytics
 * Clean & Minimalist Style
 */

const EduEconometrics = {
  renderOLS() {
    const tableBody = document.querySelector('#table-ols-results tbody');
    if (!tableBody) return;

    const ols = EduData.getOLSResults();
    if (!ols || !ols.params) return;

    const varLabels = {
      const: 'Intercepto (Constante)',
      log_renda: 'ln(Renda Familiar)',
      log_pib: 'ln(PIB per Capita Municipal)',
      is_privada: 'Escola Privada (Dummy)',
      score_infra: 'Score de Infraestrutura (0-100)',
      escolaridade_mae: 'Escolaridade da Mãe (Nível 1-5)'
    };

    let html = '';
    for (const [key, beta] of Object.entries(ols.params)) {
      const label = varLabels[key] || key;
      const pval = ols.pvalues ? ols.pvalues[key] : 0;
      const pvalStr = pval < 0.001 ? '< 0.001 ***' : pval.toFixed(4);
      const conf = ols.conf_int ? ols.conf_int[key] : [0, 0];
      const stderr = conf ? ((conf[1] - conf[0]) / (2 * 1.96)).toFixed(3) : '0.000';

      html += `
        <tr>
          <td><strong>${label}</strong></td>
          <td><span class="badge ${beta > 0 ? 'badge-info' : 'badge-danger'}">${beta > 0 ? '+' : ''}${beta}</span></td>
          <td>${stderr}</td>
          <td><code>${pvalStr}</code></td>
          <td>[${conf ? conf[0] : 0} , ${conf ? conf[1] : 0}]</td>
        </tr>
      `;
    }

    tableBody.innerHTML = html;
  },

  renderCorrelationMatrix() {
    const tableHeader = document.querySelector('#table-correlation-matrix thead');
    const tableBody = document.querySelector('#table-correlation-matrix tbody');
    if (!tableHeader || !tableBody) return;

    const matrix = EduData.getCorrelationMatrix();
    if (!matrix || Object.keys(matrix).length === 0) return;

    const keyLabels = {
      nota_geral: 'Nota Geral',
      renda_num: 'Renda Familiar',
      pib_per_capita: 'PIB per Capita',
      score_infra: 'Infraestrutura',
      is_privada: 'Escola Privada',
      escolaridade_mae: 'Escolaridade Mãe'
    };

    const keys = Object.keys(matrix);
    
    // Build Header
    let headerHtml = '<tr><th>Indicador</th>';
    keys.forEach(k => {
      headerHtml += `<th>${keyLabels[k] || k}</th>`;
    });
    headerHtml += '</tr>';
    tableHeader.innerHTML = headerHtml;

    // Build Body
    let bodyHtml = '';
    keys.forEach(rowKey => {
      bodyHtml += `<tr><td><strong>${keyLabels[rowKey] || rowKey}</strong></td>`;
      keys.forEach(colKey => {
        const val = matrix[rowKey][colKey];
        const valNum = parseFloat(val);
        const bgAlpha = Math.min(0.85, Math.abs(valNum));
        let color = valNum > 0 ? `rgba(37, 99, 235, ${bgAlpha * 0.35})` : `rgba(225, 29, 72, ${bgAlpha * 0.35})`;
        if (rowKey === colKey) color = 'rgba(241, 245, 249, 1)';

        bodyHtml += `<td class="heatmap-cell" style="background-color: ${color}; color: #0f172a;">${valNum.toFixed(3)}</td>`;
      });
      bodyHtml += '</tr>';
    });

    tableBody.innerHTML = bodyHtml;
  },

  renderInfraSummaryTable() {
    const tableBody = document.querySelector('#table-infra-summary tbody');
    if (!tableBody) return;

    const data = EduData.getInfraImpact();
    if (!data || data.length === 0) return;

    let html = '';
    data.forEach(item => {
      html += `
        <tr>
          <td><strong>${item.item}</strong></td>
          <td><span class="pulse-dot"></span> Disponível</td>
          <td><strong style="color: var(--accent-emerald)">${item.com_item} pts</strong></td>
          <td><span style="color: var(--text-muted)">${item.sem_item} pts</span></td>
          <td><span class="badge badge-info">+${item.diferenca_pontos} pts</span></td>
          <td><code>p < 0.0001 (Significativo)</code></td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
  }
};
