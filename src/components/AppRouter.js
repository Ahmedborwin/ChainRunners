import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Components
import App from './App';
import CreateCompetition from './CreateCompetition';
import Dashboard from './Dashboard';
import JoinNewCompetition from './JoinNewCompetition';
import UserProfile from './UserProfile';

const AppRouter = () => {
  return (
    <Router>
      <Container>
        <Switch>
          <Route path="/" exact component={App} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/create-competition" component={CreateCompetition} />
          <Route path="/joined-competitions" component={JoinNewCompetition} />
          <Route path="/user-profile" component={UserProfile} />
        </Switch>
      </Container>
    </Router>
  );
};

export default AppRouter;