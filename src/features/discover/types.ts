export interface RecommendedItem {
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  purchaseUrl: string;
}

export interface IdentifiedItem {
  name: string;
  category: string;
}

export interface SourceChunk {
  web: { uri: string; title: string };
}
