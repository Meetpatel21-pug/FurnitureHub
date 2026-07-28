import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { roomAIAPI } from '../services/api';

const backendBaseUrl = 'http://127.0.0.1:8000';

const fallbackRecommendations = [
  {
    id: 1,
    name: 'Sierra Accent Chair',
    price: 12999,
    image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=420&fit=crop',
    category: 'Living Room',
    slug: 'sierra-accent-chair',
  },
  {
    id: 2,
    name: 'Haven Coffee Table',
    price: 8999,
    image_url: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&h=420&fit=crop',
    category: 'Living Room',
    slug: 'haven-coffee-table',
  },
];

const resolveMediaUrl = (value) => {
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `${backendBaseUrl}${value}`;
};

const RoomAnalyzer = () => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [roomHint, setRoomHint] = useState('');
  const [styleHint, setStyleHint] = useState('');
  const [budget, setBudget] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const previewUrl = useMemo(() => {
    return resolveMediaUrl(analysis?.preview?.annotated_image_url) || imagePreview;
  }, [analysis, imagePreview]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview('');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!imageFile) {
      toast.error('Upload a room image first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    if (budget) formData.append('budget', budget);
    if (styleHint) formData.append('style', styleHint);
    if (roomHint) formData.append('room_hint', roomHint);

    try {
      setAnalyzing(true);
      const response = await roomAIAPI.analyzeRoom(formData);
      setAnalysis(response.data);
      toast.success('Room analysis complete.');
    } catch (error) {
      console.error('Room analysis failed:', error);
      toast.error(error.response?.data?.error || 'Unable to analyze the room image.');
    } finally {
      setAnalyzing(false);
    }
  };

  const detections = analysis?.detected_objects || [];
  const recommendations = analysis?.recommendations?.length ? analysis.recommendations : fallbackRecommendations;

  return (
    <div className="room-ai-page">
      <section className="room-ai-section">
        <div className="container">
          <div className="room-ai-hero mb-5">
            <div className="room-ai-intro">
              <div className="room-ai-card p-4 p-md-5">
                <p className="room-ai-eyebrow text-uppercase fw-semibold mb-2">
                  AI ROOM ANALYZER
                </p>
                <h1 className="room-ai-title display-5 fw-bold mb-3">Upload a room photo and get furniture suggestions instantly.</h1>
                <p className="room-ai-description lead mb-0">
                  The analyzer detects existing furniture, classifies the room type, and ranks matching products from the catalog with visual previews.
                </p>
              </div>
            </div>
            <div className="room-ai-upload">
              <div className="room-ai-card p-4 h-100">
                <form onSubmit={handleSubmit} className="d-grid gap-3">
                  <label className="room-ai-file-picker btn btn-lg py-3 text-start position-relative overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="position-absolute top-0 start-0 w-100 h-100 opacity-0" />
                    <span className="d-block fw-semibold">Choose room image</span>
                    <span className="room-ai-muted d-block small">JPG, PNG, or WebP</span>
                  </label>

                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Room hint"
                        value={roomHint}
                        onChange={(e) => setRoomHint(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Style hint"
                        value={styleHint}
                        onChange={(e) => setStyleHint(e.target.value)}
                      />
                    </div>
                  </div>

                  <input
                    type="number"
                    min="0"
                    className="form-control form-control-lg"
                    placeholder="Budget (optional)"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />

                  <button className="btn btn-primary btn-lg py-3" type="submit" disabled={analyzing}>
                    {analyzing ? 'Analyzing...' : 'Analyze Room'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="room-ai-results">
            <div>
              <div className="room-ai-card rounded-4 p-3 p-md-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h4 text-white mb-1">Room preview</h3>
                    <p className="text-white-50 mb-0">Original image or annotated scan output</p>
                  </div>
                  {analysis && (
                    <div className="badge rounded-pill text-bg-info text-dark px-3 py-2">
                      {analysis.room_type?.replace('_', ' ')}
                    </div>
                  )}
                </div>

                <div className="rounded-4 overflow-hidden border" style={{ minHeight: '360px', background: 'rgba(15,23,42,0.86)', borderColor: 'rgba(255,255,255,0.08)' }}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Room preview" className="w-100 h-100" style={{ objectFit: 'cover', minHeight: '360px' }} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 p-5 text-center text-white-50">
                      Upload a room image to see the preview and detection overlay.
                    </div>
                  )}
                </div>

                {detections.length > 0 && (
                  <div className="mt-4">
                    <h4 className="h5 text-white mb-3">Detected furniture</h4>
                    <div className="d-flex flex-wrap gap-2">
                      {detections.map((item, index) => (
                        <span key={`${item.label}-${index}`} className="badge rounded-pill text-bg-dark border border-light-subtle px-3 py-2">
                          {item.label} · {Math.round((item.confidence || 0) * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="room-ai-card rounded-4 p-3 p-md-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h3 className="h4 text-white mb-1">Suggested furniture</h3>
                    <p className="text-white-50 mb-0">Ranked from the database with fit reasons</p>
                  </div>
                  {analysis?.room_style && (
                    <div className="badge rounded-pill text-bg-light text-dark px-3 py-2">
                      {analysis.room_style}
                    </div>
                  )}
                </div>

                <div className="row g-3">
                  {recommendations.map((product, index) => {
                    const scoreValue = Number(product.score || product.knn_score || 0);
                    return (
                      <div key={`${product.product_id || product.id}-${index}`} className="col-12">
                        <div className="d-flex gap-3 p-3 rounded-4 border" style={{ background: 'rgba(15,23,42,0.7)', borderColor: 'rgba(255,255,255,0.08)' }}>
                          <div style={{ width: '96px', flexShrink: 0 }}>
                            <img
                              src={resolveMediaUrl(product.image_url) || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop'}
                              alt={product.name}
                              className="rounded-3 w-100 h-100"
                              style={{ objectFit: 'cover', aspectRatio: '1 / 1' }}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between gap-3">
                              <div>
                                <div className="text-white-50 small mb-1">{product.category || 'Furniture'}</div>
                                <h4 className="h5 text-white mb-1">{product.name}</h4>
                              </div>
                              <div className="text-end">
                                <div className="fw-bold text-info">₹{Math.round(Number(product.price || 0))}</div>
                                <div className="small text-white-50">Score {scoreValue.toFixed(2)}</div>
                              </div>
                            </div>
                            <p className="text-white-50 small mb-2">{product.reason || 'Best match for the detected room profile.'}</p>
                            <div className="d-flex gap-2 flex-wrap">
                              <Link to={`/products/${product.slug || product.product_id || product.id}`} className="btn btn-sm btn-outline-light">
                                View item
                              </Link>
                              {product.stock !== undefined && (
                                <span className="badge text-bg-secondary align-self-center">Stock: {product.stock}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomAnalyzer;
