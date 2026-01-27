# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- additional social links: 
  - facebook
  - youtube
  - tiktok
  - snapchat
  - twitch
  - discord

## [0.1.7] - 2026-01-27

### Added

- Jest testing framework with 150+ unit and integration tests
- Test coverage reporting with Codecov integration
- GitHub Actions CI workflow for automated testing, linting, and builds
- Component tests for Page, Modal, ErrorBoundary, Form, LinkForm, Contact, SocialLink, EditPane
- Integration tests for index, create, preview, and _app pages
- Utility tests for storage, image resize, and gradient animation hook
- ESLint 9 flat config migration from deprecated next lint
- Centralized constants file (lib/constants.js) for shared values
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

- Optimized useGradientAnimation hook by moving rgbaColor outside component
- Memoized SortableContact and SortableInput components for better performance
- Wrapped vCardValues in useCallback for stable reference
- Fixed inconsistent data attribute casing (data-displayname)
- Removed unused imports and variables throughout codebase
- Removed obsolete eslint-disable comments for @next/next/no-img-element

### Fixed

- Google Analytics URL (removed erroneous GA_ prefix in tag ID)

### Removed

- Unused dependencies: react-secure-storage, typescript, eslint-config-next

### Developer Experience

- Added npm scripts: test, test:coverage, test:watch, lint:fix
- Coverage thresholds configured (20-30% minimum)
- Jest setup with Next.js preset and jsdom environment
- Codecov configuration for PR coverage comments

## [0.1.6] - 2026-01-20

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

- iOS PWA initial load layout inconsistency (content positioning now matches navigation state)
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

## [0.1.4] - 2026-01-15

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
