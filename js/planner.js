document.addEventListener('DOMContentLoaded', () => {
    const uploadContainer = document.getElementById('upload-container');
    const audioFileInput = document.getElementById('audio-file');
    const uploadText = document.getElementById('upload-text');
    const fileNameDisplay = document.getElementById('file-name');
    const generatePlanBtn = document.getElementById('generate-plan-btn');
    const planOutput = document.getElementById('plan-output');
    const loader = document.getElementById('loader');
    const planContent = document.getElementById('plan-content');
    const errorMessage = document.getElementById('error-message');

    // Set the file size limit to 4.5 MB
    const MAX_FILE_SIZE = 4.5 * 1024 * 1024; 

    let audioFile = null;

    if (uploadContainer) {
        uploadContainer.addEventListener('click', () => audioFileInput.click());
        audioFileInput.addEventListener('change', handleFileSelect);
        // Drag and drop handlers...
        uploadContainer.addEventListener('dragover', (e) => { e.preventDefault(); uploadContainer.classList.add('border-blue-500'); });
        uploadContainer.addEventListener('dragleave', () => { uploadContainer.classList.remove('border-blue-500'); });
        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('border-blue-500');
            const files = e.dataTransfer.files;
            if (files.length) {
                audioFileInput.files = files;
                handleFileSelect({ target: audioFileInput });
            }
        });
    }

    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        // ** NEW: Check the file size **
        if (file.size > MAX_FILE_SIZE) {
            audioFile = null;
            uploadText.textContent = 'Click or drag to upload your audio file.';
            fileNameDisplay.textContent = '';
            generatePlanBtn.disabled = true;
            errorMessage.textContent = `Error: Audio file is too large. Please upload a file smaller than 4.5 MB.`;
            return; // Stop the function here
        }

        if (file.type.startsWith('audio/')) {
            audioFile = file;
            uploadText.textContent = 'File selected:';
            fileNameDisplay.textContent = file.name;
            generatePlanBtn.disabled = false;
            errorMessage.textContent = '';
        } else {
            audioFile = null;
            uploadText.textContent = 'Click or drag to upload your audio file.';
            fileNameDisplay.textContent = '';
            generatePlanBtn.disabled = true;
            errorMessage.textContent = 'Please select a valid audio file.';
        }
    }

    if (generatePlanBtn) {
        generatePlanBtn.addEventListener('click', async () => {
            if (!audioFile) return;

            planOutput.classList.remove('hidden');
            loader.classList.remove('hidden');
            planContent.innerHTML = '';
            generatePlanBtn.disabled = true;
            errorMessage.textContent = '';

            try {
                const base64Audio = await toBase64(audioFile);
                const mimeType = audioFile.type;

                const response = await fetch('/.netlify/functions/generate-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audio: base64Audio, mimeType: mimeType }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    try {
                        const errorData = JSON.parse(errorText);
                        throw new Error(errorData.message || 'An unknown server error occurred.');
                    } catch (e) {
                        throw new Error(errorText || `Server responded with status: ${response.status}`);
                    }
                }

                const result = await response.json();
                
                let htmlResult = result.plan.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                htmlResult = htmlResult.replace(/\n/g, '<br>');
                htmlResult = htmlResult.replace(/- (.*?)(<br>|$)/g, '<ul><li class="ml-4">$1</li></ul>');
                htmlResult = htmlResult.replace(/<\/ul><br><ul>/g, '');

                planContent.innerHTML = htmlResult;

            } catch (error) {
                console.error('Error generating plan:', error);
                errorMessage.textContent = `Failed to generate the plan. Error: ${error.message}`;
            } finally {
                loader.classList.add('hidden');
                generatePlanBtn.disabled = false;
            }
        });
    }

    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }
});
