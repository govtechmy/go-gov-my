import { redis } from '@/lib/redis';
import { APP_NAME, fetchWithTimeout, getDomainWithoutWWW, isValidUrl } from '@dub/utils';
import { waitUntil } from '@vercel/functions';
import he from 'he';
import { parse } from 'node-html-parser';

export const getHtml = async (url: string) => {
  return await fetchWithTimeout(url, {
    headers: {
      'User-Agent': `${APP_NAME} Bot`,
    },
  })
    .then((r) => r.text())
    .catch(() => null);
};

export const getHeadChildNodes = (html) => {
  const ast = parse(html); // parse the html into AST format with node-html-parser
  const metaTags = ast.querySelectorAll('meta').map(({ attributes }) => {
    const property = attributes.property || attributes.name || attributes.href;
    return {
      property,
      content: attributes.content,
    };
  });
  const title = ast.querySelector('title')?.innerText;
  const linkTags = ast.querySelectorAll('link').map(({ attributes }) => {
    const { rel, href } = attributes;
    return {
      rel,
      href,
    };
  });

  return { metaTags, title, linkTags };
};

export const getRelativeUrl = (url: string, imageUrl: string) => {
  if (!imageUrl) {
    return null;
  }
  if (isValidUrl(imageUrl)) {
    return imageUrl;
  }
  const { protocol, host } = new URL(url);
  const baseURL = `${protocol}//${host}`;
  return new URL(imageUrl, baseURL).toString();
};

export const getMetaTags = async (url: string) => {
  const html = await getHtml(url);
  if (!html) {
    return {
      title: url,
      description: 'No description',
      image: null,
    };
  }
  const { metaTags, title: titleTag, linkTags } = getHeadChildNodes(html);

  let object = {};

  for (let k in metaTags) {
    let { property, content } = metaTags[k];

    // !object[property] → (meaning we're taking the first instance of a metatag and ignoring the rest)
    property && !object[property] && (object[property] = content && he.decode(content));
  }

  for (let m in linkTags) {
    let { rel, href } = linkTags[m];

    // !object[rel] → (ditto the above)
    rel && !object[rel] && (object[rel] = href);
  }

  const title = object['og:title'] || object['twitter:title'] || titleTag;

  const description =
    object['description'] || object['og:description'] || object['twitter:description'];

  const image =
    object['og:image'] ||
    object['twitter:image'] ||
    object['image_src'] ||
    object['icon'] ||
    object['shortcut icon'];

  waitUntil(recordMetatags(url, title && description && image ? false : true));

  return {
    title: title || url,
    description: description || 'No description',
    image: getRelativeUrl(url, image),
  };
};

/**
 * Recording metatags that were generated via `/api/metatags`
 * If there's an error, it will be logged to a separate redis list for debugging
 **/
async function recordMetatags(url: string, error: boolean) {
  if (url === 'https://github.com/govtechmy/dub') {
    // don't log metatag generation for default URL
    return null;
  }

  if (error) {
    return await redis.zincrby('metatags-error-zset', 1, url);
  }

  const domain = getDomainWithoutWWW(url);
  if (!domain) {
    throw Error(`failed to record metatags, url "${url}" does not contain a domain`);
  }

  await redis.zincrby('metatags-zset', 1, domain);
}
