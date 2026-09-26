import { create } from './zustand';
import { api } from '../services/api';

export interface SiteConfig {
  brand_name: string;
  brand_tagline: string;
  brand_logo_url: string;
  primary_color: string;
  accent_color: string;
  background_color: string;

  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_cta_text: string;
  hero_cta_sub: string;
  hero_media_url: string;
  hero_media_type: 'video' | 'image';

  features_title: string;
  features_subtitle: string;

  cta_banner_title: string;
  cta_banner_subtitle: string;
  cta_button_text: string;

  footer_copyright: string;

  studio_banner_text: string;
  studio_accent_color: string;
  studio_watermark_enabled: boolean;
  studio_watermark_text: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brand_name: 'GBEST',
  brand_tagline: 'STUDIO',
  brand_logo_url: '',
  primary_color: '#FFD21F',
  accent_color: '#3B82F6',
  background_color: '#111111',

  hero_badge: 'AI-Powered Video Creation Platform',
  hero_title: 'Create Viral Videos in Seconds',
  hero_subtitle:
    'GBEST Studio gives creators, influencers, and brands the ultimate AI toolkit: precise speech captions, auto-silence cutter, dynamic canvas styling, and instant high-res export.',
  hero_cta_text: 'Launch Studio Editor',
  hero_cta_sub: 'Free forever · No credit card required',
  hero_media_url:
    'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4',
  hero_media_type: 'video',

  features_title: 'Professional Studio Tools. Zero Learning Curve.',
  features_subtitle:
    'Everything you need to produce broadcast-ready social videos right in your browser.',

  cta_banner_title: 'Ready to Produce Viral Content?',
  cta_banner_subtitle:
    'Join creators worldwide creating captivating reels, shorts, and TikToks with GBEST Studio.',
  cta_button_text: 'Open Studio Editor Now',

  footer_copyright: '© 2026 GBEST Studio. All rights reserved.',

  studio_banner_text: 'GBEST STUDIO',
  studio_accent_color: '#FFD21F',
  studio_watermark_enabled: false,
  studio_watermark_text: 'GBEST Studio',
};

const applyBrandingToCss = (cfg: Partial<SiteConfig>) => {
  if (typeof document !== 'undefined') {
    if (cfg.primary_color) {
      document.documentElement.style.setProperty('--color-primary', cfg.primary_color);
    }
  }
};

interface SiteConfigState {
  config: SiteConfig;
  isLoading: boolean;
  isSaving: boolean;
  fetchConfig: () => Promise<void>;
  updateConfigField: <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => void;
  setFullConfig: (cfg: Partial<SiteConfig>) => void;
  saveConfig: () => Promise<boolean>;
  resetToDefaults: () => void;
}

export const useSiteConfigStore = create<SiteConfigState>((set, get) => ({
  config: (() => {
    try {
      const cached = localStorage.getItem('gbest_site_config');
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...DEFAULT_SITE_CONFIG, ...parsed };
      }
    } catch {}
    return { ...DEFAULT_SITE_CONFIG };
  })(),
  isLoading: false,
  isSaving: false,

  fetchConfig: async () => {
    set({ isLoading: true });
    try {
      const remoteConfig = await api.getSiteConfig();
      if (remoteConfig && Object.keys(remoteConfig).length > 0) {
        const merged = { ...DEFAULT_SITE_CONFIG, ...remoteConfig };
        try {
          localStorage.setItem('gbest_site_config', JSON.stringify(merged));
        } catch {}
        applyBrandingToCss(merged);
        set({ config: merged });
      }
    } catch (err) {
      console.warn('Failed to fetch remote site config:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  updateConfigField: (key, value) => {
    set((state) => {
      const updated = { ...state.config, [key]: value };
      applyBrandingToCss(updated);
      try {
        localStorage.setItem('gbest_site_config', JSON.stringify(updated));
      } catch {}
      return { config: updated };
    });
  },

  setFullConfig: (cfg) => {
    set((state) => {
      const updated = { ...state.config, ...cfg };
      applyBrandingToCss(updated);
      try {
        localStorage.setItem('gbest_site_config', JSON.stringify(updated));
      } catch {}
      return { config: updated };
    });
  },

  saveConfig: async () => {
    set({ isSaving: true });
    try {
      const currentConfig = get().config;
      await api.updateSiteConfig(currentConfig);
      try {
        localStorage.setItem('gbest_site_config', JSON.stringify(currentConfig));
      } catch {}
      return true;
    } catch (err) {
      console.error('Failed to save site config to backend:', err);
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  resetToDefaults: () => {
    set({ config: { ...DEFAULT_SITE_CONFIG } });
    try {
      localStorage.setItem('gbest_site_config', JSON.stringify(DEFAULT_SITE_CONFIG));
    } catch {}
    applyBrandingToCss(DEFAULT_SITE_CONFIG);
  },
}));
