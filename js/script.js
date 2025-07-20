document.addEventListener("DOMContentLoaded", function () {
    let listening = false;
    let recognition;
    let currentParagraph = "";
    let paragraphs = [];

    const toggleButton = document.getElementById("toggleListen");
    const paragraphsDiv = document.getElementById("paragraphs");
    const gptResponseDiv = document.getElementById("gptResponse");

    function scrollToBottom(element) {
        element.scrollTop = element.scrollHeight;
    }

    if ("webkitSpeechRecognition" in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = function (event) {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    currentParagraph += event.results[i][0].transcript + " ";
                    addParagraph(currentParagraph.trim());
                    currentParagraph = "";
                } else {
                    interim += event.results[i][0].transcript;
                }
            }
        };

        recognition.onerror = function (event) {
            console.error("Speech recognition error", event);
        };
    }

    toggleButton.onclick = function () {
        if (!listening) {
            recognition.start();
            toggleButton.textContent = "Stop Listening";
        } else {
            recognition.stop();
            toggleButton.textContent = "Start Listening";
        }
        listening = !listening;
    };

    function addParagraph(text) {
        if (!text) return;
        paragraphs.push(text);
        const paraDiv = document.createElement("div");
        paraDiv.className = "paragraph";
        const p = document.createElement("p");
        p.textContent = text;
        const btn = document.createElement("button");
        btn.textContent = "Ask GPT";
        btn.onclick = function () {
            askGPT(paragraphs.length - 1);
        };
        paraDiv.appendChild(p);
        paraDiv.appendChild(btn);
        paragraphsDiv.appendChild(paraDiv);
        scrollToBottom(paragraphsDiv);
    }

    function askGPT(index) {
        const text = paragraphs[index];
        gptResponseDiv.textContent = "Loading...";
        scrollToBottom(gptResponseDiv);
        fetch("https://api.example.com/gpt4mini", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt: text })
        })
            .then(response => response.json())
            .then(data => {
                gptResponseDiv.textContent = data.response || "No response received.";
                scrollToBottom(gptResponseDiv);
            })
            .catch(error => {
                console.error("Error:", error);
                gptResponseDiv.textContent = "Error fetching response.";
                scrollToBottom(gptResponseDiv);
            });
    }
});
