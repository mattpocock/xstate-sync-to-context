# xstate-sync-to-context

## Installation

`yarn add xstate-sync-to-context`

## Usage

This small lib brings the `syncToContext` proposal to XState. This allows you to sync 'props' into context in a predictable, concise way:

```ts
import { useMachine } from 'xstate-sync-to-context';
import { machine } from './machine';

// useQuery, for instance from react-query or useSWR
const [result] = useQuery();

const [state] = useMachine(machine, {
  syncToContext: {
    data: result.data,
  },
});
```

`syncToContext` updates your context via an event: `xstate.update.syncToContext`. You can listen to the event manually to configure its behaviour:

```ts
import { createMachine } from 'xstate';

const machine = createMachine({
  on: {
    'xstate.update.syncToContext': {
      actions: (context, event) => {
        console.log(event.props);
      },
    },
  },
});
```

> You can only import `useMachine` and `useInterpret` from `xstate-sync-to-context` - other imports need to be grabbed from `@xstate/react`

## Proposal

If you like this proposal, [check out the PR to XState Core](https://github.com/statelyai/xstate/pull/2683) if you want to bring it into core.

## FAQ's

### Fixing 'maximum update depth exceeded'

If you see this error, use a useMemo on the data you're syncing to context:

```ts
import { useMachine } from 'xstate-sync-to-context';
import { machine } from './machine';

// useQuery, for instance from react-query or useSWR
const [result] = useQuery();

const [state] = useMachine(machine, {
  syncToContext: useMemo(
    () => ({
      data: result.data,
    }),
    [result.data]
  ),
});
```
