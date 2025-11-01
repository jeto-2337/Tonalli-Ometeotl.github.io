// Mobile Navigation Toggle
$(function(){
  $('.mobile-nav-toggle').click(function(){
    $(this).toggleClass("fa-bars");
    $(this).toggleClass("fa-times");
    $('#navbar').toggleClass("navbar-mobile");
  });
});

// OST Player Functionality - SIMPLIFICADO
function initOSTPlayer() {
    console.log('🎵 OST Player - Iniciando versión simplificada');
    
    // Solo ejecutar en página OST
    if (!document.querySelector('.track-list')) {
        console.log('No es página OST, saliendo...');
        return;
    }
    
    const playButtons = document.querySelectorAll('.play-btn');
    console.log('Botones de reproducción encontrados:', playButtons.length);
    
    let currentAudio = null;
    let currentTrack = null;

    // RUTAS DE AUDIO
    const trackFiles = [
        '../ost/Insomnio.mp3',
        '../ost/ensueño.mp3',
        '../ost/Hogar.mp3', 
        '../ost/Soledad_ost4.mp3',
        '../ost/Motivación.mp3',
        '../ost/Luna de Noviembre.mp3'
    ];

    console.log('Rutas de audio configuradas:', trackFiles);

    playButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            console.log(`Clic en botón ${index + 1}`);
            console.log(`Archivo: ${trackFiles[index]}`);
            
            const trackItem = this.closest('.track-item');
            
            // Verificar si el archivo existe
            checkFileExists(trackFiles[index]).then(exists => {
                if (exists) {
                    console.log('✅ Archivo existe, procediendo...');
                    handleAudioPlay(button, trackItem, index);
                } else {
                    console.error('❌ Archivo NO existe:', trackFiles[index]);
                    // Para testing, continuar aunque no exista
                    handleAudioPlay(button, trackItem, index);
                }
            });
        });
    });

    function handleAudioPlay(button, trackItem, index) {
        // Si hay audio reproduciéndose, detenerlo
        if (currentAudio && currentTrack !== trackItem) {
            currentAudio.pause();
            const prevButton = currentTrack.querySelector('.play-btn');
            if (prevButton) {
                prevButton.innerHTML = '<i class="fas fa-play"></i>';
                prevButton.classList.remove('playing');
            }
            currentTrack.classList.remove('playing');
        }
        
        // Si es el mismo track, pausar/reanudar
        if (currentTrack === trackItem && currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
                button.innerHTML = '<i class="fas fa-pause"></i>';
                button.classList.add('playing');
            } else {
                currentAudio.pause();
                button.innerHTML = '<i class="fas fa-play"></i>';
                button.classList.remove('playing');
            }
        } 
        // Nuevo track
        else {
            // Detener anterior
            if (currentAudio) {
                currentAudio.pause();
            }
            
            // Crear nuevo audio
            currentAudio = new Audio(trackFiles[index]);
            
            // Intentar reproducir
            const playPromise = currentAudio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Éxito
                    console.log('🎶 ¡Audio reproduciéndose!');
                    button.innerHTML = '<i class="fas fa-pause"></i>';
                    button.classList.add('playing');
                    trackItem.classList.add('playing');
                    currentTrack = trackItem;
                }).catch(error => {
                    // Error
                    console.error('Error al reproducir:', error);
                    if (error.name === 'NotAllowedError') {
                        console.log('🔇 Autoplay bloqueado - necesita interacción del usuario');
                        // Simular audio para testing
                        simulateAudio(button, trackItem, index);
                    }
                });
            }
            
            // Evento cuando termina
            currentAudio.addEventListener('ended', () => {
                console.log('Audio terminado');
                button.innerHTML = '<i class="fas fa-play"></i>';
                button.classList.remove('playing');
                trackItem.classList.remove('playing');
                currentAudio = null;
                currentTrack = null;
            });
        }
    }

    // Función para verificar si archivo existe
    function checkFileExists(url) {
        return fetch(url, { method: 'HEAD' })
            .then(response => response.status === 200)
            .catch(() => false);
    }
    
    // Función de simulación para testing
    function simulateAudio(button, trackItem, index) {
        console.log('🎵 SIMULANDO audio (para testing)');
        button.innerHTML = '<i class="fas fa-pause"></i>';
        button.classList.add('playing');
        trackItem.classList.add('playing');
        currentTrack = trackItem;
        
        // Simular que se está reproduciendo por 30 segundos
        setTimeout(() => {
            if (currentTrack === trackItem) {
                button.innerHTML = '<i class="fas fa-play"></i>';
                button.classList.remove('playing');
                trackItem.classList.remove('playing');
                currentTrack = null;
            }
        }, 30000);
    }
    
    console.log('✅ OST Player listo');
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Página cargada');
    initOSTPlayer();
});