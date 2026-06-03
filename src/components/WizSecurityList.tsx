import React from 'react';
import { ShieldAlert, Shield, Search, Filter, ShieldCheck, ChevronRight, Lock, KeyRound } from 'lucide-react';
import { WizVulnerability } from '../types';

interface WizSecurityListProps {
  vulnerabilities: WizVulnerability[];
  onSelectVulnerability: (vuln: WizVulnerability) => void;
}

export default function WizSecurityList({ vulnerabilities, onSelectVulnerability }: WizSecurityListProps) {
  return (
    <div className="flex flex-col h-full bg-[#f7f9fb] p-6 lg:p-10 font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#191c1e] tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-[#0062d6]" />
            WIZ Security Vulnerabilities
          </h1>
          <p className="text-[#424754] text-sm mt-2 max-w-2xl">
            Cloud security misconfigurations and vulnerabilities detected by WIZ. Gecko can automatically resolve standard vulnerabilities with verified terraform, configuration, and code patches.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search vulnerabilities..." 
              className="w-full pl-9 pr-4 py-2 border border-[#c2c6d6] rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0062d6]/30 transition-all font-medium placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>
          <button className="p-2 border border-[#c2c6d6] rounded bg-white text-[#424754] hover:bg-gray-50 flex items-center justify-center transition-colors shrink-0">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vulnerabilities.map((vuln) => (
          <div 
            key={vuln.id} 
            className="bg-white border border-[#c2c6d6] rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group"
            onClick={() => onSelectVulnerability(vuln)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-2 items-center">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  vuln.severity === 'High' ? 'bg-[#ffdad6] text-[#ba1a1a]' :
                  vuln.severity === 'Med' ? 'bg-[#ffeed4] text-[#8e4a00]' :
                  'bg-[#c4eed0] text-[#006c27]'
                }`}>
                  {vuln.severity} SEVERITY
                </span>
                {vuln.status === 'Open' ? (
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold uppercase">
                    New Alert
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                    In Progress
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono">{vuln.id}</span>
            </div>

            <h3 className="text-[#191c1e] font-bold text-sm leading-snug mb-2 group-hover:text-[#0062d6] transition-colors">{vuln.title}</h3>
            
            <p className="text-xs text-[#727785] line-clamp-2 mb-4 flex-1">
              {vuln.description}
            </p>

            <div className="pt-4 border-t border-gray-100 mt-auto">
              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-gray-400 uppercase text-[9px] font-bold tracking-wider">Resource</span>
                  <span className="text-[#191c1e] font-mono font-medium">{vuln.resourceName}</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-gray-400 uppercase text-[9px] font-bold tracking-wider">Category</span>
                  <span className="text-[#191c1e] font-medium flex items-center gap-1">
                    {vuln.category === 'Secrets in Code' ? <KeyRound className="w-3 h-3 text-[#ba1a1a]" /> :
                     vuln.category === 'Misconfigurations' ? <Lock className="w-3 h-3 text-orange-600" /> :
                     <Shield className="w-3 h-3 text-blue-600" />
                    }
                    {vuln.category}
                  </span>
                </div>
              </div>
            </div>
            
            {vuln.geckoFixes?.length > 0 && (
              <div className="mt-4 bg-[#f8fafc] border border-blue-100 rounded p-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#004ba7] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Gecko Auto-Patch Available
                </div>
                 <ChevronRight className="w-3 h-3 text-blue-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
