import React from 'react'
import UserAPP from './views/app'
const App = () => {
	return (
		<div style={{display: 'flex'}}>

			<UserAPP username="panuwat1@email.com" password="P@ssword#1234"/>
			<UserAPP username="panuwat2@email.com" password="P@ssword#1234"/>
			{/* <UserAPP username="panuwat3@email.com" password="P@ssword#1234"/> */}
		</div>
	)
}

export default App