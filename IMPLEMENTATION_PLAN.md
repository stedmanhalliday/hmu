# Implementation Plan: Multiple Contacts

## Overview

Add support for multiple contacts (max 2). Each contact has independent formValues and linkValues. Home shows multiple contact rows. Preview/edit flows work on specific contact by ID.

---

## Current Status (as of 2026-01-15)

**97% COMPLETE - 6 Issues Remaining (0 HIGH, 3 MEDIUM, 3 LOW)**

### Verification Results (18 Agents)
- **8/9 acceptance criteria** - PASS
- **1/9 acceptance criteria** - PARTIAL (empty state button guard)
- **4 original issues** - All confirmed
- **5 new issues** - Found during deep code review

---

## Completed Tasks

### Phase 1: Storage Foundation
- [x] `utils/storage.js` - CONTACTS key, generateContactId(), createEmptyContact(), MAX_CONTACTS

### Phase 2: Context API
- [x] `_app.js` - contacts, getContact(id), setContact(id, data), deleteContact(id), canAddContact
- [x] Migration logic - migrateToMultiContact() converts old single-contact data

### Phase 3: Home View
- [x] `pages/index.js` - Multiple contact rows, "+ New contact" button
- [x] `components/Contacts.js` - Accepts id prop, navigates with ID

### Phase 4: Preview Flow
- [x] `pages/preview.js` - Loads by ID, fallback to first contact, QR codes correct

### Phase 5: Edit Flows
- [x] `pages/create.js` - Passes contactId to Form
- [x] `pages/links.js` - Passes contactId to LinkForm
- [x] `components/Form.js` - Uses setContact, handles 'new' contact creation
- [x] `components/LinkForm.js` - Uses setContact, navigates with ID
- [x] `components/EditPane.js` - Parent handles navigation (pattern valid)

### Phase 6: Navigation & Data Flow
- [x] All navigation includes contact IDs
- [x] ID propagation works through all pages
- [x] Cancel buttons handle correctly in both forms

---

## Remaining Issues (6)

| # | Priority | File:Line | Issue | Fix |
|---|----------|-----------|-------|-----|
| 1 | MEDIUM | `components/Contact.js:31-37` | Direct `vibe.group[0]` access without checking array length | Add `&& vibe.group.length > 0` guard |
| 2 | MEDIUM | `components/Contacts.js:39-44` | `vibe.group` could be empty array, causes undefined access | Add `vibe.group.length > 0` guard |
| 3 | MEDIUM | `pages/_app.js` | No React Error Boundary - unhandled errors crash entire app | Wrap `<Component>` in ErrorBoundary |
| 4 | LOW | `pages/index.js:150` | Button shows without `canAddContact` check when `hasContacts=false` | Change to conditional render with `canAddContact` |
| 5 | LOW | `components/LinkForm.js:61` | No error handling for invalid contact ID on save | Validate `getContact(contactId)` before `setContact` |
| 6 | LOW | `pages/preview.js:240` | `processURL` returns null, sets `displayName` to null | Fallback to original URL or empty string |

---

## Data Structure

```javascript
// New multi-contact format (active)
contacts: [
  {
    id: "contact-1737XXXXXX-abc123",
    formValues: { name, phone, email, url, vibe },
    linkValues: { instagram, twitter, linkedin, venmo, custom }
  }
  // Max 2 contacts
]
```

---

## Context API

```javascript
{
  contacts,                    // Array of contact objects
  getContact(id),              // Returns contact or null
  setContact(id, data),        // id='new' creates, returns new ID or null at limit
  deleteContact(id),           // Remove by ID
  canAddContact,               // contacts.length < MAX_CONTACTS
  storageError,                // Boolean for write failures
  setStorageError              // Clear error state
}
```

---

## File Status

| File | Status | Issues | Notes |
|------|--------|--------|-------|
| `utils/storage.js` | Complete | 0 | All helpers working |
| `pages/_app.js` | Needs Work | 1 | Missing Error Boundary (#3) |
| `pages/index.js` | Minor Issue | 1 | Empty state button guard (#4) |
| `pages/preview.js` | Minor Issue | 1 | processURL null handling (#6) |
| `pages/create.js` | Complete | 0 | Max contacts pre-check resolved |
| `pages/links.js` | Complete | 0 | Passes ID and values |
| `components/Contacts.js` | Needs Work | 1 | Empty vibe.group guard (#2) |
| `components/Contact.js` | Needs Work | 1 | Empty vibe.group guard (#1) |
| `components/Form.js` | Complete | 0 | Null return handling resolved |
| `components/LinkForm.js` | Minor Issue | 1 | Invalid ID handling (#5) |
| `components/EditPane.js` | Complete | 0 | Parent handles navigation |

---

## Acceptance Criteria

- [x] Home shows all contacts as separate rows
- [x] Each contact navigates to its own preview
- [x] Edit button edits the current contact only
- [x] Links are independent per contact
- [~] "+ New contact" appears when < 2 contacts (PARTIAL: empty state edge case #7)
- [x] Creating new contact adds to array
- [x] Existing single-contact users migrated seamlessly
- [x] Maximum 2 contacts enforced at API level
- [x] Empty state (0 contacts) works
- [x] Direct URL `/create?id=new` at limit handled gracefully
- [x] Form submission at limit shows error

---

## Execution Log

**2026-01-15 (Initial Review)**: 15-agent code review. Feature already fully implemented.

**2026-01-15 (Verification)**: 18-agent verification completed.

Results:
- 8/9 acceptance criteria: PASS
- 1/9 acceptance criteria: PARTIAL
- 4 original issues confirmed
- 5 new issues discovered
- 1 spec deviation (non-issue): Migration uses generateContactId() instead of "primary" - actually better
- 1 API deviation (acceptable): Uses setContact('new', data) instead of addContact(data) - cleaner

**2026-01-15 (Issue #1 Fixed)**: LinkForm.js recursive stack overflow resolved. Converted `processDisplayName` from recursive to iterative with 10-iteration safety limit. HIGH priority issue eliminated.

**2026-01-15 (Issues #1-2 Fixed)**: create.js max contacts bypass resolved - added early redirect on mount when `id==='new' && !canAddContact`. Form.js null navigation resolved - added `savedId !== null` check before navigation and modal error display on save failure. 2 MEDIUM priority issues eliminated.

---

## Next Steps (Prioritized by Severity)

### MEDIUM Priority (User-Facing Bugs)
1. **Fix Contact.js empty group access** - Add length check
2. **Fix Contacts.js empty group access** - Add length check
3. **Add Error Boundary to _app.js** - Prevent full app crashes

### LOW Priority (Edge Cases)
4. **Fix index.js empty state button** - Add `canAddContact` condition
5. **Fix LinkForm.js invalid ID** - Validate contact exists before save
6. **Fix preview.js processURL null** - Add fallback for displayName

---

## Future Work
- Delete contact UI - deleteContact exists in context, no UI yet
- Error Boundary component with recovery UI
