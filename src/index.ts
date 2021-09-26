import { MaybeLazy, UseMachineOptions } from '@xstate/react/lib/types';
import useConstant from '@xstate/react/lib/useConstant';
import useIsomorphicLayoutEffect from 'use-isomorphic-layout-effect';
import {
  assign,
  EventObject,
  Interpreter,
  InterpreterOptions,
  MachineOptions,
  Observer,
  State,
  StateMachine,
  Typestate,
} from 'xstate';
import {
  useMachine as _useMachine,
  useInterpret as _useInterpret,
} from '@xstate/react';

export const useCoerceToMachineWithSyncToContext = <
  TContext,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = { value: any; context: TContext }
>(
  getMachine: MaybeLazy<StateMachine<TContext, any, TEvent, TTypestate>>
) => {
  const machine = useConstant(() => {
    const machineToReturn =
      typeof getMachine === 'function' ? getMachine() : getMachine;

    if (!machineToReturn.config.on) {
      (machineToReturn as any).config.on = {};
    }

    if (!(machineToReturn.config as any).on['xstate.update.syncToContext']) {
      (machineToReturn.config as any).on['xstate.update.syncToContext'] = {
        actions: assign((_context, event: any) => {
          return event.props;
        }),
      };
    }

    return machineToReturn;
  });

  return machine;
};

export const useSyncToContext = <TContext>(
  syncToContext: Partial<TContext> | undefined,
  service: Interpreter<TContext, any, any, any>
) => {
  useIsomorphicLayoutEffect(() => {
    if (syncToContext) {
      service.send({
        type: 'xstate.update.syncToContext',
        props: syncToContext,
      } as any);
    }
  }, [syncToContext]);
};

export interface SyncToContextOption<TContext> {
  syncToContext?: Partial<TContext>;
}

export const useInterpret = <
  TContext,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = { value: any; context: TContext }
>(
  getMachine: MaybeLazy<StateMachine<TContext, any, TEvent, TTypestate>>,
  options: Partial<InterpreterOptions> &
    Partial<UseMachineOptions<TContext, TEvent>> &
    Partial<MachineOptions<TContext, TEvent>> &
    SyncToContextOption<TContext> = {},
  observerOrListener?:
    | Observer<State<TContext, TEvent, any, TTypestate>>
    | ((value: State<TContext, TEvent, any, TTypestate>) => void)
) => {
  const machine = useCoerceToMachineWithSyncToContext(getMachine);

  const service = _useInterpret(machine, options, observerOrListener);

  useSyncToContext(options.syncToContext, service);

  return service;
};

export const useMachine = <
  TContext,
  TEvent extends EventObject,
  TTypestate extends Typestate<TContext> = { value: any; context: TContext }
>(
  getMachine: MaybeLazy<StateMachine<TContext, any, TEvent, TTypestate>>,
  options: Partial<InterpreterOptions> &
    Partial<UseMachineOptions<TContext, TEvent>> &
    Partial<MachineOptions<TContext, TEvent>> &
    SyncToContextOption<TContext> = {}
): [
  State<TContext, TEvent, any, TTypestate>,
  Interpreter<TContext, any, TEvent, TTypestate>['send'],
  Interpreter<TContext, any, TEvent, TTypestate>
] => {
  const machine = useCoerceToMachineWithSyncToContext(getMachine);

  const [state, send, service] = _useMachine(machine, options);

  useSyncToContext(options.syncToContext, service);

  return [state, send, service];
};

export * from '@xstate/react';
