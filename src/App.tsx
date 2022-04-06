import React, { FC } from 'react';
import './scss/_main.scss';
import Room from './pages/Room';

const App: FC = () => (
  <div className="wrapper">
    <div className="container">
      <Room />
    </div>
  </div>
);

export default App;
