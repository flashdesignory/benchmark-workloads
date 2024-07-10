function run() {
    const ad = document.querySelector("#ad");
    const frames = [...ad.querySelectorAll(".frame")];

    const canvas = document.getElementById("js-confetti-canvas");
    const jsConfetti = new JSConfetti({ canvas });

    frames.forEach((frame) => frame.classList.remove("show"));

    const replay = document.querySelector("#replay");
    replay.addEventListener("click", () => {
        start();
    });

    const button = document.querySelector("#action");
    action.addEventListener("click", () => {
        jsConfetti.addConfetti();
    });

    let animationIndex = 0;
    let frameDelay = 2000;

    function handleFrameAnimationsComplete() {
        animationIndex++;
        if (frames[animationIndex] !== undefined) {
            setTimeout(
                () => frames[animationIndex].classList.add("show"),
                frameDelay
            );
        }
    }

    frames.forEach((frame) => {
        const items = [...frame.querySelectorAll(".item")];
        let numAnimations = 0;

        if (frame.classList.contains("animated")) {
            numAnimations++;
        }

        items.forEach((item) => {
            if (item.classList.contains("animated")) {
                numAnimations++;
            }
        });

        function handleAnimationEnd() {
            numAnimations--;

            if (numAnimations === 0) {
                frame.removeEventListener("animationend", handleAnimationEnd);
                handleFrameAnimationsComplete();
                return;
            }
        }

        frame.addEventListener("animationend", handleAnimationEnd);

        if (numAnimations === 0) {
            handleFrameAnimationsComplete();
            return;
        }
    });

    frames[animationIndex].classList.add("show");
}

function start() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const newAd = ad.cloneNode(true);
                document.body.replaceChildren();
                document.body.append(newAd);
                run();
            }
        });
    });

    observer.observe(document.querySelector("#ad"));
}

function setSize() {
    const urlParams = new URLSearchParams(window.location.search);
    const w = urlParams.get("w")?.toLowerCase();
    const h = urlParams.get("h")?.toLowerCase();
    if (w & h) {
        document.documentElement.style.setProperty("--adWidth", `${w}px`);
        document.documentElement.style.setProperty("--adHeight", `${h}px`);
    }
}

setSize();
start();
