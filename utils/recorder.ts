/**
 * Simple utility to capture audio from the browser microphone.
 * Returns a controller with a `stop()` method that resolves to the audio Blob.
 */
export async function startAudioRecording(): Promise<{ stop: () => Promise<Blob> }> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.start();

        return {
            stop: () => {
                return new Promise((resolve) => {
                    mediaRecorder.onstop = () => {
                        // Default to webm/ogg depending on browser, Gemini handles strict formats nicely usually.
                        // We return the raw blob. Service handles conversion to Base64.
                        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });

                        // Stop all tracks to release microphone
                        stream.getTracks().forEach(track => track.stop());

                        resolve(blob);
                    };
                    mediaRecorder.stop();
                });
            }
        };
    } catch (error) {
        console.error("Error starting recording:", error);
        throw error;
    }
}

/**
 * Helper: Convert Blob to Base64 string (no data URI prefix)
 */
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // Remove "data:audio/xyz;base64," prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            } else {
                reject(new Error("Failed to convert blob to base64"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
