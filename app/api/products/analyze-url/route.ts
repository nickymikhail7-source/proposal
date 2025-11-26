import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzePricingContent } from '@/lib/anthropic';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        // Fetch the pricing page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
                { status: 400 }
            );
        }

        const html = await response.text();

        // Parse HTML and extract text content
        const $ = cheerio.load(html);

        // Remove non-content elements
        $('script, style, nav, footer, header, aside, iframe, noscript').remove();
        $('[role="navigation"]').remove();
        $('[aria-hidden="true"]').remove();

        // Get text content from body
        let textContent = $('body').text();

        // Clean up whitespace
        textContent = textContent
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();

        // Limit content length to avoid token limits (roughly 15k chars ≈ 4k tokens)
        if (textContent.length > 15000) {
            textContent = textContent.slice(0, 15000) + '...';
        }

        if (textContent.length < 100) {
            return NextResponse.json(
                { error: 'Could not extract sufficient content from the URL. The page might be JavaScript-rendered or protected.' },
                { status: 400 }
            );
        }

        // Analyze with Claude Sonnet 4
        const pricingData = await analyzePricingContent(textContent);

        return NextResponse.json({
            pricingData,
            rawContent: textContent,
            source: url,
        });

    } catch (error) {
        console.error('Error analyzing URL:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to analyze pricing page' },
            { status: 500 }
        );
    }
}
