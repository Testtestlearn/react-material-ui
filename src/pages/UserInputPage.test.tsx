import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UserInputPage from "./UserInputPage";

function renderPage() {
  return render(
    <MemoryRouter>
      <UserInputPage />
    </MemoryRouter>,
  );
}

describe("UserInputPage", () => {
  it("renders the Registration Form heading", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /registration form/i }),
    ).toBeInTheDocument();
  });

  it("shows required field errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
    expect(screen.getByText("Age is required.")).toBeInTheDocument();
  });

  it("shows an error for an invalid email address", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/full name/i), "Jimmy Test");
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/^age/i), "25");
    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("shows the success summary after a valid submission", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/full name/i), "Jimmy Test");
    await user.type(screen.getByLabelText(/email/i), "jimmy@example.com");
    await user.type(screen.getByLabelText(/^age/i), "25");

    // Select a country from the dropdown
    await user.click(screen.getByLabelText(/country/i));
    await user.click(screen.getByRole("option", { name: "United States" }));

    await user.click(screen.getByRole("button", { name: /^submit$/i }));

    expect(
      screen.getByText("Form submitted successfully!"),
    ).toBeInTheDocument();
    expect(screen.getByText("jimmy@example.com")).toBeInTheDocument();
  });
});
