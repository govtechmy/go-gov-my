import { ratelimit } from '@/lib/redis/ratelimit';
import { ipAddress } from '@vercel/edge';
// import { unsplash } from '../utils';

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const query = searchParams.get('query');

  if (!query) {
    return new Response('Missing query', { status: 400 });
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return new Response('Unsplash API key not found', { status: 400 });
  }

  const ip = ipAddress(req);
  const { success } = await ratelimit(`unsplash:${ip}`, 10, '10 s');
  if (!success) {
    return new Response("Don't DDoS me pls 🥺", { status: 429 });
  }

  // return unsplash.search
  //   .getPhotos({
  //     query,
  //   })
  //   .then((result) => {
  //     if (result.errors) {
  //       // handle error here
  //       console.log('error occurred: ', result.errors[0]);
  //       return new Response('Unsplash error', { status: 400 });
  //     } else {
  //       const data = result.response;
  //       return NextResponse.json(data.results);
  //     }
  //   })
  //   .catch((err) => {
  //     console.log('err', err);
  //     return new Response('Unsplash rate limit exceeded', { status: 429 });
  //   });
}
