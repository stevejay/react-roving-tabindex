import styled from "styled-components";

type Props = {
  useAlternateGridLayout: boolean;
};

const Grid = styled.div`
  display: grid;
  width: 400px;
  grid-template-rows: ${(props: Props) =>
    props.useAlternateGridLayout
      ? "repeat(4, minmax(0, 1fr))"
      : "repeat(3, minmax(0, 1fr))"};
  grid-template-columns: ${(props: Props) =>
    props.useAlternateGridLayout
      ? "repeat(3, minmax(0, 1fr))"
      : "repeat(4, minmax(0, 1fr))"};
  grid-gap: 0.25rem;
  gap: 0.25rem;
`;

export { Grid };
