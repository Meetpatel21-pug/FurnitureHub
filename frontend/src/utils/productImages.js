/**
 * Helper utility to resolve the correct product image URL based on
 * uploaded image file, custom URL, or product name/category matching.
 */

const DEFAULT_IMAGES = {
  coffeeTable: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&fit=crop',
  sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&fit=crop',
  wardrobe: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&fit=crop',
  desk: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&fit=crop',
  recliner: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&fit=crop',
  nightstand: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&fit=crop',
  bed: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&fit=crop',
  bookshelf: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800&fit=crop',
  dining: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&fit=crop',
};

export const getProductImage = (product) => {
  if (!product) return DEFAULT_IMAGES.sofa;

  const DEFAULT_SOFA_ID = 'photo-1555041469-a586c61ea9bc';
  const nameLower = (product.name || '').toLowerCase();
  const catLower = (typeof product.category === 'string' ? product.category : product.category?.name || '').toLowerCase();
  const rawUrl = product.image || product.image_url;

  // If rawUrl is customized and not the generic sofa fallback (unless product is actually a sofa)
  if (
    rawUrl &&
    (!rawUrl.includes(DEFAULT_SOFA_ID) || nameLower.includes('sofa') || nameLower.includes('couch'))
  ) {
    return rawUrl;
  }

  // Matching by name keywords
  if (nameLower.includes('coffee') || nameLower.includes('center table') || nameLower.includes('table set')) {
    return DEFAULT_IMAGES.coffeeTable;
  }
  if (nameLower.includes('wardrobe') || nameLower.includes('closet')) {
    return DEFAULT_IMAGES.wardrobe;
  }
  if (nameLower.includes('desk') || nameLower.includes('office') || catLower.includes('office')) {
    return DEFAULT_IMAGES.desk;
  }
  if (
    nameLower.includes('recliner') ||
    nameLower.includes('armchair') ||
    (nameLower.includes('chair') && !nameLower.includes('office'))
  ) {
    return DEFAULT_IMAGES.recliner;
  }
  if (nameLower.includes('nightstand') || nameLower.includes('bedside')) {
    return DEFAULT_IMAGES.nightstand;
  }
  if (nameLower.includes('bed') || catLower.includes('bedroom')) {
    return DEFAULT_IMAGES.bed;
  }
  if (nameLower.includes('bookshelf') || nameLower.includes('bookcase') || catLower.includes('storage')) {
    return DEFAULT_IMAGES.bookshelf;
  }
  if (nameLower.includes('dining') || catLower.includes('dining')) {
    return DEFAULT_IMAGES.dining;
  }
  if (nameLower.includes('sofa') || nameLower.includes('couch') || catLower.includes('living')) {
    return DEFAULT_IMAGES.sofa;
  }

  return rawUrl || DEFAULT_IMAGES.sofa;
};
