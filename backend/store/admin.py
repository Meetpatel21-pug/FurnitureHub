from django.contrib import admin
from .models import Category, Product, Cart, CartItem, Wishlist, Order, OrderItem, Review, UserProfile, RoomScan, DetectedObject, RoomRecommendation

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'available', 'created']
    list_filter = ['available', 'created', 'category']
    list_editable = ['price', 'stock', 'available']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'user', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    readonly_fields = ['order_id']

admin.site.register(UserProfile)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Wishlist)
admin.site.register(OrderItem)
admin.site.register(Review)
admin.site.register(RoomScan)
admin.site.register(DetectedObject)
admin.site.register(RoomRecommendation)