import './styles/global.css';
import { initFeedbackForm } from '../features/feedback/feedbackSubmit';
import { initSpeechAnalyzer } from '../features/ai-speech/speechService';

document.addEventListener('DOMContentLoaded', () => {
  initFeedbackForm();
  initSpeechAnalyzer();
  console.log('🚀 TS FSD Architecture Initialized');
});