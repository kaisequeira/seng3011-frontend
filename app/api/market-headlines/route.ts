import { NextResponse } from "next/server"

const RSS_URL = "https://feeds.content.dowjones.io/public/rss/mw_topstories"

export type MarketHeadline = {
  title: string
  link: string
  /** ISO 8601 from RSS `pubDate`, if parseable */
  publishedAt: string | null
  author: string | null
}

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([\da-fA-F]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function parseMarketWatchRss(xml: string, limit: number): MarketHeadline[] {
  const out: MarketHeadline[] = []
  const re = /<item>([\s\S]*?)<\/item>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null && out.length < limit) {
    const block = m[1]
    const titleRaw =
      block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] ??
      block.match(/<title>([^<]*)<\/title>/)?.[1] ??
      ""
    const title = decodeXmlEntities(titleRaw.trim())
    const link = block.match(/<link>([^<]*)<\/link>/)?.[1]?.trim() ?? ""

    const pubRaw = block.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1]?.trim() ?? ""
    let publishedAt: string | null = null
    if (pubRaw) {
      const d = new Date(pubRaw)
      if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString()
    }

    const authorRaw =
      block.match(/<dc:creator>([^<]*)<\/dc:creator>/)?.[1]?.trim() ?? ""
    const author = authorRaw ? decodeXmlEntities(authorRaw) : null

    if (title) out.push({ title, link, publishedAt, author })
  }
  return out
}

export async function GET() {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate: 300 },
      headers: {
        "User-Agent":
          "TANGO-UI/1.0 (course project dashboard; market headlines RSS)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    })

    if (!res.ok) {
      return NextResponse.json(
        {
          source: "MarketWatch (RSS)",
          items: [] as MarketHeadline[],
          error: `Feed returned ${res.status}`,
        },
        { status: 200 }
      )
    }

    const xml = await res.text()
    const items = parseMarketWatchRss(xml, 5)

    return NextResponse.json({
      source: "MarketWatch (RSS)",
      items,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "fetch failed"
    return NextResponse.json(
      {
        source: "MarketWatch (RSS)",
        items: [] as MarketHeadline[],
        error: message,
      },
      { status: 200 }
    )
  }
}
