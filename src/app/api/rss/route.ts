import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET() {
  try {
    const urls = [
      'https://www.formula1.com/rss/news/headlines.rss',
      'https://www.motorsport.com/rss/f1/news/'
    ];

    const parser = new Parser({
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; F1NewsBot/1.0)'
      }
    });
    
    let allArticles: any[] = [];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; F1NewsBot/1.0)'
          },
          next: { revalidate: 300 } // Cache for 5 minutes
        });
        
        if (!response.ok) {
          console.warn(`Failed to fetch ${url}: ${response.status}`);
          continue;
        }
        
        const xmlText = await response.text();
        
        if (!xmlText.trim()) {
          console.warn(`Empty response from ${url}`);
          continue;
        }
        
        const feed = await parser.parseString(xmlText);
        
        if (feed.items && feed.items.length > 0) {
          allArticles = allArticles.concat(feed.items);
        }
      } catch (error) {
        console.error(`Failed to fetch ${url}:`, error);
        // Continue with other feeds even if one fails
      }
    }

    if (allArticles.length === 0) {
      return NextResponse.json(
        { error: 'No articles could be fetched from any RSS feeds' },
        { status: 503 }
      );
    }

    // Sort by date (newest first)
    allArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate || a.isoDate || 0).getTime();
      const dateB = new Date(b.pubDate || b.isoDate || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ articles: allArticles });
  } catch (error) {
    console.error('RSS API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch RSS feeds' },
      { status: 500 }
    );
  }
} 