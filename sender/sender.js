const webSocket = new WebSocket("ws://192.168.1.24:3000") //web socket nesnesi oluşturduk

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}
function handleSignallingData(data) {
    switch (data.type){
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}
let username // kullanıcı adını tanımladık
function sendUsername(){ // sunucuya username gonderme fonksiyonu
    username = document.getElementById("username-input").value // kullanıcı adımızı aldık
    sendData({ // veri gonderme fonksiyonu object parametresi ile
        type: "store_user" // type kullanıcı sakla olarak ayarlandı. Bu şekilde kullanıcı saklamamız gerektiğini biliyoruz.
    })
}

function sendData(data)
{
    data.username = username // data ya kullancı adını attık.
    webSocket.send(JSON.stringify(data)) // Json formatında veri gonderdik diziye cevirip nesneyi
}
let localStream 
let peerConn
function startCall()
{
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
            document.getElementById("remote-video").srcObject = e.stream
        }
      
        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })
        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })
}

function createAndSendOffer()
{
    peerConn.createOffer((offer) => {
        sendData({
            type:"store_offer",
            offer: offer
        })
        peerConn.setLocalDescription(offer)
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