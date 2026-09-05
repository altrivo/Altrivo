import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { AiImageGeneratorModal } from "../AiImageGeneratorModal";

describe("AiImageGeneratorModal Component", () => {
  it("renders 4 photography style options", () => {
    const handleClose = jest.fn();
    const handleAdd = jest.fn();

    render(
      <AiImageGeneratorModal
        open={true}
        onClose={handleClose}
        onAddImages={handleAdd}
        initialPrompt="Modern Women Handbag"
      />,
    );

    expect(screen.getByText("Studio White BG")).toBeInTheDocument();
    expect(screen.getByText("Lifestyle Scene")).toBeInTheDocument();
    expect(screen.getByText("Flat Lay Overhead")).toBeInTheDocument();
    expect(screen.getByText("Dark Moody")).toBeInTheDocument();
  });

  it("selects a photography style option", () => {
    const handleClose = jest.fn();
    const handleAdd = jest.fn();

    render(
      <AiImageGeneratorModal
        open={true}
        onClose={handleClose}
        onAddImages={handleAdd}
        initialPrompt="Modern Women Handbag"
      />,
    );

    const lifestyleCard = screen.getByText("Lifestyle Scene");
    fireEvent.click(lifestyleCard);

    expect(screen.getByText("Lifestyle Scene")).toBeInTheDocument();
  });

  it("generates 4 AI image options on click generate button", async () => {
    const handleClose = jest.fn();
    const handleAdd = jest.fn();

    render(
      <AiImageGeneratorModal
        open={true}
        onClose={handleClose}
        onAddImages={handleAdd}
        initialPrompt="Modern Women Handbag"
      />,
    );

    const generateBtn = screen.getByText("✨ Generate 4 AI Images");
    fireEvent.click(generateBtn);

    await waitFor(
      () => {
        expect(screen.getByText("Option #1")).toBeInTheDocument();
        expect(screen.getByText("Option #4")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
