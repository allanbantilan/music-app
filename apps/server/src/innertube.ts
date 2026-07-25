import { Innertube } from 'youtubei.js';

let instance: Innertube | null = null;

export async function getInnertube(): Promise<Innertube> {
  if (!instance) {
    instance = await Innertube.create({
      lang: 'en',
      location: 'US',
    });
  }
  return instance;
}
