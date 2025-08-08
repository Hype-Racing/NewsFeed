'use client';

import { useEffect, useState } from 'react';
import Parser from 'rss-parser';

type Article = {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  content?: string;
  isoDate?: string;
  enclosure?: {
    url: string;
    type: string;
  };
  'media:content'?: {
    $: {
      url: string;
      type: string;
    };
  };
  'media:thumbnail'?: {
    $: {
      url: string;
    };
  };
};

export default function F1NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        setError(null);

        const urls = [
          'https://www.formula1.com/rss/news/headlines.rss',
          'https://www.motorsport.com/rss/f1/news/'
        ];

        const parser = new Parser();
        let allArticles: Article[] = [];

        for (const url of urls) {
          try {
            // Use proxy to bypass CORS
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
              console.warn(`Failed to fetch ${url}: ${response.status}`);
              continue;
            }

            const data = await response.json();
            
            if (!data.contents) {
              console.warn(`No contents from ${url}`);
              continue;
            }

            if (typeof data.contents === 'string') {
              const feed = await parser.parseString(data.contents);
              
              if (feed.items && feed.items.length > 0) {
                allArticles = allArticles.concat(feed.items as Article[]);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch ${url}:`, error);
            // Continue with other feeds even if one fails
          }
        }

        if (allArticles.length === 0) {
          setError('No articles could be fetched from any RSS feeds');
        } else {
          // Sort by date (newest first)
          allArticles.sort((a, b) => {
            const dateA = new Date(a.pubDate || a.isoDate || 0).getTime();
            const dateB = new Date(b.pubDate || b.isoDate || 0).getTime();
            return dateB - dateA;
          });

          setArticles(allArticles);
        }
      } catch (err) {
        console.error('Failed to fetch F1 news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  const getArticleImage = (article: Article): string | null => {
    if (article.enclosure?.url && article.enclosure.type?.startsWith('image/')) {
      return article.enclosure.url;
    }
    if (article['media:content']?.$?.url && article['media:content'].$.type?.startsWith('image/')) {
      return article['media:content'].$.url;
    }
    if (article['media:thumbnail']?.$?.url) {
      return article['media:thumbnail'].$.url;
    }
    return null;
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '30px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '32px',
    color: '#dc2626'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: '1fr'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    padding: '0',
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer'
  };

  const cardHoverStyle: React.CSSProperties = {
    ...cardStyle,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-4px)'
  };

  const imageContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '128px',
    overflow: 'hidden',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px'
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const
  };

  const contentStyle: React.CSSProperties = {
    padding: '16px'
  };

  const articleTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
    margin: '0 0 8px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    lineHeight: '1.4'
  };

  const dateStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#374151',
    margin: '0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    lineHeight: '1.5'
  };

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0'
  };

  const spinnerStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    border: '2px solid #fecaca',
    borderTop: '2px solid #dc2626',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const errorStyle: React.CSSProperties = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center' as const
  };

  const errorTextStyle: React.CSSProperties = {
    color: '#991b1b',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  };

  const retryButtonStyle: React.CSSProperties = {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const emptyStyle: React.CSSProperties = {
    textAlign: 'center' as const,
    padding: '32px 0',
    color: '#6b7280'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>🏎️ F1 News Feed</h1>
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <span style={{ marginLeft: '12px', color: '#6b7280' }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>🏎️ F1 News Feed</h1>
        <div style={errorStyle}>
          <p style={errorTextStyle}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={retryButtonStyle}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @media (min-width: 640px) {
            .news-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (min-width: 1024px) {
            .news-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}
      </style>
      <h1 style={titleStyle}>🏎️ F1 News Feed</h1>
      
      {articles.length === 0 ? (
        <div style={emptyStyle}>
          <p>No news articles found.</p>
        </div>
      ) : (
        <div style={gridStyle} className="news-grid">
          {articles.map((article, idx) => {
            const imageUrl = getArticleImage(article);
            
            return (
              <a
                key={idx}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                style={cardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.transform = '';
                }}
              >
                {imageUrl && (
                  <div style={imageContainerStyle}>
                    <img
                      src={imageUrl}
                      alt={article.title}
                      style={imageStyle}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div style={contentStyle}>
                  <h2 style={articleTitleStyle}>
                    {article.title}
                  </h2>
                  <p style={dateStyle}>
                    {new Date(article.pubDate || article.isoDate || '').toLocaleDateString()}
                  </p>
                  <p style={descriptionStyle}>
                    {article.contentSnippet}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
} 