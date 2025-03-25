import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer>
      <p>ADC - All Rights Reserved {currentYear} &copy;</p>
    </footer>
  );
};

export default Footer;
