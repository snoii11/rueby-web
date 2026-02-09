"use client";

import { useState } from 'react';

interface WizardLayoutProps {
    children: React.ReactNode;
    currentStep: number;
    totalSteps: number;
    stepTitles: string[];
    onNext: () => void;
    onBack: () => void;
    onSkip?: () => void;
    canGoNext?: boolean;
    isLastStep?: boolean;
    isSubmitting?: boolean;
}

export default function WizardLayout({
    children,
    currentStep,
    totalSteps,
    stepTitles,
    onNext,
    onBack,
    onSkip,
    canGoNext = true,
    isLastStep = false,
    isSubmitting = false
}: WizardLayoutProps) {
    const progress = ((currentStep) / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] flex flex-col">
            {/* Header with progress */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="text-2xl">⚡</span>
                            Setup Wizard
                        </h1>
                        <span className="text-sm text-white/40">
                            Step {currentStep + 1} of {totalSteps}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-red-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Step indicators */}
                    <div className="flex justify-between mt-3">
                        {stepTitles.map((title, idx) => (
                            <div
                                key={idx}
                                className={`text-xs font-medium transition-colors ${idx === currentStep
                                        ? 'text-rose-400'
                                        : idx < currentStep
                                            ? 'text-white/60'
                                            : 'text-white/20'
                                    }`}
                            >
                                {idx <= currentStep && (
                                    <span className={`inline-block w-5 h-5 rounded-full text-center leading-5 mr-1 text-[10px] ${idx < currentStep
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-rose-500/20 text-rose-400'
                                        }`}>
                                        {idx < currentStep ? '✓' : idx + 1}
                                    </span>
                                )}
                                <span className="hidden sm:inline">{title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    {children}
                </div>
            </main>

            {/* Footer with navigation */}
            <footer className="sticky bottom-0 backdrop-blur-xl bg-black/50 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        disabled={currentStep === 0}
                        className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${currentStep === 0
                                ? 'text-white/20 cursor-not-allowed'
                                : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <div className="flex items-center gap-3">
                        {onSkip && !isLastStep && (
                            <button
                                onClick={onSkip}
                                className="px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
                            >
                                Skip for now
                            </button>
                        )}

                        <button
                            onClick={onNext}
                            disabled={!canGoNext || isSubmitting}
                            className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${canGoNext && !isSubmitting
                                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-500/20'
                                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : isLastStep ? (
                                <>
                                    Complete Setup
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </>
                            ) : (
                                <>
                                    Continue
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
