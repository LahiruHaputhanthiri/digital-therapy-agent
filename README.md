# Multimodal Emotion & Stress Recognition System 🧠💡

An advanced, AI-driven multimodal emotion and stress detection system. This project integrates multiple data streams—facial expressions, voice/speech analysis, lifestyle/health data, and invisible keystroke dynamics—to accurately predict an individual's overall stress level.

Designed with localized accessibility in mind, the system features a trilingual conversational interface supporting **English, Sinhala, and Tamil**.

## 🌟 Key Features

*   **Multimodal Late Fusion Engine:** Combines predictions from independent AI models (Face, Voice, Health) with a weighted decision algorithm to generate a single, highly accurate stress score.
*   **Facial Emotion Recognition:** A custom Convolutional Neural Network (CNN) trained on FER-2013 and validated against the FairFace dataset to ensure unbiased detection across South Asian demographics.
*   **Speech Emotion Recognition:** Deep Neural Network (DNN) utilizing 40 Mel-frequency cepstral coefficients (MFCCs) trained on combined CREMA-D and Indian Emotional Speech Corpora (IESC).
*   **Health & Lifestyle Assessment:** A machine learning model analyzing tabular data (sleep, work hours, physical activity) to predict underlying stress risks.
*   **Keystroke Dynamics:** Invisible behavioral tracking (typing speed, backspace frequency) from the frontend to fine-tune the final stress prediction.
*   **Trilingual Support:** Conversational assistance and stress-relief recommendations provided in English, Sinhala, and Tamil.

## 🛠️ Technology Stack

*   **Backend & AI Engine:** Python, Flask, Flask-CORS
*   **Machine Learning/Deep Learning:** TensorFlow / Keras, Scikit-learn
*   **Audio & Image Processing:** Librosa, OpenCV, NumPy, Pandas
*   **Frontend (UI/UX):** React / Next.js (Interfacing via REST APIs)

## ⚙️ System Architecture 

The system follows a Microservices-inspired architecture:
1. `best_face_model.h5`: Processes 48x48 grayscale facial images.
2. `best_voice_model.h5`: Processes 3.0s audio clips into 40 MFCC features.
3. `best_health_model.pkl`: Analyzes standard lifestyle metrics.
4. `app.py`: The Flask backend that handles endpoints, preprocesses inputs, invokes models, applies the late-fusion logic, and returns the final JSON response.

## 🚀 Future Enhancements (Fine-Tuning)
* Implementation of Transfer Learning (e.g., MobileNetV2) for the vision model.
* Upgrading the audio model to utilize Mel-Spectrograms or Wav2Vec 2.0 transformers for micro-stress detection.
