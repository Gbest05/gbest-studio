import { useSyncExternalStore } from 'react';

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
type GetState<T> = () => T;

export function create<T extends object>(stateCreator: (set: SetState<T>, get: GetState<T>) => T) {
  let state: T;
  const listeners = new Set<() => void>();

  const getState: GetState<T> = () => state;

  const setState: SetState<T> = (partial) => {
    const nextState = typeof partial === 'function' ? (partial as any)(state) : partial;
    if (nextState && typeof nextState === 'object') {
      state = Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener());
    }
  };

  state = stateCreator(setState, getState);

  const useStore = <U = T>(selector?: (state: T) => U): U => {
    return useSyncExternalStore(
      (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      () => (selector ? selector(getState()) : (getState() as unknown as U))
    );
  };

  Object.assign(useStore, {
    getState,
    setState,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });

  return useStore as typeof useStore & {
    getState: GetState<T>;
    setState: SetState<T>;
  };
}
