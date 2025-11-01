import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keywords = searchParams.get('keywords') || 'technology';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'publishedAt';

  try {
    // Using NewsAPI.org - free tier available
    const apiKey = process.env.NEWS_API_KEY || 'demo';

    let url = '';
    if (category) {
      url = `https://newsapi.org/v2/top-headlines?category=${category}&sortBy=${sortBy}&apiKey=${apiKey}`;
    } else {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keywords)}&sortBy=${sortBy}&language=en&apiKey=${apiKey}`;
    }

    const response = await fetch(url, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      // Return mock data for demo purposes
      return NextResponse.json({
        status: 'ok',
        totalResults: 10,
        articles: generateMockArticles(keywords, category)
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);

    // Return mock data on error
    return NextResponse.json({
      status: 'ok',
      totalResults: 10,
      articles: generateMockArticles(keywords, category)
    });
  }
}

function generateMockArticles(keywords: string, category: string) {
  const topics = category || keywords;
  const now = new Date();

  return Array.from({ length: 10 }, (_, i) => {
    const publishedAt = new Date(now.getTime() - i * 3600000);
    return {
      source: { id: null, name: `News Source ${i + 1}` },
      author: `Author ${i + 1}`,
      title: `Breaking: ${topics} - Major developments in the industry (${i + 1})`,
      description: `Latest updates on ${topics}. Experts discuss the implications and what this means for the future. This is a detailed analysis of recent events and trends.`,
      url: `https://example.com/article-${i + 1}`,
      urlToImage: `https://picsum.photos/seed/${topics}-${i}/800/600`,
      publishedAt: publishedAt.toISOString(),
      content: `Full article content about ${topics}. This includes detailed information, analysis, and expert opinions on the subject matter. Stay tuned for more updates.`
    };
  });
}
