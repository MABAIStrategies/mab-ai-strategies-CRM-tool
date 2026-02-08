import { defaultBrandingAssets, type BrandingAssets } from "./branding-assets";

const assetFrom = (asset: Partial<{ uri: string; storageUri?: string }> | undefined, fallback: { uri: string; storageUri?: string }) => ({
  uri: asset?.uri ?? fallback.uri,
  storageUri: asset?.storageUri ?? fallback.storageUri
});

const paletteFrom = (palette: Partial<BrandingAssets["palette"]> | undefined) => ({
  navy: palette?.navy ?? defaultBrandingAssets.palette.navy,
  gold: palette?.gold ?? defaultBrandingAssets.palette.gold,
  ivory: palette?.ivory ?? defaultBrandingAssets.palette.ivory,
  ink: palette?.ink ?? defaultBrandingAssets.palette.ink,
  slate: palette?.slate ?? defaultBrandingAssets.palette.slate
});

const normalizeBrandingAssets = (payload: Partial<BrandingAssets> | null | undefined): BrandingAssets => {
  if (!payload) {
    return defaultBrandingAssets;
  }

  return {
    logo: {
      primary: assetFrom(payload.logo?.primary, defaultBrandingAssets.logo.primary),
      mark: assetFrom(payload.logo?.mark, defaultBrandingAssets.logo.mark)
    },
    headshot: assetFrom(payload.headshot, defaultBrandingAssets.headshot),
    palette: paletteFrom(payload.palette)
  };
};

export async function getBrandingAssets(): Promise<BrandingAssets> {
  const endpoint = process.env.MAB_BRANDING_MCP_URL;
  if (!endpoint) {
    return defaultBrandingAssets;
  }

  const token = process.env.MAB_BRANDING_MCP_TOKEN;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return defaultBrandingAssets;
  }

  const payload = (await response.json()) as Partial<BrandingAssets> | { assets?: Partial<BrandingAssets> };
  const assets = "assets" in payload ? payload.assets : payload;
  return normalizeBrandingAssets(assets);
}
