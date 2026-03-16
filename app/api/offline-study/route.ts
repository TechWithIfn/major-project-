import { NextResponse } from 'next/server';
import { offlineStudySeed } from '../../../offline-learning-pwa/src/data/offline-study-seed';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      ...offlineStudySeed,
      servedAt: new Date().toISOString(),
      source: 'next-api-offline-study',
    },
    {
      headers: CORS_HEADERS,
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}
