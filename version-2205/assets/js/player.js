(function () {
    window.initializeMoviePlayer = function (video, button, shell, source) {
        if (!video || !source) {
            return;
        }

        let hls = null;
        let attached = false;

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            attachSource();
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        function toggleVideo() {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                toggleVideo();
            });
        }

        video.addEventListener("click", toggleVideo);
        video.addEventListener("play", function () {
            if (shell) {
                shell.classList.add("is-playing");
            }
        });
        video.addEventListener("pause", function () {
            if (shell) {
                shell.classList.remove("is-playing");
            }
        });
        video.addEventListener("ended", function () {
            if (shell) {
                shell.classList.remove("is-playing");
            }
        });
        attachSource();
    };
}());
