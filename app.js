(function () {
  'use strict';
  const Core = window.SatOpsCore;
  const $ = (id) => document.getElementById(id);
  const clone = (obj) => JSON.parse(JSON.stringify(obj));
  const DEFAULT_LINK = { direction: 'downlink', eirpDbw: 50, frequencyGHz: 12, rangeKm: 38000, additionalLossDb: 2, gtDbK: 22, noiseBandwidthMHz: 36, bitRateMbps: 30, requiredEbN0Db: 5, implementationMarginDb: 1.5, fadeReserveDb: 3 };
  // Illustrative uplink profile only: replace every value with validated earth-station/satellite data for a real analysis.
  const DEFAULT_UPLINK = { direction: 'uplink', eirpDbw: 70, frequencyGHz: 14, rangeKm: 38000, additionalLossDb: 2.5, gtDbK: -5, noiseBandwidthMHz: 36, bitRateMbps: 30, requiredEbN0Db: 5, implementationMarginDb: 1.5, fadeReserveDb: 3 };
  const DEFAULT_CAPACITY = { usableBandwidthMHz: 36, reserveBandwidthMHz: 2, hpaSaturationDbw: 20, compositeOboDb: 3 };
  const DEFAULT_CARRIERS = [
    { name: 'Carrier A', symbolRateMsps: 8, rolloff: 0.2, guardMHz: 0.2, powerW: 3, netRateMbps: 18 },
    { name: 'Carrier B', symbolRateMsps: 10, rolloff: 0.2, guardMHz: 0.25, powerW: 4, netRateMbps: 25 },
    { name: 'Carrier C', symbolRateMsps: 5, rolloff: 0.25, guardMHz: 0.2, powerW: 2, netRateMbps: 11 }
  ];
  const DEFAULT_AVAILABILITY = { linkMarginDb: 8.7, fadeShockDb: 6, mitigationRecoveryDb: 2, annualOutageHours: 8.76, outageReductionPct: 25 };

  const I18N = {
    en: {
      workspace:'WORKSPACE', analysis:'ANALYSIS', navOverview:'Decision Center', navLink:'RF Link Budget', navCapacity:'Transponder Capacity', navAvailability:'Rain Fade & Availability', navTroubleshooting:'Measurement Triage', navReports:'Decision Reports', navMethodology:'Methodology & References', navRoadmap:'Product Roadmap', authorRole:'Telecom & Broadcast Engineering', syntheticLabel:'Synthetic / user-entered data', product:'Satellite Ops Intelligence', demoBadge:'DEMO · SYNTHETIC DATA', theme:'Theme', install:'Install', heroEyebrow:'ENGINEERING · OPERATIONS · DECISIONS', heroTitle:'From RF parameters<br><em>to better decisions.</em>', heroBody:'A transparent satellite engineering lab to screen link budgets, test transponder scenarios, explore outage assumptions and turn calculations into decision briefs.', openLinkLab:'Open Link Budget Lab', loadScenario:'Load example scenario', heroFootnote:'No live satellite, teleport or operator telemetry connection.', liveModel:'LIVE MODEL OUTPUTS', decisionSnapshot:'Decision snapshot', snapshotNote:'Recalculates from editable scenario inputs', metricMargin:'Residual link margin', metricBandwidth:'Bandwidth utilization', metricPower:'Power loading', metricRate:'Aggregate net rate', demoOnly:'Scenario value · not a service commitment', decisionEngine:'DECISION ENGINE', whatIf:'What-if interpretation', bandwidthHeadroom:'Bandwidth headroom', powerHeadroom:'Power headroom', inspectCapacity:'Inspect capacity model', quickAccess:'QUICK ACCESS', engineeringLabs:'Engineering labs', labLinkTitle:'RF Link Budget', labLinkSub:'FSPL, C/N₀, C/N, Eb/N₀ and margin', labCapacityTitle:'Transponder Capacity', labCapacitySub:'Bandwidth and HPA power screening', labRainTitle:'Availability Scenario', labRainSub:'Outage-hour arithmetic and fade what-if', labTriageTitle:'Measurement Triage', labTriageSub:'CSV trends and evidence-led checks', globalDisclaimer:'Engineering screening tool only. Every chart and result is based on synthetic defaults or your inputs. Validate against vendor, payload and operator engineering data before use in a live network.', readMethod:'Read methodology',
      pageTitleOverview:'Decision Center', pageTitleLink:'RF Link Budget Lab', pageTitleCapacity:'Transponder Capacity Lab', pageTitleAvailability:'Rain Fade & Availability', pageTitleTroubleshooting:'Measurement Triage', pageTitleReports:'Engineering Decision Reports', pageTitleMethodology:'Methodology & References', pageTitleRoadmap:'Product Roadmap', linkEyebrow:'RF ENGINEERING / 01', linkTitle:'RF Link Budget Lab', linkIntro:'Calculate the core downlink or uplink terms and inspect every step from free-space loss to residual Eb/N₀ margin.', linkInputs:'Link parameters', linkInputsSub:'Use values from the same modeled path.', reset:'Reset', direction:'Link direction', directionHelp:'The core equations are the same; input values must match the path.', eirp:'EIRP (dBW)', eirpHelp:'Transmit EIRP at the modeled link end.', frequency:'Frequency (GHz)', range:'Slant range (km)', additionalLoss:'Additional path losses (dB)', lossHelp:'Enter non-free-space losses once; avoid double counting.', gt:'Receive G/T (dB/K)', noiseBw:'Noise bandwidth (MHz)', bitRate:'Information bit rate (Mbps)', requiredEbN0:'Required Eb/N₀ (dB)', requiredHelp:'Set from the target modem/MODCOD and service conditions.', implMargin:'Implementation margin (dB)', fadeReserve:'Fade reserve (dB)', useMargin:'Send residual margin to availability lab', exportCurrent:'Add to report', calculatedLive:'CALCULATED LIVE', linkResults:'Link results', residualMargin:'Residual margin', afterReserves:'After required Eb/N₀, implementation and fade reserves', equationTrace:'Calculation trace', unitsExplicit:'UNITS SHOWN', combinedToolTitle:'Combine C/N or C/I impairments', combinedToolTag:'LINEAR SUM', combinedInputLabel:'Component ratios in dB (comma-separated)', combinedToolHelp:'Example: 20, 18, 16. Values must share the same carrier reference and bandwidth.', calculateCombined:'Calculate combined', combinedWaiting:'Enter at least two dB ratios.', combinedInvalid:'Enter at least two valid finite dB ratios.', combinedResultLabel:'Combined ratio', linkCaveat:'Planning aid, not a certified link budget. Atmospheric, polarization, implementation and other terms must be included where applicable.',
      capacityEyebrow:'CAPACITY PLANNING / 02', capacityTitle:'Transponder Capacity Lab', capacityIntro:'Screen the spectral span and allocated power of a hypothetical multi-carrier plan. The spectrum view is illustrative, not a payload model.', capacityInputs:'Transponder constraints', capacityInputsSub:'All carrier powers must use one common reference plane.', usableBw:'Usable bandwidth (MHz)', reservedBw:'Reserved bandwidth (MHz)', hpaSat:'HPA saturation output (dBW)', compositeObo:'Composite OBO (dB)', carrierPlan:'Carrier plan', carrierPlanSub:'Occupied span ≈ symbol rate × (1 + roll-off) + guard.', addCarrier:'Add carrier', carrier:'Carrier', symbolRate:'Symbol rate', rolloff:'Roll-off', guard:'Guard', allocatedPower:'Allocated power', netRate:'Net rate', occupied:'Occupied', spectrumOccupancy:'SPECTRUM OCCUPANCY', bandwidthBudget:'Bandwidth budget', utilized:'utilized', spectrumNote:'Visual is proportional to occupied-span values; carrier spectral shape and overlap are not modeled.', powerBudget:'POWER BUDGET', hpaLoading:'HPA output loading', aggregateRate:'Aggregate net rate', totalAllocatedPower:'Total allocated carrier power', spectralEfficiency:'Net spectral efficiency', bindingConstraint:'Primary screening constraint', capacityCaveat:'Screening only: does not model payload frequency response, intermodulation, spectral regrowth, per-carrier EIRP, OBO-dependent C/N loss or regulatory coordination. MHz available is not automatically sellable capacity.',
      availabilityEyebrow:'SERVICE RESILIENCE / 03', availabilityTitle:'Rain Fade & Availability', availabilityIntro:'Explore a fade-margin stress scenario and compare outage-hour assumptions. This lab does not infer annual outages from RF margin.', resilienceInputs:'Resilience scenario', resilienceInputsSub:'Enter an outage baseline and hypothetical mitigation effect.', linkMarginInput:'Current residual link margin (dB)', useCurrent:'Use current', linkMarginHelp:'Copied from the RF Link Budget Lab only when you choose to do so.', fadeDepth:'Illustrative fade depth (dB)', recovery:'Hypothetical mitigation recovery (dB)', annualOutage:'Baseline annual outage hours (h)', annualOutageHelp:'Use measured or assumed outage hours. 8,760 hours = 365 days.', outageReduction:'Hypothetical outage reduction (%)', addToReport:'Add scenario to report', scenarioOutputs:'SCENARIO OUTPUTS', availabilityResults:'Availability comparison', baselineAvailability:'Baseline availability', scenarioAvailability:'Scenario availability', hoursSaved:'Illustrative outage hours saved', remainingMargin:'Remaining fade margin', belowTarget:'Below zero', aboveTarget:'Positive margin', availabilityCaveat:'ITU-R P.618 is not implemented here. A defensible availability prediction requires location, frequency, elevation angle, climate/statistical inputs and system-specific assumptions.', fadeSensitivity:'FADE SENSITIVITY', fadeChartTitle:'Remaining fade margin vs. fade depth', fadeChartDescription:'The line shows the simplified margin response as illustrative fade depth changes. The marker is the current scenario.', fadeDepthAxis:'Illustrative fade depth (dB)', remainingMarginAxis:'Remaining margin (dB)', currentFadeScenario:'Current scenario', selectedFadeScenario:'Selected fade scenario', remainingMarginCurve:'Remaining margin curve', zeroMarginThreshold:'Zero-margin threshold', fadeChartCaveat:'Illustrative linear sensitivity only: remaining margin = current link margin + assumed mitigation recovery − fade depth. It is not an ITU-R P.618 rain-fade or availability prediction.', chartLoading:'Chart will update with the scenario inputs.', chartUnavailable:'Chart unavailable: review the scenario inputs.',
      triageEyebrow:'OPERATIONS SUPPORT / BETA', triageTitle:'Measurement Triage', triageIntro:'Upload an authorized CSV to review simple trends in C/N, BER and receive power. Findings are heuristic prompts for an engineer—not confirmed root causes.', uploadCsv:'Analyze measurement CSV', uploadHelp:'Expected columns may include timestamp, C/N (dB), BER and receive power. Column names are matched by common aliases; units and sample interval still require review.', chooseCsv:'Choose CSV file', loadSampleCsv:'Load synthetic sample', noFile:'No file selected. Files are processed locally in this browser.', dataQuality:'DATA QUALITY', measurementPreview:'Measurement preview', waitingForFile:'Awaiting CSV', previewEmpty:'Choose a file or load the sample to view parsed rows.', heuristicReview:'HEURISTIC REVIEW', hypotheses:'Hypotheses & next checks', triageEmpty:'No analysis yet. Load a CSV to see trends and verification steps.',
      reportsEyebrow:'ENGINEERING COMMUNICATION / 04', reportsTitle:'Engineering Decision Reports', reportsIntro:'Package current model outputs, assumptions and warnings into a concise hand-off for technical review.', buildReport:'Build a decision brief', buildReportSub:'The report includes calculated results and model limitations. It does not imply certification or operator approval.', downloadJson:'Download JSON', downloadCsv:'Download CSV summary', printPdf:'Print / Save PDF', decisionBrief:'ENGINEERING DECISION BRIEF', reportPreviewTitle:'Current scenario summary', reportFooter:'Synthetic or user-entered data. Validate all inputs before using the analysis for operational decisions.',
      methodEyebrow:'TRANSPARENCY BY DESIGN', methodTitle:'Methodology & References', methodIntro:'Every result should be traceable to an equation, unit, input and explicit limitation.', fsplTitle:'Free-space path loss', fsplDesc:'Frequency in GHz; slant range in km; result in dB.', cn0Title:'Carrier-to-noise density', cn0Desc:'EIRP in dBW, path loss in dB, G/T in dB/K, result in dB-Hz.', ebn0Title:'Energy per bit to noise density', ebn0Desc:'Information bit rate Rb in bit/s; result in dB.', combinedTitle:'Combine independent impairments', combinedDesc:'Ratios must share a consistent carrier reference and bandwidth.', occupancyTitle:'Approximate occupied span', occupancyDesc:'Approximation for screening; spectral masks and system details matter.', availabilityFormulaTitle:'Availability from outage hours', availabilityFormulaDesc:'Arithmetic from supplied annual outage hours, not a propagation prediction.', eirpFormulaTitle:'EIRP from transmitter chain', eirpFormulaDesc:'Power in dBW, antenna gain in dBi and feed/chain losses in dB.', gtFormulaTitle:'Receive figure of merit', gtFormulaDesc:'Antenna gain in dBi; equivalent system noise temperature in kelvin; result in dB/K.', spectralEfficiencyTitle:'Net spectral efficiency', spectralEfficiencyDesc:'Approximate bit/s/Hz from user-entered net bit rate and estimated occupied span.', oboFormulaTitle:'Composite OBO power budget', oboFormulaDesc:'Screening approximation; saturation output and allocated carrier power need a consistent reference plane.', referenceFormula:'REFERENCE FORMULA', scopeBoundary:'MODEL BOUNDARIES', implementedVsNot:'What is implemented—and what is not', implementedNow:'Implemented in this prototype', impl1:'Unit-aware FSPL, C/N₀, C/N, Eb/N₀ and residual margin calculation', impl2:'Reciprocal-linear combining of dB ratios', impl3:'Approximate bandwidth occupancy and output-power budget screening', impl4:'Availability arithmetic from supplied annual outage hours', impl5:'CSV parsing and deterministic trend heuristics', notIncluded:'Not included / requires further engineering', not1:'ITU-R P.618 Earth-space rain attenuation and availability prediction', not2:'DVB-S2/S2X MODCOD threshold database or frame-overhead modelling', not3:'Payload-specific intermodulation, spectral regrowth or OBO-dependent C/N degradation', not4:'Regulatory coordination, interference certification or live telemetry integrations', not5:'AI model diagnosis; current triage is deterministic and rule-based', referenceSources:'REFERENCE SOURCES', verifyBeforeUse:'Verify before operational use', ituNote:'Reference only. The standard\'s prediction method is not implemented in this prototype.', dvbNote:'Use the applicable published specification and modem/vendor thresholds for real MODCOD decisions.', selfCheck:'SELF-CHECK', calculationChecks:'Calculation-layer sanity checks', runChecks:'Run checks',
      roadmapEyebrow:'PRODUCT EVOLUTION', roadmapTitle:'From engineering lab to operator intelligence', roadmapIntro:'A staged roadmap protects technical credibility: ship transparent calculations first, then evidence-led troubleshooting, then authorized operator integrations.', currentStage:'CURRENT MVP', planned:'PLANNED', roadmapOne:'Interactive Engineering MVP', roadmapOneDesc:'Responsive PWA; RF Link Budget; Transponder Capacity screening; Rain Fade & Availability what-if; report exports; methodology and self-checks.', roadmapOneItem1:'Browser-first and installable on supported Android browsers over HTTPS', roadmapOneItem2:'Local synthetic demo and user-entered inputs', roadmapOneItem3:'Transparent formulas, units and warnings', roadmapTwo:'AI Troubleshooting', roadmapTwoDesc:'Expand data import, validate schemas/units, trend C/N, BER, MODCOD and power, and rank hypotheses with supporting evidence and missing measurements.', roadmapTwoItem1:'Add threshold profiles and operator-specific alarm rules', roadmapTwoItem2:'Compare synchronized weather, RF and equipment logs', roadmapTwoItem3:'Add an AI explanation layer only after deterministic checks', roadmapThree:'Operator Intelligence', roadmapThreeDesc:'Authorized telemetry, capacity planning, resilience scenarios and technical-to-commercial decision briefs under role-based access.', roadmapThreeItem1:'Operator/vendor data integrations with permission', roadmapThreeItem2:'Payload- and service-specific validated models', roadmapThreeItem3:'Security, audit logs and controlled deployment', collabTitle:'Build a proof of value with a real engineering team', collabText:'The next step is validation with domain experts and anonymized, authorized measurements—not an unsupported claim of production readiness.', viewReports:'View report tools', footerNote:'Independent engineering prototype · Not affiliated with any satellite operator.',
      marginPositive:'Above entered target', marginNear:'Near zero under current assumptions', marginNegative:'Below target under current assumptions', bandwidthOver:'Bandwidth limit exceeded', powerOver:'Power budget exceeded', bothOver:'Bandwidth and power limits exceeded', bandwidthMost:'Bandwidth is the leading screening constraint', powerMost:'Power is the leading screening constraint', bothPass:'Both simplified capacity checks pass', constraintBandwidth:'Bandwidth', constraintPower:'Power', constraintBoth:'Bandwidth + power', ok:'Within screening limit', exceeds:'Exceeds screening limit', notCalculated:'Cannot calculate: review inputs', current:'Current', notAvailable:'N/A', directionDown:'Downlink', directionUp:'Uplink', inputErrors:'Please review the highlighted inputs:', reportLink:'RF Link Budget', reportCapacity:'Transponder Capacity', reportAvailability:'Rain Fade & Availability', reportTriage:'Measurement Triage', reportInputs:'Model inputs', reportOutputs:'Calculated outputs', reportLimitations:'Assumptions & limitations', noTriage:'No CSV analysis has been loaded for this session.', removal:'Remove', carrierLabel:'Carrier', noRows:'No data rows', analysisWarning:'Heuristic analysis only', sampleLoaded:'Synthetic CSV sample loaded and analyzed.', reportAdded:'Current scenario added to the report context.', marginCopied:'Residual margin copied to the availability lab.', checksPassed:'sanity checks passed', checksFailed:'sanity check(s) failed', fileReadError:'Could not read the selected file.', csvErrorPrefix:'CSV error: ', exported:'Report exported.', printHint:'Use the print dialog to save this report as PDF.', scenarioLoaded:'Example scenario loaded.', resetDone:'Defaults restored.',
      eirpDownlink:"Satellite transmit EIRP (dBW)",
      eirpUplink:"Earth-station transmit EIRP (dBW)",
      eirpDownlinkHelp:"Downlink example: satellite transmit EIRP toward the receiving earth station.",
      eirpUplinkHelp:"Uplink example: earth-station transmit EIRP toward the satellite.",
      gtDownlink:"Earth-station receive G/T (dB/K)",
      gtUplink:"Satellite receive G/T (dB/K)",
      gtDownlinkHelp:"Downlink example: receiving earth-station G/T.",
      gtUplinkHelp:"Uplink example: satellite receiving G/T.",
      applyDirectionProfile:"Load example & calculate",
      directionProfileApplied:"Direction-specific illustrative values loaded and recalculated. Replace them with validated link data before relying on the result.",
      linkFormulaGuideTitle:"Formula and symbol guide — how the link result is calculated",
      linkFsplMeaning:"LFS is free-space spreading loss; frequency is in GHz and slant range in km. It excludes atmospheric and equipment losses.",
      linkPathLossMeaning:"Lpath = LFS + additional losses. Enter each non-free-space loss required by the path once; avoid double-counting.",
      linkCn0Meaning:"Output is dB-Hz. EIRP is in dBW and G/T in dB/K. Both must describe the same modeled uplink or downlink path.",
      linkCnMeaning:"BN is the equivalent noise bandwidth in Hz. Convert MHz to Hz by multiplying by 1,000,000; occupied bandwidth is not always identical.",
      linkEbn0Meaning:"Rb is information bit rate in bit/s. The required Eb/N0 threshold depends on modem, MODCOD, FEC and service conditions.",
      linkMarginMeaning:"Raw margin is Eb/N0 above the required threshold. Residual margin subtracts implementation margin and fade reserve.",
      symbol:"Symbol",
      symbolMeaning:"Meaning and units",
      symbolEirp:"Transmit equivalent isotropically radiated power, dBW; satellite on downlink, earth station on uplink.",
      symbolGt:"Receive figure of merit, dB/K; earth station on downlink, satellite on uplink.",
      symbolLoss:"Free-space loss / total modeled path loss, dB.",
      symbolNoiseBw:"Equivalent noise bandwidth in Hz, not necessarily the same as occupied bandwidth.",
      symbolBitRate:"Information bit rate in bit/s.",
      symbolRequiredThreshold:"Required modem/MODCOD threshold in dB, supplied from validated equipment/service data.",
      symbolImplFade:"Implementation margin and fade reserve, each in dB.",
      combinedGuideTitle:"What does “Calculate combined” mean?",
      combinedGuideDesc:"This calculates the equivalent C/N or C/I ratio after independent noise/interference contributions are combined in linear power, relative to the same wanted carrier.",
      combinedGuideItem1:"xi is each entered component ratio in dB.",
      combinedGuideItem2:"Convert each ratio into its reciprocal linear contribution, add these contributions, then convert the aggregate result back to dB.",
      combinedGuideItem3:"Two equal 20 dB contributions combine to about 16.99 dB—not 40 dB or 20 dB.",
      combinedGuideCaveat:"Only combine ratios with a consistent wanted-carrier reference, bandwidth and measurement point. Do not mix incompatible measurements.",
      hpaSaturationOut:"HPA saturation output",
      unitDbw:"Power (dBW)",
      unitWatt:"Power (W)",
      hpaConvertHelp:"P(W) = 10^(P(dBW)/10); P(dBW) = 10 log10(P(W)/1 W). The two fields update each other.",
      hpaConvertStatus:"20 dBW = 100 W",
      capacityGuideTitle:"How to read Spectrum Occupancy and Power Budget",
      capacityBandwidthCard:"1 · Bandwidth budget",
      capacityBandwidthDesc:"Available bandwidth is usable bandwidth minus reserved bandwidth. Demo: 36 − 2 = 34 MHz.",
      capacityCarrierCard:"2 · Occupied span per carrier",
      capacityCarrierDesc:"Rs is symbol rate in Msym/s; α is dimensionless roll-off; guard is in MHz. The model estimates occupied span but does not simulate spectral masks or overlap.",
      capacityUtilCard:"3 · Utilization and headroom",
      capacityUtilDesc:"Utilization is total estimated occupied span divided by available bandwidth. Headroom is the remaining MHz. Positive headroom is not automatically sellable capacity.",
      capacityPowerCard:"4 · HPA operating power budget",
      capacityPowerDesc:"20 dBW = 100 W at saturation. With 3 dB OBO, the simplified operating budget is 10^1.7 ≈ 50.12 W. dBW is referenced to 1 W; do not add dBW values as though they were watts.",
      capacityLoadingCard:"5 · Power loading",
      capacityLoadingDesc:"Sum carrier powers in watts and compare with the OBO-adjusted budget, with all values at the same reference plane. This does not model amplifier nonlinearity or intermodulation.",
      capacityRateCard:"6 · Net rate and screening constraint",
      capacityRateDesc:"Aggregate rate sums entered net Mbps; η estimates net bit/s/Hz. The leading constraint compares simplified bandwidth and power loading—it is a screening hint, not an optimizer or an operator-approved capacity decision.",
      availabilityGuideTitle:"Rain Fade & Availability: formulas and plain-language guide",
      availabilityBaselineFormulaTitle:"1 · Baseline availability",
      availabilityBaselineFormulaDesc:"Hbase is the entered annual outage duration in hours. 8,760 approximates a 365-day year; this is arithmetic, not a rain model.",
      availabilityScenarioFormulaTitle:"2 · Scenario outage hours",
      availabilityScenarioFormulaDesc:"r is the hypothetical outage reduction percentage. The tool assumes the reduction entered by the user; it does not prove a mitigation will achieve it.",
      availabilityScenarioAvailabilityTitle:"3 · Scenario availability and saved hours",
      availabilityScenarioAvailabilityDesc:"This compares supplied baseline outage hours with the hypothetical scenario after applying the reduction percentage.",
      availabilityMarginFormulaTitle:"4 · Remaining fade margin",
      availabilityMarginFormulaDesc:"Subtract illustrative fade depth from supplied residual link margin after adding assumed recovery. Negative means the scenario is below zero margin in this simplified model.",
      availabilityChartFormulaTitle:"5 · Reading the chart",
      availabilityChartFormulaDesc:"Horizontal x-axis: illustrative fade depth (dB). Vertical y-axis: remaining margin (dB). The marker is the selected scenario; the zero line shows where the model crosses zero.",
      availabilityInputsFormulaTitle:"6 · Input meanings and limits",
      availabilityInputsFormulaDesc:"Current residual margin is imported only when Use current is clicked. Fade depth and mitigation recovery are assumed dB values. The model does not convert rainfall or margin into outage probability; ITU-R P.618 is not implemented.",
      roadmapTwoOutputKicker:"PHASE 02 · VALIDATION GATE",
      roadmapTwoOutputTitle:"AI Troubleshooting — target deliverables",
      roadmapTwoOutput1:"A schema-and-units validation report before trend analysis.",
      roadmapTwoOutput2:"A synchronized timeline for RF, BER/MODCOD, equipment alarms and weather records.",
      roadmapTwoOutput3:"Ranked hypotheses with evidence, confidence rationale and missing measurements—not unsupported definitive diagnoses.",
      roadmapTwoOutput4:"A deterministic rules baseline validated by engineers before an AI explanation layer is introduced.",
      roadmapThreeOutputKicker:"PHASE 03 · GOVERNED PILOT",
      roadmapThreeOutputTitle:"Operator Intelligence — target deliverables",
      roadmapThreeOutput1:"Approved connectors and least-privilege access to telemetry and planning systems.",
      roadmapThreeOutput2:"Payload- and service-specific models checked against approved vendor/operator references.",
      roadmapThreeOutput3:"Capacity and resilience scenarios connected to transparent assumptions and, where authorized, commercial inputs.",
      roadmapThreeOutput4:"Role-based access, audit trails, retention rules, security review and controlled deployment with a named pilot owner.",
      hpaConvertInvalidDbw:"Enter a finite dBW value to calculate watts.",
      hpaConvertInvalidWatts:"Enter a positive watt value to calculate dBW.",
      implemented:"IMPLEMENTED",
      symbolFrequency:"Frequency in GHz used by the FSPL equation.",
      symbolDistance:"Slant range in km between the terminals being modeled.",
      symbolAdditionalLoss:"User-entered non-free-space path losses, in dB.",
      symbolCn0:"Carrier-to-noise power spectral density ratio, dB-Hz.",
      symbolCn:"Carrier-to-noise power ratio within the equivalent noise bandwidth, dB.",
      symbolEbn0:"Energy per information bit divided by noise spectral density, dB.",
      symbolMargins:"Raw threshold margin and residual margin after reserves, dB.",
      navLearning:"Guided Learning",
      pageTitleLearning:"Guided Engineering Walkthrough",
      learningEyebrow:"ENGINEERING WALKTHROUGH / PRACTICE CASE",
      learningTitle:"Learn the model: from numbers to a decision",
      learningIntro:"A guided, synthetic example for trainees. Follow the inputs, inspect the equations, interpret the outputs, and identify what you would validate before a real operational decision.",
      learningDemoStamp:"SYNTHETIC CASE",
      learningCaseKicker:"CASE STUDY · TRAINING ONLY",
      learningCaseTitle:"Can this hypothetical 30 Mbps satellite service meet its link target—and what limits capacity?",
      learningCaseBody:"Imagine you are supporting a satellite capacity-planning team. You must run an initial technical screen, explain the result to a manager, and list the evidence still required before approving a service.",
      learningStatRate:"Target net rate", learningStatFreq:"Downlink example", learningStatRange:"Slant range",
      learningStepOneKicker:"FRAME THE QUESTION", learningStepOneTitle:"Do not start with the result—start with the decision.",
      learningStepOneBody:"Question: does the illustrative downlink have positive residual margin under the entered assumptions, and do the example transponder constraints pass the simplified screening checks?",
      learningQuestionLabel:"Working habit", learningQuestionBody:"Separate the link-quality question from the bandwidth/power-capacity question. One does not prove the other.",
      learningStepTwoKicker:"READ THE INPUTS", learningStepTwoTitle:"Check units and confirm both ends refer to the same path.",
      learningInputCol:"Input", learningValueCol:"Example value", learningMeaningCol:"Why it matters",
      learningEirpMeaning:"Satellite transmit level for this downlink example.", learningFrequencyMeaning:"Used in the free-space path-loss estimate.", learningRangeMeaning:"Approximate satellite-to-terminal path distance.", learningGtMeaning:"Receiving earth-station figure of merit.", learningLossMeaning:"Simplified entered losses beyond free-space spreading.",
      learningInputCaveat:"All values in this teaching case are synthetic. A real assessment needs verified beam EIRP, station G/T, geometry and all applicable loss terms.",
      learningStepThreeKicker:"TRACE THE LINK BUDGET", learningStepThreeTitle:"Every output should be explainable from the previous one.",
      learningEqFspl:"With 12 GHz and 38,000 km, free-space loss ≈ 205.63 dB.", learningEqPath:"205.63 + 2 ≈ 207.63 dB total modeled path loss.", learningEqCn0:"50 − 207.63 + 22 + 228.6 ≈ 92.97 dB-Hz.", learningEqEbn0:"At 30 Mbps, Eb/N₀ ≈ 18.20 dB.", learningEqMargin:"18.20 − 5 − 1.5 − 3 ≈ 8.70 dB residual margin.", learningLinkConclusion:"Initial link-screen conclusion", learningLinkConclusionHelp:"Positive under these entered assumptions—not a certified link budget.", learningOpenLink:"Open RF Link Budget Lab",
      learningStepFourKicker:"SCREEN THE TRANSPONDER", learningStepFourTitle:"Find the leading constraint—but do not oversell the spare capacity.",
      learningOccupied:"Occupied span", learningAvailable:"Available bandwidth", learningUtilization:"Bandwidth utilization", learningHeadroom:"Bandwidth headroom", learningHpa:"HPA saturation", learningOperatingBudget:"Estimated operating budget", learningPowerAllocated:"Allocated carrier power", learningPowerLoad:"Power loading", learningAggregateRate:"Aggregate net rate", learningSpectralEfficiency:"Net spectral efficiency",
      learningCapacityInterpretation:"In this simplified screen, bandwidth utilization is the leading constraint because it is the more heavily used of the two indicators. The remaining 5.5 MHz is not automatically available for sale: check spectral placement, guard bands, interference, HPA operating conditions and service-specific requirements.", learningOpenCapacity:"Open Transponder Capacity Lab",
      learningStepFiveKicker:"STRESS THE SCENARIO", learningStepFiveTitle:"Ask what changes if the fade assumption gets worse.",
      learningEqFade:"8.7 + 2 − 6 = +4.7 dB in the current illustrative scenario.", learningEqFadeWorse:"If the assumed fade depth rises to 12 dB, the simplified remaining margin crosses below zero.", learningEqAvailability:"8.76 annual outage hours gives 99.9% arithmetic availability. A hypothetical 25% outage reduction gives 6.57 hours and 99.925%.",
      learningLimitTitle:"Important limit", learningLimitBody:"Fade-margin sensitivity and annual availability arithmetic are separate calculations here. This page does not infer outage probability from fade margin or implement ITU-R P.618.", learningOpenAvailability:"Open Rain Fade & Availability",
      learningStepSixKicker:"TURN CALCULATIONS INTO ACTION", learningStepSixTitle:"A good engineer explains the decision and the missing evidence.",
      learningWorkOne:"State what was assessed: a hypothetical 30 Mbps downlink and a separate example multi-carrier plan.", learningWorkTwo:"Show the key calculated results, units, thresholds, reserves and assumptions.", learningWorkThree:"Identify the leading screening constraint and the next measurements/documents needed.", learningWorkFour:"Ask for validated EIRP/G/T, modem/MODCOD threshold, payload limits, spectral plan and measured outage history.", learningWorkFive:"Export a decision brief for technical review; do not treat the output as an operational approval.",
      learningOpenReports:"Build a decision report", learningReadMethodology:"Review methodology", learningTakeawayTitle:"The lesson", learningTakeawayBody:"Use the model to structure a question, inspect relationships, compare what-if scenarios and communicate limitations. Use validated engineering models and authorized data before a real network decision.",
      symbolCombined:"Each component C/N or C/I ratio in the combined-impairment tool, using a common wanted-carrier reference."
    },
    ar: {
      workspace:'مساحة العمل', analysis:'التحليل', navOverview:'مركز القرار', navLink:'ميزانية الوصلة RF', navCapacity:'سعة الترانسبوندر', navAvailability:'التوهين المطري والتوافر', navTroubleshooting:'فرز القياسات', navReports:'تقارير القرار', navMethodology:'المنهجية والمراجع', navRoadmap:'خارطة المنتج', authorRole:'هندسة الاتصالات والبث', syntheticLabel:'بيانات اصطناعية / مدخلة', product:'ذكاء عمليات الأقمار الصناعية', demoBadge:'عرض تجريبي · بيانات اصطناعية', theme:'المظهر', install:'تثبيت', heroEyebrow:'الهندسة · العمليات · القرارات', heroTitle:'من معلمات الترددات<br><em>إلى قرارات أفضل.</em>', heroBody:'مختبر هندسي شفاف لفحص ميزانية الوصلة، واختبار سيناريوهات الترانسبوندر، واستكشاف افتراضات الانقطاع، وتحويل الحسابات إلى تقارير قرار.', openLinkLab:'افتح مختبر ميزانية الوصلة', loadScenario:'تحميل سيناريو تجريبي', heroFootnote:'لا يوجد اتصال حي بقمر صناعي أو محطة أرضية أو قياسات مشغّل.', liveModel:'مخرجات النموذج المباشرة', decisionSnapshot:'ملخص القرار', snapshotNote:'تُعاد الحسابات وفق مدخلات السيناريو القابلة للتعديل', metricMargin:'هامش الوصلة المتبقي', metricBandwidth:'استخدام عرض النطاق', metricPower:'تحميل القدرة', metricRate:'معدل البيانات الصافي الإجمالي', demoOnly:'قيمة سيناريو · ليست التزام خدمة', decisionEngine:'محرك القرار', whatIf:'تفسير سيناريو «ماذا لو»', bandwidthHeadroom:'هامش عرض النطاق', powerHeadroom:'هامش القدرة', inspectCapacity:'افحص نموذج السعة', quickAccess:'وصول سريع', engineeringLabs:'المختبرات الهندسية', labLinkTitle:'ميزانية وصلة RF', labLinkSub:'FSPL وC/N₀ وC/N وEb/N₀ والهامش', labCapacityTitle:'سعة الترانسبوندر', labCapacitySub:'فحص النطاق وقدرة مضخم HPA', labRainTitle:'سيناريو التوافر', labRainSub:'حساب ساعات الانقطاع وسيناريو التوهين', labTriageTitle:'فرز القياسات', labTriageSub:'اتجاهات CSV وخطوات تحقق مستندة إلى الأدلة', globalDisclaimer:'أداة فحص هندسي أولي فقط. تعتمد الرسوم والنتائج على قيم اصطناعية أو مدخلاتك. تحقّق منها باستخدام بيانات المورد والحمولة والمشغّل قبل استخدامها في شبكة فعلية.', readMethod:'اقرأ المنهجية',
      pageTitleOverview:'مركز القرار', pageTitleLink:'مختبر ميزانية الوصلة', pageTitleCapacity:'مختبر سعة الترانسبوندر', pageTitleAvailability:'التوهين المطري والتوافر', pageTitleTroubleshooting:'فرز القياسات', pageTitleReports:'تقارير القرار الهندسي', pageTitleMethodology:'المنهجية والمراجع', pageTitleRoadmap:'خارطة المنتج', linkEyebrow:'هندسة RF / 01', linkTitle:'مختبر ميزانية الوصلة RF', linkIntro:'احسب عناصر الوصلة الهابطة أو الصاعدة، وتتبّع كل خطوة من فقد الفضاء الحر إلى هامش Eb/N₀ المتبقي.', linkInputs:'معلمات الوصلة', linkInputsSub:'استخدم قيمًا تخص المسار نفسه.', reset:'إعادة ضبط', direction:'اتجاه الوصلة', directionHelp:'المعادلات الأساسية واحدة؛ يجب أن تطابق المدخلات المسار المحدد.', eirp:'EIRP (dBW)', eirpHelp:'القدرة المشعة المكافئة عند طرف الإرسال في المسار النموذجي.', frequency:'التردد (GHz)', range:'المدى المائل (كم)', additionalLoss:'فواقد المسار الإضافية (dB)', lossHelp:'أدخل الفواقد غير الحرة مرة واحدة وتجنب احتسابها مرتين.', gt:'G/T للاستقبال (dB/K)', noiseBw:'عرض نطاق الضوضاء (MHz)', bitRate:'معدل بيانات المعلومات (Mbps)', requiredEbN0:'Eb/N₀ المطلوب (dB)', requiredHelp:'يُحدد حسب المودم وMODCOD وظروف الخدمة المستهدفة.', implMargin:'هامش التنفيذ (dB)', fadeReserve:'احتياطي التوهين (dB)', useMargin:'إرسال الهامش المتبقي إلى مختبر التوافر', exportCurrent:'إضافة إلى التقرير', calculatedLive:'حساب مباشر', linkResults:'نتائج الوصلة', residualMargin:'الهامش المتبقي', afterReserves:'بعد طرح Eb/N₀ المطلوب وهامش التنفيذ واحتياطي التوهين', equationTrace:'تسلسل الحساب', unitsExplicit:'الوحدات موضحة', combinedToolTitle:'جمع اختلالات C/N أو C/I', combinedToolTag:'جمع خطي', combinedInputLabel:'نسب المكونات بالديسيبل (مفصولة بفواصل)', combinedToolHelp:'مثال: 20, 18, 16. يجب أن تشترك القيم في مرجع الحامل وعرض النطاق نفسيهما.', calculateCombined:'احسب النسبة المجمعة', combinedWaiting:'أدخل نسبتين بالديسيبل على الأقل.', combinedInvalid:'أدخل نسبتين صالحـتين على الأقل من قيم الديسيبل.', combinedResultLabel:'النسبة المجمعة', linkCaveat:'مساعد تخطيط وليس ميزانية وصلة معتمدة. يجب إضافة فواقد الغلاف الجوي والاستقطاب والتنفيذ وغيرها عند انطباقها.',
      capacityEyebrow:'تخطيط السعة / 02', capacityTitle:'مختبر سعة الترانسبوندر', capacityIntro:'افحص النطاق الطيفي والقدرة المخصصة لخطة افتراضية متعددة الحوامل. تصور الطيف توضيحي وليس نموذجًا لحمولة قمر محددة.', capacityInputs:'قيود الترانسبوندر', capacityInputsSub:'يجب أن تستخدم قدرات الحوامل مستوى مرجعيًا واحدًا.', usableBw:'عرض النطاق القابل للاستخدام (MHz)', reservedBw:'عرض النطاق المحجوز (MHz)', hpaSat:'قدرة تشبع HPA عند الخرج (dBW)', compositeObo:'الابتعاد المركب عن التشبع OBO (dB)', carrierPlan:'خطة الحوامل', carrierPlanSub:'العرض المشغول التقريبي ≈ معدل الرموز × (1 + roll-off) + الحاجز.', addCarrier:'إضافة حامل', carrier:'الحامل', symbolRate:'معدل الرموز', rolloff:'Roll-off', guard:'الحاجز', allocatedPower:'القدرة المخصصة', netRate:'المعدل الصافي', occupied:'المشغول', spectrumOccupancy:'إشغال الطيف', bandwidthBudget:'ميزانية النطاق', utilized:'مستخدم', spectrumNote:'يتناسب العرض مع قيم النطاق المشغول؛ ولا يحاكي الشكل الطيفي أو التداخل بين الحوامل.', powerBudget:'ميزانية القدرة', hpaLoading:'تحميل قدرة HPA', aggregateRate:'معدل البيانات الصافي الإجمالي', totalAllocatedPower:'إجمالي قدرة الحوامل المخصصة', spectralEfficiency:'الكفاءة الطيفية الصافية', bindingConstraint:'القيد الأساسي في الفحص', capacityCaveat:'فحص أولي فقط: لا يحاكي استجابة تردد الحمولة أو التداخل البيني أو إعادة نمو الطيف أو EIRP لكل حامل أو تدهور C/N مع OBO أو التنسيق التنظيمي. النطاق المتاح ليس بالضرورة سعة قابلة للبيع.',
      availabilityEyebrow:'مرونة الخدمة / 03', availabilityTitle:'التوهين المطري والتوافر', availabilityIntro:'اختبر ضغط هامش التوهين وقارن افتراضات ساعات الانقطاع. لا يستنتج هذا المختبر الانقطاع السنوي من هامش RF.', resilienceInputs:'سيناريو المرونة', resilienceInputsSub:'أدخل خط أساس للانقطاع وأثرًا افتراضيًا لإجراء تخفيف.', linkMarginInput:'هامش الوصلة المتبقي حاليًا (dB)', useCurrent:'استخدام الحالي', linkMarginHelp:'يُنقل من مختبر الوصلة فقط عند اختيارك ذلك.', fadeDepth:'عمق توهين افتراضي (dB)', recovery:'استرداد افتراضي من المعالجة (dB)', annualOutage:'ساعات الانقطاع السنوية الأساسية (ساعة)', annualOutageHelp:'استخدم ساعات مقاسة أو مفترضة. السنة الحسابية هنا 8760 ساعة.', outageReduction:'خفض افتراضي للانقطاع (%)', addToReport:'إضافة السيناريو إلى التقرير', scenarioOutputs:'مخرجات السيناريو', availabilityResults:'مقارنة التوافر', baselineAvailability:'التوافر الأساسي', scenarioAvailability:'توافر السيناريو', hoursSaved:'ساعات الانقطاع التي تم تجنبها افتراضيًا', remainingMargin:'هامش التوهين المتبقي', belowTarget:'أقل من الصفر', aboveTarget:'هامش موجب', availabilityCaveat:'لم يُنفذ معيار ITU-R P.618 هنا. يحتاج التنبؤ الموثوق بالتوافر إلى الموقع والتردد وزاوية الارتفاع ومدخلات المناخ والإحصاءات وافتراضات النظام.', fadeSensitivity:'حساسية التوهين', fadeChartTitle:'هامش التوهين المتبقي مقابل عمق التوهين', fadeChartDescription:'يوضح المنحنى استجابة الهامش المبسطة عند تغيير عمق التوهين الافتراضي. وتمثل العلامة السيناريو الحالي.', fadeDepthAxis:'عمق التوهين الافتراضي (dB)', remainingMarginAxis:'الهامش المتبقي (dB)', currentFadeScenario:'السيناريو الحالي', selectedFadeScenario:'سيناريو التوهين المحدد', remainingMarginCurve:'منحنى الهامش المتبقي', zeroMarginThreshold:'حد الهامش الصفري', fadeChartCaveat:'تحليل حساسية خطي توضيحي فقط: الهامش المتبقي = هامش الوصلة الحالي + استرداد التخفيف المفترض − عمق التوهين. هذا ليس تنبؤًا بالتوهين المطري أو التوافر وفق ITU-R P.618.', chartLoading:'سيُحدّث الرسم وفق مدخلات السيناريو.', chartUnavailable:'تعذر عرض الرسم: راجع مدخلات السيناريو.',
      triageEyebrow:'دعم العمليات / تجريبي', triageTitle:'فرز القياسات', triageIntro:'حمّل ملف CSV مصرحًا به لمراجعة اتجاهات بسيطة في C/N وBER وقدرة الاستقبال. النتائج فرضيات لمراجعة المهندس وليست أسبابًا جذرية مؤكدة.', uploadCsv:'تحليل ملف قياسات CSV', uploadHelp:'قد تتضمن الأعمدة timestamp وC/N (dB) وBER وقدرة الاستقبال. تُطابق أسماء الأعمدة مع تسميات شائعة، لكن يلزم مراجعة الوحدات والفاصل الزمني.', chooseCsv:'اختيار ملف CSV', loadSampleCsv:'تحميل عينة اصطناعية', noFile:'لم يتم اختيار ملف. تتم المعالجة محليًا في هذا المتصفح.', dataQuality:'جودة البيانات', measurementPreview:'معاينة القياسات', waitingForFile:'بانتظار CSV', previewEmpty:'اختر ملفًا أو حمّل العينة لمعاينة الصفوف.', heuristicReview:'مراجعة استدلالية', hypotheses:'الفرضيات وخطوات التحقق التالية', triageEmpty:'لا يوجد تحليل بعد. حمّل ملف CSV لعرض الاتجاهات وخطوات التحقق.',
      reportsEyebrow:'التواصل الهندسي / 04', reportsTitle:'تقارير القرار الهندسي', reportsIntro:'اجمع مخرجات النموذج والافتراضات والتحذيرات في تقرير مختصر للمراجعة الفنية.', buildReport:'إنشاء موجز قرار', buildReportSub:'يتضمن التقرير النتائج المحسوبة وحدود النموذج. ولا يعني اعتمادًا أو موافقة من مشغّل.', downloadJson:'تنزيل JSON', downloadCsv:'تنزيل ملخص CSV', printPdf:'طباعة / حفظ PDF', decisionBrief:'موجز قرار هندسي', reportPreviewTitle:'ملخص السيناريو الحالي', reportFooter:'بيانات اصطناعية أو مدخلة من المستخدم. تحقّق من المدخلات قبل استخدام التحليل في قرارات تشغيلية.',
      methodEyebrow:'الشفافية في التصميم', methodTitle:'المنهجية والمراجع', methodIntro:'يجب ربط كل نتيجة بمعادلة ووحدة ومدخل وحدود واضحة.', fsplTitle:'فقد المسار في الفضاء الحر', fsplDesc:'التردد بوحدة GHz والمدى المائل بالكيلومتر؛ النتيجة بالديسيبل.', cn0Title:'نسبة الحامل إلى كثافة الضوضاء', cn0Desc:'EIRP بوحدة dBW، وفقد المسار بالديسيبل، وG/T بوحدة dB/K؛ الناتج dB-Hz.', ebn0Title:'طاقة البت إلى كثافة الضوضاء', ebn0Desc:'معدل البيانات Rb بوحدة bit/s؛ النتيجة بالديسيبل.', combinedTitle:'جمع الاختلالات المستقلة', combinedDesc:'يجب أن تشترك النسب في مرجع الحامل وعرض النطاق نفسيهما.', occupancyTitle:'النطاق المشغول التقريبي', occupancyDesc:'تقريب للفحص الأولي؛ تؤثر الأقنعة الطيفية وتفاصيل النظام على النتيجة.', availabilityFormulaTitle:'التوافر من ساعات الانقطاع', availabilityFormulaDesc:'حساب من ساعات الانقطاع السنوية المدخلة وليس تنبؤًا بالانتشار.', eirpFormulaTitle:'EIRP من سلسلة الإرسال', eirpFormulaDesc:'القدرة بالديسيبل واط، وكسب الهوائي بالديسيبل متساوي الخواص، وفواقد المسار بالديسيبل.', gtFormulaTitle:'مقياس جودة الاستقبال G/T', gtFormulaDesc:'كسب الهوائي dBi ودرجة حرارة ضوضاء النظام المكافئة بالكلفن؛ الناتج dB/K.', spectralEfficiencyTitle:'الكفاءة الطيفية الصافية', spectralEfficiencyDesc:'تقدير bit/s/Hz من معدل البيانات الصافي المدخل وعرض النطاق المشغول التقريبي.', oboFormulaTitle:'ميزانية القدرة مع OBO المركب', oboFormulaDesc:'تقريب للفحص الأولي؛ يجب أن يشترك خرج التشبع وقدرة الحوامل المخصصة في مستوى مرجعي متسق.', referenceFormula:'معادلة مرجعية', scopeBoundary:'حدود النموذج', implementedVsNot:'ما تم تنفيذه وما لم يتم', implementedNow:'منفّذ في هذا النموذج الأولي', impl1:'حساب FSPL وC/N₀ وC/N وEb/N₀ وهامش الوصلة مع مراعاة الوحدات', impl2:'الجمع الخطي العكسي لنسب الديسيبل', impl3:'فحص تقريبي لإشغال النطاق وميزانية قدرة الخرج', impl4:'حساب التوافر من ساعات الانقطاع السنوية المدخلة', impl5:'تحليل CSV واستدلالات اتجاهات حتمية', notIncluded:'غير مشمول / يحتاج إلى هندسة إضافية', not1:'تنبؤ ITU-R P.618 بتوهين المطر والتوافر في وصلات الأرض والفضاء', not2:'قاعدة عتبات MODCOD لـ DVB-S2/S2X أو نمذجة أعباء الإطارات', not3:'التداخل البيني الخاص بالحمولة أو إعادة نمو الطيف أو تدهور C/N المعتمد على OBO', not4:'التنسيق التنظيمي أو اعتماد التداخل أو الربط بالقياسات الحية', not5:'تشخيص بواسطة نموذج ذكاء اصطناعي؛ الفرز الحالي حتمي وقائم على قواعد', referenceSources:'المراجع', verifyBeforeUse:'تحقق قبل الاستخدام التشغيلي', ituNote:'مرجع فقط. طريقة التنبؤ في المعيار غير منفذة في هذا النموذج.', dvbNote:'استخدم المواصفة المنشورة المناسبة وعتبات المودم/المورد لاتخاذ قرارات MODCOD الفعلية.', selfCheck:'الفحص الذاتي', calculationChecks:'اختبارات معقولية طبقة الحساب', runChecks:'تشغيل الفحوصات',
      roadmapEyebrow:'تطور المنتج', roadmapTitle:'من المختبر الهندسي إلى ذكاء المشغّل', roadmapIntro:'يحمي التنفيذ المرحلي المصداقية الفنية: نبدأ بحسابات شفافة، ثم استكشاف أعطال مبني على الأدلة، ثم تكاملات مشغّلين مصرح بها.', currentStage:'النموذج الحالي', planned:'مخطط له', roadmapOne:'النموذج الهندسي التفاعلي', roadmapOneDesc:'تطبيق ويب تقدمي متجاوب؛ ميزانية الوصلة؛ فحص سعة الترانسبوندر؛ سيناريو التوهين والتوافر؛ تصدير التقارير؛ المنهجية والفحوصات.', roadmapOneItem1:'يعمل عبر المتصفح وقابل للتثبيت على متصفحات أندرويد المدعومة عبر HTTPS', roadmapOneItem2:'عرض اصطناعي محلي ومدخلات المستخدم', roadmapOneItem3:'معادلات ووحدات وتحذيرات واضحة', roadmapTwo:'استكشاف الأعطال بالذكاء الاصطناعي', roadmapTwoDesc:'توسيع استيراد البيانات والتحقق من البنية والوحدات وتحليل اتجاهات C/N وBER وMODCOD والقدرة وترتيب الفرضيات بالأدلة والقياسات الناقصة.', roadmapTwoItem1:'إضافة حدود إنذار وقواعد خاصة بالمشغّل', roadmapTwoItem2:'مقارنة سجلات الطقس وRF والمعدات المتزامنة', roadmapTwoItem3:'إضافة طبقة تفسير بالذكاء الاصطناعي بعد الفحوصات الحتمية', roadmapThree:'ذكاء المشغّل', roadmapThreeDesc:'قياسات مصرح بها وتخطيط السعة وسيناريوهات المرونة وتقارير تربط الهندسة بالتجارة مع صلاحيات قائمة على الأدوار.', roadmapThreeItem1:'تكامل بيانات المشغّل/المورد بإذن', roadmapThreeItem2:'نماذج معتمدة خاصة بالحمولة والخدمة', roadmapThreeItem3:'الأمان وسجلات التدقيق والنشر المنضبط', collabTitle:'بناء تجربة إثبات قيمة مع فريق هندسي حقيقي', collabText:'الخطوة التالية هي التحقق مع خبراء المجال وباستخدام قياسات مجهّلة ومصرح بها، لا ادعاء جاهزية إنتاجية دون دليل.', viewReports:'عرض أدوات التقارير', footerNote:'نموذج هندسي مستقل · لا يتبع أي مشغّل أقمار صناعية.',
      marginPositive:'أعلى من الحد المُدخل', marginNear:'قريب من الصفر وفق الافتراضات الحالية', marginNegative:'أقل من الحد وفق الافتراضات الحالية', bandwidthOver:'تم تجاوز حد النطاق', powerOver:'تم تجاوز ميزانية القدرة', bothOver:'تم تجاوز حد النطاق والقدرة', bandwidthMost:'عرض النطاق هو القيد الأبرز في الفحص', powerMost:'القدرة هي القيد الأبرز في الفحص', bothPass:'اجتاز السيناريو فحصي السعة المبسطين', bandwidth:'عرض النطاق', power:'القدرة', constraintBoth:'النطاق + القدرة', ok:'ضمن حد الفحص', exceeds:'يتجاوز حد الفحص', notCalculated:'تعذر الحساب: راجع المدخلات', current:'الحالي', notAvailable:'غير متاح', directionDown:'هابط', directionUp:'صاعد', inputErrors:'يرجى مراجعة المدخلات التالية:', reportLink:'ميزانية الوصلة RF', reportCapacity:'سعة الترانسبوندر', reportAvailability:'التوهين المطري والتوافر', reportTriage:'فرز القياسات', reportInputs:'مدخلات النموذج', reportOutputs:'النتائج المحسوبة', reportLimitations:'الافتراضات والحدود', noTriage:'لم يتم تحميل تحليل CSV في هذه الجلسة.', removal:'حذف', carrierLabel:'حامل', noRows:'لا توجد صفوف بيانات', analysisWarning:'تحليل استدلالي فقط', sampleLoaded:'تم تحميل العينة الاصطناعية وتحليلها.', reportAdded:'أُضيف السيناريو الحالي إلى سياق التقرير.', marginCopied:'تم نسخ الهامش المتبقي إلى مختبر التوافر.', checksPassed:'فحوصات معقولية ناجحة', checksFailed:'فحص/فحوصات لم تنجح', fileReadError:'تعذرت قراءة الملف المحدد.', csvErrorPrefix:'خطأ CSV: ', exported:'تم تصدير التقرير.', printHint:'استخدم نافذة الطباعة لحفظ التقرير بصيغة PDF.', scenarioLoaded:'تم تحميل السيناريو التجريبي.', resetDone:'تمت استعادة القيم الافتراضية.',
      eirpDownlink:"EIRP إرسال القمر (dBW)",
      eirpUplink:"EIRP إرسال المحطة الأرضية (dBW)",
      eirpDownlinkHelp:"مثال الوصلة الهابطة: EIRP القمر باتجاه المحطة الأرضية المستقبلة.",
      eirpUplinkHelp:"مثال الوصلة الصاعدة: EIRP المحطة الأرضية باتجاه القمر.",
      gtDownlink:"G/T استقبال المحطة الأرضية (dB/K)",
      gtUplink:"G/T استقبال القمر (dB/K)",
      gtDownlinkHelp:"مثال الوصلة الهابطة: قيمة G/T للمحطة الأرضية المستقبلة.",
      gtUplinkHelp:"مثال الوصلة الصاعدة: قيمة G/T لمستقبل القمر.",
      applyDirectionProfile:"تحميل مثال الاتجاه والحساب",
      directionProfileApplied:"تم تحميل قيم توضيحية للاتجاه المختار وإعادة الحساب. استبدلها ببيانات وصلة موثّقة قبل الاعتماد على النتيجة.",
      linkFormulaGuideTitle:"دليل المعادلات والرموز: كيف حُسبت نتيجة الوصلة؟",
      linkFsplMeaning:"يرمز LFS إلى فقد الانتشار في الفضاء الحر؛ التردد GHz والمدى المائل km. لا يشمل هذا فواقد الغلاف الجوي أو المعدات.",
      linkPathLossMeaning:"Lpath = LFS + الفواقد الإضافية. أدخل كل فقد غير متعلق بالفضاء الحر مرة واحدة، وتجنب احتسابه مرتين.",
      linkCn0Meaning:"الناتج dB-Hz. قيمة EIRP بوحدة dBW وG/T بوحدة dB/K، ويجب أن تمثلا مسار الوصلة نفسه صعودًا أو هبوطًا.",
      linkCnMeaning:"BN هو عرض نطاق الضوضاء المكافئ بالهرتز. للتحويل من MHz إلى Hz اضرب في 1,000,000؛ وقد يختلف عرض نطاق الضوضاء عن العرض المشغول.",
      linkEbn0Meaning:"Rb هو معدل بتات المعلومات بوحدة bit/s. تعتمد عتبة Eb/N0 المطلوبة على المودم وMODCOD والترميز وظروف الخدمة.",
      linkMarginMeaning:"الهامش الخام هو زيادة Eb/N0 على العتبة المطلوبة. والهامش المتبقي يطرح هامش التنفيذ واحتياطي التوهين.",
      symbol:"الرمز",
      symbolMeaning:"المعنى والوحدات",
      symbolEirp:"القدرة المشعة المكافئة لاتجاه هوائي متساوي الخواص، dBW؛ من القمر في الوصلة الهابطة ومن المحطة الأرضية في الصاعدة.",
      symbolGt:"مقياس جودة الاستقبال G/T بوحدة dB/K؛ للمحطة الأرضية في الوصلة الهابطة وللقمر في الصاعدة.",
      symbolLoss:"فقد الفضاء الحر / إجمالي فقد المسار المحتسب، dB.",
      symbolNoiseBw:"عرض نطاق الضوضاء المكافئ بوحدة Hz، وليس بالضرورة عرض النطاق المشغول نفسه.",
      symbolBitRate:"معدل بتات المعلومات بوحدة bit/s.",
      symbolRequiredThreshold:"عتبة المودم/MODCOD المطلوبة بوحدة dB، وتُؤخذ من بيانات معدات وخدمة موثقة.",
      symbolImplFade:"هامش التنفيذ واحتياطي التوهين، وكل منهما بوحدة dB.",
      combinedGuideTitle:"ما المقصود بزر «احسب النسبة المجمعة»؟",
      combinedGuideDesc:"يحسب نسبة C/N أو C/I المكافئة بعد جمع مساهمات الضوضاء أو التداخل المستقلة خطيًا من حيث القدرة، وبالقياس إلى الحامل المطلوب نفسه.",
      combinedGuideItem1:"يمثل xi كل نسبة مكوّن أدخلتها بوحدة dB.",
      combinedGuideItem2:"حوّل كل نسبة إلى مساهمة خطية مقلوبة، واجمع المساهمات، ثم أعد تحويل الناتج الإجمالي إلى dB.",
      combinedGuideItem3:"نسبتان متساويتان بقيمة 20 dB تعطيان نحو 16.99 dB، لا 40 dB ولا 20 dB.",
      combinedGuideCaveat:"استخدم نسبًا ذات مرجع الحامل وعرض النطاق ونقطة القياس نفسها. لا تجمع قياسات غير متوافقة.",
      hpaSaturationOut:"قدرة خرج HPA عند التشبع",
      unitDbw:"القدرة (dBW)",
      unitWatt:"القدرة (واط W)",
      hpaConvertHelp:"P(W) = 10^(P(dBW)/10)؛ وP(dBW) = 10 log10(P(W)/1 W). يتحدث الحقلان أحدهما من الآخر.",
      hpaConvertStatus:"20 dBW = 100 W",
      capacityGuideTitle:"شرح إشغال الطيف وميزانية القدرة ببساطة",
      capacityBandwidthCard:"1 · ميزانية عرض النطاق",
      capacityBandwidthDesc:"النطاق المتاح = النطاق القابل للاستخدام ناقص النطاق المحجوز. في المثال: 36 − 2 = 34 MHz.",
      capacityCarrierCard:"2 · النطاق المشغول لكل حامل",
      capacityCarrierDesc:"Rs هو معدل الرموز بوحدة Msym/s؛ وα معامل Roll-off بلا وحدة؛ والحاجز بوحدة MHz. يقدّر النموذج العرض المشغول ولا يحاكي قناع الطيف أو تداخل الحوامل.",
      capacityUtilCard:"3 · نسبة الاستخدام والهامش المتبقي",
      capacityUtilDesc:"نسبة الاستخدام هي مجموع النطاقات المشغولة المقدرة مقسومًا على النطاق المتاح. والهامش هو عدد MHz المتبقي؛ ولا يعني وجوده أنه قابل للبيع تلقائيًا.",
      capacityPowerCard:"4 · ميزانية قدرة التشغيل لـ HPA",
      capacityPowerDesc:"20 dBW تعادل 100 W عند التشبع. مع OBO يساوي 3 dB تصبح ميزانية التشغيل التقريبية 10^1.7 ≈ 50.12 W. مرجع dBW هو 1 W؛ لا تجمع قيم dBW كما لو كانت واطًا.",
      capacityLoadingCard:"5 · تحميل القدرة",
      capacityLoadingDesc:"اجمع قدرات الحوامل بالواط وقارنها بميزانية القدرة بعد OBO، بشرط استخدام المستوى المرجعي نفسه. لا يحاكي هذا النموذج اللاخطية أو التداخل البيني للمضخم.",
      capacityRateCard:"6 · معدل البيانات والقيد الأساسي",
      capacityRateDesc:"المعدل الإجمالي هو مجموع معدلات Mbps الصافية المدخلة؛ وη تقدير bit/s/Hz. يقارن القيد الأساسي بين استهلاك النطاق والقدرة في هذا الفحص المبسط؛ وليس أداة تحسين أو اعتماد سعة من المشغّل.",
      availabilityGuideTitle:"التوهين المطري والتوافر: شرح مبسط للمعادلات",
      availabilityBaselineFormulaTitle:"1 · التوافر الأساسي",
      availabilityBaselineFormulaDesc:"Hbase هو عدد ساعات الانقطاع السنوية المدخلة. تمثل 8760 ساعة سنة من 365 يومًا؛ وهذا حساب زمني وليس نموذجًا للمطر.",
      availabilityScenarioFormulaTitle:"2 · ساعات الانقطاع في السيناريو",
      availabilityScenarioFormulaDesc:"r هي نسبة خفض الانقطاع الافتراضية التي أدخلها المستخدم. يفترض النموذج تحقق هذه النسبة ولا يثبت أن إجراء التخفيف سيحققها.",
      availabilityScenarioAvailabilityTitle:"3 · توافر السيناريو والساعات المتجنبة",
      availabilityScenarioAvailabilityDesc:"تقارن الصيغة ساعات الانقطاع الأساسية المدخلة بسيناريو افتراضي بعد تطبيق نسبة الخفض.",
      availabilityMarginFormulaTitle:"4 · هامش التوهين المتبقي",
      availabilityMarginFormulaDesc:"اطرح عمق التوهين التوضيحي من هامش الوصلة المتبقي بعد إضافة الاسترداد المفترض. القيمة السالبة تعني تجاوز الصفر نزولًا في هذا النموذج المبسط.",
      availabilityChartFormulaTitle:"5 · قراءة الرسم البياني",
      availabilityChartFormulaDesc:"المحور الأفقي x هو عمق التوهين الافتراضي dB؛ والمحور الرأسي y هو الهامش المتبقي dB. النقطة هي السيناريو المحدد وخط الصفر يوضح نقطة عبور الهامش للصفر.",
      availabilityInputsFormulaTitle:"6 · معنى المدخلات وحدود النموذج",
      availabilityInputsFormulaDesc:"لا يُنقل هامش الوصلة الحالي إلا عند الضغط على «استخدام الحالي». قيم التوهين والاسترداد افتراضية بالديسيبل. لا يحول النموذج المطر أو الهامش إلى احتمال انقطاع؛ ولم يُنفذ ITU-R P.618.",
      roadmapTwoOutputKicker:"المرحلة 02 · بوابة التحقق",
      roadmapTwoOutputTitle:"استكشاف الأعطال بالذكاء الاصطناعي — المخرجات المستهدفة",
      roadmapTwoOutput1:"تقرير للتحقق من بنية الملف والوحدات قبل تحليل الاتجاهات.",
      roadmapTwoOutput2:"خط زمني متزامن لقياسات RF وBER/MODCOD وإنذارات المعدات وسجلات الطقس.",
      roadmapTwoOutput3:"فرضيات مرتبة بأدلتها وتفسير درجة الثقة والقياسات الناقصة، لا تشخيصات قطعية بلا سند.",
      roadmapTwoOutput4:"خط أساس من القواعد الحتمية يتحقق منه المهندسون قبل إضافة طبقة تفسير بالذكاء الاصطناعي.",
      roadmapThreeOutputKicker:"المرحلة 03 · تجربة محكومة",
      roadmapThreeOutputTitle:"ذكاء المشغّل — المخرجات المستهدفة",
      roadmapThreeOutput1:"موصلات معتمدة وصلاحيات بأقل امتياز للوصول إلى أنظمة التليمترية والتخطيط.",
      roadmapThreeOutput2:"نماذج خاصة بالحمولة والخدمة يتم التحقق منها مقابل مراجع المورد/المشغّل المعتمدة.",
      roadmapThreeOutput3:"ربط سيناريوهات السعة والمرونة بافتراضات واضحة ومدخلات تجارية عند وجود تصريح.",
      roadmapThreeOutput4:"صلاحيات بحسب الدور، وسجلات تدقيق، وقواعد احتفاظ، ومراجعة أمنية، ونشر مضبوط مع مسؤول محدد للتجربة.",
      hpaConvertInvalidDbw:"أدخل قيمة dBW رقمية صحيحة لحساب الواط.",
      hpaConvertInvalidWatts:"أدخل قيمة موجبة بالواط لحساب dBW.",
      implemented:"منفذ",
      symbolFrequency:"التردد بوحدة GHz المستخدم في معادلة FSPL.",
      symbolDistance:"المدى المائل بالكيلومترات بين طرفي الوصلة المدروسة.",
      symbolAdditionalLoss:"فواقد المسار غير المتعلقة بالفضاء الحر التي يدخلها المستخدم، بوحدة dB.",
      symbolCn0:"نسبة قدرة الحامل إلى كثافة طيف الضوضاء، بوحدة dB-Hz.",
      symbolCn:"نسبة قدرة الحامل إلى قدرة الضوضاء ضمن عرض نطاق الضوضاء المكافئ، بوحدة dB.",
      symbolEbn0:"طاقة بت المعلومات مقسومة على كثافة طيف الضوضاء، بوحدة dB.",
      symbolMargins:"الهامش الخام فوق العتبة والهامش المتبقي بعد طرح الاحتياطيات، بوحدة dB.",
      navLearning:"مثال تعليمي",
      pageTitleLearning:"شرح تطبيقي خطوة بخطوة",
      learningEyebrow:"تدريب هندسي / مثال تطبيقي",
      learningTitle:"تعلّم النموذج: من الأرقام إلى القرار",
      learningIntro:"مثال افتراضي موجّه للمتدربين. راجع المدخلات والمعادلات، وافهم النتائج، وحدد البيانات التي يجب التحقق منها قبل اتخاذ قرار تشغيلي حقيقي.",
      learningDemoStamp:"مثال اصطناعي",
      learningCaseKicker:"دراسة حالة · للتدريب فقط",
      learningCaseTitle:"هل تحقق خدمة فضائية افتراضية بسرعة 30 Mbps هدف الوصلة؟ وما القيد الذي يحد السعة؟",
      learningCaseBody:"تخيّل أنك تدعم فريق تخطيط سعات فضائية. عليك إجراء فحص فني أولي، وشرح النتيجة للمدير، وتحديد الأدلة المطلوبة قبل الموافقة على الخدمة.",
      learningStatRate:"معدل البيانات الصافي", learningStatFreq:"مثال وصلة هابطة", learningStatRange:"المدى المائل",
      learningStepOneKicker:"حدّد السؤال", learningStepOneTitle:"لا تبدأ بالنتيجة؛ ابدأ بالقرار المطلوب.",
      learningStepOneBody:"السؤال: هل تحقق الوصلة الهابطة الافتراضية هامشًا متبقيًا موجبًا وفق الافتراضات المدخلة؟ وهل تجتاز قيود الترانسبوندر الافتراضية اختبارات الفحص المبسطة؟",
      learningQuestionLabel:"عادة هندسية", learningQuestionBody:"افصل بين جودة الوصلة وسعة النطاق/القدرة. نجاح أحدهما لا يثبت نجاح الآخر.",
      learningStepTwoKicker:"اقرأ المدخلات", learningStepTwoTitle:"تحقق من الوحدات ومن أن القيم تخص المسار نفسه.",
      learningInputCol:"المدخل", learningValueCol:"قيمة المثال", learningMeaningCol:"أهميته",
      learningEirpMeaning:"قدرة الإرسال المكافئة للقمر في مثال الوصلة الهابطة.", learningFrequencyMeaning:"تُستخدم لتقدير فقد المسار في الفضاء الحر.", learningRangeMeaning:"المسافة التقريبية على مسار القمر إلى الطرف الأرضي.", learningGtMeaning:"مقياس جودة استقبال المحطة الأرضية.", learningLossMeaning:"فواقد إضافية مبسطة بعد فقد الانتشار في الفضاء الحر.",
      learningInputCaveat:"جميع القيم في المثال تعليمية واصطناعية. يتطلب التقييم الحقيقي بيانات موثقة عن EIRP للحزمة وG/T للمحطة والهندسة وكل الفواقد ذات الصلة.",
      learningStepThreeKicker:"تتبّع ميزانية الوصلة", learningStepThreeTitle:"يجب أن تكون كل نتيجة قابلة للتفسير من الخطوة السابقة.",
      learningEqFspl:"عند 12 GHz و38,000 km، يبلغ فقد الفضاء الحر نحو 205.63 dB.", learningEqPath:"205.63 + 2 ≈ 207.63 dB لإجمالي فقد المسار المدروس.", learningEqCn0:"50 − 207.63 + 22 + 228.6 ≈ 92.97 dB-Hz.", learningEqEbn0:"عند معدل 30 Mbps، تبلغ Eb/N₀ نحو 18.20 dB.", learningEqMargin:"18.20 − 5 − 1.5 − 3 ≈ 8.70 dB كهامش متبقٍ.", learningLinkConclusion:"خلاصة الفحص الأولي للوصلة", learningLinkConclusionHelp:"الهامش موجب وفق المدخلات، لكنه ليس ميزانية وصلة معتمدة.", learningOpenLink:"فتح مختبر ميزانية الوصلة",
      learningStepFourKicker:"افحص الترانسبوندر", learningStepFourTitle:"حدّد القيد الأبرز، ولا تبالغ في وصف السعة المتبقية.",
      learningOccupied:"النطاق المشغول", learningAvailable:"النطاق المتاح", learningUtilization:"نسبة استخدام النطاق", learningHeadroom:"هامش النطاق", learningHpa:"قدرة تشبع HPA", learningOperatingBudget:"ميزانية التشغيل المقدرة", learningPowerAllocated:"قدرة الحوامل المخصصة", learningPowerLoad:"تحميل القدرة", learningAggregateRate:"معدل البيانات الإجمالي", learningSpectralEfficiency:"كفاءة الطيف الصافية",
      learningCapacityInterpretation:"في هذا الفحص المبسط، يظهر النطاق بوصفه القيد الأبرز لأن نسبة استخدامه أعلى من مؤشر تحميل القدرة. لكن 5.5 MHz المتبقية ليست سعة قابلة للبيع تلقائيًا؛ يجب مراجعة مواضع الحوامل والحواجز والتداخل وظروف HPA ومتطلبات الخدمة.", learningOpenCapacity:"فتح مختبر سعة الترانسبوندر",
      learningStepFiveKicker:"اختبر السيناريو", learningStepFiveTitle:"اسأل: ماذا يتغير إذا ازداد التوهين المفترض؟",
      learningEqFade:"8.7 + 2 − 6 = +4.7 dB في السيناريو التوضيحي الحالي.", learningEqFadeWorse:"إذا ارتفع عمق التوهين المفترض إلى 12 dB، يصبح الهامش المتبقي سالبًا في النموذج المبسط.", learningEqAvailability:"8.76 ساعة انقطاع سنوية تعطي توافرًا حسابيًا قدره 99.9%. وخفض افتراضي بنسبة 25% يجعل الانقطاع 6.57 ساعة والتوافر 99.925%.",
      learningLimitTitle:"حد مهم للنموذج", learningLimitBody:"تحليل حساسية هامش التوهين وحساب التوافر من ساعات الانقطاع عمليتان منفصلتان هنا. لا يستنتج هذا المثال احتمال الانقطاع من هامش التوهين، ولا ينفذ ITU-R P.618.", learningOpenAvailability:"فتح مختبر التوهين والتوافر",
      learningStepSixKicker:"حوّل الحساب إلى إجراء", learningStepSixTitle:"المهندس الجيد يشرح القرار والأدلة التي ما زالت ناقصة.",
      learningWorkOne:"حدّد ما تم تقييمه: وصلة هابطة افتراضية بسرعة 30 Mbps وخطة مستقلة افتراضية متعددة الحوامل.", learningWorkTwo:"اعرض النتائج الأساسية ووحداتها والعتبات والاحتياطيات والافتراضات.", learningWorkThree:"حدّد القيد الأبرز والقياسات أو الوثائق التالية المطلوبة.", learningWorkFour:"اطلب EIRP وG/T موثقين، وعتبة المودم/MODCOD، وحدود الحمولة، وخطة الطيف وسجل الانقطاعات المقاس.", learningWorkFive:"صدّر موجز قرار للمراجعة الفنية؛ ولا تعامل النتيجة على أنها موافقة تشغيلية.",
      learningOpenReports:"إنشاء تقرير قرار", learningReadMethodology:"مراجعة المنهجية", learningTakeawayTitle:"الخلاصة", learningTakeawayBody:"استخدم النموذج لتنظيم السؤال وفهم العلاقات ومقارنة السيناريوهات وشرح حدود النتائج. استخدم نماذج هندسية متحققة وبيانات مصرحًا بها قبل أي قرار يتعلق بشبكة حقيقية.",
      symbolCombined:"كل نسبة مكونة من C/N أو C/I في أداة الجمع، باستخدام مرجع الحامل المطلوب نفسه."
    }
  };

  let language = localStorage.getItem('soi-language') || 'en';
  let theme = localStorage.getItem('soi-theme-v1.4') || 'light';
  let currentPage = 'overview';
  let linkInputs = clone(DEFAULT_LINK);
  let capacityInputs = clone(DEFAULT_CAPACITY);
  let carriers = clone(DEFAULT_CARRIERS);
  let availabilityInputs = clone(DEFAULT_AVAILABILITY);
  let latestTriage = null;
  let triageSourceName = '';
  let reportNote = '';
  let installPromptEvent = null;

  const inputIds = {
    link: ['eirpDbw', 'frequencyGHz', 'rangeKm', 'additionalLossDb', 'gtDbK', 'noiseBandwidthMHz', 'bitRateMbps', 'requiredEbN0Db', 'implementationMarginDb', 'fadeReserveDb'],
    capacity: ['usableBandwidthMHz', 'reserveBandwidthMHz', 'hpaSaturationDbw', 'compositeOboDb'],
    availability: ['linkMarginDb', 'fadeShockDb', 'mitigationRecoveryDb', 'annualOutageHours', 'outageReductionPct']
  };
  const units = {
    fsplDb:'dB', totalPathLossDb:'dB', cn0DbHz:'dB-Hz', cnDb:'dB', ebn0Db:'dB', rawMarginDb:'dB', residualMarginDb:'dB',
    totalOccupiedMHz:'MHz', availableBandwidthMHz:'MHz', bandwidthUtilizationPct:'%', bandwidthHeadroomMHz:'MHz', hpaOperatingBudgetW:'W', totalAllocatedPowerW:'W', powerLoadingPct:'%', powerHeadroomW:'W', aggregateNetRateMbps:'Mbps'
  };
  const number = (value, digits = 2) => Number.isFinite(value) ? value.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: 0 }) : '—';
  const signed = (value, digits = 2) => Number.isFinite(value) ? `${value > 0 ? '+' : ''}${number(value, digits)}` : '—';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const esc = (str) => String(str ?? '').replace(/[&<>"']/g, (ch) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const t = (key) => (I18N[language] && I18N[language][key]) || I18N.en[key] || key;

  function applyLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (key === 'heroTitle') node.innerHTML = t(key);
      else node.textContent = t(key);
    });
    $('languageToggle').textContent = language === 'en' ? 'العربية' : 'English';
    $('currentPageTitle').textContent = t(document.querySelector(`#page-${currentPage}`).dataset.pageTitle);
    $('fileName').textContent = latestTriage ? triageSourceName : t('noFile');
    updateDirectionLabels();
    syncHpaWattsFromDbw();
    document.title = `${t('product')} — Laith Mahdawi`;
    renderLink(); renderCapacity(false); renderAvailability(); renderOverview(); renderTriage(); renderSelfChecks(); renderReport();
    if ($('calculateCombined')) $('calculateCombined').click();
  }

  function setTheme(next) {
    theme = next;
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('soi-theme-v1.4', theme);
  }
  function showToast(message) {
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = message;
    $('toastRegion').appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
  function navigate(page) {
    if (!$(`page-${page}`)) return;
    currentPage = page;
    document.querySelectorAll('.page').forEach((el) => el.classList.toggle('active', el.id === `page-${page}`));
    document.querySelectorAll('.nav-item[data-page]').forEach((el) => el.classList.toggle('active', el.dataset.page === page));
    $('currentPageTitle').textContent = t($(`page-${page}`).dataset.pageTitle);
    $('sidebar').classList.remove('open');
    if (page === 'reports') renderReport();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function getLinkInputsFromDom() {
    const x = { direction: $('linkDirection').value };
    inputIds.link.forEach((id) => x[id] = $('' + id).value.trim() === '' ? NaN : Number($('' + id).value));
    return {
      direction: x.direction, eirpDbw: x.eirpDbw, frequencyGHz: x.frequencyGHz, rangeKm: x.rangeKm,
      additionalLossDb: x.additionalLossDb, gtDbK: x.gtDbK, noiseBandwidthMHz: x.noiseBandwidthMHz,
      bitRateMbps: x.bitRateMbps, requiredEbN0Db: x.requiredEbN0Db, implementationMarginDb: x.implementationMarginDb, fadeReserveDb: x.fadeReserveDb
    };
  }
  function assignLinkToDom() {
    $('linkDirection').value = linkInputs.direction;
    inputIds.link.forEach((id) => $(id).value = linkInputs[id]);
  }
  function getCapacityInputsFromDom() {
    const out = {};
    inputIds.capacity.forEach((id) => out[id] = $('' + id).value.trim() === '' ? NaN : Number($('' + id).value));
    return out;
  }
  function assignCapacityToDom() { inputIds.capacity.forEach((id) => $(id).value = capacityInputs[id]); syncHpaWattsFromDbw(); }
  function syncHpaWattsFromDbw() {
    const dbwInput = $('hpaSaturationDbw');
    const wattsInput = $('hpaSaturationWatts');
    if (!dbwInput || !wattsInput) return;
    const raw = dbwInput.value.trim();
    if (raw === '' || !Number.isFinite(Number(raw))) { wattsInput.value = ''; $('hpaConversionStatus').textContent = t('hpaConvertInvalidDbw'); return; }
    const watts = Core.dbwToWatts(Number(raw));
    wattsInput.value = watts.toFixed(watts < 1 ? 6 : watts >= 1000 ? 2 : 3).replace(/\.?0+$/, '');
    $('hpaConversionStatus').textContent = `${number(Number(raw))} dBW = ${number(watts, 4)} W`;
  }
  function syncHpaDbwFromWatts() {
    const wattsInput = $('hpaSaturationWatts');
    const dbwInput = $('hpaSaturationDbw');
    if (!wattsInput || !dbwInput) return;
    const raw = wattsInput.value.trim();
    if (raw === '' || !Number.isFinite(Number(raw)) || Number(raw) <= 0) { $('hpaConversionStatus').textContent = t('hpaConvertInvalidWatts'); return false; }
    const dbw = Core.wattsToDbw(Number(raw));
    dbwInput.value = dbw.toFixed(4).replace(/\.?0+$/, '');
    $('hpaConversionStatus').textContent = `${number(Number(raw), 4)} W = ${number(dbw, 4)} dBW`;
    return true;
  }
  function updateDirectionLabels() {
    const isUplink = $('linkDirection').value === 'uplink';
    $('eirpRoleText').textContent = t(isUplink ? 'eirpUplink' : 'eirpDownlink');
    $('eirpRoleHelp').textContent = t(isUplink ? 'eirpUplinkHelp' : 'eirpDownlinkHelp');
    $('gtRoleText').textContent = t(isUplink ? 'gtUplink' : 'gtDownlink');
    $('gtRoleHelp').textContent = t(isUplink ? 'gtUplinkHelp' : 'gtDownlinkHelp');
    $('applyDirectionProfile').textContent = t('applyDirectionProfile');
  }
  function applyDirectionProfile(direction, notify = false) {
    linkInputs = clone(direction === 'uplink' ? DEFAULT_UPLINK : DEFAULT_LINK);
    assignLinkToDom();
    updateDirectionLabels();
    renderLink(); renderOverview(); renderReport();
    if (notify) showToast(t('directionProfileApplied'));
  }

  function getAvailabilityFromDom() {
    const out = {};
    inputIds.availability.forEach((id) => out[id] = $(id).value.trim() === '' ? NaN : Number($(id).value));
    return out;
  }
  function assignAvailabilityToDom() { inputIds.availability.forEach((id) => $(id).value = availabilityInputs[id]); }
  function renderErrors(containerId, result) {
    const el = $(containerId);
    if (!result || result.ok || !result.errors) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false;
    el.innerHTML = `<strong>${esc(t('inputErrors'))}</strong><ul>${Object.values(result.errors).map((err) => `<li>${esc(err)}</li>`).join('')}</ul>`;
  }
  function fmtDb(v, digits = 2) { return `${number(v, digits)} dB`; }
  function setTag(id, text, status) { const el = $(id); el.textContent = text; el.className = `status-tag ${status || ''}`.trim(); }

  function renderLink() {
    linkInputs = getLinkInputsFromDom();
    const r = Core.calculateLinkBudget(linkInputs);
    renderErrors('linkErrors', r);
    if (!r.ok) {
      $('linkStatus').textContent = t('notCalculated'); $('linkStatus').className = 'status-tag bad'; $('residualResult').textContent = '—'; $('linkResultList').innerHTML = ''; $('linkEquationTrace').innerHTML = '';
      return null;
    }
    const st = r.status === 'positive' ? ['good', t('marginPositive')] : r.status === 'near-zero' ? ['warn', t('marginNear')] : ['bad', t('marginNegative')];
    setTag('linkStatus', st[1], st[0]);
    $('residualResult').textContent = fmtDb(r.residualMarginDb);
    const rows = [
      ['fsplDb', t('fsplTitle'), r.fsplDb], ['totalPathLossDb', 'Total path loss', r.totalPathLossDb], ['cn0DbHz', 'C/N₀', r.cn0DbHz], ['cnDb', 'C/N', r.cnDb], ['ebn0Db', 'Eb/N₀', r.ebn0Db], ['rawMarginDb', 'Raw Eb/N₀ margin', r.rawMarginDb]
    ];
    $('linkResultList').innerHTML = rows.map(([key, label, value]) => `<div class="result-row"><span>${esc(label)}</span><strong>${number(value)} ${units[key]}</strong></div>`).join('');
    $('linkEquationTrace').innerHTML = [
      [t('fsplTitle'), `92.45 + 20log₁₀(${number(linkInputs.frequencyGHz, 3)}) + 20log₁₀(${number(linkInputs.rangeKm, 1)}) = ${number(r.fsplDb)} dB`],
      ['Total path loss', `${number(r.fsplDb)} + ${number(linkInputs.additionalLossDb)} = ${number(r.totalPathLossDb)} dB`],
      ['C/N₀', `${number(linkInputs.eirpDbw)} − ${number(r.totalPathLossDb)} + ${number(linkInputs.gtDbK)} + 228.6 = ${number(r.cn0DbHz)} dB-Hz`],
      ['C/N', `${number(r.cn0DbHz)} − 10log₁₀(${number(linkInputs.noiseBandwidthMHz)}×10⁶) = ${number(r.cnDb)} dB`],
      ['Eb/N₀', `${number(r.cn0DbHz)} − 10log₁₀(${number(linkInputs.bitRateMbps)}×10⁶) = ${number(r.ebn0Db)} dB`],
      ['Residual margin', `${number(r.ebn0Db)} − ${number(linkInputs.requiredEbN0Db)} − ${number(linkInputs.implementationMarginDb)} − ${number(linkInputs.fadeReserveDb)} = ${number(r.residualMarginDb)} dB`]
    ].map(([label, expression]) => `<div class="trace-row"><span>${esc(label)}</span><code>${esc(expression)}</code></div>`).join('');
    return r;
  }

  function buildCarrierRows() {
    $('carrierRows').innerHTML = carriers.map((c, i) => `<tr data-index="${i}">
      <td><input class="carrier-name" type="text" value="${esc(c.name)}" data-carrier-field="name" aria-label="Carrier ${i + 1} name" maxlength="32"></td>
      <td><input type="number" min="0.001" step="0.1" value="${c.symbolRateMsps}" data-carrier-field="symbolRateMsps" aria-label="Carrier ${i + 1} symbol rate"></td>
      <td><input type="number" min="0" max="1" step="0.05" value="${c.rolloff}" data-carrier-field="rolloff" aria-label="Carrier ${i + 1} roll-off"></td>
      <td><input type="number" min="0" step="0.05" value="${c.guardMHz}" data-carrier-field="guardMHz" aria-label="Carrier ${i + 1} guard"></td>
      <td><input type="number" min="0" step="0.1" value="${c.powerW}" data-carrier-field="powerW" aria-label="Carrier ${i + 1} power"></td>
      <td><input type="number" min="0" step="0.1" value="${c.netRateMbps}" data-carrier-field="netRateMbps" aria-label="Carrier ${i + 1} net rate"></td>
      <td class="occupied-cell" data-occupied="${i}">—</td><td><button class="delete-carrier" type="button" data-delete-carrier="${i}" aria-label="${esc(t('removal'))}">×</button></td>
    </tr>`).join('');
  }

  function renderCapacity(rebuildRows = false) {
    capacityInputs = getCapacityInputsFromDom();
    if (rebuildRows) buildCarrierRows();
    const r = Core.calculateCapacity(capacityInputs, carriers);
    renderErrors('capacityErrors', r);
    if (!r.ok) {
      setTag('bwStatus', t('notCalculated'), 'bad'); setTag('powerStatus', t('notCalculated'), 'bad');
      ['capacityBwPct','capacityPowerPct','totalOccupiedText','availableBandwidthText','totalPowerText','powerBudgetText','aggregateRateText','spectralEfficiencyText','bindingConstraintText'].forEach(id => $(id).textContent = '—');
      $('spectrumCanvas').innerHTML = ''; return null;
    }
    carriers.forEach((c, i) => { const cell = document.querySelector(`[data-occupied="${i}"]`); if (cell) cell.textContent = `${number(r.occupiedByCarrierMHz[i])}`; });
    const bwStatus = r.bandwidthExceeded ? ['bad', t('bandwidthOver')] : ['good', t('ok')];
    const pwStatus = r.powerExceeded ? ['bad', t('powerOver')] : ['good', t('ok')];
    setTag('bwStatus', bwStatus[1], bwStatus[0]); setTag('powerStatus', pwStatus[1], pwStatus[0]);
    $('capacityBwPct').textContent = number(r.bandwidthUtilizationPct, 1); $('capacityPowerPct').textContent = number(r.powerLoadingPct, 1);
    $('capacityBwMeter').style.width = `${clamp(r.bandwidthUtilizationPct, 0, 100)}%`; $('capacityPowerMeter').style.width = `${clamp(r.powerLoadingPct, 0, 100)}%`;
    $('capacityBwMeter').style.background = r.bandwidthExceeded ? 'var(--red)' : 'var(--violet)'; $('capacityPowerMeter').style.background = r.powerExceeded ? 'var(--red)' : 'var(--amber)';
    $('totalOccupiedText').textContent = `${number(r.totalOccupiedMHz)} MHz ${language === 'ar' ? 'مشغول' : 'occupied'}`;
    $('availableBandwidthText').textContent = `${number(r.availableBandwidthMHz)} MHz ${language === 'ar' ? 'متاح' : 'available'}`;
    $('totalPowerText').textContent = `${number(r.totalAllocatedPowerW)} W ${language === 'ar' ? 'مخصص' : 'allocated'}`;
    $('powerBudgetText').textContent = `${number(r.hpaOperatingBudgetW)} W ${language === 'ar' ? 'ميزانية تشغيلية' : 'operating budget'}`;
    $('aggregateRateText').textContent = `${number(r.aggregateNetRateMbps)} Mbps`;
    $('spectralEfficiencyText').textContent = `${number(r.spectralEfficiencyBitsPerHz, 3)} bit/s/Hz`;
    const bindLabel = r.bandwidthExceeded && r.powerExceeded ? t('bothOver') : r.bandwidthExceeded ? t('bandwidthOver') : r.powerExceeded ? t('powerOver') : r.bindingConstraint === 'bandwidth' ? t('bandwidthMost') : t('powerMost');
    $('bindingConstraintText').textContent = bindLabel;
    const usable = Math.max(0.0001, capacityInputs.usableBandwidthMHz);
    const occPct = clamp(r.totalOccupiedMHz / usable * 100, 0, 100);
    const reservePct = clamp(capacityInputs.reserveBandwidthMHz / usable * 100, 0, 100);
    let spectrumHtml = `<div class="spectrum-track"><div class="spectrum-used" style="width:${occPct}%"></div><div class="spectrum-reserved" style="width:${reservePct}%"></div></div><div class="spectrum-legend"><span><i class="legend-used"></i>${esc(t('occupied'))}: ${number(r.totalOccupiedMHz)} MHz</span><span><i class="legend-reserved"></i>${esc(t('reservedBw'))}: ${number(capacityInputs.reserveBandwidthMHz)} MHz</span></div>`;
    spectrumHtml += `<div class="spectrum-carrier-list">${carriers.map((c,i)=>`<span><i></i>${esc(c.name || `${t('carrierLabel')} ${i+1}`)} · ${number(r.occupiedByCarrierMHz[i])} MHz</span>`).join('')}</div>`;
    $('spectrumCanvas').innerHTML = spectrumHtml;
    return r;
  }

  function renderFadeMarginChart(result) {
    const host = $('fadeMarginChart');
    if (!host) return;
    const profile = Core.calculateFadeMarginProfile(availabilityInputs);
    if (!result || !result.ok || !profile.ok) {
      $('fadeChartCurrentMargin').textContent = '—';
      host.innerHTML = `<p class="muted-copy">${esc(t('chartUnavailable'))}</p>`;
      host.setAttribute('aria-label', t('chartUnavailable'));
      return;
    }

    $('fadeChartCurrentMargin').textContent = `${number(profile.selectedRemainingMarginDb)} dB`;
    const W = 720, H = 330, left = 82, right = 24, top = 24, bottom = 64;
    const plotW = W - left - right, plotH = H - top - bottom;
    const xMax = profile.maxFadeDepthDb;
    const ys = profile.points.map((pt) => pt.remainingMarginDb);
    const yMinRaw = Math.min(0, ...ys), yMaxRaw = Math.max(0, ...ys);
    const ySpan = Math.max(1, yMaxRaw - yMinRaw);
    const yMin = yMinRaw - ySpan * 0.10;
    const yMax = yMaxRaw + ySpan * 0.10;
    const x = (value) => left + (value / xMax) * plotW;
    const y = (value) => top + ((yMax - value) / (yMax - yMin)) * plotH;
    const xTicks = Array.from({ length: 5 }, (_, i) => xMax * i / 4);
    const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (yMax - yMin) * i / 4);
    const path = profile.points.map((pt, i) => `${i ? 'L' : 'M'} ${x(pt.fadeDepthDb).toFixed(2)} ${y(pt.remainingMarginDb).toFixed(2)}`).join(' ');
    const zeroY = y(0);
    const selectedX = x(profile.selectedFadeDepthDb);
    const selectedY = y(profile.selectedRemainingMarginDb);
    const positiveHeight = Math.max(0, zeroY - top);
    const negativeY = Math.min(H - bottom, zeroY);
    const negativeHeight = Math.max(0, H - bottom - negativeY);
    const gridX = xTicks.map((tick) => `<g><line x1="${x(tick)}" y1="${top}" x2="${x(tick)}" y2="${H-bottom}" class="fade-grid-line"/><text x="${x(tick)}" y="${H-bottom+22}" class="fade-tick" text-anchor="middle">${number(tick, 1)}</text></g>`).join('');
    const gridY = yTicks.map((tick) => `<g><line x1="${left}" y1="${y(tick)}" x2="${W-right}" y2="${y(tick)}" class="fade-grid-line"/><text x="${left-12}" y="${y(tick)+4}" class="fade-tick" text-anchor="end">${number(tick, 1)}</text></g>`).join('');
    host.setAttribute('aria-label', t('fadeChartTitle'));
    host.innerHTML = `<svg class="fade-chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('fadeChartTitle'))}" focusable="false">
      <rect x="${left}" y="${top}" width="${plotW}" height="${positiveHeight}" class="fade-positive-zone"/>
      <rect x="${left}" y="${negativeY}" width="${plotW}" height="${negativeHeight}" class="fade-negative-zone"/>
      ${gridX}${gridY}
      <line x1="${left}" y1="${zeroY}" x2="${W-right}" y2="${zeroY}" class="fade-zero-line"/>
      <path d="${path}" class="fade-margin-curve"/>
      <line x1="${selectedX}" y1="${top}" x2="${selectedX}" y2="${H-bottom}" class="fade-selected-line"/>
      <circle cx="${selectedX}" cy="${selectedY}" r="6" class="fade-selected-dot"><title>${esc(t('selectedFadeScenario'))}: ${number(profile.selectedFadeDepthDb)} dB; ${number(profile.selectedRemainingMarginDb)} dB</title></circle>
      <text x="${left + plotW/2}" y="${H-14}" class="fade-axis-title" text-anchor="middle">${esc(t('fadeDepthAxis'))}</text>
      <text x="22" y="${top + plotH/2}" class="fade-axis-title" text-anchor="middle" transform="rotate(-90 22 ${top + plotH/2})">${esc(t('remainingMarginAxis'))}</text>
      <text x="${Math.min(W-right-4, Math.max(left+38, selectedX+8))}" y="${Math.max(top+13, Math.min(H-bottom-5, selectedY-10))}" class="fade-selected-label" text-anchor="${selectedX > W-right-90 ? 'end' : 'start'}">${number(profile.selectedRemainingMarginDb)} dB</text>
    </svg>`;
  }

  function renderAvailability() {
    availabilityInputs = getAvailabilityFromDom();
    const r = Core.calculateAvailability(availabilityInputs);
    renderErrors('availabilityErrors', r);
    if (!r.ok) { ['baselineAvailability','scenarioAvailability','baselineHours','scenarioHours','outageSaved','remainingFadeMargin'].forEach(id => $(id).textContent = '—'); renderFadeMarginChart(r); return null; }
    $('baselineAvailability').textContent = `${number(r.baselineAvailabilityPct, 4)}%`;
    $('scenarioAvailability').textContent = `${number(r.scenarioAvailabilityPct, 4)}%`;
    $('baselineHours').textContent = `${number(availabilityInputs.annualOutageHours)} h ${language === 'ar' ? 'انقطاع سنوي' : 'annual outage'}`;
    $('scenarioHours').textContent = `${number(r.scenarioOutageHours)} h ${language === 'ar' ? 'افتراضية' : 'scenario outage'}`;
    $('outageSaved').textContent = `${number(r.outageHoursSaved)} h`;
    $('remainingFadeMargin').textContent = `${number(r.remainingMarginDb)} dB`;
    $('fadeGauge').style.left = `${clamp(50 + r.remainingMarginDb * 2.5, 2, 98)}%`;
    $('fadeGauge').style.background = r.remainingMarginDb >= 0 ? 'var(--green)' : 'var(--red)';
    renderFadeMarginChart(r);
    return r;
  }

  function renderOverview() {
    const link = Core.calculateLinkBudget(linkInputs);
    const cap = Core.calculateCapacity(capacityInputs, carriers);
    if (!link.ok || !cap.ok) {
      $('kpiMargin').innerHTML = `— <small>dB</small>`;
      $('kpiBandwidth').innerHTML = `—<small>%</small>`;
      $('kpiPower').innerHTML = `—<small>%</small>`;
      $('kpiRate').innerHTML = `—<small>Mbps</small>`;
      $('kpiMarginStatus').textContent = t('notCalculated');
      $('kpiBandwidthStatus').textContent = t('notCalculated');
      $('kpiPowerStatus').textContent = t('notCalculated');
      $('decisionTitle').textContent = t('notCalculated');
      $('decisionText').textContent = language === 'ar' ? 'أصلح المدخلات غير الصالحة في المختبر المعني لإعادة حساب هذا الملخص.' : 'Fix invalid inputs in the relevant lab to recalculate this summary.';
      $('headroomBw').textContent = '—'; $('headroomPower').textContent = '—';
      $('marginMeter').style.width = '0%'; $('bandwidthMeter').style.width = '0%'; $('powerMeter').style.width = '0%';
      return;
    }
    $('kpiMargin').innerHTML = `${number(link.residualMarginDb)} <small>dB</small>`;
    $('kpiBandwidth').innerHTML = `${number(cap.bandwidthUtilizationPct, 1)}<small>%</small>`;
    $('kpiPower').innerHTML = `${number(cap.powerLoadingPct, 1)}<small>%</small>`;
    $('kpiRate').innerHTML = `${number(cap.aggregateNetRateMbps)}<small>Mbps</small>`;
    $('kpiMarginStatus').textContent = link.status === 'positive' ? t('marginPositive') : link.status === 'near-zero' ? t('marginNear') : t('marginNegative');
    $('kpiBandwidthStatus').textContent = cap.bandwidthExceeded ? t('bandwidthOver') : t('ok');
    $('kpiPowerStatus').textContent = cap.powerExceeded ? t('powerOver') : t('ok');
    $('marginMeter').style.width = `${clamp(50 + link.residualMarginDb * 3, 0, 100)}%`;
    $('bandwidthMeter').style.width = `${clamp(cap.bandwidthUtilizationPct, 0, 100)}%`; $('bandwidthMeter').style.background = cap.bandwidthExceeded ? 'var(--red)' : 'var(--violet)';
    $('powerMeter').style.width = `${clamp(cap.powerLoadingPct, 0, 100)}%`; $('powerMeter').style.background = cap.powerExceeded ? 'var(--red)' : 'var(--amber)';
    $('headroomBw').textContent = `${signed(cap.bandwidthHeadroomMHz)} MHz`;
    $('headroomPower').textContent = `${signed(cap.powerHeadroomW)} W`;
    let title, text;
    if (cap.bandwidthExceeded && cap.powerExceeded) { title = t('bothOver'); text = language === 'ar' ? 'تجاوز السيناريو الافتراضي كلا الحدين. راجع خطة الحوامل والقيود قبل التفكير في سعة إضافية.' : 'The hypothetical plan exceeds both simplified limits. Review carrier plan and constraints before considering additional capacity.'; }
    else if (cap.bandwidthExceeded) { title = t('bandwidthOver'); text = language === 'ar' ? 'النطاق المشغول يتجاوز النطاق المتاح بعد الاحتياطي. خفّض الإشغال أو أعد النظر في المتطلبات.' : 'Occupied span exceeds available bandwidth after reserve. Reduce occupancy or revisit the requirements.'; }
    else if (cap.powerExceeded) { title = t('powerOver'); text = language === 'ar' ? 'مجموع القدرة المخصصة يتجاوز الميزانية المستنتجة من التشبع وOBO. تحقق من مرجع القدرة وافتراضات المضخم.' : 'Allocated carrier power exceeds the budget implied by saturation output and OBO. Verify power reference plane and HPA assumptions.'; }
    else if (link.residualMarginDb < 0) { title = t('marginNegative'); text = language === 'ar' ? 'هامش الوصلة أقل من المطلوب في هذا النموذج. اختبر الفواقد وG/T ومعدل البيانات واحتياطي التوهين.' : 'The modeled link margin is below target. Test losses, G/T, information rate and fade reserve assumptions.'; }
    else { title = t('bothPass'); text = language === 'ar' ? 'اجتاز النموذج قيود النطاق والقدرة المبسطة، مع بقاء التحقق الخاص بالحمولة وجودة الوصلة ضروريًا.' : 'The simplified bandwidth and power checks pass. Payload-specific verification and link-quality review are still required.'; }
    $('decisionTitle').textContent = title; $('decisionText').textContent = text;
  }

  function renderTriage() {
    if (!latestTriage) return;
    $('fileName').textContent = triageSourceName;
    $('csvRowCount').textContent = String(latestTriage.rows);
    $('csvPreviewHead').innerHTML = `<tr>${latestTriage.headers.slice(0, 6).map(h => `<th>${esc(h)}</th>`).join('')}</tr>`;
    $('csvPreviewBody').innerHTML = latestTriage.records.slice(0, 5).map((row) => `<tr>${row.slice(0, 6).map(v => `<td title="${esc(v)}">${esc(v)}</td>`).join('')}</tr>`).join('') || `<tr><td class="empty-state">${esc(t('noRows'))}</td></tr>`;
    if (latestTriage.records.length > 5) $('csvPreviewBody').insertAdjacentHTML('beforeend', `<tr><td colspan="6" class="muted-copy">+ ${latestTriage.records.length - 5} ${language === 'ar' ? 'صفوف أخرى' : 'more rows'}</td></tr>`);
    $('triageResults').innerHTML = latestTriage.analysis.hypotheses.map((h) => `<article class="hypothesis-card"><div class="hypothesis-top"><span class="hypothesis-mark">${h.level === 'info' ? 'i' : '!'}</span><div><strong>${esc(h.title)}</strong><p>${esc(h.evidence)}</p></div></div><p class="next-check"><strong>${language === 'ar' ? 'خطوة التحقق: ' : 'Next verification: '}</strong>${esc(h.next)}</p></article>`).join('') + `<p class="triage-disclaimer">${esc(latestTriage.analysis.warning)}</p>`;
  }

  function buildReport() {
    const link = Core.calculateLinkBudget(linkInputs);
    const capacity = Core.calculateCapacity(capacityInputs, carriers);
    const availability = Core.calculateAvailability(availabilityInputs);
    return {
      product: 'Satellite Ops Intelligence — Built by Laith Mahdawi',
      version: '1.4.0',
      generatedAt: new Date().toISOString(),
      status: 'SYNTHETIC / USER-ENTERED SCENARIO — NOT LIVE TELEMETRY',
      note: 'Engineering screening prototype; not a certified link budget, payload-specific analysis, or ITU-R P.618 implementation.',
      reportNote,
      inputs: { link: linkInputs, transponder: { ...capacityInputs, carriers: carriers }, availability: availabilityInputs },
      results: { link, capacity, availability, measurementTriage: latestTriage ? { sourceFile: triageSourceName, ...latestTriage.analysis } : null },
      assumptions: language === 'ar' ? [
        'جميع القيم الابتدائية بيانات اصطناعية لأغراض العرض.',
        'يجب أن يشير EIRP وG/T إلى مسار صاعد أو هابط واحد؛ وتُدخل الفواقد الإضافية مرة واحدة فقط.',
        'تقدير النطاق المشغول وميزانية القدرة فحص أولي وليس نموذجًا خاصًا بحمولة قمر.',
        'تُحسب نتائج التوافر من ساعات الانقطاع السنوية المدخلة ولا تُستنتج من هامش التوهين.',
        'يعتمد فرز CSV على قواعد حتمية ولا يؤكد الأسباب الجذرية ولا يستخدم نموذج ذكاء اصطناعي.'
      ] : [
        'All seeded values are synthetic demonstration values.',
        'Link EIRP and G/T refer to the same modeled uplink or downlink path; additional losses are entered once.',
        'Transponder occupied-span and power budget are screening approximations, not a payload-specific model.',
        'Availability results are calculated from user-entered annual outage hours; they are not predicted from fade margin.',
        'CSV triage uses deterministic heuristics. It does not confirm root causes and does not use an AI model.'
      ],
      nextSteps: language === 'ar' ? ['تحقّق من الوحدات والمستويات المرجعية مع مختصي المجال.', 'استخدم بيانات المورد والحمولة والمعايير المنشورة المناسبة للتحليل الرسمي.', 'لا تربط أنظمة تشغيلية دون تصريح ومراجعة أمنية وضوابط وصول.'] : ['Validate input units and reference planes with domain experts.', 'Use vendor/payload data and appropriate published standards for formal engineering.', 'Do not connect operational systems without authorization, security review and access controls.']
    };
  }
  function reportSection(title, rows) {
    return `<section class="report-section"><h3>${esc(title)}</h3><table class="data-table"><thead><tr><th>${language === 'ar' ? 'العنصر' : 'Item'}</th><th>${language === 'ar' ? 'القيمة' : 'Value'}</th></tr></thead><tbody>${rows.map(([k,v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</tbody></table></section>`;
  }
  function renderReport() {
    const r = buildReport();
    $('reportGenerated').textContent = `${new Date(r.generatedAt).toLocaleString(language === 'ar' ? 'ar-JO' : 'en-GB')} · ${r.status}`;
    const sections = [];
    if (r.results.link.ok) sections.push(reportSection(t('reportLink'), [
      ['FSPL', `${number(r.results.link.fsplDb)} dB`], ['Total path loss', `${number(r.results.link.totalPathLossDb)} dB`], ['C/N₀', `${number(r.results.link.cn0DbHz)} dB-Hz`], ['C/N', `${number(r.results.link.cnDb)} dB`], ['Eb/N₀', `${number(r.results.link.ebn0Db)} dB`], [t('residualMargin'), `${number(r.results.link.residualMarginDb)} dB`]
    ]));
    if (r.results.capacity.ok) sections.push(reportSection(t('reportCapacity'), [
      [t('usableBw'), `${number(capacityInputs.usableBandwidthMHz)} MHz`], [t('occupied'), `${number(r.results.capacity.totalOccupiedMHz)} MHz`], [t('bandwidthHeadroom'), `${number(r.results.capacity.bandwidthHeadroomMHz)} MHz`], [t('metricBandwidth'), `${number(r.results.capacity.bandwidthUtilizationPct, 1)}%`], [t('totalAllocatedPower'), `${number(r.results.capacity.totalAllocatedPowerW)} W`], [t('hpaSat'), `${number(capacityInputs.hpaSaturationDbw)} dBW (${number(Core.dbwToWatts(capacityInputs.hpaSaturationDbw))} W)`], [t('compositeObo'), `${number(capacityInputs.compositeOboDb)} dB`], [t('metricPower'), `${number(r.results.capacity.powerLoadingPct, 1)}%`], [t('aggregateRate'), `${number(r.results.capacity.aggregateNetRateMbps)} Mbps`], [t('spectralEfficiency'), `${number(r.results.capacity.spectralEfficiencyBitsPerHz, 3)} bit/s/Hz`]
    ]));
    if (r.results.availability.ok) sections.push(reportSection(t('reportAvailability'), [
      [t('annualOutage'), `${number(availabilityInputs.annualOutageHours)} h`], [t('baselineAvailability'), `${number(r.results.availability.baselineAvailabilityPct, 4)}%`], [t('outageReduction'), `${number(availabilityInputs.outageReductionPct)}%`], [t('scenarioAvailability'), `${number(r.results.availability.scenarioAvailabilityPct, 4)}%`], [t('hoursSaved'), `${number(r.results.availability.outageHoursSaved)} h`], [t('remainingMargin'), `${number(r.results.availability.remainingMarginDb)} dB`]
    ]));
    const assumptions = [...r.assumptions, ...r.nextSteps];
    sections.push(`<section class="report-section"><h3>${esc(t('reportLimitations'))}</h3><ul>${assumptions.map(a => `<li>${esc(a)}</li>`).join('')}</ul>${reportNote ? `<p><strong>Review note:</strong> ${esc(reportNote)}</p>` : ''}</section>`);
    if (r.results.measurementTriage) sections.push(`<section class="report-section"><h3>${esc(t('reportTriage'))}</h3><p>${esc(r.results.measurementTriage.warning)}</p><ul>${r.results.measurementTriage.hypotheses.map(h => `<li><strong>${esc(h.title)}:</strong> ${esc(h.evidence)} Next: ${esc(h.next)}</li>`).join('')}</ul></section>`);
    $('reportBody').innerHTML = sections.join('');
    return r;
  }

  function csvEscape(value) { const s = String(value ?? ''); return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }
  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }
  function exportJson() {
    const report = buildReport();
    download('satellite-ops-decision-brief.json', JSON.stringify(report, null, 2), 'application/json;charset=utf-8');
    showToast(t('exported'));
  }
  function exportCsv() {
    const report = buildReport(); const rows = [['Section','Parameter','Value','Unit']];
    const add = (section, label, val, unit = '') => rows.push([section, label, Number.isFinite(val) ? Number(val.toFixed(5)) : val, unit]);
    const l = report.results.link, c = report.results.capacity, a = report.results.availability;
    if (l.ok) { add('Link Budget','FSPL',l.fsplDb,'dB'); add('Link Budget','Total path loss',l.totalPathLossDb,'dB'); add('Link Budget','C/N0',l.cn0DbHz,'dB-Hz'); add('Link Budget','C/N',l.cnDb,'dB'); add('Link Budget','Eb/N0',l.ebn0Db,'dB'); add('Link Budget','Residual margin',l.residualMarginDb,'dB'); }
    if (c.ok) { add('Capacity','Total occupied bandwidth',c.totalOccupiedMHz,'MHz'); add('Capacity','Available bandwidth',c.availableBandwidthMHz,'MHz'); add('Capacity','Bandwidth utilization',c.bandwidthUtilizationPct,'%'); add('Capacity','Allocated power',c.totalAllocatedPowerW,'W'); add('Capacity','HPA operating budget',c.hpaOperatingBudgetW,'W'); add('Capacity','Power loading',c.powerLoadingPct,'%'); add('Capacity','Aggregate net rate',c.aggregateNetRateMbps,'Mbps'); add('Capacity','Net spectral efficiency',c.spectralEfficiencyBitsPerHz,'bit/s/Hz'); }
    if (a.ok) { add('Availability','Baseline availability',a.baselineAvailabilityPct,'%'); add('Availability','Scenario availability',a.scenarioAvailabilityPct,'%'); add('Availability','Outage hours saved',a.outageHoursSaved,'h'); add('Availability','Remaining margin',a.remainingMarginDb,'dB'); }
    rows.push(['Metadata','Status',report.status,'']); rows.push(['Metadata','Generated at',report.generatedAt,'']);
    download('satellite-ops-scenario-summary.csv', rows.map(row => row.map(csvEscape).join(',')).join('\r\n'), 'text/csv;charset=utf-8'); showToast(t('exported'));
  }

  function runChecks() {
    const checks = Core.selfCheck();
    $('selfCheckResults').innerHTML = checks.map(c => `<div class="check-row"><span class="check-icon ${c.passed ? 'pass' : 'fail'}">${c.passed ? '✓' : '×'}</span><div><strong>${esc(c.name)}</strong><small>${esc(c.detail)}</small></div><strong>${c.passed ? 'PASS' : 'FAIL'}</strong></div>`).join('');
    const all = checks.every(c => c.passed);
    $('selfCheckResults').insertAdjacentHTML('beforeend', `<p class="muted-copy">${checks.filter(c => c.passed).length}/${checks.length} ${esc(all ? t('checksPassed') : t('checksFailed'))}.</p>`);
    return all;
  }
  function renderSelfChecks() { runChecks(); }
  function addReportNote(note) { reportNote = note; renderReport(); showToast(t('reportAdded')); }

  function readAndAnalyzeCsv(text, name) {
    const parsed = Core.parseCsv(text);
    const analysis = Core.analyzeMeasurements(parsed.headers, parsed.records);
    latestTriage = { headers: parsed.headers, records: parsed.records, analysis };
    triageSourceName = name;
    $('csvError').hidden = true;
    renderTriage(); renderReport(); showToast(t('sampleLoaded'));
  }
  const SAMPLE_CSV = `timestamp,cn_db,ber,rx_power_dbm,modcod\n2026-10-19T08:00:00Z,12.4,0.000001,-68.1,8PSK_3/4\n2026-10-19T08:05:00Z,12.1,0.000001,-68.3,8PSK_3/4\n2026-10-19T08:10:00Z,11.6,0.000002,-68.6,8PSK_3/4\n2026-10-19T08:15:00Z,10.8,0.000004,-69.2,8PSK_3/4\n2026-10-19T08:20:00Z,10.1,0.000009,-69.8,8PSK_2/3\n2026-10-19T08:25:00Z,9.9,0.000012,-70.0,8PSK_2/3`;

  // Navigation and language/theme controls.
  document.querySelectorAll('.nav-item[data-page]').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.page)));
  document.querySelectorAll('[data-go]').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.go)));
  $('menuToggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));
  document.addEventListener('click', (event) => { if (window.innerWidth <= 900 && $('sidebar').classList.contains('open') && !$('sidebar').contains(event.target) && !$('menuToggle').contains(event.target)) $('sidebar').classList.remove('open'); });
  $('languageToggle').addEventListener('click', () => { language = language === 'en' ? 'ar' : 'en'; localStorage.setItem('soi-language', language); applyLanguage(); });
  $('themeToggle').addEventListener('click', () => setTheme(theme === 'dark' ? 'light' : 'dark'));

  inputIds.link.forEach((id) => $(id).addEventListener('input', () => { renderLink(); renderOverview(); renderReport(); }));
  $('linkDirection').addEventListener('change', () => applyDirectionProfile($('linkDirection').value, true));
  $('applyDirectionProfile').addEventListener('click', () => applyDirectionProfile($('linkDirection').value, true));
  $('resetLink').addEventListener('click', () => { applyDirectionProfile($('linkDirection').value, false); showToast(t('resetDone')); });
  $('calculateCombined').addEventListener('click', () => {
    const values = $('combinedRatiosInput').value.split(/[,;\s]+/).filter(Boolean).map((v) => Number(v));
    try {
      const result = Core.combineDbRatios(values);
      $('combinedRatiosResult').textContent = `${number(result)} dB`;
      $('combinedRatiosState').textContent = `${t('combinedResultLabel')} = −10 log₁₀(Σ10^(−xᵢ/10))`;
      $('combinedRatiosState').style.color = 'var(--green)';
    } catch (_) {
      $('combinedRatiosResult').textContent = '—';
      $('combinedRatiosState').textContent = t('combinedInvalid');
      $('combinedRatiosState').style.color = 'var(--red)';
    }
  });
  $('useLinkMargin').addEventListener('click', () => { const r = Core.calculateLinkBudget(getLinkInputsFromDom()); if (!r.ok) return showToast(t('notCalculated')); $('linkMarginDb').value = r.residualMarginDb.toFixed(2); renderAvailability(); renderReport(); showToast(t('marginCopied')); });
  $('linkReport').addEventListener('click', () => { addReportNote(`Link Budget output added at ${new Date().toISOString()}.`); navigate('reports'); });

  $('hpaSaturationDbw').addEventListener('input', () => { syncHpaWattsFromDbw(); renderCapacity(false); renderOverview(); renderReport(); });
  $('hpaSaturationWatts').addEventListener('input', () => { if (syncHpaDbwFromWatts()) { renderCapacity(false); renderOverview(); renderReport(); } });
  inputIds.capacity.filter((id) => id !== 'hpaSaturationDbw').forEach((id) => $(id).addEventListener('input', () => { renderCapacity(false); renderOverview(); renderReport(); }));
  $('carrierRows').addEventListener('input', (event) => {
    const field = event.target.dataset.carrierField; const row = event.target.closest('tr'); if (!field || !row) return;
    const index = Number(row.dataset.index); if (!carriers[index]) return;
    if (field === 'name') carriers[index][field] = event.target.value;
    else carriers[index][field] = event.target.value.trim() === '' ? NaN : Number(event.target.value);
    renderCapacity(false); renderOverview(); renderReport();
  });
  $('carrierRows').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-delete-carrier]'); if (!btn) return;
    carriers.splice(Number(btn.dataset.deleteCarrier), 1); buildCarrierRows(); renderCapacity(false); renderOverview(); renderReport();
  });
  $('addCarrier').addEventListener('click', () => {
    carriers.push({ name: `Carrier ${String.fromCharCode(65 + (carriers.length % 26))}${carriers.length >= 26 ? Math.floor(carriers.length / 26) : ''}`, symbolRateMsps: 5, rolloff: 0.2, guardMHz: 0.2, powerW: 1, netRateMbps: 10 });
    buildCarrierRows(); renderCapacity(false); renderOverview(); renderReport();
  });
  $('resetCapacity').addEventListener('click', () => { capacityInputs = clone(DEFAULT_CAPACITY); carriers = clone(DEFAULT_CARRIERS); assignCapacityToDom(); buildCarrierRows(); renderCapacity(false); renderOverview(); renderReport(); showToast(t('resetDone')); });

  inputIds.availability.forEach((id) => $(id).addEventListener('input', () => { renderAvailability(); renderReport(); }));
  $('pullLinkMargin').addEventListener('click', () => { const r = Core.calculateLinkBudget(getLinkInputsFromDom()); if (!r.ok) return showToast(t('notCalculated')); $('linkMarginDb').value = r.residualMarginDb.toFixed(2); renderAvailability(); renderReport(); showToast(t('marginCopied')); });
  $('resetAvailability').addEventListener('click', () => { availabilityInputs = clone(DEFAULT_AVAILABILITY); assignAvailabilityToDom(); renderAvailability(); renderReport(); showToast(t('resetDone')); });
  $('availabilityReport').addEventListener('click', () => { addReportNote(`Availability scenario added at ${new Date().toISOString()}.`); navigate('reports'); });

  $('csvInput').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) { $('csvError').hidden = false; $('csvError').textContent = 'File exceeds the 5 MB prototype limit.'; return; }
    try { readAndAnalyzeCsv(await file.text(), file.name); }
    catch (e) { $('csvError').hidden = false; $('csvError').textContent = `${t('csvErrorPrefix')}${e.message || t('fileReadError')}`; }
  });
  $('loadSampleCsv').addEventListener('click', () => { try { readAndAnalyzeCsv(SAMPLE_CSV, language === 'ar' ? 'عينة-اصطناعية.csv' : 'synthetic-sample.csv'); } catch (e) { $('csvError').hidden = false; $('csvError').textContent = e.message; } });
  $('downloadJson').addEventListener('click', exportJson); $('downloadCsv').addEventListener('click', exportCsv);
  $('printReport').addEventListener('click', () => { navigate('reports'); showToast(t('printHint')); window.print(); });
  $('rerunChecks').addEventListener('click', () => { runChecks(); showToast(t('checksPassed')); });
  $('loadExample').addEventListener('click', () => { linkInputs = clone(DEFAULT_LINK); capacityInputs = clone(DEFAULT_CAPACITY); carriers = clone(DEFAULT_CARRIERS); availabilityInputs = clone(DEFAULT_AVAILABILITY); assignLinkToDom(); assignCapacityToDom(); assignAvailabilityToDom(); buildCarrierRows(); renderLink(); renderCapacity(false); renderAvailability(); renderOverview(); renderReport(); navigate('overview'); showToast(t('scenarioLoaded')); });
  $('year').textContent = new Date().getFullYear();

  // PWA install prompt: Android Chrome may instead show Install app in its own menu.
  window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installPromptEvent = event; $('installButton').hidden = false; });
  $('installButton').addEventListener('click', async () => { if (!installPromptEvent) return; installPromptEvent.prompt(); await installPromptEvent.userChoice.catch(() => null); installPromptEvent = null; $('installButton').hidden = true; });
  window.addEventListener('appinstalled', () => { $('installButton').hidden = true; showToast(language === 'ar' ? 'تم تثبيت التطبيق.' : 'App installed.'); });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }

  // Initial UI setup. Relative asset paths make this work from a subfolder (e.g. GitHub Pages).
  setTheme(theme);
  assignLinkToDom(); assignCapacityToDom(); syncHpaWattsFromDbw(); updateDirectionLabels(); assignAvailabilityToDom(); buildCarrierRows();
  applyLanguage();
  renderLink(); renderCapacity(false); renderAvailability(); renderOverview(); renderReport();
  $('calculateCombined').click();
})();
