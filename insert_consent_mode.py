import glob
import os

consent_default = """<!-- GTM Consent Mode (Default state) -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied'
  });
</script>
"""

html_files = glob.glob('**/*.html', recursive=True)

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'gtag(\'consent\', \'default\'' in content:
        continue # Already present
    
    # Insert right before <!-- Google Tag Manager -->
    content = content.replace('<!-- Google Tag Manager -->', consent_default + '<!-- Google Tag Manager -->')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
