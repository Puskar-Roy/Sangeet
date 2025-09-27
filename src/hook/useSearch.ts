
import { useQuery } from '@tanstack/react-query';

export type RawVideo = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: string;
  url?: string;
  channel?: string;
};

export type CleanVideo = {
  id: string;
  originalTitle: string;
  title: string; 
  description: string;
  thumbnail: string;
  duration?: string;
  url?: string;
  channel?: string;
};

export function extractYoutubeId(input?: string): string | null {
  if (!input) return null;
  if (/^[A-Za-z0-9_-]{8,20}$/.test(input)) return input;
  try {
    const url = new URL(input);
    //@ts-ignore
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1);
    //@ts-ignore
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v');
  } catch {}
  const match = input.match(/\/vi\/([A-Za-z0-9_-]{8,20})\//);
  return match ? match[1] : null;
}

export function getYoutubeThumbnail(raw?: string, id?: string): string {
  const vid = extractYoutubeId(raw) || extractYoutubeId(id);
  return vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : raw ?? '';
}

export function shortenDescription(desc?: string, max = 120): string {
  if (!desc) return '';
  const cleaned = desc.replace(/\s+/g, ' ').trim();
  return cleaned.length > max
    ? cleaned.slice(0, max - 1).trim() + '…'
    : cleaned;
}


export function trimTitle(original = '', max = 60): string {
  const t = original.trim();
  if (t.length <= max) return t;
  const breakChars = [' - ', ' | ', ' — ', ' – ', ': '];
  for (const bp of breakChars) {
    const idx = t.indexOf(bp);
    if (idx > 10 && idx < max) {
      return t.slice(0, idx).trim();
    }
  }
 
  return t.slice(0, max - 1).trim() + '…';
}

export function normalizeVideos(videos: RawVideo[] = []): CleanVideo[] {
  return videos.map(v => ({
    id: v.id,
    originalTitle: v.title ?? '',
    title: trimTitle(v.title ?? '', 60),
    description: shortenDescription(v.description, 120),
    thumbnail: getYoutubeThumbnail(v.thumbnail, v.id),
    duration: v.duration,
    url: v.url,
    channel: v.channel,
  }));
}

export function useMusicSearch(query: string) {
  return useQuery({
    queryKey: ['music', 'search', query],
    queryFn: async () => {
      const res = await fetch(
        `https://audio.poolu.fun/api/v0.1/music/search/?q=${encodeURIComponent(
          query,
        )}`,
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json() as Promise<{ query: string; videos: RawVideo[] }>;
    },
    enabled: !!query,
    select: data => ({
      ...data,
      cleaned: normalizeVideos(data.videos),
    }),
    staleTime: 1000 * 60,
  });
}
