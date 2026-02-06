export function getPattern(option) {
  const validateType = option?.validation?.type;
  let regexValidation;
  switch (validateType) {
    case 'email':
      regexValidation = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
      return regexValidation;
    case 'number':
      regexValidation = /^[0-9\s]*$/;
      return regexValidation;
    case 'ssn':
      regexValidation = /^(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}$/;
      return regexValidation;
    default:
      regexValidation = option?.validation?.pattern;
      return regexValidation;
  }
}
//function used in getTemplate API to update placeholders options field
export function getWidgetOptions(option, type, role) {
  const isPrefill = role === 'prefill';
  const status = option?.status === 'required' ? true : false;
  const widgetname = option?.name;
  const defaultValue = option?.defaultValue || option?.response || '';

  switch (type) {
    case 'stamp':
      return { required: status, name: widgetname };
    case 'initials':
      return { required: status, name: widgetname };
    case 'image':
      return {
        required: status,
        name: widgetname,
        ...(isPrefill &&
          option?.response && {
            response: option.response,
          }),
      };
    case 'email':
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        hide_text_with_asterisks: option?.isHideText || false,
      };
    case 'name':
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        hide_text_with_asterisks: option?.isHideText || false,
      };
    case 'job title':
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        hide_text_with_asterisks: option?.isHideText || false,
      };
    case 'company':
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        hide_text_with_asterisks: option?.isHideText || false,
      };
    case 'date': {
      const format = option?.validation?.format;
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        format: format || 'mm-dd-yyyy',
        ...(!isPrefill && {
          ...{ min_date: option?.minDate || '' },
          ...{ max_date: option?.maxDate || '' },
          ...(defaultValue !== 'today' && { default: defaultValue }),
          ...(defaultValue === 'today' && { signing_date: true }),
          ...{ readonly: option?.isReadOnly || false },
        }),
        ...(isPrefill &&
          option?.response && {
            response: option.response,
          }),
      };
    }
    case 'text input':
    case 'text':
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        ...(!isPrefill && {
          ...{ hint: option?.hint || '' },
          ...{ hide_text_with_asterisks: option?.isHideText || false },
          ...(defaultValue && { default: defaultValue }),
          ...{ regularexpression: getPattern(option) },
          ...{ readonly: option?.isReadOnly || false },
        }),
        ...(isPrefill &&
          option?.response && {
            response: option.response,
          }),
      };
    case 'checkbox': {
      const optionsArr = option?.values || [];
      // defaultValue = index numbers e.g. [0, 1]
      let selectedvalues =
        Array.isArray(defaultValue) && defaultValue.length > 0 ? defaultValue : [];

      // convert index numbers back to actual values
      let getSelectedValue = [];

      if (selectedvalues.length > 0) {
        for (const index of selectedvalues) {
          if (optionsArr[index] !== undefined) {
            getSelectedValue.push(optionsArr[index]);
          }
        }
      }
      return {
        required: status,
        name: widgetname,
        values: optionsArr,
        ...(!isPrefill && {
          ...(getSelectedValue && { selectedvalues: getSelectedValue || [] }),
          ...{
            validation: {
              minselections: option?.validation?.minRequiredCount || 0,
              maxselections: option?.validation?.maxRequiredCount || 0,
            },
          },
          ...{ readonly: option?.isReadOnly || false },
        }),
        hidelabel: option?.isHideLabel || false,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        layout: option?.layout || 'vertical',
        ...(isPrefill &&
          getSelectedValue && {
            response: getSelectedValue,
          }),
      };
    }
    case 'radio button': {
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        layout: option?.layout || 'vertical',
        values: option?.values || [],
        ...(!isPrefill && {
          ...{ default: defaultValue || '' },
          ...{ readonly: option?.isReadOnly || false },
        }),
        ...(isPrefill && {
          ...{ response: defaultValue },
        }),
      };
    }
    case 'dropdown':
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        ...(!isPrefill && {
          ...{ default: defaultValue || '' },
          ...{ readonly: option?.isReadOnly || false },
        }),
        values: option?.values || [],
        ...(isPrefill &&
          defaultValue && {
            response: defaultValue,
          }),
      };
    case 'number':
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        readonly: option?.isReadOnly || false,
        default: defaultValue || '',
        hint: option?.hint || '',
        formula: option?.formula || '',
        decimalplaces: option?.decimalPlaces || 0,
        hide_text_with_asterisks: option?.isHideText || false,
      };
    case 'cells':
      return {
        required: status,
        name: widgetname,
        color: option?.fontColor || 'black',
        fontSize: option?.fontSize || 12,
        hide_text_with_asterisks: option?.isHideText || false,
        readonly: option?.isReadOnly || false,
        default: defaultValue || '',
        hint: option?.hint || '',
        cell_count: option?.cellCount || 0,
        regularexpression: getPattern(option),
      };
    default:
      break;
  }
}
