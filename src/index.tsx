import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app/App';

let rootElement = document.getElementById('root');
if (!rootElement) {
    alert("no root element");
} else {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
}
