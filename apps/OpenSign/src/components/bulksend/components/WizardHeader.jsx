/* ---------------- Wizard Header ---------------- */

import React from "react";

function WizardHeader({ steps, step, onStepClick }) {
  return (
    <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-0 md:gap-2">
      {steps.map((s, i) => {
        const isActive = i === step;
        const isDone = i < step;

        return (
          <React.Fragment key={s.key}>
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              className={[
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs lg:text-sm font-medium border focus:outline-none",
                isActive
                  ? "op-bg-primary text-primary-content border-primary"
                  : isDone
                    ? "bg-base-100 text-base-content border-base-300 hover:bg-base-200"
                    : "bg-base-100 text-base-content/70 border-base-300"
              ].join(" ")}
              title={s.label}
            >
              <span
                className={[
                  "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                  isActive
                    ? "op-bg-primary-content/15 text-primary-content"
                    : isDone
                      ? "bg-base-200 text-base-content"
                      : "bg-base-200 text-base-content/70"
                ].join(" ")}
              >
                {i + 1}
              </span>

              <span className="whitespace-nowrap">{s.label}</span>

              {/* info icon like screenshot */}
              <a data-tooltip-id={`${s.key}-tooltip`} className="ml-1">
                <span
                  className={[
                    "inline-flex h-[1.10rem] w-[1.10rem] items-center justify-center border-[1px] rounded-full",
                    !isActive
                      ? "border-[#33bbff] text-[#33bbff]"
                      : "border border-base-300 text-base-300"
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <i className="fa-light fa-question rounded-full text-[13px]"></i>
                </span>
              </a>
              <span className="text-left">{s.help}</span>
            </button>

            {i < steps.length - 1 && (
              <span
                className="mx-1 select-none text-base-content/40 text-center text-2xl md:mb-2 rotate-90 md:rotate-0"
                aria-hidden="true"
              >
                &#8250;
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default WizardHeader;
