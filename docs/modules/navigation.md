# Navigation Helpers Module

## Overview

**File:** `assets/js/ui/helpers/navigation.js`  
**Namespace:** `window.UINavigation`  
**Purpose:** Section navigation, collapsible management, and progress tracking  
**Size:** ~190 lines  
**Status:** ✅ Phase 3

---

## Purpose

The Navigation Helpers module manages all form navigation features including section navigation, collapsible panels, progress indicators, and smooth scrolling. It provides a cohesive navigation experience for multi-section forms.

---

## Public API

### `debounce(fn, wait = 300)`

Debounces a function to prevent excessive calls during rapid events.

**Parameters:**
- `fn` (function): Function to debounce
- `wait` (number): Delay in milliseconds (default: 300)

**Returns:**
- (function): Debounced version of the function

**Example:**
```javascript
const updateProgress = window.UINavigation.debounce(() => {
  console.log('Updating progress...');
}, 500);

// Call multiple times rapidly
updateProgress(); // Called immediately
updateProgress(); // Ignored
updateProgress(); // Ignored
// After 500ms of no calls: progress update executes once
```

---

### `smoothScrollTo(target)`

Smoothly scrolls to a target element with animation.

**Parameters:**
- `target` (string|element): CSS selector or DOM element

**Returns:**
- (void)

**Example:**
```javascript
window.UINavigation.smoothScrollTo('#part-2');
// or
window.UINavigation.smoothScrollTo(document.getElementById('part-2'));
```

---

### `setSectionCollapsed(section, collapsed)`

Sets the collapsed state of a form section.

**Parameters:**
- `section` (string): Section ID (e.g., 'part-1')
- `collapsed` (boolean): true to collapse, false to expand

**Returns:**
- (void)

**Side Effects:**
- Updates DOM to show/hide section content
- Updates visual indicators (chevron direction)
- Triggers progress update

**Example:**
```javascript
// Collapse a section
window.UINavigation.setSectionCollapsed('part-1', true);

// Expand a section
window.UINavigation.setSectionCollapsed('part-1', false);
```

---

### `updateSectionSummary(section)`

Updates the progress indicator for a specific section.

**Parameters:**
- `section` (string): Section ID

**Returns:**
- (void)

**Details:**
- Counts completed fields in the section
- Updates progress bar percentage
- Shows completion count (e.g., "5/12 fields")

---

### `updateAllSectionSummaries()`

Updates progress indicators for all sections and overall progress.

**Parameters:**
- (none)

**Returns:**
- (void)

**Example:**
```javascript
// Called automatically after form changes
// Or manually trigger with:
window.UINavigation.updateAllSectionSummaries();
```

---

### `updateOverallProgress()`

Updates the main progress bar showing completion percentage.

**Parameters:**
- (none)

**Returns:**
- (void)

---

### `navigateToSection(id, updateUrl = true)`

Navigates to a specific section, expanding it and scrolling into view.

**Parameters:**
- `id` (string): Section ID or CSS selector (e.g., '#part-2' or 'part-2')
- `updateUrl` (boolean): Whether to update browser URL (default: true)

**Returns:**
- (void)

**Example:**
```javascript
// Navigate to section and update URL
window.UINavigation.navigateToSection('#part-3', true);

// Navigate without changing URL (for internal navigation)
window.UINavigation.navigateToSection('part-1', false);
```

---

### `setupCollapsibles()`

Initializes all collapsible section headers.

**Parameters:**
- (none)

**Returns:**
- (void)

**Side Effects:**
- Attaches click handlers to section headers
- Enables expand/collapse functionality
- Preserves collapsed state in URL if present

**Setup:**
Automatically called in `app.js` DOMContentLoaded.

---

### `setupSectionNav()`

Initializes the section navigation pills/buttons.

**Parameters:**
- (none)

**Returns:**
- (void)

**Side Effects:**
- Attaches click handlers to navigation buttons
- Enables jump to section functionality
- Updates active indicator as user navigates

---

### `setupInfoDots()`

Initializes information tooltip buttons throughout the form.

**Parameters:**
- (none)

**Returns:**
- (void)

**Side Effects:**
- Attaches click handlers to all `.info-dot` buttons
- Shows/hides tooltip on click
- Manages tooltip positioning and visibility

---

## Usage Examples

### Complete Navigation Setup

```javascript
// All setup functions called in app.js DOMContentLoaded
window.UINavigation.setupCollapsibles();
window.UINavigation.setupSectionNav();
window.UINavigation.setupInfoDots();
```

### Programmatic Navigation

```javascript
// Navigate to a section when button clicked
function goToKPIs() {
  window.UINavigation.navigateToSection('#part-4');
}

// Navigate without URL change (for internal app flow)
function showStep2() {
  window.UINavigation.navigateToSection('part-2', false);
}
```

### Progress Tracking

```javascript
// Listen for form changes
const form = document.getElementById('reviewForm');
form.addEventListener('change', () => {
  window.UINavigation.updateAllSectionSummaries();
});

// Get progress of one section
const section = 'part-1';
window.UINavigation.updateSectionSummary(section);
```

### Debouncing Frequent Operations

```javascript
// Create a debounced progress updater
const debouncedUpdate = window.UINavigation.debounce(() => {
  console.log('Saving to cloud...');
  window.saveToFirebase();
}, 1000);

// Call many times
document.addEventListener('input', debouncedUpdate);
// Actually saves after 1 second of no input
```

---

## Dependencies

- **No external dependencies**
- Uses: DOM APIs, window object

---

## Modules Depending On This

- ✅ `app.js` - Calls setup functions and navigation
- ✅ `ui/components/buttons.js` - May use debounce
- ✅ `ui/helpers/autosave.js` - Uses debounce internally

---

## When to Modify

### Add a new section to the form
1. Add section ID to HTML
2. Functions will auto-discover it
3. Call `setupCollapsibles()` again if needed

### Change progress tracking behavior
1. Modify `updateSectionSummary()` logic
2. Change completion criteria if needed
3. Test with various form states

### Adjust debounce delays
1. Change `wait` parameter in debounce calls
2. Shorter delays = more responsive but more calls
3. Longer delays = fewer calls but less responsive

---

## Testing

```javascript
describe('UINavigation', () => {
  test('debounce delays function execution', async () => {
    const mock = jest.fn();
    const debounced = window.UINavigation.debounce(mock, 100);
    
    debounced();
    expect(mock).not.toHaveBeenCalled();
    
    await new Promise(r => setTimeout(r, 150));
    expect(mock).toHaveBeenCalledTimes(1);
  });

  test('navigateToSection scrolls to element', () => {
    document.body.innerHTML = '<div id="part-2"></div>';
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView');
    
    window.UINavigation.navigateToSection('part-2');
    expect(scrollSpy).toHaveBeenCalled();
  });

  test('updateSectionSummary updates progress', () => {
    // Setup form with fields
    // Fill some fields
    // Call updateSectionSummary
    // Assert progress bar updated
  });
});
```

---

## Performance Notes

- ✅ Debouncing improves responsiveness (prevents jank)
- ✅ Smooth scroll uses requestAnimationFrame
- ✅ Event delegation for efficient listener management
- ⚠️ Many sections: Lazy-load progress updates

---

## Browser Compatibility

- ✅ scrollIntoView() - All modern browsers
- ✅ Smooth scroll - Requires `scroll-behavior: smooth` CSS
- ✅ requestAnimationFrame - All modern browsers

---

## See Also

- [Modals Module](./modals.md) - Works with navigation
- [Architecture Guide](../ARCHITECTURE.md)
