import type { CreatorUploadDraft, CreatorWork } from '../types/creator';

const UPLOADS_KEY = 'kultr_creator_uploads';
const POINTER_KEY = 'kultr_creator_payment_pointer';

export function getUploadsKey(userId: string): string {
  return `${UPLOADS_KEY}_${userId}`;
}

export function loadPendingUploads(userId: string): CreatorUploadDraft[] {
  try {
    const raw = localStorage.getItem(getUploadsKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePendingUpload(draft: CreatorUploadDraft, userId: string): void {
  const list = loadPendingUploads(userId);
  list.unshift(draft);
  localStorage.setItem(getUploadsKey(userId), JSON.stringify(list));
}

export function draftToWork(draft: CreatorUploadDraft): CreatorWork {
  const isAudio = draft.fileType === 'audio';
  return {
    id: draft.id,
    title: draft.title,
    thumbnailUrl: isAudio
      ? 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=200'
      : draft.objectUrl,
    mediaType: isAudio ? 'audio' : 'painting',
    mediaUrl: isAudio ? draft.objectUrl : draft.objectUrl,
    roomSlug: draft.roomName.toLowerCase().replace(/\s+/g, '-'),
    roomName: draft.roomName,
    narrative: draft.narrative,
    views: 0,
    attentionSeconds: 0,
    monetizedSeconds: 0,
    testSupportUsd: 0,
    status: 'pending_review',
  };
}

export function loadPaymentPointer(userId: string, fallback: string): string {
  return localStorage.getItem(`${POINTER_KEY}_${userId}`) || fallback;
}

export function savePaymentPointer(userId: string, pointer: string): void {
  localStorage.setItem(`${POINTER_KEY}_${userId}`, pointer);
}
