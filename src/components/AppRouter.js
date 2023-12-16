import React from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Container } from "react-bootstrap"

// Components
import App from "./App"
import CreateCompetition from "./CreateCompetition"
import Dashboard from "./Dashboard"
import JoinNewCompetition from "./JoinCompetition"

const AppRouter = () => {
    return (
        <Router>
            <Container>
                <Switch>
                    <Route path="/" exact component={App} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/create-competition" component={CreateCompetition} />
                    <Route path="/join-competition" component={JoinNewCompetition} />
                </Switch>
            </Container>
        </Router>
    )
}

export default AppRouter
