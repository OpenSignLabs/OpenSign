import RenderWidgets from "./RenderWidgets";
import { useTranslation } from "react-i18next";

const PrefillWidgets = ({ prefills = [], setPrefills, onNext }) => {
  const { t } = useTranslation();

  const handleWidgetDetails = (value, widgetIndex) => {
    setPrefills((prev) => {
      const widgets = [...(prev ?? [])];
      const w = widgets[widgetIndex];
      if (!w) return prev;
      widgets[widgetIndex] = {
        ...w,
        options: { ...w.options, response: value },
        response: value
      };
      return widgets;
    });
  };

  const handleNext = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    onNext?.();
  };
  return (
    <>
      {prefills?.length > 0 && (
        <form
          onSubmit={handleNext}
          className="m-3 md:m-6 text-base-content flex flex-col relative"
        >
          <div className="py-3 px-[10px] op-card border-[1px] border-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 w-full">
              {prefills.map((widget, index) => (
                <RenderWidgets
                  key={widget.key}
                  showLabel
                  widget={widget}
                  handleWidgetDetails={(value) =>
                    handleWidgetDetails(value, index)
                  }
                />
              ))}
            </div>
          </div>

          <div className="flex flex-row flex-wrap mt-3 gap-3 justify-center">
            <button
              type="submit"
              className="op-btn op-btn-primary w-[150px] focus:outline-none"
            >
              {t("next")}
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default PrefillWidgets;
