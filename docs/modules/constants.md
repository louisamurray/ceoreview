# Constants Module

## Overview

**File:** `assets/js/core/constants.js`  
**Namespace:** `window.ReviewConstants`  
**Purpose:** Central configuration and constant definitions for the CEO review application  
**Size:** ~147 lines  
**Status:** ✅ Phase 1

---

## Purpose

The Constants module serves as the single source of truth for all configuration values, schemas, messages, and enums used throughout the application. It eliminates magic strings, centralizes configuration, and makes the application easier to maintain and modify.

---

## Public API

### Configuration Objects

#### `ReviewConstants.KPI_CATEGORIES`
Object mapping KPI category keys to display labels.

```javascript
{
  communication: "Communication",
  leadership: "Leadership",
  financial: "Financial Management",
  strategic: "Strategic Planning",
  operational: "Operational Excellence",
  innovation: "Innovation & Growth"
}
```

#### `ReviewConstants.REVIEW_SECTIONS`
Array of form sections in display order.

```javascript
['part-1', 'part-2', 'part-3', 'part-4', 'part-5', 'part-6', 'part-7', 'part-8']
```

#### `ReviewConstants.FIELD_SCHEMAS`
Comprehensive schema defining all form fields, their types, validation rules, and display properties.

```javascript
{
  'part-1': {
    successes: { type: 'textarea', ... },
    'not-well': { type: 'textarea', ... },
    challenges: { type: 'array', itemType: 'text', ... },
    // ... more fields
  },
  // ... more sections
}
```

#### `ReviewConstants.MESSAGES`
User-facing messages and notifications.

```javascript
{
  SUCCESS: "Review submitted successfully!",
  ERROR: "An error occurred. Please try again.",
  CONFIRM_SUBMIT: "Are you sure you want to submit your review?",
  // ... more messages
}
```

#### `ReviewConstants.emptyStateMessages`
Messages displayed when form sections are empty.

```javascript
{
  'challenges-container': 'No challenges added yet.',
  'goals-container': 'No goals added yet.',
  // ... more empty states
}
```

---

## Usage Examples

### Import and Use

```javascript
// Access a KPI category
const label = window.ReviewConstants.KPI_CATEGORIES.communication;
console.log(label); // "Communication"

// Get all sections
const sections = window.ReviewConstants.REVIEW_SECTIONS;
sections.forEach(section => {
  console.log(`Processing section: ${section}`);
});

// Access schema for a field
const schema = window.ReviewConstants.FIELD_SCHEMAS['part-1'].successes;
console.log(schema.type); // 'textarea'
```

### Common Patterns

**Validating a field:**
```javascript
function validateField(section, fieldName, value) {
  const schema = window.ReviewConstants.FIELD_SCHEMAS[section]?.[fieldName];
  if (!schema) return false;
  
  if (schema.type === 'textarea') {
    return value.length > 0 && value.length <= schema.maxLength;
  }
  
  return true;
}
```

**Getting all messages:**
```javascript
const msg = window.ReviewConstants.MESSAGES;
alert(msg.SUCCESS); // "Review submitted successfully!"
```

---

## Dependencies

- **No dependencies** - This is a pure data module

---

## Modules Depending On This

- ✅ `core/formatters.js` - Uses schemas for rendering
- ✅ `core/forms.js` - Uses schemas for form operations
- ✅ `ui/components/buttons.js` - Uses messages
- ✅ `ui/components/form-inputs.js` - Uses schemas
- ✅ `services/firebase-wrapper.js` - Uses schemas
- ✅ `app.js` - Uses messages and empty state definitions

---

## When to Modify

### Add a new form field
1. Add field name to relevant section in `FIELD_SCHEMAS`
2. Define field type, validation rules, and properties
3. Add HTML element with matching `id` attribute in `index.html`

### Change a message
1. Update the message value in `MESSAGES` object
2. All references automatically use new value

### Add a new KPI category
1. Add to `KPI_CATEGORIES` object
2. Add any validation to `FIELD_SCHEMAS` if needed
3. Update UI to show new option if needed

---

## Testing

```javascript
describe('ReviewConstants', () => {
  test('KPI_CATEGORIES is defined', () => {
    expect(window.ReviewConstants.KPI_CATEGORIES).toBeDefined();
  });

  test('All sections defined in REVIEW_SECTIONS', () => {
    const sections = window.ReviewConstants.REVIEW_SECTIONS;
    expect(sections.length).toBeGreaterThan(0);
    expect(sections.includes('part-1')).toBe(true);
  });

  test('FIELD_SCHEMAS covers all sections', () => {
    const sections = window.ReviewConstants.REVIEW_SECTIONS;
    sections.forEach(section => {
      expect(window.ReviewConstants.FIELD_SCHEMAS[section]).toBeDefined();
    });
  });
});
```

---

## Performance Notes

- ✅ Zero performance impact - pure data object
- ✅ Single instance - created once at startup
- ✅ No DOM operations
- ✅ No database calls

---

## See Also

- [Forms Module](./forms.md) - Uses schemas
- [Architecture Guide](../ARCHITECTURE.md)
