// resume-review.js
// Loads review data from sessionStorage and populates the form if present
window.addEventListener('DOMContentLoaded', () => {
  const resumeReviewData = sessionStorage.getItem('resumeReviewData');
  if (resumeReviewData && typeof window.populateFormFromData === 'function') {
    try {
      const draft = JSON.parse(resumeReviewData);
      if (draft && draft.sections) {
        window.populateFormFromData(draft.sections);
        sessionStorage.removeItem('resumeReviewData');
        sessionStorage.removeItem('resumeReviewId');
        alert('Draft loaded from My Reviews!');
      }
    } catch (e) {
      console.error('Failed to load review from sessionStorage:', e);
    }
  }
});
