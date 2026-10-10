import React, { useState, useRef } from 'react';
import { FileUp, FileText, Printer, BarChart2, AlertCircle, TrendingUp, TrendingDown, Clock, MapPin, Database, RefreshCw, Layers } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Logo from '../components/Logo';

const Reports = () => {
  const [files, setFiles] = useState({ metro: null, brts: null, amts: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  
  const metroInput = useRef(null);
  const brtsInput = useRef(null);
  const amtsInput = useRef(null);

  const handleFileChange = (system, e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [system]: e.target.files[0] }));
      setError(null);
    }
  };

  const handleLoadDemo = async () => {
    setFiles({ metro: null, brts: null, amts: null });
    setError(null);
    analyzeData(true);
  };

  const analyzeData = async (useDemo = false) => {
    if (!useDemo && !files.metro && !files.brts && !files.amts) {
      setError("Please upload at least one CSV file or load demo data.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      if (useDemo) {
        formData.append('useDemo', 'true');
      } else {
        if (files.metro) formData.append('metro', files.metro);
        if (files.brts) formData.append('brts', files.brts);
        if (files.amts) formData.append('amts', files.amts);
      }

      const response = await fetch('http://localhost:5000/api/brief/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze data');
      }

      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderSystemCard = (systemName, sysData) => {
    if (!sysData || typeof sysData.currentTotal === 'undefined' || !sysData.valid) return null;
    return (
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 flex flex-col h-full">
        <h4 className="font-bold text-raahx-navy flex items-center mb-3">
          <Layers size={16} className="mr-2 text-raahx-slate" /> {systemName}
        </h4>
        <div className="flex-grow space-y-4">
          <div>
             <p className="text-xs text-raahx-slate font-medium uppercase tracking-wider mb-1">Ridership</p>
             <p className="text-2xl font-bold text-raahx-navy">{(sysData.currentTotal || 0).toLocaleString()}</p>
             <p className="text-xs font-semibold text-gray-500 mt-0.5">
               vs {(sysData.prevTotal || 0).toLocaleString()} prev
             </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
             <div>
                <p className="text-xs text-raahx-slate font-medium uppercase tracking-wider mb-1">Completion</p>
                <p className={`text-lg font-bold ${parseFloat(sysData.completionRate) < 95 ? 'text-red-600' : 'text-green-600'}`}>
                  {sysData.completionRate || 'N/A'}%
                </p>
             </div>
             <div>
                <p className="text-xs text-raahx-slate font-medium uppercase tracking-wider mb-1">Avg Delay</p>
                <p className="text-lg font-bold text-raahx-navy">{sysData.avgDelay || 0}m</p>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-inter">
      {/* Configuration Section - Hidden when printing */}
      <div className="print:hidden space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-raahx-navy tracking-tight">Morning Brief Workspace</h1>
            <p className="text-raahx-slate mt-1">Consolidate Metro, BRTS, and AMTS records into an actionable report.</p>
          </div>
        </div>

        <Card className="border-raahx-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-raahx-navy mb-4 flex items-center">
              <Database size={18} className="mr-2 text-raahx-orange" /> Data Sources
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {['metro', 'brts', 'amts'].map(sys => {
                const inputRef = sys === 'metro' ? metroInput : sys === 'brts' ? brtsInput : amtsInput;
                const file = files[sys];
                return (
                  <div key={sys}>
                    <label className="block text-sm font-semibold text-raahx-navy mb-2 capitalize">{sys} Dataset</label>
                    <input 
                      type="file" accept=".csv" onChange={(e) => handleFileChange(sys, e)} className="hidden" ref={inputRef}
                    />
                    <Button 
                      variant="secondary" 
                      className="w-full h-10 flex items-center justify-center border-dashed border-2 hover:border-raahx-orange transition-colors"
                      onClick={() => inputRef.current.click()}
                    >
                      <FileUp size={16} className="mr-2 text-raahx-orange" />
                      {file ? file.name : `Upload ${sys.toUpperCase()} CSV`}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
               <Button variant="ghost" onClick={handleLoadDemo} className="text-raahx-slate border border-gray-200">
                  <Database size={16} className="mr-2" /> Load Synthetic Demo Data
               </Button>
               <Button 
                 onClick={() => analyzeData(false)}
                 disabled={!files.metro && !files.brts && !files.amts && !reportData?.isDemo}
                 className="min-w-[160px]"
                 icon={isAnalyzing ? <RefreshCw size={16} className="animate-spin" /> : <BarChart2 size={16} />}
               >
                 {isAnalyzing ? "Processing..." : "Generate Brief"}
               </Button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Section */}
      {reportData && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
          
          {/* Print Header */}
          <div className="p-8 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center print:bg-white print:border-b-2 print:border-raahx-navy">
            <div>
              <Logo size="md" />
              <div className="mt-4">
                <h2 className="text-2xl font-bold text-raahx-navy tracking-tight">Two-Minute Morning Brief</h2>
                <p className="text-sm text-raahx-slate font-medium mt-1">
                  Reporting Date: {reportData.reportingDate || 'N/A'} • Generated {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <Button onClick={handlePrint} variant="secondary" className="print:hidden mb-4 border-gray-200 shadow-sm hover:border-raahx-orange">
                <Printer size={16} className="mr-2" /> Print Report
              </Button>
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
                <AlertCircle size={14} className="mr-1.5" />
                {reportData.isDemo ? "Synthetic Demonstration Data" : "Uploaded CSV Data"}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* Executive Summary */}
            <section>
              <h3 className="text-lg font-bold text-raahx-navy border-b border-gray-100 pb-2 mb-4 flex items-center">
                <FileText size={18} className="mr-2 text-raahx-orange" /> Executive Summary
              </h3>
              
              <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg">
                 <p className="text-sm text-blue-900 font-medium">
                   Total multi-modal ridership recorded was <strong className="text-lg">{(reportData.summary?.totalRidership || 0).toLocaleString()}</strong>, representing a 
                   <strong className="mx-1">
                     {parseFloat(reportData.summary?.overallChange || 0) > 0 ? '+' : ''}{reportData.summary?.overallChange || '0.00'}%
                   </strong> 
                   shift compared to the previous period. {(reportData.exceptions || []).length} significant operational exceptions require immediate attention.
                 </p>
                 {(reportData.summary?.missingSystems || []).length > 0 && (
                   <p className="text-sm text-red-700 font-semibold mt-2 flex items-center">
                     <AlertCircle size={14} className="mr-1.5" /> Data incomplete: Missing records for {(reportData.summary?.missingSystems || []).join(', ')}.
                   </p>
                 )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderSystemCard('Ahmedabad Metro', reportData.systems?.Metro)}
                {renderSystemCard('Ahmedabad BRTS', reportData.systems?.BRTS)}
                {renderSystemCard('Ahmedabad AMTS', reportData.systems?.AMTS)}
              </div>
            </section>

            {/* Exceptions & Findings */}
            <section>
              <h3 className="text-lg font-bold text-raahx-navy border-b border-gray-100 pb-2 mb-4 flex items-center">
                <Search size={18} className="mr-2 text-raahx-cyan" /> Significant Exceptions
              </h3>
              
              {(reportData.exceptions || []).length === 0 ? (
                <div className="p-6 text-center text-raahx-slate bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No significant exceptions or delays detected across any network.
                </div>
              ) : (
                <div className="space-y-4">
                  {(reportData.exceptions || []).map((exc, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-4 p-5 rounded-lg border border-gray-200 bg-white shadow-sm">
                      <div className="w-full md:w-1/4">
                         <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-2 bg-gray-100 text-gray-700">
                           <span className={`w-2 h-2 rounded-full ${exc.severity === 'Critical' ? 'bg-red-600' : exc.severity === 'High' ? 'bg-orange-500' : 'bg-amber-400'}`}></span>
                           {exc.severity} Priority
                         </div>
                         <h4 className="font-bold text-raahx-navy text-sm mb-1">{exc.type}</h4>
                         <p className="text-xs font-semibold text-raahx-slate">{exc.system}</p>
                         <p className="text-sm font-medium text-raahx-navy mt-1 flex items-start">
                           <MapPin size={14} className="mr-1.5 mt-0.5 text-raahx-orange shrink-0" /> 
                           {exc.location}
                         </p>
                      </div>
                      <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Observed Fact & Evidence</p>
                          <p className="text-sm text-raahx-navy font-medium mb-1">{exc.evidence}</p>
                          <p className="text-xs text-raahx-slate">Measured {exc.metric}: {exc.value} (Baseline: {exc.baseline})</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Possible Explanation & Action</p>
                          <p className="text-sm font-medium text-raahx-navy mb-1">{exc.reason}</p>
                          <p className="text-sm text-raahx-orange font-medium flex items-start">
                            <span className="mr-1.5 mt-0.5">→</span> {exc.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Cross-System Hub Comparison */}
            <section>
              <h3 className="text-lg font-bold text-raahx-navy border-b border-gray-100 pb-2 mb-4 flex items-center">
                <Database size={18} className="mr-2 text-raahx-slate" /> Hub-Level Cross-System Analysis
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-raahx-slate border-r border-gray-200">Hub / Interchange</th>
                      <th className="px-4 py-3 font-semibold text-raahx-slate">Metro Ridership</th>
                      <th className="px-4 py-3 font-semibold text-raahx-slate">BRTS Ridership</th>
                      <th className="px-4 py-3 font-semibold text-raahx-slate">AMTS Ridership</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.hubComparison || []).map((hub, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-raahx-navy border-r border-gray-200">
                           {hub.hub_id} - {hub.hub_name}
                        </td>
                        <td className="px-4 py-3">
                          {hub.Metro ? (
                             <div>
                                <span className="font-medium text-raahx-navy">{hub.Metro.ridership}</span>
                                {typeof hub.Metro.percentChange === 'number' && (
                                   <span className={`ml-2 text-xs font-semibold ${hub.Metro.percentChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {hub.Metro.percentChange > 0 ? '+' : ''}{hub.Metro.percentChange.toFixed(1)}%
                                   </span>
                                )}
                             </div>
                          ) : <span className="text-gray-400 italic">No data</span>}
                        </td>
                        <td className="px-4 py-3">
                          {hub.BRTS ? (
                             <div>
                                <span className="font-medium text-raahx-navy">{hub.BRTS.ridership}</span>
                                {typeof hub.BRTS.percentChange === 'number' && (
                                   <span className={`ml-2 text-xs font-semibold ${hub.BRTS.percentChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {hub.BRTS.percentChange > 0 ? '+' : ''}{hub.BRTS.percentChange.toFixed(1)}%
                                   </span>
                                )}
                             </div>
                          ) : <span className="text-gray-400 italic">No data</span>}
                        </td>
                        <td className="px-4 py-3">
                          {hub.AMTS ? (
                             <div>
                                <span className="font-medium text-raahx-navy">{hub.AMTS.ridership}</span>
                                {typeof hub.AMTS.percentChange === 'number' && (
                                   <span className={`ml-2 text-xs font-semibold ${hub.AMTS.percentChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {hub.AMTS.percentChange > 0 ? '+' : ''}{hub.AMTS.percentChange.toFixed(1)}%
                                   </span>
                                )}
                             </div>
                          ) : <span className="text-gray-400 italic">No data</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

          </div>
          
          <div className="bg-raahx-navy p-4 text-center text-xs text-gray-400 print:bg-white print:text-gray-500 print:border-t print:border-gray-200 mt-4">
            RaahX Intelligence — Every Route. One Smarter Journey.
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
