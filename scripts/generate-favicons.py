import os
from PIL import Image, ImageDraw, ImageFont

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def create_gradient_base(width, height, color1, color2):
    base = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    r1, g1, b1 = hex_to_rgb(color1)
    r2, g2, b2 = hex_to_rgb(color2)
    
    for y in range(height):
        for x in range(width):
            # Diagonal gradient from top-left (0,0) to bottom-right (width, height)
            factor = (x / width * 0.5) + (y / height * 0.5)
            r = int(r1 + (r2 - r1) * factor)
            g = int(g1 + (g2 - g1) * factor)
            b = int(b1 + (b2 - b1) * factor)
            base.putpixel((x, y), (r, g, b, 255))
    return base

def generate_icon(size=512):
    # Colors matching AcS brand: indigo-600 (#4f46e5) to purple-600 (#9333ea)
    grad = create_gradient_base(size, size, '#4338ca', '#9333ea')
    
    # Create mask with rounded rectangle (rx = 25% of size)
    mask = Image.new('L', (size, size), 0)
    draw_mask = ImageDraw.Draw(mask)
    radius = int(size * 0.24)
    draw_mask.rounded_rectangle([(0, 0), (size - 1, size - 1)], radius=radius, fill=255)
    
    # Apply rounded mask
    rounded = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    rounded.paste(grad, (0, 0), mask)
    
    # Draw inner highlight border
    draw = ImageDraw.Draw(rounded)
    border_width = max(2, int(size * 0.02))
    draw.rounded_rectangle(
        [(border_width, border_width), (size - border_width - 1, size - border_width - 1)],
        radius=radius - border_width,
        outline=(255, 255, 255, 45),
        width=border_width
    )
    
    # Try finding an impactful bold sans-serif font
    font = None
    font_names = [
        "C:\\Windows\\Fonts\\segoeuib.ttf",  # Segoe UI Bold
        "C:\\Windows\\Fonts\\arialbd.ttf",   # Arial Bold
        "C:\\Windows\\Fonts\\calibrib.ttf",  # Calibri Bold
    ]
    font_size = int(size * 0.42)
    for fname in font_names:
        if os.path.exists(fname):
            try:
                font = ImageFont.truetype(fname, font_size)
                break
            except Exception:
                continue
    if not font:
        font = ImageFont.load_default()
        
    text = "AcS"
    
    # Calculate bounding box to center text
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    
    # Center position with slight optical adjustment
    x = (size - text_w) / 2 - bbox[0]
    y = (size - text_h) / 2 - bbox[1] - (size * 0.02)
    
    # Subtle drop shadow for crisp readability
    shadow_offset = max(1, int(size * 0.02))
    draw.text((x, y + shadow_offset), text, font=font, fill=(30, 27, 75, 120))
    # Crisp white text
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    
    return rounded

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(root_dir, 'public')
    app_dir = os.path.join(root_dir, 'app')
    os.makedirs(public_dir, exist_ok=True)
    
    print("Generating high-resolution base icon (512x512)...")
    icon512 = generate_icon(512)
    icon512.save(os.path.join(public_dir, 'icon-512.png'), 'PNG')
    
    print("Generating icon-192.png...")
    icon192 = icon512.resize((192, 192), Image.Resampling.LANCZOS)
    icon192.save(os.path.join(public_dir, 'icon-192.png'), 'PNG')
    
    print("Generating apple-touch-icon.png (180x180)...")
    icon180 = icon512.resize((180, 180), Image.Resampling.LANCZOS)
    icon180.save(os.path.join(public_dir, 'apple-touch-icon.png'), 'PNG')
    icon180.save(os.path.join(app_dir, 'apple-icon.png'), 'PNG')
    
    print("Generating multi-resolution favicon.ico...")
    icon16 = icon512.resize((16, 16), Image.Resampling.LANCZOS)
    icon32 = icon512.resize((32, 32), Image.Resampling.LANCZOS)
    icon48 = icon512.resize((48, 48), Image.Resampling.LANCZOS)
    icon64 = icon512.resize((64, 64), Image.Resampling.LANCZOS)
    
    ico_path_public = os.path.join(public_dir, 'favicon.ico')
    ico_path_app = os.path.join(app_dir, 'favicon.ico')
    
    icon32.save(
        ico_path_public,
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
        append_images=[icon16, icon48, icon64]
    )
    icon32.save(
        ico_path_app,
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
        append_images=[icon16, icon48, icon64]
    )
    
    # SVG Vector version for modern high-DPI displays and /icon.svg
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="acsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#9333ea" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="124" fill="url(#acsGrad)" />
  <rect x="12" y="12" width="488" height="488" rx="112" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="12" />
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="220" letter-spacing="-6px">AcS</text>
</svg>'''
    
    with open(os.path.join(public_dir, 'icon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_content)
    with open(os.path.join(app_dir, 'icon.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_content)
        
    print("Favicons successfully created!")

if __name__ == '__main__':
    main()
