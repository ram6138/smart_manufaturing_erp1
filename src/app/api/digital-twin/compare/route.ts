import { NextResponse } from 'next/server';
import { compareDigitalTwinScenarios } from '@/lib/simulation/digital-twin-engine';
import { ScenarioInput } from '@/types/digital-twin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scenarios } = body;

    if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
      return NextResponse.json({
        simulation_only: true,
        database_modified: false,
        status: 'error',
        message: 'A non-empty array of scenarios is required for multi-scenario comparison.',
      }, { status: 400 });
    }

    const validatedScenarios: ScenarioInput[] = scenarios.map((s: any, idx: number) => ({
      scenarioName: s.scenarioName || `Scenario ${String.fromCharCode(65 + idx)}`,
      machineId: Number(s.machineId),
      productId: Number(s.productId),
      orderId: s.orderId ? Number(s.orderId) : null,
      baseDemand: Number(s.baseDemand || 4000),
      demandChangePct: Number(s.demandChangePct || 0),
      downtimeHours: Number(s.downtimeHours || 0),
      extraShiftEnabled: Boolean(s.extraShiftEnabled),
      extraShiftHours: Number(s.extraShiftHours || 0),
      horizon: s.horizon || '1_shift',
      horizonHours: s.horizonHours ? Number(s.horizonHours) : undefined,
      customThroughputRate: s.customThroughputRate ? Number(s.customThroughputRate) : null,
      rejectionRatePct: s.rejectionRatePct ? Number(s.rejectionRatePct) : undefined,
    }));

    const comparisonResult = await compareDigitalTwinScenarios(validatedScenarios);

    return NextResponse.json({
      status: 'success',
      ...comparisonResult,
    });
  } catch (error: any) {
    console.error('Error executing multi-scenario comparison:', error);
    return NextResponse.json({
      simulation_only: true,
      database_modified: false,
      status: 'error',
      message: error.message || 'An error occurred during multi-scenario comparison.',
    }, { status: 500 });
  }
}
