/**
 * PDFGenerator - Handles CEO review PDF generation and download
 * @namespace PDFGenerator
 */

/**
 * Generate and download PDF from current form data
 * @function generatePDF
 * @returns {Promise<void>}
 */
async function generatePDF() {
  const { jsPDF } = window.jspdf;
  if (!jsPDF) {
    alert('PDF library not loaded. Please refresh the page and try again.');
    return;
  }
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  let yPos = margin;
  
  // Helper function to add text with word wrap
  const addText = (text, fontSize = 10, isBold = false) => {
    if (!text || text.trim() === '') return;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(String(text), maxWidth);
    lines.forEach(line => {
      if (yPos > pageHeight - margin - 10) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += fontSize * 0.4;
    });
    yPos += 3;
  };
  
  const addSection = (title) => {
    yPos += 2;
    if (yPos > pageHeight - margin - 15) {
      doc.addPage();
      yPos = margin;
    }
    addText(title, 12, true);
  };
  
  // Title
  addText('REAP Marlborough – CEO Self-Review', 14, true);
  addText(`Generated: ${new Date().toLocaleDateString()}`, 9);
  yPos += 3;
  
  // Collect and add form data
  const formData = collectFormData();
  
  // Part 1: Performance Reflection
  addSection('Part 1: Performance Reflection');
  addText('Key Successes:', 11, true);
  addText(formData['part-1'].successes || 'No response provided', 9);
  addText('What Did Not Go Well:', 11, true);
  addText(formData['part-1']['not-well'] || 'No response provided', 9);
  addText('Comparative Reflection:', 11, true);
  addText(formData['part-1']['comparative-reflection'] || 'No response provided', 9);
  
  if (formData['part-1'].challenges && formData['part-1'].challenges.length > 0) {
    addText('Challenges:', 11, true);
    formData['part-1'].challenges.forEach((ch, i) => {
      addText(`${i + 1}. Challenge: ${ch.challenge}`, 9, true);
      addText(`   Action: ${ch.action}`, 9);
      addText(`   Result: ${ch.result}`, 9);
    });
  }
  
  // Part 2: Goals & KPIs
  addSection('Part 2: Review of Previous Goals & KPIs');
  
  if (formData['part-2'].lastYearGoals && formData['part-2'].lastYearGoals.length > 0) {
    addText('Last Year Goals:', 11, true);
    formData['part-2'].lastYearGoals.forEach((goal, i) => {
      addText(`${i + 1}. ${goal.goal}`, 9, true);
      addText(`   Progress: ${goal.progress}`, 9);
      addText(`   Status: ${goal.status}`, 9);
    });
  }
  
  if (formData['part-2'].kpis && formData['part-2'].kpis.length > 0) {
    addText('KPI Ratings:', 11, true);
    formData['part-2'].kpis.forEach((kpi, i) => {
      if (kpi.name && kpi.rating) {
        addText(`${i + 1}. ${kpi.name}: ${kpi.rating}/5`, 9, true);
        if (kpi.why) addText(`   Why: ${kpi.why}`, 9);
      }
    });
  }
  
  // Part 3: Job Description Alignment
  addSection('Part 3: Job Description Alignment');
  if (formData['part-3'] && formData['part-3'].jdAlignment && formData['part-3'].jdAlignment.length > 0) {
    formData['part-3'].jdAlignment.forEach((alignment, i) => {
      addText(`${i + 1}. ${alignment.area}`, 9, true);
      addText(`   What Went Well: ${alignment.wentWell || 'No response'}`, 9);
      addText(`   What Did Not Go Well: ${alignment.notWell || 'No response'}`, 9);
    });
  }
  
  // Part 4: Strategic Priorities
  addSection('Part 4: Strategic Priorities (2022–2024)');
  if (formData['part-4'] && formData['part-4'].strategicPriorities && formData['part-4'].strategicPriorities.length > 0) {
    formData['part-4'].strategicPriorities.forEach((priority, i) => {
      addText(`${i + 1}. ${priority.priority}`, 9, true);
      addText(`   Progress: ${priority.progress || 'No response'}`, 9);
      addText(`   Challenges: ${priority.challenges || 'No response'}`, 9);
      addText(`   Trend: ${priority.trend || 'No response'}`, 9);
    });
  }
  
  // Part 5: Personal Assessment & Development
  addSection('Part 5: Personal Assessment & Development');
  addText('Key Strengths:', 11, true);
  addText(formData['part-5'].strengths || 'No response provided', 9);
  addText('Limitations / Restrictions:', 11, true);
  addText(formData['part-5'].limitations || 'No response provided', 9);
  
  if (formData['part-5'].pdUndertaken && formData['part-5'].pdUndertaken.length > 0) {
    addText('Professional Development Undertaken:', 11, true);
    formData['part-5'].pdUndertaken.forEach((pd, i) => {
      addText(`${i + 1}. ${pd.name}`, 9, true);
      addText(`   Outcome: ${pd.outcome || 'No details'}`, 9);
    });
  }
  
  if (formData['part-5'].pdNeeded && formData['part-5'].pdNeeded.length > 0) {
    addText('Future Professional Development Needs:', 11, true);
    formData['part-5'].pdNeeded.forEach((pd, i) => {
      addText(`${i + 1}. ${pd.type}`, 9, true);
      addText(`   Rationale: ${pd.rationale || 'No details'}`, 9);
    });
  }
  
  // Part 6: Future Focus
  addSection('Part 6: Future Focus (Next 12 Months)');
  if (formData['part-6'] && formData['part-6'].futureGoals && formData['part-6'].futureGoals.length > 0) {
    formData['part-6'].futureGoals.forEach((goal, i) => {
      addText(`${i + 1}. ${goal.goal}`, 9, true);
      addText(`   Expected Outcomes: ${goal.outcomes || 'No details'}`, 9);
      addText(`   Timeline: ${goal.timeline || 'No timeline specified'}`, 9);
    });
  } else {
    addText('No future goals added', 9);
  }
  
  // Part 7: Dialogue with the Board
  addSection('Part 7: Dialogue with the Board');
  if (formData['part-7'] && formData['part-7'].boardRequests && formData['part-7'].boardRequests.length > 0) {
    addText('Requests for the Board:', 11, true);
    formData['part-7'].boardRequests.forEach((request, i) => {
      addText(`${i + 1}. ${request.request}`, 9, true);
      addText(`   Rationale: ${request.rationale || 'No rationale provided'}`, 9);
    });
  } else {
    addText('No board requests added', 9);
  }
  
  // Download PDF
  const fileName = `CEO_Review_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  alert('PDF downloaded successfully!');
}

// --- Export to global namespace ---
window.PDFGenerator = {
  generate: generatePDF
};

// Legacy export for backwards compatibility
window.generatePDF = generatePDF;
