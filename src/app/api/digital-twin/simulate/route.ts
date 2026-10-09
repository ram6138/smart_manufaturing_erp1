import { NextResponse } from 'next/server';
import { runDigitalTwinSimulation } from '@/lib/simulation/digital-twin-engine';
import { ScenarioInput } from '@/types/digital-twin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      scenarioName,
      machineId,
      productId,
      orderId,
      baseDemand,
      demandChangePct = 0,
      downtimeHours = 0,
      extraShiftEnabled = false,
      extraShiftHours = 0,
      horizon = '1_shift',
      horizonHours,
      customThroughputRate,
      rejectionRatePct,
    } = body;

    // Strict input validation
    if (!machineId || isNaN(Number(machineId))) {
      return NextResponse.json({
        simulation_only: true,
        database_modified: false,
        status: 'error',
        message: 'Invalid or missing machineId. Please select a valid factory asset.',
      }, { status: 400 });
    }

    if (!productId || isNaN(Number(productId))) {
      return NextResponse.json({
        simulation_only: true,
        database_modified: false,
        status: 'error',
        message: 'Invalid or missing productId. Please select a valid manufactured SKU.',
      }, { status: 400 });
    }

    if (baseDemand === undefined || Number(baseDemand) < 0) {
      return NextResponse.json({
        simulation_only: true,
        database_modified: false,
        status: 'error',
        message: 'baseDemand must be a non-negative number.',
      }, { status: 400 });
    }

    if (Number(downtimeHours) < 0) {
      return NextResponse.json({
        simulation_only: true,
        database_modified: false,
        status: 'error',
        message: 'downtimeHours cannot be negative.',
      }, { status: 400 });
    }

    if (Number(extraShiftHours) < 0) {
      return NextResponse.json({
        simulation_only: true,
        database_modified: false,
        status: 'error',
        message: 'extraShiftHours cannot be negative.',
      }, { status: 400 });
    }

    const input: ScenarioInput = {
      scenarioName: scenarioName ? String(scenarioName) : undefined,
      machineId: Number(machineId),
      productId: Number(productId),
      orderId: orderId ? Number(orderId) : null,
      baseDemand: Number(baseDemand),
      demandChangePct: Number(demandChangePct),
      downtimeHours: Number(downtimeHours),
      extraShiftEnabled: Boolean(extraShiftEnabled),
      extraShiftHours: Number(extraShiftHours),
      horizon: horizon as any,
      horizonHours: horizonHours ? Number(horizonHours) : undefined,
      customThroughputRate: customThroughputRate ? Number(customThroughputRate) : null,
      rejectionRatePct: rejectionRatePct ? Number(rejectionRatePct) : undefined,
    };

    const simulationResult = await runDigitalTwinSimulation(input);

    return NextResponse.json({
      status: 'success',
      ...simulationResult,
    });
  } catch (error: any) {
    console.error('Error executing Digital Twin simulation:', error);
    return NextResponse.json({
      simulation_only: true,
      database_modified: false,
      status: 'error',
      message: error.message || 'An error occurred during simulation execution.',
    }, { status: 500 });
  }
}
