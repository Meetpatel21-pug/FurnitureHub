from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from decimal import Decimal
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import ssl
import uuid

from .models import Category, Product, Cart, CartItem, Wishlist, Order, OrderItem, Review, UserProfile
from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer, CartItemSerializer,
    WishlistSerializer, OrderSerializer, ReviewSerializer, UserProfileSerializer,
    UserRegistrationSerializer, UserSerializer
)
from .room_ai import analyze_room_image

DELIVERY_CHARGE = Decimal('50.00')


def send_order_confirmation_email(order):
    recipient_email = (order.user.email or settings.ORDER_CONFIRMATION_FALLBACK_EMAIL or '').strip()
    if not recipient_email:
        print(f'No recipient email available for order {order.order_id}')
        return {
            'sent': False,
            'recipient_email': None,
            'error': 'No recipient email available',
        }

    subject = f'FurnitureZone Order Bill - {order.order_id}'
    payment_method_label = dict(Order.PAYMENT_METHOD_CHOICES).get(order.payment_method, order.payment_method)
    order_items = order.items.select_related('product').all()
    subtotal = sum((item.get_cost() for item in order_items), Decimal('0.00'))
    delivery_charge = max(order.total_amount - subtotal, Decimal('0.00'))
    grand_total = order.total_amount
    customer_name = order.user.first_name or order.user.username
    shipping_address = order.shipping_address.replace('\n', '<br>')
    ordered_at = order.created_at.strftime('%d %b %Y, %I:%M %p')

    item_rows_html = ''.join(
        f"""
        <tr>
            <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">{item.product.name}</td>
            <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:center;">{item.quantity}</td>
            <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;">₹{item.price:.2f}</td>
            <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;">₹{item.get_cost():.2f}</td>
        </tr>
        """
        for item in order_items
    ) or '''
        <tr>
            <td colspan="4" style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;">No items found for this order.</td>
        </tr>
    '''

    html_message = f"""
    <html>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
            <div style="max-width:720px;margin:0 auto;padding:24px;">
                <div style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                    <div style="background:linear-gradient(135deg,#0f766e,#14b8a6);padding:28px 32px;color:#ffffff;">
                        <h1 style="margin:0;font-size:28px;">Order Bill Generated</h1>
                        <p style="margin:8px 0 0;font-size:15px;opacity:0.92;">Your payment has been received successfully.</p>
                    </div>
                    <div style="padding:32px;">
                        <p style="margin:0 0 16px;font-size:16px;">Hi {customer_name},</p>
                        <p style="margin:0 0 24px;color:#4b5563;line-height:1.6;">Here is your invoice for the order you just placed. Keep this email for your records.</p>

                        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Order ID</td>
                                <td style="padding:8px 0;text-align:right;font-weight:700;">{order.order_id}</td>
                            </tr>
                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Order Date</td>
                                <td style="padding:8px 0;text-align:right;font-weight:700;">{ordered_at}</td>
                            </tr>
                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Payment Method</td>
                                <td style="padding:8px 0;text-align:right;font-weight:700;">{payment_method_label}</td>
                            </tr>
                            <tr>
                                <td style="padding:8px 0;color:#6b7280;">Payment Status</td>
                                <td style="padding:8px 0;text-align:right;font-weight:700;color:#16a34a;">{order.payment_status.title()}</td>
                            </tr>
                        </table>

                        <div style="margin-bottom:24px;padding:16px 18px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;">
                            <div style="font-size:13px;color:#6b7280;margin-bottom:6px;">Shipping Address</div>
                            <div style="line-height:1.6;">{shipping_address}</div>
                        </div>

                        <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
                            <thead>
                                <tr style="text-align:left;color:#6b7280;font-size:13px;letter-spacing:0.02em;">
                                    <th style="padding:10px 0;border-bottom:2px solid #e5e7eb;">Item</th>
                                    <th style="padding:10px 0;border-bottom:2px solid #e5e7eb;text-align:center;">Qty</th>
                                    <th style="padding:10px 0;border-bottom:2px solid #e5e7eb;text-align:right;">Price</th>
                                    <th style="padding:10px 0;border-bottom:2px solid #e5e7eb;text-align:right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {item_rows_html}
                            </tbody>
                        </table>

                        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#6b7280;">
                                <span>Subtotal</span>
                                <strong style="color:#111827;">₹{subtotal:.2f}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:8px;color:#6b7280;">
                                <span>Delivery Charge</span>
                                <strong style="color:#111827;">₹{delivery_charge:.2f}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid #e5e7eb;">
                                <span style="font-weight:700;color:#111827;">Total Amount</span>
                                <strong style="font-size:18px;color:#0f766e;">₹{grand_total:.2f}</strong>
                            </div>
                        </div>

                        <p style="margin:24px 0 0;color:#4b5563;line-height:1.6;">We’ll send another update when your order is shipped. If you have any questions, reply to this email.</p>
                    </div>
                </div>
                <p style="text-align:center;color:#9ca3af;font-size:12px;margin:16px 0 0;">FurnitureZone</p>
            </div>
        </body>
    </html>
    """

    plain_message = f"""Order Bill Generated

Hi {customer_name},

Your payment has been received successfully. Here is your invoice.

Order ID: {order.order_id}
Order Date: {ordered_at}
Payment Method: {payment_method_label}
Payment Status: {order.payment_status.title()}
Shipping Address: {order.shipping_address}

Items:
{chr(10).join(f'- {item.product.name} x {item.quantity} (₹{item.get_cost():.2f})' for item in order_items) or '- No items found'}

Subtotal: ₹{subtotal:.2f}
Delivery Charge: ₹{delivery_charge:.2f}
Total Amount: ₹{grand_total:.2f}

We’ll send another update when your order ships.
"""

    def _send_with_context(tls_context):
        message = MIMEMultipart('alternative')
        message['Subject'] = subject
        message['From'] = settings.DEFAULT_FROM_EMAIL
        message['To'] = recipient_email
        message.attach(MIMEText(plain_message, 'plain'))
        message.attach(MIMEText(html_message, 'html'))

        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=30) as server:
            server.ehlo()

            if settings.EMAIL_USE_TLS:
                server.starttls(context=tls_context)
                server.ehlo()

            if settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD:
                server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)

            server.sendmail(settings.DEFAULT_FROM_EMAIL, [recipient_email], message.as_string())

    try:
        _send_with_context(ssl.create_default_context())
    except ssl.SSLCertVerificationError:
        print(f'SSL certificate verification failed for {order.order_id}; retrying with an unverified TLS context.')
        _send_with_context(ssl._create_unverified_context())

        return {
            'sent': True,
            'recipient_email': recipient_email,
            'error': None,
        }
    except Exception as exc:
        print(f'Failed to send order confirmation email for {order.order_id}: {exc}')
        return {
            'sent': False,
            'recipient_email': recipient_email,
            'error': str(exc),
        }

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    from django.contrib.auth import login as django_login
    from django.contrib.sessions.backends.db import SessionStore
    
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        # Create new session for this login
        session = SessionStore()
        session.create()
        
        # Store user in session
        session['_auth_user_id'] = str(user.pk)
        session['_auth_user_backend'] = 'django.contrib.auth.backends.ModelBackend'
        session['session_type'] = 'admin' if user.is_staff else 'user'
        session.save()
        
        # JWT for API calls
        refresh = RefreshToken.for_user(user)
        
        response = Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
        
        # Set appropriate cookie based on user type
        cookie_name = 'admin_sessionid' if user.is_staff else 'user_sessionid'
        response.set_cookie(
            cookie_name,
            session.session_key,
            max_age=86400,
            httponly=True,
            samesite='Lax',
            path='/'
        )
        
        return response
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Category Views
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

# Pagination class
class ProductPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

# Product Views
class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    
    def get_queryset(self):
        queryset = Product.objects.filter(available=True)
        category_slug = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        limit = self.request.query_params.get('limit')
        
        if category_slug:
            # Try to match by slug first, then by name (case insensitive)
            queryset = queryset.filter(
                Q(category__slug=category_slug) | 
                Q(category__name__icontains=category_slug.replace('-', ' '))
            )
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )
        
        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass
                
        return queryset

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(available=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

# Cart Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    cart, created = Cart.objects.get_or_create(user=request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart, created = Cart.objects.get_or_create(user=request.user)
    
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, 
        product=product,
        defaults={'quantity': 1}
    )
    
    if not created:
        cart_item.quantity += 1
        cart_item.save()
    
    return Response({'message': f'{product.name} added to cart!'})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    quantity = request.data.get('quantity', 1)
    
    if quantity > 0:
        cart_item.quantity = quantity
        cart_item.save()
        return Response({'message': 'Cart updated!'})
    else:
        cart_item.delete()
        return Response({'message': 'Item removed!'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
    cart_item.delete()
    return Response({'message': 'Item removed from cart!'})

# Wishlist Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wishlist(request):
    wishlist_items = Wishlist.objects.filter(user=request.user)
    serializer = WishlistSerializer(wishlist_items, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
    
    if created:
        return Response({'message': f'{product.name} added to wishlist!'})
    else:
        return Response({'message': f'{product.name} already in wishlist!'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    Wishlist.objects.filter(user=request.user, product=product).delete()
    return Response({'message': f'{product.name} removed from wishlist!'})

# Order Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout(request):
    cart = get_object_or_404(Cart, user=request.user)
    cart_items = CartItem.objects.filter(cart=cart)
    
    if not cart_items:
        return Response({'error': 'Cart is empty!'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check stock availability before creating order
    for item in cart_items:
        if item.product.stock < item.quantity:
            return Response({
                'error': f'Insufficient stock for {item.product.name}. Available: {item.product.stock}, Requested: {item.quantity}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    subtotal = sum(item.get_cost() for item in cart_items)
    total = subtotal + DELIVERY_CHARGE
    
    # Get payment method from request data
    payment_method = request.data.get('payment_method', 'cod')
    
    # Create order with payment information
    order = Order.objects.create(
        user=request.user,
        order_id=f'ORD-{uuid.uuid4().hex[:8].upper()}',
        total_amount=total,
        shipping_address=request.data.get('address', ''),
        payment_method=payment_method,
        payment_status='pending'
    )
    
    # Create order items and update stock
    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.product.price
        )
        
        # Update product stock
        item.product.stock -= item.quantity
        if item.product.stock <= 0:
            item.product.available = False
        item.product.save()
    
    # Only clear cart if payment method is COD or payment is completed
    if payment_method == 'cod':
        cart_items.delete()
        order.status = 'confirmed'
        order.payment_status = 'completed'
        order.save()
        email_result = send_order_confirmation_email(order)
    
    # Update KNN model with new order data
    try:
        from knn_recommendations import knn_system
        # Retrain the model with new order data
        knn_system.train_model()
    except Exception as e:
        print(f"Error updating KNN model: {e}")
    
    serializer = OrderSerializer(order)
    response_data = serializer.data
    if payment_method == 'cod':
        response_data['email_sent'] = bool(email_result and email_result.get('sent'))
        response_data['email_recipient'] = email_result.get('recipient_email') if email_result else None
        response_data['email_error'] = email_result.get('error') if email_result else None
    return Response(response_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_history(request):
    orders = Order.objects.filter(user=request.user)
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    order = get_object_or_404(Order, order_id=order_id, user=request.user)
    serializer = OrderSerializer(order)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    order = get_object_or_404(Order, order_id=order_id, user=request.user)
    
    # Only allow cancellation if order is in pending or confirmed state
    if order.status in ['pending', 'confirmed']:
        # Restore stock for cancelled order
        for order_item in order.items.all():
            product = order_item.product
            product.stock += order_item.quantity
            product.available = True
            product.save()
        
        order.status = 'cancelled'
        order.save()
        serializer = OrderSerializer(order)
        return Response({'message': 'Order cancelled successfully', 'order': serializer.data})
    else:
        return Response(
            {'error': f'Cannot cancel order in {order.status} state'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_payment_status(request, order_id):
    order = get_object_or_404(Order, order_id=order_id, user=request.user)
    payment_status = request.data.get('payment_status', 'completed')
    
    # Update payment status
    old_payment_status = order.payment_status
    order.payment_status = payment_status
    
    # If payment is completed and wasn't completed before, update stock
    if payment_status == 'completed' and old_payment_status != 'completed':
        # Update stock for order items if not already done
        for order_item in order.items.all():
            product = order_item.product
            if product.stock >= order_item.quantity:
                product.stock -= order_item.quantity
                if product.stock <= 0:
                    product.available = False
                product.save()
        
        # Clear the cart
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            CartItem.objects.filter(cart=cart).delete()
        order.status = 'confirmed'
        email_result = send_order_confirmation_email(order)
    
    # If payment failed, restore stock
    elif payment_status == 'failed' and old_payment_status == 'completed':
        for order_item in order.items.all():
            product = order_item.product
            product.stock += order_item.quantity
            product.available = True
            product.save()
    
    order.save()
    serializer = OrderSerializer(order)
    response_data = {'message': 'Payment status updated', 'order': serializer.data}
    if payment_status == 'completed' and old_payment_status != 'completed':
        response_data['email_sent'] = bool(email_result and email_result.get('sent'))
        response_data['email_recipient'] = email_result.get('recipient_email') if email_result else None
        response_data['email_error'] = email_result.get('error') if email_result else None
    return Response(response_data)

# Review Views
@api_view(['GET'])
def product_reviews(request, product_id):
    reviews = Review.objects.filter(product_id=product_id, is_approved=True)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_review(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    review, created = Review.objects.get_or_create(
        product=product,
        user=request.user,
        defaults={
            'rating': request.data.get('rating'),
            'comment': request.data.get('comment')
        }
    )
    
    if not created:
        review.rating = request.data.get('rating')
        review.comment = request.data.get('comment')
        review.save()
    
    serializer = ReviewSerializer(review)
    return Response(serializer.data)

# User Profile Views
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        # Update user fields
        user = request.user
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'username' in request.data:
            user.username = request.data['username']
        if 'email' in request.data:
            user.email = request.data['email']
        user.save()
        
        # Update profile fields
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            # Return updated profile with user data
            updated_profile = UserProfileSerializer(profile).data
            return Response(updated_profile)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Analytics Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_dashboard(request):
    user_orders = Order.objects.filter(user=request.user)
    total_spent = sum(order.total_amount for order in user_orders)
    
    return Response({
        'total_orders': user_orders.count(),
        'total_spent': total_spent,
        'recent_orders': OrderSerializer(user_orders[:5], many=True).data,
    })

# ML Recommendation Views
@api_view(['GET'])
@permission_classes([AllowAny])
def get_recommendations(request):
    model_type = request.query_params.get('model', 'knn')
    limit = int(request.query_params.get('limit', 6))
    
    try:
        if model_type == 'knn':
            from knn_recommendations import knn_system
            recommendations = knn_system.get_recommendations(limit)
        else:
            from ml_recommendations import ml_system
            recommendations = ml_system.get_recommendations(limit)
            
        return Response({
            'recommendations': recommendations,
            'model_used': model_type
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ml_dashboard(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Import KNN system
        from knn_recommendations import knn_system
        
        # Get KNN recommendations and performance
        knn_recs = knn_system.get_recommendations(6)
        knn_performance = knn_system.get_model_performance()
        
        # Get most ordered products
        most_ordered = knn_system.get_most_ordered_products(6)
        
        return Response({
            'models': {
                'knn': {
                    'recommendations': knn_recs,
                    'performance': knn_performance
                }
            },
            'most_ordered_products': most_ordered
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    total_users = UserProfile.objects.count()
    total_revenue = sum(order.total_amount for order in Order.objects.all())
    
    return Response({
        'total_products': total_products,
        'total_orders': total_orders,
        'total_users': total_users,
        'total_revenue': float(total_revenue)
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def most_ordered_products(request):
    from knn_recommendations import knn_system
    
    limit = int(request.query_params.get('limit', 6))
    
    try:
        products = knn_system.get_most_ordered_products(limit)
        return Response({
            'products': products
        })
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def analyze_room(request):
    uploaded_image = request.FILES.get('image')
    if not uploaded_image:
        return Response({'error': 'Please upload a room image.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        analysis = analyze_room_image(
            uploaded_image=uploaded_image,
            user=request.user if request.user.is_authenticated else None,
            budget=request.data.get('budget'),
            style=request.data.get('style'),
            room_hint=request.data.get('room_hint'),
        )
        return Response(analysis)
    except Exception as exc:
        return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Admin CRUD Operations
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_products(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    products = Product.objects.all().order_by('-created')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_product(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get category by slug
        category_slug = request.data.get('category', 'living-room')
        category = get_object_or_404(Category, slug=category_slug)
        
        # Generate unique slug
        base_slug = request.data.get('name', '').lower().replace(' ', '-').replace('--', '-')
        slug = base_slug
        counter = 1
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Create product
        product = Product.objects.create(
            name=request.data.get('name'),
            slug=slug,
            category=category,
            description=request.data.get('description', ''),
            price=request.data.get('price', 0),
            stock=int(request.data.get('stock', 0)),
            image_url=request.data.get('image_url', ''),
            available=True
        )
        
        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_product(request, product_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        product = get_object_or_404(Product, id=product_id)
        
        # Update name and slug
        if 'name' in request.data:
            product.name = request.data['name']
            base_slug = request.data['name'].lower().replace(' ', '-').replace('--', '-')
            # Ensure unique slug
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(id=product.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            product.slug = slug
        
        # Update price - save exactly as entered
        if 'price' in request.data:
            product.price = request.data['price']
        
        # Update other fields
        product.description = request.data.get('description', product.description)
        product.stock = int(request.data.get('stock', product.stock))
        product.image_url = request.data.get('image_url', product.image_url)
        
        # Update category
        if 'category' in request.data:
            category = get_object_or_404(Category, slug=request.data['category'])
            product.category = category
        
        product.save()
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_product(request, product_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    product = get_object_or_404(Product, id=product_id)
    product.delete()
    return Response({'message': 'Product deleted successfully'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    users = User.objects.all()
    users_data = [{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active,
        'date_joined': user.date_joined
    } for user in users]
    return Response(users_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_user(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
            'date_joined': user.date_joined
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_user(request, user_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = get_object_or_404(User, id=user_id)
        
        if 'username' in request.data:
            user.username = request.data['username']
        if 'email' in request.data:
            user.email = request.data['email']
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        
        user.save()
        return Response({'message': 'User updated successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_ban_user(request, user_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = get_object_or_404(User, id=user_id)
        user.is_active = False
        user.save()
        return Response({'message': 'User banned successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, user_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = get_object_or_404(User, id=user_id)
        user.delete()
        return Response({'message': 'User deleted successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    orders = Order.objects.all().order_by('-created_at')
    orders_data = []
    for order in orders:
        orders_data.append({
            'id': order.id,
            'order_id': order.order_id,
            'user': {
                'first_name': order.user.first_name,
                'last_name': order.user.last_name,
                'username': order.user.username
            },
            'total_amount': float(order.total_amount),
            'status': order.status,
            'payment_method': order.payment_method,
            'payment_status': order.payment_status,
            'created_at': order.created_at.isoformat(),
            'shipping_address': order.shipping_address
        })
    return Response(orders_data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_update_order_status(request, order_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    order = get_object_or_404(Order, id=order_id)
    old_status = order.status
    old_payment_status = order.payment_status
    
    # Update order status if provided
    if 'status' in request.data:
        new_status = request.data.get('status')
        
        # If order is being cancelled, restore stock
        if new_status == 'cancelled' and old_status != 'cancelled':
            for order_item in order.items.all():
                product = order_item.product
                product.stock += order_item.quantity
                product.available = True
                product.save()
        
        order.status = new_status
    
    # Update payment status if provided
    if 'payment_status' in request.data:
        new_payment_status = request.data.get('payment_status')
        
        # If payment failed after being completed, restore stock
        if new_payment_status == 'failed' and old_payment_status == 'completed':
            for order_item in order.items.all():
                product = order_item.product
                product.stock += order_item.quantity
                product.available = True
                product.save()
        
        order.payment_status = new_payment_status
    
    order.save()
    return Response({'message': 'Order status updated'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_order(request, order_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        order = get_object_or_404(Order, id=order_id)
        order.delete()
        return Response({'message': 'Order deleted successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_wishlists(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    wishlists = Wishlist.objects.all().select_related('user', 'product')
    wishlists_data = []
    for wishlist in wishlists:
        wishlists_data.append({
            'id': wishlist.id,
            'user': {
                'username': wishlist.user.username,
                'first_name': wishlist.user.first_name,
                'last_name': wishlist.user.last_name
            },
            'product': {
                'name': wishlist.product.name,
                'price': float(wishlist.product.price),
                'image_url': wishlist.product.image_url
            },
            'added_at': wishlist.added_at.isoformat()
        })
    return Response(wishlists_data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_remove_wishlist(request, wishlist_id):
    if not request.user.is_staff:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        wishlist = get_object_or_404(Wishlist, id=wishlist_id)
        wishlist.delete()
        return Response({'message': 'Wishlist item removed successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)