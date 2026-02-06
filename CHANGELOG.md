# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Magic Message feature: QR codes that generate email or SMS drafts when scanned (#70)
- Calendly and Cal.com booking links (#69)
- Redesigned edit links page with two-zone layout and platform picker grid (#57)
- Donation prompts triggered by user engagement (#78)
- Signal messaging platform support with phone number and username URL handling (#81)
- Telegram phone number support (phone numbers generate `t.me/+` links)
- `useDonatePrompt` custom hook extracted from preview page
- `resolvePhoneUrl` shared utility for phone number and URL detection across Signal, Telegram, and WhatsApp
- `DONATE_PROMPT_COOLDOWN_MS` named constant for donation prompt cooldown
- Contribute and Privacy footer buttons replacing help trigger (#73, #75)
- 6 new social link types: Facebook, YouTube, TikTok, Snapchat, Twitch, Discord
- Links carousel with horizontal swipe and dot indicators when >8 links (#55)
- Route-level page transition animations with unified 240ms timing (#56)
- Text ellipsis on link input fields for long URLs and handles (#66)
- 15 new test files for previously untested components and utilities
- 40+ new tests for URL generation, donate prompt hook, and shared utilities

### Changed

- Replaced Signal icon with official brand mark from Simple Icons
- WhatsApp, Signal, and Telegram share `resolvePhoneUrl` for consistent phone/URL handling
- WhatsApp now accepts full `wa.me` URLs in addition to phone numbers
- Placeholder consistency: ` / ` delimiter replaces "or", removed `@` from YouTube placeholder
- Segmented control border updated to match form input borders (#80)
- LinkForm initial state uses `EMPTY_LINK_VALUES` from storage.js to prevent drift with new platforms
- Improved edit links empty state copy (#82)
- Improved Magic Message subtitle copy (#84)
- Platform-specific placeholder copy for link fields (#58)
- Custom link label renamed to 'Custom Link' with link icon (#59, #61, #65)
- Link form UX: faster transitions, clearer copy, realistic placeholders (#63)
- Updated 'hmu' references to 'hmu.world' in manifest and header (#60)
- X link label clarified to 'X (Twitter)' in contribute modal (#77)
- Polished contribute and privacy modals (#75)
- Darkened add photo button border for better contrast (#74)
- Replaced 9 social icons with cleaner SVGs (WhatsApp, Spotify, SoundCloud, Apple Music, GitHub, Facebook, YouTube, Snapchat, Twitch)
- Optical adjustments for icon sizing (TikTok, SoundCloud, Twitch)
- Preview layout: contact group moved higher, speed dial centered in bottom section
- Centralized link metadata (URL prepends, display name prepends) in constants.js
- Extracted shared DonateButton and ContributeModalContent components
- Extracted processURL as shared utility

### Fixed

- Modal z-index set to `z-40` to appear above nav and speed dial buttons (#79)
- Rapid speed dial taps no longer suppress donation prompts indefinitely
- Donation prompts prevented from both showing in the same 24-hour period (#83)
- Full URL parsing preserved across all platforms (#71)
- PWA zoom disabled via viewport constraints (#76)
- TextButton not forwarding disabled prop (affected ConfirmModal loading state)
- MagicMessageForm browser validation overriding custom validation
- EMPTY_LINK_VALUES missing calendly and cal keys
- Deprecated `substr` replaced with `substring` in generateContactId
- Typo: 'lastest' → 'latest' in InstallModal
- Speed dial button transition delay removed (#68)

### Developer Experience

- 15 new test files covering previously untested components and utilities (~121 new tests, 364 total)
- ~413 total tests (up from ~364)
- Raised coverage thresholds to 43% branches, 54% functions, 53% lines/statements

## [0.1.8] - 2026-02-01

### Fixed

- iOS PWA help button tap target issues
- Modal can now be dismissed by tapping backdrop
- Safe area inset handling for iOS PWA

### Changed

- Help button changed from `<a>` to `<button>` for accessibility
- Help button moved inline below app description
- Page loading uses visibility instead of opacity to avoid stacking context bugs
- Removed unnecessary Fragment wrapper in index page

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
