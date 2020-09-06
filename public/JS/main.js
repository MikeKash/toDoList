
const categoryHeading = document.getElementById("categoryHeading");
const categoryNames = document.querySelector(".categoryNames");
const categoryBtn = document.getElementById("categoryBtn");


categoryBtn.addEventListener("click", ()=>{
    categoryNames.classList.toggle("hidden");
    categoryBtn.classList.toggle("buttonUp");    
  });



 