/**
 * Tailwind Dark Mode Usage Examples for OpenSign
 *
 * This file demonstrates how to use the new Tailwind utilities
 * for better dark mode visibility of buttons and icons.
 */

// Example 1: VS Code-style disabled buttons
const DisabledButtonExamples = () => {
  return (
    <div>
      {/* Option A: Using the VS Code disabled style */}
      <button className="op-btn op-btn-primary op-btn-vscode-disabled" disabled>
        VS Code Style Disabled Button
      </button>

      {/* Option B: Using themed disabled style */}
      <button className="op-btn btn-themed-disabled">
        Themed Disabled Button
      </button>

      {/* Option C: Conditional styling */}
      <button
        className={`op-btn op-btn-primary ${
          isDisabled ? "op-btn-vscode-disabled" : ""
        }`}
        disabled={isDisabled}
      >
        Conditional Button
      </button>
    </div>
  );
};

// Example 2: Icon visibility improvements
const IconExamples = () => {
  return (
    <div>
      {/* Theme-aware icons with better visibility */}
      <i className="fa-light fa-folder icon-improved"></i>
      <i className="fa-light fa-plus icon-muted"></i>
      <i className="fa-light fa-trash icon-disabled"></i>

      {/* Using CSS variables */}
      <i className="fa-light fa-search icon-themed"></i>
      <i className="fa-light fa-settings icon-themed-muted"></i>

      {/* Gray text that automatically improves in dark mode */}
      <span className="text-gray-500">
        This text is now more visible in dark mode
      </span>
      <span className="text-gray-400">Muted but still readable</span>
    </div>
  );
};

// Example 3: Using CSS variables in inline styles
const InlineStyleExamples = () => {
  return (
    <div>
      {/* Using CSS variables directly */}
      <i className="fa-light fa-plus" style={{ color: "var(--icon-color)" }} />

      {/* Using the existing JavaScript function */}
      <i className="fa-light fa-minus" style={{ color: getThemeIconColor() }} />
    </div>
  );
};

// Example 4: Toolbar with improved icons
const ToolbarExample = () => {
  return (
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
};

export {
  DisabledButtonExamples,
  IconExamples,
  InlineStyleExamples,
  ToolbarExample
};
