import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';


function Menu() {
    return (
      <nav>
        <ul>
          <li>
            <NavLink to="/apirest">API Rest</NavLink>
            <li><Link to="/">Página Principal</Link></li>
            
          </li>
          {/* Agrega más elementos del menú aquí */}
        </ul>
      </nav>
    );
  }
  
  export default Menu;
  