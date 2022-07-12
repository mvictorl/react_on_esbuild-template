import React from 'react'
import './index.css'

function App() {
	const [counter, setCounter] = React.useState<number>(11)
	return (
		<div>
			<span>Welcome to React!</span>
			<br />
			<h3>Counter = {counter}</h3>
			<button onClick={() => setCounter(counter + 1)}>Add +1</button>
			<br />
		</div>
	)
}

export default App
