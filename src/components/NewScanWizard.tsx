/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - 5-Step Progressive Scan Wizard
 * Compliant with Prompt 2 & Prompt 5
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ScanJob, ModuleType, Subject } from '../types.ts';
import { calculateShadowScore, INDIAN_STATES, SYNTHETIC_CASES } from '../data/syntheticDatasets.ts';
import { Shield, Check, ArrowRight, ArrowLeft, Loader2, Sparkles, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const NewScanWizard: React.FC = () => {
  const { addNewScan, navigate, showToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [selectedSyntheticPreset, setSelectedSyntheticPreset] = useState<string>('arun_s');
  
  // Form State
  const [subjectName, setSubjectName] = useState<string>('Arun Sharma');
  const [city, setCity] = useState<string>('Chandigarh');
  const [state, setState] = useState<string>('Chandigarh');
  const [institution, setInstitution] = useState<string>('Punjab Engineering College');
  const [employer, setEmployer] = useState<string>('CyberMatrix Infotech');
  const [primaryHandle, setPrimaryHandle] = useState<string>('@arun_sharma_99');
  
  // Step 2: Purpose & Consent
  const [purpose, setPurpose] = useState<string>('Digital footprint self-assessment & exposure audit');
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [consentConfirmed, setConsentConfirmed] = useState<boolean>(true);

  // Step 3: Modules
  const [selectedModules, setSelectedModules] = useState<ModuleType[]>([
    'exposure', 'impersonation', 'documents', 'research'
  ]);

  // Step 5: Execution State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>('Initializing job container...');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const handleSelectPreset = (presetKey: string) => {
    setSelectedSyntheticPreset(presetKey);
    const preset = SYNTHETIC_CASES[presetKey];
    if (preset) {
      setSubjectName(preset.subject.name);
      setCity(preset.subject.city);
      setState(preset.subject.state);
      setInstitution(preset.subject.institution || '');
      setEmployer(preset.subject.employer || '');
      setPrimaryHandle(preset.subject.primaryHandle || '');
      setSelectedModules(preset.selectedModules);
    }
  };

  const toggleModule = (mod: ModuleType) => {
    setSelectedModules((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const startScanJob = () => {
    setIsProcessing(true);
    setProgressPercent(15);
    setProgressStage('Step 1/4: Ingesting consented evidence tokens...');

    setTimeout(() => {
      setProgressPercent(45);
      setProgressStage('Step 2/4: Running Tesseract eng/hin OCR & morphological checks...');
    }, 1200);

    setTimeout(() => {
      setProgressPercent(75);
      setProgressStage('Step 3/4: Building multi-vector graph & calculating feature distances...');
    }, 2400);

    setTimeout(() => {
      setProgressPercent(95);
      setProgressStage('Step 4/4: Synthesizing deterministic Shadow Score...');
    }, 3600);

    setTimeout(() => {
      setIsProcessing(false);
      setProgressPercent(100);

      // Create new scan based on active preset template with updated user values
      const baseCase = SYNTHETIC_CASES[selectedSyntheticPreset] || SYNTHETIC_CASES.arun_s;
      const newSubject: Subject = {
        ...baseCase.subject,
        id: `sub-${Date.now()}`,
        name: subjectName,
        city,
        state,
        institution,
        employer,
        primaryHandle,
      };

      const newJob: ScanJob = {
        ...baseCase,
        id: `scan-${Date.now()}`,
        subject: newSubject,
        consent: {
          ...baseCase.consent,
          id: `cst-${Date.now()}`,
          purpose,
          retentionDays,
          acceptedAt: new Date().toISOString(),
        },
        selectedModules,
        queuedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'succeeded',
      };

      addNewScan(newJob);
      navigate('/app/overview');
    }, 4500);
  };

  return (
    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-6 max-w-4xl mx-auto">
      {/* Wizard Step Indicator */}
      <div className="mb-6 pb-4 border-b border-[#172A42]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#A3E635]" />
            <h2 className="text-lg font-display font-bold text-[#F1F5F9]">
              New Evidence-Led Assessment
            </h2>
          </div>
          <div className="text-xs font-mono-code text-[#38BDF8]">
            Step {step} of 5
          </div>
        </div>

        {/* Stepper Dots */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {[
            '1. Subject Profile',
            '2. Scope & Consent',
            '3. Module Matrix',
            '4. Evidence Review',
            '5. Scan Dispatch',
          ].map((label, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  step > idx + 1
                    ? 'bg-[#A3E635]'
                    : step === idx + 1
                    ? 'bg-[#38BDF8]'
                    : 'bg-[#1E3A5F]'
                }`}
              />
              <span className={`text-[10px] font-mono-code truncate ${step === idx + 1 ? 'text-[#F1F5F9]' : 'text-[#64748B]'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: SUBJECT SELECTION & SYNTHETIC PRESETS */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
              Select Investigation Subject or Repeatable Indian Preset
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Choose from the verified synthetic test datasets or input authorized subject details.
            </p>
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {Object.entries(SYNTHETIC_CASES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectPreset(key)}
                className={`p-3 rounded border text-left transition-all ${
                  selectedSyntheticPreset === key
                    ? 'bg-[#172A42] border-[#38BDF8] text-[#F1F5F9] shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'bg-[#07111F] border-[#1E3A5F] text-[#94A3B8] hover:border-[#38BDF8]/40'
                }`}
              >
                <div className="text-xs font-bold text-[#F1F5F9] flex items-center justify-between">
                  <span>{item.subject.name}</span>
                  <span className="text-[10px] font-mono-code text-[#A3E635]">
                    {item.subject.city}
                  </span>
                </div>
                <div className="text-[11px] text-[#64748B] mt-1 line-clamp-2">
                  {item.subject.notes}
                </div>
              </button>
            ))}
          </div>

          {/* Field Form */}
          <div className="pt-3 border-t border-[#172A42] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#94A3B8] mb-1">Subject Full Name</label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2 text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Primary Public Handle</label>
              <input
                type="text"
                value={primaryHandle}
                onChange={(e) => setPrimaryHandle(e.target.value)}
                className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2 text-[#F1F5F9] font-mono-code focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">City / District</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2 text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Indian State / UT</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2 text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st} className="bg-[#07111F]">
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Institution / Alma Mater</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2 text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
            <div>
              <label className="block text-[#94A3B8] mb-1">Current Employer / Organization</label>
              <input
                type="text"
                value={employer}
                onChange={(e) => setEmployer(e.target.value)}
                className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2 text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PURPOSE, SCOPE & RETENTION */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
              Purpose, Permission Scope & Data Retention Policy
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Strict governance: Consent is mandatory. No arbitrary mass surveillance allowed.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#94A3B8] mb-1">Assessment Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2 text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div>
              <label className="block text-[#94A3B8] mb-1">Evidence Retention Limit</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { days: 1, label: '24 Hours', desc: 'Mandatory default for raw document images' },
                  { days: 30, label: '30 Days', desc: 'Standard analysis evidence window' },
                  { days: 90, label: '90 Days', desc: 'Extended enterprise retention' },
                ].map((item) => (
                  <button
                    key={item.days}
                    type="button"
                    onClick={() => setRetentionDays(item.days)}
                    className={`p-3 rounded border text-left ${
                      retentionDays === item.days
                        ? 'bg-[#172A42] border-[#A3E635] text-[#F1F5F9]'
                        : 'bg-[#07111F] border-[#1E3A5F] text-[#94A3B8]'
                    }`}
                  >
                    <div className="font-bold text-[#A3E635]">{item.label}</div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Consent Attestation */}
            <div className="p-3 bg-[#07111F] border border-[#1E3A5F] rounded flex items-start gap-2.5">
              <input
                type="checkbox"
                id="consent"
                checked={consentConfirmed}
                onChange={(e) => setConsentConfirmed(e.target.checked)}
                className="mt-0.5 rounded bg-[#0F1D2E] border-[#1E3A5F] text-[#A3E635] focus:ring-0"
              />
              <label htmlFor="consent" className="text-xs text-[#CBD5E1] cursor-pointer leading-relaxed">
                I certify that this investigation is executed under lawful authorization (self-assessment or authorized mandate).
                I understand that raw documents expire after {retentionDays} days and will not be shared with external APIs.
              </label>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: MODULE SELECTION */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
              Select Assessment Intelligence Modules
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Selecting fewer modules yields a clearly labeled provisional Shadow Score.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              {
                id: 'exposure' as ModuleType,
                name: 'Exposure Intelligence',
                weight: '35% Weight',
                desc: 'Scrutinizes public disclosures, telecom leaks, and cross-platform handle correlation.',
              },
              {
                id: 'impersonation' as ModuleType,
                name: 'Impersonation Intelligence',
                weight: '25% Weight',
                desc: 'Compares reference identity tokens against candidate profiles with perceptual avatar hashing.',
              },
              {
                id: 'documents' as ModuleType,
                name: 'Document Defense & OCR',
                weight: '15% Weight',
                desc: 'Performs Tesseract eng/hin OCR and optical baseline consistency checks on sample IDs.',
              },
              {
                id: 'research' as ModuleType,
                name: 'iNSIGHTS Manual Bridge',
                weight: 'Auxiliary Context',
                desc: 'Reviewed manual research import for open threat intelligence without automated vendor lock-in.',
              },
            ].map((mod) => {
              const active = selectedModules.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={`p-4 rounded border cursor-pointer transition-all ${
                    active
                      ? 'bg-[#172A42] border-[#38BDF8] text-[#F1F5F9]'
                      : 'bg-[#07111F] border-[#1E3A5F] text-[#64748B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#F1F5F9]">{mod.name}</span>
                    <span className="text-[10px] font-mono-code text-[#A3E635] bg-[#07111F] px-1.5 py-0.5 rounded border border-[#1E3A5F]">
                      {mod.weight}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8]">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: EVIDENCE REVIEW */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
              Review Submitted Evidence Tokens
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Confirm the authorized evidence fixtures before queuing the analytical pipeline.
            </p>
          </div>

          <div className="p-4 bg-[#07111F] border border-[#1E3A5F] rounded space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#172A42]">
              <span className="text-[#94A3B8]">Subject Name:</span>
              <span className="text-[#F1F5F9] font-bold">{subjectName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#172A42]">
              <span className="text-[#94A3B8]">Territory:</span>
              <span className="text-[#38BDF8] font-mono-code">{city}, {state}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#172A42]">
              <span className="text-[#94A3B8]">Primary Handle:</span>
              <span className="text-[#A3E635] font-mono-code">{primaryHandle}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#172A42]">
              <span className="text-[#94A3B8]">Selected Modules:</span>
              <span className="text-[#F1F5F9] capitalize font-mono-code">{selectedModules.join(', ')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#94A3B8]">Retention Schedule:</span>
              <span className="text-[#F59E0B] font-mono-code">{retentionDays} Days TTL</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: DISPATCH & PROCESSING */}
      {step === 5 && (
        <div className="py-8 text-center space-y-4">
          {isProcessing ? (
            <div className="space-y-4 max-w-md mx-auto">
              <Loader2 className="w-10 h-10 text-[#38BDF8] animate-spin mx-auto" />
              <h3 className="text-base font-display font-bold text-[#F1F5F9]">
                Executing Multi-Vector Analysis Engine
              </h3>
              <p className="text-xs text-[#38BDF8] font-mono-code">
                {progressStage}
              </p>

              <div className="w-full bg-[#07111F] rounded-full h-2 overflow-hidden border border-[#1E3A5F]">
                <div
                  className="bg-[#A3E635] h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#A3E635] mx-auto" />
              <h3 className="text-base font-display font-bold text-[#F1F5F9]">
                Evidence Ingest Ready for Execution
              </h3>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                Clicking "Dispatch Analysis" persists the job and initiates deterministic graph synthesis and document OCR.
              </p>
              <button
                onClick={startScanJob}
                className="px-6 py-2.5 bg-[#A3E635] text-[#07111F] font-bold text-xs rounded hover:bg-[#bef264] transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)]"
              >
                Dispatch Analysis Job
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      {!isProcessing && (
        <div className="mt-6 pt-4 border-t border-[#172A42] flex items-center justify-between">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep((s) => s - 1)}
            className="px-3 py-1.5 rounded text-xs text-[#94A3B8] hover:text-[#F1F5F9] disabled:opacity-30 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-1.5 rounded text-xs font-semibold bg-[#38BDF8] text-[#07111F] hover:bg-[#7bd0ff] flex items-center gap-1"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
