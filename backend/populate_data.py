import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from store.models import Category, Product

def populate_data():
    # Create categories
    categories_data = [
        {'name': 'Living Room', 'slug': 'living-room', 'icon': 'fas fa-couch'},
        {'name': 'Bedroom', 'slug': 'bedroom', 'icon': 'fas fa-bed'},
        {'name': 'Dining Room', 'slug': 'dining-room', 'icon': 'fas fa-utensils'},
        {'name': 'Office', 'slug': 'office', 'icon': 'fas fa-briefcase'},
        {'name': 'Storage', 'slug': 'storage', 'icon': 'fas fa-archive'},
    ]
    
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name}")
    
    # Create sample products
    products_data = [
        {
            'name': 'Modern Sectional Sofa',
            'slug': 'modern-sectional-sofa',
            'category': 'living-room',
            'description': 'Comfortable and stylish sectional sofa perfect for modern living rooms.',
            'price': 1299.99,
            'image_url': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
            'stock': 15
        },
        {
            'name': 'Ergonomic Office Chair',
            'slug': 'ergonomic-office-chair',
            'category': 'office',
            'description': 'High-quality ergonomic office chair with lumbar support.',
            'price': 299.99,
            'image_url': 'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500',
            'stock': 25
        },
        {
            'name': 'Dining Table Set',
            'slug': 'dining-table-set',
            'category': 'dining-room',
            'description': 'Beautiful wooden dining table set for 6 people.',
            'price': 899.99,
            'image_url': 'https://images.unsplash.com/photo-1549497538-303791108f95?w=500',
            'stock': 8
        },
        {
            'name': 'Queen Size Bed Frame',
            'slug': 'queen-size-bed-frame',
            'category': 'bedroom',
            'description': 'Elegant queen size bed frame with headboard.',
            'price': 599.99,
            'image_url': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
            'stock': 12
        },
        {
            'name': 'Bookshelf Cabinet',
            'slug': 'bookshelf-cabinet',
            'category': 'storage',
            'description': 'Spacious bookshelf cabinet with multiple compartments.',
            'price': 399.99,
            'image_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
            'stock': 20
        },
        {
            'name': 'Executive Desk',
            'slug': 'executive-desk',
            'category': 'office',
            'description': 'Professional executive desk with drawers and cable management.',
            'price': 799.99,
            'image_url': 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=500',
            'stock': 10
        }
    ]
    
    for prod_data in products_data:
        category = Category.objects.get(slug=prod_data['category'])
        product, created = Product.objects.get_or_create(
            slug=prod_data['slug'],
            defaults={
                **prod_data,
                'category': category
            }
        )
        if created:
            print(f"Created product: {product.name}")

if __name__ == '__main__':
    populate_data()
    print("Data population completed!")