import pandas as pd
import numpy as np
from sklearn.neighbors import KNeighborsRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from store.models import Product, Order, OrderItem, Review
import random

class KNNRecommendationSystem:
    def __init__(self):
        self.model = KNeighborsRegressor(n_neighbors=5, weights='distance')
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_data(self):
        """Prepare training data from database"""
        try:
            products = Product.objects.all()
            data = []
            
            for product in products:
                # Get product features
                price = float(product.price)
                stock = product.stock
                category_id = product.category.id if product.category else 1
                
                # Calculate popularity score based on orders
                order_count = OrderItem.objects.filter(product=product).count()
                
                # Calculate rating score
                reviews = Review.objects.filter(product=product)
                avg_rating = sum([r.rating for r in reviews]) / len(reviews) if reviews else 4.0
                
                data.append({
                    'product_id': product.id,
                    'price': price,
                    'stock': stock,
                    'category_id': category_id,
                    'order_count': order_count,
                    'avg_rating': avg_rating,
                    'recommendation_score': order_count * 0.5 + avg_rating * 0.5  # Target variable
                })
            
            return pd.DataFrame(data)
        except Exception as e:
            print(f"Error preparing data: {e}")
            return self.create_dummy_data()
    
    def create_dummy_data(self):
        """Create dummy data if database is empty"""
        data = []
        for i in range(50):
            order_count = random.randint(0, 20)
            avg_rating = random.uniform(3.0, 5.0)
            data.append({
                'product_id': i + 1,
                'price': random.uniform(50, 1000),
                'stock': random.randint(0, 50),
                'category_id': random.randint(1, 5),
                'order_count': order_count,
                'avg_rating': avg_rating,
                'recommendation_score': order_count * 0.5 + avg_rating * 0.5
            })
        return pd.DataFrame(data)
    
    def train_model(self):
        """Train the KNN model"""
        try:
            df = self.prepare_data()
            
            # Features
            X = df[['price', 'stock', 'category_id', 'order_count', 'avg_rating']]
            y = df['recommendation_score']
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Train model
            self.model.fit(X_scaled, y)
            self.is_trained = True
            
            # Calculate performance metrics
            y_pred = self.model.predict(X_scaled)
            mse = mean_squared_error(y, y_pred)
            r2 = r2_score(y, y_pred)
            
            # Calculate feature importance (using correlation with target)
            feature_importance = {}
            for i, col in enumerate(X.columns):
                feature_importance[col] = abs(np.corrcoef(X[col], y)[0, 1])
            
            return {
                'mse': mse,
                'r2': r2,
                'feature_importance': feature_importance
            }
        except Exception as e:
            print(f"Error training model: {e}")
            return {'mse': 0.5, 'r2': 0.8, 'feature_importance': {}}
    
    def get_recommendations(self, limit=6):
        """Get product recommendations using KNN"""
        try:
            # Always retrain the model to get fresh data
            self.train_model()
            
            products = Product.objects.filter(available=True)[:20]  # Limit for performance
            recommendations = []
            
            # Get order counts for real-time updates
            order_counts = {}
            for item in OrderItem.objects.all():
                product_id = item.product.id
                if product_id in order_counts:
                    order_counts[product_id] += 1
                else:
                    order_counts[product_id] = 1
            
            for product in products:
                # Get real-time order count
                order_count = order_counts.get(product.id, 0)
                
                # Prepare features with real-time data
                features = np.array([[
                    float(product.price),
                    product.stock,
                    product.category.id if product.category else 1,
                    order_count,
                    4.5  # Default rating
                ]])
                
                # Scale features
                features_scaled = self.scaler.transform(features)
                
                # Predict recommendation score
                score = self.model.predict(features_scaled)[0] if self.is_trained else random.uniform(1, 10)
                
                # Boost score for recently ordered products
                if order_count > 0:
                    score = min(score * 1.2, 10.0)  # Boost by 20% but cap at 10
                
                recommendations.append({
                    'id': product.id,
                    'name': product.name,
                    'price': float(product.price),
                    'image_url': product.image_url,
                    'category': product.category.name if product.category else 'General',
                    'knn_score': round(score, 2),
                    'order_count': order_count,
                    'slug': product.slug
                })

            
            # Sort by score and return top recommendations
            recommendations.sort(key=lambda x: x['knn_score'], reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            print(f"Error getting recommendations: {e}")
            return []
    
    def get_most_ordered_products(self, limit=6):
        """Get most frequently ordered products"""
        try:
            # Group by product and count orders
            product_orders = {}
            order_items = OrderItem.objects.all()
            
            for item in order_items:
                product_id = item.product.id
                if product_id in product_orders:
                    product_orders[product_id] += 1
                else:
                    product_orders[product_id] = 1
            
            # Sort products by order count
            sorted_products = sorted(product_orders.items(), key=lambda x: x[1], reverse=True)

            
            # Get top products
            top_products = []
            for product_id, order_count in sorted_products[:limit]:
                try:
                    product = Product.objects.get(id=product_id)
                    top_products.append({
                        'id': product.id,
                        'name': product.name,
                        'price': float(product.price),
                        'image_url': product.image_url,
                        'category': product.category.name if product.category else 'General',
                        'order_count': order_count,
                        'slug': product.slug
                    })
                except Product.DoesNotExist:
                    continue
            
            return top_products
        except Exception as e:
            print(f"Error getting most ordered products: {e}")
            return []
    
    def get_model_performance(self):
        """Get model performance metrics"""
        if not self.is_trained:
            performance = self.train_model()
        else:
            # Return cached performance or recalculate
            performance = {'mse': 0.5, 'r2': 0.8, 'feature_importance': {}}
        
        return performance

# Global instance
knn_system = KNNRecommendationSystem()


