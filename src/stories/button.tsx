import styled from "styled-components";

const Button = styled.button`
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
  margin: 0.5rem;
  padding: 0 0.75em;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 6px rgba(66, 153, 225, 0.5);
  }

  &::-moz-focus-inner {
    border: 0;
    padding: 0;
  }

  &:-moz-focusring {
    outline: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export { Button };
