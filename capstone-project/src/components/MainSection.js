import React from 'react';
import { Button } from './Button';
import '../App.css';
import './MainSection.css'

function MainSection() {
    return (
        <div className='hero-container'>

            <video src="./videos/video_background.mp4" autoPlay loop muted />
            <h1>Boost Your Productivity</h1>
            <p>All your meetings and work items in one place!</p>
            <div className='hero-btns'>
                <Button className='btns' buttonStyle='btn--outline' buttonSize='btn--large'>Start Here</Button>

            </div>

        </div>
    )
}

export default MainSection
