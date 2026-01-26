# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Client-side form validation for edit contact form (name, phone, email, URL formats; requires at least one contact method)
- Delete contact feature with confirmation modal
- Delete button on contact edit screen (red styling for destructive action)
- ConfirmModal component for destructive action confirmations
- Post-deletion navigation (redirects to remaining contact or home if none left)
- iOS PWA safe area support and splash screens
- Drag-and-drop reordering for contacts on home screen
- Donation link in feedback dialog
- Profile photos support
- New social link types
- Install prompt analytics with separate accepted/dismissed events

### Changed

- Reduced header margin on index screen
- Conditional margins for empty vs full link states on preview
- Increased max contacts from 2 to 3
- Improved header fluid typography and vertical spacing
- Refined preview layout spacing and stability
- Repositioned links to bottom of preview card
- Centered card content
- Adjusted label icon sizing

### Fixed

- Gradient rotation animation speed restored to 15ms
- Upgraded Next.js and React with security vulnerability fixes
- Spacing between QR code and link buttons
- Links flex flow to prevent overlap with centered content
- Suppressed img element warnings for base64/data URI images
- Empty state routing redirects to home when no contacts
- Android install prompt with service worker and state logic
- Error handling for setContact failures in LinkForm

## [0.1.5] - 2026-01-15

### Added

- Multiple contacts support (max 2 contacts per user)
- Contact ID-based routing for preview, edit, and links pages
- Migration from single-contact to multi-contact data format
- Error Boundary to prevent full app crashes
- "New contact" button on home screen

### Fixed

- Recursive stack overflow in URL display name processing
- Direct URL bypass of max contacts limit
- Null navigation after save at contact limit
- Empty vibe group array access crashes
- Invalid contact ID handling on link save
- Null URL display name fallback

## [0.1.4] - 2025-01-15

### Added

- User-facing error banner for storage write failures
- Storage quota and usage logging

### Changed

- Migrated to plain localStorage with improved persistence

### Fixed

- localStorage reliability and crash prevention
- Privacy modal text
- Window object check for SSR compatibility

## [0.1.3] - 2023-12-23

### Fixed

- First load fix for local data

## [0.1.2] - 2023-11-02

### Fixed

- Initially blank headline ticker

## [0.1.1] - 2023-11-02

### Added

- This CHANGELOG file
- Loading states and transitions
- App screenshots in web manifest
- New vibe options (themes)
- Platform-specific installation instruction dialogs
- Feedback button and dialog

### Changed

- Improved link formatting for form values
- Rebrand to hmu.world

### Removed

- Slow dynamic image loading (next/image)

### Fixed

- Secure local storage reliability


## [0.1.0] - 2023-09-24

### Added

- Launch features