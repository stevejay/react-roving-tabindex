import { Preflight } from 'styled-preflight';
import { createGlobalStyle } from 'styled-components';
import 'what-input';

const GlobalStyle = createGlobalStyle`
  html[data-whatintent='keyboard'] *:focus {
    outline: 2px solid #007AFF;
    outline-offset: -2px;
  }

  html:not([data-whatintent='keyboard']) *:focus {
    outline: none !important;
  }

  [data-whatintent='touch'] *:hover.no-emulated-hover {
    background-color: transparent !important;
  }
`;

const Layout = ({ children }) => {
  return (
    <div>
      <Preflight />
      <GlobalStyle />
      {children}
    </div>
  );
};

export default Layout;
