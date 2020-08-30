import React from "react";
import styled from "styled-components";

const StyledToolbar = styled.div`
  background-color: #eee;
  border: 2px solid #aaa;
  border-radius: 0.5em;
`;

const Toolbar: React.FC = ({ children }) => (
  <StyledToolbar role="group">{children}</StyledToolbar>
);

export { Toolbar };
