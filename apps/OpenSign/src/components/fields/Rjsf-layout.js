import React from "react";
import ObjectField from "@rjsf/core/lib/components/fields/ObjectField";
import validator from "@rjsf/validator-ajv8";
import { Col } from "react-bootstrap";
import { retrieveSchema } from "@rjsf/utils";

class GridField extends ObjectField {
  state = {};
  render() {
    const {
      uiSchema,
      errorSchema,
      idSchema,

      disabled,
      readonly,
      onBlur,
      formData
    } = this.props;
    const { fields, rootSchema } = this.props.registry;

    const { SchemaField } = fields;
    const schema = retrieveSchema(validator, this.props.schema, rootSchema);
    const title = schema.title === undefined ? "" : schema.title;
    const description =
      schema && schema.description === undefined ? "" : schema.description;
    // console.log('this.props.schema ', this.props.schema)
    // console.log("schema ", schema);
    const layout = uiSchema["ui:layout"];

    return (
      <fieldset>
        {title ? <h4>{title}</h4> : null}
        {description ? <h6>{description}</h6> : null}
        {layout.map((row, index) => {
          return (
            <div className="row" key={index}>
              {Object.keys(row).map((name, index) => {
                const { doShow, ...rowProps } = row[name];
                let style = {};
                if (doShow && !doShow({ formData })) {
                  style = { display: "none" };
                }
                if (schema.properties[name]) {
                  return (
                    <Col {...rowProps} key={index} style={style}>
                      <SchemaField
                        name={name}
                        required={this.isRequired(name)}
                        schema={schema.properties[name]}
                        uiSchema={uiSchema[name]}
                        errorSchema={errorSchema[name]}
                        idSchema={idSchema[name]}
                        formData={formData[name]}
                        onChange={this.onPropertyChange(name)}
                        onBlur={onBlur}
                        registry={this.props.registry}
                        disabled={disabled}
                        readonly={readonly}
                      />
                    </Col>
                  );
                } else {
                  const { render, ...rowProps } = row[name];
                  let UIComponent = () => null;

                  if (render) {
                    UIComponent = render;
                  }

                  return (
                    <Col {...rowProps} key={index} style={style}>
                      <UIComponent
                        name={name}
                        formData={formData}
                        errorSchema={errorSchema}
                        uiSchema={uiSchema}
                        schema={schema}
                        registry={this.props.registry}
                      />
                    </Col>
                  );
                }
              })}
            </div>
          );
        })}
      </fieldset>
    );
  }
}
export default GridField;
