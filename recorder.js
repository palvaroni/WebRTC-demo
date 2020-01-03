function download(data) {
    var blob = new Blob(data, {
        type: "video/webm"
    });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "test.webm";
    a.click();
    window.URL.revokeObjectURL(url);
}

function record(video) {
    let stream = video.captureStream();
    let recordedChunks = [];

    let options = { mimeType: 'video/webm; codecs=vp9' };
    let mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = function (event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
            download(recordedChunks);
        }
    }

    mediaRecorder.start();

    setTimeout(_ => {
        record(video);
        mediaRecorder.stop();
    }, 60000);
}