from io import BytesIO
from functools import lru_cache

from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image, ImageDraw, ImageOps, ImageStat

from .models import Product, RoomScan, DetectedObject, RoomRecommendation


ROOM_PROFILES = {
    'living_room': {
        'labels': ['sofa', 'coffee table', 'tv unit'],
        'complements': ['coffee table', 'side table', 'rug', 'floor lamp', 'tv unit'],
        'categories': ['living room', 'lounge', 'sofa', 'entertainment'],
        'style_terms': ['modern', 'contemporary', 'minimal', 'scandinavian'],
    },
    'bedroom': {
        'labels': ['bed', 'wardrobe', 'nightstand'],
        'complements': ['nightstand', 'wardrobe', 'dresser', 'bedside lamp', 'mattress'],
        'categories': ['bedroom', 'sleep', 'rest'],
        'style_terms': ['cozy', 'minimal', 'modern', 'soft'],
    },
    'dining_room': {
        'labels': ['dining table', 'chair', 'sideboard'],
        'complements': ['dining chair', 'sideboard', 'cabinet', 'pendant lamp'],
        'categories': ['dining', 'table', 'chair'],
        'style_terms': ['modern', 'classic', 'warm', 'clean'],
    },
    'office': {
        'labels': ['desk', 'office chair', 'bookshelf'],
        'complements': ['office chair', 'bookshelf', 'storage', 'desk lamp'],
        'categories': ['office', 'study', 'work'],
        'style_terms': ['minimal', 'industrial', 'modern', 'professional'],
    },
    'kitchen': {
        'labels': ['cabinet', 'stool', 'table'],
        'complements': ['cabinet', 'stool', 'storage', 'shelving'],
        'categories': ['kitchen', 'dining', 'storage'],
        'style_terms': ['bright', 'clean', 'modern', 'functional'],
    },
}


def _normalize(value):
    return (value or '').strip().lower()


def _infer_room_type(room_hint, width, height, brightness, dominant_rgb):
    hint = _normalize(room_hint)
    if hint:
        for room_type in ROOM_PROFILES:
            if room_type.replace('_', ' ') in hint or room_type in hint:
                return room_type

    red, green, blue = dominant_rgb
    warm_score = red - blue
    aspect_ratio = width / max(height, 1)

    if aspect_ratio > 1.15 and brightness < 155:
        return 'living_room'
    if aspect_ratio < 0.95 and brightness > 150:
        return 'bedroom'
    if warm_score > 20 and brightness > 135:
        return 'dining_room'
    if green > red and green > blue:
        return 'office'
    return 'living_room'


def _infer_room_style(style_hint, brightness, dominant_rgb):
    hint = _normalize(style_hint)
    if hint:
        return hint[:50]

    red, green, blue = dominant_rgb
    if brightness > 180:
        return 'minimal'
    if red > green and red > blue:
        return 'warm'
    if blue > red:
        return 'modern'
    return 'contemporary'


def _detect_objects(room_type, width, height, image_path=None):
    profile = ROOM_PROFILES.get(room_type, ROOM_PROFILES['living_room'])

    model = _load_yolo_model()
    if model is not None and image_path:
        try:
            results = model(image_path, verbose=False, conf=0.25)
            detections = []

            for result in results:
                names = getattr(result, 'names', {}) or {}
                boxes = getattr(result, 'boxes', None)
                if boxes is None:
                    continue

                for box in boxes:
                    cls_index = int(box.cls[0]) if getattr(box, 'cls', None) is not None else 0
                    label = names.get(cls_index, 'furniture')
                    xyxy = box.xyxy[0].tolist()
                    confidence = float(box.conf[0]) if getattr(box, 'conf', None) is not None else 0.5
                    detections.append({
                        'label': label,
                        'confidence': confidence,
                        'bbox_x': max(0, int(xyxy[0])),
                        'bbox_y': max(0, int(xyxy[1])),
                        'bbox_w': max(1, int(xyxy[2] - xyxy[0])),
                        'bbox_h': max(1, int(xyxy[3] - xyxy[1])),
                        'source': 'yolo-model',
                    })

            if detections:
                return detections[:8]
        except Exception:
            pass

    box_specs = [
        (profile['labels'][0], 0.12, 0.56, 0.42, 0.28, 0.96),
        (profile['labels'][1], 0.58, 0.34, 0.24, 0.22, 0.89),
        (profile['labels'][2], 0.63, 0.18, 0.22, 0.18, 0.84),
    ]

    detections = []
    for label, x, y, box_w, box_h, confidence in box_specs:
        detections.append({
            'label': label,
            'confidence': confidence,
            'bbox_x': max(0, int(width * x)),
            'bbox_y': max(0, int(height * y)),
            'bbox_w': max(1, int(width * box_w)),
            'bbox_h': max(1, int(height * box_h)),
            'source': 'yolo-fallback',
        })

    return detections


def _collect_knn_scores():
    try:
        from knn_recommendations import knn_system

        return {item['id']: item.get('knn_score', 0) for item in knn_system.get_recommendations(limit=100)}
    except Exception:
        return {}


@lru_cache(maxsize=1)
def _load_yolo_model():
    if not settings.ROOM_AI_USE_MODEL_BACKENDS or not settings.ROOM_AI_YOLO_WEIGHTS:
        return None

    try:
        from ultralytics import YOLO

        return YOLO(settings.ROOM_AI_YOLO_WEIGHTS)
    except Exception:
        return None


@lru_cache(maxsize=1)
def _load_cnn_model():
    if not settings.ROOM_AI_USE_MODEL_BACKENDS or not settings.ROOM_AI_CNN_MODEL:
        return None

    try:
        from tensorflow.keras.models import load_model

        return load_model(settings.ROOM_AI_CNN_MODEL)
    except Exception:
        return None


def _predict_room_type_with_cnn(image):
    model = _load_cnn_model()
    if model is None:
        return None

    try:
        try:
            import numpy as np
        except Exception:
            return None

        input_shape = getattr(model, 'input_shape', None)
        if not input_shape or len(input_shape) < 3:
            return None

        target_width = int(input_shape[1] or 224)
        target_height = int(input_shape[2] or 224)
        resized = image.resize((target_width, target_height))
        array = np.asarray(resized, dtype='float32') / 255.0
        array = np.expand_dims(array, axis=0)

        predictions = model.predict(array, verbose=0)
        if predictions is None:
            return None

        if isinstance(predictions, list):
            predictions = predictions[0]

        index = int(np.argmax(predictions[0]))
        classes = settings.ROOM_AI_CNN_CLASSES or list(ROOM_PROFILES.keys())
        if 0 <= index < len(classes):
            return classes[index]
    except Exception:
        return None

    return None


def _score_product(product, room_type, room_style, detections, budget, knn_scores):
    profile = ROOM_PROFILES.get(room_type, ROOM_PROFILES['living_room'])
    text_blob = ' '.join([
        product.name or '',
        product.description or '',
        product.category.name if product.category else '',
    ]).lower()

    category_score = 1.0 if any(term in text_blob for term in profile['categories']) else 0.2

    complement_score = 0.0
    for detection in detections:
        detected_label = detection['label'].lower()
        if detected_label in text_blob:
            complement_score = 1.0
            break
        if any(term in text_blob for term in profile['complements']):
            complement_score = max(complement_score, 0.8)

    style_score = 0.3
    if room_style and room_style in text_blob:
        style_score = 1.0
    elif any(term in text_blob for term in profile['style_terms']):
        style_score = 0.75

    knn_score = min(float(knn_scores.get(product.id, 5.0)) / 10.0, 1.0)

    if budget:
        price = float(product.price)
        budget_value = float(budget)
        if budget_value > 0 and price <= budget_value:
            budget_score = 1.0 - (price / budget_value) * 0.35
        elif budget_value > 0:
            budget_score = max(0.15, 1.0 - ((price - budget_value) / budget_value))
        else:
            budget_score = 0.5
    else:
        budget_score = 0.5

    final_score = (
        category_score * 0.35 +
        complement_score * 0.25 +
        style_score * 0.2 +
        knn_score * 0.15 +
        budget_score * 0.05
    )

    reasons = []
    if category_score >= 1.0:
        reasons.append(f"fits the {room_type.replace('_', ' ')} setup")
    if complement_score >= 0.8:
        reasons.append('complements existing furniture')
    if style_score >= 0.75:
        reasons.append(f'matches the {room_style} style')
    if budget and float(product.price) <= float(budget):
        reasons.append('stays within budget')

    return final_score, '; '.join(reasons[:2]) or 'best overall match'


def _save_annotated_image(scan, detections):
    with Image.open(scan.uploaded_image.path) as image:
        image = image.convert('RGB')
        draw = ImageDraw.Draw(image)

        for detection in detections:
            x = detection['bbox_x']
            y = detection['bbox_y']
            w = detection['bbox_w']
            h = detection['bbox_h']
            draw.rectangle([x, y, x + w, y + h], outline=(54, 211, 153), width=4)
            draw.rectangle([x, max(0, y - 28), x + min(220, w), y], fill=(15, 23, 42))
            draw.text((x + 10, max(2, y - 22)), f"{detection['label']} {detection['confidence']:.2f}", fill=(255, 255, 255))

        buffer = BytesIO()
        image.save(buffer, format='JPEG', quality=92)
        scan.annotated_image.save(f"room-scan-{scan.id}-annotated.jpg", ContentFile(buffer.getvalue()), save=False)


def analyze_room_image(uploaded_image, user=None, budget=None, style=None, room_hint=None):
    scan = RoomScan.objects.create(
        user=user if getattr(user, 'is_authenticated', False) else None,
        uploaded_image=uploaded_image,
        room_type='',
        room_style='',
        analysis_payload={},
    )

    with Image.open(scan.uploaded_image.path) as image:
        image = image.convert('RGB')
        width, height = image.size
        brightness = ImageStat.Stat(ImageOps.grayscale(image)).mean[0]
        dominant_rgb = image.resize((1, 1)).getpixel((0, 0))

    room_type = _predict_room_type_with_cnn(image)
    if not room_type:
        room_type = _infer_room_type(room_hint, width, height, brightness, dominant_rgb)
    room_style = _infer_room_style(style, brightness, dominant_rgb)
    detections = _detect_objects(room_type, width, height, scan.uploaded_image.path)
    knn_scores = _collect_knn_scores()

    products = Product.objects.filter(available=True).select_related('category')
    scored_products = []
    for product in products:
        score, reason = _score_product(product, room_type, room_style, detections, budget, knn_scores)
        scored_products.append((score, reason, product))

    scored_products.sort(key=lambda item: item[0], reverse=True)
    top_matches = scored_products[:6]

    scan.room_type = room_type
    scan.room_style = room_style
    scan.analysis_payload = {
        'room_type': room_type,
        'room_style': room_style,
        'image_size': {'width': width, 'height': height},
        'brightness': round(brightness, 2),
    }
    scan.save()

    for detection in detections:
        DetectedObject.objects.create(room_scan=scan, **detection)

    for rank, (score, reason, product) in enumerate(top_matches, start=1):
        RoomRecommendation.objects.create(
            room_scan=scan,
            product=product,
            rank=rank,
            score=round(float(score), 4),
            reason=reason,
        )

    _save_annotated_image(scan, detections)
    scan.save(update_fields=['annotated_image'])

    return {
        'scan_id': scan.id,
        'room_type': room_type,
        'room_style': room_style,
        'detected_objects': [
            {
                'label': detection['label'],
                'confidence': round(detection['confidence'], 2),
                'bbox': [detection['bbox_x'], detection['bbox_y'], detection['bbox_w'], detection['bbox_h']],
                'source': detection['source'],
            }
            for detection in detections
        ],
        'recommendations': [
            {
                'product_id': product.id,
                'name': product.name,
                'slug': product.slug,
                'price': float(product.price),
                'score': round(score, 4),
                'reason': reason,
                'image_url': product.image_url,
                'category': product.category.name if product.category else 'Furniture',
                'stock': product.stock,
                'available': product.available,
            }
            for score, reason, product in top_matches
        ],
        'preview': {
            'annotated_image_url': scan.annotated_image.url if scan.annotated_image else scan.uploaded_image.url,
            'original_image_url': scan.uploaded_image.url,
        },
        'analysis_payload': scan.analysis_payload,
    }