import * as THREE from 'three'; // Importa la biblioteca principal de Three.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; // Importa los controles de órbita para la cámara
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Importa el cargador GLTF para cargar modelos 3D

const scene = new THREE.Scene(); // Crea una nueva escena en Three.js
const raycaster = new THREE.Raycaster(); // Crea un raycaster para detectar intersecciones con objetos
const pointer = new THREE.Vector2(); // Crea un vector 2D para almacenar la posición del puntero

const canvas = document.getElementById("experience-canvas"); // Obtiene el elemento canvas del DOM
const sizes = { // Define un objeto para almacenar las dimensiones de la ventana
    width: window.innerWidth, // Ancho de la ventana
    height: window.innerHeight, // Alto de la ventana
};

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); // Crea un renderizador WebGL con antialiasing
renderer.setSize(sizes.width, sizes.height); // Establece el tamaño del renderizador
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Ajusta la relación de píxeles para dispositivos de alta resolución
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Establece el tipo de sombras suaves
renderer.shadowMap.enabled = true; // Habilita las sombras en el renderizador
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Establece el mapeo tonal para un mejor rango dinámico
renderer.toneMappingExposure = 1.75; // Ajusta la exposición del mapeo tonal

const modalContent = { // Define el contenido de los modales para diferentes objetos
    "llanta": {
        title: "Llanta", // Título del modal para la llanta
        content: "Esta es una llanta. Ya me cansé" // Contenido del modal para la llanta
    },
    "Sphere012": {
        title: "Manzana", // Título del modal para la esfera
        content: "Esta es una manzana. Ya me cansé" // Contenido del modal para la esfera
    },
    "LowPolyRock002": {
        title: "Roca", // Título del modal para la roca
        content: "Esta es una roca. Ya me cansé" // Contenido del modal para la roca
    }
};

const modal = document.querySelector(".modal"); // Selecciona el modal del DOM
const modalTitle = document.querySelector(".modal-title"); // Selecciona el título del modal
const modalProjectDescription = document.querySelector(".modal-project-description"); // Selecciona la descripción del proyecto en el modal
const modalExitButton = document.querySelector(".modal-exit-button"); // Selecciona el botón de salida del modal

function showModal(id) { // Función para mostrar el modal basado en el ID del objeto
    const content = modalContent[id]; // Obtiene el contenido del modal según el ID
    if (content) { // Si hay contenido para el ID
        modalTitle.textContent = content.title; // Establece el título del modal
        modalProjectDescription.textContent = content.content; // Establece el contenido del modal
        modal.classList.toggle("hidden"); // Muestra el modal
    }
}

function hideModal() { // Función para ocultar el modal
    modal.classList.toggle("hidden"); // Oculta el modal
}

let intersectObject = ""; // Variable para almacenar el objeto intersectado
const intersectObjects = []; // Array para almacenar objetos que pueden ser intersectados
const intersectObjectsNames = [ // Nombres de los objetos que se pueden intersectar
    "llanta",
    "Sphere012",
    "LowPolyRock002",
];

const loader = new GLTFLoader(); // Crea una instancia del cargador GLTF

loader.load('./arbol.glb', function (glb) { // Carga un modelo GLTF
    glb.scene.traverse(child => { // Recorre todos los hijos del modelo cargado
        if (intersectObjectsNames.includes(child.name)) { // Si el nombre del hijo está en la lista de objetos intersectables
            intersectObjects.push(child); // Agrega el hijo al array de objetos intersectables
        }

        if (child.isMesh) { // Si el hijo es una malla
            child.castShadow = true; // Permite que la malla proyecte sombras
            child.receiveShadow = true; // Permite que la malla reciba sombras
        }
        // console.log(child); // (Opcional) Imprime el hijo en la consola
    });
    scene.add(glb.scene); // Agrega la escena del modelo a la escena principal

}, undefined, function (error) { // Maneja errores durante la carga
    console.error(error); // Imprime el error en la consola
});

const sun = new THREE.DirectionalLight(0xFFFFFF); // Crea una luz direccional blanca
sun.castShadow = true; // Permite que la luz proyecte sombras
sun.position.set(20, 20, 0); // Establece la posición de la luz
sun.target.position.set(0, 0, 0); // Establece el objetivo de la luz
sun.shadow.mapSize.width = 4096; // Establece el tamaño del mapa de sombras (ancho)
sun.shadow.mapSize.height = 4096; // Establece el tamaño del mapa de sombras (alto)
sun.shadow.camera.left = -30; // Establece el límite izquierdo de la cámara de sombras
sun.shadow.camera.right = 30; // Establece el límite derecho de la cámara de sombras
sun.shadow.camera.top = 30; // Establece el límite superior de la cámara de sombras
sun.shadow.camera.bottom = -30; // Establece el límite inferior de la cámara de sombras
sun.shadow.normalBias = 0.1; // Ajusta el sesgo normal para suavizar sombras
scene.add(sun); // Agrega la luz direccional a la escena

const shadowHelper = new THREE.CameraHelper(sun.shadow.camera); // Crea un ayudante para visualizar la cámara de sombras
scene.add(shadowHelper); // Agrega el ayudante a la escena
const helper = new THREE.DirectionalLightHelper(sun, 5); // Crea un ayudante para visualizar la luz direccional
scene.add(helper); // Agrega el ayudante a la escena

const light = new THREE.AmbientLight(0x404040, 3); // Crea una luz ambiental suave
scene.add(light); // Agrega la luz ambiental a la escena

const aspect = sizes.width / sizes.height; // Calcula la relación de aspecto de la ventana
const camera = new THREE.OrthographicCamera(-aspect * 50, aspect * 50, 50, -50, 1, 1000); // Crea una cámara ortográfica

camera.position.x = 10; // Establece la posición X de la cámara
camera.position.y = 10; // Establece la posición Y de la cámara
camera.position.z = -15; // Establece la posición Z de la cámara

const controls = new OrbitControls(camera, canvas); // Crea controles de órbita para la cámara
controls.update(); // Actualiza los controles

function onResize() { // Función para manejar el cambio de tamaño de la ventana
    sizes.width = window.innerWidth; // Actualiza el ancho
    sizes.height = window.innerHeight; // Actualiza el alto
    const aspect = sizes.width / sizes.height; // Recalcula la relación de aspecto

    camera.left = -aspect * 50; // Actualiza el límite izquierdo de la cámara
    camera.right = aspect * 50; // Actualiza el límite derecho de la cámara
    camera.top = 50; // Actualiza el límite superior de la cámara
    camera.bottom = -50; // Actualiza el límite inferior de la cámara

    camera.updateProjectionMatrix(); // Actualiza la matriz de proyección de la cámara

    renderer.setSize(sizes.width, sizes.height); // Actualiza el tamaño del renderizador
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Ajusta la relación de píxeles
}

function onClick() { // Función para manejar clics en la ventana
    // console.log(intersectObject); // (Opcional) Imprime el objeto intersectado en la consola
    if (intersectObject !== "") { // Si hay un objeto intersectado
        showModal(intersectObject); // Muestra el modal correspondiente
    }
}

function onPointerMove(event) { // Función para manejar el movimiento del puntero
    // calcula la posición del puntero en coordenadas de dispositivo normalizadas
    // (-1 a +1) para ambos componentes

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1; // Calcula la posición X normalizada
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1; // Calcula la posición Y normalizada
}

modalExitButton.addEventListener("click", hideModal); // Agrega un evento para ocultar el modal al hacer clic en el botón de salida
window.addEventListener("resize", onResize); // Agrega un evento para manejar el cambio de tamaño de la ventana
window.addEventListener("click", onClick); // Agrega un evento para manejar clics en la ventana
window.addEventListener('pointermove', onPointerMove); // Agrega un evento para manejar el movimiento del puntero

function animate() { // Función de animación
    // actualiza el rayo de selección con la cámara y la posición del puntero
    raycaster.setFromCamera(pointer, camera); // Establece el raycaster desde la cámara y la posición del puntero

    // calcula los objetos que intersectan con el rayo de selección
    const intersects = raycaster.intersectObjects(intersectObjects); // Obtiene los objetos que intersectan con el rayo

    if (intersects.length > 0) { // Si hay intersecciones
        document.body.style.cursor = "pointer"; // Cambia el cursor a puntero
    } else {
        document.body.style.cursor = "default"; // Cambia el cursor a predeterminado
        intersectObject = ""; // Resetea el objeto intersectado
    }

    for (let i = 0; i < intersects.length; i++) { // Recorre las intersecciones
        intersectObject = intersects[0].object.parent.name; // Almacena el nombre del objeto intersectado
    }

    renderer.render(scene, camera); // Renderiza la escena con la cámara
}
renderer.setAnimationLoop(animate); // Establece la función de animación en el bucle de animación del renderizador
