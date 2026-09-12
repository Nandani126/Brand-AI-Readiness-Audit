document.addEventListener('DOMContentLoaded', () => {

  // --- Element Selectors ---
  const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');
  
  const urlInput = document.getElementById('url-input');
  const auditBtn = document.getElementById('audit-btn');
  const presetChips = document.querySelectorAll('.preset-chip');
  
  const terminalBox = document.getElementById('terminal-box');
  const terminalBody = document.getElementById('terminal-body');
  const terminalStatus = document.getElementById('terminal-status');
  
  const resultsPanel = document.getElementById('results-panel');
  const targetHostTitle = document.getElementById('target-host-title');
  const scoreValText = document.getElementById('score-val');
  const gaugeFillCircle = document.getElementById('gauge-fill-circle');
  const scoreVerdictTag = document.getElementById('score-verdict-tag');
  const verdictLabel = document.getElementById('verdict-label');
  
  const breakdownDisc = document.getElementById('breakdown-disc');
  const breakdownFresh = document.getElementById('breakdown-fresh');
  const breakdownEngage = document.getElementById('breakdown-engage');
  
  const countCritical = document.getElementById('count-critical');
  const countHigh = document.getElementById('count-high');
  const countMedium = document.getElementById('count-medium');
  const countLow = document.getElementById('count-low');
  
  const btnShowFindings = document.getElementById('btn-show-findings');
  const btnShowReport = document.getElementById('btn-show-report');
  const findingsContainer = document.getElementById('findings-container');
  const reportContainer = document.getElementById('report-container');
  const findingsListWrapper = document.getElementById('findings-list-wrapper');
  const reportTextArea = document.getElementById('report-text-area');
  
  const btnCopyReport = document.getElementById('btn-copy-report');
  const btnDownloadReport = document.getElementById('btn-download-report');
  const btnCopyManifest = document.getElementById('btn-copy-manifest');
  
  const skillModal = document.getElementById('skill-modal');
  const modalSkillTitle = document.getElementById('modal-skill-title');
  const modalSkillBody = document.getElementById('modal-skill-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const inspectSkillBtns = document.querySelectorAll('.inspect-skill-btn');

  const filterButtons = document.querySelectorAll('.filter-btn');

  let compiledReportText = '';
  let currentFindings = [];

  // --- Preset Domain Chips Handler ---
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const domain = chip.getAttribute('data-domain');
      if (domain && urlInput) {
        urlInput.value = domain;
        urlInput.focus();
        urlInput.parentElement.style.borderColor = 'var(--neon-cyan)';
        setTimeout(() => {
          urlInput.parentElement.style.borderColor = '';
        }, 1200);
      }
    });
  });

  // --- Tab Navigation Logic ---
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      
      const activeContent = document.getElementById(`tab-content-${tabId}`);
      if (activeContent) {
        activeContent.classList.add('active');
        activeContent.style.display = 'block';
      }
    });
  });

  // --- Sub-Tab Navigation for Results Panel ---
  if (btnShowFindings && btnShowReport) {
    btnShowFindings.addEventListener('click', () => {
      btnShowFindings.classList.add('active');
      btnShowReport.classList.remove('active');
      findingsContainer.style.display = 'block';
      reportContainer.style.display = 'none';
    });

    btnShowReport.addEventListener('click', () => {
      btnShowReport.classList.add('active');
      btnShowFindings.classList.remove('active');
      findingsContainer.style.display = 'none';
      reportContainer.style.display = 'block';
    });
  }

  // --- Register Filter Buttons Click Events ---
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      displayFindings(filter);
    });
  });

  // --- Run Audit Execution Logic ---
  if (auditBtn) {
    auditBtn.addEventListener('click', async () => {
      const url = urlInput.value.trim();
      if (!url) {
        alert('Please enter a valid website URL.');
        return;
      }

      // Notify mascot if available
      if (typeof window.mascotSay === 'function') {
        window.mascotSay("Scanning target site... 🔍", 4000);
      }

      // Disable button & reset UI
      auditBtn.disabled = true;
      auditBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1.5s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        <span>Auditing Site...</span>
      `;
      
      // Show logs terminal
      terminalBox.style.display = 'block';
      terminalBody.innerHTML = '';
      terminalStatus.textContent = 'CONNECTING TO ORCHESTRATOR SWARM...';
      terminalStatus.style.color = '#eab308';
      
      resultsPanel.style.display = 'none';

      try {
        writeLogLine('> [ORCHESTRATOR] Initiating pipeline for target: ' + url, 100);
        
        const response = await fetch(`/api/audit?url=${encodeURIComponent(url)}`);
        if (!response.ok) {
          throw new Error('Audit API returned status: ' + response.status);
        }
        
        const result = await response.json();
        
        // Print logs sequentially with typing delays to simulate step processes
        await printLogsSequentially(result.logs);
        
        // Render results
        renderAuditResults(result);

        // Mascot celebrates completion
        if (typeof window.mascotCelebrate === 'function') {
          window.mascotCelebrate(result.score);
        }
        
      } catch (err) {
        writeLogLine('[ERROR] Audit process failed: ' + err.message, 100);
        terminalStatus.textContent = 'PIPELINE FAILED';
        terminalStatus.style.color = '#ef4444';
        alert('Failed to audit website. Make sure the local backend server is running and try again.');
      } finally {
        auditBtn.disabled = false;
        auditBtn.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Analyze Website</span>
        `;
      }
    });
  }

  // Keyboard shortcut: Enter key triggers audit
  if (urlInput) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        auditBtn.click();
      }
    });
  }

  // Log line printer helper
  function writeLogLine(text) {
    const p = document.createElement('div');
    p.className = 'terminal-line';
    p.textContent = text;
    terminalBody.appendChild(p);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Sequenced delays for terminal log visual experience
  function printLogsSequentially(logs) {
    return new Promise(async (resolve) => {
      for (const log of logs) {
        writeLogLine(log);
        const delay = Math.floor(Math.random() * 200) + 120;
        await new Promise(r => setTimeout(r, delay));
      }
      terminalStatus.textContent = 'AUDIT PIPELINE COMPLETE';
      terminalStatus.style.color = '#10b981';
      resolve();
    });
  }

  // --- Render Audit Dashboard Results ---
  function renderAuditResults(data) {
    resultsPanel.style.display = 'block';
    targetHostTitle.textContent = data.hostname || data.site;
    
    // Animate Score Counter
    const targetScore = data.score;
    animateScoreCounter(targetScore);

    // Update Verdict Badge
    if (scoreVerdictTag && verdictLabel) {
      if (targetScore >= 80) {
        verdictLabel.textContent = 'AI OPTIMIZED • BOT READY';
        scoreVerdictTag.style.borderColor = 'var(--neon-emerald)';
        scoreVerdictTag.style.color = 'var(--neon-emerald)';
      } else if (targetScore >= 50) {
        verdictLabel.textContent = 'MODERATE • OPTIMIZATION NEEDED';
        scoreVerdictTag.style.borderColor = 'var(--color-medium)';
        scoreVerdictTag.style.color = 'var(--color-medium)';
      } else {
        verdictLabel.textContent = 'CRITICAL • BOT BLOCKS DETECTED';
        scoreVerdictTag.style.borderColor = 'var(--color-critical)';
        scoreVerdictTag.style.color = 'var(--color-critical)';
      }
    }

    // Set Points Breakdown
    breakdownDisc.textContent = `${data.breakdown.discoverability}/50`;
    breakdownFresh.textContent = `${data.breakdown.freshness}/25`;
    breakdownEngage.textContent = `${data.breakdown.engagement}/25`;

    // Set Severity counts
    countCritical.textContent = data.summary.critical;
    countHigh.textContent = data.summary.high;
    countMedium.textContent = data.summary.medium;
    countLow.textContent = data.summary.low;

    // Cache findings list and reset filters display
    currentFindings = data.findings || [];
    filterButtons.forEach(b => b.classList.remove('active'));
    const allFilterBtn = document.querySelector('.filter-btn[data-filter="ALL"]');
    if (allFilterBtn) allFilterBtn.classList.add('active');

    // Display all findings initially
    displayFindings('ALL');

    // Set compiled markdown report text
    compiledReportText = data.report;
    reportTextArea.textContent = data.report;

    // Smooth scroll down to results
    resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Display Findings Filtered ---
  function displayFindings(filter = 'ALL') {
    findingsListWrapper.innerHTML = '';
    
    const filtered = filter === 'ALL'
      ? currentFindings
      : currentFindings.filter(f => f.severity.toUpperCase() === filter.toUpperCase());

    if (filtered.length === 0) {
      findingsListWrapper.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--text-muted); background: rgba(255,255,255,0.02); border-radius: 14px; border: 1px dashed rgba(255,255,255,0.08);">
          🎉 <strong style="color: var(--neon-cyan);">No ${filter.toLowerCase() !== 'all' ? filter.toLowerCase() : ''} issues detected!</strong> Your site passes all checks for this category.
        </div>
      `;
      return;
    }

    filtered.forEach(finding => {
      const item = document.createElement('div');
      item.className = 'finding-item';
      
      let severityColor = 'low-text';
      let severityBg = 'low-bg';
      
      const sevUpper = finding.severity.toUpperCase();
      if (sevUpper === 'CRITICAL') {
        severityColor = 'critical-text';
        severityBg = 'critical-bg';
        item.classList.add('critical-border');
      } else if (sevUpper === 'HIGH') {
        severityColor = 'high-text';
        severityBg = 'high-bg';
        item.classList.add('high-border');
      } else if (sevUpper === 'MEDIUM') {
        severityColor = 'medium-text';
        severityBg = 'medium-bg';
        item.classList.add('medium-border');
      } else {
        item.classList.add('low-border');
      }

      const actionText = typeof finding.suggested_action === 'string' 
        ? finding.suggested_action 
        : (finding.suggested_action.summary || '');
        
      const priorityText = typeof finding.suggested_action === 'string'
        ? (finding.priority || finding.severity)
        : (finding.suggested_action.priority || finding.priority || finding.severity);

      item.innerHTML = `
        <div class="finding-header">
          <div class="finding-title-group">
            <span class="finding-id">${finding.id}</span>
            <span class="finding-title">${finding.title}</span>
          </div>
          <div class="finding-meta">
            <span class="badge ${severityColor} ${severityBg}">${finding.severity}</span>
            <svg class="chevron-icon" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
          </div>
        </div>
        <div class="finding-content">
          <div class="content-block">
            <h4>Evidence</h4>
            <p>${escapeHtml(finding.evidence)}</p>
          </div>
          <div class="content-block">
            <h4>Suggested Action / Remediation</h4>
            <pre>${escapeHtml(actionText)}</pre>
          </div>
          <div class="content-block">
            <span style="font-size: 0.78rem; color: var(--text-muted);">Priority Level: <strong class="${severityColor}">${priorityText.toUpperCase()}</strong></span>
          </div>
        </div>
      `;

      // Toggle Accordion Click
      const header = item.querySelector('.finding-header');
      header.addEventListener('click', () => {
        item.classList.toggle('open');
      });

      findingsListWrapper.appendChild(item);
    });
  }

  // HTML sanitizer
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Animate counter and gauge circle
  function animateScoreCounter(targetScore) {
    let currentScore = 0;
    const circumference = 502;
    gaugeFillCircle.style.strokeDasharray = circumference;
    
    const interval = setInterval(() => {
      if (currentScore >= targetScore) {
        currentScore = targetScore;
        clearInterval(interval);
      }
      
      scoreValText.textContent = currentScore;
      
      const offset = circumference - (circumference * currentScore) / 100;
      gaugeFillCircle.style.strokeDashoffset = offset;
      
      if (currentScore === targetScore) return;
      currentScore++;
    }, 15);
  }

  // --- Copy and Download Actions ---
  if (btnCopyReport) {
    btnCopyReport.addEventListener('click', () => {
      if (!compiledReportText) return;
      navigator.clipboard.writeText(compiledReportText).then(() => {
        const origHtml = btnCopyReport.innerHTML;
        btnCopyReport.innerHTML = `<span>Copied to Clipboard!</span>`;
        setTimeout(() => {
          btnCopyReport.innerHTML = origHtml;
        }, 2000);
      });
    });
  }

  if (btnDownloadReport) {
    btnDownloadReport.addEventListener('click', () => {
      if (!compiledReportText) return;
      const blob = new Blob([compiledReportText], { type: 'text/markdown' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `brand-ai-readiness-report-${targetHostTitle.textContent}.md`;
      link.click();
    });
  }

  if (btnCopyManifest) {
    btnCopyManifest.addEventListener('click', () => {
      const manifestCode = document.querySelector('.manifest-code code');
      if (manifestCode) {
        navigator.clipboard.writeText(manifestCode.textContent).then(() => {
          btnCopyManifest.textContent = 'Copied!';
          setTimeout(() => {
            btnCopyManifest.textContent = 'Copy JSON';
          }, 2000);
        });
      }
    });
  }

  // --- Inspect Skill modal overlay triggers ---
  inspectSkillBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const skillId = btn.getAttribute('data-skill');
      
      modalSkillTitle.textContent = `${skillId}/SKILL.md`;
      modalSkillBody.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">Loading skill definition...</div>';
      
      skillModal.classList.add('open');

      try {
        const response = await fetch(`/brand-ai-readiness-audit/skills/${skillId}/SKILL.md`);
        if (!response.ok) {
          throw new Error('Failed to load SKILL.md file.');
        }
        const text = await response.text();
        modalSkillBody.innerHTML = convertMarkdownToHtml(text);
      } catch (err) {
        modalSkillBody.innerHTML = `<div style="color: var(--color-critical); padding: 1.5rem;">Error loading skill file: ${err.message}</div>`;
      }
    });
  });

  // Modal Close triggers
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (skillModal) {
    skillModal.addEventListener('click', (e) => {
      if (e.target === skillModal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && skillModal.classList.contains('open')) {
      closeModal();
    }
  });

  function closeModal() {
    skillModal.classList.remove('open');
  }

  // Lightweight markdown parser for display in modal
  function convertMarkdownToHtml(markdown) {
    let cleanMd = markdown;
    if (markdown.startsWith('---')) {
      const parts = markdown.split('---');
      if (parts.length >= 3) {
        cleanMd = parts.slice(2).join('---').trim();
      }
    }

    const lines = cleanMd.split('\n');
    let html = '';
    let inList = false;
    let inCode = false;

    lines.forEach(line => {
      let trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        if (inCode) {
          html += '</pre>';
          inCode = false;
        } else {
          html += '<pre>';
          inCode = true;
        }
        return;
      }

      if (inCode) {
        html += escapeHtml(line) + '\n';
        return;
      }

      if (trimmed.startsWith('# ')) {
        html += `<h2>${trimmed.substring(2)}</h2>`;
        return;
      }
      if (trimmed.startsWith('## ')) {
        html += `<h3>${trimmed.substring(3)}</h3>`;
        return;
      }
      if (trimmed.startsWith('### ')) {
        html += `<h4>${trimmed.substring(4)}</h4>`;
        return;
      }

      if (trimmed.startsWith('- ')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${parseInlineMarkdown(trimmed.substring(2))}</li>`;
        return;
      }

      if (!trimmed.startsWith('- ') && inList) {
        html += '</ul>';
        inList = false;
      }

      if (trimmed === '---') {
        html += '<hr style="border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 1.5rem 0;">';
        return;
      }

      if (trimmed === '') {
        return;
      }

      html += `<p>${parseInlineMarkdown(line)}</p>`;
    });

    if (inList) html += '</ul>';

    return html;
  }

  function parseInlineMarkdown(text) {
    return escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(0,242,254,0.1); padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: var(--neon-cyan); border: 1px solid rgba(0,242,254,0.2);">$1</code>');
  }

});
