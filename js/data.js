/**
 * Data Loader & State Provider for EduData Analytics
 */

const EduData = {
  rawDataset: (typeof EMBEDDED_DATASET !== 'undefined' && EMBEDDED_DATASET) ? EMBEDDED_DATASET : null,
  isLoaded: (typeof EMBEDDED_DATASET !== 'undefined' && !!EMBEDDED_DATASET),

  async init() {
    if (this.rawDataset && this.rawDataset.metadata && this.rawDataset.aggregations) {
      console.log('✅ Dataset ENEM x IBGE pré-carregado em memória!');
      this.isLoaded = true;
      return;
    }

    if (typeof EMBEDDED_DATASET !== 'undefined' && EMBEDDED_DATASET) {
      this.rawDataset = EMBEDDED_DATASET;
      this.isLoaded = true;
      console.log('✅ Dataset inicializado a partir de EMBEDDED_DATASET.');
      return;
    }

    try {
      const response = await fetch('data/enem_ibge_dataset.json');
      if (response && response.ok) {
        this.rawDataset = await response.json();
        this.isLoaded = true;
        console.log('✅ Dataset ENEM x IBGE carregado com sucesso via HTTP!');
        return;
      }
    } catch (err) {
      console.warn('⚠️ Fetch local desabilitado (modo offline/file://). Usando fallback embutido.', err);
    }

    if (typeof EMBEDDED_DATASET !== 'undefined') {
      this.rawDataset = EMBEDDED_DATASET;
      this.isLoaded = true;
    }
  },

  getMetadata() {
    return this.rawDataset ? this.rawDataset.metadata : {};
  },

  getIncomeData() {
    return this.rawDataset && this.rawDataset.aggregations ? this.rawDataset.aggregations.by_income : [];
  },

  getSchoolComparison() {
    return this.rawDataset && this.rawDataset.aggregations ? this.rawDataset.aggregations.by_escola : [];
  },

  getRegionalData() {
    return this.rawDataset && this.rawDataset.aggregations ? this.rawDataset.aggregations.by_region : [];
  },

  getInfraImpact() {
    return this.rawDataset && this.rawDataset.aggregations ? this.rawDataset.aggregations.infra_impact_publica : [];
  },

  getOLSResults() {
    return this.rawDataset ? this.rawDataset.ols_regression : {};
  },

  getFeatureImportance() {
    return this.rawDataset ? this.rawDataset.feature_importance : {};
  },

  getCorrelationMatrix() {
    return this.rawDataset ? this.rawDataset.correlation_matrix : {};
  },

  getSampleMicrodata() {
    return this.rawDataset ? this.rawDataset.sample_microdata : [];
  }
};
