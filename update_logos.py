import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

sidebar_old = """            <div class="sidebar-logo">
                The Care You Deserve
                <span>Hair Care Community</span>
            </div>"""
sidebar_new = """            <div class="sidebar-logo" style="padding-bottom: 0; border: none; margin-bottom: 2rem;">
                <a href="index.html" style="display: block;">
                    <img src="logo.png" alt="The Care You Deserve Logo" style="max-width: 100%; height: auto;">
                </a>
            </div>"""

mobile_old = '<span class="mobile-logo">The Care You Deserve</span>'
mobile_new = """<a href="index.html" class="mobile-logo" style="display: flex; align-items: center;">
            <img src="logo.png" alt="The Care You Deserve Logo" style="max-height: 40px; width: auto;">
        </a>"""

wf_old = '<div class="wf-header-logo">Logo</div>'
wf_new = """<a href="index.html" class="wf-header-logo" style="padding: 0; background: none; display: flex; align-items: center;">
            <img src="logo.png" alt="The Care You Deserve Logo" style="max-height: 40px; width: auto; border-radius: 4px;">
        </a>"""

for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if sidebar_old in content:
        content = content.replace(sidebar_old, sidebar_new)
        
    if mobile_old in content:
        content = content.replace(mobile_old, mobile_new)
        
    # Some wireframe pages might have slightly different whitespace
    # Let's replace line by line or strip it
    content = content.replace(wf_old, wf_new)
        
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print(f"Updated {len(html_files)} HTML files!")
