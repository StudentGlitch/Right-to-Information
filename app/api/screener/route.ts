import { NextRequest, NextResponse } from 'next/server';
import { batchScore } from '@/lib/screener/scoringEngine';

// Mock data - in production, replace with MongoDB or external API
const MOCK_STOCKS = [
  {
    ticker: 'BBCA',
    name: 'Bank Central Asia Tbk',
    sector: 'Finance',
    price: 9425,
    change: 1.2,
    volume: 42500000,
    marketCap: 1050000,
    fundamentalScore: 88,
    technicalScore: 72,
    sentimentScore: 80,
    pe: 28.5,
    pb: 4.2,
    roe: 15.8,
    dividendYield: 1.8,
    eps: 330.7,
    liquidityData: { averageDailyValue: 500_000_000_000, freefloat: 45, foreignNetBuy: 150000000 }
  },
  {
    ticker: 'BBRI',
    name: 'Bank Rakyat Indonesia Tbk',
    sector: 'Finance',
    price: 4590,
    change: -0.4,
    volume: 89000000,
    marketCap: 750000,
    fundamentalScore: 82,
    technicalScore: 68,
    sentimentScore: 75,
    pe: 12.1,
    pb: 2.1,
    roe: 17.2,
    dividendYield: 4.2,
    eps: 379.3,
    liquidityData: { averageDailyValue: 350_000_000_000, freefloat: 46.81, foreignNetBuy: 80000000 }
  },
  {
    ticker: 'BMRI',
    name: 'Bank Mandiri Tbk',
    sector: 'Finance',
    price: 6150,
    change: 0.8,
    volume: 45000000,
    marketCap: 600000,
    fundamentalScore: 80,
    technicalScore: 70,
    sentimentScore: 72,
    pe: 10.5,
    pb: 1.8,
    roe: 16.5,
    dividendYield: 5.1,
    eps: 585.7,
    liquidityData: { averageDailyValue: 280_000_000_000, freefloat: 40, foreignNetBuy: 50000000 }
  },
  {
    ticker: 'TLKM',
    name: 'Telkom Indonesia Tbk',
    sector: 'Infrastructure',
    price: 3370,
    change: 1.5,
    volume: 52000000,
    marketCap: 330000,
    fundamentalScore: 75,
    technicalScore: 65,
    sentimentScore: 70,
    pe: 15.2,
    pb: 2.3,
    roe: 15.1,
    dividendYield: 3.8,
    eps: 221.7,
    liquidityData: { averageDailyValue: 150_000_000_000, freefloat: 47.97, foreignNetBuy: 20000000 }
  },
  {
    ticker: 'ASII',
    name: 'Astra International Tbk',
    sector: 'Miscellaneous Industry',
    price: 4810,
    change: -0.3,
    volume: 28000000,
    marketCap: 190000,
    fundamentalScore: 78,
    technicalScore: 62,
    sentimentScore: 68,
    pe: 9.8,
    pb: 1.5,
    roe: 15.3,
    dividendYield: 4.5,
    eps: 490.8,
    liquidityData: { averageDailyValue: 120_000_000_000, freefloat: 49.5, foreignNetBuy: 15000000 }
  }
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sector = searchParams.get('sector');
    const tier = searchParams.get('tier');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const sortBy = searchParams.get('sortBy') || 'composite';
    const order = searchParams.get('order') || 'desc';
    const q = searchParams.get('q');

    // Score all stocks
    let stocks = batchScore(MOCK_STOCKS);

    // Apply filters
    if (q) {
      const query = q.toLowerCase();
      stocks = stocks.filter(s => 
        s.ticker.toLowerCase().includes(query) || 
        s.name.toLowerCase().includes(query)
      );
    }

    if (sector && sector !== 'All') {
      stocks = stocks.filter(s => s.sector === sector);
    }

    if (tier) {
      stocks = stocks.filter(s => s.scoring.tier.level === parseInt(tier));
    }

    if (minScore) {
      stocks = stocks.filter(s => s.scoring.composite >= parseInt(minScore));
    }

    if (maxScore) {
      stocks = stocks.filter(s => s.scoring.composite <= parseInt(maxScore));
    }

    // Sort
    const dir = order === 'asc' ? 1 : -1;
    stocks.sort((a, b) => {
      if (sortBy === 'composite') return (a.scoring.composite - b.scoring.composite) * dir;
      if (sortBy === 'pe') return ((a.pe || 999) - (b.pe || 999)) * dir;
      if (sortBy === 'change') return (a.change - b.change) * dir;
      if (sortBy === 'dividendYield') return ((a.dividendYield || 0) - (b.dividendYield || 0)) * dir;
      if (sortBy === 'roe') return ((a.roe || 0) - (b.roe || 0)) * dir;
      return 0;
    });

    // Format response
    const data = stocks.map(s => ({
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      price: s.price,
      change: s.change,
      volume: s.volume,
      marketCap: s.marketCap,
      pe: s.pe,
      pb: s.pb,
      roe: s.roe,
      dividendYield: s.dividendYield,
      eps: s.eps,
      scores: {
        composite: s.scoring.composite,
        ...s.scoring.breakdown
      },
      tier: s.scoring.tier
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total: data.length,
      data
    });
  } catch (error) {
    console.error('Screener API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
