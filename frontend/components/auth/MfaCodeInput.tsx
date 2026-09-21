'use client';

import { useRef, useEffect, useState } from 'react';

interface MfaCodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

/**
 * AWS Cognito-style 6-digit MFA code input.
 * - One box per digit, auto-advance on type
 * - Backspace moves back
 * - Paste support (full code pasted into any box)
 */
export default function MfaCodeInput({
  length = 6,
  onComplete,
  disabled = false,
  error,
  autoFocus = true,
}: MfaCodeInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const completedRef = useRef(false);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const reset = () => {
    setDigits(Array(length).fill(''));
    completedRef.current = false;
    inputsRef.current[0]?.focus();
  };

  // Expose reset via key change pattern: parent can remount with a key
  useEffect(() => {
    if (error) {
      setDigits(Array(length).fill(''));
      completedRef.current = false;
    }
  }, [error, length]);

  const emitIfComplete = (next: string[]) => {
    const code = next.join('');
    if (code.length === length && !next.includes('') && !completedRef.current) {
      completedRef.current = true;
      onComplete(code);
    }
  };

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    const next = [...digits];
    // Support typing/pasting multiple chars into one box
    const chars = clean.slice(0, length - index).split('');
    chars.forEach((ch, i) => { next[index + i] = ch; });
    setDigits(next);

    const focusIdx = Math.min(index + chars.length, length - 1);
    inputsRef.current[focusIdx]?.focus();
    emitIfComplete(next);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = '';
      } else if (index > 0) {
        next[index - 1] = '';
        inputsRef.current[index - 1]?.focus();
      }
      setDigits(next);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
    emitIfComplete(next);
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={length}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            aria-label={`Digit ${i + 1}`}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 outline-none transition-all
              ${error
                ? 'border-red-400 bg-red-50 text-red-700'
                : digit
                  ? 'border-blue-500 bg-blue-50 text-gray-900'
                  : 'border-gray-300 bg-white text-gray-900'
              }
              focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:opacity-50`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
