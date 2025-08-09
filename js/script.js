// Variables globales
let currentTheme = 'default';
let lastCalculation = null;

// Cargar al iniciar
window.onload = function() {
    cargarTemaGuardado();
    mostrarHistorial('todo');
    agregarEfectos();
    cargarTareas();
};

// Funciones de audio
function playSound() {
    const sound = document.getElementById("click-sound");
    sound.currentTime = 0;
    sound.play();
}

// Funciones de la lista de tareas
function agregarTarea() {
    playSound();
    const input = document.getElementById("todo-input");
    const texto = input.value.trim();

    if (texto === "") {
        mostrarNotificacion("Escribe una tarea", "error");
        return;
    }

    const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
    tareas.push({ texto, completada: false });
    localStorage.setItem("tareas", JSON.stringify(tareas));

    input.value = "";
    cargarTareas();
}

function cargarTareas() {
    const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
    const lista = document.getElementById("todo-list");
    lista.innerHTML = "";

    tareas.forEach((tarea, index) => {
        const item = document.createElement("li");
        item.textContent = tarea.texto;
        if (tarea.completada) {
            item.classList.add("completed");
        }

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.classList.add("danger");
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            eliminarTarea(index);
        };

        item.onclick = () => marcarCompletada(index);
        item.appendChild(deleteButton);
        lista.appendChild(item);
    });
}

function marcarCompletada(index) {
    playSound();
    const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
    tareas[index].completada = !tareas[index].completada;
    localStorage.setItem("tareas", JSON.stringify(tareas));
    cargarTareas();
}

function eliminarTarea(index) {
    playSound();
    const tareas = JSON.parse(localStorage.getItem("tareas")) || [];
    tareas.splice(index, 1);
    localStorage.setItem("tareas", JSON.stringify(tareas));
    cargarTareas();
}

// Funciones de notas
function guardarNota() {
    playSound();
    const nota = document.getElementById("nota").value.trim();

    if (!nota) {
        mostrarNotificacion("Escribe una nota primero", "error");
        return;
    }

    const historial = JSON.parse(localStorage.getItem("historial")) || [];
    const registro = {
        tipo: "nota",
        fecha: new Date().toLocaleString(),
        contenido: nota,
        calculo: null
    };

    historial.unshift(registro); // Agregar al inicio
    localStorage.setItem("historial", JSON.stringify(historial));

    document.getElementById("nota").value = "";
    mostrarHistorial('todo');
    mostrarNotificacion("Nota guardada con éxito", "success");
}

function limpiarNota() {
    playSound();
    document.getElementById("nota").value = "";
}

// Funciones de calculadora
function calcular(operacion) {
    playSound();
    const p1 = parseFloat(document.getElementById("precio1").value) || 0;
    const p2 = parseFloat(document.getElementById("precio2").value) || 0;
    let resultado = 0;
    let operacionSimbolo = "";

    switch(operacion) {
        case 'suma':
            resultado = p1 + p2;
            operacionSimbolo = "+";
            break;
        case 'resta':
            resultado = p1 - p2;
            operacionSimbolo = "-";
            break;
        case 'multiplicacion':
            resultado = p1 * p2;
            operacionSimbolo = "×";
            break;
        case 'division':
            resultado = p2 !== 0 ? p1 / p2 : "Error (división por cero)";
            operacionSimbolo = "÷";
            break;
    }

    const resultadoElement = document.getElementById("resultado");
    resultadoElement.style.display = "block";

    if (typeof resultado === 'number') {
        resultadoElement.innerHTML = `
            <div style="font-size: 0.8em; margin-bottom: 5px;">${p1} ${operacionSimbolo} ${p2} =</div>
            <div style="font-size: 1.5em; font-weight: bold;">${resultado.toFixed(2)}</div>
        `;
        lastCalculation = { p1, p2, operacion, resultado };
    } else {
        resultadoElement.textContent = resultado;
        lastCalculation = null;
    }
}

function guardarCalculo() {
    playSound();
    if (!lastCalculation) {
        mostrarNotificacion("Realiza un cálculo primero", "error");
        return;
    }

    const historial = JSON.parse(localStorage.getItem("historial")) || [];
    const registro = {
        tipo: "calculo",
        fecha: new Date().toLocaleString(),
        contenido: null,
        calculo: lastCalculation
    };

    historial.unshift(registro);
    localStorage.setItem("historial", JSON.stringify(historial));

    mostrarHistorial('todo');
    mostrarNotificacion("Cálculo guardado con éxito", "success");
}

// Funciones de historial
function mostrarHistorial(filtro) {
    playSound();
    const historial = JSON.parse(localStorage.getItem("historial")) || [];
    const contenedor = document.getElementById("historial");

    if (historial.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-cloud"></i>
                <p>Tu historial está vacío</p>
                <p>Comienza escribiendo una nota o haciendo un cálculo</p>
            </div>
        `;
        return;
    }

    let html = "";
    let itemsMostrados = 0;

    historial.forEach(item => {
        if (filtro === 'todo' ||
            (filtro === 'notas' && item.tipo === 'nota') ||
            (filtro === 'calculos' && item.tipo === 'calculo')) {

            html += `
                <div class="history-item">
                    <div class="history-date">
                        <i class="fas ${item.tipo === 'nota' ? 'fa-sticky-note' : 'fa-calculator'}"></i>
                        ${item.fecha}
                    </div>
                    <div class="history-content">
                        ${item.tipo === 'nota' ?
                            item.contenido :
                            `${item.calculo.p1} ${getOperacionSymbol(item.calculo.operacion)} ${item.calculo.p2} = <strong>${item.calculo.resultado.toFixed(2)}</strong>`}
                    </div>
                </div>
            `;
            itemsMostrados++;
        }
    });

    if (itemsMostrados === 0) {
        html = `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <p>No hay ${filtro === 'notas' ? 'notas' : 'cálculos'} en tu historial</p>
            </div>
        `;
    }

    contenedor.innerHTML = html;
}

function limpiarHistorial() {
    playSound();
    if (confirm("¿Estás seguro de que quieres borrar todo el historial? Esta acción no se puede deshacer.")) {
        localStorage.removeItem("historial");
        mostrarHistorial('todo');
        mostrarNotificacion("Historial borrado", "info");
    }
}

// Funciones de tema y personalización
function setTheme(theme) {
    playSound();
    currentTheme = theme;

    // Remover todas las clases de tema primero
    document.body.classList.remove('ghibli-theme', 'dark-theme', 'kawaii-theme');

    if (theme === 'ghibli') {
        document.body.classList.add('ghibli-theme');
    } else if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'kawaii') {
        document.body.classList.add('kawaii-theme');
    }

    // Actualizar botones activos
    document.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));
    document.querySelector(`.theme-option[onclick="setTheme('${theme}')"]`).classList.add('active');

    // Guardar preferencia
    localStorage.setItem('themePreference', theme);
}

function cargarTemaGuardado() {
    const savedTheme = localStorage.getItem('themePreference') || 'default';
    setTheme(savedTheme);
}

function showColorPicker() {
    playSound();
    document.getElementById('color-picker-modal').style.display = 'flex';
}

function ocultarColorPicker() {
    playSound();
    document.getElementById('color-picker-modal').style.display = 'none';
}

function aplicarColoresPersonalizados() {
    playSound();
    const root = document.documentElement;

    root.style.setProperty('--primary-color', document.getElementById('color-primary').value);
    root.style.setProperty('--secondary-color', document.getElementById('color-secondary').value);
    root.style.setProperty('--accent-color', document.getElementById('color-accent').value);
    root.style.setProperty('--background-color', document.getElementById('color-background').value);
    root.style.setProperty('--text-color', document.getElementById('color-text').value);

    // Cambiar a tema personalizado
    currentTheme = 'custom';
    document.querySelectorAll('.theme-option').forEach(el => el.classList.remove('active'));

    ocultarColorPicker();
    mostrarNotificacion("Colores personalizados aplicados", "success");
}

function resetColores() {
    playSound();
    setTheme('default');
    document.getElementById('color-primary').value = '#8ecae6';
    document.getElementById('color-secondary').value = '#219ebc';
    document.getElementById('color-accent').value = '#ffb703';
    document.getElementById('color-background').value = '#fefae0';
    document.getElementById('color-text').value = '#023047';
}

// Funciones auxiliares
function getOperacionSymbol(operacion) {
    switch(operacion) {
        case 'suma': return '+';
        case 'resta': return '-';
        case 'multiplicacion': return '×';
        case 'division': return '÷';
        default: return '';
    }
}

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.position = 'fixed';
    notificacion.style.bottom = '20px';
    notificacion.style.left = '50%';
    notificacion.style.transform = 'translateX(-50%)';
    notificacion.style.padding = '10px 20px';
    notificacion.style.borderRadius = '5px';
    notificacion.style.color = 'white';
    notificacion.style.zIndex = '1000';
    notificacion.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';

    switch(tipo) {
        case 'success':
            notificacion.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            notificacion.style.backgroundColor = '#F44336';
            break;
        case 'info':
            notificacion.style.backgroundColor = '#2196F3';
            break;
        default:
            notificacion.style.backgroundColor = '#FF9800';
    }

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.transition = 'opacity 0.5s';
        notificacion.style.opacity = '0';
        setTimeout(() => notificacion.remove(), 500);
    }, 3000);
}

function scrollToTop() {
    playSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarAyuda() {
    playSound();
    document.getElementById('help-modal').style.display = 'flex';
}

function ocultarAyuda() {
    playSound();
    document.getElementById('help-modal').style.display = 'none';
}

function agregarEfectos() {
    // Agregar efecto de hover a los botones
    const buttons = document.querySelectorAll('button:not(.floating-button)');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 8px var(--shadow-color)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
            button.style.boxShadow = '';
        });
    });

    // Agregar efecto de carga suave
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
}
