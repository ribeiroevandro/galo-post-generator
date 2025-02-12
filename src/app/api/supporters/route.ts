
import { getScreenshot } from 'lib/chromium';
import { getHtml } from 'lib/supportersTemplate';
import { NextResponse } from 'next/server';

const isHtmlDebug = process.env.OG_HTML_DEBUG === '1';

export async function POST(request: Request) {
  try {
    const res = await request.json();
    if (!res) {
      return NextResponse.json(
        { error: 'Missing required query parameters: name, phone, or fileUrl' },
        { status: 400 }
      );
    }

    // Obtém o HTML com base nos dados recebidos
    const html = getHtml({
      name: res.name,
      phone: res.phone,
      fileUrl: res.fileUrl,
      isDev: process.env.NODE_ENV !== 'production',
    });

    // Se estiver no modo de debug do HTML, retorna o HTML diretamente
    if (isHtmlDebug) {
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Gera a screenshot, tanto em produção quanto em desenvolvimento
    console.time('getScreenshot');
    const file = await getScreenshot(html, process.env.NODE_ENV !== 'production');
    console.timeEnd('getScreenshot');

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
