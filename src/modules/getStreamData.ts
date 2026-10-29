import { playerStore, setPlayerStore } from '@stores';
import { shuffle } from "@utils";
import { config } from "@config";
import { streamCache } from './audioCache';

const defaultInstances = [
  "https://yt.omada.cafe",
  "https://invidious.schenkel.eti.br",
  "https://invidious.kemonomimi.nl",
  "https://echostreamz.com"
];

function getProxyQueue(): string[] {
  const queue: string[] = [];
  if (config.backupProxy === "custom" && config.customProxyUrl) {
    queue.push(config.customProxyUrl.replace(/\/+$/, ""));
  } else if (config.backupProxy === "omada") {
    queue.push("https://yt.omada.cafe");
  } else if (config.backupProxy === "schenkel") {
    queue.push("https://invidious.schenkel.eti.br");
  } else if (config.backupProxy === "kemonomimi") {
    queue.push("https://invidious.kemonomimi.nl");
  }

  const shuffledDefaults = shuffle(defaultInstances);
  for (const inst of shuffledDefaults) {
    if (!queue.includes(inst)) {
      queue.push(inst);
    }
  }
  return queue;
}

export default async function(
  id: string,
  signal?: AbortSignal
): Promise<Invidious | Record<'error' | 'message', string>> {

  const fetchData = async (proxy: string): Promise<Invidious> => {
    const path = proxy ? '/api/v1/videos/' : '/s/';
    const res = await fetch(proxy + path + id, {
      headers: { 'Accept': 'application/json' },
      signal
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = (await res.json()) as any;

    if (!data || !('adaptiveFormats' in data) || !Array.isArray(data.adaptiveFormats)) {
      throw new Error(data?.error || 'Invalid response: adaptiveFormats missing or not an array');
    }

    if (!data.adaptiveFormats.every((f: { type: string }) => typeof f.type === 'string')) {
      throw new Error('Invalid response: formats missing type property');
    }

    if (!data.adaptiveFormats.some((f: { type: string }) => f.type.startsWith('audio'))) {
      throw new Error('Invalid response: no audio streams found');
    }

    return data as Invidious;
  };

  async function getData() {
    // 0. Primary: Server-side CORS-free proxy through backend
    try {
      const preferredProxy = config.backupProxy === "custom" && config.customProxyUrl ? config.customProxyUrl : "";
      const res = await fetch(`/video-stream?id=${id}${preferredProxy ? `&proxy=${encodeURIComponent(preferredProxy)}` : ""}`, {
        headers: { 'Accept': 'application/json' },
        signal
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data && Array.isArray(data.adaptiveFormats) && data.adaptiveFormats.length > 0) {
          data.proxy = data.proxy || '';
          return data;
        }
      }
    } catch {
      // Continue to external instances
    }

    const instances = getProxyQueue();
    // 1. Try current proxy first if available
    if (playerStore.proxy) {
      const p = playerStore.proxy || instances[0];
      try {
        const data = await fetchData(p);
        data.proxy = p;
        return data;
      } catch (e) {
        console.warn(`Prefetch failed with error ${(e as Error).message} on ${p}, starting retries...`);
      }
    }

    // 2. One by one retry through all instances
    for (const proxy of instances) {
      if (proxy === playerStore.proxy) continue;
      try {
        const data = await fetchData(proxy);
        data.proxy = proxy;
        return data;
      } catch (e) {
        console.warn(`Proxy ${proxy} failed, trying next...`);
      }
    }

    // 3. Last resort: Emergency Fallback (Local Edge Function)
    try {
      console.warn('All proxies failed, attempting emergency fallback...');
      const data = await fetchData('');
      data.proxy = '';
      // reset proxy to use local fallback
      return data;
    } catch (e) {
      console.error('Emergency fallback failed:', e);
    }
  }
  const cached = streamCache.get(id) as Invidious;

  const data = cached || await getData();

  if (data) {
    streamCache.set(id, data);
    setPlayerStore('proxy', data.proxy || '');
    return data;
  }

  return { error: 'All proxies failed', message: 'Failed to fetch stream data from all available instances' };
}
