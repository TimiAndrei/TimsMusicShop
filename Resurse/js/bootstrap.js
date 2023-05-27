document.addEventListener('DOMContentLoaded', function () {
    const cards = document.getElementsByClassName('produs');

    // Function to display a card with a delay
    function displayCardWithDelay(card, delay) {
        setTimeout(function () {
            card.style.display = 'block'; // Show the card
        }, delay);
    }

    // Delay between each card (in milliseconds)
    const delayBetweenCards = 500;

    // Hide all the cards initially
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        card.style.display = 'none';
    }

    // Loop through each card and display with a delay
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const delay = (i + 1) * delayBetweenCards; // Increase delay for each card
        displayCardWithDelay(card, delay);
    }
});