import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Components
import App from './App';
import CreateCompetition from './CreateCompetition';
import JoinedCompetitions from './JoinedCompetitions';
import Dashboard from './Dashboard';

const AppRouter = () => {
  return (
    <Router>
      <Container>
        <Switch>
          <Route path="/" exact component={App} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/create-competition" component={CreateCompetition} />
          <Route path="/joined-competitions" component={JoinedCompetitions} />
        </Switch>
      </Container>
    </Router>
  );
};

export default AppRouter;