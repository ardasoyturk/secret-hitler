import { getImage } from "astro:assets";
import type { ImageMetadata } from "astro";

const rawAssets = import.meta.glob("../assets/**/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
}) as Record<string, ImageMetadata>;

export async function buildOptimizedAssetMap() {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(rawAssets).map(async ([path, image]) => {
        if (import.meta.env.DEV) {
          return [path.replace("../assets/", ""), image.src] as const;
        }

        const transformed = await getImage({
          src: image,
          format: "webp",
          quality: 82,
        });

        return [path.replace("../assets/", ""), transformed.src] as const;
      }),
    ),
  );
}
