'use client';

import type { EventEmitter } from "ahooks/lib/useEventEmitter";
import useEventEmitter from "ahooks/lib/useEventEmitter";
import { createContext, useContext } from "use-context-selector";

const EventEmitterContext = createContext<{ eventEmitter: EventEmitter<string> | null }>({
  eventEmitter: null
});

export const useEventEmitterContext = () => useContext(EventEmitterContext);

type EventEmitterContextProviderProps = {
  eventEmitter?: EventEmitter<string>;
  children: React.ReactNode;
};

export const EventEmitterContextProvider = ({ eventEmitter: propEventEmitter, children }: EventEmitterContextProviderProps) => {
  const eventEmitter = propEventEmitter ?? useEventEmitter<string>();
  return (
    <EventEmitterContext.Provider value={{ eventEmitter }}>
      {children}
    </EventEmitterContext.Provider>
  );
};

export default EventEmitterContext;
