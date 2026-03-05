/* ============================================ */
/* CARRUSEL DE PORTAFOLIOS */
/* SOLO PARA LA SECCION #dev-portfolios */
/* ============================================ */

document.addEventListener("DOMContentLoaded", () => {

const section = document.querySelector("#dev-portfolios");

if(!section) return;

const track = section.querySelector("#carouselTrack");
const cards = section.querySelectorAll(".portfolio-card");
const indicatorsContainer = section.querySelector("#carouselIndicators");

let currentIndex = 0;
const totalCards = cards.length;

/* ============================================ */
/* CREAR INDICADORES */
/* ============================================ */

function createIndicators(){

for(let i = 0; i < totalCards; i++){

const indicator = document.createElement("span");

indicator.classList.add("indicator");

if(i === 0){
indicator.classList.add("active");
}

indicator.addEventListener("click", () => {
goToSlide(i);
});

indicatorsContainer.appendChild(indicator);

}

}

createIndicators();

/* ============================================ */
/* MOVER CARRUSEL */
/* ============================================ */

window.moveCarousel = function(direction){

currentIndex += direction;

if(currentIndex < 0){
currentIndex = totalCards - 1;
}

if(currentIndex >= totalCards){
currentIndex = 0;
}

updateCarousel();

}

/* ============================================ */
/* IR A SLIDE */
/* ============================================ */

function goToSlide(index){

currentIndex = index;
updateCarousel();

}

/* ============================================ */
/* ACTUALIZAR CARRUSEL */
/* ============================================ */

function updateCarousel(){

const cardWidth = cards[0].offsetWidth + 20;

track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

updateIndicators();

}

/* ============================================ */
/* INDICADORES */
/* ============================================ */

function updateIndicators(){

const indicators = section.querySelectorAll(".indicator");

indicators.forEach((indicator, index) => {

indicator.classList.toggle("active", index === currentIndex);

});

}

});