import { Preflight } from "styled-preflight";

const Layout = ({ children }) => {
  return (
    <div>
      <Preflight />
      {children}
    </div>
  );
};

export default Layout;
