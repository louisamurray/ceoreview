# Formatters Module

## Overview

**File:** `assets/js/core/formatters.js`  
**Namespace:** `window.Formatters`  
**Purpose:** Data formatting utilities for rendering previous review context  
**Size:** ~172 lines  
**Status:** ✅ Phase 3

---

## Purpose

The Formatters module provides specialized functions for formatting and rendering data, particularly for displaying previous review context within the current form. It converts data structures into HTML representations and handles text formatting for display.

---

## Public API

### `escapeHtml(value)`

Escapes HTML special characters to prevent XSS attacks.

**Parameters:**
- `value` (string): Text to escape

**Returns:**
- (string): HTML-escaped text

**Example:**
```javascript
const safe = window.Formatters.escapeHtml('<script>alert("xss")</script>');
console.log(safe); // "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
```

---

### `formatMultiline(text)`

Converts newlines in text to HTML `<br>` tags for display.

**Parameters:**
- `text` (string): Text possibly containing newlines

**Returns:**
- (string): HTML with `<br>` tags

**Example:**
```javascript
const html = window.Formatters.formatMultiline("Line 1\nLine 2\nLine 3");
// Output: "Line 1<br>Line 2<br>Line 3"
```

---

### `formatChallengeList(list)`

Renders an array of challenges as an HTML list for previous review context.

**Parameters:**
- `list` (array): Array of challenge strings

**Returns:**
- (string): HTML `<ul>` containing challenges

**Example:**
```javascript
const html = window.Formatters.formatChallengeList([
  'Budget constraints',
  'Team availability'
]);
// Output: "<ul><li>Budget constraints</li><li>Team availability</li></ul>"
```

---

### `formatGoalList(list)`

Renders an array of goals as HTML for previous review context.

**Parameters:**
- `list` (array): Array of goal strings

**Returns:**
- (string): Formatted HTML representation

---

### `formatKpiList(list)`

Renders an array of KPI entries as HTML.

**Parameters:**
- `list` (array): Array of KPI objects with `title` and `rating` properties

**Returns:**
- (string): HTML list of KPIs with ratings

---

### `formatJobAlignmentList(list)`

Renders job alignment items for previous review context.

**Parameters:**
- `list` (array): Array of alignment items

**Returns:**
- (string): Formatted HTML representation

---

### `formatStrategicPriorityList(list)`

Renders strategic priority items as HTML.

**Parameters:**
- `list` (array): Array of priority items

**Returns:**
- (string): Formatted HTML representation

---

### `formatPDUndertakenList(list)`

Renders professional development undertaken items.

**Parameters:**
- `list` (array): Array of PD items

**Returns:**
- (string): Formatted HTML list

---

### `formatPDNeededList(list)`

Renders professional development needed items.

**Parameters:**
- `list` (array): Array of needed PD items

**Returns:**
- (string): Formatted HTML list

---

### `formatFutureGoalList(list)`

Renders future goal items for review context.

**Parameters:**
- `list` (array): Array of future goals

**Returns:**
- (string): Formatted HTML representation

---

### `formatBoardRequestList(list)`

Renders board/leadership requests as HTML.

**Parameters:**
- `list` (array): Array of board request items

**Returns:**
- (string): Formatted HTML list

---

## Usage Examples

### Displaying Previous Review Context

```javascript
// In a component that renders previous review
const previousData = {
  challenges: ['Budget constraints', 'Resource limitations'],
  goals: ['Improve efficiency', 'Increase revenue'],
  kpis: [
    { title: 'Communication', rating: 4 },
    { title: 'Leadership', rating: 5 }
  ]
};

// Render each section
const challengeHtml = window.Formatters.formatChallengeList(previousData.challenges);
const goalHtml = window.Formatters.formatGoalList(previousData.goals);
const kpiHtml = window.Formatters.formatKpiList(previousData.kpis);

// Insert into page
document.getElementById('previous-challenges').innerHTML = challengeHtml;
document.getElementById('previous-goals').innerHTML = goalHtml;
document.getElementById('previous-kpis').innerHTML = kpiHtml;
```

### Secure Text Display

```javascript
// Prevent XSS attacks
const userInput = '<img src=x onerror="alert(1)">';
const safe = window.Formatters.escapeHtml(userInput);
document.getElementById('display').innerHTML = safe; // Safe to display
```

### Multi-line Text Formatting

```javascript
const feedback = "Great work this year.\nKeep improving.\nStrong leadership.";
const formatted = window.Formatters.formatMultiline(feedback);
// Output: "Great work this year.<br>Keep improving.<br>Strong leadership."
```

---

## Dependencies

- **No external dependencies** - Pure formatting functions
- Uses: `window.Formatters` namespace

---

## Modules Depending On This

- ✅ `services/previous-review.js` - Renders previous review data
- ✅ `app.js` - Uses for data display

---

## When to Modify

### Add a new format function
1. Create function in `formatters.js`
2. Add to `window.Formatters` namespace
3. Export legacy global if needed for HTML onclick handlers
4. Add tests in `tests/unit/formatters.test.js`

### Change formatting output
1. Modify the relevant format function
2. Update tests to match new output
3. Test in browser to verify appearance

---

## Testing

```javascript
describe('Formatters', () => {
  test('escapeHtml prevents XSS', () => {
    const malicious = '<script>alert("xss")</script>';
    const escaped = window.Formatters.escapeHtml(malicious);
    expect(escaped).not.toContain('<script>');
  });

  test('formatMultiline converts newlines', () => {
    const text = 'Line 1\nLine 2';
    const result = window.Formatters.formatMultiline(text);
    expect(result).toContain('<br>');
  });

  test('formatChallengeList returns valid HTML', () => {
    const challenges = ['Challenge 1', 'Challenge 2'];
    const html = window.Formatters.formatChallengeList(challenges);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Challenge 1</li>');
  });
});
```

---

## Performance Notes

- ✅ Fast - simple string operations
- ✅ No DOM queries or manipulations
- ✅ Minimal memory usage
- ⚠️ Large arrays: Consider pagination for lists > 100 items

---

## See Also

- [Previous Review Service](./previous-review.md) - Primary consumer
- [Architecture Guide](../ARCHITECTURE.md)
