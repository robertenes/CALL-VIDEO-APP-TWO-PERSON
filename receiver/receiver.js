const webSocket = new WebSocket("ws://192.168.1.24:3000") //web socket nesnesi oluşturduk

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}
function handleSignallingData(data) {
    switch (data.type){
        case "offer":
            peerConn.setRemoteDescription(data.offer)
            crateAndsendAnswer()
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

function crateAndsendAnswer()
{
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer)
        sendData({
            type:"send_answer",
            answer: answer
        })
    }, error =>{
        console.log(error)
    })
}

function sendData(data)
{
    data.username = username // data ya kullancı adını attık.
    webSocket.send(JSON.stringify(data)) // Json formatında veri gonderdik diziye cevirip nesneyi
}
let localStream 
let peerConn
let username // kullanıcı adını tanımladık

function joinCall()
{
    username = document.getElementById("username-input").value
    document.getElementById("video-call-div").style.display = "inline"
    navigator.getUserMedia({
        video: {
            frameRate: 24, // hız
            width: {
                min: 480, ideal: 720, max:1280
            },
            aspectRatio: 1.33333 // 4x3 ekran
        },
        audio:true
    }, (stream) => {
        localStream  = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun3.l.google.com:19302"
                ]
                }
            ]
        }
        peerConn = new RTCPeerConnection(configuration)
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video")
            .srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if(e.candidate == null)
               return 

               sendData({
                type: "send_candidate",
                candidate: e.candidate
            })
        })

        sendData({
            type:"join_call"
        })
    }, (error) => {
        console.log(error)
    })
}

let isAudio = true
function muteAudio()
{
    isAudio = !isAudio

    localStream.getAudioTracks()[0].enabled = isAudio
}
let isVideo = true
function muteVideo()
{
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}