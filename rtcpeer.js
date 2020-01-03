async function sendStream(stream, video) {
    const config = null;
    const conn1 = new RTCPeerConnection(config);
    const conn2 = new RTCPeerConnection(config);

    let videoTracks = stream.getVideoTracks();
    let audioTracks = stream.getAudioTracks();
    if (videoTracks.length > 0) {
        console.log('Using video device: ' + videoTracks[0].label);
    }
    if (audioTracks.length > 0) {
        console.log('Using audio device: ' + audioTracks[0].label);
    }

    // send any ice candidates to the other peer
    conn1.onicecandidate = ({ candidate }) => addTo(conn2, candidate);
    conn2.onicecandidate = ({ candidate }) => addTo(conn1, candidate);

    conn2.onaddstream = _ => {
        if ('srcObject' in video && !video.srcObject) video.srcObject = stream;
        // Avoid using this in new browsers, as it is going away.
        else if (!video.src) video.src = window.URL.createObjectURL(stream);

        video.addEventListener('loadedmetadata', function (e) {
            video.play();
        });
    };

    conn1.addStream(stream);

    try {
        let desc = await conn1.createOffer({
            offerToReceiveAudio: 0,
            offerToReceiveVideo: 1
        });

        await conn1.setLocalDescription(desc);
        await conn2.setRemoteDescription(desc);

        let ansDesc = await conn2.createAnswer();
        await conn2.setLocalDescription(ansDesc);
        await conn1.setRemoteDescription(ansDesc);

    } catch (err) {
        console.error(err);
    }
}

async function addTo(conn, candidate) {
    try {
        return await conn.addIceCandidate(candidate);
    } catch (err) {
        console.error(err);
    }
}