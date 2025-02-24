import { GitHubReleases, FormattedRelease } from '../types';

export const reduceGithubReleases = (releases: GitHubReleases): FormattedRelease[] => {
  return releases.reduce<FormattedRelease[]>((acc, release) => {
    const appName = release.name.split('@')[0]; // Extract app name before "@"

    // Find if the app already exists in the array
    const existingApp = acc.find((item) => item.app === appName);

    if (!existingApp) {
      // Ensure release and its properties are valid
      const releaseDate = release && release.published_at ? release.published_at : '';
      const tagName = release && release.tag_name ? release.tag_name : '';

      acc.push({
        app: appName,
        releaseDate: releaseDate,
        releaseVersion: extractVersion(tagName),
      });
    } else {
      // Update the latest release date if the current one is newer
      if (new Date(release.published_at) > new Date(existingApp.releaseDate)) {
        existingApp.releaseDate = release.published_at;
      }
    }

    return acc;
  }, []);
};

function extractVersion(tag: string) {
  if (typeof tag !== 'string' || tag.trim() === '') {
    return 'unknown';
  }
  const parts = tag.split('-');
  // If there is more than one part, return the last part; otherwise return the tag itself.
  return parts.length > 1 ? parts[parts.length - 1] : tag;
}
