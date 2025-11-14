# Editor Hotkey System

## Overview

The editor uses a declarative hotkey management system that provides:
- **Type-safe** hotkey configuration
- **Centralized** hotkey definitions
- **Easy extension** for new features
- **Automatic** event handling and cleanup

## Architecture

```
src/
├── shared/lib/hotkeys/          # Core hotkey infrastructure
│   ├── types.ts                  # Type definitions
│   ├── utils.ts                  # Utility functions
│   ├── useHotkeys.ts             # React hooks
│   └── index.ts                  # Public API
│
└── features/editor/
    ├── config/hotkeys.ts         # Hotkey definitions
    └── hooks/useEditorHotkeys.ts # Editor hotkey integration
```

## Usage

### 1. Define Hotkey Configurations

Hotkeys are defined in categories in [config/hotkeys.ts](./config/hotkeys.ts):

```typescript
export const PLAYBACK_HOTKEYS: HotkeyCategory = {
  name: 'Playback',
  bindings: {
    togglePlayback: {
      key: ' ',
      description: 'Play/pause playback',
      preventDefault: true,
    },
    jumpBackward: {
      key: 'ArrowLeft',
      description: 'Jump backward 5 seconds',
      preventDefault: true,
    },
  },
}
```

### 2. Implement Handlers

Implement handlers in [hooks/useEditorHotkeys.ts](./hooks/useEditorHotkeys.ts):

```typescript
export function useEditorHotkeys({ togglePlayback, ... }: EditorHotkeysOptions) {
  const handleJumpBackward = useCallback(() => {
    setPlayhead(Math.max(0, playhead - JUMP_TIME))
  }, [playhead, setPlayhead])

  useHotkeys([
    {
      config: PLAYBACK_HOTKEYS.bindings.togglePlayback,
      handler: togglePlayback,
    },
    {
      config: PLAYBACK_HOTKEYS.bindings.jumpBackward,
      handler: handleJumpBackward,
    },
  ])
}
```

### 3. Register in Component

Use the hook in your component:

```typescript
export function AudioTrackWorkspace({ segments, duration }: Props) {
  const { togglePlayback, playhead, setPlayhead } = useAudioTimeline(...)

  // Register hotkeys
  useEditorHotkeys({
    playhead,
    setPlayhead,
    duration,
    togglePlayback,
  })

  return <div>...</div>
}
```

## Adding New Hotkeys

### Step 1: Add Configuration

In [config/hotkeys.ts](./config/hotkeys.ts), add to existing category or create new one:

```typescript
export const SEGMENT_HOTKEYS: HotkeyCategory = {
  name: 'Segment Editing',
  bindings: {
    splitSegment: {
      key: 's',
      modifiers: ['ctrl'],
      description: 'Split segment at playhead',
      preventDefault: true,
    },
  },
}
```

### Step 2: Implement Handler

In [hooks/useEditorHotkeys.ts](./hooks/useEditorHotkeys.ts):

```typescript
export function useEditorHotkeys({ ... }: EditorHotkeysOptions) {
  const handleSplitSegment = useCallback(() => {
    // Implementation
  }, [dependencies])

  useHotkeys([
    // ... existing hotkeys
    {
      config: SEGMENT_HOTKEYS.bindings.splitSegment,
      handler: handleSplitSegment,
    },
  ])
}
```

### Step 3: Add Dependencies

Update `EditorHotkeysOptions` type if needed:

```typescript
type EditorHotkeysOptions = {
  // ... existing options
  splitSegmentAtPlayhead: () => void  // Add new dependency
}
```

## Configuration Options

### HotkeyConfig

```typescript
type HotkeyConfig = {
  key: string                  // Primary key (e.g., ' ', 'a', 'ArrowLeft')
  modifiers?: Modifier[]       // ['ctrl', 'shift', 'alt', 'meta']
  description: string          // Human-readable description
  allowInInput?: boolean       // Allow when input is focused (default: false)
  preventDefault?: boolean     // Prevent default behavior (default: true)
  stopPropagation?: boolean    // Stop event propagation (default: false)
}
```

### Key Examples

- Single characters: `'a'`, `'s'`, `'z'`
- Special keys: `' '` (space), `'Enter'`, `'Escape'`, `'Delete'`
- Arrow keys: `'ArrowLeft'`, `'ArrowRight'`, `'ArrowUp'`, `'ArrowDown'`
- Navigation: `'Home'`, `'End'`, `'PageUp'`, `'PageDown'`
- Symbols: `'='`, `'-'`, `'['`, `']'`

## Current Hotkeys

### Playback
- **Space**: Play/pause
- **←**: Jump backward 5s
- **→**: Jump forward 5s
- **Home**: Jump to start
- **End**: Jump to end

### Timeline
- **Ctrl+=**: Zoom in
- **Ctrl+-**: Zoom out
- **Ctrl+0**: Reset zoom

### Segment Editing (Planned)
- **Ctrl+S**: Split segment
- **Delete**: Delete segment
- **↓**: Next segment
- **↑**: Previous segment

## Best Practices

1. **Centralize Definitions**: Always define hotkeys in `config/hotkeys.ts`
2. **Categorize**: Group related hotkeys together
3. **Use useCallback**: Wrap handlers in `useCallback` for performance
4. **Document**: Update this README when adding new hotkeys
5. **Prevent Defaults**: Set `preventDefault: true` to avoid browser shortcuts
6. **Test Input Fields**: Consider `allowInInput` for text editing contexts

## Advanced Usage

### Conditional Hotkeys

```typescript
useHotkeys(bindings, enabled)  // Enable/disable dynamically
```

### Single Hotkey

```typescript
useHotkey(
  { key: ' ', description: 'Play/pause' },
  togglePlayback
)
```

### Custom Context

For component-specific hotkeys not in the editor scope:

```typescript
import { useHotkey } from '@/shared/lib/hotkeys'

function MyComponent() {
  useHotkey(
    { key: 'Escape', description: 'Close modal' },
    closeModal
  )
}
```
