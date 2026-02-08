"use client";

import { useEffect, useState } from "react";
import { defaultBrandingAssets, type BrandingAssets } from "../lib/branding-assets";

export function useBrandingAssets() {
  const [assets, setAssets] = useState<BrandingAssets>(defaultBrandingAssets);

  useEffect(() => {
    let isMounted = true;

    const loadAssets = async () => {
      try {
        const response = await fetch("/api/branding", { method: "GET" });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { assets?: BrandingAssets };
        if (isMounted && data.assets) {
          setAssets(data.assets);
        }
      } catch (error) {
        console.warn("Unable to load branding assets.", error);
      }
    };

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  return { assets };
}
