/** Creator & exhibit models aligned with reference UI (LIM / Kulthera) */

export type MediaType = 'audio' | 'image' | 'story' | 'artifact' | 'painting';

export type ExhibitStatus = 'live' | 'pending_review';

export interface CreatorWork {
  id: string;
  title: string;
  thumbnailUrl: string;
  mediaType: MediaType;
  mediaUrl?: string;
  roomSlug: string;
  roomName: string;
  timelineTag?: string;
  narrative?: string;
  location?: string;
  language?: string;
  views: number;
  attentionSeconds: number;
  monetizedSeconds: number;
  testSupportUsd: number;
  status: ExhibitStatus;
}

export interface CreatorProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatarUrl: string;
  country: string;
  paymentPointer: string;
  minutesStreamed: number;
  webMonetizationUsd: number;
  directTipsUsd: number;
  totalViews: number;
  totalAttentionSeconds: number;
  totalMonetizedSeconds: number;
  works: CreatorWork[];
}

export interface CreatorUploadDraft {
  id: string;
  fileName: string;
  fileType: 'image' | 'audio';
  objectUrl: string;
  title: string;
  narrative: string;
  roomName: string;
  submittedAt: string;
  status: 'pending_review';
}

export interface DashboardTotals {
  totalViews: number;
  totalAttentionSeconds: number;
  totalMonetizedSeconds: number;
  testSupportUsd: number;
}
