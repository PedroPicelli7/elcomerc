// src/app/api/shipping/route.ts
import { NextResponse } from "next/server";
import { getShippingRules } from "@/services/api/products";

export async function GET() {
  try {
    const rules = await getShippingRules();
    return NextResponse.json(rules);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno ao processar frete" }, { status: 500 });
  }
}