import { brandDetails } from "../../constants/constants";



function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="footer-wrapper">
        <p className="dev-by"> Developed by Anaytullah</p>
          <p>© {currentYear} {brandDetails.name}. All rights reserved.</p>
    </div>
  );
}

export default Footer;