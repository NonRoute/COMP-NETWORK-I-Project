import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import Register from './Register'
import reportWebVitals from './reportWebVitals'
import { useNavigate, Route, Routes, BrowserRouter } from 'react-router-dom'
import { LoginCallback, Security } from '@okta/okta-react'
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js'
import EditProfile from './EditProfile'
import { useAuth } from './auth'

const oktaAuth = new OktaAuth({
	issuer: `${process.env.REACT_APP_OKTA_ORG_URL}/oauth2/default`,
	clientId: process.env.REACT_APP_OKTA_CLIENT_ID,
	redirectUri: `${window.location.origin}/login/callback`,
})

function SecuredRoutes(props) {
	const navigate = useNavigate()
	const restoreOriginalUri = async (_oktaAuth, originalUri) => {
		navigate(toRelativeUrl(originalUri || '/', window.location.origin), { replace: true })
	}

	return (
		<Security oktaAuth={oktaAuth} restoreOriginalUri={restoreOriginalUri}>
			<Routes>
				<Route path="/" exact element={<App />} />
				<Route path="/register" exact element={<Register />} />
				<Route path="/login/callback" exact element={<LoginCallback />} />
				<Route path="/edit" exact element={<EditProfile />} />
			</Routes>
		</Security>
	)
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<BrowserRouter>
		<SecuredRoutes />
	</BrowserRouter>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
