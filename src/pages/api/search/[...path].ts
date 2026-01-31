import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  const path = params.path || '';
  const url = new URL(request.url);

  // 构建目标 URL
  const targetUrl = `https://fundsuggest.eastmoney.com/${path}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
        'Referer': 'https://fundsuggest.eastmoney.com/',
      },
    });

    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = GET;
