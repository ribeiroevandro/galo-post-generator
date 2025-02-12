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
        { error: 'Missing required query parameters: name, phone, or fileUrl' },
        { status: 400 }
      );
    }

    // Obtém o HTML com base nos dados recebidos
    const html = getHtml({
      name: res.name,
      phone: res.phone,
      fileUrl: res.fileUrl,
      isDev,
    });

    // Se estiver no modo de debug do HTML, retorna o HTML diretamente
    if (isHtmlDebug) {
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Em produção, evita a geração da screenshot e retorna a fileUrl diretamente
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ fileUrl: res.fileUrl });
    }

    // Em desenvolvimento, gera a screenshot normalmente
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
