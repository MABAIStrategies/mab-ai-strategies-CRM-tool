export type BrandAsset = {
  uri: string;
  storageUri?: string;
};

export type BrandingPalette = {
  navy: string;
  gold: string;
  ivory: string;
  ink: string;
  slate: string;
};

export type BrandingAssets = {
  logo: {
    primary: BrandAsset;
    mark: BrandAsset;
  };
  headshot: BrandAsset;
  palette: BrandingPalette;
};

export const defaultBrandingAssets: BrandingAssets = {
  logo: {
    primary: { uri: "/branding/mab-logo.svg", storageUri: "public/branding/mab-logo.svg" },
    mark: { uri: "/branding/mab-logo.svg", storageUri: "public/branding/mab-logo.svg" }
  },
  headshot: {
    uri: "/branding/mab-headshot.svg",
    storageUri: "public/branding/mab-headshot.svg"
  },
  palette: {
    navy: "#0B1B2B",
    gold: "#D4AF37",
    ivory: "#F6F2EA",
    ink: "#0F172A",
    slate: "#334155"
  }
};
