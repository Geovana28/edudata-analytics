/**
 * Data Loader & State Provider for EduData Analytics
 */

const EduData = {
  rawDataset: typeof EMBEDDED_DATASET !== 'undefined' ? EMBEDDED_DATASET : null,
  isLoaded: typeof EMBEDDED_DATASET !== 'undefined',

  async init() {
    if (this.rawDataset && this.rawDataset.metadata) {
      console.log('✅ Dataset ENEM x IBGE pré-carregado em memória!');
      return;
    }

    try {
      const response = await fetch('data/enem_ibge_dataset.json');
      if (!response.ok) throw new Error('Data file not found via HTTP');
      this.rawDataset = await response.json();
      this.isLoaded = true;
      console.log('✅ Dataset ENEM x IBGE carregado com sucesso via HTTP!', this.rawDataset);
    } catch (err) {
      console.warn('⚠️ Utilizando dataset compilado estático de fallback.', err);
      this.rawDataset = typeof EMBEDDED_DATASET !== 'undefined' ? EMBEDDED_DATASET : this.getFallbackDataset();
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
