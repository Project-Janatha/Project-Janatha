# Manual Testing Checklist

Test across three platforms: **iOS (native)**, **Mobile Web (Safari/Chrome)**, **Desktop Web (Chrome/Safari)**.

---

## Authentication

### Landing / Login
- [ ] Landing page loads with correct branding
- [ ] Login form accepts username and password
- [ ] Login shows error for invalid credentials
- [ ] Login shows error for empty fields
- [ ] Successful login redirects to discover screen
- [ ] "Create account" link navigates to signup

### Signup
- [ ] Signup form accepts username and password
- [ ] Signup shows error for existing username
- [ ] Signup shows error for weak password
- [ ] Successful signup logs user in automatically

### Session
- [ ] Refreshing/reopening the app keeps user logged in (token persistence)
- [ ] Logging out clears session and returns to landing
- [ ] Expired token redirects to login (not a crash)

---

## Onboarding

- [ ] New user is directed to onboarding after first login
- [ ] Step 1: First name and last name fields work
- [ ] Step 1: Continue button disabled until name entered
- [ ] Step 2: Birthday picker opens and selects a date
- [ ] Step 2: Continue button disabled until date selected
- [ ] Step 3: City/town search input geocodes and shows nearby centers
- [ ] Step 3: Center list appears sorted by distance
- [ ] Step 3: Selecting a center highlights it with a checkmark
- [ ] Step 3: Continue button disabled until center selected
- [ ] Step 4: Interest chips can be toggled on/off
- [ ] Step 4: Multiple interests can be selected
- [ ] Step 4: Continue sends data and completes onboarding
- [ ] Completion screen shows, then redirects to discover
- [ ] Progress bar updates correctly at each step (1/4, 2/4, 3/4, 4/4)
- [ ] Back button works at each step

---

## Discover (Home Tab)

### Event List
- [ ] Events load and display with title, date, time, location
- [ ] Events show attendee count and avatar bubbles
- [ ] "Going" badge appears on registered events
- [ ] Tapping an event navigates to event detail
- [ ] Pull-to-refresh / focus-refresh loads latest data
- [ ] Empty state shown when no events match filters

### Filters
- [ ] "All" tab shows events + centers
- [ ] "Going" tab shows only registered events + member centers
- [ ] "Centers" tab shows only centers
- [ ] Search bar filters events/centers by name and location
- [ ] Week calendar highlights dates with events
- [ ] Tapping a date filters to that day's events
- [ ] Tapping the same date again clears the filter
- [ ] "Show past events" toggle is unchecked by default
- [ ] Checking it reveals events with past dates
- [ ] Unchecking hides past events again

### Map (Native)
- [ ] Map renders with center and event pins
- [ ] Tapping a pin shows info popup
- [ ] Map responds to filter changes

### Map (Web Desktop)
- [ ] Map renders alongside the event list panel
- [ ] Pins match the current filter
- [ ] Clicking a pin selects the item in the list

---

## Event Detail

- [ ] Event detail screen loads with title, date, time, description
- [ ] Location/address displayed
- [ ] Map preview shows event location
- [ ] Attendee list shows with names and avatars
- [ ] "Register" / "Unregister" button toggles attendance
- [ ] After toggling, attendee count updates
- [ ] Point of contact shown if available
- [ ] Event image displays if available
- [ ] Back button returns to discover

---

## Event Creation / Editing

- [ ] Create event form accessible (admin/authorized users only)
- [ ] Title, description, date, time fields work
- [ ] Location picker / address input works
- [ ] Category selector (None/Satsang/Bhiksha) works
- [ ] Image upload works
- [ ] Form validation shows errors for required fields
- [ ] Submitting creates the event and redirects
- [ ] Edit mode pre-fills existing event data
- [ ] Saving edits updates the event

---

## Center Detail

- [ ] Center detail loads with name, address, image
- [ ] Map preview shows center location
- [ ] Upcoming events for that center are listed
- [ ] Website and phone displayed if available
- [ ] Point of contact / Acharya shown if available
- [ ] Back button returns to previous screen

---

## Explore Tab

- [ ] Explore tab loads (map or content view)
- [ ] Navigation between tabs works

---

## Profile

- [ ] Profile screen shows user info (name, username)
- [ ] Profile image displays (or default avatar/initials)
- [ ] Edit profile navigates to settings

---

## Settings

### Profile Settings
- [ ] First name and last name can be edited
- [ ] Phone number can be updated
- [ ] Bio/about can be edited
- [ ] Profile image can be changed (camera/gallery)
- [ ] Saving profile updates reflects immediately

### Center Change
- [ ] City/town search finds nearby centers
- [ ] Selecting a new center updates user's center
- [ ] Center name displays correctly after change

### Interest Management
- [ ] Current interests shown
- [ ] Interests can be added/removed
- [ ] Changes persist after saving

### Account
- [ ] Logout button works
- [ ] Delete account flow works with confirmation
- [ ] After deletion, user is logged out

### App Info
- [ ] Dark mode toggle works
- [ ] Theme persists across app restarts
- [ ] Privacy policy link works
- [ ] Terms of service link works
- [ ] Cookie policy link works (web)

---

## Platform-Specific

### iOS Native
- [ ] App launches without crash
- [ ] Safe area insets respected (notch, home indicator)
- [ ] Keyboard avoidance works on all input screens
- [ ] Haptic feedback works where expected
- [ ] Deep links work (if configured)
- [ ] Background-to-foreground transition doesn't lose state

### Mobile Web (Safari / Chrome)
- [ ] Responsive layout at 375px and 414px widths
- [ ] No horizontal scroll overflow
- [ ] Touch targets are at least 44px
- [ ] Keyboard doesn't obscure input fields
- [ ] PWA manifest loads (if added)

### Desktop Web
- [ ] Layout adapts at 768px, 1024px, and 1440px breakpoints
- [ ] Side panel + map layout renders on desktop
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Hover states visible on interactive elements
- [ ] No console errors in browser DevTools

---

## Edge Cases

- [ ] Offline/slow network: app shows loading states, not crashes
- [ ] Empty database: no events/centers shows appropriate empty states
- [ ] Long text: titles and descriptions truncate gracefully
- [ ] Special characters in names/descriptions render correctly
- [ ] Rapid navigation between screens doesn't cause stale data
- [ ] Multiple quick taps on buttons don't trigger duplicate actions
