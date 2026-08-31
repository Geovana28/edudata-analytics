import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def build_standalone():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    index_path = os.path.join(base_dir, 'index.html')
    css_path = os.path.join(base_dir, 'css', 'styles.css')
    
    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()
        
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()
        
    chart_lib = open(os.path.join(base_dir, 'js', 'chart.umd.min.js'), 'r', encoding='utf-8').read()
    lucide_lib = open(os.path.join(base_dir, 'js', 'lucide.min.js'), 'r', encoding='utf-8').read()
    embedded_data = open(os.path.join(base_dir, 'js', 'embedded_data.js'), 'r', encoding='utf-8').read()
    data_js = open(os.path.join(base_dir, 'js', 'data.js'), 'r', encoding='utf-8').read()
    charts_js = open(os.path.join(base_dir, 'js', 'charts.js'), 'r', encoding='utf-8').read()
    econometrics_js = open(os.path.join(base_dir, 'js', 'econometrics.js'), 'r', encoding='utf-8').read()
    simulator_js = open(os.path.join(base_dir, 'js', 'simulator.js'), 'r', encoding='utf-8').read()
    app_js = open(os.path.join(base_dir, 'js', 'app.js'), 'r', encoding='utf-8').read()

    # Replace CSS
    html = re.sub(r'<link rel="stylesheet".*?>', f'<style>{css}</style>', html)
    
    # Remove existing script tags
    html = re.sub(r'<script src="js/.*?"></script>', '', html)
    html = re.sub(r'<script>if \(typeof Chart.*?</script>', '', html)
    html = re.sub(r'<script>if \(typeof lucide.*?</script>', '', html)
    
    # Build complete inline script bundle
    inline_js = f"""
<script>
{chart_lib}
</script>
<script>
{lucide_lib}
</script>
<script>
{embedded_data}
</script>
<script>
{data_js}
</script>
<script>
{charts_js}
</script>
<script>
{econometrics_js}
</script>
<script>
{simulator_js}
</script>
<script>
{app_js}
</script>
<script>
window.addEventListener('load', () => {{
    if (window.EduData) EduData.init();
    if (window.EduCharts) EduCharts.renderAll();
    if (window.EduEconometrics) {{
        EduEconometrics.renderOLS();
        EduEconometrics.renderCorrelationMatrix();
        EduEconometrics.renderInfraSummaryTable();
    }}
    if (window.EduSimulator) EduSimulator.init();
    if (window.lucide) lucide.createIcons();
}});
</script>
"""
    html = html.replace('</body>', f'{inline_js}</body>')
    
    out_path = os.path.join(base_dir, 'dashboard_standalone.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
        
    print(f"✅ dashboard_standalone.html gerado com sucesso em: {out_path}")

if __name__ == '__main__':
    build_standalone()
