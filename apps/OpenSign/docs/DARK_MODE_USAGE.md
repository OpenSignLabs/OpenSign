# Tailwind Dark Mode Usage Guide

## Overview
This guide shows how to use the new Tailwind utilities for better dark mode visibility in OpenSign.

## Button Styling

### VS Code-style Disabled Buttons
```jsx
// Option 1: Direct VS Code styling
<button className="op-btn op-btn-primary op-btn-vscode-disabled" disabled>
  Disabled Button
</button>

// Option 2: Themed disabled styling
<button className="op-btn btn-themed-disabled">
  Themed Button
</button>

// Option 3: Conditional styling
<button 
  className={`op-btn op-btn-primary ${isDisabled ? 'op-btn-vscode-disabled' : ''}`}
  disabled={isDisabled}
>
  Dynamic Button
</button>
```

## Icon Styling

### Theme-aware Icons
```jsx
// Better visibility in dark mode
<i className="fa-light fa-folder icon-improved"></i>

// Muted but still visible
<i className="fa-light fa-plus icon-muted"></i>

// Disabled state
<i className="fa-light fa-trash icon-disabled"></i>
```

### CSS Variable Approach
```jsx
// Using CSS variables
<i className="fa-light fa-search icon-themed"></i>
<i className="fa-light fa-settings icon-themed-muted"></i>

// Inline styles with CSS variables
<i 
  className="fa-light fa-plus"
  style={{ color: 'var(--icon-color)' }}
/>
```

### Legacy JavaScript Function (Still Supported)
```jsx
// Existing approach - still works
<i 
  className="fa-light fa-plus"
  style={{ color: getThemeIconColor() }}
/>
```

## Text Styling

### Improved Gray Text
```jsx
// These automatically improve in dark mode
<span className="text-gray-500">More visible in dark mode</span>
<span className="text-gray-400">Muted but readable</span>
<span className="text-gray-600">Clear text</span>
```

## Complete Examples

### Toolbar with Better Visibility
```jsx
const Toolbar = () => (
  <div className="flex space-x-2 p-2">
    <button className="p-2 hover:bg-gray-200 rounded">
      <i className="fa-light fa-plus icon-improved"></i>
    </button>
    <button className="p-2 hover:bg-gray-200 rounded" disabled>
      <i className="fa-light fa-trash icon-disabled"></i>
    </button>
    <button className="p-2 hover:bg-gray-200 rounded">
      <i className="fa-light fa-edit icon-improved"></i>
    </button>
  </div>
);
```

### Form with Disabled States
```jsx
const Form = ({ isSubmitting }) => (
  <form>
    <input className="op-input" />
    <button 
      className={`op-btn op-btn-primary ${isSubmitting ? 'op-btn-vscode-disabled' : ''}`}
      disabled={isSubmitting}
    >
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </button>
  </form>
);
```

## React-Tour and Tooltip Dark Mode Support

### React-Tour Modals
The react-tour modals now automatically support dark mode with VS Code-inspired styling:

```jsx
// These components automatically get dark mode styling
<Tour
  onRequestClose={closeTour}
  steps={tourConfig}
  isOpen={isOpen}
  rounded={5}
/>
```

### ReactTooltip Components
All ReactTooltip instances now support dark mode:

```jsx
// Automatically styled for dark mode
<ReactTooltip id="my-tooltip" className="z-[999]">
  <div className="max-w-[200px]">
    <p>Tooltip content</p>
  </div>
</ReactTooltip>
```

### HoverCard Balloon UI
The balloon tooltips in OpenSign Drive now properly support dark mode:

```jsx
// These automatically get dark styling in dark mode
<HoverCard>
  <HoverCardContent>
    Document information
  </HoverCardContent>
</HoverCard>
```

## Dark Mode Features Added

### 1. **React-Tour Modal Styling**
- Background: `#1F2937` (VS Code modal background)
- Text: `#E5E7EB` (soft white for readability)
- Borders: `#374151` (subtle borders)
- Buttons: VS Code-style primary/secondary buttons

### 2. **ReactTooltip Styling**
- Background: `#1F2937` with proper contrast
- Border: `#374151` for definition
- Box shadow: Enhanced for dark backgrounds
- Text: `#E5E7EB` for optimal readability

### 3. **HoverCard Balloon UI**
- Background: `#1F2937` (matches VS Code)
- Text: `#E5E7EB` for readability
- Arrow: Automatically matches background color
- Enhanced shadows for dark backgrounds

### 4. **React-Datepicker Support**
- Calendar background: `#1F2937`
- Selected dates: VS Code blue (`#007ACC`)
- Hover states: Proper contrast ratios
- Navigation arrows: Themed appropriately

## CSS Classes Reference

| Class | Purpose | Dark Mode Color |
|-------|---------|----------------|
| `icon-improved` | Better icon visibility | `#CCCCCC` |
| `icon-muted` | Muted but visible icons | `#999999` |
| `icon-disabled` | Disabled icon state | `#858585` |
| `op-btn-vscode-disabled` | VS Code disabled button | Background: `#3C3C3C` |
| `btn-themed-disabled` | Themed disabled button | Uses CSS variables |
| `icon-themed` | Variable-based icon color | `var(--icon-color)` |
| `.reactour__helper` | `#1F2937` background |
| `.react-tooltip` | `#1F2937` background |
| `.HoverCardContent` | `#1F2937` background |
| `.react-datepicker` | `#1F2937` background |

## Migration Guide

### From JavaScript Function to Tailwind
```jsx
// Before
<i style={{ color: getThemeIconColor() }} className="fa-light fa-plus" />

// After
<i className="fa-light fa-plus icon-improved" />
```

### From Hardcoded Colors to Theme-aware
```jsx
// Before
<i className="fa-light fa-plus text-gray-500" />

// After (automatic improvement)
<i className="fa-light fa-plus text-gray-500" />
// OR explicitly
<i className="fa-light fa-plus icon-improved" />
```

## Migration Notes

All existing tooltip and tour components will automatically inherit the new dark mode styling when the theme is set to `opensigndark`. No code changes required for existing implementations.
