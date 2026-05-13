import { useEffect, RefObject } from 'react';

export const useNodeSelectorClose = (
  showNodeSelector: boolean,
  setShowNodeSelector: (show: boolean) => void,
  nodeSelectorWrapperRef: RefObject<HTMLElement | null>
) => {
  // 处理点击外部
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showNodeSelector &&
        nodeSelectorWrapperRef.current &&
        nodeSelectorWrapperRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setShowNodeSelector(false);
    };

    if (showNodeSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNodeSelector, setShowNodeSelector, nodeSelectorWrapperRef]);

  // 处理 ReactFlow 点击
  useEffect(() => {
    if (!showNodeSelector) return;

    const reactFlowElement = document.querySelector('.react-flow');
    if (!reactFlowElement) return;

    const handleReactFlowClick = () => {
      setShowNodeSelector(false);
    };

    reactFlowElement.addEventListener('click', handleReactFlowClick);

    return () => {
      reactFlowElement.removeEventListener('click', handleReactFlowClick);
    };
  }, [showNodeSelector, setShowNodeSelector]);
};