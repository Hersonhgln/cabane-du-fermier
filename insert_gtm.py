import glob
import os

gtm_head = """<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MMF76XHD');</script>
<!-- End Google Tag Manager -->
"""

gtm_body = """<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MMF76XHD"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
"""

html_files = glob.glob('**/*.html', recursive=True)

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'GTM-MMF76XHD' in content:
        continue # Already added
        
    head_pos = content.lower().find('<head>')
    if head_pos != -1:
        # Insert right after <head>
        head_end = head_pos + 6
        if content[head_end] == '\n':
            head_end += 1
        content = content[:head_end] + gtm_head + content[head_end:]
        
    body_pos = content.lower().find('<body>')
    if body_pos != -1:
        # Insert right after <body>
        body_end = body_pos + 6
        if content[body_end] == '\n':
            body_end += 1
        content = content[:body_end] + gtm_body + content[body_end:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
