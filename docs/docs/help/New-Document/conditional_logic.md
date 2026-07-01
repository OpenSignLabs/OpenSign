---
sidebar_position: 6
title: Conditional logic
---
# Conditional Logic
The **Conditional Logic** feature in OpenSign allows widgets to dynamically change their behavior based on the values entered or selections made in other widgets while a signer is signing a document.

Instead of displaying every field at once, Conditional Logic helps you create intelligent, interactive forms by showing, hiding, or changing the requirements of fields only when specific conditions are met. This simplifies the signing experience by displaying only the fields that are relevant to the signer.

---

## What Can Conditional Logic Do?

<img width="723"  alt="conditional_logic_Actions" src="https://github.com/user-attachments/assets/219adc48-65e9-48f5-ab1b-a2e870491660" />

Using Conditional Logic, you can configure a widget to perform one of the following actions:

### Show this Field

Displays the target widget only when the configured condition is met.

**Example**

If the signer selects **Employee** from a Dropdown field, an **Employee ID** field can be displayed automatically.

---

### Hide this Field

Hides the target widget when the configured condition is met.

**Example**

If the signer selects **No** for "Do you have a secondary address?", the **Secondary Address** fields can be hidden.

---

### Make Required

Makes the target widget mandatory when the configured condition is met. The signer must complete the field before they can finish signing the document.

**Example**

If the signer selects **Yes** for "Are you currently employed?", the **Employer Name** field becomes required.

---

### Make Optional

Makes the target widget optional when the configured condition is met. The signer can complete the document without filling in that field.

**Example**

If the signer selects **No** for "Do you have previous work experience?", the **Previous Employer** field becomes optional.

---

## Benefits of Conditional Logic

Conditional Logic helps you build dynamic and user-friendly documents by:

- Displaying only relevant fields to the signer.
- Reducing unnecessary data entry.
- Creating interactive forms without requiring multiple document templates.
- Simplifying complex workflows.
- Improving the signing experience.
- Ensuring required information is collected only when applicable.

---

## Text Input Widget - Conditional Logic

The **Text Input** widget in OpenSign supports **Conditional Logic**, allowing you to dynamically control its behavior based on values entered or selected in other widgets.

<img width="1469" alt="textinput condtional logic" src="https://github.com/user-attachments/assets/919846c6-5cf7-4ce6-83b7-cf19e618d8f3" />

Using Conditional Logic, you can configure the Text Input widget to:

- Show the field
- Hide the field
- Make the field required
- Make the field optional

Conditional Logic helps create dynamic documents by displaying only the fields that are relevant to the signer based on their responses.

---

# Supported Trigger Widgets

The Text Input widget supports the following trigger widgets:

| Trigger Widget | Supported Operators |
|----------------|---------------------|
| Text Input | Equals, Does Not Equal |
| Number | Equals, Does Not Equal |
| Dropdown | Equals, Does Not Equal |
| Checkbox | Is Checked, Is Not Checked, Equals, Does Not Equal |
| Radio Button | Is Checked, Is Not Checked, Equals, Does Not Equal |

---

# Supported Actions

The following actions can be applied to a Text Input widget.

| Action | Description |
|---------|-------------|
| **Show this field** | Displays the Text Input field when the configured conditions are met. |
| **Hide this field** | Hides the Text Input field when the configured conditions are met. |
| **Make Required** | Makes the Text Input field mandatory when the configured conditions are met. |
| **Make Optional** | Makes the Text Input field optional when the configured conditions are met. |

---

# Condition Types

When multiple rules are configured, OpenSign allows you to choose how those rules are evaluated.

## All Conditions (AND)

All configured conditions must be satisfied before the selected action is executed.

### Example

```text
Number = 10

AND

Dropdown = HR

AND

Checkbox is Checked
```

**Result**

The configured action is executed only when **all three conditions** are satisfied.

---

## Any Condition (OR)

The configured action is executed when **at least one** configured condition is satisfied.

### Example

```text
Number = 10

OR

Dropdown = HR

OR

Checkbox is Checked
```

**Result**

If any one of the configured conditions is true, the selected action is performed.

---

## Text Input as the Trigger Widget

The Text Input widget can control another Text Input widget.

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Show this field |

**Result**

When the signer enters **HR**, the configured Text Input field is displayed.

---

### Show this Field (Does Not Equal)

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Does Not Equal |
| Value | HR |
| Action | Show this field |

**Result**

The Text Input field is displayed whenever the entered value is anything other than **HR**.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Hide this field |

**Result**

When the signer enters **HR**, the configured Text Input field is hidden.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Required |

**Result**

The Text Input field becomes mandatory when the signer enters **HR**.

---

## Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Optional |

**Result**

The Text Input field becomes optional when the signer enters **HR**.

---

## Number Widget as the Trigger

The Number widget controls the Text Input widget using numeric values.

### Supported Operators

- Equals
- Does Not Equal

---

### Show the Text Input Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 5 |
| Action | Show this field |

**Result**

When the signer enters **5** in the Number widget, the configured Text Input field is displayed.

---

### Show this Field (Does Not Equal)

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Does Not Equal |
| Value | 5 |
| Action | Show this field |

**Result**

The Text Input field is displayed whenever the entered number is **not equal to 5**.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 5 |
| Action | Hide this field |

**Result**

When the signer enters **5**, the configured Text Input field is hidden.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 5 |
| Action | Make Required |

**Result**

The Text Input field becomes mandatory only when the Number widget contains **5**.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 5 |
| Action | Make Optional |

**Result**

The Text Input field becomes optional when the Number widget contains **5**.

---

## Dropdown Widget as the Trigger

The Dropdown widget controls the Text Input widget based on the selected option.

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | HR |
| Action | Show this field |

**Result**

Selecting **HR** displays the configured Text Input field.

---

### Show this Field (Does Not Equal)

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Does Not Equal |
| Value | HR |
| Action | Show this field |

**Result**

The Text Input field is displayed whenever the selected value is not **HR**.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | HR |
| Action | Hide this field |

**Result**

Selecting **HR** hides the configured Text Input field.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | HR |
| Action | Make Required |

**Result**

The Text Input field becomes mandatory when **HR** is selected.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | HR |
| Action | Make Optional |

**Result**

The Text Input field becomes optional when **HR** is selected.

---

## Checkbox Widget as the Trigger

Checkbox widgets support two conditions.

- Is Checked
- Is Not Checked

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Show this field |

**Result**

The Text Input field becomes visible when the checkbox is selected.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Hide this field |

**Result**

Selecting the checkbox hides the configured Text Input field.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Required |

**Result**

The Text Input field becomes mandatory whenever the checkbox is checked.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Optional |

**Result**

The Text Input field becomes optional whenever the checkbox is checked.

---

### Is Not Checked

The same actions can also be configured using the **Is Not Checked** condition.

### Example

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Not Checked |
| Action | Show this field |

**Result**

The Text Input field is displayed while the checkbox remains unchecked.

---

## Radio Button as the Trigger

Radio Button widgets support the following operators:

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Manager |
| Action | Show this field |

**Result**

The Text Input field becomes visible when the signer selects **Manager**.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Manager |
| Action | Hide this field |

**Result**

Selecting **Manager** hides the configured Text Input field.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Manager |
| Action | Make Required |

**Result**

The Text Input field becomes mandatory when **Manager** is selected.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Manager |
| Action | Make Optional |

**Result**

The Text Input field becomes optional when **Manager** is selected.

---

### Multiple Conditions

You can configure multiple conditions for a single Text Input widget.

### All Conditions (AND)

```text
Number = 10

AND

Dropdown = HR

AND

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Text Input field is displayed only when **all configured conditions** are satisfied.

---

### Any Condition (OR)

```text
Number = 10

OR

Dropdown = HR

OR

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Text Input field is displayed when **any one** of the configured conditions is satisfied.

---

### Best Practices

- Use descriptive widget names to make Conditional Logic easier to understand.
- Use **All Conditions** when every condition must be satisfied.
- Use **Any Condition** when any one condition should trigger the action.
- Test all Conditional Logic rules before sending the document.
- Avoid creating conflicting rules for the same widget.
- Keep your conditions simple and easy to maintain.

---

### Notes

- Conditional Logic is evaluated dynamically while the signer completes the document.
- Changes to trigger widget values immediately update the behavior of the Text Input widget.
- A Text Input widget can be both a **trigger widget** and a **target widget**.
- Multiple Conditional Logic rules can be configured for a single Text Input widget.

## Number Widget - Conditional Logic

The **Number** widget in OpenSign supports **Conditional Logic**, allowing you to dynamically control its behavior or the behavior of other widgets based on numeric values entered by the signer.

Using Conditional Logic, you can configure the Number widget to:

- Show a field
- Hide a field
- Make a field required
- Make a field optional

Conditional Logic helps create dynamic documents by displaying only the fields that are relevant based on the signer's input.

---

### Supported Trigger Widgets

The Number widget can be controlled using the following trigger widgets:

| Trigger Widget | Supported Operators |
|----------------|---------------------|
| Text Input | Equals, Does Not Equal |
| Number | Equals, Does Not Equal |
| Dropdown | Equals, Does Not Equal |
| Checkbox | Is Checked, Is Not Checked |
| Radio Button | Equals, Does Not Equal |

---

### Supported Actions

The following actions can be applied to a Number widget.

| Action | Description |
|---------|-------------|
| **Show this field** | Displays the Number widget when the configured conditions are met. |
| **Hide this field** | Hides the Number widget when the configured conditions are met. |
| **Make Required** | Makes the Number widget mandatory when the configured conditions are met. |
| **Make Optional** | Makes the Number widget optional when the configured conditions are met. |

---

### Condition Types

When multiple conditions are configured, OpenSign provides two evaluation modes.

### All Conditions (AND)

All configured conditions must be satisfied before the configured action is executed.

### Example

```text
Text Input = HR

AND

Dropdown = Manager

AND

Checkbox is Checked
```

**Result**

The configured Number widget action is performed only when **all three conditions** are true.

---

### Any Condition (OR)

The configured action is performed when **at least one** configured condition is satisfied.

### Example

```text
Text Input = HR

OR

Dropdown = Manager

OR

Checkbox is Checked
```

**Result**

The configured Number widget action is executed when any one condition is satisfied.

---

## Number Widget Triggered by a Text Input

The Number widget can be controlled using values entered in a Text Input widget.

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Show this field |

**Result**

When the signer enters **HR** in the Text Input widget, the configured Number widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Hide this field |

**Result**

The Number widget is hidden whenever the signer enters **HR**.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Required |

**Result**

The Number widget becomes mandatory when the signer enters **HR**.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Optional |

**Result**

The Number widget becomes optional when the signer enters **HR**.

---

## Number Widget Triggered by Another Number Widget

A Number widget can control another Number widget.

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Show this field |

**Result**

When the signer enters **10**, the configured Number widget is displayed.

---

### Show this Field (Does Not Equal)

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Does Not Equal |
| Value | 10 |
| Action | Show this field |

**Result**

The configured Number widget is displayed whenever the entered value is not **10**.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Hide this field |

**Result**

The Number widget is hidden when the signer enters **10**.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Make Required |

**Result**

The Number widget becomes mandatory when the signer enters **10**.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Make Optional |

**Result**

The Number widget becomes optional when the signer enters **10**.

---

## Number Widget Triggered by a Dropdown

## Supported Operators

- Equals
- Does Not Equal

---

## Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Show this field |

**Result**

Selecting **Manager** displays the Number widget.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Hide this field |

**Result**

Selecting **Manager** hides the Number widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Make Required |

**Result**

The Number widget becomes mandatory.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Make Optional |

**Result**

The Number widget becomes optional.

---

## Number Widget Triggered by a Checkbox

Checkbox widgets support two conditions.

- Is Checked
- Is Not Checked

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Show this field |

**Result**

The Number widget becomes visible when the checkbox is checked.

---

## Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Hide this field |

**Result**

Checking the checkbox hides the Number widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Required |

**Result**

The Number widget becomes mandatory whenever the checkbox is checked.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Optional |

**Result**

The Number widget becomes optional whenever the checkbox is checked.

---

### Is Not Checked

The same actions can also be configured using the **Is Not Checked** condition.

### Example

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Not Checked |
| Action | Show this field |

**Result**

The Number widget is displayed while the checkbox remains unchecked.

---

# Number Widget Triggered by a Radio Button

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Show this field |

**Result**

When the signer selects **Approved**, the Number widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Hide this field |

**Result**

Selecting **Approved** hides the Number widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Make Required |

**Result**

The Number widget becomes mandatory.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Make Optional |

**Result**

The Number widget becomes optional.

---

## Multiple Conditions

You can configure multiple conditions for a single Number widget.

### All Conditions (AND)

```text
Text Input = HR

AND

Dropdown = Manager

AND

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Number widget is displayed only when **all configured conditions** are satisfied.

---

## Any Condition (OR)

```text
Number = 10

OR

Dropdown = Manager

OR

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Number widget is displayed when **any one** of the configured conditions is satisfied.

---

### Best Practices

- Use meaningful widget names to simplify Conditional Logic configuration.
- Use **All Conditions** when every configured rule must be true.
- Use **Any Condition** when only one matching condition should trigger the action.
- Test all Conditional Logic rules before sending the document.
- Avoid configuring multiple conflicting rules for the same Number widget.

---

### Notes

- Conditional Logic is evaluated dynamically while the signer completes the document.
- Any changes made to trigger widget values immediately update the behavior of the Number widget.
- A Number widget can be both a **trigger widget** and a **target widget**.
- Multiple Conditional Logic rules can be configured for the same Number widget.
- Number widgets only support numeric input. Conditional Logic comparisons are performed using numeric values.

  ## Dropdown Widget - Conditional Logic

The **Dropdown** widget in OpenSign supports **Conditional Logic**, allowing you to dynamically control its behavior or the behavior of other widgets based on the option selected by the signer.

Using Conditional Logic, you can configure the Dropdown widget to:

- Show a field
- Hide a field
- Make a field required
- Make a field optional

This feature helps create interactive documents by displaying only the fields that are relevant based on the signer's selection.

---

## Supported Trigger Widgets

The Dropdown widget can be controlled using the following trigger widgets:

| Trigger Widget | Supported Operators |
|----------------|---------------------|
| Text Input | Equals, Does Not Equal |
| Number | Equals, Does Not Equal |
| Dropdown | Equals, Does Not Equal |
| Checkbox | Is Checked, Is Not Checked |
| Radio Button | Equals, Does Not Equal |

---

## Supported Actions

The following actions can be applied to a Dropdown widget.

| Action | Description |
|---------|-------------|
| **Show this field** | Displays the Dropdown widget when the configured conditions are met. |
| **Hide this field** | Hides the Dropdown widget when the configured conditions are met. |
| **Make Required** | Makes the Dropdown widget mandatory when the configured conditions are met. |
| **Make Optional** | Makes the Dropdown widget optional when the configured conditions are met. |

---

## Condition Types

When multiple conditions are configured, OpenSign allows you to choose how they are evaluated.

### All Conditions (AND)

All configured conditions must be satisfied before the configured action is executed.

### Example

```text
Text Input = HR

AND

Number = 10

AND

Checkbox is Checked
```

**Result**

The configured action is performed only when **all conditions** are satisfied.

---

### Any Condition (OR)

The configured action is executed when **at least one** configured condition is satisfied.

### Example

```text
Text Input = HR

OR

Number = 10

OR

Checkbox is Checked
```

**Result**

The configured action is executed when any one condition is satisfied.

---

## Dropdown Triggered by a Text Input

The Dropdown widget can be controlled using values entered into a Text Input widget.

## Supported Operators

- Equals
- Does Not Equal

---

## Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Show this field |

**Result**

When the signer enters **HR**, the configured Dropdown widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Hide this field |

**Result**

The Dropdown widget is hidden whenever the signer enters **HR**.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Required |

**Result**

The Dropdown widget becomes mandatory.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Optional |

**Result**

The Dropdown widget becomes optional.

---

## Dropdown Triggered by a Number Widget

## Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 5 |
| Action | Show this field |

**Result**

When the signer enters **5**, the configured Dropdown widget is displayed.

---

### Show this Field (Does Not Equal)

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Does Not Equal |
| Value | 5 |
| Action | Show this field |

**Result**

The Dropdown widget is displayed whenever the Number widget value is **not equal to 5**.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 5 |
| Action | Hide this field |

**Result**

When the signer enters **5**, the Dropdown widget is hidden.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 5 |
| Action | Make Required |

**Result**

The Dropdown widget becomes mandatory when the Number widget contains **5**.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 5 |
| Action | Make Optional |

**Result**

The Dropdown widget becomes optional.

---

## Dropdown Triggered by Another Dropdown

A Dropdown widget can control another Dropdown widget.

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Show this field |

**Result**

When the signer selects **Manager**, the configured Dropdown widget is displayed.

---

### Show this Field (Does Not Equal)

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Does Not Equal |
| Value | Manager |
| Action | Show this field |

**Result**

The Dropdown widget is displayed whenever any option other than **Manager** is selected.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Hide this field |

**Result**

Selecting **Manager** hides the configured Dropdown widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Make Required |

**Result**

The Dropdown widget becomes mandatory whenever **Manager** is selected.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Make Optional |

**Result**

The Dropdown widget becomes optional whenever **Manager** is selected.

---

## Dropdown Triggered by a Checkbox

Checkbox widgets support two conditions.

- Is Checked
- Is Not Checked

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Show this field |

**Result**

The Dropdown widget becomes visible when the checkbox is checked.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Hide this field |

**Result**

Checking the checkbox hides the Dropdown widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Required |

**Result**

The Dropdown widget becomes mandatory whenever the checkbox is checked.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Optional |

**Result**

The Dropdown widget becomes optional whenever the checkbox is checked.

---

### Is Not Checked

The same actions can also be configured using the **Is Not Checked** condition.

### Example

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Not Checked |
| Action | Show this field |

**Result**

The Dropdown widget is displayed while the checkbox remains unchecked.

---

## Dropdown Triggered by a Radio Button

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Show this field |

**Result**

When the signer selects **Approved**, the Dropdown widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Hide this field |

**Result**

Selecting **Approved** hides the Dropdown widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Make Required |

**Result**

The Dropdown widget becomes mandatory.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Make Optional |

**Result**

The Dropdown widget becomes optional.

---

## Multiple Conditions

A Dropdown widget can have multiple Conditional Logic rules.

## All Conditions (AND)

```text
Number = 10

AND

Dropdown = Manager

AND

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Dropdown widget is displayed only when **all configured conditions** are satisfied.

---

### Any Condition (OR)

```text
Number = 10

OR

Dropdown = Manager

OR

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Dropdown widget is displayed whenever **any one** of the configured conditions is satisfied.

---

### Best Practices

- Use descriptive widget names to simplify Conditional Logic configuration.
- Use **All Conditions** when every configured rule must be true.
- Use **Any Condition** when any one matching condition should trigger the action.
- Test all Conditional Logic rules before sending the document.
- Avoid creating conflicting rules for the same Dropdown widget.
- Keep dropdown option values meaningful and consistent.

---

### Notes

- Conditional Logic is evaluated dynamically while the signer completes the document.
- Changes to the trigger widget values immediately update the behavior of the Dropdown widget.
- A Dropdown widget can act as both a **trigger widget** and a **target widget**.
- Multiple Conditional Logic rules can be configured for a single Dropdown widget.
- Conditional Logic compares the selected dropdown option with the configured value using **Equals** or **Does Not Equal** operators.

## Checkbox Widget - Conditional Logic

The **Checkbox** widget in OpenSign supports **Conditional Logic**, allowing you to dynamically control its behavior or the behavior of other widgets based on values entered or selected in other fields.

Using Conditional Logic, you can configure the Checkbox widget to:

- Show a field
- Hide a field
- Make a field required
- Make a field optional

This feature enables you to create interactive and dynamic signing experiences by displaying or requiring fields only when specific conditions are met.

---

### Supported Trigger Widgets

The Checkbox widget can be controlled using the following trigger widgets:

| Trigger Widget | Supported Operators |
|----------------|---------------------|
| Text Input | Equals, Does Not Equal |
| Number | Equals, Does Not Equal |
| Dropdown | Equals, Does Not Equal |
| Checkbox | Is Checked, Is Not Checked |
| Radio Button | Equals, Does Not Equal |

---

### Supported Actions

The following actions can be applied to a Checkbox widget.

| Action | Description |
|---------|-------------|
| **Show this field** | Displays the Checkbox widget when the configured conditions are met. |
| **Hide this field** | Hides the Checkbox widget when the configured conditions are met. |
| **Make Required** | Makes the Checkbox widget mandatory when the configured conditions are met. |
| **Make Optional** | Makes the Checkbox widget optional when the configured conditions are met. |

---

### Condition Types

When configuring multiple conditions, OpenSign provides two evaluation modes.

## All Conditions (AND)

All configured conditions must be satisfied before the selected action is performed.

### Example

```text
Number = 10

AND

Dropdown = Manager

AND

Text Input = HR
```

**Result**

The configured Checkbox widget action is performed only when **all three conditions** are satisfied.

---

## Any Condition (OR)

The configured action is executed when **at least one** configured condition is satisfied.

### Example

```text
Number = 10

OR

Dropdown = Manager

OR

Text Input = HR
```

**Result**

The configured Checkbox widget action is executed when any one condition is satisfied.

---

## Checkbox Triggered by a Text Input

## Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Show this field |

**Result**

When the signer enters **HR**, the configured Checkbox widget becomes visible.

---

## Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Hide this field |

**Result**

The Checkbox widget is hidden whenever the signer enters **HR**.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Required |

**Result**

The Checkbox widget becomes mandatory when the signer enters **HR**.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Optional |

**Result**

The Checkbox widget becomes optional when the signer enters **HR**.

---

## Checkbox Triggered by a Number Widget

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Show this field |

**Result**

When the signer enters **10**, the Checkbox widget is displayed.

---

### Show this Field (Does Not Equal)

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Does Not Equal |
| Value | 10 |
| Action | Show this field |

**Result**

The Checkbox widget is displayed whenever the Number widget value is not **10**.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Hide this field |

**Result**

The Checkbox widget is hidden when the signer enters **10**.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Make Required |

**Result**

The Checkbox widget becomes mandatory when the Number widget contains **10**.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Make Optional |

**Result**

The Checkbox widget becomes optional when the Number widget contains **10**.

---

## Checkbox Triggered by a Dropdown

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Show this field |

**Result**

When the signer selects **Manager**, the Checkbox widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Hide this field |

**Result**

Selecting **Manager** hides the Checkbox widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Make Required |

**Result**

The Checkbox widget becomes mandatory.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Make Optional |

**Result**

The Checkbox widget becomes optional.

---

## Checkbox Triggered by Another Checkbox

Checkbox widgets support two conditions:

- **Is Checked**
- **Is Not Checked**

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Show this field |

**Result**

When the trigger checkbox is checked, the configured Checkbox widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Hide this field |

**Result**

Checking the trigger checkbox hides the configured Checkbox widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Required |

**Result**

The configured Checkbox widget becomes mandatory whenever the trigger checkbox is checked.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Optional |

**Result**

The configured Checkbox widget becomes optional whenever the trigger checkbox is checked.

---

### Is Not Checked

The same actions can be configured using the **Is Not Checked** condition.

### Example

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Not Checked |
| Action | Show this field |

**Result**

The configured Checkbox widget is displayed while the trigger checkbox remains unchecked.

---

## Checkbox Triggered by a Radio Button

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Show this field |

**Result**

When the signer selects **Approved**, the configured Checkbox widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Hide this field |

**Result**

Selecting **Approved** hides the configured Checkbox widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Make Required |

**Result**

The configured Checkbox widget becomes mandatory.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Make Optional |

**Result**

The configured Checkbox widget becomes optional.

---

## Multiple Conditions

A Checkbox widget can contain multiple Conditional Logic rules.

### All Conditions (AND)

```text
Number = 10

AND

Dropdown = Manager

AND

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Checkbox widget is displayed only when **all configured conditions** are satisfied.

---

### Any Condition (OR)

```text
Number = 10

OR

Dropdown = Manager

OR

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Checkbox widget is displayed whenever **any one** configured condition is satisfied.

---

### Best Practices

- Use descriptive widget names to simplify Conditional Logic configuration.
- Use **All Conditions** when every condition must be satisfied.
- Use **Any Condition** when any one condition should trigger the action.
- Test all Conditional Logic rules before sending the document.
- Avoid creating conflicting Conditional Logic rules for the same Checkbox widget.
- Use Checkbox widgets for simple Yes/No or multiple-choice scenarios.

---

### Notes

- Conditional Logic is evaluated dynamically while the signer completes the document.
- Changes made to trigger widget values immediately update the behavior of the Checkbox widget.
- A Checkbox widget can act as both a **trigger widget** and a **target widget**.
- Multiple Conditional Logic rules can be configured for the same Checkbox widget.
- Checkbox widgets support **Is Checked** and **Is Not Checked** conditions when used as trigger widgets.
  
---

# Radio Button Widget - Conditional Logic

The **Radio Button** widget in OpenSign supports **Conditional Logic**, allowing you to dynamically control its behavior or the behavior of other widgets based on the option selected by the signer.

Using Conditional Logic, you can configure the Radio Button widget to:

- Show a field
- Hide a field
- Make a field required
- Make a field optional

Conditional Logic helps create dynamic and interactive document workflows by displaying or requiring fields only when specific conditions are met.

---

## Supported Trigger Widgets

The Radio Button widget can be controlled using the following trigger widgets:

| Trigger Widget | Supported Operators |
|----------------|---------------------|
| Text Input | Equals, Does Not Equal |
| Number | Equals, Does Not Equal |
| Dropdown | Equals, Does Not Equal |
| Checkbox | Is Checked, Is Not Checked |
| Radio Button | Equals, Does Not Equal |

---

### Supported Actions

The following actions can be applied to a Radio Button widget.

| Action | Description |
|---------|-------------|
| **Show this field** | Displays the Radio Button widget when the configured conditions are met. |
| **Hide this field** | Hides the Radio Button widget when the configured conditions are met. |
| **Make Required** | Makes the Radio Button widget mandatory when the configured conditions are met. |
| **Make Optional** | Makes the Radio Button widget optional when the configured conditions are met. |

---

### Condition Types

When multiple conditions are configured, OpenSign allows you to choose how those conditions are evaluated.

### All Conditions (AND)

All configured conditions must be satisfied before the configured action is executed.

### Example

```text
Number = 10

AND

Dropdown = Manager

AND

Checkbox is Checked
```

**Result**

The configured Radio Button widget action is executed only when **all configured conditions** are satisfied.

---

### Any Condition (OR)

The configured action is executed when **at least one** configured condition is satisfied.

### Example

```text
Number = 10

OR

Dropdown = Manager

OR

Checkbox is Checked
```

**Result**

The configured Radio Button widget action is executed whenever any one of the configured conditions is satisfied.

---

## Radio Button Triggered by a Text Input

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Show this field |

**Result**

When the signer enters **HR**, the configured Radio Button widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Hide this field |

**Result**

The Radio Button widget is hidden whenever the signer enters **HR**.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Required |

**Result**

The Radio Button widget becomes mandatory when the signer enters **HR**.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Text Input |
| Condition | Equals |
| Value | HR |
| Action | Make Optional |

**Result**

The Radio Button widget becomes optional when the signer enters **HR**.

---

## Radio Button Triggered by a Number Widget

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Show this field |

**Result**

When the signer enters **10**, the configured Radio Button widget is displayed.

---

### Show this Field (Does Not Equal)

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Does Not Equal |
| Value | 10 |
| Action | Show this field |

**Result**

The Radio Button widget is displayed whenever the Number widget value is **not equal to 10**.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Hide this field |

**Result**

The Radio Button widget is hidden when the signer enters **10**.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Make Required |

**Result**

The Radio Button widget becomes mandatory when the Number widget contains **10**.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Number |
| Condition | Equals |
| Value | 10 |
| Action | Make Optional |

**Result**

The Radio Button widget becomes optional when the Number widget contains **10**.

---

## Radio Button Triggered by a Dropdown

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Show this field |

**Result**

When the signer selects **Manager**, the configured Radio Button widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Hide this field |

**Result**

Selecting **Manager** hides the configured Radio Button widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Make Required |

**Result**

The Radio Button widget becomes mandatory whenever **Manager** is selected.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Dropdown |
| Condition | Equals |
| Value | Manager |
| Action | Make Optional |

**Result**

The Radio Button widget becomes optional whenever **Manager** is selected.

---

## Radio Button Triggered by a Checkbox

Checkbox widgets support two conditions:

- **Is Checked**
- **Is Not Checked**

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Show this field |

**Result**

When the checkbox is checked, the configured Radio Button widget becomes visible.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Hide this field |

**Result**

Checking the checkbox hides the configured Radio Button widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Required |

**Result**

The Radio Button widget becomes mandatory whenever the checkbox is checked.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Checked |
| Action | Make Optional |

**Result**

The Radio Button widget becomes optional whenever the checkbox is checked.

---

### Is Not Checked

The same actions can also be configured using the **Is Not Checked** condition.

### Example

| Property | Value |
|----------|-------|
| Trigger Widget | Checkbox |
| Condition | Is Not Checked |
| Action | Show this field |

**Result**

The configured Radio Button widget is displayed while the checkbox remains unchecked.

---

## Radio Button Triggered by Another Radio Button

A Radio Button widget can control another Radio Button widget.

### Supported Operators

- Equals
- Does Not Equal

---

### Show this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Show this field |

**Result**

When the signer selects **Approved**, the configured Radio Button widget is displayed.

---

### Show this Field (Does Not Equal)

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Does Not Equal |
| Value | Approved |
| Action | Show this field |

**Result**

The Radio Button widget is displayed whenever a value other than **Approved** is selected.

---

### Hide this Field

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Hide this field |

**Result**

Selecting **Approved** hides the configured Radio Button widget.

---

### Make Required

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Make Required |

**Result**

The Radio Button widget becomes mandatory whenever **Approved** is selected.

---

### Make Optional

### Configuration

| Property | Value |
|----------|-------|
| Trigger Widget | Radio Button |
| Condition | Equals |
| Value | Approved |
| Action | Make Optional |

**Result**

The Radio Button widget becomes optional whenever **Approved** is selected.

---

## Multiple Conditions

You can configure multiple Conditional Logic rules for a Radio Button widget.

### All Conditions (AND)

```text
Number = 10

AND

Dropdown = Manager

AND

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Radio Button widget is displayed only when **all configured conditions** are satisfied.

---

### Any Condition (OR)

```text
Number = 10

OR

Dropdown = Manager

OR

Checkbox is Checked
```

**Action**

Show this field

**Result**

The Radio Button widget is displayed whenever **any one** configured condition is satisfied.

---

### Best Practices

- Use descriptive widget names to make Conditional Logic easier to configure.
- Use **All Conditions** when every configured condition must be true.
- Use **Any Condition** when any single matching condition should trigger the action.
- Test Conditional Logic before sending the document.
- Avoid creating conflicting Conditional Logic rules for the same Radio Button widget.
- Use meaningful option labels to make conditions easier to understand and maintain.

---

### Notes

- Conditional Logic is evaluated dynamically while the signer completes the document.
- Changes to trigger widget values immediately update the behavior of the Radio Button widget.
- A Radio Button widget can act as both a **trigger widget** and a **target widget**.
- Multiple Conditional Logic rules can be configured for the same Radio Button widget.
- Radio Button widgets support **Equals** and **Does Not Equal** operators when comparing the selected option.
  
---
  
If you require more help, feel free to reach out to our customer support on support@opensignlabs.com.

Happy signing with OpenSign™!
