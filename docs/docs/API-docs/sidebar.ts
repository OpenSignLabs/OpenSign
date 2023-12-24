import {SidebarConfig} from "@docusaurus/plugin-content-docs/src/sidebars/types";

const sidebar: SidebarConfig = [
  {
    "type": "doc",
    "id": "API-docs/opensign-api-v-1"
  },
  {
    "type": "category",
    "label": "templates",
    "items": [
      {
        "type": "doc",
        "id": "API-docs/place-order",
        "label": "Place an order for a pet",
        "className": "api-method post"
      },
      {
        "type": "doc",
        "id": "API-docs/get-order-by-id",
        "label": "Find purchase order by ID",
        "className": "api-method get"
      },
      {
        "type": "doc",
        "id": "API-docs/delete-order",
        "label": "Delete purchase order by ID",
        "className": "api-method delete"
      },
      {
        "type": "doc",
        "id": "API-docs/create-user",
        "label": "Create user",
        "className": "api-method post"
      }
    ]
  },
  {
    "type": "category",
    "label": "users",
    "items": [
      {
        "type": "doc",
        "id": "API-docs/update-pet",
        "label": "Update an existing pet",
        "className": "api-method put"
      },
      {
        "type": "doc",
        "id": "API-docs/add-pet",
        "label": "Add a new pet to the store",
        "className": "api-method post"
      }
    ]
  },
  {
    "type": "category",
    "label": "documents",
    "items": [
      {
        "type": "doc",
        "id": "API-docs/find-pets-by-status",
        "label": "Finds Pets by status",
        "className": "api-method get"
      },
      {
        "type": "doc",
        "id": "API-docs/find-pets-by-tags",
        "label": "Finds Pets by tags",
        "className": "api-method get"
      },
      {
        "type": "doc",
        "id": "API-docs/get-inventory",
        "label": "Returns pet inventories by status",
        "className": "api-method get"
      }
    ]
  },
  {
    "type": "category",
    "label": "contacts",
    "items": [
      {
        "type": "doc",
        "id": "API-docs/get-pet-by-id",
        "label": "Find pet by ID",
        "className": "api-method get"
      },
      {
        "type": "doc",
        "id": "API-docs/update-pet-with-form",
        "label": "Updates a pet in the store with form data",
        "className": "api-method post"
      },
      {
        "type": "doc",
        "id": "API-docs/delete-pet",
        "label": "Deletes a pet",
        "className": "api-method delete"
      },
      {
        "type": "doc",
        "id": "API-docs/upload-file",
        "label": "uploads an image",
        "className": "api-method post"
      }
    ]
  }
];

export default sidebar;