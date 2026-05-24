import { usePlatformShortcut } from "./use-platformShortcut";

export const useWorkflowShortcut = () => {
  usePlatformShortcut('s', (event) => {
    event.preventDefault();
    console.log('Workflow saved!');
  });

  usePlatformShortcut('c', (event) => {
    event.preventDefault();
    console.log('Workflow copied!');
  }, { useCapture: true });

  usePlatformShortcut('v', (event) => {
    event.preventDefault();
    console.log('Workflow pasted!');
  }, { useCapture: true });

  usePlatformShortcut('d', (event) => {
    event.preventDefault();
    console.log('Workflow duplicated!');
  }, { useCapture: true });

  usePlatformShortcut('r', (event) => {
    event.preventDefault();
    console.log('Workflow reset!');
  }, { useCapture: true, altKey: true, metaKey: false });

  usePlatformShortcut('z', (event) => {
    event.preventDefault();
    console.log('Workflow undo!');
  }, { useCapture: true });

  usePlatformShortcut(['y', 'shift.z'], (event) => {
    event.preventDefault();
    console.log('Workflow redo!');
  }, { useCapture: true });

  usePlatformShortcut('o', (event) => {
    event.preventDefault();
    console.log('Workflow tidy up!');
  }, { useCapture: true });

  usePlatformShortcut('1', (event) => {
    event.preventDefault();
    console.log('Workflow fitview!');
  }, { useCapture: true });

  usePlatformShortcut('dash', (event) => {
    event.preventDefault();
    console.log('Workflow zoom out!');
  }, { useCapture: true });

  usePlatformShortcut('equalsign', (event) => {
    event.preventDefault();
    console.log('Workflow zoom in!');
  }, { useCapture: true });

  usePlatformShortcut('0', (event) => {
    event.preventDefault();
    console.log('Workflow reset zoom!');
  }, { useCapture: true });

};