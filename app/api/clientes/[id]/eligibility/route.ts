import { NextRequest, NextResponse } from "next/server";
import {
  getMockBureau,
  getMockBomPagador,
  getMockClienteNome,
  getMockFaturamento,
} from "@/lib/mock";
import { calcularFaixaPMGeBomPagador } from "@/lib/rules";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const clienteId = id.replace(/\D/g, "");

  const [bureau, bomPagador, faturamento, clienteNome] = await Promise.all([
    getMockBureau(clienteId),
    getMockBomPagador(clienteId),
    getMockFaturamento(clienteId),
    getMockClienteNome(clienteId),
  ]);

  const elegibilidade = calcularFaixaPMGeBomPagador(
    clienteId,
    bureau,
    faturamento,
    bomPagador,
  );

  return NextResponse.json({ ...elegibilidade, clienteNome }, { status: 200 });
}
