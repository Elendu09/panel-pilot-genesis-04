

# Panel Mobile Support Enhancement Plan

## Current State Analysis

### 1. Mobile FAB (Floating Action Button)
**Location:** `src/pages/PanelOwnerDashboard.tsx` (lines 147-151)
- Current FAB items: Add Provider, Add Customer, Analytics
- The FAB expands into a menu with quick actions

**Bottom Navigation:** (lines 139-145)
- Home, Customers, Services (center), Orders, More
- Support is NOT directly accessible from mobile bottom nav

### 2. Support Center (`src/pages/panel/SupportCenter.tsx`)
**Current Features:**
- 4 tabs: Knowledge Base, Live Chat, Customer Tickets, Platform Support
- **Customer Tickets tab**: Shows tickets from buyers (type: `user_to_panel`) - This is where panel owners respond to buyer tickets
- **Live Chat tab**: Embedded `ChatInbox` component for real-time chat
- **Platform Support tab**: Panel owner tickets to platform admin

**Mobile Issues:**
- Page layout uses `lg:grid-cols-3` which stacks on mobile but lacks proper mobile optimization
- Chat sessions list (`w-96`) is not responsive
- No mobile-specific UI for ticket conversation view

### 3. Tenant User Live Chat Flow
**Current Architecture:**
| Component | Purpose |
|-----------|---------|
| `FloatingChatWidget.tsx` | AI-powered chat + social links (WhatsApp, Telegram, etc.) |
| `LiveChatWidget.tsx` | Real-time live chat with panel owner |
| `ChatInbox.tsx` | Panel owner's inbox to respond to live chats |

**The Flow:**
1. Buyer opens `FloatingChatWidget` on storefront
2. AI chat provides instant help
3. For human support, buyer can:
   - Use social links (WhatsApp, Telegram) if configured
   - Create support ticket via `BuyerSupport.tsx`
   - Use `LiveChatWidget` (if integrated separately)

**Gap Identified:** The `FloatingChatWidget` (AI chat) is separate from `LiveChatWidget` (human chat). Currently, buyers primarily interact via AI or create tickets.

### 4. Ticket System Architecture
```
BUYER creates ticket (BuyerSupport.tsx)
  ↓
ticket_type = 'user_to_panel'
  ↓
PANEL OWNER sees it in SupportCenter.tsx > "Customer Tickets" tab
  ↓
Panel owner replies, buyer sees reply in BuyerSupport.tsx
```

---

## Implementation Plan

### Part 1: Replace FAB with Support Quick Access

**Goal:** Replace the current FAB menu with a single Support button that directly navigates to the Support page.

**File:** `src/pages/PanelOwnerDashboard.tsx`

**Changes:**
1. Update `panelFabItems` to include Support as a quick action OR
2. Replace FAB entirely with a floating Support button
3. Add Support icon (HeadphonesIcon) that navigates to `/panel/support`

**Implementation Approach:**
- Keep the BottomNav but modify the FAB to show a Support icon instead of the Plus menu
- Single tap navigates directly to Support page
- This provides faster access to customer inquiries on mobile

### Part 2: Mobile-Responsive Support Center

**File:** `src/pages/panel/SupportCenter.tsx`

**Changes:**

1. **Header Enhancement:**
   - Make page header responsive with proper spacing on mobile
   - Stack title and description vertically on small screens

2. **Tabs Responsiveness:**
   - Already has `text-xs sm:text-sm` but needs horizontal scroll on very small screens
   - Add `overflow-x-auto` for tabs on mobile

3. **Knowledge Base Tab:**
   - Already uses `KnowledgeBase` component - verify responsiveness

4. **Live Chat Tab (ChatInbox):**
   - Current: Fixed `w-96` for sessions list
   - Change to: Full-width on mobile with slide-over pattern for chat detail
   - Mobile view: Show session list first, tap to open conversation in drawer/sheet
   - Use Sheet component for conversation view on mobile

5. **Customer Tickets Tab:**
   - Current: 2-column layout (1:2 ratio)
   - Mobile: Stack vertically, use sheet for ticket details
   - Add mobile ticket card component with swipe actions

6. **Platform Support Tab:**
   - Same treatment as Customer Tickets

**New Mobile UX Pattern:**
```
Mobile View:
┌─────────────────────────────┐
│ Support Center        [+]  │
│ ─────────────────────────── │
│ [KB] [Chat] [Tickets] [Help]│
├─────────────────────────────┤
│                             │
│  Ticket List (scrollable)   │
│  ┌───────────────────────┐  │
│  │ Ticket Card           │  │
│  │ Subject • Status      │  │
│  │ Last message preview  │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Ticket Card           │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘

Tap Ticket → Sheet slides up:
┌─────────────────────────────┐
│ ← Back    Ticket Details    │
├─────────────────────────────┤
│                             │
│  Message Thread             │
│  (scrollable)               │
│                             │
├─────────────────────────────┤
│ [Reply input...] [Send]     │
└─────────────────────────────┘
```

### Part 3: Enhance Live Chat for Tenants

**Current State:**
- `FloatingChatWidget` provides AI chat
- `LiveChatWidget` is a separate component for human chat
- Not well integrated

**Solution Options:**

**Option A (Recommended): Enhance FloatingChatWidget**
- Add a "Talk to Human" button in the AI chat
- When clicked, seamlessly transition to `LiveChatWidget` functionality
- All in one widget - no separate components needed
- Panel owner responds via `ChatInbox`

**Option B: Keep Separate Widgets**
- Keep AI chat as is
- Add LiveChatWidget as a separate FAB (confusing for users)

**Implementation for Option A:**
1. Add "Connect with Support" option in FloatingChatWidget
2. When selected, switch from AI mode to live chat mode
3. Create chat session in `chat_sessions` table
4. Messages go to `chat_messages` table
5. Panel owner sees and responds in `ChatInbox`

**File Changes:**
- `src/components/storefront/FloatingChatWidget.tsx`: Add human escalation feature
- This connects the AI chat to the live chat system

### Part 4: ChatInbox Mobile Enhancement

**File:** `src/pages/panel/ChatInbox.tsx`

**Current Issues:**
- Fixed `w-96` sessions list (not responsive)
- `h-[calc(100vh-120px)]` - doesn't account for mobile navigation
- Two-column layout always shown

**Changes:**
1. **Session List:**
   - Mobile: Full width, collapsible when session selected
   - Desktop: Keep current layout

2. **Message Area:**
   - Mobile: Use Sheet component that slides up
   - Full-screen conversation view on mobile
   - Back button to return to list

3. **Bottom Safe Area:**
   - Account for mobile bottom nav with `pb-20` on mobile

4. **Responsive Layout:**
   ```
   Mobile: Single column with slide-over
   Tablet: Side-by-side with narrower list
   Desktop: Current layout
   ```

### Part 5: Clarification for User Questions

**Q: Where do tenant tickets appear for panel owner?**
**A:** In `SupportCenter.tsx` under the "Customer Tickets" tab. All tickets with `ticket_type: 'user_to_panel'` appear here.

**Q: How do tenants live chat with panel owner?**
**A:** Currently via:
1. `LiveChatWidget` (if added to storefront) → messages go to `chat_sessions` → panel owner responds in `ChatInbox`
2. OR via support tickets in `BuyerSupport` → appears in Customer Tickets tab

The FloatingChatWidget currently only supports AI chat. The plan above (Part 3) will add human escalation.

---

## Summary of File Changes

| File | Changes |
|------|---------|
| `src/pages/PanelOwnerDashboard.tsx` | Replace FAB menu with single Support button |
| `src/pages/panel/SupportCenter.tsx` | Complete mobile responsiveness overhaul |
| `src/pages/panel/ChatInbox.tsx` | Mobile-responsive layout with sheet patterns |
| `src/components/storefront/FloatingChatWidget.tsx` | Add "Talk to Human" escalation to connect with live chat |
| `src/components/ui/bottom-nav.tsx` | No changes needed |

---

## Technical Implementation Details

### FAB Replacement Code
```typescript
// Replace current panelFabItems with direct navigation
<motion.button
  onClick={() => navigate('/panel/support')}
  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600"
  aria-label="Support Center"
>
  <HeadphonesIcon className="w-5 h-5" />
</motion.button>
```

### Mobile Support Center Pattern
- Use `isMobile` hook to detect viewport
- Show Sheet component for detail views on mobile
- Maintain current grid layout for desktop
- Add proper padding for bottom nav safe area

### Live Chat Integration
- Add button in AI chat: "Need human help?"
- On click, create `chat_session` and switch UI mode
- Panel owner receives notification via existing system
- Messages flow through `chat_messages` table with realtime subscription

