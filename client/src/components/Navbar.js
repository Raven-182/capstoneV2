/*import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import './Navbar.css';
import { auth } from '../firebaseConfig'; // Import your Firebase config

function Navbar({ userEmail }) {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  
  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
    window.addEventListener('resize', showButton);
    
    return () => window.removeEventListener('resize', showButton); // Clean up the event listener
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut(); // Sign out the user
      closeMobileMenu();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            <i className="fas fa-book"></i> LifeLine 
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/' className='nav-links' onClick={closeMobileMenu}>Home</Link>
            </li>
            <li className='nav-item'>
              <Link to='/calendars' className='nav-links' onClick={closeMobileMenu}>Your Calendars</Link>
            </li>
            <li className='nav-item'>
              <Link to='/notes' className='nav-links' onClick={closeMobileMenu}>Your Meetings</Link>
            </li>
            <li className='nav-item'>
              <Link to='/journals' className='nav-links' onClick={closeMobileMenu}>Journal</Link>
            </li>
            <li className='nav-item'>
              <Link to='/moodsurvey' className='nav-links' onClick={closeMobileMenu}>Mood Survey</Link>
            </li>
          </ul>
          {userEmail ? (
            <Button onClick={handleSignOut} buttonStyle='btn--outline'>Sign Out</Button>
          ) : (
            button && <Link to='/sign-up'><Button buttonStyle='btn--outline'>Sign Up</Button></Link>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
*/
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import './Navbar.css';
import { auth } from '../firebaseConfig';

function Navbar({ userEmail }) {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  
  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
    window.addEventListener('resize', showButton);
    
    return () => window.removeEventListener('resize', showButton);
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      closeMobileMenu();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            <i className="fas fa-book"></i> LifeLine 
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            {userEmail ? ( // Render links only if the user is signed in
              <>
                <li className='nav-item'>
                  <Link to='/' className='nav-links' onClick={closeMobileMenu}>Home</Link>
                </li>
                <li className='nav-item'>
                  <Link to='/calendars' className='nav-links' onClick={closeMobileMenu}>Your Calendars</Link>
                </li>
                <li className='nav-item'>
                  <Link to='/notes' className='nav-links' onClick={closeMobileMenu}>Your Meetings</Link>
                </li>
                <li className='nav-item'>
                  <Link to='/journals' className='nav-links' onClick={closeMobileMenu}>Journal</Link>
                </li>
                <li className='nav-item'>
                  <Link to='/moodsurvey' className='nav-links' onClick={closeMobileMenu}>Mood Survey</Link>
                </li>
              </>
            ) : (
              <li className='nav-item'>
                <span className='signin-message'>Please sign in to access</span>
              </li>
            )}
          </ul>
          {userEmail ? (
            <Button onClick={handleSignOut} buttonStyle='btn--outline'>Sign Out</Button>
          ) : (
            button && <Link to='/sign-up'><Button buttonStyle='btn--outline'>Sign Up</Button></Link>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
