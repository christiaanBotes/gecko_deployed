import React, { useState } from 'react';
import { KeyRound, Shield, CheckCircle2, RotateCw, Eye, EyeOff, Info } from 'lucide-react';

export default function ApiManagement() {
  const [clientId, setClientId] = useState('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
  const [clientSecret, setClientSecret] = useState('xoxb-123456789012-1234567890123-abc123def456ghi789jkl012');
  const [showSecret, setShowSecret] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTestConnection = () => {
    if (isTesting) return;
    setIsTesting(true);
    setTestSuccess(false);
    
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
      
      setTimeout(() => {
        setTestSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#f7f9fb] p-6 lg:p-10 font-sans overflow-y-auto">
      <div className="max-w-[800px] w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight flex items-center gap-3">
            <KeyRound className="w-7 h-7 text-[#0062d6]" />
            API Management
          </h1>
          <p className="text-[#424754] text-sm mt-2">
            Configure integration credentials for Gecko to securely access external systems, such as ITSM.Next for incident ingestion and automated triaging.
          </p>
        </div>

        <div className="bg-white border border-[#c2c6d6] rounded-xl overflow-hidden shadow-sm">
          <div className="bg-[#f0f6fc] border-b border-[#e2e8f0] px-6 py-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#004ba7]" />
            <h2 className="font-bold text-[#004ba7] text-base">ITSM.Next Integration</h2>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-[#424754] mb-6">
              Enter the Client ID and Client Secret generated from your ITSM.Next admin console. These credentials allow Gecko to pull live incidents and push resolution patches.
            </p>

            <div className="bg-[#eef4ff] border border-[#d6e4ff] rounded-lg p-3 mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#0062d6] mt-0.5 shrink-0" />
              <p className="text-xs text-[#004ba7] leading-relaxed">
                <strong>Scope Notice:</strong> ITSM.Next tickets are only scoped to the team that requested the API access. You will not be able to read or query other teams' incidents with these credentials.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1.5 flex items-center justify-between">
                  ITSM.Next Client ID
                  <span className="text-gray-400 font-normal">Required</span>
                </label>
                <input 
                  type="text" 
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-[#eceef0] border border-[#c2c6d6] rounded-md py-2 px-3 text-sm focus:outline-none focus:border-[#004ba7] focus:ring-1 focus:ring-[#004ba7] text-[#191c1e] placeholder:text-[#424754]/50 font-mono transition-colors"
                  placeholder="e.g. 1a2b3c4d-5e6f-..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191c1e] mb-1.5 flex items-center justify-between">
                  Client Secret
                  <span className="text-gray-400 font-normal">Required</span>
                </label>
                <div className="relative">
                  <input 
                    type={showSecret ? "text" : "password"}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full bg-[#eceef0] border border-[#c2c6d6] rounded-md py-2 px-3 pr-10 text-sm focus:outline-none focus:border-[#004ba7] focus:ring-1 focus:ring-[#004ba7] text-[#191c1e] placeholder:text-[#424754]/50 font-mono transition-colors"
                    placeholder="Enter your confidential secret key..."
                  />
                  <button 
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-[#191c1e] transition-colors"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#e2e8f0] flex items-center gap-4">
              <button 
                onClick={handleSave}
                disabled={isTesting}
                className={`bg-[#0052CC] hover:bg-[#0047b3] text-white px-5 py-2 rounded text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Save Credentials
              </button>
              
              <button 
                onClick={handleTestConnection}
                disabled={isTesting || clientId.trim() === '' || clientSecret.trim() === ''}
                className={`bg-white hover:bg-[#eceef0] border border-[#c2c6d6] text-[#424754] px-5 py-2 rounded text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer ${isTesting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RotateCw className={`w-4 h-4 ${isTesting ? 'animate-spin text-[#0062d6]' : ''}`} />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>

              {isSaved && !testSuccess && (
                <div className="flex items-center gap-1.5 text-[#006c27] text-sm animate-fade-in ml-auto font-medium bg-[#c4eed0]/30 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved
                </div>
              )}
              
              {testSuccess && (
                <div className="flex items-center gap-1.5 text-[#0062d6] text-sm animate-fade-in ml-auto font-medium bg-[#0062d6]/10 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  Connection Successful
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
