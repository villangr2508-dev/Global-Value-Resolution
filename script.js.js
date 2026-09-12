document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('supportForm');
    const feedback = document.getElementById('formFeedback');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simulación de envío exitoso
            feedback.classList.remove('hidden');
            form.reset();

            // Ocultar el mensaje después de 5 segundos
            setTimeout(() => {
                feedback.classList.add('hidden');
            }, 5000);
        });
    }
});