export interface Room {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
}

export interface Creator {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  walletAddress: string;
  country: string;
  language: string;
  email?: string;
}

export type MediaType = 'audio' | 'painting' | 'artifact' | 'story';

export interface License {
  id: string;
  copyrightOwner: string;
  licenseType: string;
  usagePermissions: string;
  commercialUseAllowed: boolean;
  attributionRequired: boolean;
  takedownContact: string;
  visibilityLevel: 'public' | 'educational' | 'restricted' | 'private';
  culturalRestrictionNotes?: string;
}

export interface Exhibit {
  id: string;
  roomId: string;
  creatorId: string;
  creator?: Creator;
  title: string;
  description: string;
  culturalContext: string;
  mediaType: MediaType;
  mediaUrl: string;
  previewUrl: string;
  walletAddress: string;
  country: string;
  region: string;
  languageCode: string;
  tags: string[];
  licenseId?: string;
  license?: License;
  displayOrder: number;
}

export interface ViewSession {
  id: string;
  visitorSessionId: string;
  exhibitId: string;
  creatorId: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  monetizedSeconds: number;
  lastMonetizationState: string;
}
