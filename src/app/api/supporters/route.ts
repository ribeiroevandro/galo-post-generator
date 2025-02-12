import { getScreenshot } from '@/utils/chromium';
import { getHtml } from '@/utils/supportersTemplate';
import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV !== 'production';
const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

// POST handler
export async function POST(request: Request) {
  try {
    const res = await request.json();
    if (!res) {
      return NextResponse.json(
        { error: 'Missing required query parameters: name, description, or techs' },
        { status: 400 }
      );
    }

    const html = getHtml({
      name: res.name,
      phone: res.phone,
      fileUrl: res.fileUrl,
      isDev,
    });

    if (isHtmlDebug) {
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const file = await getScreenshot(html, isDev);

    return new Response(file, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      '<h1>Internal Error</h1><p>Sorry, there was a problem</p>',
      { status: 500, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
