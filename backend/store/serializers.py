from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Cart, CartItem, Wishlist, Order, OrderItem, Review, UserProfile, RoomScan, DetectedObject, RoomRecommendation, Vendor

class UserSerializer(serializers.ModelSerializer):
    is_vendor = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'is_vendor']

    def get_is_vendor(self, obj):
        return hasattr(obj, 'vendor_profile')

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class VendorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Vendor
        fields = [
            'id', 'username', 'email', 'store_name', 'store_description',
            'logo_url', 'phone', 'address', 'city', 'state',
            'status', 'is_active', 'is_approved', 'product_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['status', 'is_active', 'created_at', 'updated_at']

    def get_product_count(self, obj):
        return obj.products.count()

DEFAULT_PRODUCT_IMAGES = {
    'coffee': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&fit=crop',
    'sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&fit=crop',
    'wardrobe': 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&fit=crop',
    'desk': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&fit=crop',
    'recliner': 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&fit=crop',
    'nightstand': 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&fit=crop',
    'bed': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&fit=crop',
    'bookshelf': 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&fit=crop',
    'dining': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&fit=crop',
}

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    vendor_info = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'vendor', 'vendor_info',
            'description', 'price',
            'image', 'image_url', 'model_file', 'room_category',
            'stock', 'available', 'created',
            'average_rating', 'review_count'
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        if obj.image_url and 'photo-1555041469-a586c61ea9bc' not in obj.image_url:
            return obj.image_url
        name_lower = obj.name.lower()
        if 'coffee' in name_lower or 'table' in name_lower:
            return DEFAULT_PRODUCT_IMAGES['coffee']
        if 'sofa' in name_lower or 'couch' in name_lower:
            return DEFAULT_PRODUCT_IMAGES['sofa']
        if 'wardrobe' in name_lower or 'closet' in name_lower:
            return DEFAULT_PRODUCT_IMAGES['wardrobe']
        if 'desk' in name_lower or 'office' in name_lower:
            return DEFAULT_PRODUCT_IMAGES['desk']
        if 'recliner' in name_lower or 'chair' in name_lower:
            return DEFAULT_PRODUCT_IMAGES['recliner']
        if 'nightstand' in name_lower or 'bedside' in name_lower:
            return DEFAULT_PRODUCT_IMAGES['nightstand']
        if 'bed' in name_lower:
            return DEFAULT_PRODUCT_IMAGES['bed']
        if 'bookshelf' in name_lower or 'cabinet' in name_lower:
            return DEFAULT_PRODUCT_IMAGES['bookshelf']
        if 'dining' in name_lower:
            return DEFAULT_PRODUCT_IMAGES['dining']
        return obj.image_url or DEFAULT_PRODUCT_IMAGES['sofa']

    def get_average_rating(self, obj):
        return obj.get_average_rating()

    def get_review_count(self, obj):
        return obj.get_review_count()

    def get_vendor_info(self, obj):
        if obj.vendor:
            return {'id': obj.vendor.id, 'store_name': obj.vendor.store_name, 'logo_url': obj.vendor.logo_url}
        return None

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    cost = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'cost']
    
    def get_cost(self, obj):
        return obj.get_cost()

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_price', 'created_at', 'updated_at']
    
    def get_total_price(self, obj):
        return obj.get_total_price()

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    cost = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = '__all__'
    
    def get_cost(self, obj):
        return obj.get_cost()

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = '__all__'


class DetectedObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetectedObject
        fields = '__all__'


class RoomRecommendationSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = RoomRecommendation
        fields = '__all__'


class RoomScanSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    detections = DetectedObjectSerializer(many=True, read_only=True)
    recommendations = RoomRecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = RoomScan
        fields = '__all__'

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user