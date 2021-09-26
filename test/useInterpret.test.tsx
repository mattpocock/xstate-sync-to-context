import { render } from '@testing-library/react';
import { useSelector } from '@xstate/react';
import React from 'react';
import { createMachine } from 'xstate';
import { useInterpret } from '../src';

describe('syncToContext', () => {
  it('Should initialise the context as the synced context', (done) => {
    const machine = createMachine({
      context: {
        id: '',
      },
    });

    const App = (props: any) => {
      const service = useInterpret(machine, {
        syncToContext: {
          id: props.id,
        },
      });

      React.useEffect(() => {
        expect(service.state.context.id).toEqual(props.id);
        done();
      }, [service, props.id]);

      return null;
    };

    render(<App id="id" />);
  });

  it('Should react to updates to its synced context', () => {
    const machine = createMachine({
      context: {
        id: '',
      },
    });

    const getId = (state: any) => state.context.id;

    const App = (props: any) => {
      const service = useInterpret(machine, {
        syncToContext: {
          id: props.id,
        },
      });

      const id = useSelector(service, getId);

      return <div data-testid="result">{id}</div>;
    };

    const screen = render(<App id="id" />);

    expect(screen.getByTestId('result').innerHTML).toEqual('id');

    screen.rerender(<App id="id2" />);

    expect(screen.getByTestId('result').innerHTML).toEqual('id2');
  });
});
