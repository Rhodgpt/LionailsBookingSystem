//para to sa button sa taas kapag pipindutijn mo magiging ginto kulay
const navButtons = document.querySelectorAll(".navigation button");

navButtons.forEach(button => {
    button.addEventListener("click", () => {

        navButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");
    });
});
//para to sa button sa taas kapag pipindutijn mo magiging ginto kulay



//button ng View saka book apoint


//button ng View saka book apoint