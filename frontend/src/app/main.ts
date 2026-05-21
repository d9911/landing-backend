import './styles/global.css'
import './styles/experience-slider.css'

import { initFeedbackForm } from '../features/feedback/feedbackSubmit'
import { initSpeechAnalyzer } from '../features/ai-speech/speechService'

document.addEventListener('DOMContentLoaded', () => {
  initFeedbackForm()
  initSpeechAnalyzer()
  initExperienceSlider()
  console.log('🚀 TS FSD Architecture Initialized')
})
function initExperienceSlider(): void {
  const track = document.getElementById('experience-slider-track') as HTMLDivElement | null
  const leftBtn = document.getElementById('slide-left-trigger') as HTMLButtonElement | null
  const rightBtn = document.getElementById('slide-right-trigger') as HTMLButtonElement | null

  if (!track || !leftBtn || !rightBtn) return

  const getScrollStep = (): number => {
    const firstCard = track.querySelector('.project-slide-card') as HTMLElement | null
    return firstCard ? firstCard.offsetWidth + 28 : 450
  }

  const updateButtonsState = () => {

    if (track.scrollLeft <= 5) {
      leftBtn.disabled = true
      leftBtn.classList.add('disabled')
    } else {
      leftBtn.disabled = false
      leftBtn.classList.remove('disabled')
    }


    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 5) {
      rightBtn.disabled = true
      rightBtn.classList.add('disabled')
    } else {
      rightBtn.disabled = false
      rightBtn.classList.remove('disabled')
    }
  }

  leftBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' })
  })

  rightBtn.addEventListener('click', () => {
    track.scrollBy({ left: getScrollStep(), behavior: 'smooth' })
  })

  track.addEventListener('scroll', () => {
    requestAnimationFrame(updateButtonsState)
  })

  window.addEventListener('resize', () => requestAnimationFrame(updateButtonsState))


  setTimeout(() => {
    updateButtonsState()
  }, 100)
}
