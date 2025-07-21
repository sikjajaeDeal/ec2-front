
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SocialLoginButtons from './auth/SocialLoginButtons';
import LocationDisplay from './auth/LocationDisplay';
import AuthForm from './auth/AuthForm';
import EmailVerification from './auth/EmailVerification';
import FindIdForm from './auth/FindIdForm';
import FindPasswordForm from './auth/FindPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = 'login' | 'email-verification' | 'signup' | 'find-id' | 'find-password';

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const handleSubmit = (formData: any) => {
    console.log('Form submitted:', formData);
    onClose();
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} login clicked`);
    onClose();
  };

  const handleEmailVerified = (email: string) => {
    setVerifiedEmail(email);
    setCurrentStep('signup');
  };

  const handleToggleMode = () => {
    if (currentStep === 'login') {
      setCurrentStep('email-verification');
    } else {
      setCurrentStep('login');
      setVerifiedEmail('');
    }
  };

  // 모달이 닫힐 때 상태 초기화 - 깜빡임 방지를 위해 약간의 지연 추가
  const handleClose = () => {
    // 현재 단계가 이메일 인증이면 즉시 로그인으로 변경하지 않고 바로 닫기
    if (currentStep !== 'email-verification') {
      setCurrentStep('login');
      setVerifiedEmail('');
    }
    onClose();
    
    // 모달이 완전히 닫힌 후 상태 초기화
    setTimeout(() => {
      setCurrentStep('login');
      setVerifiedEmail('');
    }, 200);
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case 'login':
        return '로그인';
      case 'email-verification':
        return '이메일 인증';
      case 'signup':
        return '회원가입';
      case 'find-id':
        return '아이디 찾기';
      case 'find-password':
        return '비밀번호 찾기';
      default:
        return '로그인';
    }
  };

  const getMaxWidth = () => {
    return currentStep === 'signup' ? 'sm:max-w-6xl' : 'sm:max-w-md';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={getMaxWidth()}>
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-green-700">
            {getModalTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className={`flex gap-8 p-6 ${currentStep !== 'signup' ? 'justify-center' : ''}`}>
          {/* Left Side - Form */}
          <div className={`space-y-6 ${currentStep !== 'signup' ? 'w-full max-w-sm' : 'flex-1'}`}>
            {currentStep === 'email-verification' ? (
              <EmailVerification onVerified={handleEmailVerified} />
            ) : currentStep === 'find-id' ? (
              <FindIdForm onBack={() => setCurrentStep('login')} />
            ) : currentStep === 'find-password' ? (
              <FindPasswordForm onBack={() => setCurrentStep('login')} />
            ) : (
              <>
                <SocialLoginButtons 
                  isLogin={currentStep === 'login'} 
                  onSocialLogin={handleSocialLogin} 
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">또는</span>
                  </div>
                </div>

                <AuthForm 
                  isLogin={currentStep === 'login'} 
                  onSubmit={handleSubmit}
                  prefilledEmail={verifiedEmail}
                  onClose={handleClose}
                  onFindId={() => setCurrentStep('find-id')}
                  onFindPassword={() => setCurrentStep('find-password')}
                />
              </>
            )}

            {currentStep !== 'email-verification' && currentStep !== 'find-id' && currentStep !== 'find-password' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleToggleMode}
                  className="text-sm text-green-600 hover:text-green-700 underline"
                >
                  {currentStep === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Location Map for Signup */}
          {currentStep === 'signup' && (
            <LocationDisplay isOpen={isOpen && currentStep === 'signup'} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
