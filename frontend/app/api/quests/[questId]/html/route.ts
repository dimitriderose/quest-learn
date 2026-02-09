import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { questId: string } }
) {
  const questId = params.questId;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  try {
    // Get the auth token from the request cookies
    const token = request.cookies.get('auth-token')?.value;
    
    const response = await fetch(`${apiUrl}/api/v1/quests/${questId}/html`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      return new NextResponse('Quest not found', { status: 404 });
    }

    const html = await response.text();

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error fetching quest HTML:', error);
    return new NextResponse('Error loading quest', { status: 500 });
  }
}
