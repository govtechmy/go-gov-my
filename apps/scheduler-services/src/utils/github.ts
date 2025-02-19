import { GitHubReleases, FormattedRelease } from '../types';

export const reduceGithubReleases = (releases: GitHubReleases): FormattedRelease[] => {
  return releases.reduce<FormattedRelease[]>((acc, release) => {
    const appName = release.name.split('@')[0]; // Extract app name before "@"

    // Find if the app already exists in the array
    const existingApp = acc.find((item) => item.app === appName);

    if (!existingApp) {
      acc.push({ app: appName, last_released: release.published_at });
    } else {
      // Update the latest release date if the current one is newer
      if (new Date(release.published_at) > new Date(existingApp.last_released)) {
        existingApp.last_released = release.published_at;
      }
    }

    return acc;
  }, []);
};
