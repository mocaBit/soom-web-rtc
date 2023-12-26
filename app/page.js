'use client'
import React, { useState } from "react"

export default function Page() {
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