/**
 * ClimaApp - Client-side JavaScript
 * SSR Application (NOT an API REST)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Auto-cerrar alertas después de 5 segundos
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            alert.style.animation = 'fadeOut 0.3s ease';
            setTimeout(function() {
                alert.remove();
            }, 300);
        }, 5000);
    });

    // Confirmación de eliminación
    const deleteForms = document.querySelectorAll('form[onsubmit*="confirm"]');
    deleteForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            // El confirm ya está en el onsubmit del HTML
        });
    });

    // Validación de formularios de registro
    const registerForm = document.querySelector('form[action="/auth/register"]');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                e.preventDefault();
                alert('Las contraseñas no coinciden');
                return false;
            }
            
            if (password.length < 6) {
                e.preventDefault();
                alert('La contraseña debe tener al menos 6 caracteres');
                return false;
            }
        });
    }

    // Scroll suave para mensajería
    const messagesContainer = document.getElementById('messagesContainer');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Resaltar fila activa en tablas
    const tableRows = document.querySelectorAll('.table tbody tr');
    tableRows.forEach(function(row) {
        row.addEventListener('mouseenter', function() {
            this.style.transition = 'background 0.2s';
        });
    });

    // Validación de formularios de montos
    const montoInput = document.getElementById('monto');
    if (montoInput) {
        montoInput.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = Math.abs(this.value);
            }
        });
    }

    // Actualizar automáticamente la fecha máxima para los filtros
    const fechaFinInputs = document.querySelectorAll('input[name="fechaFin"]');
    const fechaInicioInputs = document.querySelectorAll('input[name="fechaInicio"]');
    
    fechaInicioInputs.forEach(function(inicio) {
        inicio.addEventListener('change', function() {
            const form = this.closest('form');
            const fin = form.querySelector('input[name="fechaFin"]');
            if (fin && fin.value && this.value > fin.value) {
                fin.value = this.value;
            }
        });
    });
});

// Función para confirmar acciones peligrosas
function confirmarAccion(mensaje) {
    return confirm(mensaje || '¿Estás seguro de realizar esta acción?');
}

// Animación de fadeOut para CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// Funciones de utilidad
const Utils = {
    // Formatear fecha
    formatDate: function(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Formatear moneda
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    }
};
