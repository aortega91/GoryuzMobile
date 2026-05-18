export type SecondLifeStatus = 'sale' | 'gift' | 'trade' | 'sold' | 'gifted' | 'traded';

export interface ActivityLogEntry {
  timestamp: string | Date;
  description: string;
}

export interface SecondLifeItem {
  id: string;
  name: string;
  category: string;
  imageData: string | null;
  status: SecondLifeStatus;
  price?: string;
  conditionDescription: string | null;
  activityLog: ActivityLogEntry[];
}

export interface MarketplaceOwner {
  id: string;
  name: string | null;
  nickname: string | null;
  avatarUrl: string | null;
}

export interface MarketplaceItem extends SecondLifeItem {
  owner: MarketplaceOwner;
}
