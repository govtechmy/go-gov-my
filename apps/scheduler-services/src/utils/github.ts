import { GitHubReleases, FormattedRelease } from '../types';

export const reduceGithubReleases = (releases: GitHubReleases): FormattedRelease[] => {
  return releases.reduce<FormattedRelease[]>((acc, release) => {
    const appName = release.name.split('@')[0]; // Extract app name before "@"

    // Find if the app already exists in the array
    const existingApp = acc.find((item) => item.app === appName);

    if (!existingApp) {
      acc.push({
        app: appName,
        releaseDate: release.published_at,
        releaseVersion: release.tag_name.split('-')[release.tag_name.split('-').length - 1],
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
