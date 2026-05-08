import { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';


interface TransitionWrapperProps {
  show: boolean;
  children: React.ReactNode;
  timeout?: number;
  classNames?: string;
  nodeRef?: React.RefObject<HTMLDivElement | null>;
}

export const SlideTransition: React.FC<TransitionWrapperProps> = ({
  show,
  children,
  timeout = 300,
  classNames = 'slide',
  nodeRef: externalNodeRef,
}) => {
  const nodeRef = externalNodeRef || useRef(null);
  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={show}
      timeout={timeout}
      classNames={classNames}
      unmountOnExit
    >
      {children}
    </CSSTransition>
  );
};