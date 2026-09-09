import re

with open(r'c:\Users\SEJUSP.DESKTOP-VOL42AH\Desktop\Projetos-\educacao\dashboard_standalone.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open(r'c:\Users\SEJUSP.DESKTOP-VOL42AH\Desktop\Projetos-\educacao\js\charts.js', 'r', encoding='utf-8') as f:
    charts_js = f.read()

with open(r'c:\Users\SEJUSP.DESKTOP-VOL42AH\Desktop\Projetos-\educacao\js\simulator.js', 'r', encoding='utf-8') as f:
    sim_js = f.read()

with open(r'c:\Users\SEJUSP.DESKTOP-VOL42AH\Desktop\Projetos-\educacao\js\app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Fix unclosed div tag in chartFeatureImportance card
fixed_feature_card = """            <div class="card-header">
              <div>
                <h3>Importância das Variáveis (Random Forest Regressor)</h3>
                <p class="card-subtitle">Contribuição percentual de cada fator na explicação das notas</p>
              </div>
            </div>
            <div class="chart-container">
              <canvas id="chartFeatureImportance"></canvas>
            </div>"""

pattern = r'<div class="card-header">\s*<div>\s*<h3>Import[^<]+</h3>\s*<p class="card-subtitle">[^<]+</p>\s*</div>\s*<div class="chart-container">\s*<canvas id="chartFeatureImportance"></canvas>\s*</div>\s*</div>'
html, count = re.subn(pattern, fixed_feature_card, html)
print(f"Fixed feature card occurrences: {count}")

# Replace EduCharts
idx_charts_start = html.find('const EduCharts = {')
idx_charts_end = html.find('const EduEconometrics = {')
if idx_charts_start != -1 and idx_charts_end != -1:
    script_close = html.rfind('</script>', idx_charts_start, idx_charts_end)
    if script_close != -1:
        html = html[:idx_charts_start] + charts_js + '\n' + html[script_close:]
        print("Updated EduCharts in dashboard_standalone.html")

# Replace EduSimulator
idx_sim_start = html.find('const EduSimulator = {')
idx_app_start = html.find('const App = {')
if idx_sim_start != -1 and idx_app_start != -1:
    script_close = html.rfind('</script>', idx_sim_start, idx_app_start)
    if script_close != -1:
        html = html[:idx_sim_start] + sim_js + '\n' + html[script_close:]
        print("Updated EduSimulator in dashboard_standalone.html")

# Replace App
idx_app_start = html.find('const App = {')
idx_body_close = html.rfind('</body>')
if idx_app_start != -1 and idx_body_close != -1:
    html = html[:idx_app_start] + app_js + '\n</script>\n</body>\n</html>'
    print("Updated App in dashboard_standalone.html")

with open(r'c:\Users\SEJUSP.DESKTOP-VOL42AH\Desktop\Projetos-\educacao\dashboard_standalone.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("SUCCESS: dashboard_standalone.html is completely updated!")
