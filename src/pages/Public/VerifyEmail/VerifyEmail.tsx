import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button/Button';
import { authService } from '../../../features/auth/api/authService';
import { ShieldCheck, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

export const VerifyEmail: React.FC = () => {
  const { t } = useTranslation(['auth']);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Resend OTP specific state
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1); // only 1 char
    if (!/^[0-9]*$/.test(value)) return; // numbers only

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // auto focus next
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6 || !email) {
      setErrorMessage(t('auth:verify_email.error_fill_fields'));
      setStatus('failed');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await authService.verifyAccount({ email, otp: otpString });
      setStatus('success');
      // Redirect to login after 2s as before
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setStatus('failed');
      const msg = err.response?.data?.message || t('auth:verify_email.error_verify_failed');
      setErrorMessage(msg);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setIsResending(true);
    setErrorMessage('');
    try {
      await authService.resendVerificationToken(email);
      setResendCooldown(60);
      setStatus('idle');
      // Optional: show a success toast here
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || t('auth:verify_email.error_resend_failed'));
      setStatus('failed');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="w-16 h-16 bg-blue-50 text-[#2e3d83] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldCheck size={32} />
        </div>

        <h2 className="text-2xl font-extrabold text-center text-slate-900 mb-2">{t('auth:verify_email.title')}</h2>
        <p className="text-center text-slate-500 mb-8 font-medium">
          <Trans i18nKey="auth:verify_email.subtitle" values={{ email: email || t('common:your_email', 'của bạn') }}>
            Vui lòng kiểm tra hộp thư <strong className="text-[#2e3d83]">email</strong> (bao gồm cả thư rác) để lấy mã OTP gồm 6 chữ số.
          </Trans>
        </p>

        {status === 'success' ? (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-6 rounded-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center mb-4 text-white">
              <ShieldCheck size={28} />
            </div>
            <h3 className="font-extrabold text-xl mb-1 text-emerald-600">{t('auth:verify_email.success_title')}</h3>
            <p className="text-emerald-700/80 font-medium">{t('auth:verify_email.success_subtitle')}</p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            {!emailParam && (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth:verify_email.email_placeholder')}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 outline-none transition-all font-medium text-slate-900"
                  required
                />
              </div>
            )}

            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-extrabold text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#2e3d83] focus:ring-4 focus:ring-[#2e3d83]/10 focus:bg-white transition-all outline-none shadow-sm"
                />
              ))}
            </div>

            {status === 'failed' && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold text-center border border-red-100 animate-in shake">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-center justify-center rounded-xl bg-[#2e3d83] hover:bg-[#1a2350] transition-colors font-bold flex items-center gap-2 text-lg shadow-xl shadow-[#2e3d83]/20 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={status === 'loading' || otp.join('').length !== 6 || !email}
            >
              {status === 'loading' ? <Loader2 className="animate-spin" /> : t('auth:verify_email.submit_btn')}
              {status !== 'loading' && <ArrowRight size={20} />}
            </Button>

            <div className="flex justify-center mt-6">
              <button
                type="button"
                className={`text-sm font-bold transition-colors ${resendCooldown > 0 || isResending || !email ? 'text-slate-400 cursor-not-allowed' : 'text-[#2e3d83] hover:text-blue-700 underline'}`}
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending || !email}
              >
                {isResending ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
                {resendCooldown > 0 
                  ? t('auth:verify_email.resend_cooldown', { seconds: resendCooldown }) 
                  : t('auth:verify_email.resend_btn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
