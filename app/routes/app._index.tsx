import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import CustomerTable from "../shared/components/CustomerTable";
import { useActionData, useLoaderData } from "@remix-run/react";
import { generateRandomEmail } from "~/shared/utils/emailGenerate";

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
  const metafieldDeactivateId = formData.get("metafieldDeactivateId");
  const metafieldEmailId = formData.get("metafieldEmailId");
  const email = formData.get("email");
  const emailStored = formData.get("emailStored");

  console.log("CHECK", emailStored, isDeactive, metafieldDeactivateId);
  const response = await admin.graphql(
    `#graphql
          mutation updateCustomerMetafields($input: CustomerInput!) {
              customerUpdate(input: $input) {
                customer {
                  id
                  email
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
            metafieldDeactivateId === "undefined"
              ? {
                  namespace: "st-deactivate",
                  key: "isDeactivate",
                  type: "boolean",
                  value: "true",
                }
              : {
                  id: metafieldDeactivateId,
                  value: isDeactive === "true" ? "false" : "true",
                },
            metafieldEmailId === "undefined"
              ? {
                  namespace: "st-user-email",
                  key: "userEmail",
                  type: "single_line_text_field",
                  value: email,
                }
              : null,
          ],
          email: checkEmail(
            isDeactive === "true",
            String(emailStored),
            String(email)
          ),
          id: customerId,
        },
      },
    }
  );

  return null;
};

const checkEmail = (
  isDeactivate: boolean,
  emailStored: string,
  resultDefault: string
) => {
  console.log(
    "CHECK2 : ",
    "\n",
    emailStored,
    "type :",
    typeof emailStored,
    "\n",
    isDeactivate,
    "type :",
    typeof isDeactivate,
    "\n",
    resultDefault
  );

  if (emailStored !== "undefined") {
    if (isDeactivate) {
      return emailStored;
    } else {
      return generateRandomEmail(String(emailStored));
    }
  } else {
    return generateRandomEmail(resultDefault);
  }
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
