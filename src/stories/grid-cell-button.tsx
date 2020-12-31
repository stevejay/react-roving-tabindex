import styled from 'styled-components';

type Props = {
  useAlternateGridLayout: boolean;
};

const GridCellButton = styled.button`
  appearance: none;
  background: none repeat scroll 0 0;
  background-color: white;
  font-size: 1rem;
  font-family: sans-serif;
  line-height: 2rem;
  color: rebeccapurple;
  border: 2px solid rebeccapurple;
  border-radius: 0.25em;
  border-spacing: 0;
  padding: 0 0.75em;
  width: ${(props: Props) => (props.useAlternateGridLayout ? '33.333%' : '25%')};

  &:focus {
    color: white;
    background-color: rebeccapurple;
  }

  &::-moz-focus-inner {
    border: 0;
    padding: 0;
  }

  &:-moz-focusring {
    outline: 1px dotted ButtonText;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export { GridCellButton };
