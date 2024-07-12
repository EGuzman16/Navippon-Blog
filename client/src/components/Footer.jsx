import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <ul className="footer__categories">
        <li><Link to="/posts/categories/Cultura">Cultura</Link></li>
        <li><Link to="/posts/categories/Viajes">Viajes</Link></li>
        <li><Link to="/posts/categories/Tecnologia">Tecnologia</Link></li>
        <li><Link to="/posts/categories/Entretenimiento">Entretenimiento</Link></li>
        <li><Link to="/posts/categories/Arte">Arte</Link></li>
        <li><Link to="/posts/categories/Eventos">Eventos</Link></li>
        <li><Link to="/posts/categories/SinCategorizar">SinCategorizar</Link></li>
        <li><Link to="/posts/categories/Gastronomia">Gastronomia</Link></li>
      </ul>
      <div className="footer__copyright">
        <small>Elizabeth Guzman &copy; Proyecto Final</small>
      </div>
    </footer>
  );
};

export default Footer;
