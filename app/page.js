'use client'
import React, { useEffect, useRef, useState } from "react"
import Peer from "simple-peer"
import io from "socket.io-client"

const useConnect = (url) => {
  const socket = useRef(null)
  const connectionRef = useRef(null)

  const myVideo = useRef()
  const externalVideo = useRef()

  const [meetId, setMeetId] = useState(null)
  const [meetStatus, setMeetStatus] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        myVideo.current.srcObject = stream
      })

    socket.current = io.connect(url)
    socket.current.on("meetId", setMeetId)
    socket.current.on("meetEnd", leaveMeet)
    socket.current.on("joinMeet", ({ from, signal }) => {
      setMeetStatus('requested')
      setIncomingCall({ from, signal })
    })

    return leaveMeet;
  }, [])

  const joinMeet = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: myVideo.current.srcObject
    })

    peer.on("signal", (signal) => {
      socket.current.emit("joinMeet", {
        from: meetId,
        to: id,
        signal,
      })
    })

    peer.on("stream", (stream) => {
      externalVideo.current.srcObject = stream
    })

    socket.current.on("acceptRequest", (signal) => {
      setMeetStatus('online')
      peer.signal(signal)
    })

    connectionRef.current = peer
  }

  const acceptRequest = () => {
    if (incomingCall === null) return

    setMeetStatus('online')

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: myVideo.current.srcObject
    })

    peer.on("signal", (signal) => {
      socket.current.emit("acceptRequest", { signal, to: incomingCall.from })
    })

    peer.on("stream", (stream) => {
      externalVideo.current.srcObject = stream
    })

    peer.signal(incomingCall.signal)

    connectionRef.current = peer
  }

  const leaveMeet = () => {
    setMeetStatus(null)
    if (connectionRef.current) {
      connectionRef.current.destroy()
    }
  }

  return {
    id: meetId,
    status: meetStatus,
    myVideo,
    externalVideo,
    join: joinMeet,
    accept: acceptRequest,
    leave: leaveMeet,
  }
}

function App() {
  const [joinId, setJoinId] = useState('')

  const { id, status, myVideo, externalVideo, join, accept, leave } = useConnect('http://localhost:3001')

  return (
    <>
      <h1>Soom</h1>
      <div>
        <div>
          <div>
            <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />
          </div>
          <div>
            {status === 'online' ?
              <video playsInline ref={externalVideo} autoPlay style={{ width: "300px" }} /> :
              null}
          </div>
        </div>
        <div>
          <label>Meet id: [{id}]</label>
          <br />
          <label>
            Join Meet Id:
            <input value={joinId} onChange={(e) => setJoinId(e.target.value)} />
          </label>
          <div>
            {status === 'online' ? (
              <button onClick={leave}>
                End Call
              </button>
            ) : (
              <button onClick={() => join(joinId)}>
                Join to Meet
              </button>
            )}
            {joinId}
          </div>
        </div>
        <div>
          {status === 'requested' ? (
            <div className="caller">
              <h1 >there is a call request...</h1>
              <button onClick={accept}>
                Answer
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default App