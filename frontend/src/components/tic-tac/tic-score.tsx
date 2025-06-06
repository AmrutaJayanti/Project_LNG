import React from 'react';
import '../../styles/ticTacToe.css';

interface ITicScore {
  myScore: number;
  oponentName: string;
  oponentScore: number;
}

const TicScore: React.FC<ITicScore> = ({ myScore, oponentName, oponentScore }) => {
  return (
    <div className="ticScore">
      <div className="score" data-player="you">
        <p>You</p>
        <h3>{myScore}</h3>
      </div>
      <div className="score" data-player="opponent">
        <p>{oponentName || 'Opponent'}</p>
        <h3>{oponentScore}</h3>
      </div>
    </div>
  );
};

export default TicScore;