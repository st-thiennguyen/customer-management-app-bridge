import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import CustomerTable from "../shared/components/CustomerTable";
import { useActionData, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
          query getAllCustomers {
            customers(first: 10) {
              edges {
                node {
                  id
                   firstName
                   lastName
                   email
                   addresses{
                     address1
                   }
                   metafields (first:5){
                    edges {
                      node {
                        id
                        namespace
                        value
                      }
                    }
                   }
                }
              }
            }
          }`
  );
  return response.json();
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const customerId = formData.get("customerId");
  const isDeactive = formData.get("isDeactive");
  const metafieldId = formData.get("metafieldId");

  const response = await admin.graphql(
    `#graphql
          mutation updateCustomerMetafields($input: CustomerInput!) {
              customerUpdate(input: $input) {
                customer {
                  id
                  metafields(first: 3) {
                    edges {
                      node {
                        id
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
                userErrors {
                  message
                  field
                }
              }
            }`,
    {
      variables: {
        input: {
          metafields: [
            metafieldId !== "undefined"
              ? {
                  id: metafieldId,
                  value: isDeactive === "true" ? "false" : "true",
                }
              : {
                  namespace: "st-deactivate",
                  key: "isDeactivate",
                  type: "boolean",
                  value: "true",
                },
          ],
          id: customerId,
        },
      },
    }
  );

  return null;
};

export default function Index() {
  const data: any = useLoaderData();
  const action = useActionData();
  return (
    <Page>
      <CustomerTable edges={data.data.customers.edges} />
    </Page>
  );
}
