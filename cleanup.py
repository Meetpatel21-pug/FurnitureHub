import os
import django
import sys
import glob

# Setup Django
sys.path.append(os.path.join(os.getcwd(), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from store.models import Product

def cleanup_unused_glb():
    used_glbs = set()
    for p in Product.objects.all():
        if p.model_file and p.model_file.name:
            used_glbs.add(os.path.basename(p.model_file.name))

    models_dir = os.path.join('backend', 'media', 'products', 'models')
    if os.path.exists(models_dir):
        for f in os.listdir(models_dir):
            if f.endswith('.glb') and f not in used_glbs:
                file_path = os.path.join(models_dir, f)
                print(f"Removing unused GLB: {file_path}")
                os.remove(file_path)

def text_replace():
    dirs = ['frontend/src', 'frontend/public', 'backend/store', '.']
    exts = ['.js', '.py', '.html', '.css', '.md']
    
    for d in dirs:
        for ext in exts:
            pattern = os.path.join(d, '**', '*' + ext)
            for file_path in glob.glob(pattern, recursive=True):
                if not os.path.isfile(file_path):
                    continue
                if 'node_modules' in file_path or 'venv' in file_path or '.git' in file_path:
                    continue
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if 'FurnitureHub' in content or 'furniturehub' in content or 'FURNITUREHUB' in content:
                    new_content = content.replace('FurnitureHub', 'FurnitureZone')
                    new_content = new_content.replace('furniturehub', 'furniturezone')
                    new_content = new_content.replace('FURNITUREHUB', 'FURNITUREZONE')
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {file_path}")

if __name__ == '__main__':
    cleanup_unused_glb()
    text_replace()
    print("Done")
