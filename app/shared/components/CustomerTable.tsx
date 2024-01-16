import { useSubmit } from "@remix-run/react";
import {
  BlockStack,
  useBreakpoints,
  Text,
  Badge,
  IndexTable,
  Card,
  Button,
} from "@shopify/polaris";

type CustomerTableProps = {
  edges: {
    node: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      addresses: {
        address1: string[];
      };
      metafields: {
        edges: {
          node: {
            id: string;
            value: string;
          };
        }[];
      };
    };
  }[];
};

const CustomerTable = ({ edges }: CustomerTableProps) => {
  const submit = useSubmit();

  const customers = edges.map((item) => {
    return {
      id: item.node.id,
      first_name: item.node.firstName,
      last_name: item.node.lastName,
      email: item.node.email,
      addresses: item.node.addresses.address1,
      isDeactive: item.node.metafields.edges[0]?.node.value,
      metafieldId: item.node.metafields.edges[0]?.node.id,
      renderStatus: (
        <Badge
          tone={
            item.node.metafields.edges[0]?.node.value === "true"
              ? "critical"
              : "success"
          }
        >
          {item.node.metafields.edges[0]?.node.value === "true"
            ? "Blocked"
            : "Activate"}
        </Badge>
      ),
    };
  });

  const rowMarkup = customers.map(
    (
      {
        id,
        first_name,
        last_name,
        email,
        addresses,
        renderStatus,
        isDeactive,
        metafieldId,
      },
      index
    ) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {first_name + last_name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          {isDeactive === "true"
            ? Array.from({ length: email.length }).map((item) => "*")
            : email}
        </IndexTable.Cell>
        <IndexTable.Cell>{addresses}</IndexTable.Cell>
        <IndexTable.Cell>{renderStatus}</IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            submit
            variant="primary"
            onClick={() => {
              const formData = new FormData();
              formData.append("customerId", id);
              formData.append("isDeactive", String(isDeactive));
              formData.append("metafieldId", metafieldId ?? undefined);
              submit(formData, { method: "POST" });
            }}
          >
            {isDeactive === "true" ? "Active" : "Deactive"}
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  return (
    <BlockStack>
      <ui-title-bar title="Customers Management" />
      <Card>
        <IndexTable
          condensed={useBreakpoints().smDown}
          itemCount={customers.length}
          headings={[
            { title: "Customer name" },
            { title: "Email" },
            { title: "Location" },
            { title: "Status status" },
            { title: "Action" },
          ]}
          lastColumnSticky
        >
          {rowMarkup}
        </IndexTable>
      </Card>
    </BlockStack>
  );
};

export default CustomerTable;
