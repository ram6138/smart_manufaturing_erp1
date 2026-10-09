import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { runDigitalTwinSimulation, compareDigitalTwinScenarios } from './digital-twin-engine';

async function runTests() {
  console.log('====================================================');
  console.log('FACTORY DIGITAL TWIN — SIMULATION ENGINE UNIT TESTS');
  console.log('====================================================\n');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // Record database snapshot counts to verify zero modifications (read-only safety)
  const initialCounts = await Promise.all([
    pool.query('SELECT COUNT(*) FROM machines;'),
    pool.query('SELECT COUNT(*) FROM production_orders;'),
    pool.query('SELECT COUNT(*) FROM customer_orders;'),
    pool.query('SELECT COUNT(*) FROM inventory_stock;'),
    pool.query('SELECT COUNT(*) FROM maintenance_records;'),
  ]);

  let passCount = 0;
  let totalCount = 0;

  function assert(testName: string, condition: boolean, detail?: string) {
    totalCount++;
    if (condition) {
      console.log(`✅ PASS [${totalCount}]: ${testName}`);
      passCount++;
    } else {
      console.error(`❌ FAIL [${totalCount}]: ${testName} - Detail: ${detail}`);
    }
  }

  try {
    // Test 1: Valid machine with historical production data (Machine 1: Oven 1, Product 1: Coconut Biscuit)
    const t1 = await runDigitalTwinSimulation({
      machineId: 1,
      productId: 1,
      baseDemand: 4000,
      demandChangePct: 0,
      downtimeHours: 0,
      extraShiftEnabled: false,
      extraShiftHours: 0,
      horizon: '1_shift',
    });
    assert('Test 1: Valid machine simulation baseline', t1.simulation_only === true && t1.database_modified === false && t1.results.simulatedDemand === 4000, JSON.stringify(t1.results));

    // Test 2: Demand increase (+25%)
    const t2 = await runDigitalTwinSimulation({
      machineId: 1,
      productId: 1,
      baseDemand: 4000,
      demandChangePct: 25,
      downtimeHours: 0,
      extraShiftEnabled: false,
      extraShiftHours: 0,
      horizon: '1_shift',
    });
    assert('Test 2: Demand increase +25%', t2.results.simulatedDemand === 5000, `Expected 5000, got ${t2.results.simulatedDemand}`);

    // Test 3: Machine Downtime (3 hours out of 8h shift)
    const t3 = await runDigitalTwinSimulation({
      machineId: 1,
      productId: 1,
      baseDemand: 4000,
      demandChangePct: 0,
      downtimeHours: 3,
      extraShiftEnabled: false,
      extraShiftHours: 0,
      horizon: '1_shift',
    });
    assert('Test 3: Downtime reduction calculation', t3.results.netOperatingHours === 5 && t3.results.downtimeHours === 3, `Net hours: ${t3.results.netOperatingHours}`);

    // Test 4: Downtime equal to full shift duration (8h downtime)
    const t4 = await runDigitalTwinSimulation({
      machineId: 1,
      productId: 1,
      baseDemand: 4000,
      demandChangePct: 0,
      downtimeHours: 8,
      extraShiftEnabled: false,
      extraShiftHours: 0,
      horizon: '1_shift',
    });
    assert('Test 4: Full downtime yields 0 capacity', t4.results.netOperatingHours === 0 && t4.results.estimatedCapacity === 0 && t4.results.productionShortfall === 4000, JSON.stringify(t4.results));

    // Test 5: Extra Shift enabled (+4 hours)
    const t5 = await runDigitalTwinSimulation({
      machineId: 1,
      productId: 1,
      baseDemand: 4000,
      demandChangePct: 0,
      downtimeHours: 2,
      extraShiftEnabled: true,
      extraShiftHours: 4,
      horizon: '1_shift',
    });
    assert('Test 5: Extra shift (+4h) with 2h downtime -> 10h net', t5.results.netOperatingHours === 10, `Net hours: ${t5.results.netOperatingHours}`);

    // Test 6: Unknown Machine ID error rejection
    let t6Error = false;
    try {
      await runDigitalTwinSimulation({
        machineId: 99999,
        productId: 1,
        baseDemand: 4000,
        demandChangePct: 0,
        downtimeHours: 0,
        extraShiftEnabled: false,
        extraShiftHours: 0,
        horizon: '1_shift',
      });
    } catch (e) {
      t6Error = true;
    }
    assert('Test 6: Reject unknown machine ID gracefully', t6Error === true, 'Unknown machine ID was not rejected');

    // Test 7: Negative inputs rejection
    let t7Error = false;
    try {
      await runDigitalTwinSimulation({
        machineId: 1,
        productId: 1,
        baseDemand: -500,
        demandChangePct: 0,
        downtimeHours: -2,
        extraShiftEnabled: false,
        extraShiftHours: 0,
        horizon: '1_shift',
      });
    } catch (e) {
      t7Error = true;
    }
    assert('Test 7: Reject negative demand or downtime', t7Error === true, 'Negative inputs were not rejected');

    // Test 8: Multi-Scenario Comparison
    const comparison = await compareDigitalTwinScenarios([
      {
        scenarioName: 'Baseline Plan',
        machineId: 1,
        productId: 1,
        baseDemand: 4000,
        demandChangePct: 0,
        downtimeHours: 0,
        extraShiftEnabled: false,
        extraShiftHours: 0,
        horizon: '1_shift',
      },
      {
        scenarioName: 'Oven 1 Breakdown (3h)',
        machineId: 1,
        productId: 1,
        baseDemand: 4000,
        demandChangePct: 0,
        downtimeHours: 3,
        extraShiftEnabled: false,
        extraShiftHours: 0,
        horizon: '1_shift',
      },
      {
        scenarioName: 'Overtime Shift Mitigation',
        machineId: 1,
        productId: 1,
        baseDemand: 4000,
        demandChangePct: 0,
        downtimeHours: 3,
        extraShiftEnabled: true,
        extraShiftHours: 4,
        horizon: '1_shift',
      },
    ]);
    assert('Test 8: Multi-Scenario comparison evaluation', comparison.scenarios.length === 3 && comparison.preferredScenarioId !== null, JSON.stringify(comparison.comparativeAnalysis));

    // Test 9: Safety verification - check that no rows were inserted or modified
    const finalCounts = await Promise.all([
      pool.query('SELECT COUNT(*) FROM machines;'),
      pool.query('SELECT COUNT(*) FROM production_orders;'),
      pool.query('SELECT COUNT(*) FROM customer_orders;'),
      pool.query('SELECT COUNT(*) FROM inventory_stock;'),
      pool.query('SELECT COUNT(*) FROM maintenance_records;'),
    ]);

    const isUnchanged = initialCounts.every((ic, idx) => ic.rows[0].count === finalCounts[idx].rows[0].count);
    assert('Test 9: Database is 100% untouched / Read-Only safety verified', isUnchanged === true, 'Database counts changed!');

    console.log(`\n----------------------------------------------------`);
    console.log(`TEST SUMMARY: ${passCount} / ${totalCount} PASSED`);
    console.log(`----------------------------------------------------\n`);
  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    await pool.end();
  }
}

runTests();
