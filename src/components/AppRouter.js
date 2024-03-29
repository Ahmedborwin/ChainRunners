import React from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Container } from "react-bootstrap"
import Navigation from "./Greeter/Navigation"

// Components
import App from "./App"
import CreateCompetition from "./CreateCompetition"
import Dashboard from "./Dashboard"
import JoinNewCompetition from "./JoinCompetition"
import NFTPortfolio from "./NFTPortfolio/Index"

const AppRouter = () => {
    return (
        <Router>
            <Container>
                <Navigation />
                <Switch>
                    <Route path="/" exact component={App} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/create-competition" component={CreateCompetition} />
                    <Route path="/join-competition" component={JoinNewCompetition} />
                    <Route path="/nft-portfolio" component={NFTPortfolio} />
                </Switch>
            </Container>
        </Router>
    )
}

export default AppRouter
