import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import RightSidebar from './components/RightSidebar';
import IncidentList from './components/IncidentList';
import IncidentDetail from './components/IncidentDetail';
import WizSecurityList from './components/WizSecurityList';
import WizVulnerabilityDetail from './components/WizVulnerabilityDetail';
import AgentSimulator from './components/AgentSimulator';
import PRDrawer from './components/PRDrawer';
import NotificationSettings from './components/NotificationSettings';
import ApiManagement from './components/ApiManagement';
import { 
  DashboardView
} from './components/OtherViews';

import { INITIAL_INCIDENTS, INITIAL_ACTIVITIES, INITIAL_VULNERABILITIES } from './data';
import { Incident, ActivityFeedItem, SuggestedFix, WizVulnerability } from './types';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [activities, setActivities] = useState<ActivityFeedItem[]>(INITIAL_ACTIVITIES);
  const [vulnerabilities, setVulnerabilities] = useState<WizVulnerability[]>(INITIAL_VULNERABILITIES);
  
  // Navigation & Tabs
  const [currentTab, setCurrentTab] = useState<string>('incidents'); // 'dashboard', 'incidents', 'notifications', 'agent-sandbox', 'wiz-security', 'wiz-detail'
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(INITIAL_INCIDENTS[0]); // default selected so view detail works
  const [lastSelectedDetail, setLastSelectedDetail] = useState<Incident | null>(INITIAL_INCIDENTS[0]);
  const [selectedVulnerability, setSelectedVulnerability] = useState<WizVulnerability | null>(null);

  // Sidebar Toggling for Mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pull Request Drawer State
  const [isPRDrawerOpen, setIsPRDrawerOpen] = useState<boolean>(false);
  const [activeFixForPR, setActiveFixForPR] = useState<SuggestedFix | null>(null);

  // Live Demo Popup logic
  const hasAddedLiveDemoIncident = useRef(false);
  const [showLiveDemoBanner, setShowLiveDemoBanner] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentTab === 'incidents' && !hasAddedLiveDemoIncident.current) {
      timer = setTimeout(() => {
        hasAddedLiveDemoIncident.current = true;
        const liveDemoId = `INC-${Math.floor(4106 + Math.random() * 100)}`;
        const liveDemoIncident: Incident = {
          id: liveDemoId,
          title: "Critical: Spring Boot Ingestion API - Concurrent Tenant Quota Bypass exhausting PostgreSQL limits",
          description: "Incoming Alert: Multiple high-volume async file uploads are bypassing the tenant quota limiter, leading to complete database pool exhaustion during deep learning document processing workloads.",
          severity: "High",
          status: "Active",
          service: "idp-ingestion-api",
          assignee: "Unassigned",
          timestamp: "Just now",
          createdAtText: "Created exactly now",
          logs: `2026-06-03 09:12:00 [INFO] [idp-ingestion-api] Tenant BMW-Munich starting bulk batch upload (10,000 documents)
2026-06-03 09:12:01 [WARN] [QuotaValidator] Tenant quota cache evaluated as valid (0/5000) for thread-pool executor.
2026-06-03 09:12:02 [ERROR] org.postgresql.util.PSQLException: FATAL: remaining connection slots are reserved for non-replication superuser connections
2026-06-03 09:12:04 [FATAL] [HikariCP] idp_prod_db - Connection is not available, request timed out after 30000ms.
2026-06-03 09:13:00 Exception in thread "http-nio-8080-exec-114" java.lang.OutOfMemoryError: Java heap space`,
          affectedServices: ["idp-ingestion-api", "idp-tenant-metadata", "postgres-master-1"],
          slaStatus: "Action Required - Critical Outage",
          keyFindings: [
            "A race condition inside QuotaValidator allows multiple parallel HTTP payload threads to read the identical tenant quota limit state from the Redis cache simultaneously before the initial batch writes its new quota increment.",
            "This caused a massive influx of processing tokens hitting the idp-tenant-metadata database, instantly saturating the 200 HikariCP connections in PostgreSQL.",
            "Implementing a distributed Redisson fair-lock across the asynchronous boundary forces threads to evaluate quota limits sequentially."
          ],
          fixes: [
            {
              id: "fix-live-demo-1",
              name: "Implement Redisson Distributed Lock on Quota Checks",
              confidence: 97,
              description: "Acquires a centralized lease lock over tenant IDs during quota capacity increments.",
              filePath: "QuotaValidatorService.java",
              diff: [
                { lineNum: 84, content: "  public boolean validateQuota(String tenantId, int batchSize) {", type: "normal" },
                { lineNum: 85, content: "    int currentUsage = redisCache.getTenantUsage(tenantId);", type: "removed" },
                { lineNum: 86, content: "    if (currentUsage + batchSize > MAX_LIMIT) { return false; }", type: "removed" },
                { lineNum: 87, content: "    redisCache.incrementUsage(tenantId, batchSize);", type: "removed" },
                { lineNum: 88, content: "    return true;", type: "removed" },
                { lineNum: 85, content: "    RLock tenantLock = redissonClient.getLock(\"quota_lock:\" + tenantId);", type: "added" },
                { lineNum: 86, content: "    try {", type: "added" },
                { lineNum: 87, content: "        tenantLock.lock(10, TimeUnit.SECONDS);", type: "added" },
                { lineNum: 88, content: "        int currentUsage = redisCache.getTenantUsage(tenantId);", type: "added" },
                { lineNum: 89, content: "        if (currentUsage + batchSize > MAX_LIMIT) return false;", type: "added" },
                { lineNum: 90, content: "        redisCache.incrementUsage(tenantId, batchSize);", type: "added" },
                { lineNum: 91, content: "        return true;", type: "added" },
                { lineNum: 92, content: "    } finally {", type: "added" },
                { lineNum: 93, content: "        if (tenantLock.isHeldByCurrentThread()) tenantLock.unlock();", type: "added" },
                { lineNum: 94, content: "    }", type: "added" },
                { lineNum: 95, content: "  }", type: "normal" }
              ]
            }
          ],
          rationale: "Locking the quota increment sequence per-tenant using Redisson eliminates dirty-read race conditions that allowed aggressive API clients to overflow the microservice pool capacity.",
          similarIncidents: [
            { id: "INC-2191", title: "Redis dirty read on token usage API causing throttling limit bypass" }
          ],
          isLiveDemo: true
        };

        setIncidents(prev => [liveDemoIncident, ...prev]);

        const seedActivity: ActivityFeedItem = {
          id: `act-live-demo-${Math.random()}`,
          incidentId: liveDemoId,
          user: 'Gecko Agent',
          isAi: true,
          action: 'Gecko Agent caught anomalous logs and opened this incident automatically',
          timestamp: 'Just now'
        };
        setActivities(prev => [seedActivity, ...prev]);

        setShowLiveDemoBanner(true);
        setTimeout(() => setShowLiveDemoBanner(false), 8000);

      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentTab]);

  // Claim handler
  const handleClaimIncident = (incidentId: string) => {
    // Update incident assignee
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return { ...inc, assignee: 'Sarah Jenkins', status: 'Investigating' };
      }
      return inc;
    }));

    // Add activity log
    const claimActivity: ActivityFeedItem = {
      id: `act-claim-${Math.random()}`,
      incidentId: incidentId,
      user: 'Sarah Jenkins',
      action: 'claimed this incident interactively',
      timestamp: 'Just now',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120'
    };
    setActivities(prev => [claimActivity, ...prev]);

    // Also update selected incident object
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident(prev => prev ? { ...prev, assignee: 'Sarah Jenkins', status: 'Investigating' } : null);
    }
  };

  // Add Comment handler
  const handleAddComment = (comment: string) => {
    if (!selectedIncident) return;
    
    const newActivity: ActivityFeedItem = {
      id: `act-comment-${Math.random()}`,
      incidentId: selectedIncident.id,
      user: 'Sarah Jenkins',
      action: `commented: "${comment}"`,
      timestamp: 'Just now',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120&h=120'
    };

    setActivities(prev => [newActivity, ...prev]);
  };

  // Open PR Modal / Drawer
  const handleOpenPRModal = (incident: Incident, selectedFix: SuggestedFix) => {
    setActiveFixForPR(selectedFix);
    setIsPRDrawerOpen(true);
  };

  // Submit PR Success Handler
  const handlePRSubmitSuccess = () => {
    if (currentTab === 'wiz-detail' && selectedVulnerability) {
       handleWizPRSubmitSuccess();
       return;
    }
    if (!selectedIncident) return;

    // Update incident status to 'Mitigating'
    setIncidents(prev => prev.map(inc => {
      if (inc.id === selectedIncident.id) {
        return { ...inc, status: 'Mitigating' };
      }
      return inc;
    }));

    // Append AI activity feed log representing the merge request
    const prActivity: ActivityFeedItem = {
      id: `act-pr-${Math.random()}`,
      incidentId: selectedIncident.id,
      user: 'Gecko Agent',
      isAi: true,
      action: 'Gecko Automated Code patch Pull Request opened successfully #142',
      timestamp: 'Just now'
    };

    setActivities(prev => [prActivity, ...prev]);

    // Update current active detail state
    setSelectedIncident(prev => prev ? { ...prev, status: 'Mitigating' } : null);
  };

  // Simulation Hub: Handle simulated incident delivery
  const handleAddSimulatedIncident = (simulatedIncident: Incident) => {
    setIncidents(prev => [simulatedIncident, ...prev]);
    
    // Auto navigate user to view this incident
    setSelectedIncident(simulatedIncident);
    setLastSelectedDetail(simulatedIncident);
    setCurrentTab('incident-detail');

    // Seed activity logs
    const seedLogs: ActivityFeedItem[] = [
      {
        id: `act-sim-1-${Math.random()}`,
        incidentId: simulatedIncident.id,
        user: 'Gecko Agent',
        isAi: true,
        action: 'AI Root Cause Analysis generated autonomously',
        timestamp: 'Just now'
      },
      {
        id: `act-sim-2-${Math.random()}`,
        incidentId: simulatedIncident.id,
        user: simulatedIncident.service,
        isError: true,
        action: `Cluster warning triggered crash stream on '${simulatedIncident.service}'`,
        timestamp: 'Just now'
      }
    ];

    setActivities(prev => [...seedLogs, ...prev]);
  };

  // Nav select incident card
  const selectIncidentCard = (inc: Incident) => {
    setSelectedIncident(inc);
    setLastSelectedDetail(inc);
    setCurrentTab('incident-detail');
  };

  const selectVulnerabilityCard = (vuln: WizVulnerability) => {
    setSelectedVulnerability(vuln);
    setCurrentTab('wiz-detail');
  };

  const handleWizPRSubmitSuccess = () => {
    if (!selectedVulnerability) return;
    setVulnerabilities(prev => prev.map(v => 
      v.id === selectedVulnerability.id ? { ...v, status: 'In Progress' } : v
    ));
    setSelectedVulnerability(prev => prev ? { ...prev, status: 'In Progress' } : null);
  };

  const handleOpenWizPRModal = (vuln: WizVulnerability, fix: SuggestedFix) => {
    // Reusing PRModal by wrapping the vulnerability up in a compatible object
    // Assuming PRDrawer can work or we create a separate one. But for now
    // let's create a wrapper or just use the same activeFixForPR state.
    // Wait, PRDrawer requires `incident: Incident`. We can mock an incident 
    // strictly for the PRDrawer prop requirement or just make `incident` prop optional 
    // or create a union. Let's look at PRDrawer definition...
    
    // For now we'll mock an Incident specifically for PRDrawer to consume:
    const mockIncident: Incident = {
       id: vuln.id,
       title: vuln.title,
       description: vuln.description,
       severity: vuln.severity,
       status: 'Investigating',
       service: vuln.resourceName,
       assignee: 'Unassigned',
       timestamp: vuln.discoveredAt,
       createdAtText: 'Just now',
       logs: '',
       affectedServices: [vuln.resourceName],
       slaStatus: 'Action Required',
       keyFindings: [vuln.description],
       fixes: vuln.geckoFixes,
       rationale: 'Addressing security vulnerability.',
       similarIncidents: []
    };
    
    setSelectedIncident(mockIncident);
    setLastSelectedDetail(mockIncident);
    setActiveFixForPR(fix);
    setIsPRDrawerOpen(true);
  };

  const activeIncidentsCount = incidents.filter(i => i.status !== 'Resolved').length;

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb] antialiased text-[#191c1e] font-sans">
      
      {/* Top Header */}
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Structural Layout Container */}
      <div className="flex flex-1 relative min-h-0">
        
        {/* LEFT NAV SIDEBAR (Static desktop, slider layout raw positioning on mobile) */}
        <div className={`
          fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out shrink-0 h-full
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <Sidebar 
            currentTab={currentTab}
            onTabChange={(tab) => {
              setCurrentTab(tab);
              setMobileMenuOpen(false);
            }}
            activeIncidentsCount={activeIncidentsCount}
          />
        </div>

        {/* Backing clickable backdrop on mobile menu open */}
        {mobileMenuOpen && (
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-xs md:hidden"
          ></div>
        )}

        {/* CENTER CONTENT COLUMN */}
        <main className="flex-grow flex flex-col min-h-full min-w-0 bg-[#f7f9fb] relative">
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'notifications' && <NotificationSettings />}
          {currentTab === 'api-management' && <ApiManagement />}
          {currentTab === 'agent-sandbox' && (
            <AgentSimulator onAddSimulatedIncident={handleAddSimulatedIncident} />
          )}

          {currentTab === 'wiz-security' && (
            <WizSecurityList 
              vulnerabilities={vulnerabilities}
              onSelectVulnerability={selectVulnerabilityCard}
            />
          )}

          {currentTab === 'wiz-detail' && selectedVulnerability && (
            <WizVulnerabilityDetail 
              vulnerability={selectedVulnerability}
              onBack={() => setCurrentTab('wiz-security')}
              onOpenPRModal={handleOpenWizPRModal}
            />
          )}

          {currentTab === 'incidents' && (
            <div className="flex flex-col flex-1 h-full min-h-0 relative">
              <AnimatePresence>
                {showLiveDemoBanner && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute top-6 left-8 right-8 bg-[#e2e8f0] border border-[#c2c6d6] shadow-lg text-[#191c1e] px-4 py-3 rounded-lg flex items-center justify-between z-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0062d6]/10 flex items-center justify-center">
                         <span className="w-2.5 h-2.5 bg-[#0062d6] rounded-full animate-ping absolute"></span>
                         <span className="w-2 h-2 bg-[#0062d6] rounded-full relative"></span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#191c1e]">Gecko Agent caught a new incident</h4>
                        <p className="text-xs text-[#424754]">Critical: Spring Boot Ingestion API - Concurrent Tenant Quota Bypass exhausting PostgreSQL limits</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowLiveDemoBanner(false)}
                      className="text-[#424754] hover:text-[#191c1e] text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#cbd5e1] transition-colors"
                    >
                      View
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <IncidentList 
                incidents={incidents}
                onSelectIncident={selectIncidentCard}
                onOpenSimulator={() => setCurrentTab('agent-sandbox')}
              />
            </div>
          )}

          {currentTab === 'incident-detail' && lastSelectedDetail && (
            <IncidentDetail 
              incident={lastSelectedDetail}
              onBack={() => setCurrentTab('incidents')}
              onClaim={handleClaimIncident}
              onOpenPRModal={handleOpenPRModal}
            />
          )}
        </main>

        {/* RIGHT COLLABORATIVE COLLABORATIVE TIMELINE SIDEBAR */}
        {/* Render only when active on the Incident-Detail tab matching standard desktop screenshot */}
        {currentTab === 'incident-detail' && lastSelectedDetail && (
          <div className="hidden lg:block">
            <RightSidebar 
              activities={activities}
              incidentId={lastSelectedDetail.id}
              onAddComment={handleAddComment}
            />
          </div>
        )}

      </div>

      {/* PULL REQUEST INTERACTIVE DRAWER HOOK */}
      {lastSelectedDetail && activeFixForPR && (
        <PRDrawer 
          isOpen={isPRDrawerOpen}
          onClose={() => setIsPRDrawerOpen(false)}
          incident={lastSelectedDetail}
          fix={activeFixForPR}
          onSubmitSuccess={handlePRSubmitSuccess}
        />
      )}

    </div>
  );
}
