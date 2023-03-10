window.onload = () => {
  document.getElementById('my-button').onclick = () => {
    console.log('Clicked My Start Stream')
    //debugger;

      init();
  }
}

async function init() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  document.getElementById("video").srcObject = stream

  //  Here is where peer.setRemoteDescription is getting sent back to us by the broadcaster.
  //const peer = createPeer(userId);
  const peer = createPeer();

  //The calling peer is the only one that has to create this everyone else listens
  sendChannel = peer.createDataChannel("sendChannel")
  sendChannel.onmessage = handleReceiveMessage



  // We illterate over the stream
  //return stream.getTracks().forEach(track => peer.addTrack(track, stream));
  stream.getTracks().forEach(track => peer.addTrack(track, stream))
  return;
  //const peer = createPeer();
  //peer.addTransceiver("video", {direction: "recvonly"})
  
}

function handleReceiveMessage(e){
  setMessages(messages => [...messages, {yours: false, value: e.data }])
}

function createPeer() {
  const peer = new RTCPeerConnection({
      iceServers: [
          {
              urls: "stun:stun.stunprotocol.org"
          }
      ]
  })


  peer.onicecandidate = e => console.log("Line 47 Remote Ice Candidate! printing SDP" + JSON.stringify(peer.localDescription))

  peer.ondatachannel = e => {
    peer.dc = e.channel
    peer.dc.onmessage = e => console.lof("new messa from client !" + e.data)
    peer.dc.onopen = e => console.log("Connection OPENED!!!!")
  }

  // WE need this even because we are the ones intiating the offer
  peer.onnegotiationneeded = (e) => handleNegotiationNeededEvent(peer).then(a=> console.log("pc.signalingState:", peer.signalingState ))
  console.log('peer', peer)
  return peer
}

async function handleNegotiationNeededEvent(peer) {
  // Here is where we create the offer and send it down the server
  // Where the server is to accept the offer.

  const offer = await peer.createOffer()
  await peer.setLocalDescription(offer)
  const payload = {
      sdp: peer.localDescription
  };

  // The way we exnd this offer and send it down server using and axios endpont.
  const { data } = await axios.post('/broadcast', payload)
  const LocalDescription = new RTCSessionDescription(data.sdp)
  // peer.setRemoveDescription is where the server accepts teh answer
  // This where the handshake happens betweenm the browser and the server.
  peer.setRemoteDescription(LocalDescription).catch(e => console.log('offer like setRemoteDescription e:'+e))
  return
}

function handleTrackEvent(e){
  document.getElementById("video").srcObject = e.streams[0]
  return
}