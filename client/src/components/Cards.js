import React from 'react'
import CardItem from './CardItem'
import './Cards.css'

function Cards() {
    return (
        <div className='cards'>
            <h1>Our Services</h1>
            <div className='cards__container'>
                <div className='cards__wrapper'>
                    <ul className='cards__items'>
                        <CardItem src='./images/notes.jpg' text='Access past meetings and AI generated meeting notes' label='Meeting Notes' path='/notes' />
                        <CardItem src='./images/video_conferencing.jpeg' text='All your work items in one place' label='Calendar Integration' path='/calendars' />
                     </ul>
                     <ul className='cards__items'>  
                        <CardItem src='./images/journal.jpg' text='Record your feelings - Say it or Type it out' label='Voice and Text Journal' path='/journals' />
                        <CardItem src='./images/mood.jpg' text='Ensure a work life balance using our AI mood check-in' label='Mood Check-In' path='/journals' />


                    </ul>
                </div>


            </div>
        </div>
    )
}

export default Cards
