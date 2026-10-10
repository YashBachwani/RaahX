import React, { useState, useRef } from 'react';
import { FileUp, FileText, Printer, BarChart2, AlertCircle, TrendingUp, TrendingDown, Clock, MapPin, Database, RefreshCw, Layers, Search } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Logo from '../components/Logo';
import ErrorBoundary from '../components/ErrorBoundary';

const UploadBox = ({ system, file, onFileSelected, onClear }) => {
  const [status, setStatus] = useState('idle'); // idle, parsing, valid, warning, error
  const [summary, setSummary] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  // Sync state if file is cleared externally (e.g. "Clear Files" button)
  React.useEffect(() => {
    // Only revert to idle if the file was cleared AND we were previously in a valid/warning state.
    // Do not revert during 'parsing' (file is still null in parent) or 'error' (we want to show the error).
    if (!file && (status === 'valid' || status === 'warning')) {
      setStatus('idle');
      setSummary(null);
      setErrorMsg(null);
      if (inputRef.current) inputRef.current.value = null;
    }
  }, [file, status]);

  const handleFile = (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setStatus('error');
      setErrorMsg('Invalid file type. Please upload a .csv file.');
      if (inputRef.current) inputRef.current.value = null;
      onClear();
      return;
    }

    setStatus('parsing');
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      // Clear input value AFTER read completes so the same file can be selected again
      if (inputRef.current) inputRef.current.value = null;
      
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        
        if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
          setStatus('error');
          setErrorMsg('Empty file.');
          onClear();
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const required = ['hub_id', 'date', 'ridership'];
        const missing = required.filter(r => !headers.includes(r));
        
        if (missing.length > 0) {
          setStatus('error');
          setErrorMsg(`Missing columns: ${missing.join(', ')}`);
          onClear();
          return;
        }

        let valid = 0;
        let invalid = 0;
        const ridershipIdx = headers.indexOf('ridership');

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',');
          if (cols.length < headers.length) {
            invalid++;
            continue;
          }
          const ridership = parseInt(cols[ridershipIdx], 10);
          if (isNaN(ridership) || ridership < 0) {
            invalid++;
          } else {
            valid++;
          }
        }

        if (valid === 0) {
          setStatus('error');
          setErrorMsg('No valid records found in file.');
          onClear();
          return;
        }

        setSummary({ valid, invalid, total: lines.length - 1, name: selectedFile.name, size: (selectedFile.size / 1024).toFixed(1) });
        setStatus(invalid > 0 ? 'warning' : 'valid');
        onFileSelected(selectedFile);
      } catch (err) {
        setStatus('error');
        setErrorMsg('CSV parsing error.');
        onClear();
      }
    };
    reader.onerror = (err) => {
      if (inputRef.current) inputRef.current.value = null;
      setStatus('error');
      setErrorMsg('Failed to read file.');
      onClear();
    };
    reader.readAsText(selectedFile);
  };

  const handleClear = () => {
    setStatus('idle');
    setSummary(null);
    setErrorMsg(null);
    if (inputRef.current) inputRef.current.value = null;
    onClear();
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-gray-50 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <label className="block text-sm font-semibold text-raahx-navy capitalize">{system} Dataset</label>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-center relative">
        <input type="file" accept=".csv" onChange={handleFile} className="hidden" ref={inputRef} />
        
        {status === 'idle' && (
          <Button 
            variant="ghost" 
            className="w-full h-16 flex flex-col items-center justify-center border-dashed border-2 hover:border-raahx-orange hover:bg-orange-50 transition-colors rounded-lg"
            onClick={() => inputRef.current.click()}
          >
            <FileUp size={18} className="mb-1 text-raahx-slate" />
            <span className="text-xs font-semibold text-raahx-slate">Upload CSV</span>
          </Button>
        )}

        {status === 'parsing' && (
          <div className="flex flex-col items-center justify-center h-16">
            <RefreshCw size={18} className="animate-spin text-raahx-orange mb-2" />
            <span className="text-xs font-semibold text-gray-500">Parsing...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center text-center">
            <div className="text-red-500 mb-1"><AlertCircle size={20} /></div>
            <p className="text-xs font-bold text-red-700">{errorMsg}</p>
            <button onClick={() => inputRef.current.click()} className="text-xs text-raahx-navy font-semibold mt-2 underline hover:text-raahx-orange">Try again</button>
          </div>
        )}

        {(status === 'valid' || status === 'warning') && summary && (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-start justify-between">
                 <div className="flex items-center">
                   <div className="bg-green-100 p-1.5 rounded-md mr-2">
                     <FileText size={16} className="text-green-700" />
                   </div>
                   <div className="overflow-hidden">
                     <p className="text-sm font-bold text-raahx-navy truncate" title={summary.name}>{summary.name}</p>
                     <p className="text-xs font-medium text-gray-500">{summary.size} KB</p>
                   </div>
                 </div>
                 <button onClick={handleClear} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
              </div>
              
              <div className="mt-3 bg-white border border-gray-200 rounded p-2 text-xs">
                 <div className="flex justify-between mb-1">
                   <span className="text-gray-500 font-medium">Valid records:</span>
                   <span className="font-bold text-green-600">{summary.valid}</span>
                 </div>
                 {summary.invalid > 0 && (
                   <div className="flex justify-between">
                     <span className="text-gray-500 font-medium">Invalid rows:</span>
                     <span className="font-bold text-red-500">{summary.invalid}</span>
                   </div>
                 )}
              </div>
            </div>
            
            <p className="text-xs font-bold text-center mt-3 text-green-700 flex items-center justify-center bg-green-50 py-1 rounded">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Ready to import
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Reports = () => {
  const [files, setFiles] = useState({ metro: null, brts: null, amts: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  
  // Exception controls state
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [ackedExceptions, setAckedExceptions] = useState(new Set());
  
  const handleFileSelected = (system, file) => {
    setFiles(prev => ({ ...prev, [system]: file }));
    setError(null);
  };

  const handleClearFile = (system) => {
    setFiles(prev => ({ ...prev, [system]: null }));
  };

  const handleLoadDemo = async () => {
    setFiles({ metro: null, brts: null, amts: null });
    setError(null);
    analyzeData(true);
  };

  const analyzeData = async (useDemo = false) => {
    if (!useDemo && !files.metro && !files.brts && !files.amts) {
      setError("Please upload at least one valid CSV file or load demo data.");
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
        throw new Error(data.error || 'Failed to import and analyze data');
      }

      setReportData(data);
      setAckedExceptions(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  const toggleAck = (idx) => {
    setAckedExceptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) newSet.delete(idx);
      else newSet.add(idx);
      return newSet;
    });
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
                <p className="text-xs text-raahx-slate font-medium uppercase tracking-wider mb-1">Overall Completion</p>
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

  const filteredExceptions = (reportData?.exceptions || []).filter(exc => 
    filterSeverity === 'All' || exc.severity === filterSeverity
  );

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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 h-48">
              {['metro', 'brts', 'amts'].map(sys => (
                <UploadBox 
                  key={sys}
                  system={sys} 
                  file={files[sys]} 
                  onFileSelected={(f) => handleFileSelected(sys, f)} 
                  onClear={() => handleClearFile(sys)} 
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 gap-4">
               <div className="flex items-center gap-4 w-full sm:w-auto">
                 <Button variant="ghost" onClick={handleLoadDemo} className="text-raahx-slate border border-gray-200">
                    <Database size={16} className="mr-2" /> Load Synthetic Demo Data
                 </Button>
                 {(files.metro || files.brts || files.amts) && (
                   <Button variant="ghost" onClick={() => { setFiles({ metro: null, brts: null, amts: null }); setError(null); }} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      Clear Files
                   </Button>
                 )}
               </div>
               <Button 
                 onClick={() => analyzeData(false)}
                 disabled={(!files.metro && !files.brts && !files.amts) || isAnalyzing}
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
        <ErrorBoundary>
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
            <section className="print:break-before-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-2 mb-4">
                <h3 className="text-lg font-bold text-raahx-navy flex items-center">
                  <Search size={18} className="mr-2 text-raahx-cyan" /> Significant Exceptions
                </h3>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0 print:hidden">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter:</span>
                  {['All', 'Critical', 'High', 'Medium'].map(sev => (
                    <button
                      key={sev}
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${filterSeverity === sev ? 'bg-raahx-navy text-white border-raahx-navy' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
              
              {filteredExceptions.length === 0 ? (
                <div className="p-6 text-center text-raahx-slate bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  {filterSeverity === 'All' ? 'No significant exceptions or delays detected across any network.' : `No ${filterSeverity} exceptions found.`}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExceptions.map((exc, idx) => {
                    const isAcked = ackedExceptions.has(idx);
                    return (
                    <div key={idx} className={`flex flex-col md:flex-row gap-4 p-5 rounded-lg border shadow-sm transition-opacity ${isAcked ? 'bg-gray-50 border-gray-200 opacity-60 print:opacity-100' : 'bg-white border-gray-200'}`}>
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
                      <div className="w-full md:w-2/4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <div className="w-full md:w-1/4 flex items-start justify-end print:hidden border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 pl-0 md:pl-4">
                         <button 
                           onClick={() => toggleAck(idx)}
                           className={`px-4 py-2 text-xs font-bold rounded-md w-full border ${isAcked ? 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}`}
                         >
                           {isAcked ? 'Undo' : 'Acknowledge'}
                         </button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </section>

            {/* Cross-System Hub Comparison */}
            <section className="print:break-before-page">
              <h3 className="text-lg font-bold text-raahx-navy border-b border-gray-100 pb-2 mb-4 flex items-center">
                <Database size={18} className="mr-2 text-raahx-slate" /> Hub-Level Cross-System Analysis
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-raahx-slate border-r border-gray-200">Hub / Interchange</th>
                      <th className="px-4 py-3 font-semibold text-raahx-slate">Metro Performance</th>
                      <th className="px-4 py-3 font-semibold text-raahx-slate">BRTS Performance</th>
                      <th className="px-4 py-3 font-semibold text-raahx-slate">AMTS Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.hubComparison || []).map((hub, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-raahx-navy border-r border-gray-200">
                           {hub.hub_id} - {hub.hub_name}
                        </td>
                        {['Metro', 'BRTS', 'AMTS'].map(sysName => (
                          <td key={sysName} className="px-4 py-3">
                            {hub[sysName] ? (
                               <div>
                                  <div className="mb-1">
                                    <span className="text-xs text-gray-500 uppercase">Vol: </span>
                                    <span className="font-medium text-raahx-navy">{hub[sysName].ridership.toLocaleString()}</span>
                                    {typeof hub[sysName].percentChange === 'number' && (
                                       <span className={`ml-2 text-xs font-bold ${hub[sysName].percentChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                          {hub[sysName].percentChange > 0 ? '+' : ''}{hub[sysName].percentChange.toFixed(1)}%
                                       </span>
                                    )}
                                  </div>
                                  <div className="text-xs">
                                    <span className="text-gray-500 uppercase mr-1">Hub Comp:</span>
                                    <span className={`ml-1 font-bold ${parseFloat(hub[sysName].completionRate) < 95 ? 'text-red-600' : 'text-green-600'}`}>
                                      {hub[sysName].completionRate}%
                                    </span>
                                  </div>
                               </div>
                            ) : <span className="text-gray-400 italic text-xs">No data</span>}
                          </td>
                        ))}
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
        </ErrorBoundary>
      )}
    </div>
  );
};

export default Reports;
