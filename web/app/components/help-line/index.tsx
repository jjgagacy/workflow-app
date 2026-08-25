import { useWorkflowContext } from "../workflow/context"
import { HorizontalHelpLine } from "./horizontal-helpLine";
import { VerticalHelpLine } from "./vertical-helpLine";

export const HelpLine = () => {
  const { horizontalSnapGuideLines, verticalSnapGuideLines } = useWorkflowContext().getState();

  if (horizontalSnapGuideLines.length === 0 && verticalSnapGuideLines.length === 0)
    return null;

  return (
    <>
      {horizontalSnapGuideLines.length > 0 && (
        <HorizontalHelpLine {...horizontalSnapGuideLines[0]} />
      )}
      {verticalSnapGuideLines.length > 0 && (
        <VerticalHelpLine {...verticalSnapGuideLines[0]} />
      )}
    </>
  );
}