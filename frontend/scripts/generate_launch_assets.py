"""
Generate all public brand assets, favicons, manifests, and sitemaps for AIOS.
Gate B, Gate A, Gate C compliance script.
"""
import os
import json
from PIL import Image, ImageDraw, ImageFont

PUBLIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public'))
os.makedirs(PUBLIC_DIR, exist_ok=True)

# 1. Generate favicon.svg (with prefers-color-scheme support)
FAVICON_SVG = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <style>
    :root {
      --bg: #0B0C0E;
      --accent: #14b8a6;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #ffffff;
        --accent: #0f766e;
      }
    }
    .bg { fill: var(--bg); }
    .accent { fill: var(--accent); }
  </style>
  <rect width="64" height="64" rx="14" class="bg" />
  <path d="M 32 13 L 48 49 L 39.5 49 L 35.5 40 L 28.5 40 L 24.5 49 L 16 49 Z M 32 23.5 L 27.2 34 L 36.8 34 Z" class="accent" />
</svg>'''

with open(os.path.join(PUBLIC_DIR, 'favicon.svg'), 'w', encoding='utf-8') as f:
    f.write(FAVICON_SVG.strip())
print("Generated favicon.svg")

# 2. Helper to render raster icon of specified size
def render_icon(size: int, is_maskable: bool = False) -> Image.Image:
    img = Image.new('RGBA', (size, size), (11, 12, 14, 255))
    draw = ImageDraw.Draw(img)
    
    # Corner radius
    # For maskable, keep background full-bleed without rounded border
    # For standard icon, draw rounded corners or subtle outline
    scale = size / 64.0
    if is_maskable:
        # Scale content slightly smaller to stay within the 80% safe zone
        scale = scale * 0.75
        offset = size * 0.125
    else:
        offset = 0

    # Draw geometric monogram 'A'
    p1 = (offset + 32 * scale, offset + 13 * scale)
    p2 = (offset + 48 * scale, offset + 49 * scale)
    p3 = (offset + 39.5 * scale, offset + 49 * scale)
    p4 = (offset + 35.5 * scale, offset + 40 * scale)
    p5 = (offset + 28.5 * scale, offset + 40 * scale)
    p6 = (offset + 24.5 * scale, offset + 49 * scale)
    p7 = (offset + 16 * scale, offset + 49 * scale)

    inner_p1 = (offset + 32 * scale, offset + 23.5 * scale)
    inner_p2 = (offset + 27.2 * scale, offset + 34 * scale)
    inner_p3 = (offset + 36.8 * scale, offset + 34 * scale)

    accent_color = (20, 184, 166, 255) # #14b8a6
    bg_color = (11, 12, 14, 255)

    # Outer polygon
    draw.polygon([p1, p2, p3, p4, p5, p6, p7], fill=accent_color)
    # Inner cutout triangle
    draw.polygon([inner_p1, inner_p2, inner_p3], fill=bg_color)

    return img

# 3. Generate PNG icons
icon_16 = render_icon(16)
icon_32 = render_icon(32)
icon_48 = render_icon(48)
icon_180 = render_icon(180)
icon_192 = render_icon(192)
icon_512 = render_icon(512)
icon_maskable = render_icon(512, is_maskable=True)

icon_180.save(os.path.join(PUBLIC_DIR, 'apple-touch-icon.png'), format='PNG')
icon_192.save(os.path.join(PUBLIC_DIR, 'icon-192.png'), format='PNG')
icon_512.save(os.path.join(PUBLIC_DIR, 'icon-512.png'), format='PNG')
icon_maskable.save(os.path.join(PUBLIC_DIR, 'icon-maskable.png'), format='PNG')
print("Generated apple-touch-icon.png, icon-192.png, icon-512.png, icon-maskable.png")

# 4. Generate multi-resolution favicon.ico (16, 32, 48)
icon_48.save(
    os.path.join(PUBLIC_DIR, 'favicon.ico'),
    format='ICO',
    sizes=[(16, 16), (32, 32), (48, 48)]
)
print("Generated favicon.ico (16/32/48)")

# 5. Generate site.webmanifest
manifest_data = {
    "name": "AIOS Multi-Agent Operating System",
    "short_name": "AIOS",
    "description": "Production runtime for stateful agent swarms and Graph RAG pipelines.",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0B0C0E",
    "theme_color": "#121517",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "/icon-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "/icon-maskable.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
        }
    ]
}

with open(os.path.join(PUBLIC_DIR, 'site.webmanifest'), 'w', encoding='utf-8') as f:
    json.dump(manifest_data, f, indent=2)
print("Generated site.webmanifest")

# 6. Generate sitemap.xml (Gate A: indexable public routes only, excluding authenticated routes)
sitemap_xml = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aios.dev/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://aios.dev/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://aios.dev/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://aios.dev/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://aios.dev/register</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>'''

with open(os.path.join(PUBLIC_DIR, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write(sitemap_xml.strip())
print("Generated sitemap.xml")

# 7. Generate robots.txt
robots_txt = '''User-agent: *
Disallow: /dashboard
Disallow: /settings
Disallow: /api-explorer
Disallow: /prompt-studio
Disallow: /graph-rag
Disallow: /model-management
Disallow: /agent-builder
Disallow: /playground
Disallow: /api/
Allow: /
Allow: /privacy
Allow: /terms
Allow: /login
Allow: /register

Sitemap: https://aios.dev/sitemap.xml
'''

with open(os.path.join(PUBLIC_DIR, 'robots.txt'), 'w', encoding='utf-8') as f:
    f.write(robots_txt.strip())
print("Generated robots.txt")

# 8. Generate og-image.png (1200x630 typographic marketing card)
og_width, og_height = 1200, 630
og_img = Image.new('RGBA', (og_width, og_height), (11, 12, 14, 255))
draw = ImageDraw.Draw(og_img)

# Outer subtle border
draw.rounded_rectangle([24, 24, 1176, 606], radius=16, outline=(33, 38, 43, 255), width=2)
# Inner backdrop panel
draw.rounded_rectangle([48, 48, 1152, 582], radius=12, fill=(18, 21, 23, 255), outline=(42, 49, 56, 255), width=1)

# Brand mark badge
badge_size = 56
draw.rounded_rectangle([80, 80, 80 + badge_size, 80 + badge_size], radius=8, fill=(20, 184, 166, 255))

# Monogram inside badge
badge_scale = badge_size / 64.0
bp1 = (80 + 32 * badge_scale, 80 + 13 * badge_scale)
bp2 = (80 + 48 * badge_scale, 80 + 49 * badge_scale)
bp3 = (80 + 39.5 * badge_scale, 80 + 49 * badge_scale)
bp4 = (80 + 35.5 * badge_scale, 80 + 40 * badge_scale)
bp5 = (80 + 28.5 * badge_scale, 80 + 40 * badge_scale)
bp6 = (80 + 24.5 * badge_scale, 80 + 49 * badge_scale)
bp7 = (80 + 16 * badge_scale, 80 + 49 * badge_scale)
inner_bp1 = (80 + 32 * badge_scale, 80 + 23.5 * badge_scale)
inner_bp2 = (80 + 27.2 * badge_scale, 80 + 34 * badge_scale)
inner_bp3 = (80 + 36.8 * badge_scale, 80 + 34 * badge_scale)
draw.polygon([bp1, bp2, bp3, bp4, bp5, bp6, bp7], fill=(11, 12, 14, 255))
draw.polygon([inner_bp1, inner_bp2, inner_bp3], fill=(20, 184, 166, 255))

# Try loading system font, else fallback to default font
try:
    font_brand = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
    font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 52)
    font_desc = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    font_badge = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
except Exception:
    font_brand = font_title = font_desc = font_badge = ImageFont.load_default()

# Title text
draw.text((156, 92), "AIOS", fill=(243, 244, 246, 255), font=font_brand)
draw.text((80, 180), "The Production Runtime for Multi-Agent AI Systems", fill=(255, 255, 255, 255), font=font_title)

# Description text (no hyphens/dashes as punctuation)
desc_line1 = "Orchestrate stateful LangGraph agent swarms, hybrid Graph RAG, and multi-model routing."
desc_line2 = "Built with deterministic observability, check-pointing, and private VPC deployment options."
draw.text((80, 260), desc_line1, fill=(156, 163, 175, 255), font=font_desc)
draw.text((80, 298), desc_line2, fill=(156, 163, 175, 255), font=font_desc)

# Feature tags
tags = [
    "LangGraph State Machines",
    "Neo4j + Qdrant Graph RAG",
    "FastAPI Gateway",
    "Deterministic Tracing",
    "OpenTelemetry"
]

tag_x = 80
tag_y = 480
for tag in tags:
    tag_width = len(tag) * 11 + 24
    draw.rounded_rectangle([tag_x, tag_y, tag_x + tag_width, tag_y + 36], radius=6, fill=(28, 33, 38, 255), outline=(55, 65, 81, 255), width=1)
    draw.text((tag_x + 12, tag_y + 8), tag, fill=(209, 213, 219, 255), font=font_badge)
    tag_x += tag_width + 16

og_img.save(os.path.join(PUBLIC_DIR, 'og-image.png'), format='PNG')
print("Generated og-image.png (1200x630)")
