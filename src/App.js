import { useState, useEffect, useRef } from "react"

function App() {
  const [value, setValue] = useState("")
  const [message, setMessage] = useState(null)
  const [prevChats, setPrevChats] = useState([])
  const [currentTitle, setCurrentTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const feedRef = useRef(null)

  const createNewChat = () => {
    setMessage("")
    setValue("")
    setCurrentTitle(null)
  }

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle)
    setMessage("")
    setValue("")
  }

  const getMessages = async () => {
    const options = {
      method: "POST",
      body: JSON.stringify({
        message: value
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }

    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/completions', options)
      const data = await response.json()
      setMessage(data.choices[0].message)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    console.log(currentTitle, value, message)

    if (!currentTitle && value && message)
    {
      setCurrentTitle(value)
    }
    if (currentTitle && value && message)
    {
      setPrevChats(prevChats => (
        [...prevChats, 
          {
            title: currentTitle,
            role: "user",
            content: value
          }, 
          {
            title: currentTitle,
            role: message.role,
            content: message.content
          }
        ]
      ))

      setValue('') // clear the input field after the bot has responded
      setLoading(false)
    }

    // auto-scroll to the bottom so that the user does not have to manually scroll down to see the response
    if (feedRef.current) {
      setTimeout(() => {
        feedRef.current.scrollTop = feedRef.current.scrollHeight
      }, 10)
    }
  }, [message, currentTitle])


  const currentChat = prevChats.filter(prevChat => prevChat.title === currentTitle)
  const uniqueTitles = Array.from(new Set(prevChats.map(prevChat => prevChat.title)))


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') 
    {
      getMessages()
    }
  }

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New Chat</button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle, index) => <li key={index} onClick={() => handleClick(uniqueTitle)}>{uniqueTitle}</li>)}
        </ul>
        <nav>
          <p>Made by Luis</p>
        </nav>
      </section>
      <section className="main">
        <h1>LuisGPT</h1>
        <ul className="feed" ref={feedRef}>
          {currentChat?.map((chatMessage, index) => <li key={index}>
            <p className="role">{chatMessage.role}</p>
            <p>{chatMessage.content}</p>
          </li>)}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={handleKeyDown}/>
            {loading ? <div className="loading"><div></div><div></div><div></div></div> : <div id="submit" onClick={getMessages}>➢</div>}
          </div>
          <p className="info">
            A ChatGPT clone by Luis Perez Lemus
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
