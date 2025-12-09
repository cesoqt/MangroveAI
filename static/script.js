document.addEventListener('DOMContentLoaded', function() {
    
    // --- DATABASE KONTEN SPESIES ---
    const speciesData = {
        "AVICENNIA ALBA": {
            description: "Also known as White Mangrove or Api-api Putih. Characterized by its pointed, lance-shaped leaves with silvery-white undersides.",
            habitat: "Found in seaward to middle zones of mangrove forests. Common throughout Southeast Asia. Prefers muddy to sandy substrates.",
            featuresHTML: `
                <div class="characteristics">
                    <h5><i class="fas fa-seedling"></i> Characteristic Features:</h5>
                    <div class="feature-grid">
                        <div class="feature-item"><i class="fas fa-leaf"></i><span><strong>Shape:</strong> Lanceolate, pointed</span></div>
                        <div class="feature-item"><i class="fas fa-ruler"></i><span><strong>Size:</strong> 5-12 cm long</span></div>
                        <div class="feature-item"><i class="fas fa-palette"></i><span><strong>Color:</strong> Green above, silvery below</span></div>
                        <div class="feature-item"><i class="fas fa-water"></i><span><strong>Roots:</strong> Pneumatophores</span></div>
                    </div>
                </div>`
        },
        "RHIZOPHORA APICULATA": {
            description: "Known as Bakau Minyak or Bakau Merah. Recognizable by its elliptical leaves with pointed tips and reddish leaf stalks.",
            habitat: "Dominant species in middle to landward zones. Widespread in Indonesia. Often forms dense pure stands.",
            featuresHTML: `
                <div class="characteristics">
                    <h5><i class="fas fa-seedling"></i> Characteristic Features:</h5>
                    <div class="feature-grid">
                        <div class="feature-item"><i class="fas fa-leaf"></i><span><strong>Shape:</strong> Elliptical, pointed tip</span></div>
                        <div class="feature-item"><i class="fas fa-ruler"></i><span><strong>Size:</strong> 8-20 cm long</span></div>
                        <div class="feature-item"><i class="fas fa-palette"></i><span><strong>Color:</strong> Dark green, reddish petiole</span></div>
                        <div class="feature-item"><i class="fas fa-tree"></i><span><strong>Roots:</strong> Stilt roots (prop)</span></div>
                    </div>
                </div>`
        },
        "SONNERATIA ALBA": {
            description: "Known as Apple Mangrove or Perepat. Identified by its rounded, oval leaves with smooth edges and pale green color.",
            habitat: "Found in front mangrove zones, often in muddy substrates. Tolerates daily tidal inundation.",
            featuresHTML: `
                <div class="characteristics">
                    <h5><i class="fas fa-seedling"></i> Characteristic Features:</h5>
                    <div class="feature-grid">
                        <div class="feature-item"><i class="fas fa-leaf"></i><span><strong>Shape:</strong> Oval to rounded</span></div>
                        <div class="feature-item"><i class="fas fa-ruler"></i><span><strong>Size:</strong> 7-15 cm</span></div>
                        <div class="feature-item"><i class="fas fa-palette"></i><span><strong>Color:</strong> Pale green, leathery</span></div>
                        <div class="feature-item"><i class="fas fa-apple-alt"></i><span><strong>Fruit:</strong> Apple-shaped</span></div>
                    </div>
                </div>`
        }
    };

    // --- ELEMENT SELECTORS ---
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name');
    const uploadForm = document.getElementById('upload-form');
    
    // Result Elements
    const resultsSection = document.getElementById('results-section');
    const resImage = document.getElementById('result-image-preview');
    const resName = document.getElementById('result-species-name');
    const resConf = document.getElementById('result-confidence');
    const resDynamic = document.getElementById('dynamic-species-content');
    const resHabitat = document.getElementById('result-habitat');
    const submitBtn = document.querySelector('.btn-secondary');

    // Camera Elements
    const openCameraBtn = document.getElementById('open-camera-btn');
    const cameraContainer = document.getElementById('camera-container');
    const video = document.getElementById('camera-preview');
    const snapBtn = document.getElementById('snap-btn');
    const closeCameraBtn = document.querySelector('.btn-cancel'); 
    const switchCameraBtn = document.getElementById('switch-camera-btn'); // Tombol Baru
    const canvas = document.getElementById('canvas');
    
    let cameraStream = null;
    let currentFacingMode = 'environment'; // Default: Kamera Belakang

    // --- 1. HANDLING FILE INPUT ---
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0] ? e.target.files[0].name : 'No file selected';
            if (fileNameDisplay) fileNameDisplay.textContent = fileName;
        });
    }

    // --- 2. AJAX UPLOAD LOGIC ---
    async function handleUpload(file) {
        if (!file) {
            alert("Please select a file first");
            return;
        }

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        submitBtn.disabled = true;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.error) {
                alert(data.error);
                return;
            }

            // --- SOLUSI MASALAH GAMBAR GAK GANTI ---
            // Kita tambahkan ?t=waktu_sekarang agar browser dipaksa download ulang
            const timestamp = new Date().getTime();
            resImage.src = data.image_url + '?t=' + timestamp;
            
            resName.textContent = data.prediction;
            resConf.textContent = data.confidence;

            const info = speciesData[data.prediction];
            if (info) {
                resDynamic.innerHTML = `<p class="species-description">${info.description}</p>${info.featuresHTML}`;
                resHabitat.textContent = info.habitat;
            } else {
                resDynamic.innerHTML = `<p>Species information not available.</p>`;
            }

            resultsSection.style.display = 'grid';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error('Error:', error);
            alert("Analysis failed. Check console.");
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUpload(fileInput.files[0]);
        });
    }

    // --- 3. CAMERA LOGIC (WITH SWITCHER) ---
    
    // Fungsi start kamera yang fleksibel
    function startCamera() {
        // Stop stream lama jika ada
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: currentFacingMode // 'user' (depan) atau 'environment' (belakang)
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            video.srcObject = stream;
            cameraStream = stream;
            video.play();
        })
        .catch(err => {
            console.warn("Mode specific failed, trying basic mode...");
            // Fallback jika HP tidak support facingMode specific
            navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                cameraStream = stream;
                video.play();
            })
            .catch(e => alert("Camera Error: " + e.message));
        });
    }

    if (openCameraBtn) {
        openCameraBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openCameraBtn.style.display = 'none';
            cameraContainer.style.display = 'block';
            startCamera(); // Panggil fungsi start
        });
    }

    // --- FITUR BARU: SWITCH CAMERA ---
    if (switchCameraBtn) {
        switchCameraBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle mode: kalau environment jadi user, kalau user jadi environment
            currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
            startCamera(); // Restart kamera dengan mode baru
        });
    }

    function closeCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        video.srcObject = null;
        cameraContainer.style.display = 'none';
        openCameraBtn.style.display = 'inline-block';
    }

    if (closeCameraBtn) {
        closeCameraBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeCamera();
        });
    }

    if (snapBtn) {
        snapBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (!video.srcObject) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            
            // Mirroring jika pakai kamera depan agar tidak kebalik
            if (currentFacingMode === 'user') {
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
            }
            
            context.drawImage(video, 0, 0);

            canvas.toBlob(blob => {
                // Beri nama file unik pakai timestamp agar backend gak numpuk file yg sama terus (opsional)
                const filename = "camera_" + new Date().getTime() + ".jpg"; 
                const file = new File([blob], filename, { type: "image/jpeg" });
                
                closeCamera();
                handleUpload(file);
            }, "image/jpeg", 0.95);
        });
    }

    // --- UI Interactions ---
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.toggle('active');
        });
    }
});

// Helper Global Functions
window.showMoreInfo = () => alert("Detail info coming soon!");
window.shareResult = () => alert("Link copied to clipboard!");
window.saveIdentification = () => alert("Data saved locally.");