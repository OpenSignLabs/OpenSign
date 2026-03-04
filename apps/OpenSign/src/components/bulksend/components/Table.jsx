import {
  useState
} from "react";
import { useTranslation } from "react-i18next";
import SuggestionInput from "../../shared/fields/SuggestionInput";
import RenderWidgets from "./RenderWidgets";

const requiredAsteriskCls = (isRequired = false) => {
  return isRequired ? "after:content-['_*'] after:text-red-500" : "";
};
const Table = ({
  headers = [],
  rowData = [],
  handleInputChange,
  handleWidgetDetails,
  initialPerPage = 25,
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = rowData.slice(startIndex, endIndex);


  return (
    <div className="w-full">

      {/* Table */}
      <div
        className="overflow-x-auto border border-gray-300 rounded-lg"
      >
        <table className="op-table border-collapse w-full">
          <thead className="text-[13px] text-center">
            <tr className="border-y-[1px]">
              {headers?.map((header) => (
                <th
                  key={header.label}
                  className={`${requiredAsteriskCls(header?.isRequired)} p-2`}
                >
                  {header.label}
                </th>
              ))}
              {rowData.length > 1 && <th className="p-2">{t("action")}</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 &&
              currentData.map((form, formIndex) => {
                const globalIndex = startIndex + formIndex;
                const fields = form?.fields ?? [];

                const emailFields = fields.filter((f) => f.label !== "prefill");

                const widgets = fields.flatMap((f, fieldIndex) =>
                  (f.widgets ?? []).map((widget, widgetIndex) => ({
                    widget,
                    fieldIndex, // keep the fieldIndex that produced this widget
                    widgetIndex
                  }))
                );
                return (
                  <tr key={form.Id} id={`table-row-${formIndex}`}>
                    {emailFields.map((field, fieldIndex) => (
                      <td key={field.fieldId} className="p-2">
                        <SuggestionInput
                          required
                          type="email"
                          value={field.email ?? ""}
                          index={fieldIndex}
                          onChange={(signer) =>
                            handleInputChange(globalIndex, signer, field.label)
                          }
                        />
                      </td>
                    ))}

                    {widgets.map(({ widget, fieldIndex, widgetIndex }) => (
                      <td key={`${form.Id}-${widget.key}`} className="p-2">
                        <RenderWidgets
                          widget={widget}
                          handleWidgetDetails={(value) =>
                            handleWidgetDetails(
                              value,
                              globalIndex, // formIndex,
                              fieldIndex,
                              widgetIndex
                            )
                          }
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Table;
