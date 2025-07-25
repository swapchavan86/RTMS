import React from 'react';
import { createRoot } from 'react-dom/client'; // For React 18+
import './index.css'; // General app styling, will create this next
import App from './App';
// import reportWebVitals from './reportWebVitals'; // Removed as file doesn't exist and not critical

const container = document.getElementById('root');
const root = createRoot(container); // Create a root.

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(); // Removed as file doesn't exist and not critical
