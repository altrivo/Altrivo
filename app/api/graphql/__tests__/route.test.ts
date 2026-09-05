import "@testing-library/jest-dom";
import { NextRequest } from "next/server";

import { POST } from "../route";

describe("GraphQL API Route", () => {
  it("executes GraphQL products query", async () => {
    const req = new NextRequest("http://localhost:3000/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "query { products { id title price status } }",
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.products).toBeDefined();
    expect(Array.isArray(json.data.products)).toBe(true);
  });

  it("executes GraphQL createProduct mutation", async () => {
    const req = new NextRequest("http://localhost:3000/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-vendor-id": "vendor_gql_test" },
      body: JSON.stringify({
        query: `mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) { id title price status }
        }`,
        variables: {
          input: {
            title: "GraphQL Leather Belt",
            price: 45.0,
            status: "published",
          },
        },
      }),
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.createProduct).toBeDefined();
    expect(json.data.createProduct.title).toBe("GraphQL Leather Belt");
    expect(json.data.createProduct.price).toBe(45.0);
  });
});
