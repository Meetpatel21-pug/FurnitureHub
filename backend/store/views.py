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
from django.http import HttpResponse
from decimal import Decimal
from pathlib import Path
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import ssl
import os
import uuid
import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io

try:
    import truststore
except ImportError:  # pragma: no cover - dependency may be missing in some environments
    truststore = None

from .models import Category, Product, Cart, CartItem, Wishlist, Order, OrderItem, Review, UserProfile, Vendor
from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer, CartItemSerializer,
    WishlistSerializer, OrderSerializer, ReviewSerializer, UserProfileSerializer,
    UserRegistrationSerializer, UserSerializer, VendorSerializer
)
from .room_ai import analyze_room_image

DELIVERY_CHARGE = Decimal('50.00')
logger = logging.getLogger(__name__)


def _get_invoice_font_names():
    font_dir = Path(os.environ.get('WINDIR', r'C:\Windows')) / 'Fonts'
    regular_path = font_dir / 'segoeui.ttf'
    bold_path = font_dir / 'segoeuib.ttf'

    if regular_path.exists():
        regular_font = 'InvoiceSegoeUI'
        bold_font = 'InvoiceSegoeUI-Bold' if bold_path.exists() else regular_font

        if regular_font not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(regular_font, str(regular_path)))
        if bold_path.exists() and bold_font not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(bold_font, str(bold_path)))

        return regular_font, bold_font

    return 'Helvetica', 'Helvetica-Bold'

CHAT_SYSTEM_PROMPT = """You are FurniBot, the friendly AI assistant for FurnitureZone, a premium online furniture store.
Keep your answers brief, polite, and helpful. Format your responses using simple markdown (bolding key terms).

Store information: FurnitureZone sells Living Room, Bedroom, Dining Room, Office, and Storage furniture. It offers an AI Room Designer, free delivery on orders over Rs. 5,000, a 5-year warranty, 30-day returns, and 24/7 expert support."""


def _build_fallback_reply(message):
    lowered = (message or '').lower()
    if any(keyword in lowered for keyword in ['delivery', 'shipping', 'return', 'warranty']):
        return (
            "FurniBot here: FurnitureZone offers free delivery on orders over Rs. 5,000, a 5-year warranty, "
            "and 30-day hassle-free returns. How else can I help?"
        )
    if any(keyword in lowered for keyword in ['sofa', 'sofas', 'small room', 'compact', 'loveseat']):
        return (
            "FurniBot here: For smaller spaces, compact sofas, loveseat styles, and modular seating work beautifully. "
            "I can suggest options that fit your room size, style, and budget."
        )
    if any(keyword in lowered for keyword in ['bed', 'bedroom', 'nightstand']):
        return (
            "FurniBot here: For bedrooms, space-saving beds, storage headboards, and matching nightstands are great choices. "
            "I can help you create a cozy and practical setup."
        )
    if any(keyword in lowered for keyword in ['room', 'design', 'style', 'decor']):
        return (
            "FurniBot here: I can help with room design ideas, color pairing, layout advice, and furniture recommendations for modern, classic, "
            "Scandinavian, industrial, and minimalist styles."
        )
    return (
        "I'm FurniBot, your furniture expert! I specialize in product recommendations, "
        "delivery policies, and product guidance for FurnitureZone."
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def chat_with_furnibot(request):
    """Proxy chat requests to xAI when available, otherwise return a helpful local fallback."""
    message = str(request.data.get('message', '')).strip()
    if not message:
        return Response({'error': 'A message is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(message) > 300:
        return Response({'error': 'Messages must be 300 characters or fewer.'}, status=status.HTTP_400_BAD_REQUEST)

    if not settings.XAI_API_KEY:
        return Response({'reply': _build_fallback_reply(message)})

    raw_history = request.data.get('history', [])
    history = []
    if isinstance(raw_history, list):
        for item in raw_history[-10:]:
            if not isinstance(item, dict) or item.get('role') not in ('user', 'assistant'):
                continue
            content = str(item.get('content', '')).strip()
            if content:
                history.append({'role': item['role'], 'content': content[:1000]})

    payload = {
        'model': settings.XAI_MODEL,
        'messages': [
            {'role': 'system', 'content': CHAT_SYSTEM_PROMPT},
            *history,
            {'role': 'user', 'content': message},
        ],
        'temperature': 0.7,
        'max_tokens': 350,
    }
    api_request = Request(
        'https://api.x.ai/v1/chat/completions',
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Authorization': f'Bearer {settings.XAI_API_KEY}',
            'Content-Type': 'application/json',
        },
        method='POST',
    )

    try:
        # Use the Windows trust store when available so managed-network root certificates
        # are honoured while HTTPS certificate verification remains enabled.
        ssl_context = (
            truststore.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
            if truststore is not None
            else ssl.create_default_context()
        )
        with urlopen(api_request, timeout=30, context=ssl_context) as api_response:
            data = json.loads(api_response.read().decode('utf-8'))
        choices = data.get('choices') if isinstance(data, dict) else None
        if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
            raise ValueError('The chat provider returned no completion choices.')
        reply = str(choices[0].get('message', {}).get('content', '')).strip()
        if not reply:
            raise ValueError('The chat provider returned an empty response.')
        return Response({'reply': reply})
    except HTTPError as exc:
        logger.warning('xAI chat request failed with HTTP %s', exc.code)
        return Response({'reply': _build_fallback_reply(message)})
    except (URLError, TimeoutError, ValueError, json.JSONDecodeError):
        logger.warning('xAI chat request failed; using local fallback reply', exc_info=True)
        return Response({'reply': _build_fallback_reply(message)})
    except Exception:
        logger.exception('Unexpected xAI chat service failure')
        return Response({'reply': _build_fallback_reply(message)})


def _build_invoice_pdf(order):
    """Return a BytesIO buffer containing the invoice PDF for the given order."""
    order_items = order.items.select_related('product').all()
    subtotal = sum((item.get_cost() for item in order_items), Decimal('0.00'))
    delivery_charge = max(order.total_amount - subtotal, Decimal('0.00'))
    customer_name = f"{order.user.first_name} {order.user.last_name}".strip() or order.user.username
    payment_method_label = dict(Order.PAYMENT_METHOD_CHOICES).get(order.payment_method, order.payment_method)
    body_font, bold_font = _get_invoice_font_names()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=15*mm, bottomMargin=15*mm,
                            leftMargin=20*mm, rightMargin=20*mm)
    teal = colors.HexColor('#0f766e')
    dark = colors.HexColor('#111827')
    muted = colors.HexColor('#6b7280')

    title_style = ParagraphStyle('title', fontSize=22, textColor=colors.white,
                                  fontName=bold_font, alignment=TA_LEFT)
    label_style = ParagraphStyle('label', fontSize=9, textColor=muted, fontName=body_font)
    value_style = ParagraphStyle('value', fontSize=9, textColor=dark, fontName=bold_font,
                                  alignment=TA_RIGHT)
    normal = ParagraphStyle('normal', fontSize=9, textColor=dark, fontName=body_font)
    footer_style = ParagraphStyle('footer', fontSize=8, textColor=muted,
                                   fontName=body_font, alignment=TA_CENTER)

    elements = []

    header_data = [[Paragraph('FurnitureZone', title_style),
                    Paragraph('TAX INVOICE', ParagraphStyle('inv', fontSize=11,
                              textColor=colors.HexColor('#ccfbf1'), fontName=bold_font,
                              alignment=TA_RIGHT))]]
    header_table = Table(header_data, colWidths=[110*mm, 60*mm])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), teal),
        ('TOPPADDING', (0, 0), (-1, -1), 12), ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (0, -1), 10), ('RIGHTPADDING', (-1, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 6*mm))

    meta_data = [
        [Paragraph('Order ID', label_style), Paragraph(order.order_id, value_style)],
        [Paragraph('Order Date', label_style), Paragraph(order.created_at.strftime('%d %b %Y, %I:%M %p'), value_style)],
        [Paragraph('Customer', label_style), Paragraph(customer_name, value_style)],
        [Paragraph('Payment Method', label_style), Paragraph(payment_method_label, value_style)],
        [Paragraph('Payment Status', label_style), Paragraph(order.payment_status.title(), value_style)],
        [Paragraph('Order Status', label_style), Paragraph(order.status.title(), value_style)],
    ]
    meta_table = Table(meta_data, colWidths=[80*mm, 90*mm])
    meta_table.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -2), 0.3, colors.HexColor('#e5e7eb')),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 4*mm))

    elements.append(Paragraph('Shipping Address', label_style))
    elements.append(Spacer(1, 1*mm))
    elements.append(Paragraph(order.shipping_address.replace('\n', ', '), normal))
    elements.append(Spacer(1, 5*mm))
    elements.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#e5e7eb')))
    elements.append(Spacer(1, 4*mm))

    item_header = [[
        Paragraph('<b>Item</b>', normal),
        Paragraph('<b>Qty</b>', ParagraphStyle('c', fontSize=9, fontName=bold_font, alignment=TA_CENTER)),
        Paragraph('<b>Unit Price</b>', ParagraphStyle('r', fontSize=9, fontName=bold_font, alignment=TA_RIGHT)),
        Paragraph('<b>Total</b>', ParagraphStyle('r', fontSize=9, fontName=bold_font, alignment=TA_RIGHT)),
    ]]
    item_rows = [
        [
            Paragraph(item.product.name, normal),
            Paragraph(str(item.quantity), ParagraphStyle('c', fontSize=9, fontName=body_font, alignment=TA_CENTER)),
            Paragraph(f'\u20b9{item.price:.2f}', ParagraphStyle('r', fontSize=9, fontName=body_font, alignment=TA_RIGHT)),
            Paragraph(f'\u20b9{item.get_cost():.2f}', ParagraphStyle('r', fontSize=9, fontName=body_font, alignment=TA_RIGHT)),
        ]
        for item in order_items
    ]
    items_table = Table(item_header + item_rows, colWidths=[90*mm, 20*mm, 35*mm, 35*mm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0fdfa')),
        ('LINEBELOW', (0, 0), (-1, 0), 1, teal),
        ('LINEBELOW', (0, 1), (-1, -1), 0.3, colors.HexColor('#e5e7eb')),
        ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (0, -1), 4),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 5*mm))

    totals_data = [
        [Paragraph('Subtotal', label_style), Paragraph(f'\u20b9{subtotal:.2f}', value_style)],
        [Paragraph('Delivery Charge', label_style), Paragraph(f'\u20b9{delivery_charge:.2f}', value_style)],
        [Paragraph('<b>Grand Total</b>', ParagraphStyle('bold', fontSize=10, fontName=bold_font, textColor=dark)),
         Paragraph(f'<b>\u20b9{order.total_amount:.2f}</b>',
               ParagraphStyle('boldR', fontSize=11, fontName=bold_font, textColor=teal, alignment=TA_RIGHT))],
    ]
    totals_table = Table(totals_data, colWidths=[130*mm, 40*mm])
    totals_table.setStyle(TableStyle([
        ('LINEABOVE', (0, 2), (-1, 2), 1, colors.HexColor('#e5e7eb')),
        ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ALIGN', (-1, 0), (-1, -1), 'RIGHT'),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 8*mm))
    elements.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#e5e7eb')))
    elements.append(Spacer(1, 4*mm))
    elements.append(Paragraph('Thank you for shopping with FurnitureZone!', footer_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer


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
        from email.mime.base import MIMEBase
        from email import encoders

        outer = MIMEMultipart('mixed')
        outer['Subject'] = subject
        outer['From'] = settings.DEFAULT_FROM_EMAIL
        outer['To'] = recipient_email

        alt = MIMEMultipart('alternative')
        alt.attach(MIMEText(plain_message, 'plain', 'utf-8'))
        alt.attach(MIMEText(html_message, 'html', 'utf-8'))
        outer.attach(alt)

        # Attach PDF invoice
        try:
            pdf_buffer = _build_invoice_pdf(order)
            pdf_part = MIMEBase('application', 'pdf')
            pdf_part.set_payload(pdf_buffer.read())
            encoders.encode_base64(pdf_part)
            pdf_part.add_header('Content-Disposition', f'attachment; filename="invoice_{order.order_id}.pdf"')
            outer.attach(pdf_part)
        except Exception as pdf_exc:
            print(f'Could not attach PDF for {order.order_id}: {pdf_exc}')

        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=30) as server:
            server.ehlo()
            if settings.EMAIL_USE_TLS:
                server.starttls(context=tls_context)
                server.ehlo()
            if settings.EMAIL_HOST_USER and settings.EMAIL_HOST_PASSWORD:
                server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            server.sendmail(settings.DEFAULT_FROM_EMAIL, [recipient_email], outer.as_string())

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def first_order_discount(request):
    import random
    has_orders = Order.objects.filter(user=request.user).exclude(status='cancelled').exists()
    if has_orders:
        return Response({'eligible': False, 'discount_percent': 0})
    discount = random.choice([10, 12, 15])
    return Response({'eligible': True, 'discount_percent': discount})


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
def vendor_auth_register(request):
    """Register a new user AND immediately create their vendor profile."""
    # We use a custom serializer or standard one. The standard one accepts username, email, password, etc.
    from .serializers import UserRegistrationSerializer
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Create vendor profile
        from .models import Vendor
        Vendor.objects.create(
            user=user,
            store_name=request.data.get('store_name', f"{user.username}'s Store"),
            store_description=request.data.get('store_description', ''),
            logo_url=request.data.get('logo_url') or None,
            phone=request.data.get('phone', ''),
            address=request.data.get('address', ''),
            city=request.data.get('city', ''),
            state=request.data.get('state', ''),
            status='pending',
        )
        
        from rest_framework_simplejwt.tokens import RefreshToken
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

# In-memory OTP store: {email: {'otp': str, 'expires': datetime}}
_otp_store = {}

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    import random
    from datetime import datetime, timedelta
    email = request.data.get('email', '').strip()
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not User.objects.filter(email=email).exists():
        return Response({'error': 'No account found with this email'}, status=status.HTTP_404_NOT_FOUND)

    otp = str(random.randint(100000, 999999))
    _otp_store[email] = {'otp': otp, 'expires': datetime.now() + timedelta(minutes=10)}

    html = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>Your OTP for resetting your FurnitureZone password is:</p>
            <h1 style="color: #4CAF50; letter-spacing: 2px;">{otp}</h1>
            <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        </body>
    </html>
    """
    logger = logging.getLogger(__name__)
    try:
        # Primary: use Django's built-in email backend (respects settings.py)
        from django.core.mail import send_mail
        send_mail(
            subject='FurnitureZone - Password Reset OTP',
            message=f'Your OTP is {otp}. Valid for 10 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            html_message=html,
            fail_silently=False,
        )
    except Exception as primary_err:
        logger.error(f'[ForgotPassword] Django send_mail failed: {primary_err}')
        # Fallback: raw smtplib with SSL verification disabled (handles proxy/antivirus MITM)
        try:
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'FurnitureZone - Password Reset OTP'
            msg['From'] = settings.DEFAULT_FROM_EMAIL
            msg['To'] = email
            msg.attach(MIMEText(f'Your OTP is: {otp}. Valid for 10 minutes.', 'plain'))
            msg.attach(MIMEText(html, 'html'))
            with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=30) as server:
                server.ehlo()
                if settings.EMAIL_USE_TLS:
                    server.starttls(context=context)
                    server.ehlo()
                server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                server.sendmail(settings.DEFAULT_FROM_EMAIL, [email], msg.as_string())
        except Exception as fallback_err:
            logger.error(f'[ForgotPassword] Fallback smtplib also failed: {fallback_err}')
            return Response(
                {'error': f'Failed to send OTP: {fallback_err}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    return Response({'message': 'OTP sent to your email'})


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    from datetime import datetime
    email = request.data.get('email', '').strip()
    otp = request.data.get('otp', '').strip()
    record = _otp_store.get(email)
    if not record:
        return Response({'error': 'OTP not found. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
    if datetime.now() > record['expires']:
        _otp_store.pop(email, None)
        return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
    if record['otp'] != otp:
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'message': 'OTP verified'})


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    from datetime import datetime
    email = request.data.get('email', '').strip()
    otp = request.data.get('otp', '').strip()
    new_password = request.data.get('new_password', '')
    record = _otp_store.get(email)
    if not record:
        return Response({'error': 'OTP not found. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
    if datetime.now() > record['expires']:
        _otp_store.pop(email, None)
        return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
    if record['otp'] != otp:
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.filter(email=email).first()
    if not user:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    user.set_password(new_password)
    user.save()
    _otp_store.pop(email, None)
    return Response({'message': 'Password reset successfully'})


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
            # Try to match by slug first, then by name (case insensitive), and finally room_category
            queryset = queryset.filter(
                Q(category__slug=category_slug) | 
                Q(category__name__icontains=category_slug.replace('-', ' ')) |
                Q(room_category__icontains=category_slug)
            )
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(category__name__icontains=search) |
                Q(room_category__icontains=search)
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

    # Apply first-order discount if eligible
    discount_percent = Decimal('0')
    requested_discount = Decimal(str(request.data.get('discount_percent', 0)))
    has_previous_orders = Order.objects.filter(user=request.user).exclude(status='cancelled').exists()
    if not has_previous_orders and requested_discount in [Decimal('10'), Decimal('12'), Decimal('15')]:
        discount_percent = requested_discount

    discount_amount = (subtotal * discount_percent / Decimal('100')).quantize(Decimal('0.01'))
    total = subtotal - discount_amount + DELIVERY_CHARGE
    
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
        # Get category robustly (by id, slug, or name)
        cat_val = request.data.get('category', 'living-room')
        category = None
        if str(cat_val).isdigit():
            category = Category.objects.filter(id=int(cat_val)).first()
        if not category:
            from django.db.models import Q
            category = Category.objects.filter(Q(slug=cat_val) | Q(name__iexact=str(cat_val))).first()
            
        if not category:
            return Response({'error': f'No Category matches the given query: {cat_val}'}, status=status.HTTP_400_BAD_REQUEST)
        
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
            room_category=request.data.get('room_category', ''),
            available=True
        )

        if request.FILES.get('image'):
            product.image = request.FILES['image']
        if request.FILES.get('model_file'):
            product.model_file = request.FILES['model_file']
        product.save()
        
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
        product.room_category = request.data.get('room_category', product.room_category)
        if request.FILES.get('image'):
            product.image = request.FILES['image']
        if request.FILES.get('model_file'):
            product.model_file = request.FILES['model_file']
        
        # Update category
        if 'category' in request.data:
            cat_val = request.data['category']
            category = None
            if str(cat_val).isdigit():
                category = Category.objects.filter(id=int(cat_val)).first()
            if not category:
                from django.db.models import Q
                category = Category.objects.filter(Q(slug=cat_val) | Q(name__iexact=str(cat_val))).first()
            if category:
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_id):
    order = get_object_or_404(Order, order_id=order_id, user=request.user)
    buffer = _build_invoice_pdf(order)
    response = HttpResponse(buffer, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="invoice_{order.order_id}.pdf"'
    return response


# ─────────────────────────────────────────────────────────────────────────────
# VENDOR / MULTI-SELLER VIEWS
# ─────────────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vendor_register(request):
    """Register current user as a vendor (creates pending application)."""
    if hasattr(request.user, 'vendor_profile'):
        return Response({'error': 'You are already registered as a vendor.'}, status=status.HTTP_400_BAD_REQUEST)
    data = request.data.copy()
    if not data.get('store_name'):
        return Response({'error': 'store_name is required.'}, status=status.HTTP_400_BAD_REQUEST)
    vendor = Vendor.objects.create(
        user=request.user,
        store_name=data.get('store_name', ''),
        store_description=data.get('store_description', ''),
        logo_url=data.get('logo_url') or None,
        phone=data.get('phone', ''),
        address=data.get('address', ''),
        city=data.get('city', ''),
        state=data.get('state', ''),
        status='pending',
    )
    return Response(VendorSerializer(vendor).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def vendor_profile(request):
    """Get or update the current user's vendor profile."""
    vendor = get_object_or_404(Vendor, user=request.user)
    if request.method == 'GET':
        return Response(VendorSerializer(vendor).data)
    # PUT
    allowed = ['store_name', 'store_description', 'logo_url', 'phone', 'address', 'city', 'state']
    for field in allowed:
        if field in request.data:
            setattr(vendor, field, request.data[field])
    vendor.save()
    return Response(VendorSerializer(vendor).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_products(request):
    """List the vendor's own products."""
    vendor = get_object_or_404(Vendor, user=request.user)
    products = Product.objects.filter(vendor=vendor).select_related('category')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vendor_create_product(request):
    """Create a new product owned by the vendor."""
    try:
        vendor = get_object_or_404(Vendor, user=request.user)
        if not vendor.is_approved:
            return Response({'error': 'Your vendor account must be approved before adding products.'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        name = data.get('name')
        price = data.get('price')
        if not name or not price:
            return Response({'error': 'Product name and price are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Flexible Category Lookup (by ID, slug, or name)
        cat_val = data.get('category')
        category = None
        if cat_val:
            if str(cat_val).isdigit():
                category = Category.objects.filter(id=int(cat_val)).first()
            if not category:
                category = Category.objects.filter(Q(slug=cat_val) | Q(name__iexact=str(cat_val))).first()
        
        if not category:
            category = Category.objects.first() # Default fallback to first category if available
        if not category:
            return Response({'error': 'No product categories available. Please create a category first.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique slug
        import re
        slug = data.get('slug') or re.sub(r'[^a-z0-9]+', '-', str(name).lower()).strip('-')
        base_slug = slug or 'product'
        counter = 1
        while Product.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Parse boolean available
        avail_val = data.get('available')
        if isinstance(avail_val, str):
            available = avail_val.lower() in ('true', '1', 'yes')
        else:
            available = bool(avail_val) if avail_val is not None else True

        product = Product.objects.create(
            vendor=vendor,
            name=name,
            slug=slug,
            category=category,
            description=data.get('description', ''),
            price=price,
            image_url=data.get('image_url') or None,
            room_category=data.get('room_category', ''),
            stock=int(data.get('stock', 10)),
            available=available,
        )

        model_file = request.FILES.get('model_file')
        image_file = request.FILES.get('image')
        if model_file or image_file:
            if model_file:
                product.model_file = model_file
            if image_file:
                product.image = image_file
            product.save()

        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.exception("vendor_create_product failed")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def vendor_update_product(request, product_id):
    """Update a product — only if it belongs to this vendor."""
    try:
        vendor = get_object_or_404(Vendor, user=request.user)
        product = get_object_or_404(Product, id=product_id, vendor=vendor)
        data = request.data

        allowed = ['name', 'description', 'price', 'image_url', 'room_category', 'stock']
        for field in allowed:
            if field in data:
                setattr(product, field, data[field])

        if 'available' in data:
            avail_val = data['available']
            if isinstance(avail_val, str):
                product.available = avail_val.lower() in ('true', '1', 'yes')
            else:
                product.available = bool(avail_val)

        if 'category' in data and data['category']:
            cat_val = data['category']
            category = None
            if str(cat_val).isdigit():
                category = Category.objects.filter(id=int(cat_val)).first()
            if not category:
                category = Category.objects.filter(Q(slug=cat_val) | Q(name__iexact=str(cat_val))).first()
            if category:
                product.category = category

        model_file = request.FILES.get('model_file')
        image_file = request.FILES.get('image')
        if model_file or image_file:
            if model_file:
                product.model_file = model_file
            if image_file:
                product.image = image_file
        
        product.save()
        return Response(ProductSerializer(product).data)
    except Exception as e:
        logger.exception("vendor_update_product failed")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def vendor_delete_product(request, product_id):
    """Delete a product — only if it belongs to this vendor."""
    vendor = get_object_or_404(Vendor, user=request.user)
    product = get_object_or_404(Product, id=product_id, vendor=vendor)
    product.delete()
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_orders(request):
    """Return orders that contain at least one product belonging to this vendor."""
    vendor = get_object_or_404(Vendor, user=request.user)
    vendor_product_ids = vendor.products.values_list('id', flat=True)
    orders = Order.objects.filter(
        items__product__id__in=vendor_product_ids
    ).distinct().select_related('user').prefetch_related('items__product')
    data = []
    for order in orders:
        vendor_items = [item for item in order.items.all() if item.product_id in vendor_product_ids]
        vendor_revenue = sum(item.get_cost() for item in vendor_items)
        data.append({
            'id': order.id,
            'order_id': order.order_id,
            'customer': order.user.username,
            'status': order.status,
            'payment_status': order.payment_status,
            'vendor_revenue': str(vendor_revenue),
            'total_amount': str(order.total_amount),
            'created_at': order.created_at.isoformat(),
            'items': [{
                'product_name': item.product.name,
                'quantity': item.quantity,
                'price': str(item.price),
            } for item in vendor_items],
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_stats(request):
    """Return summary analytics for the vendor."""
    vendor = get_object_or_404(Vendor, user=request.user)
    vendor_product_ids = list(vendor.products.values_list('id', flat=True))
    orders = Order.objects.filter(items__product__id__in=vendor_product_ids).distinct()
    total_revenue = Decimal('0')
    for order in orders:
        for item in order.items.filter(product__id__in=vendor_product_ids):
            total_revenue += item.get_cost()
    return Response({
        'total_products': vendor.products.count(),
        'total_orders': orders.count(),
        'total_revenue': str(total_revenue),
        'status': vendor.status,
        'store_name': vendor.store_name,
        'pending_orders': orders.filter(status='pending').count(),
        'delivered_orders': orders.filter(status='delivered').count(),
    })


# ── Admin Vendor Management ───────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_vendors(request):
    """Admin: list all vendor applications."""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    vendors = Vendor.objects.select_related('user').all()
    return Response(VendorSerializer(vendors, many=True).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def admin_approve_vendor(request, vendor_id):
    """Admin: approve or reject a vendor application."""
    if not request.user.is_staff:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
    vendor = get_object_or_404(Vendor, id=vendor_id)
    new_status = request.data.get('status')
    if new_status not in ['approved', 'rejected', 'pending']:
        return Response({'error': 'status must be approved, rejected, or pending.'}, status=status.HTTP_400_BAD_REQUEST)
    vendor.status = new_status
    vendor.save()
    return Response(VendorSerializer(vendor).data)
