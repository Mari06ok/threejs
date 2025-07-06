
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


let cat = { // Define un objeto para almacenar información sobre el gato

    instance: null, // Almacena la instancia del gato

    moveDistance: 1, // Distancia que el gato se moverá en cada paso

    jumpHeight: 1, // Altura del salto del gato

    isMoving: false, // Indica si el gato está en movimiento

    moveDuration: 0.2, // Duración del movimiento del gato

}


const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true }); // Crea un renderizador WebGL con antialiasing

renderer.setSize(sizes.width, sizes.height); // Establece el tamaño del renderizador

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Ajusta la relación de píxeles para dispositivos de alta resolución

renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Establece el tipo de sombras suaves

renderer.shadowMap.enabled = true; // Habilita las sombras en el renderizador

renderer.toneMapping = THREE.ACESFilmicToneMapping; // Establece el mapeo tonal para un mejor rango dinámico

renderer.toneMappingExposure = 1.75; // Ajusta la exposición del mapeo tonal


const modalContent = { // Define el contenido de los modales para diferentes objetos

    "llanta": { // Contenido para el objeto "llanta"

        title: "Llanta", // Título del modal para la llanta

        content: "Esta es una llanta. Ya me cansé", // Contenido del modal para la llanta

        link: "https://sketchfab.com/3d-models/arbol-manzano-apple-tree-lowpoly-b13449cdcaf04358bcf7d5fe068e46f7" // Enlace relacionado

    },

    "Sphere012": { // Contenido para el objeto "Sphere012"

        title: "Manzana", // Título del modal para la esfera

        content: "Esta es una manzana. Ya me cansé", // Contenido del modal para la esfera

        link: "https://sketchfab.com/3d-models/arbol-manzano-apple-tree-lowpoly-b13449cdcaf04358bcf7d5fe068e46f7" // Enlace relacionado

    },

    "LowPolyRock002": { // Contenido para el objeto "LowPolyRock002"

        title: "Roca", // Título del modal para la roca

        content: "Esta es una roca. Ya me cansé", // Contenido del modal para la roca

        link: "https://sketchfab.com/3d-models/arbol-manzano-apple-tree-lowpoly-b13449cdcaf04358bcf7d5fe068e46f7" // Enlace relacionado

    }

};


const modal = document.querySelector(".modal"); // Selecciona el modal del DOM

const modalTitle = document.querySelector(".modal-title"); // Selecciona el título del modal

const modalProjectDescription = document.querySelector(".modal-project-description"); // Selecciona la descripción del proyecto en el modal

const modalExitButton = document.querySelector(".modal-exit-button"); // Selecciona el botón de salida del modal

const modalVisitProjectButton = document.querySelector(".modal-project-visit-button"); // Selecciona el botón de visita del proyecto


function showModal(id) { // Función para mostrar el modal basado en el ID del objeto

    const content = modalContent[id]; // Obtiene el contenido del modal según el ID

    if (content) { // Si hay contenido para el ID

        modalTitle.textContent = content.title; // Establece el título del modal

        modalProjectDescription.textContent = content.content; // Establece el contenido del modal


        if (content.link) { // Si hay un enlace en el contenido

            modalVisitProjectButton.href = content.link; // Establece el enlace del botón

            modalVisitProjectButton.classList.remove('hidden'); // Muestra el botón

        } else { // Si no hay enlace

            modalVisitProjectButton.classList.add('hidden'); // Oculta el botón

        }

        modal.classList.toggle("hidden"); // Muestra el modal

    }

}


function hideModal() { // Función para ocultar el modal

    modal.classList.toggle("hidden"); // Oculta el modal

}


let intersectObject = ""; // Variable para almacenar el objeto intersectado

const intersectObjects = []; // Array para almacenar objetos que pueden ser intersectados

const intersectObjectsNames = [ // Nombres de los objetos que se pueden intersectar

    "llanta", // Nombre del primer objeto

    "Sphere012", // Nombre del segundo objeto

    "LowPolyRock002", // Nombre del tercer objeto

    "Roca", // Nombre del cuarto objeto

];


const loader = new GLTFLoader(); // Crea una instancia del cargador GLTF


loader.load('./arbol.glb', function (glb) { // Carga un modelo GLTF

    glb.scene.traverse(child => { // Recorre todos los hijos del modelo cargado

        if (intersectObjectsNames.includes(child.name)) { // Si el nombre del hijo está en la lista de objetos intersectables

            intersectObjects.push(child); // Agrega el hijo a la lista de objetos intersectables

            // Guardamos escala original
            child.userData.originalScale = child.scale.clone(); // Almacena la escala original del objeto

        }

        if (child.isMesh) { // Si el hijo es una malla

            child.castShadow = true; // Permite que la malla proyecte sombras

            child.receiveShadow = true; // Permite que la malla reciba sombras

        }

        if (child.name === "cat") { // Si el hijo es el gato

            cat.instance = child; // Almacena la instancia del gato

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


// const shadowHelper = new THREE.CameraHelper(sun.shadow.camera); // Crea un ayudante para visualizar la cámara de sombras

// scene.add(shadowHelper); // Agrega el ayudante a la escena

// const helper = new THREE.DirectionalLightHelper(sun, 5); // Crea un ayudante para visualizar la luz direccional

// scene.add(helper); // Agrega el ayudante a la escena


const light = new THREE.AmbientLight(0x404040, 3); // Crea una luz ambiental suave

scene.add(light); // Agrega la luz ambiental a la escena


const aspect = sizes.width / sizes.height; // Calcula la relación de aspecto de la ventana

const zoomFactor = 0.2; // Más pequeño = más zoom

const camera = new THREE.OrthographicCamera( // Crea una cámara ortográfica

    -aspect * 50 * zoomFactor, // Límite izquierdo

    aspect * 50 * zoomFactor, // Límite derecho

    50 * zoomFactor, // Límite superior

    -50 * zoomFactor, // Límite inferior

    1, // Límite cercano

    1000 // Límite lejano

);


camera.position.x = 13.493322366073228; // Establece la posición X de la cámara

camera.position.y = 13.426081415517869; // Establece la posición Y de la cámara

camera.position.z = 19.5507429430098; // Establece la posición Z de la cámara


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


function jumpCharacter(meshID) { // Función para hacer saltar al personaje

    const mesh = scene.getObjectByName(meshID); // Obtiene el objeto del personaje por su ID

    const jumpHeight = 2; // Altura del salto

    const jumpDuration = 0.5; // Duración del salto


    // Usamos la escala original almacenada al cargar
    const originalScale = mesh.userData.originalScale || new THREE.Vector3(1, 1, 1); // Obtiene la escala original del objeto


    const t1 = gsap.timeline(); // Crea una línea de tiempo para la animación


    // Estiramiento inicial
    t1.to(mesh.scale, { // Establece la animación de estiramiento

        x: 1.2, // Escala en X

        y: 0.8, // Escala en Y

        z: 1.2, // Escala en Z

        duration: jumpDuration * 0.2, // Duración de la animación

        ease: "power2.out", // Tipo de easing

    });


    // Compresión previa al salto
    t1.to(mesh.scale, { // Establece la animación de compresión

        x: 0.8, // Escala en X

        y: 1.2, // Escala en Y

        z: 0.8, // Escala en Z

        duration: jumpDuration * 0.2, // Duración de la animación

        ease: "power2.out", // Tipo de easing

    });


    // Salto (animación relativa en Y)
    t1.to(mesh.position, { // Establece la animación de salto

        z: `+=${jumpHeight}`, // Aumenta la posición en Z

        duration: jumpDuration * 0.5, // Duración de la animación

        ease: "power2.out", // Tipo de easing

    }, "<"); // Sincroniza con la animación anterior


    // Restaurar escala en el aire
    t1.to(mesh.scale, { // Establece la animación para restaurar la escala

        x: 1, // Escala en X

        y: 1, // Escala en Y

        z: 1, // Escala en Z

        duration: jumpDuration * 0.3, // Duración de la animación

        ease: "power1.inOut", // Tipo de easing

    });


    // Caída (también animación relativa)
    t1.to(mesh.position, { // Establece la animación de caída

        z: `-=${jumpHeight}`, // Disminuye la posición en Z

        duration: jumpDuration * 0.5, // Duración de la animación

        ease: "bounce.out", // Tipo de easing

    }, ">"); // Sincroniza con la animación anterior


    // Pequeño rebote elástico al aterrizar
    t1.to(mesh.scale, { // Establece la animación de rebote

        x: originalScale.x, // Restaura la escala en X

        y: originalScale.y, // Restaura la escala en Y

        z: originalScale.z, // Restaura la escala en Z

        duration: jumpDuration * 0.2, // Duración de la animación

        ease: "elastic.out(1, 0.3)", // Tipo de easing

    });

}


function onClick() { // Función para manejar clics en la ventana

    // console.log(intersectObject); // (Opcional) Imprime el objeto intersectado en la consola

    if (intersectObject !== "") { // Si hay un objeto intersectado

        if (["Roca", "Sphere012", "llanta"].includes(intersectObject)) { // Si el objeto es uno de los que pueden saltar

            jumpCharacter(intersectObject); // Hace saltar al personaje

        } else { // Si el objeto no es uno de los que pueden saltar

            showModal(intersectObject); // Muestra el modal correspondiente

        }

    }

}


function onPointerMove(event) { // Función para manejar el movimiento del puntero

    // calcula la posición del puntero en coordenadas de dispositivo normalizadas
    // (-1 a +1) para ambos componentes


    pointer.x = (event.clientX / window.innerWidth) * 2 - 1; // Calcula la posición X normalizada

    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1; // Calcula la posición Y normalizada

}


function moveCat(targetPosition, targetRotation) { // Función para mover al gato

    cat.isMoving = true; // Indica que el gato está en movimiento


    const t1 = gsap.timeline({ // Crea una línea de tiempo para la animación

        onComplete: () => { // Callback cuando la animación termina

            cat.isMoving = false; // Indica que el gato ha terminado de moverse

        }

    });


    t1.to(cat.instance.position, { // Establece la animación de movimiento en la posición

        x: targetPosition.x, // Nueva posición en X

        z: targetPosition.z, // Nueva posición en Z

        duration: cat.moveDuration, // Duración del movimiento

    });


    t1.to(cat.instance.rotation, { // Establece la animación de rotación

        y: targetRotation, // Nueva rotación en Y

        duration: cat.moveDuration, // Duración del movimiento

    },
        0 // Sincroniza con la animación anterior

    );


    t1.to(cat.instance.position, { // Establece la animación de salto

        y: cat.instance.position.y + cat.jumpHeight, // Aumenta la posición en Y

        duration: cat.moveDuration / 2, // Duración del movimiento

        yoyo: true, // Hace que la animación vuelva a su posición original

        repeat: 1 // Repite la animación

    },
        0 // Sincroniza con la animación anterior

    );

}


function onKeyDown(event) { // Función para manejar la pulsación de teclas

    if (cat.isMoving) return; // Si el gato está en movimiento, no hace nada

    const targetPosition = new THREE.Vector3().copy(cat.instance.position); // Crea una copia de la posición del gato

    let targetRotation = 0; // Inicializa la rotación objetivo

    switch (event.key.toLowerCase()) { // Verifica la tecla presionada

        case "w": // Si se presiona "w"

        case "arrowup": // O si se presiona la flecha hacia arriba

            targetPosition.z += cat.moveDistance; // Mueve hacia adelante

            targetRotation = 0; // Establece la rotación hacia adelante

            break;

        case "s": // Si se presiona "s"

        case "arrowdown": // O si se presiona la flecha hacia abajo

            targetPosition.z -= cat.moveDistance; // Mueve hacia atrás

            targetRotation = Math.PI; // Establece la rotación hacia atrás

            break;

        case "d": // Si se presiona "d"

        case "arrowright": // O si se presiona la flecha hacia la derecha

            targetPosition.x -= cat.moveDistance; // Mueve hacia la derecha

            targetRotation = -Math.PI / 2; // Establece la rotación hacia la derecha

            break;

        case "a": // Si se presiona "a"

        case "arrowleft": // O si se presiona la flecha hacia la izquierda

            targetPosition.x += cat.moveDistance; // Mueve hacia la izquierda

            targetRotation = Math.PI / 2; // Establece la rotación hacia la izquierda

            break;

        default: // Si se presiona otra tecla

            return; // No hace nada

    }

    moveCat(targetPosition, targetRotation); // Llama a la función para mover al gato a la nueva posición y rotación

}

// Agrega un evento para ocultar el modal al hacer clic en el botón de salida
modalExitButton.addEventListener("click", hideModal);

// Agrega un evento para manejar el cambio de tamaño de la ventana
window.addEventListener("resize", onResize);

// Agrega un evento para manejar clics en la ventana
window.addEventListener("click", onClick);

// Agrega un evento para manejar el movimiento del puntero
window.addEventListener('pointermove', onPointerMove);

// Agrega un evento para manejar la pulsación de teclas
window.addEventListener("keydown", onKeyDown);


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

    console.log(`Cámara posición -> x: ${camera.position.x}, y: ${camera.position.y}, z: ${camera.position.z}`); // Imprime la posición de la cámara en la consola

}

// Establece la función de animación en el bucle de animación del renderizador
renderer.setAnimationLoop(animate); 