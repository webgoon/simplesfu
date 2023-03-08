window.onload = () => {
  document.getElementById('my-button').onclick = () => {
    console.log('Clicked My Start Stream')
    //debugger;

      init();
  }
}

async function init() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  document.getElementById("video").srcObject = stream;

  //  Here is where peer.setRemoteDescription is getting sent back to us by the broadcaster.
  const peer = createPeer();
  // We illterate over the stream
  //return stream.getTracks().forEach(track => peer.addTrack(track, stream));
  stream.getTracks().forEach(track => peer.addTrack(track, stream));
  return;
  //const peer = createPeer();
  //peer.addTransceiver("video", {direction: "recvonly"})
  
}


function createPeer() {
  const peer = new RTCPeerConnection({
      iceServers: [
          {
              urls: "stun:stun.stunprotocol.org"
          }
      ]
  });
  // WE need this even because we are the ones intiating the offer
  peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
  console.log('peer', peer);
  return peer;
}

async function handleNegotiationNeededEvent(peer) {
  // Here is where we create the offer and send it down the server
  // Where the server is to accept the offer.

  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  const payload = {
      sdp: peer.localDescription
  };

  // The way we exnd this offer and send it down server using and axios endpont.
  const { data } = await axios.post('/broadcast', payload);
  const desc = new RTCSessionDescription(data.sdp);
  // peer.setRemoveDescription is where the server accepts teh answer
  // This where the handshake happens betweenm the browser and the server.
  peer.setRemoteDescription(desc).catch(e => console.log('setRemoteDescription e:'+e));
  return;
}

function handleTrackEvent(e){
  document.getElementById("video").srcObject = e.streams[0];
  return;
}