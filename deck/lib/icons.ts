import manifest from "./icon-manifest.json";

const icons: Record<string, string> = manifest;

export const getIcon = (name: string): string | null => {
  if (!icons[name]) {
    console.warn(`Unknown icon '${name}'`);
    return null;
  }
  return icons[name];
};
