import { useEffect, useRef, useState } from "react"
import Peer from "simple-peer"
import io from "socket.io-client"

export const useConnect = (url) => {
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