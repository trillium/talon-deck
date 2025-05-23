// Dynamically import all icons in the ./icons folder
const iconFiles = import.meta.glob("./icons/**/*.{png,jpg,jpeg,gif,svg,webp}", { eager: true });

const icons: { [key: string]: string } = {};

// Load all icons into the `icons` object
Object.keys(iconFiles).forEach((path) => {
  // Create a name for each icon by stripping out the directory and extension
  const name = path.substring(path.lastIndexOf("/") + 1, path.lastIndexOf("."));

  // Check for duplicate names
  if (icons[name]) {
    throw new Error(`Duplicate icon with name '${name}'`);
  }

  // Store the icon path in the `icons` object
  const module = iconFiles[path] as { default: string };
  icons[name] = module.default || path; // Use `default` if available, fallback to path
});

export const getIcon = (name: string) => {
  if (!icons[name]) {
    console.warn(`Unknown icon '${name}'`);
    return null;
  }
  return icons[name];
};
