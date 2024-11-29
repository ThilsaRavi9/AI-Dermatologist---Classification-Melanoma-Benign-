document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById("imageInput");
    const imageUploadForm = document.getElementById("imageUploadForm");
    const imageOutput = document.getElementById("imageOutput");
    const loadingElement = document.getElementById('loading');
    const resultElement = document.getElementById('result');

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    if (imageInput) {
        imageInput.addEventListener("change", (event) => {
            if (imageOutput) {
                imageOutput.src = URL.createObjectURL(event.target.files[0]);
                imageOutput.classList.remove("d-none");
            }
        });
    }

    if (imageUploadForm) {
        imageUploadForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            const image = imageInput.files[0];
            formData.append('image', image);
            
            if (loadingElement) loadingElement.classList.remove('d-none');
            if (resultElement) resultElement.classList.add('d-none');
            
            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (response.ok && resultElement) {
                    const probability = (data.probability * 100).toFixed(2);
                    const resultHTML = `
                        <h4>${data.result}</h4>
                        <p>Probability: ${probability}%</p>
                        <div class="probability-bar">
                            <div class="probability-fill" style="width: ${probability}%"></div>
                        </div>
                    `;
                    resultElement.innerHTML = resultHTML;
                    resultElement.classList.remove('d-none', 'alert-danger');
                    resultElement.classList.add('alert-info');
                } else if (resultElement) {
                    resultElement.textContent = data.error || "An error occurred";
                    resultElement.classList.remove('d-none', 'alert-info');
                    resultElement.classList.add('alert-danger');
                }
            } catch (error) {
                console.error("Error:", error);
                if (resultElement) {
                    resultElement.textContent = "An error occurred while processing the image";
                    resultElement.classList.remove('d-none', 'alert-info');
                    resultElement.classList.add('alert-danger');
                }
            } finally {
                if (loadingElement) loadingElement.classList.add('d-none');
            }
        });
    }
});

