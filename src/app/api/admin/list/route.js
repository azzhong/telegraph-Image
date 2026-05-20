
import { getRequestContext } from '@cloudflare/next-on-pages';

// ...

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Content-Type': 'application/json'
};

export const runtime = 'edge';
export async function POST(request) {
  const { env, cf, ctx } = getRequestContext();
  let page = 0;
  try {
    const body = await request.json();
    page = body.page || 0;
    let query = body.query;

    if (!env.IMG) {
      return Response.json({
        "code": 500,
        "success": false,
        "message": "D1 database binding 'IMG' is missing. Please check your Cloudflare Pages settings.",
      }, {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (query) {
      const ps = env.IMG.prepare(`SELECT * FROM imginfo WHERE url LIKE ? LIMIT 10 OFFSET ?`).bind(`%${query}%`, page * 10);
      const { results } = await ps.all()
      const totalResult = await env.IMG.prepare(`SELECT COUNT(*) as total FROM imginfo WHERE url LIKE ?`).bind(`%${query}%`).first()
      return Response.json({
        "code": 200,
        "success": true,
        "message": "success",
        "data": results,
        "page": page,
        "total": totalResult ? totalResult.total : 0
      });
    } else {
      const ps = env.IMG.prepare(`SELECT * FROM imginfo ORDER BY id DESC LIMIT 10 OFFSET ?`).bind(page * 10);
      const { results } = await ps.all()
      const totalResult = await env.IMG.prepare(`SELECT COUNT(*) as total FROM imginfo`).first()
      return Response.json({
        "code": 200,
        "success": true,
        "message": "success",
        "data": results,
        "page": page,
        "total": totalResult ? totalResult.total : 0
      });
    }
  } catch (error) {
    return Response.json({
      "code": 500,
      "success": false,
      "message": `Database Error: ${error.message}`,
      "data": page,
    }, {
      status: 500,
      headers: corsHeaders,
    })
  }
}



