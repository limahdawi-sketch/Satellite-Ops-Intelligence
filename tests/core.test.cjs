const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../core.js');

test('FSPL reference scenario is approximately 205.6 dB', () => {
  assert.ok(Math.abs(Core.fsplDb(12, 38000) - 205.6) < 0.1);
});

test('link budget calculates C/N0, C/N, Eb/N0 and residual margin', () => {
  const r = Core.calculateLinkBudget({
    eirpDbw: 50, frequencyGHz: 12, rangeKm: 38000, additionalLossDb: 2,
    gtDbK: 22, noiseBandwidthMHz: 36, bitRateMbps: 30,
    requiredEbN0Db: 5, implementationMarginDb: 1.5, fadeReserveDb: 3
  });
  assert.equal(r.ok, true);
  assert.ok(Math.abs(r.fsplDb - 205.63) < 0.1);
  assert.ok(Math.abs(r.cn0DbHz - (50 - r.totalPathLossDb + 22 + 228.6)) < 1e-9);
  assert.ok(Math.abs(r.cnDb - (r.cn0DbHz - 10 * Math.log10(36e6))) < 1e-9);
  assert.ok(Math.abs(r.ebn0Db - (r.cn0DbHz - 10 * Math.log10(30e6))) < 1e-9);
  assert.ok(Math.abs(r.residualMarginDb - (r.ebn0Db - 5 - 1.5 - 3)) < 1e-9);
});

test('link budget rejects zero range and out-of-range frequency', () => {
  const base = { eirpDbw: 50, frequencyGHz: 12, rangeKm: 38000, additionalLossDb: 2, gtDbK: 22, noiseBandwidthMHz: 36, bitRateMbps: 30, requiredEbN0Db: 5, implementationMarginDb: 1.5, fadeReserveDb: 3 };
  assert.equal(Core.calculateLinkBudget({ ...base, rangeKm: 0 }).ok, false);
  assert.equal(Core.calculateLinkBudget({ ...base, frequencyGHz: 0.01 }).ok, false);
});

test('independent 20 dB ratios combine to about 16.99 dB', () => {
  assert.ok(Math.abs(Core.combineDbRatios([20, 20]) - 16.989700043) < 1e-6);
});

test('capacity screening calculates occupied bandwidth and OBO output budget', () => {
  const r = Core.calculateCapacity({ usableBandwidthMHz: 36, reserveBandwidthMHz: 2, hpaSaturationDbw: 20, compositeOboDb: 3 }, [
    { name: 'A', symbolRateMsps: 10, rolloff: 0.2, guardMHz: 0.5, powerW: 3, netRateMbps: 20 }
  ]);
  assert.equal(r.ok, true);
  assert.ok(Math.abs(r.totalOccupiedMHz - 12.5) < 1e-9);
  assert.ok(Math.abs(r.availableBandwidthMHz - 34) < 1e-9);
  assert.ok(Math.abs(r.hpaOperatingBudgetW - (10 ** (17 / 10))) < 1e-9);
  assert.ok(Math.abs(r.spectralEfficiencyBitsPerHz - (20 / 12.5)) < 1e-9);
});

test('capacity rejects reserve above available bandwidth', () => {
  const r = Core.calculateCapacity({ usableBandwidthMHz: 36, reserveBandwidthMHz: 40, hpaSaturationDbw: 20, compositeOboDb: 3 }, [
    { name: 'A', symbolRateMsps: 10, rolloff: 0.2, guardMHz: 0.5, powerW: 3, netRateMbps: 20 }
  ]);
  assert.equal(r.ok, false);
});

test('availability arithmetic gives 99.9% for 8.76 outage hours/year', () => {
  const r = Core.calculateAvailability({ annualOutageHours: 8.76, outageReductionPct: 0, linkMarginDb: 8.7, fadeShockDb: 0, mitigationRecoveryDb: 0 });
  assert.equal(r.ok, true);
  assert.ok(Math.abs(r.baselineAvailabilityPct - 99.9) < 1e-9);
});

test('CSV parser handles quoted commas and rejects malformed row width', () => {
  const parsed = Core.parseCsv('timestamp,note,cn_db\n"2026-10-19T08:00:00Z","heavy, rain",12.1\n"2026-10-19T08:05:00Z","clear",11.1');
  assert.equal(parsed.records[0].note, 'heavy, rain');
  assert.throws(() => Core.parseCsv('a,b\n1,2\n3'), /expected 2/);
});

test('measurement triage flags declining C/N and rising BER as hypotheses', () => {
  const headers = ['timestamp', 'cn_db', 'ber', 'rx_power_dbm'];
  const records = [
    { timestamp: 't1', cn_db: '14', ber: '0.000001', rx_power_dbm: '-65' },
    { timestamp: 't2', cn_db: '12', ber: '0.000003', rx_power_dbm: '-67' }
  ];
  const r = Core.analyzeMeasurements(headers, records);
  assert.ok(r.hypotheses.some(h => h.title.includes('Carrier quality')));
  assert.ok(r.hypotheses.some(h => h.title.includes('BER')));
  assert.match(r.warning, /not confirmed root causes/i);
});

test('all published calculation-layer self-checks pass', () => {
  assert.ok(Core.selfCheck().every(check => check.passed));
});


test('fade-margin profile includes the current scenario and zero-margin behavior', () => {
  const input = { linkMarginDb: 8.7, fadeShockDb: 6, mitigationRecoveryDb: 2 };
  const profile = Core.calculateFadeMarginProfile(input);
  const scenario = Core.calculateAvailability({ ...input, annualOutageHours: 8.76, outageReductionPct: 25 });
  assert.equal(profile.ok, true);
  assert.equal(profile.points.length, 25);
  assert.ok(Math.abs(profile.selectedRemainingMarginDb - 4.7) < 1e-9);
  assert.ok(Math.abs(profile.selectedRemainingMarginDb - scenario.remainingMarginDb) < 1e-9);
  assert.ok(Math.abs(profile.points[0].remainingMarginDb - 10.7) < 1e-9);
  assert.ok(profile.points.at(-1).remainingMarginDb < 0);
  assert.ok(Math.abs(profile.zeroMarginFadeDepthDb - 10.7) < 1e-9);
});

test('fade-margin profile rejects invalid scenario values', () => {
  assert.equal(Core.calculateFadeMarginProfile({ linkMarginDb: 8, fadeShockDb: -1, mitigationRecoveryDb: 2 }).ok, false);
});


test('dBW and watts conversions are reciprocal with a 1 W reference', () => {
  assert.ok(Math.abs(Core.dbwToWatts(20) - 100) < 1e-10);
  assert.ok(Math.abs(Core.wattsToDbw(100) - 20) < 1e-10);
  assert.ok(Math.abs(Core.dbwToWatts(0) - 1) < 1e-10);
  assert.throws(() => Core.wattsToDbw(0), /positive finite/);
});

test('uplink illustrative profile gives an independently calculated link budget', () => {
  const r = Core.calculateLinkBudget({ eirpDbw: 70, frequencyGHz: 14, rangeKm: 38000, additionalLossDb: 2.5, gtDbK: -5, noiseBandwidthMHz: 36, bitRateMbps: 30, requiredEbN0Db: 5, implementationMarginDb: 1.5, fadeReserveDb: 3 });
  assert.equal(r.ok, true);
  assert.ok(Number.isFinite(r.residualMarginDb));
  assert.ok(Math.abs(r.cn0DbHz - (70 - r.totalPathLossDb - 5 + 228.6)) < 1e-9);
});
