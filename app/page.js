'use client'
import React, { useEffect, useState } from "react"
import { useConnect } from "./useConnect"

const SOCKET_URL = 'http://localhost:3001'

export default function Page() {
  const [joinId, setJoinId] = useState(null)

  const { id, status, myVideo, externalVideo, join, accept, leave } = useConnect(SOCKET_URL)

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const id = urlParams.get('id')
    if (id) {
      setJoinId(id)
    }
  }, [])


  const copyMeetUrlToClipboard = () => {
    const meetUrl = `${location.origin}?id=${id}`
    navigator.clipboard.writeText(meetUrl)
  }

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
          {joinId === null ? (
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={copyMeetUrlToClipboard}
            >Copy meet url
            </button>
          ) : status === 'online' ? (
            <button onClick={leave}>
              End Call
            </button>
          ) : (<button onClick={() => join(joinId)}>
            Join to Meet
          </button>)
          }
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