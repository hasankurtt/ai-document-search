import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, getErrorMessage } from '../services/api';
import { Button, Input, Card } from '../components/UI';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await authApi.login({ email, password });
        await login(res.data.access_token, res.data.refresh_token);
      } else {
        const res = await authApi.register({ name, email, password });
        await login(res.data.access_token, res.data.refresh_token);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Branding */}
        <div className="hidden lg:block space-y-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">AI Document Search</h1>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed">
              Unlock the knowledge hidden in your documents. Upload PDFs and text files, then chat with them using our advanced RAG architecture powered by GPT-4.
            </p>
          </div>

          <div className="space-y-4">
            <FeatureItem icon={Zap} title="Instant Answers" desc="Get precise answers with source references in seconds." />
            <FeatureItem icon={ShieldCheck} title="Secure & Private" desc="Your documents are processed securely in isolated rooms." />
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <Card className="w-full max-w-md mx-auto backdrop-blur-md bg-card/80 border-white/10 shadow-2xl shadow-black/50">
          <div className="flex space-x-4 mb-8 border-b border-white/5 pb-1">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`pb-3 text-sm font-medium transition-colors ${isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`pb-3 text-sm font-medium transition-colors ${!isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={loading}>
              {isLogin ? 'Sign In' : 'Get Started'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </Card>
      </div>
    </div>
  );
};

const FeatureItem: React.FC<{ icon: any, title: string, desc: string }> = ({ icon: Icon, title, desc }) => (
  <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 border border-white/5">
    <div className="p-2 bg-gray-800 rounded-lg text-blue-400">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-white font-medium">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{desc}</p>
    </div>
  </div>
);