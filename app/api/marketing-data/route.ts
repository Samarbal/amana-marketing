import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://www.amanabootcamp.org/api/fs-classwork-data/amana-marketing',
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        next: { revalidate: 0 }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error fetching marketing data:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch marketing data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
