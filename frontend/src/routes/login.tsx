import { createFileRoute } from "@tanstack/react-router";
import { SignInPage } from "./signin";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Smart Map" },
      { name: "description", content: "Log in to continue exploring your city." },
    ],
  }),
  component: SignInPage,
});