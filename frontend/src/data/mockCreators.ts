import type { CreatorProfile, CreatorWork } from '../types/creator';

const sec = (m: number, s: number = 0) => m * 60 + s;

function work(partial: CreatorWork): CreatorWork {
  return partial;
}

/** Default dashboard profile when API unavailable — matches reference mock rows */
export const MOCK_CREATOR_PROFILES: CreatorProfile[] = [
  {
    id: 'creator-amaka',
    name: 'Amaka Okoro',
    email: 'amaka@kulthera.africa',
    role: 'Sahel fine artist',
    bio: 'Contemporary canvases reflecting migration and Sahel light.',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1bfa82?auto=format&fit=crop&q=80&w=150',
    country: 'Nigeria',
    paymentPointer: '$ilp.uphold.com/amaka123',
    minutesStreamed: 8,
    webMonetizationUsd: 18.75,
    directTipsUsd: 45.0,
    totalViews: 1330,
    totalAttentionSeconds: sec(1248, 41),
    totalMonetizedSeconds: sec(600, 21),
    works: [
      work({
        id: 'w1',
        title: 'Sahel Ochres Color Study',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=200',
        mediaType: 'painting',
        roomSlug: 'painted-memory',
        roomName: 'Painted Memory',
        views: 221,
        attentionSeconds: sec(229),
        monetizedSeconds: sec(109, 55),
        testSupportUsd: 12.1,
        status: 'live',
      }),
      work({
        id: 'w2',
        title: 'Market Day Intersections',
        thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=200',
        mediaType: 'painting',
        roomSlug: 'painted-memory',
        roomName: 'Painted Memory',
        views: 142,
        attentionSeconds: sec(169),
        monetizedSeconds: sec(81, 7),
        testSupportUsd: 8.9,
        status: 'live',
      }),
    ],
  },
  {
    id: 'creator-kokari',
    name: 'Sani Kokari (The Kokari Walker)',
    email: 'kokari@kultr.dev',
    role: 'Kora master & wandering minstrel',
    bio: 'West African griot traditions on the Kora.',
    avatarUrl: 'https://images.unsplash.com/photo-1531384370597-859faa8ce332?auto=format&fit=crop&q=80&w=150',
    country: 'Mali',
    paymentPointer: '$ilp.interledger-test.dev/kokari_walker',
    minutesStreamed: 42,
    webMonetizationUsd: 64.37,
    directTipsUsd: 22.5,
    totalViews: 890,
    totalAttentionSeconds: sec(520, 0),
    totalMonetizedSeconds: sec(310, 0),
    works: [
      work({
        id: 'w3',
        title: 'Footsteps in the Dust',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=200',
        mediaType: 'audio',
        mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        roomSlug: 'sound-roots',
        roomName: 'Sound Roots',
        views: 310,
        attentionSeconds: sec(280),
        monetizedSeconds: sec(140),
        testSupportUsd: 18.2,
        status: 'live',
      }),
      work({
        id: 'w4',
        title: 'Nightfall at the Oasis',
        thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=200',
        mediaType: 'audio',
        mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        roomSlug: 'sound-roots',
        roomName: 'Sound Roots',
        views: 198,
        attentionSeconds: sec(150, 12),
        monetizedSeconds: sec(62, 30),
        testSupportUsd: 6.44,
        status: 'live',
      }),
    ],
  },
  {
    id: 'creator-noura',
    name: 'Noura Bello',
    email: 'noura@kulthera.africa',
    role: 'Community storyteller',
    bio: 'Oral histories and festival memory from Ghana.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    country: 'Ghana',
    paymentPointer: 'https://wallet.interledger-test.dev/noura-bello',
    minutesStreamed: 15,
    webMonetizationUsd: 12.0,
    directTipsUsd: 8.0,
    totalViews: 420,
    totalAttentionSeconds: sec(180),
    totalMonetizedSeconds: sec(90),
    works: [
      work({
        id: 'w5',
        title: 'Festival Season Memory',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200',
        mediaType: 'story',
        roomSlug: 'living-stories',
        roomName: 'Living Stories',
        timelineTag: 'Oral history essay',
        narrative: 'Returning home for festival season — songs, cloth, and road dust.',
        location: 'Ghana',
        language: 'English / Akan',
        views: 88,
        attentionSeconds: sec(65, 20),
        monetizedSeconds: sec(31, 22),
        testSupportUsd: 3.23,
        status: 'live',
      }),
    ],
  },
  // Reference-style LIM creators (for analytics list demos)
  {
    id: 'creator-mina',
    name: 'Mina Alvarez',
    email: 'mina@lim.demo',
    role: 'Generative artist',
    bio: 'Browser-native visual systems.',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
    country: 'Global',
    paymentPointer: '$ilp.interledger-test.dev/mina',
    minutesStreamed: 120,
    webMonetizationUsd: 24.5,
    directTipsUsd: 10.0,
    totalViews: 450,
    totalAttentionSeconds: sec(400),
    totalMonetizedSeconds: sec(200),
    works: [
      work({
        id: 'lim-1',
        title: 'One Button Orbit',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=200',
        mediaType: 'image',
        roomSlug: 'generative-dreams',
        roomName: 'Generative Dreams',
        views: 221,
        attentionSeconds: sec(229),
        monetizedSeconds: sec(109, 55),
        testSupportUsd: 12.1,
        status: 'live',
      }),
      work({
        id: 'lim-2',
        title: 'Garden Debugger',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=200',
        mediaType: 'image',
        roomSlug: 'generative-dreams',
        roomName: 'Generative Dreams',
        views: 119,
        attentionSeconds: sec(119, 10),
        monetizedSeconds: sec(57, 12),
        testSupportUsd: 6.41,
        status: 'live',
      }),
    ],
  },
  {
    id: 'creator-yemi',
    name: 'Yemi Okafor',
    email: 'yemi@lim.demo',
    role: 'Sound artist',
    bio: 'Audio objects that bloom slowly.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    country: 'Nigeria',
    paymentPointer: '$ilp.interledger-test.dev/yemi',
    minutesStreamed: 95,
    webMonetizationUsd: 18.0,
    directTipsUsd: 5.0,
    totalViews: 380,
    totalAttentionSeconds: sec(350),
    totalMonetizedSeconds: sec(170),
    works: [
      work({
        id: 'lim-3',
        title: 'Midnight Lagoon',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=200',
        mediaType: 'audio',
        mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        roomSlug: 'sound-roots',
        roomName: 'Sound Garden',
        views: 142,
        attentionSeconds: sec(169),
        monetizedSeconds: sec(81, 7),
        testSupportUsd: 8.9,
        status: 'live',
      }),
      work({
        id: 'lim-4',
        title: 'River of Packets',
        thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200',
        mediaType: 'audio',
        mediaUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        roomSlug: 'sound-roots',
        roomName: 'Sound Garden',
        views: 150,
        attentionSeconds: sec(150, 12),
        monetizedSeconds: sec(62, 30),
        testSupportUsd: 6.44,
        status: 'live',
      }),
    ],
  },
];

export const MUSEUM_ROOMS = [
  {
    slug: 'sound-roots',
    name: 'Sound Roots',
    tagline: 'Rhythms, griot traditions, and voices across the continent',
    exhibits: 3,
    visitors: 18,
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=900',
  },
  {
    slug: 'painted-memory',
    name: 'Painted Memory',
    tagline: 'Contemporary canvases and Sahel-inspired colour studies',
    exhibits: 3,
    visitors: 31,
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=900',
  },
  {
    slug: 'artifact-house',
    name: 'Artifact House',
    tagline: 'Bronze, textile, and ceremonial objects as living archives',
    exhibits: 2,
    visitors: 42,
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=900',
  },
  {
    slug: 'living-stories',
    name: 'Living Stories',
    tagline: 'Oral histories, essays, and community memory',
    exhibits: 2,
    visitors: 15,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=900',
  },
] as const;

export function getMockCreatorById(id: string): CreatorProfile | undefined {
  return MOCK_CREATOR_PROFILES.find((c) => c.id === id);
}

export function getMockCreatorForUser(email: string, name: string): CreatorProfile {
  const match = MOCK_CREATOR_PROFILES.find(
    (c) => c.email.toLowerCase() === email.toLowerCase()
  );
  if (match) return { ...match };

  return {
    ...MOCK_CREATOR_PROFILES[0],
    id: `creator-${email}`,
    name: name || 'New Creator',
    email,
    works: [],
    minutesStreamed: 0,
    webMonetizationUsd: 0,
    directTipsUsd: 0,
    totalViews: 0,
    totalAttentionSeconds: 0,
    totalMonetizedSeconds: 0,
  };
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
