from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('ai/chat/', views.chat_with_furnibot, name='ai-chat'),
    # Authentication
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/password-reset/request/', views.request_password_reset, name='password-reset-request'),
    path('auth/password-reset/confirm/', views.confirm_password_reset, name='password-reset-confirm'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('first-order-discount/', views.first_order_discount, name='first-order-discount'),
    
    # Categories & Products
    path('categories/', views.CategoryListView.as_view(), name='categories'),
    path('products/', views.ProductListView.as_view(), name='products'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    
    # Cart
    path('cart/', views.get_cart, name='cart'),
    path('cart/add/<int:product_id>/', views.add_to_cart, name='add-to-cart'),
    path('cart/update/<int:item_id>/', views.update_cart_item, name='update-cart-item'),
    path('cart/remove/<int:item_id>/', views.remove_from_cart, name='remove-from-cart'),
    
    # Wishlist
    path('wishlist/', views.get_wishlist, name='wishlist'),
    path('wishlist/add/<int:product_id>/', views.add_to_wishlist, name='add-to-wishlist'),
    path('wishlist/remove/<int:product_id>/', views.remove_from_wishlist, name='remove-from-wishlist'),
    
    # Orders
    path('checkout/', views.checkout, name='checkout'),
    path('orders/', views.order_history, name='orders'),
    path('orders/<str:order_id>/', views.order_detail, name='order-detail'),
    path('orders/<str:order_id>/cancel/', views.cancel_order, name='cancel-order'),
    path('orders/<str:order_id>/payment/', views.update_payment_status, name='update-payment-status'),
    
    # Reviews
    path('products/<int:product_id>/reviews/', views.product_reviews, name='product-reviews'),
    path('products/<int:product_id>/reviews/add/', views.add_review, name='add-review'),
    
    # User Profile
    path('profile/', views.user_profile, name='profile'),
    path('analytics/', views.analytics_dashboard, name='analytics'),
    
    # ML Recommendations
    path('recommendations/', views.get_recommendations, name='recommendations'),
    path('most-ordered-products/', views.most_ordered_products, name='most-ordered-products'),
    path('ai/room-analyze/', views.analyze_room, name='room-analyze'),
    path('admin/ml-dashboard/', views.ml_dashboard, name='ml-dashboard'),
    path('admin/stats/', views.admin_stats, name='admin-stats'),
    
    # Admin CRUD Operations
    path('admin/products/', views.admin_products, name='admin-products'),
    path('admin/products/create/', views.admin_create_product, name='admin-create-product'),
    path('admin/products/<int:product_id>/update/', views.admin_update_product, name='admin-update-product'),
    path('admin/products/<int:product_id>/delete/', views.admin_delete_product, name='admin-delete-product'),
    path('admin/users/', views.admin_users, name='admin-users'),
    path('admin/users/create/', views.admin_create_user, name='admin-create-user'),
    path('admin/users/create/', views.admin_create_user, name='admin-create-user'),
    path('admin/orders/', views.admin_orders, name='admin-orders'),
    path('admin/orders/<int:order_id>/status/', views.admin_update_order_status, name='admin-update-order-status'),
    path('admin/orders/<int:order_id>/delete/', views.admin_delete_order, name='admin-delete-order'),
    path('admin/wishlists/', views.admin_wishlists, name='admin-wishlists'),
    path('admin/users/<int:user_id>/ban/', views.admin_ban_user, name='admin-ban-user'),
    path('admin/users/<int:user_id>/update/', views.admin_update_user, name='admin-update-user'),
    path('admin/users/<int:user_id>/delete/', views.admin_delete_user, name='admin-delete-user'),
    path('admin/wishlists/<int:wishlist_id>/delete/', views.admin_remove_wishlist, name='admin-remove-wishlist'),
    path('orders/<str:order_id>/invoice/', views.download_invoice, name='download-invoice'),
]


