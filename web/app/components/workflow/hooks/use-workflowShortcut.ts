import { useKeyPress } from "ahooks";
import { useDeviceSupport } from "../../app/hooks";

export const useWorkflowShortcut = () => {
  const { isMac } = useDeviceSupport();

  useKeyPress(`${isMac ? 'meta' : 'ctrl'}.c`, (event) => {
    event.preventDefault();
    console.log('Workflow saved!');
  });


};