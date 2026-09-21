const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");

const videoIdea = document.getElementById("videoIdea");
const thumbnailText = document.getElementById("thumbnailText");
const style = document.getElementById("style");

const thumbnailPreview =
    document.getElementById("thumbnailPreview");

let generatedImage = null;


/* =========================================
   GENERATE
========================================= */

generateBtn.addEventListener("click", async () => {

    const idea = videoIdea.value.trim();
    const text = thumbnailText.value.trim();
    const selectedStyle = style.value;

    if (!idea) {

        alert("Enter a video idea first.");

        videoIdea.focus();

        return;
    }


    generateBtn.disabled = true;

    generateBtn.innerHTML = `
        <span>⏳</span>
        Creating...
    `;


    thumbnailPreview.innerHTML = `
        <div class="empty-preview">

            <div class="empty-icon">
                ✨
            </div>

            <h3>Creating your thumbnail...</h3>

            <p>
                Thumora is creating the scene.
                This can take a little while.
            </p>

        </div>
    `;


    try {

        const response = await fetch("/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                videoIdea: idea,

                thumbnailText: text,

                style: selectedStyle

            })

        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Something went wrong."
            );
        }


        generatedImage = data.image;


        createThumbnailCanvas(
            data.image,
            text
        );


    } catch (error) {

        console.error(error);

        thumbnailPreview.innerHTML = `
            <div class="empty-preview">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>Generation failed</h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

    }


    generateBtn.disabled = false;

    generateBtn.innerHTML = `
        <span>✨</span>
        Generate Thumbnail
    `;

});


/* =========================================
   CREATE PROFESSIONAL THUMBNAIL
========================================= */

function createThumbnailCanvas(
    imageUrl,
    text
) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 1280;
    canvas.height = 720;

    const ctx = canvas.getContext("2d");

    const image = new Image();

    image.crossOrigin = "anonymous";

    image.onload = () => {

        /*
        =====================================
        COVER IMAGE
        =====================================
        */

        const imageRatio =
            image.width / image.height;

        const canvasRatio =
            canvas.width / canvas.height;

        let drawWidth;
        let drawHeight;
        let offsetX;
        let offsetY;

        if (imageRatio > canvasRatio) {

            drawHeight = canvas.height;

            drawWidth =
                image.height *
                canvas.width /
                canvas.height;

            offsetX =
                (canvas.width -
                    drawWidth) / 2;

            offsetY = 0;

        } else {

            drawWidth = canvas.width;

            drawHeight =
                image.width *
                canvas.height /
                image.width;

            offsetX = 0;

            offsetY =
                (canvas.height -
                    drawHeight) / 2;
        }


        ctx.drawImage(
            image,
            offsetX,
            offsetY,
            drawWidth,
            drawHeight
        );


        /*
        =====================================
        DARK GRADIENT FOR TEXT
        =====================================
        */

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                700,
                0
            );

        gradient.addColorStop(
            0,
            "rgba(0,0,0,0.88)"
        );

        gradient.addColorStop(
            0.45,
            "rgba(0,0,0,0.55)"
        );

        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            800,
            720
        );


        /*
        =====================================
        TEXT
        =====================================
        */

        if (text) {

            const lines =
                splitTextIntoLines(
                    text,
                    20
                );

            const maxWidth = 570;

            let fontSize = 82;

            if (text.length > 18) {
                fontSize = 72;
            }

            if (text.length > 28) {
                fontSize = 62;
            }

            ctx.font =
                `900 ${fontSize}px Arial`;

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            const lineHeight =
                fontSize * 0.92;

            const totalHeight =
                lines.length *
                lineHeight;

            let y =
                (canvas.height -
                    totalHeight) / 2;


            lines.forEach((line) => {

                /*
                Shadow
                */

                ctx.lineWidth = 18;

                ctx.strokeStyle =
                    "rgba(0,0,0,0.85)";

                ctx.strokeText(
                    line,
                    65,
                    y + lineHeight / 2,
                    maxWidth
                );


                /*
                Main text
                */

                ctx.fillStyle =
                    "#ffffff";

                ctx.fillText(
                    line,
                    65,
                    y + lineHeight / 2,
                    maxWidth
                );


                y += lineHeight;

            });

        }


        /*
        =====================================
        BORDER
        =====================================
        */

        ctx.strokeStyle =
            "rgba(255,255,255,0.15)";

        ctx.lineWidth = 8;

        ctx.strokeRect(
            4,
            4,
            1272,
            712
        );


        /*
        =====================================
        SHOW RESULT
        =====================================
        */

        const finalImage =
            canvas.toDataURL(
                "image/png",
                1.0
            );

        generatedImage =
            finalImage;

        thumbnailPreview.innerHTML = `
            <img
                src="${finalImage}"
                alt="Generated Thumora thumbnail"
                class="generated-thumbnail"
            >
        `;

        downloadBtn.disabled = false;

    };


    image.onerror = () => {

        throw new Error(
            "The generated image could not be loaded."
        );

    };


    image.src = imageUrl;

}


/* =========================================
   TEXT WRAPPING
========================================= */

function splitTextIntoLines(
    text,
    maxWords
) {

    const words =
        text.trim().split(/\s+/);

    const lines = [];

    let current = "";

    words.forEach(word => {

        const test =
            current
                ? current + " " + word
                : word;

        if (test.length > maxWords) {

            if (current) {
                lines.push(current);
            }

            current = word;

        } else {

            current = test;

        }

    });

    if (current) {
        lines.push(current);
    }

    return lines.slice(0, 3);
}


/* =========================================
   DOWNLOAD
========================================= */

downloadBtn.addEventListener(
    "click",
    () => {

        if (!generatedImage) {
            return;
        }

        const link =
            document.createElement("a");

        link.href =
            generatedImage;

        link.download =
            "thumora-thumbnail.png";

        document.body.appendChild(link);

        link.click();

        link.remove();

    }
);


/* =========================================
   SAFE ERROR TEXT
========================================= */

function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}