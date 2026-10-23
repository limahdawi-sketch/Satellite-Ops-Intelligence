/* Satellite Ops Intelligence — transparent engineering screening calculations.
 * Units are explicit in field names and validated before use.
 * This is not a payload-specific link budget or ITU-R P.618 implementation.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SatOpsCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const finite = (v) => typeof v === 'number' && Number.isFinite(v);
  const log10 = (v) => Math.log(v) / Math.LN10;
  const toLinear = (db) => 10 ** (db / 10);
  const toDb = (linear) => 10 * log10(linear);

  /** Convert absolute power referenced to 1 W from dBW to watts. */
  function dbwToWatts(dbw) {
    if (!finite(dbw)) throw new TypeError('dBW value must be finite.');
    return 10 ** (dbw / 10);
  }

  /** Convert positive watts to dBW referenced to 1 W. */
  function wattsToDbw(watts) {
    if (!finite(watts) || watts <= 0) throw new RangeError('Power in watts must be a positive finite value.');
    return 10 * log10(watts);
  }
  const close = (a, b, tol = 1e-7) => Math.abs(a - b) <= tol;

  function validateNumber(errors, key, value, label, min, max, { strictlyPositive = false } = {}) {
    if (!finite(value)) errors[key] = `${label} must be a finite number.`;
    else if (value < min || (strictlyPositive && value <= 0)) errors[key] = `${label} is below the permitted range.`;
    else if (value > max) errors[key] = `${label} is above the permitted range.`;
  }

  /** Free-space path loss. frequencyGHz and rangeKm are required. */
  function fsplDb(frequencyGHz, rangeKm) {
    if (!finite(frequencyGHz) || frequencyGHz <= 0 || !finite(rangeKm) || rangeKm <= 0) {
      throw new RangeError('Frequency and slant range must be positive finite values.');
    }
    return 92.45 + 20 * log10(frequencyGHz) + 20 * log10(rangeKm);
  }

  /**
   * Simplified link-budget screening calculation.
   * EIRP dBW, G/T dB/K, losses dB, noise bandwidth MHz, information bit rate Mbps.
   * EIRP and G/T must describe the modeled uplink OR downlink path.
   */
  function calculateLinkBudget(input) {
    const x = { ...input };
    const errors = {};
    validateNumber(errors, 'frequencyGHz', x.frequencyGHz, 'Frequency', 0.1, 100, { strictlyPositive: true });
    validateNumber(errors, 'rangeKm', x.rangeKm, 'Slant range', 200, 400000, { strictlyPositive: true });
    validateNumber(errors, 'eirpDbw', x.eirpDbw, 'EIRP', -100, 100);
    validateNumber(errors, 'additionalLossDb', x.additionalLossDb, 'Additional losses', 0, 100);
    validateNumber(errors, 'gtDbK', x.gtDbK, 'Receive G/T', -100, 100);
    validateNumber(errors, 'noiseBandwidthMHz', x.noiseBandwidthMHz, 'Noise bandwidth', 0.000001, 5000, { strictlyPositive: true });
    validateNumber(errors, 'bitRateMbps', x.bitRateMbps, 'Information bit rate', 0.000001, 5000, { strictlyPositive: true });
    validateNumber(errors, 'requiredEbN0Db', x.requiredEbN0Db, 'Required Eb/N0', -20, 100);
    validateNumber(errors, 'implementationMarginDb', x.implementationMarginDb, 'Implementation margin', 0, 100);
    validateNumber(errors, 'fadeReserveDb', x.fadeReserveDb, 'Fade reserve', 0, 100);
    if (Object.keys(errors).length) return { ok: false, errors };

    const fspl = fsplDb(x.frequencyGHz, x.rangeKm);
    const totalPathLoss = fspl + x.additionalLossDb;
    const cn0 = x.eirpDbw - totalPathLoss + x.gtDbK + 228.6;
    const cn = cn0 - 10 * log10(x.noiseBandwidthMHz * 1e6);
    const ebn0 = cn0 - 10 * log10(x.bitRateMbps * 1e6);
    const rawMargin = ebn0 - x.requiredEbN0Db;
    const residualMargin = rawMargin - x.implementationMarginDb - x.fadeReserveDb;
    return {
      ok: true,
      fsplDb: fspl,
      totalPathLossDb: totalPathLoss,
      cn0DbHz: cn0,
      cnDb: cn,
      ebn0Db: ebn0,
      rawMarginDb: rawMargin,
      residualMarginDb: residualMargin,
      status: residualMargin > 0.5 ? 'positive' : residualMargin >= -0.5 ? 'near-zero' : 'negative',
      assumptions: [
        'EIRP and G/T refer to the same modeled path and are not double-counting path terms.',
        'Only free-space loss and the user-entered additional losses are included.',
        'Required Eb/N0 is supplied by the user for the target modem/MODCOD and service conditions.'
      ]
    };
  }

  /** Equivalent combined C/N or C/I for independent impairments sharing the same reference and bandwidth. */
  function combineDbRatios(valuesDb) {
    if (!Array.isArray(valuesDb) || valuesDb.length < 2 || valuesDb.some((v) => !finite(v))) {
      throw new TypeError('Provide at least two finite dB ratios.');
    }
    const reciprocalSum = valuesDb.reduce((sum, db) => sum + 1 / toLinear(db), 0);
    return toDb(1 / reciprocalSum);
  }

  /**
   * Transponder screening model. Carrier output powers must share a common reference plane.
   * Occupied span is approximated as Rs*(1+roll-off)+guard; this is not payload-specific.
   */
  function calculateCapacity(input, carriers) {
    const x = { ...input };
    const errors = {};
    validateNumber(errors, 'usableBandwidthMHz', x.usableBandwidthMHz, 'Usable bandwidth', 0, 100000, { strictlyPositive: true });
    validateNumber(errors, 'reserveBandwidthMHz', x.reserveBandwidthMHz, 'Reserved bandwidth', 0, 100000);
    validateNumber(errors, 'hpaSaturationDbw', x.hpaSaturationDbw, 'HPA saturation output', -100, 100);
    validateNumber(errors, 'compositeOboDb', x.compositeOboDb, 'Composite OBO', 0, 60);
    if (x.reserveBandwidthMHz > x.usableBandwidthMHz) errors.reserveBandwidthMHz = 'Reserved bandwidth cannot exceed usable bandwidth.';
    if (!Array.isArray(carriers) || carriers.length === 0) errors.carriers = 'Add at least one carrier.';
    else {
      carriers.forEach((c, idx) => {
        if (!c || !finite(c.symbolRateMsps) || c.symbolRateMsps <= 0) errors[`carrier${idx}Symbol`] = `Carrier ${idx + 1}: symbol rate must be positive.`;
        if (!c || !finite(c.rolloff) || c.rolloff < 0 || c.rolloff > 1) errors[`carrier${idx}Rolloff`] = `Carrier ${idx + 1}: roll-off must be between 0 and 1.`;
        if (!c || !finite(c.guardMHz) || c.guardMHz < 0) errors[`carrier${idx}Guard`] = `Carrier ${idx + 1}: guard bandwidth cannot be negative.`;
        if (!c || !finite(c.powerW) || c.powerW < 0) errors[`carrier${idx}Power`] = `Carrier ${idx + 1}: power cannot be negative.`;
        if (!c || !finite(c.netRateMbps) || c.netRateMbps < 0) errors[`carrier${idx}Rate`] = `Carrier ${idx + 1}: net rate cannot be negative.`;
      });
    }
    if (Object.keys(errors).length) return { ok: false, errors };

    const occupiedByCarrier = carriers.map((c) => c.symbolRateMsps * (1 + c.rolloff) + c.guardMHz);
    const totalOccupiedMHz = occupiedByCarrier.reduce((sum, v) => sum + v, 0);
    const availableBandwidthMHz = x.usableBandwidthMHz - x.reserveBandwidthMHz;
    const bandwidthUtilizationPct = totalOccupiedMHz / availableBandwidthMHz * 100;
    const hpaOperatingBudgetW = dbwToWatts(x.hpaSaturationDbw - x.compositeOboDb);
    const totalAllocatedPowerW = carriers.reduce((sum, c) => sum + c.powerW, 0);
    const powerLoadingPct = totalAllocatedPowerW / hpaOperatingBudgetW * 100;
    const bandwidthExceeded = totalOccupiedMHz > availableBandwidthMHz;
    const powerExceeded = totalAllocatedPowerW > hpaOperatingBudgetW;
    const aggregateNetRateMbps = carriers.reduce((sum, c) => sum + c.netRateMbps, 0);
    const spectralEfficiencyBitsPerHz = totalOccupiedMHz > 0 ? aggregateNetRateMbps / totalOccupiedMHz : null;
    return {
      ok: true,
      occupiedByCarrierMHz: occupiedByCarrier,
      totalOccupiedMHz,
      availableBandwidthMHz,
      bandwidthUtilizationPct,
      bandwidthHeadroomMHz: availableBandwidthMHz - totalOccupiedMHz,
      hpaOperatingBudgetW,
      totalAllocatedPowerW,
      powerLoadingPct,
      powerHeadroomW: hpaOperatingBudgetW - totalAllocatedPowerW,
      aggregateNetRateMbps,
      spectralEfficiencyBitsPerHz,
      bandwidthExceeded,
      powerExceeded,
      bindingConstraint: bandwidthExceeded && powerExceeded ? 'both' : bandwidthExceeded ? 'bandwidth' : powerExceeded ? 'power' : bandwidthUtilizationPct >= powerLoadingPct ? 'bandwidth' : 'power',
      warnings: [
        'Screening model only: not payload-specific.',
        'Does not model intermodulation, spectral regrowth, per-carrier EIRP, or OBO-dependent C/N degradation.',
        'Free MHz or power headroom is not automatically sellable capacity.'
      ]
    };
  }

  /**
   * Build a linear illustrative fade-sensitivity profile for charting.
   * This does not predict rain attenuation or availability; it visualizes
   * remainingMargin = linkMargin + assumedRecovery - illustrativeFadeDepth.
   */
  function calculateFadeMarginProfile(input) {
    const x = { ...input };
    const errors = {};
    validateNumber(errors, 'linkMarginDb', x.linkMarginDb, 'Link margin', -100, 100);
    validateNumber(errors, 'fadeShockDb', x.fadeShockDb, 'Illustrative fade depth', 0, 60);
    validateNumber(errors, 'mitigationRecoveryDb', x.mitigationRecoveryDb, 'Illustrative mitigation recovery', 0, 60);
    if (Object.keys(errors).length) return { ok: false, errors };

    const startMarginDb = x.linkMarginDb + x.mitigationRecoveryDb;
    const maxFadeDepthDb = Math.max(10, x.fadeShockDb * 1.5, startMarginDb + 5);
    const samples = 24;
    const points = Array.from({ length: samples + 1 }, (_, i) => {
      const fadeDepthDb = maxFadeDepthDb * i / samples;
      return { fadeDepthDb, remainingMarginDb: startMarginDb - fadeDepthDb };
    });
    return {
      ok: true,
      maxFadeDepthDb,
      startMarginDb,
      zeroMarginFadeDepthDb: startMarginDb >= 0 ? startMarginDb : null,
      selectedFadeDepthDb: x.fadeShockDb,
      selectedRemainingMarginDb: x.linkMarginDb - x.fadeShockDb + x.mitigationRecoveryDb,
      points
    };
  }

  /** Outage-hour arithmetic only. No outage is inferred from fade margin. */
  function calculateAvailability(input) {
    const x = { ...input };
    const errors = {};
    validateNumber(errors, 'annualOutageHours', x.annualOutageHours, 'Annual outage hours', 0, 8760);
    validateNumber(errors, 'outageReductionPct', x.outageReductionPct, 'Hypothetical outage reduction', 0, 100);
    validateNumber(errors, 'linkMarginDb', x.linkMarginDb, 'Link margin', -100, 100);
    validateNumber(errors, 'fadeShockDb', x.fadeShockDb, 'Illustrative fade depth', 0, 60);
    validateNumber(errors, 'mitigationRecoveryDb', x.mitigationRecoveryDb, 'Illustrative mitigation recovery', 0, 60);
    if (Object.keys(errors).length) return { ok: false, errors };

    const outageAfterHours = x.annualOutageHours * (1 - x.outageReductionPct / 100);
    return {
      ok: true,
      baselineAvailabilityPct: 100 * (1 - x.annualOutageHours / 8760),
      scenarioOutageHours: outageAfterHours,
      scenarioAvailabilityPct: 100 * (1 - outageAfterHours / 8760),
      outageHoursSaved: x.annualOutageHours - outageAfterHours,
      remainingMarginDb: x.linkMarginDb - x.fadeShockDb + x.mitigationRecoveryDb,
      warning: 'Illustrative scenario only. Availability is calculated from user-entered annual outage hours and is not predicted from fade margin. This is not an ITU-R P.618 implementation.'
    };
  }

  /** Basic CSV parser with quoted fields and escaped quotes. */
  function parseCsv(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    const s = String(text ?? '').replace(/^\uFEFF/, '');
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (quoted) {
        if (ch === '"' && s[i + 1] === '"') { field += '"'; i++; }
        else if (ch === '"') quoted = false;
        else field += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); if (row.some(v => v.trim() !== '')) rows.push(row); row = []; field = ''; }
      else if (ch !== '\r') field += ch;
    }
    row.push(field);
    if (row.some(v => v.trim() !== '')) rows.push(row);
    if (rows.length < 2) throw new Error('CSV must contain a header and at least one data row.');
    const headers = rows[0].map((h) => h.trim());
    if (headers.some(h => !h)) throw new Error('CSV contains an empty column name.');
    const records = rows.slice(1).map((r, idx) => {
      if (r.length !== headers.length) throw new Error(`Row ${idx + 2} has ${r.length} values; expected ${headers.length}.`);
      const rec = {};
      headers.forEach((h, i) => rec[h] = r[i].trim());
      return rec;
    });
    return { headers, records };
  }

  /** Deterministic heuristic review, never a confirmed root-cause diagnosis. */
  function analyzeMeasurements(headers, records) {
    if (!Array.isArray(headers) || !Array.isArray(records) || records.length < 2) {
      throw new Error('At least two measurement rows are required.');
    }
    const norm = (h) => String(h).toLowerCase().replace(/[^a-z0-9]/g, '');
    const find = (names) => headers.find((h) => names.includes(norm(h)));
    const cnKey = find(['cn', 'cndb', 'esno', 'esnodb', 'snr', 'snrdb', 'cnr', 'cnrd b'.replace(/ /g, '')]);
    const berKey = find(['ber', 'prefecber', 'postfecber', 'biterrorrate']);
    const pwrKey = find(['power', 'powerdbm', 'rxpower', 'rxlevel', 'rxleveldbm', 'level', 'leveldbm']);
    const timeKey = find(['timestamp', 'time', 'datetime', 'date', 'utc']);
    const toNum = (v) => v == null || String(v).trim() === '' ? null : Number(v);
    const series = (key) => key ? records.map(r => toNum(r[key])).filter(finite) : [];
    const trend = (arr) => arr.length >= 2 ? { first: arr[0], last: arr[arr.length - 1], delta: arr[arr.length - 1] - arr[0] } : null;
    const cn = trend(series(cnKey)), ber = trend(series(berKey)), power = trend(series(pwrKey));
    const hypotheses = [];
    if (cn && cn.delta <= -1) hypotheses.push({ level: 'watch', title: 'Carrier quality has declined', evidence: `${cnKey}: ${cn.first} → ${cn.last} (${cn.delta.toFixed(2)} dB across the file).`, next: 'Check weather/fade conditions, receive chain gain, antenna pointing, and contemporaneous interference measurements.' });
    if (ber && ber.last > ber.first && ber.last >= ber.first * 2) hypotheses.push({ level: 'watch', title: 'BER has increased', evidence: `${berKey}: ${ber.first} → ${ber.last}.`, next: 'Confirm pre-/post-FEC measurement point, units, demodulator lock, and MODCOD before comparing values.' });
    if (power && power.delta <= -1) hypotheses.push({ level: 'watch', title: 'Received power has decreased', evidence: `${pwrKey}: ${power.first} → ${power.last} (${power.delta.toFixed(2)} in the supplied unit).`, next: 'Verify receiver calibration, AGC reference, cabling/IF level, antenna alignment, and weather.' });
    if (!hypotheses.length) hypotheses.push({ level: 'info', title: 'No configured threshold was triggered', evidence: 'The available columns did not cross the simple heuristics in this prototype.', next: 'Review the time range, add the correct measurement columns, and compare with operator-specific limits.' });
    return {
      rows: records.length,
      timeColumn: timeKey || null,
      detectedColumns: { cn: cnKey || null, ber: berKey || null, power: pwrKey || null },
      trends: { cn, ber, power },
      hypotheses,
      warning: 'Rules-based screening only. Results depend on the CSV labels, units, measurement point, and sample interval. These are hypotheses, not confirmed root causes or AI-generated diagnoses.'
    };
  }

  function selfCheck() {
    const checks = [];
    const add = (name, passed, detail) => checks.push({ name, passed: Boolean(passed), detail });
    const fspl = fsplDb(12, 38000);
    add('FSPL · 12 GHz / 38,000 km', close(fspl, 205.6, 0.1), `${fspl.toFixed(2)} dB (expected ≈205.6 dB)`);
    add('99.9% annual availability', close(100 * (1 - 8.76 / 8760), 99.9, 1e-10), `${(100 * (1 - 8.76 / 8760)).toFixed(4)}%`);
    add('Combine two 20 dB ratios', close(combineDbRatios([20, 20]), 16.989700043, 1e-6), `${combineDbRatios([20, 20]).toFixed(3)} dB`);
    add('3 dB OBO halves available power (ratio)', close(toLinear(-3), 0.5011872336, 1e-8), `${(toLinear(-3) * 100).toFixed(2)}% of saturation output`);
    add('20 dBW converts to 100 W', close(dbwToWatts(20), 100, 1e-10), `${dbwToWatts(20).toFixed(2)} W`);
    add('100 W converts to 20 dBW', close(wattsToDbw(100), 20, 1e-10), `${wattsToDbw(100).toFixed(2)} dBW`);
    let rejected = false; try { fsplDb(12, 0); } catch (_) { rejected = true; }
    add('Invalid zero range rejected', rejected, rejected ? 'Rejected as expected' : 'Unexpectedly accepted');
    return checks;
  }

  return { fsplDb, calculateLinkBudget, combineDbRatios, calculateCapacity, calculateAvailability, calculateFadeMarginProfile, parseCsv, analyzeMeasurements, selfCheck, toLinear, toDb, dbwToWatts, wattsToDbw };
});
