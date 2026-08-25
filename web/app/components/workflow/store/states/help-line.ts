import { StateCreator } from "zustand";
import { HorizontalSnapGuideLine, VerticalSnapGuideLine } from "../types/help-line.type";

export type HelpLineState = {
  horizontalSnapGuideLines: HorizontalSnapGuideLine[];
  setHorizontalSnapGuideLines: (lines: HorizontalSnapGuideLine[]) => void;
  verticalSnapGuideLines: VerticalSnapGuideLine[];
  setVerticalSnapGuideLines: (lines: VerticalSnapGuideLine[]) => void;
};

export type HelpLineSliceCreator = StateCreator<HelpLineState>;

export const createHelpLineSlice: HelpLineSliceCreator = (set, get) => ({
  horizontalSnapGuideLines: [],
  setHorizontalSnapGuideLines: (lines: HorizontalSnapGuideLine[]) => {
    set(() => ({ horizontalSnapGuideLines: lines }));
  },
  verticalSnapGuideLines: [],
  setVerticalSnapGuideLines: (lines: VerticalSnapGuideLine[]) => {
    set(() => ({ verticalSnapGuideLines: lines }));
  },
});