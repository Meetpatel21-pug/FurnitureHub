# AI Room Recommendation System Design

This project can support an image-driven furniture assistant that lets a user upload a room photo, analyzes the scene, and recommends furniture items from the existing catalog.

## Goals

- Detect existing furniture in a room image.
- Classify the room type, such as living room, bedroom, dining room, or office.
- Recommend suitable product suggestions from the database.
- Return a response that includes suggestions, confidence scores, and visual previews.

## High-Level Flow

1. User uploads a room image from the frontend.
2. Backend stores the image and sends it to the vision pipeline.
3. YOLO detects objects already present in the room.
4. A CNN classifies the room type and style cues.
5. A recommendation engine ranks products from the furniture database.
6. The frontend renders detected objects, recommended products, and preview cards.

## Suggested Architecture

### 1. Image Intake Layer

- New endpoint: `POST /api/ai/room-analyze/`
- Accepts multipart image upload plus optional preferences:
  - budget
  - style preference
  - room size
  - room purpose

### 2. Vision Inference Layer

#### YOLO Object Detection

- Detect furniture and layout objects already in the room.
- Example classes: sofa, bed, table, chair, lamp, wardrobe, rug, shelf, TV unit.
- Output bounding boxes, labels, and confidence scores.

#### CNN Room Classification

- Classify the room into a room type and optionally a style family.
- Example room types: living room, bedroom, dining room, study, office, kitchen.
- Example style tags: modern, minimal, classic, industrial, Scandinavian.

### 3. Recommendation Layer

Use a hybrid recommender instead of only one algorithm.

- Content-based filtering:
  - Match detected room type with product category.
  - Match style tags with product metadata.
  - Match color, material, and price range when available.
- KNN / similarity ranking:
  - Rank products using embeddings or structured features from the catalog.
- Business rules:
  - Exclude out-of-stock products.
  - Prefer complementary items to already detected furniture.
  - Respect the user budget and room size.

The current backend already has a KNN recommender in `backend/knn_recommendations.py`, so the new system can reuse that pattern and add image-derived features before ranking.

## Recommended Data Model Extensions

Add persistent records for image analysis results:

- `RoomScan`
  - user
  - uploaded_image
  - room_type
  - style_label
  - created_at
- `DetectedObject`
  - room_scan
  - label
  - confidence
  - bbox_x
  - bbox_y
  - bbox_w
  - bbox_h
- `RoomRecommendation`
  - room_scan
  - product
  - rank
  - score
  - reason

These records make it possible to show analysis history and improve the models later.

## API Contract

### Request

`POST /api/ai/room-analyze/`

Form data:

- `image`: uploaded room photo
- `budget`: optional number
- `style`: optional string
- `room_hint`: optional string

### Response

```json
{
  "scan_id": 42,
  "room_type": "living_room",
  "room_style": "modern",
  "detected_objects": [
    {
      "label": "sofa",
      "confidence": 0.96,
      "bbox": [120, 88, 340, 210]
    }
  ],
  "recommendations": [
    {
      "product_id": 11,
      "name": "Luna Corner Sofa",
      "price": 24999,
      "score": 0.91,
      "reason": "Matches living room, modern style, and complements existing sofa layout.",
      "image_url": "/media/products/luna-sofa.jpg"
    }
  ],
  "preview": {
    "annotated_image_url": "/media/scans/room-42-annotated.jpg"
  }
}
```

## Model Strategy

### Phase 1: Baseline

- Use a pretrained YOLO model for object detection.
- Use a pretrained CNN classifier fine-tuned on room categories.
- Use the existing KNN recommender on catalog metadata.

### Phase 2: Better Ranking

- Convert room images into embeddings with a vision encoder.
- Combine embeddings with catalog product features.
- Train a ranking model that learns which products were clicked, saved, or purchased after room analysis.

### Phase 3: Feedback Loop

- Track clicks on recommended products.
- Track add-to-cart and purchase events.
- Retrain the recommendation layer using user interaction data.

## Visual Preview Experience

The frontend should show:

- the uploaded room image
- object detection overlays
- the predicted room type and style
- recommended items with product thumbnails
- a comparison panel showing how each suggestion fits the scene

For the preview, the backend can return an annotated image URL or a list of bounding boxes so the frontend can draw overlays itself.

## Frontend Pages

Suggested UI pieces:

- Room upload page
- Analysis results page
- Detected furniture overlay canvas
- Recommended products carousel
- Replace-this-item suggestions for each detected object

## Backend Integration Points

This design fits the current Django app by extending:

- `backend/store/views.py` for the upload endpoint
- `backend/store/urls.py` for routing
- `backend/store/models.py` for scan history
- `backend/knn_recommendations.py` for ranking logic reuse

## Implementation Notes

- Validate image type and size before inference.
- Store images in `MEDIA_ROOT` and delete temporary files after processing.
- Run inference asynchronously if model latency is high.
- Cache results for repeated uploads of the same image hash.
- Always filter recommendations by availability and stock.

## Minimal MVP Scope

If you want the smallest working version, implement only:

- room image upload
- YOLO detection
- room type classification
- top 6 product recommendations
- annotated image preview

That gives a usable end-to-end flow without needing a fully trained ranking model on day one.