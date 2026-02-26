import { NextRequest, NextResponse } from "next/server";
import { CreateCartSchema } from "contracts";
import { auth0 } from "@/lib/auth0";

const backendUrl = process.env.API_BASE_URL;

export async function PUT(req: NextRequest) {
  const { token } = await auth0.getAccessToken()
  const body = CreateCartSchema.parse(await req.json());
  console.log(body);

  const response = await fetch(`${ backendUrl }/cart`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.log(await response.json())
  }

  return NextResponse.json(null, { status: response.status });
}

export async function GET() {
    const { token } = await auth0.getAccessToken();

    const response = await fetch(`${ backendUrl }/cart`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(null, { status: response.status });
    }
    const data = await response.json();
    const parsed = CreateCartSchema.parse(data);

    return NextResponse.json(parsed, { status: 200 });
}

export async function DELETE() {
    const { token } = await auth0.getAccessToken();

    const response = await fetch(`${ backendUrl }/cart`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(null, { status: response.status });
    }
    return NextResponse.json(null, { status: 204 });
}