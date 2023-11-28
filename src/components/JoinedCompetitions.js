import React from 'react';

const JoinedCompetitions = ({ joinedCompetitions }) => {
  return (
    <div>
      <h2>Joined Competitions</h2>
      <ul>
        {joinedCompetitions.map((competition) => (
          <li key={competition.id}>{competition.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default JoinedCompetitions;
