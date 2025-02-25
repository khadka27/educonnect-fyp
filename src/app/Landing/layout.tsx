import Navbar from "src/components/bar/Navbar/Navbar";

import React, { ReactNode } from "react";
import "react/jsx-runtime";

interface LayoutProps {
  children: ReactNode;
  hideNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNavbar }) => {
  return (
    <div>
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
