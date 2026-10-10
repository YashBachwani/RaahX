import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';
import { PassThrough } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const bufferStream = new PassThrough();
    bufferStream.end(buffer);
    
    bufferStream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

const processSystemData = (records, systemName) => {
  // Sort by date to find previous day
  records.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Group by date and hub
  const byDateAndHub = {};
  const allDates = [...new Set(records.map(r => r.date))].sort().reverse();
  const latestDate = allDates[0];
  const prevDate = allDates[1];

  let currentTotal = 0;
  let prevTotal = 0;
  let currentScheduled = 0;
  let currentCompleted = 0;
  let currentDelaySum = 0;
  let currentHubsCount = 0;
  let invalidRows = 0;

  const currentRecords = records.filter(r => r.date === latestDate);
  const prevRecords = records.filter(r => r.date === prevDate);

  const prevMap = {};
  prevRecords.forEach(r => prevMap[r.hub_id] = r);

  const hubStats = [];
  const exceptions = [];

  currentRecords.forEach((row, index) => {
    const ridership = parseInt(row.ridership, 10);
    const scheduled = parseInt(row.scheduled_trips, 10);
    const completed = parseInt(row.completed_trips, 10);
    const delay = parseInt(row.avg_delay_min, 10) || 0;
    const incident = row.incident_code || 'NONE';
    
    if (isNaN(ridership)) {
      invalidRows++;
      return;
    }

    currentTotal += ridership;
    currentScheduled += isNaN(scheduled) ? 0 : scheduled;
    currentCompleted += isNaN(completed) ? 0 : completed;
    currentDelaySum += delay;
    currentHubsCount++;

    const prevRow = prevMap[row.hub_id];
    let prevRidership = null;
    let prevDelay = null;
    let percentChange = null;

    if (prevRow) {
      prevRidership = parseInt(prevRow.ridership, 10);
      prevTotal += prevRidership;
      prevDelay = parseInt(prevRow.avg_delay_min, 10) || 0;
      
      const diff = ridership - prevRidership;
      if (prevRidership > 0) {
        percentChange = (diff / prevRidership) * 100;
      }
    }

    hubStats.push({
      hub_id: row.hub_id,
      hub_name: row.hub_name,
      ridership,
      prevRidership,
      percentChange,
      delay,
      prevDelay,
      incident,
      system: systemName,
      completionRate: scheduled > 0 ? ((completed / scheduled) * 100).toFixed(1) : '100.0'
    });

    // Exceptions Rules
    const completionRate = scheduled > 0 ? (completed / scheduled) * 100 : 100;
    
    if (completionRate < 95) {
      exceptions.push({
        severity: 'High',
        type: 'Low Completion Rate',
        system: systemName,
        location: row.hub_name,
        metric: 'Completion Rate',
        value: `${completionRate.toFixed(1)}%`,
        baseline: '95%',
        evidence: `Completed ${completed} of ${scheduled} scheduled trips.`,
        reason: incident !== 'NONE' ? `Correlated with incident: ${incident}` : 'Operational shortfall',
        action: 'Review dispatch logs and fleet availability.'
      });
    }

    if (percentChange !== null && percentChange <= -10) {
      exceptions.push({
        severity: incident !== 'NONE' ? 'High' : 'Medium',
        type: 'Significant Decline',
        system: systemName,
        location: row.hub_name,
        metric: 'Ridership',
        value: ridership,
        baseline: prevRidership,
        evidence: `Ridership decreased by ${Math.abs(percentChange).toFixed(1)}%`,
        reason: incident !== 'NONE' ? `Recorded incident: ${incident}` : 'Unexplained decline',
        action: incident !== 'NONE' ? 'Monitor post-incident recovery.' : 'Investigate potential external factors.'
      });
    } else if (percentChange !== null && percentChange >= 10) {
      exceptions.push({
        severity: 'Medium',
        type: 'Significant Surge',
        system: systemName,
        location: row.hub_name,
        metric: 'Ridership',
        value: ridership,
        baseline: prevRidership,
        evidence: `Ridership increased by ${percentChange.toFixed(1)}%`,
        reason: 'Surge in passenger volume',
        action: 'Consider adjusting capacity if trend continues.'
      });
    }

    if (incident !== 'NONE') {
      exceptions.push({
        severity: 'Critical',
        type: 'Operational Incident',
        system: systemName,
        location: row.hub_name,
        metric: 'Incident',
        value: incident,
        baseline: 'NONE',
        evidence: `Incident code ${incident} reported.`,
        reason: 'Service disruption recorded.',
        action: 'Review incident report and maintenance logs.'
      });
    }
  });

  return {
    latestDate,
    currentTotal,
    prevTotal,
    currentScheduled,
    currentCompleted,
    completionRate: currentScheduled > 0 ? ((currentCompleted / currentScheduled) * 100).toFixed(1) : '100.0',
    avgDelay: currentHubsCount > 0 ? (currentDelaySum / currentHubsCount).toFixed(1) : '0.0',
    hubStats,
    exceptions,
    invalidRows,
    totalRecords: records.length,
    valid: currentRecords.length > 0
  };
};

export const getDemoData = (req, res) => {
  const { system } = req.params;
  const sysLower = system.toLowerCase();
  if (!['metro', 'brts', 'amts'].includes(sysLower)) {
    return res.status(400).json({ error: 'Invalid transport system' });
  }

  const filePath = path.join(__dirname, `../../data/demo_${sysLower}.csv`);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Demo data not found' });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=demo_${sysLower}.csv`);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
};

export const analyzeUpload = async (req, res) => {
  try {
    let metroRecords = [];
    let brtsRecords = [];
    let amtsRecords = [];
    let isDemo = false;

    if (req.body.useDemo) {
      isDemo = true;
      const readDemo = async (sys) => {
        const p = path.join(__dirname, `../../data/demo_${sys}.csv`);
        if (fs.existsSync(p)) {
          return await parseCsvBuffer(fs.readFileSync(p));
        }
        return [];
      };
      metroRecords = await readDemo('metro');
      brtsRecords = await readDemo('brts');
      amtsRecords = await readDemo('amts');
    } else {
      if (req.files) {
        if (req.files.metro && req.files.metro[0]) metroRecords = await parseCsvBuffer(req.files.metro[0].buffer);
        if (req.files.brts && req.files.brts[0]) brtsRecords = await parseCsvBuffer(req.files.brts[0].buffer);
        if (req.files.amts && req.files.amts[0]) amtsRecords = await parseCsvBuffer(req.files.amts[0].buffer);
      }
    }

    const metroData = processSystemData(metroRecords, 'Metro');
    const brtsData = processSystemData(brtsRecords, 'BRTS');
    const amtsData = processSystemData(amtsRecords, 'AMTS');

    const systems = [metroData, brtsData, amtsData].filter(s => s.valid);
    if (systems.length === 0) {
      return res.status(400).json({ error: 'No valid data provided for any system.' });
    }

    const reportingDate = systems[0].latestDate;
    
    // Cross-system comparison at hub level
    const hubComparison = {};
    systems.forEach(sys => {
      sys.hubStats.forEach(stat => {
        if (!hubComparison[stat.hub_id]) {
          hubComparison[stat.hub_id] = { hub_id: stat.hub_id, hub_name: stat.hub_name, Metro: null, BRTS: null, AMTS: null };
        }
        hubComparison[stat.hub_id][stat.system] = stat;
      });
    });

    // Detect cross-system exceptions (e.g. Metro goes down, BRTS goes up at same hub)
    const crossSystemExceptions = [];
    Object.values(hubComparison).forEach(hub => {
      const modes = ['Metro', 'BRTS', 'AMTS'].filter(m => hub[m] !== null);
      if (modes.length > 1) {
        const changes = modes.map(m => ({ mode: m, change: hub[m].percentChange }));
        const declines = changes.filter(c => c.change !== null && c.change <= -10);
        const surges = changes.filter(c => c.change !== null && c.change >= 10);
        
        if (declines.length > 0 && surges.length > 0) {
          crossSystemExceptions.push({
            severity: 'High',
            type: 'Cross-System Shift',
            system: 'Multi-modal',
            location: hub.hub_name,
            metric: 'Ridership shift',
            value: `Shift from ${declines[0].mode} to ${surges[0].mode}`,
            baseline: 'Parallel trends',
            evidence: `${declines[0].mode} dropped by ${Math.abs(declines[0].change).toFixed(1)}%, while ${surges[0].mode} rose by ${surges[0].change.toFixed(1)}%`,
            reason: 'Possible mode-substitution due to delay or incident',
            action: 'Check for correlated disruptions on declining mode.'
          });
        }
      }
    });

    const allExceptions = [
      ...metroData.exceptions,
      ...brtsData.exceptions,
      ...amtsData.exceptions,
      ...crossSystemExceptions
    ];

    // Sort exceptions by severity
    const severityMap = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    allExceptions.sort((a, b) => severityMap[a.severity] - severityMap[b.severity]);

    const totalRidership = systems.reduce((sum, s) => sum + s.currentTotal, 0);
    const prevTotalRidership = systems.reduce((sum, s) => sum + s.prevTotal, 0);
    const overallChange = prevTotalRidership > 0 ? ((totalRidership - prevTotalRidership) / prevTotalRidership) * 100 : 0;

    res.json({
      success: true,
      isDemo,
      reportingDate,
      summary: {
        totalRidership,
        prevTotalRidership,
        overallChange: overallChange.toFixed(2),
        missingSystems: ['Metro', 'BRTS', 'AMTS'].filter(sysName => !systems.find(s => s.hubStats.length > 0 && s.hubStats[0].system === sysName)),
      },
      systems: {
        Metro: metroData,
        BRTS: brtsData,
        AMTS: amtsData
      },
      hubComparison: Object.values(hubComparison),
      exceptions: allExceptions.slice(0, 10)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process data' });
  }
};
