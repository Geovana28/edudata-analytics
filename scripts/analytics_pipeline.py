import json
import os
import sys
import math
import numpy as np
import pandas as pd
from scipy import stats
import statsmodels.api as sm
from sklearn.ensemble import RandomForestRegressor

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def generate_enem_ibge_dataset(seed=42, n_samples=5000):
    np.random.seed(seed)
    
    states_data = [
        {"uf": "SP", "region": "Sudeste", "pib_avg": 58000, "weight": 0.22},
        {"uf": "RJ", "region": "Sudeste", "pib_avg": 45000, "weight": 0.10},
        {"uf": "MG", "region": "Sudeste", "pib_avg": 34000, "weight": 0.12},
        {"uf": "ES", "region": "Sudeste", "pib_avg": 38000, "weight": 0.03},
        {"uf": "PR", "region": "Sul", "pib_avg": 42000, "weight": 0.06},
        {"uf": "SC", "region": "Sul", "pib_avg": 48000, "weight": 0.04},
        {"uf": "RS", "region": "Sul", "pib_avg": 40000, "weight": 0.06},
        {"uf": "BA", "region": "Nordeste", "pib_avg": 21000, "weight": 0.07},
        {"uf": "PE", "region": "Nordeste", "pib_avg": 22000, "weight": 0.05},
        {"uf": "CE", "region": "Nordeste", "pib_avg": 20000, "weight": 0.05},
        {"uf": "MA", "region": "Nordeste", "pib_avg": 16000, "weight": 0.03},
        {"uf": "PB", "region": "Nordeste", "pib_avg": 19000, "weight": 0.02},
        {"uf": "PA", "region": "Norte", "pib_avg": 23000, "weight": 0.04},
        {"uf": "AM", "region": "Norte", "pib_avg": 27000, "weight": 0.02},
        {"uf": "GO", "region": "Centro-Oeste", "pib_avg": 36000, "weight": 0.04},
        {"uf": "DF", "region": "Centro-Oeste", "pib_avg": 87000, "weight": 0.03},
        {"uf": "MT", "region": "Centro-Oeste", "pib_avg": 46000, "weight": 0.02},
    ]
    
    ufs = [s["uf"] for s in states_data]
    weights = [s["weight"] for s in states_data]
    weights = np.array(weights) / sum(weights)
    
    chosen_states_idx = np.random.choice(len(states_data), size=n_samples, p=weights)
    
    records = []
    
    # Renda familiar (Q006 - Faixas A a Q)
    # Class A: Nenhuma renda ~ R$ 1.200 (Faixa 1)
    # Class B: R$ 1.200 - R$ 2.400 (Faixa 2)
    # Class C: R$ 2.400 - R$ 6.000 (Faixa 3)
    # Class D: R$ 6.000 - R$ 12.000 (Faixa 4)
    # Class E: R$ 12.000+ (Faixa 5)
    
    income_brackets = [
        {"code": "Classe E (Até 1.5 SM)", "val": 1400, "p": 0.35, "level": 1},
        {"code": "Classe D (1.5 a 3 SM)", "val": 3500, "p": 0.30, "level": 2},
        {"code": "Classe C (3 a 6 SM)", "val": 7500, "p": 0.20, "level": 3},
        {"code": "Classe B (6 a 12 SM)", "val": 14000, "p": 0.10, "level": 4},
        {"code": "Classe A (Acima 12 SM)", "val": 25000, "p": 0.05, "level": 5},
    ]
    
    inc_probs = [ib["p"] for ib in income_brackets]
    
    for i in range(n_samples):
        st = states_data[chosen_states_idx[i]]
        uf = st["uf"]
        region = st["region"]
        
        # PIB municipal com variabilidade log-normal
        pib_base = st["pib_avg"]
        pib_per_capita = float(np.random.lognormal(mean=np.log(pib_base), sigma=0.35))
        
        # Faixa de Renda
        inc_obj = np.random.choice(income_brackets, p=inc_probs)
        renda_num = inc_obj["val"] * np.random.uniform(0.85, 1.25)
        faixa_renda = inc_obj["code"]
        renda_level = inc_obj["level"]
        
        # Tipo de Escola: Renda mais alta -> Maior prob de Privada
        prob_privada = 0.05 + 0.18 * (renda_level - 1)
        is_privada = 1 if np.random.rand() < prob_privada else 0
        tp_escola = "Privada" if is_privada == 1 else "Pública"
        
        # Escolaridade dos pais (1 a 5)
        escolaridade_mae = min(5, max(1, int(np.random.normal(loc=renda_level * 0.8 + 1.2, scale=0.8))))
        
        # Infraestrutura da Escola (probabilidades correlacionadas com Tipo de Escola e PIB)
        pib_factor = min(1.5, max(0.5, pib_per_capita / 35000))
        
        if is_privada:
            in_internet = 1 if np.random.rand() < 0.98 else 0
            in_lab_ciencias = 1 if np.random.rand() < 0.92 else 0
            in_biblioteca = 1 if np.random.rand() < 0.95 else 0
            in_quadra = 1 if np.random.rand() < 0.90 else 0
            in_computadores = 1 if np.random.rand() < 0.96 else 0
        else:
            in_internet = 1 if np.random.rand() < (0.65 * pib_factor) else 0
            in_lab_ciencias = 1 if np.random.rand() < (0.35 * pib_factor) else 0
            in_biblioteca = 1 if np.random.rand() < (0.55 * pib_factor) else 0
            in_quadra = 1 if np.random.rand() < (0.60 * pib_factor) else 0
            in_computadores = 1 if np.random.rand() < (0.50 * pib_factor) else 0
            
        score_infra = (in_internet * 25 + in_lab_ciencias * 25 + in_biblioteca * 20 + in_quadra * 15 + in_computadores * 15)
        
        # Latent Academic Capability / Socioeconomic Determinants
        # Modelo latente estatístico:
        # Base: 420 pontos
        # Renda: + 28 * log(renda)
        # PIB municipal: + 12 * log(pib)
        # Tipo escola: + 65 se Privada
        # Infraestrutura: + 0.8 * score_infra
        # Escolaridade mãe: + 15 * escolaridade
        # Ruído aleatório normal ~ (0, 45)
        
        latent_ability = (
            400.0 +
            30.0 * np.log(renda_num / 1000.0) +
            14.0 * np.log(pib_per_capita / 10000.0) +
            (70.0 if is_privada else 0.0) +
            0.75 * score_infra +
            14.0 * escolaridade_mae +
            np.random.normal(0, 38.0)
        )
        
        # Gerar notas específicas das 5 provas com variações realistas
        nota_cn = min(1000.0, max(300.0, latent_ability * 0.92 + np.random.normal(0, 35)))
        nota_ch = min(1000.0, max(300.0, latent_ability * 1.02 + np.random.normal(0, 30)))
        nota_lc = min(1000.0, max(300.0, latent_ability * 1.00 + np.random.normal(0, 28)))
        nota_mt = min(1000.0, max(300.0, latent_ability * 1.08 + np.random.normal(0, 42)))
        nota_redacao = min(1000.0, max(250.0, latent_ability * 1.05 + np.random.normal(0, 50)))
        
        nota_geral = (nota_cn + nota_ch + nota_lc + nota_mt + nota_redacao) / 5.0
        
        records.append({
            "id": i + 1,
            "uf": uf,
            "region": region,
            "pib_per_capita": round(pib_per_capita, 2),
            "renda_num": round(renda_num, 2),
            "faixa_renda": faixa_renda,
            "renda_level": int(renda_level),
            "tp_escola": tp_escola,
            "is_privada": is_privada,
            "escolaridade_mae": escolaridade_mae,
            "in_internet": in_internet,
            "in_lab_ciencias": in_lab_ciencias,
            "in_biblioteca": in_biblioteca,
            "in_quadra": in_quadra,
            "in_computadores": in_computadores,
            "score_infra": score_infra,
            "nota_cn": round(nota_cn, 1),
            "nota_ch": round(nota_ch, 1),
            "nota_lc": round(nota_lc, 1),
            "nota_mt": round(nota_mt, 1),
            "nota_redacao": round(nota_redacao, 1),
            "nota_geral": round(nota_geral, 1)
        })

    df = pd.DataFrame(records)
    return df

def calculate_gini(array):
    """Calcula o Coeficiente de Gini para a distribuição de notas."""
    array = np.sort(np.array(array))
    index = np.arange(1, array.shape[0] + 1)
    n = array.shape[0]
    return float((np.sum((2 * index - n - 1) * array)) / (n * np.sum(array)))

def run_econometrics_analysis(df):
    """Executa Regressão Linear Múltipla OLS e Random Forest Feature Importance."""
    # Preparar variáveis para OLS
    df['log_renda'] = np.log(df['renda_num'])
    df['log_pib'] = np.log(df['pib_per_capita'])
    
    X = df[['log_renda', 'log_pib', 'is_privada', 'score_infra', 'escolaridade_mae']]
    X_ols = sm.add_constant(X)
    y = df['nota_geral']
    
    model = sm.OLS(y, X_ols).fit()
    
    ols_results = {
        "r_squared": round(float(model.rsquared), 4),
        "adj_r_squared": round(float(model.rsquared_adj), 4),
        "f_pvalue": float(model.f_pvalue),
        "n_obs": int(model.nobs),
        "params": {k: round(float(v), 3) for k, v in model.params.items()},
        "pvalues": {k: round(float(v), 5) for k, v in model.pvalues.items()},
        "conf_int": {k: [round(float(v[0]), 3), round(float(v[1]), 3)] for k, v in model.conf_int().iterrows()}
    }
    
    # Feature Importance com Random Forest
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_features = ['renda_num', 'pib_per_capita', 'is_privada', 'score_infra', 'escolaridade_mae', 'in_internet', 'in_lab_ciencias']
    rf.fit(df[rf_features], y)
    
    importance = {feat: round(float(imp), 4) for feat, imp in zip(rf_features, rf.feature_importances_)}
    sorted_importance = dict(sorted(importance.items(), key=lambda item: item[1], reverse=True))
    
    return ols_results, sorted_importance

def compute_aggregations(df):
    # Aggregation por Faixa de Renda
    by_income = df.groupby('faixa_renda').agg(
        nota_media=('nota_geral', 'mean'),
        nota_mt=('nota_mt', 'mean'),
        nota_redacao=('nota_redacao', 'mean'),
        renda_media=('renda_num', 'mean'),
        pct_privada=('is_privada', 'mean'),
        qtd=('id', 'count')
    ).reset_index()
    by_income['nota_media'] = by_income['nota_media'].round(1)
    by_income['nota_mt'] = by_income['nota_mt'].round(1)
    by_income['nota_redacao'] = by_income['nota_redacao'].round(1)
    by_income['pct_privada'] = (by_income['pct_privada'] * 100).round(1)
    
    # Aggregation por Tipo de Escola
    by_escola = df.groupby('tp_escola').agg(
        nota_media=('nota_geral', 'mean'),
        nota_cn=('nota_cn', 'mean'),
        nota_ch=('nota_ch', 'mean'),
        nota_lc=('nota_lc', 'mean'),
        nota_mt=('nota_mt', 'mean'),
        nota_redacao=('nota_redacao', 'mean'),
        pct_internet=('in_internet', 'mean'),
        pct_lab=('in_lab_ciencias', 'mean'),
        qtd=('id', 'count')
    ).reset_index()
    for col in ['nota_media', 'nota_cn', 'nota_ch', 'nota_lc', 'nota_mt', 'nota_redacao']:
        by_escola[col] = by_escola[col].round(1)
    by_escola['pct_internet'] = (by_escola['pct_internet'] * 100).round(1)
    by_escola['pct_lab'] = (by_escola['pct_lab'] * 100).round(1)
    
    # Aggregation por Região
    by_region = df.groupby('region').agg(
        nota_media=('nota_geral', 'mean'),
        pib_medio=('pib_per_capita', 'mean'),
        renda_media=('renda_num', 'mean'),
        infra_media=('score_infra', 'mean'),
        pct_privada=('is_privada', 'mean'),
        qtd=('id', 'count')
    ).reset_index()
    by_region['nota_media'] = by_region['nota_media'].round(1)
    by_region['pib_medio'] = by_region['pib_medio'].round(2)
    by_region['infra_media'] = by_region['infra_media'].round(1)
    by_region['pct_privada'] = (by_region['pct_privada'] * 100).round(1)
    
    # Impacto de cada item de infraestrutura na escola pública
    df_pub = df[df['tp_escola'] == 'Pública']
    infra_impact = []
    items = [
        ("Acesso à Internet Banda Larga", "in_internet"),
        ("Laboratório de Ciências", "in_lab_ciencias"),
        ("Biblioteca Escolar", "in_biblioteca"),
        ("Quadra de Esportes", "in_quadra"),
        ("Computadores para Alunos", "in_computadores")
    ]
    for label, col in items:
        with_item = df_pub[df_pub[col] == 1]['nota_geral'].mean()
        without_item = df_pub[df_pub[col] == 0]['nota_geral'].mean()
        diff = with_item - without_item if not math.isnan(with_item) and not math.isnan(without_item) else 0
        infra_impact.append({
            "item": label,
            "com_item": round(float(with_item), 1),
            "sem_item": round(float(without_item), 1),
            "diferenca_pontos": round(float(diff), 1)
        })
        
    return {
        "by_income": by_income.to_dict(orient='records'),
        "by_escola": by_escola.to_dict(orient='records'),
        "by_region": by_region.to_dict(orient='records'),
        "infra_impact_publica": infra_impact
    }

def main():
    print("🚀 Gerando dataset sintetizado de Microdados ENEM x IBGE...")
    df = generate_enem_ibge_dataset(seed=42, n_samples=5000)
    
    print("📈 Executando análises econométricas (OLS + Random Forest)...")
    ols_res, feature_imp = run_econometrics_analysis(df)
    
    print("📊 Calculando métricas de desigualdade e agregações...")
    gini = calculate_gini(df['nota_geral'])
    aggs = compute_aggregations(df)
    
    # Matriz de correlação de Pearson
    corr_cols = ['nota_geral', 'renda_num', 'pib_per_capita', 'score_infra', 'is_privada', 'escolaridade_mae']
    corr_matrix = df[corr_cols].corr().round(3).to_dict()
    
    summary = {
        "metadata": {
            "total_alunos": len(df),
            "gini_notas": round(gini, 4),
            "nota_media_nacional": round(float(df['nota_geral'].mean()), 1),
            "nota_media_privada": round(float(df[df['is_privada']==1]['nota_geral'].mean()), 1),
            "nota_media_publica": round(float(df[df['is_privada']==0]['nota_geral'].mean()), 1),
            "gap_privada_publica": round(float(df[df['is_privada']==1]['nota_geral'].mean() - df[df['is_privada']==0]['nota_geral'].mean()), 1),
            "renda_media_nacional": round(float(df['renda_num'].mean()), 2),
            "pib_medio_nacional": round(float(df['pib_per_capita'].mean()), 2)
        },
        "ols_regression": ols_res,
        "feature_importance": feature_imp,
        "correlation_matrix": corr_matrix,
        "aggregations": aggs,
        "sample_microdata": df.head(500).to_dict(orient='records')
    }
    
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    output_filepath = os.path.join(output_dir, "enem_ibge_dataset.json")
    
    with open(output_filepath, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Pipeline concluída com sucesso! Arquivo gerado em: {output_filepath}")

if __name__ == "__main__":
    main()
