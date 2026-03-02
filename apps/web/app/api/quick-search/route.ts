import { QuickSearchResultSchema } from "contracts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('name');

  if (!query) {
    return NextResponse.json({ data: [] });
  }

  const backendUrl = process.env.API_BASE_URL || 'http://localhost:5000';
    const response =  await fetch(
      `${ backendUrl }/inventory/search?name=${ encodeURIComponent(query) }`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Backend fetch failed' },
        { status: response.status }
      )
    }
    const validation = QuickSearchResultSchema.safeParse(await response.json());

    if (validation.error) {
      return NextResponse.json(
        { error: 'Backend fetch failed' },
        { status: 400 }
      )
    }
    return NextResponse.json(validation.data)
}