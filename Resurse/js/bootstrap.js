document.addEventListener('DOMContentLoaded', function () {
    const cards = document.getElementsByClassName('produs');

    // Delay between each card (in milliseconds)
    const delayBetweenCards = 250;

    function fadeInCard(card, index) {
        setTimeout(function () {
            card.classList.add('card-appear');
        }, delayBetweenCards * index);
    }

    // Loop through each card and set animation delay
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        fadeInCard(card, i);
    }
});


// On mouse scroll version
// document.addEventListener('DOMContentLoaded', function () {
//     const cards = document.getElementsByClassName('produs');
//     const delayBetweenCards = 500;

    // function fadeInCard(card, index) {
    //     setTimeout(function () {
    //         card.classList.add('card-appear');
    //     }, delayBetweenCards * index);
    // }

//     function isInViewport(element) {
//         const rect = element.getBoundingClientRect();
//         return (
//             rect.top >= 0 &&
//             rect.left >= 0 &&
//             rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
//             rect.right <= (window.innerWidth || document.documentElement.clientWidth)
//         );
//     }

//     function handleScroll() {
//         for (let i = 0; i < cards.length; i++) {
//             const card = cards[i];
//             if (isInViewport(card)) {
//                 card.classList.add('card-appear');
//             }
//         }
//     }

//     window.addEventListener('scroll', handleScroll);
// });
