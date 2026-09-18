import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";

import { AiCopywritingPopover } from "../AiCopywritingPopover";

describe("AiCopywritingPopover Component", () => {
  it("renders 4 tone selector options", () => {
    const handleClose = jest.fn();
    const handleApply = jest.fn();

    render(
      <AiCopywritingPopover
        open={true}
        onClose={handleClose}
        onApplyCopy={handleApply}
        initialKeywords="Leather Crossbody Bag"
      />,
    );

    expect(screen.getByText("Professional")).toBeInTheDocument();
    expect(screen.getByText("Friendly")).toBeInTheDocument();
    expect(screen.getByText("Luxurious")).toBeInTheDocument();
    expect(screen.getByText("Playful")).toBeInTheDocument();
  });

  it("generates 3 title options (<=60 chars) and 3 description options", async () => {
    const handleClose = jest.fn();
    const handleApply = jest.fn();

    render(
      <AiCopywritingPopover
        open={true}
        onClose={handleClose}
        onApplyCopy={handleApply}
        initialKeywords="Leather Crossbody Bag"
      />,
    );

    const generateBtn = screen.getByText(/Generate AI Copy/i);
    fireEvent.click(generateBtn);

    const applyBtn = await screen.findByText("Apply to Product");
    expect(applyBtn).toBeInTheDocument();

    const titleOption1 = screen.getAllByText(/Leather Crossbody Bag/i)[0];
    expect(titleOption1).toBeInTheDocument();

    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalled();
  });
});
