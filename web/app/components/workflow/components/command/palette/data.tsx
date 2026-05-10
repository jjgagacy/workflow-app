import { PaletteItem } from "./item";

export const testPaletteItems: PaletteItem[] = [
  {
    id: '1',
    title: 'Create Node',
    icon: '🟢',
    children: [
      {
        id: '1-1',
        title: 'Create Chat Node',
        icon: '💬',
      }
    ]
  },
  {
    id: '2',
    title: 'Delete Node',
    icon: '🔴',
    handler: () => {
      console.log('delete ***');
    }
  },
  {
    id: '3',
    title: 'Move Node',
    icon: '🔵',
  },
  {
    id: '4',
    title: 'Duplicate Node',
    icon: '🟡',
  },
  {
    id: '5',
    title: 'Export Workflow',
    icon: '📤',
  }
];