import { Customer } from "node_modules/@shopify/shopify-api/rest/admin/2024-01/customer";

export type CustomerTableProps = {
  edges: {
    node: Customer;
  }[];
};
