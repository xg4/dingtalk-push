import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { sign } from "./sign.ts";

const { test } = Deno;

test({
  name: "sign fn",
  fn() {
    const input = "abc";
    const secret =
      "SECb788ec135b226901fc02438d4660dbf9d5ad75683b00c4dd97ff56aaa50e989f";
    const output = sign(secret, input);
    assertEquals(output, "0cM0/U8AWto7iw+GTkBTf/F7wnZIrXvD+p7YWLlf0bA=");
  },
});
